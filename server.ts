import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase, dbAll, dbGet, dbRun, getLocalDb, saveLocalDb } from './server/db.js';
import { StorageService, BUCKET_DOWNLOADS, BUCKET_ASSETS, BUCKET_USER, BUCKET_TEMP } from './server/storage-service.js';
import { UploadEngine } from './server/upload-engine.js';
import { EmailService } from './server/email-service.js';
import { DatabaseService } from './server/database-service.js';
import { OmyraAuthClient } from '@omyra/server';
import { omyraAuthMiddleware, requireOmyraSession } from '@omyra/express';

const app = express();
const PORT = 3000;
const BUCKET_SECURE = process.env.R2_SECURE_BUCKET || process.env.R2_USER_BUCKET || 'omyra-secure-documents';

// Initialize OMYRA Auth Client
const omyraClient = new OmyraAuthClient({ apiKey: process.env.OMYRA_API_KEY || 'om_prod_omyramall_2026' });

app.use(express.json());
app.use(omyraAuthMiddleware(omyraClient));

// Set up Multer for handling file uploads into temporary buffers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 105 * 1024 * 1024 * 1024 // Supported up to 100GB+
  }
});

// Initialize database and start background processors
initializeDatabase()
  .then(async () => {
    // Set global variables for database mode check inside other modules
    const pool = (await import('./server/db.js')).getPgPool();
    (global as any).isPostgresMode = !!pool;
    (global as any).getPgPool = (await import('./server/db.js')).getPgPool;

    // Start Email Template Registration and Daemon Queue
    await EmailService.initializeTemplates();
    EmailService.startQueueRunner();

    // Start Storage scavenger daemon for cleaning expired temp objects
    StorageService.startScavengerDaemon();
  })
  .catch((err) => {
    console.error('❌ Database initialization error:', err);
  });

// Helper for security auth simulation
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let currentBody = req.body || {};
  
  const userIdentifier = req.omyraUser ? req.omyraUser.id : 'DesignAura Labs';
  currentBody.user = userIdentifier;
  currentBody.ipAddress = req.ip || '127.0.0.1';
  currentBody.userAgent = req.headers['user-agent'] || 'Browser';

  Object.defineProperty(req, 'body', {
    get() {
      return currentBody;
    },
    set(val) {
      currentBody = val || {};
      if (currentBody) {
        if (!currentBody.user) currentBody.user = req.omyraUser ? req.omyraUser.id : 'DesignAura Labs';
        if (!currentBody.ipAddress) currentBody.ipAddress = req.ip || '127.0.0.1';
        if (!currentBody.userAgent) currentBody.userAgent = req.headers['user-agent'] || 'Browser';
      }
    },
    configurable: true,
    enumerable: true
  });

  next();
};

// ==========================================
// API ENDPOINTS: OMYRA AUTHENTICATION SYSTEM
// ==========================================

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    const user = await omyraClient.register({
      email,
      password,
      display_name: displayName
    });

    // Automatically log authentication event
    await omyraClient.logSecurityEvent({
      userId: user.id,
      eventType: 'AUTH_REGISTER_SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: { email: user.email }
    });

    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Login and establish session
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    const session = await omyraClient.login({ email, password });

    // Store in cookie
    res.cookie('omyra_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Log login event
    await omyraClient.logSecurityEvent({
      userId: session.user.id,
      eventType: 'AUTH_LOGIN_SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: { email: session.user.email }
    });

    return res.json({ success: true, session });
  } catch (err: any) {
    // Log failed login event
    await omyraClient.logSecurityEvent({
      eventType: 'AUTH_LOGIN_FAILURE',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: { email: req.body.email, error: err.message }
    });
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Logout and clear session
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.omyraSessionToken || req.body.token;
    if (token) {
      await omyraClient.logout(token);
    }
    
    res.clearCookie('omyra_session');

    if (req.omyraUser) {
      await omyraClient.logSecurityEvent({
        userId: req.omyraUser.id,
        eventType: 'AUTH_LOGOUT_SUCCESS',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Browser'
      });
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    await omyraClient.forgotPassword(email);
    
    await omyraClient.logSecurityEvent({
      eventType: 'AUTH_FORGOT_PASSWORD_REQUEST',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: { email }
    });

    return res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    await omyraClient.resetPassword(token, password);

    await omyraClient.logSecurityEvent({
      eventType: 'AUTH_RESET_PASSWORD_SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser'
    });

    return res.json({ success: true, message: 'Your password has been reset successfully.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Verify Email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    await omyraClient.verifyEmail(token);
    return res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Retrieve Authenticated User (Get Me)
app.get('/api/auth/me', async (req, res) => {
  if (!req.omyraUser) {
    return res.json({ success: true, user: null });
  }
  return res.json({ success: true, user: req.omyraUser });
});

// Retrieve Session details
app.get('/api/auth/session', async (req, res) => {
  if (!req.omyraUser) {
    return res.status(401).json({ success: false, error: 'No active session.' });
  }
  return res.json({
    success: true,
    user: req.omyraUser,
    token: req.omyraSessionToken
  });
});

// ==========================================
// API ENDPOINTS: STORAGE SYSTEM
// ==========================================

/**
 * Single & Multiple Upload Engine API
 * POST /api/storage/upload
 */
app.post('/api/storage/upload', requireAuth, upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const bucket = (req.query.bucket as string) || BUCKET_ASSETS;
    const visibility = (req.query.visibility as string) || 'public';
    const folder = (req.query.folder as string) || 'products/images/';
    const user = req.body.user;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const results = [];

    for (const file of files) {
      // 1. Run security validations via OMYRA Shield UploadEngine
      const uploadType = bucket === BUCKET_ASSETS || bucket === BUCKET_USER ? 'image' : 'product';
      const validation = UploadEngine.validateFile(
        file.originalname,
        file.size,
        file.mimetype,
        file.buffer,
        uploadType
      );

      if (!validation.isValid) {
        // Log block event
        await StorageService.logAudit(
          user,
          'Security Block',
          bucket,
          file.originalname,
          `Validation failed: ${validation.error}`
        );
        return res.status(400).json({ error: validation.error });
      }

      // Generate a distinct secure object key
      const fileExt = path.extname(file.originalname);
      const uniqueFilename = `${crypto.randomUUID()}${fileExt}`;
      const objectKey = `${folder}${uniqueFilename}`;

      // 2. Perform duplicate check (Hashing)
      const sha256 = StorageService.calculateSHA256(file.buffer);
      const existingObject = await dbGet(
        `SELECT * FROM StorageObjects WHERE sha256_hash = ? AND bucket = ? LIMIT 1`,
        [sha256, bucket]
      );

      if (existingObject) {
        // De-duplicate: Log and return existing object metadata instead of re-uploading
        await StorageService.logAudit(
          user,
          'Duplicate Prevented',
          bucket,
          objectKey,
          `De-duplicated. Linked to object ID: ${existingObject.id}`
        );
        results.push(existingObject);
        continue;
      }

      // 3. Upload file via centralized StorageService
      const storedObj = await StorageService.uploadObject(
        bucket,
        objectKey,
        file.buffer,
        file.mimetype,
        file.originalname,
        user,
        visibility as 'public' | 'private'
      );

      results.push(storedObj);
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded, analyzed, and stored successfully.',
      objects: results
    });
  } catch (error: any) {
    console.error('Upload API failure:', error);
    res.status(500).json({ error: error.message || 'Storage upload connection failure.' });
  }
});

/**
 * Multipart Upload Initiation
 * POST /api/storage/multipart/init
 */
app.post('/api/storage/multipart/init', requireAuth, async (req, res) => {
  try {
    const { filename, contentType, fileSize, bucket, folder } = req.body;
    const user = req.body.user;

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename and content type are required.' });
    }

    const ext = path.extname(filename).slice(1).toLowerCase();
    const targetBucket = bucket || BUCKET_DOWNLOADS;
    const targetFolder = folder || 'products/files/';

    // Validate size & extension constraints
    const validation = UploadEngine.validateFile(filename, fileSize || 0, contentType, undefined, 'product');
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
    const objectKey = `${targetFolder}${uniqueFilename}`;

    // Initiate multipart via storage engine
    const session = await StorageService.initiateMultipart(targetBucket, objectKey, contentType, filename, user);

    res.status(200).json({
      success: true,
      uploadId: session.uploadId,
      objectId: session.objectId,
      bucket: targetBucket,
      key: objectKey
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Multipart initialization failed.' });
  }
});

/**
 * Multipart Upload Part
 * POST /api/storage/multipart/upload-part
 */
app.post('/api/storage/multipart/upload-part', requireAuth, upload.single('part'), async (req, res) => {
  try {
    const { uploadId, partNumber, bucket, key } = req.body;
    const partFile = req.file;

    if (!uploadId || !partNumber || !partFile) {
      return res.status(400).json({ error: 'Missing multipart parameters or payload.' });
    }

    const { client, isLocal } = await import('./server/storage-service.js').then((m) => m.getS3Client());

    if (isLocal) {
      // Emulator mode: save chunk in a temporary directory
      const partDir = path.join(process.cwd(), 'local_object_storage', 'multiparts', uploadId);
      if (!fs.existsSync(partDir)) {
        fs.mkdirSync(partDir, { recursive: true });
      }
      fs.writeFileSync(path.join(partDir, partNumber.toString()), partFile.buffer);

      // Update upload status
      await dbRun(
        `UPDATE StorageUploads SET uploaded_chunks_count = uploaded_chunks_count + 1 WHERE id = ?`,
        [uploadId]
      );

      return res.status(200).json({
        success: true,
        ETag: `local_etag_${partNumber}`
      });
    } else if (client) {
      const { UploadPartCommand } = await import('@aws-sdk/client-s3');
      const response = await client.send(
        new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: parseInt(partNumber),
          Body: partFile.buffer
        })
      );

      return res.status(200).json({
        success: true,
        ETag: response.ETag
      });
    }

    res.status(500).json({ error: 'Storage backend is offline.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Multipart Upload Completion
 * POST /api/storage/multipart/complete
 */
app.post('/api/storage/multipart/complete', requireAuth, async (req, res) => {
  try {
    const { uploadId, bucket, key, parts } = req.body;
    const user = req.body.user;

    if (!uploadId || !bucket || !key || !parts) {
      return res.status(400).json({ error: 'Parameters missing (uploadId, bucket, key, parts).' });
    }

    const metadata = await StorageService.completeMultipart(bucket, key, uploadId, parts, user);

    res.status(200).json({
      success: true,
      message: 'Multipart compilation completed successfully.',
      metadata
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Retrieve Object Metadata
 * GET /api/storage/object
 */
app.get('/api/storage/object', requireAuth, async (req, res) => {
  try {
    const bucket = req.query.bucket as string;
    const key = req.query.key as string;

    if (!bucket || !key) {
      return res.status(400).json({ error: 'Bucket and key query parameters are required.' });
    }

    const metadata = await dbGet(
      `SELECT * FROM StorageObjects WHERE bucket = ? AND object_key = ?`,
      [bucket, key]
    );

    if (!metadata) {
      return res.status(404).json({ error: 'Object metadata not found.' });
    }

    res.status(200).json(metadata);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * List Objects in Bucket
 * GET /api/storage/list
 */
app.get('/api/storage/list', requireAuth, async (req, res) => {
  try {
    const bucket = req.query.bucket as string;
    const prefix = (req.query.prefix as string) || '';

    if (!bucket) {
      return res.status(400).json({ error: 'Bucket name query parameter is required.' });
    }

    const objects = await StorageService.listObjects(bucket, prefix);
    res.status(200).json({ success: true, bucket, prefix, objects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Secure Digital Download Trigger
 * GET /api/storage/download
 */
app.get('/api/storage/download', requireAuth, async (req, res) => {
  try {
    const bucket = req.query.bucket as string;
    const key = req.query.key as string;
    const user = req.body.user;

    if (!bucket || !key) {
      return res.status(400).json({ error: 'Bucket and key are required.' });
    }

    const meta = await dbGet(
      `SELECT * FROM StorageObjects WHERE bucket = ? AND object_key = ?`,
      [bucket, key]
    );

    if (!meta) {
      return res.status(404).json({ error: 'Object file has not been published.' });
    }

    // OMYRA Escrow Check: Simulate purchase confirmation
    // Generate private signed URL for secure download
    const signedUrl = await StorageService.generateSignedUrl(bucket, key, 300); // 5 minutes expiration

    // Increment download metrics
    await dbRun(`UPDATE StorageObjects SET download_count = download_count + 1 WHERE id = ?`, [meta.id]);

    // Track download in log tables
    await dbRun(
      `INSERT INTO StorageDownloads (id, object_id, downloaded_by, downloaded_at, ip_address, user_agent, status)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)`,
      [crypto.randomUUID(), meta.id, user, req.body.ipAddress, req.body.userAgent, 'started']
    );

    await StorageService.logAudit(user, 'Download Link Generated', bucket, key, `Issued 300s temporary download URL`);

    res.status(200).json({
      success: true,
      downloadUrl: signedUrl,
      fileName: meta.original_filename
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete Object
 * DELETE /api/storage/object
 */
app.delete('/api/storage/object', requireAuth, async (req, res) => {
  try {
    const bucket = req.query.bucket as string;
    const key = req.query.key as string;
    const user = req.body.user;

    if (!bucket || !key) {
      return res.status(400).json({ error: 'Bucket and key query parameters are required.' });
    }

    const exists = await StorageService.objectExists(bucket, key);
    if (!exists) {
      return res.status(404).json({ error: 'Object does not exist in backend.' });
    }

    await StorageService.deleteObject(bucket, key, user);

    res.status(200).json({ success: true, message: 'Object and associated SQL metadata deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Emulator Private Download link resolver
 * GET /api/storage/emulator-download
 */
app.get('/api/storage/emulator-download', async (req, res) => {
  try {
    const { bucket, key, token } = req.query as { bucket: string; key: string; token: string };

    if (!bucket || !key || !token) {
      return res.status(400).send('Invalid download parameters.');
    }

    // Verify token exists and hasn't expired in StoragePolicies schema
    const policy = await dbGet(
      `SELECT * FROM StoragePolicies WHERE bucket = ? AND principal = ?`,
      [bucket, token]
    );

    if (!policy) {
      return res.status(403).send('Forbidden: Invalid download key or token expired.');
    }

    const conditions = JSON.parse(policy.conditions || '{}');
    if (Date.now() > conditions.expiry) {
      // Remove stale token
      await dbRun(`DELETE FROM StoragePolicies WHERE principal = ?`, [token]);
      return res.status(403).send('Access Expired: This secure link has reached its 5-minute limit.');
    }

    const { body, contentType, originalFilename } = await StorageService.downloadObject(bucket, key);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalFilename)}"`);
    res.send(body);
  } catch (error: any) {
    res.status(500).send(`Secure download failed: ${error.message}`);
  }
});

/**
 * Aggregate Dashboard Statistics for Admin Storage Dashboard
 * GET /api/storage/dashboard-stats
 */
app.get('/api/storage/dashboard-stats', requireAuth, async (req, res) => {
  try {
    // 1. Storage Usage
    const sizeStats = await dbGet(`SELECT SUM(file_size) as totalSize, COUNT(*) as totalObjects FROM StorageObjects`);
    const totalSize = sizeStats?.totalSize || 0;
    const totalObjects = sizeStats?.totalObjects || 0;

    // 2. Bucket Usage distribution
    const bucketStats = await dbAll(`
      SELECT bucket, SUM(file_size) as size, COUNT(*) as count 
      FROM StorageObjects 
      GROUP BY bucket
    `);

    // 3. Recent uploads and audits
    const recentUploads = await dbAll(`
      SELECT * FROM StorageObjects 
      ORDER BY upload_time DESC 
      LIMIT 10
    `);

    // 4. Recent Downloads
    const recentDownloads = await dbAll(`
      SELECT d.*, o.original_filename, o.bucket, o.object_key
      FROM StorageDownloads d
      JOIN StorageObjects o ON d.object_id = o.id
      ORDER BY d.downloaded_at DESC
      LIMIT 10
    `);

    // 5. Total upload count / download count stats
    const totalDownloads = await dbGet(`SELECT COUNT(*) as count FROM StorageDownloads`);
    const downloadLogsCount = totalDownloads?.count || 0;

    // 6. Storage Errors / Security Blocks from Audit logs
    const securityBlocks = await dbAll(`
      SELECT * FROM StorageAuditLogs 
      WHERE action = 'Security Block' 
      ORDER BY timestamp DESC 
      LIMIT 10
    `);

    // 7. Email platform stats (from Neon Postgres or JSON)
    const emailTotalRow = await dbGet(`SELECT COUNT(*) as count FROM EmailJobs`);
    const emailSentRow = await dbGet(`SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'sent'`);
    const emailPendingRow = await dbGet(`SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'pending' OR status = 'processing'`);
    const emailFailedRow = await dbGet(`SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'failed' OR status = 'dead_letter'`);

    const recentEmailLogs = await dbAll(`
      SELECT * FROM EmailLogs 
      ORDER BY sent_at DESC 
      LIMIT 10
    `);

    const dbHealth = await DatabaseService.checkHealth();
    const resendApiKeyPresent = !!process.env.RESEND_API_KEY;
    const resendStatus = resendApiKeyPresent ? 'healthy' : 'unconfigured_local_fallback';

    res.status(200).json({
      success: true,
      stats: {
        totalObjects,
        totalSize,
        totalDownloads: downloadLogsCount,
        recentUploads,
        recentDownloads,
        bucketStats,
        securityBlocks,
        health: {
          database: dbHealth,
          email: {
            status: resendStatus,
            apiPresent: resendApiKeyPresent,
            fromDefault: process.env.EMAIL_FROM_DEFAULT || 'noreply@mall.omyra.org'
          }
        },
        emails: {
          total: emailTotalRow?.count || 0,
          sent: emailSentRow?.count || 0,
          pending: emailPendingRow?.count || 0,
          failed: emailFailedRow?.count || 0,
          logs: recentEmailLogs
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Triggers a real test email via OMYRA Resend integration
 * POST /api/email/send-test
 */
app.post('/api/email/send-test', requireAuth, async (req, res) => {
  try {
    const { recipient, type, variables } = req.body;

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email is required.' });
    }

    const tplType = type || 'tpl-verification';
    const user = req.body.user;

    // Default template variables based on selected type
    let finalVars = variables || {};
    if (tplType === 'tpl-verification') {
      finalVars = {
        userName: finalVars.userName || 'Valued Creator',
        verificationLink: finalVars.verificationLink || `${req.protocol}://${req.get('host')}/verify?token=test_${crypto.randomBytes(16).toString('hex')}`
      };
    } else if (tplType === 'tpl-order') {
      finalVars = {
        userName: finalVars.userName || 'Valued Buyer',
        orderNumber: finalVars.orderNumber || `OMY-${Math.floor(100000 + Math.random() * 900000)}`,
        productName: finalVars.productName || 'Ultra-HD Cyberpunk Asset Pack',
        storeName: finalVars.storeName || 'Neon Forge Studios',
        amount: finalVars.amount || '$29.99'
      };
    } else if (tplType === 'tpl-download-ready') {
      finalVars = {
        userName: finalVars.userName || 'Valued Buyer',
        productName: finalVars.productName || 'Ultra-HD Cyberpunk Asset Pack',
        downloadLink: finalVars.downloadLink || `${req.protocol}://${req.get('host')}/api/storage/download?bucket=omyra-market-downloads&key=products/files/asset_sample.zip`
      };
    } else if (tplType === 'tpl-security') {
      finalVars = {
        userName: finalVars.userName || 'Account Owner',
        action: finalVars.action || 'Successful Login from New Device',
        timestamp: new Date().toLocaleString(),
        ipAddress: req.ip || '127.0.0.1',
        deviceInfo: req.headers['user-agent'] || 'Chrome Browser on Linux'
      };
    }

    // Resolve sender alias based on type
    let senderAlias: 'noreply' | 'orders' | 'downloads' | 'support' | 'sellers' | 'notifications' | 'announcements' | 'security' = 'noreply';
    if (tplType === 'tpl-order') senderAlias = 'orders';
    if (tplType === 'tpl-download-ready') senderAlias = 'downloads';
    if (tplType === 'tpl-security') senderAlias = 'security';

    // Enqueue email job
    const jobId = await EmailService.enqueueEmail(
      recipient,
      senderAlias,
      tplType,
      finalVars,
      10 // high priority for direct manual sends
    );

    res.status(200).json({
      success: true,
      message: `Email job successfully enqueued. Job ID: ${jobId}. It will be processed within 5 seconds.`,
      jobId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Sends a creator onboarding email
 * POST /api/email/send-onboarding
 */
app.post('/api/email/send-onboarding', requireAuth, async (req, res) => {
  try {
    const { recipient, type, variables } = req.body;

    if (!recipient || !type) {
      return res.status(400).json({ error: 'Recipient email and onboarding stage type are required.' });
    }

    let tplId = '';
    if (type === 'submitted') {
      tplId = 'tpl-creator-submitted';
    } else if (type === 'approved') {
      tplId = 'tpl-creator-approved';
    } else if (type === 'rejected') {
      tplId = 'tpl-creator-rejected';
    } else {
      return res.status(400).json({ error: 'Invalid onboarding email type. Supported types: submitted, approved, rejected' });
    }

    const jobId = await EmailService.enqueueEmail(
      recipient,
      'sellers',
      tplId,
      variables || {},
      10 // High priority
    );

    res.status(200).json({
      success: true,
      message: `Onboarding email (${type}) successfully enqueued. Job ID: ${jobId}`,
      jobId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API ENDPOINTS: GLOBAL LOCATION SYSTEM
// ==========================================

/**
 * Get all active countries with ISO, currency, flag, and phone calling codes
 * GET /api/locations/countries
 */
app.get('/api/locations/countries', async (req, res) => {
  try {
    const countries = await dbAll('SELECT * FROM countries WHERE active = true ORDER BY official_name ASC');
    res.status(200).json({
      success: true,
      countries
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch countries:', error);
    res.status(500).json({ error: 'Failed to retrieve countries database.' });
  }
});

/**
 * Get all active states/provinces for a specific country ID
 * GET /api/locations/states
 */
app.get('/api/locations/states', async (req, res) => {
  try {
    const countryIdStr = req.query.countryId as string;
    if (!countryIdStr) {
      return res.status(400).json({ error: 'Query parameter countryId is required.' });
    }
    const countryId = parseInt(countryIdStr, 10);
    if (isNaN(countryId)) {
      return res.status(400).json({ error: 'Invalid countryId parameter.' });
    }

    const states = await dbAll('SELECT * FROM states WHERE country_id = ? AND active = true ORDER BY official_name ASC', [countryId]);
    res.status(200).json({
      success: true,
      states
    });
  } catch (error: any) {
    console.error('❌ Failed to fetch states:', error);
    res.status(500).json({ error: 'Failed to retrieve states/provinces.' });
  }
});

// ==========================================
// API ENDPOINTS: SELL / CREATOR PORTAL ONBOARDING
// ==========================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'omyra-onboarding-secret-key-32-b'; // Must be 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (err) {
    console.error('Encryption failed, falling back to base64 encoding:', err);
    return Buffer.from(text).toString('base64');
  }
}

function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift() || '', 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    try {
      return Buffer.from(text, 'base64').toString('utf8');
    } catch (e) {
      return text;
    }
  }
}

/**
 * Serving endpoint to preview uploaded public bucket images securely without revealing raw cloud credentials
 */
app.get('/api/storage/public/:bucket/*', async (req, res) => {
  try {
    const bucket = req.params.bucket;
    const objectKey = req.params[0];
    const { client, isLocal } = (await import('./server/storage-service.js')).getS3Client();

    if (isLocal) {
      const localFilePath = path.join(process.cwd(), 'local_object_storage', bucket, objectKey);
      if (fs.existsSync(localFilePath)) {
        res.sendFile(localFilePath);
      } else {
        res.status(404).send('Public file not found.');
      }
    } else {
      const { body, contentType } = await StorageService.downloadObject(bucket, objectKey);
      res.setHeader('Content-Type', contentType);
      res.send(body);
    }
  } catch (err: any) {
    res.status(404).send('Public file not found.');
  }
});

/**
 * Get progressive creator onboarding setup status
 * GET /api/creator/progress
 */
app.get('/api/creator/progress', requireAuth, async (req, res) => {
  try {
    const user = req.body.user;

    let profile: any = null;
    let store: any = null;
    let address: any = null;
    let documents: any[] = [];

    if ((global as any).isPostgresMode) {
      profile = await dbGet('SELECT * FROM CreatorProfiles WHERE user_id = $1', [user]);
      if (profile) {
        store = await dbGet('SELECT * FROM CreatorStores WHERE profile_id = $1', [profile.id]);
        address = await dbGet('SELECT * FROM CreatorAddresses WHERE profile_id = $1', [profile.id]);
        documents = await dbAll('SELECT * FROM CreatorDocuments WHERE profile_id = $1', [profile.id]);
      }
    } else {
      const db = getLocalDb();
      profile = db.CreatorProfiles?.find((p: any) => p.user_id === user) || null;
      if (profile) {
        store = db.CreatorStores?.find((s: any) => s.profile_id === profile.id) || null;
        address = db.CreatorAddresses?.find((a: any) => a.profile_id === profile.id) || null;
        documents = db.CreatorDocuments?.filter((d: any) => d.profile_id === profile.id) || [];
      }
    }

    if (!profile) {
      return res.status(200).json({ success: true, found: false });
    }

    // Decrypt sensitive document numbers securely before delivering to wizard
    const processedDocs = documents.map((doc: any) => {
      let docNumber = '';
      try {
        docNumber = decrypt(doc.doc_number_encrypted);
      } catch (e) {
        docNumber = doc.doc_number_encrypted;
      }
      return {
        ...doc,
        doc_number: docNumber
      };
    });

    res.status(200).json({
      success: true,
      found: true,
      profile,
      store,
      address,
      documents: processedDocs
    });
  } catch (err: any) {
    console.error('❌ Failed to fetch onboarding progress:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Check username availability in OMYRA MALL
 * GET /api/creator/check-username
 */
app.get('/api/creator/check-username', requireAuth, async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username parameter is required.' });
    }

    const isValid = /^[a-z0-9_-]{3,20}$/.test(username);
    if (!isValid) {
      return res.status(200).json({ status: 'invalid' });
    }

    const reserved = ['admin', 'omyra', 'root', 'marketplace', 'designaura', 'shop', 'seller', 'support'];
    if (reserved.includes(username.toLowerCase())) {
      return res.status(200).json({ status: 'taken' });
    }

    if ((global as any).isPostgresMode) {
      const existingSeller = await dbGet('SELECT 1 FROM Sellers WHERE store_name = $1', [username]);
      const existingStore = await dbGet('SELECT 1 FROM CreatorStores WHERE store_slug = $1 OR store_name = $2', [username, username]);
      if (existingSeller || existingStore) {
        return res.status(200).json({ status: 'taken' });
      }
    } else {
      const db = getLocalDb();
      const existingSeller = db.Sellers.some((s: any) => s.store_name.toLowerCase() === username.toLowerCase());
      const existingStore = db.CreatorStores.some((s: any) => s.store_slug.toLowerCase() === username.toLowerCase() || s.store_name.toLowerCase() === username.toLowerCase());
      if (existingSeller || existingStore) {
        return res.status(200).json({ status: 'taken' });
      }
    }

    res.status(200).json({ status: 'available' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Secure file upload specifically optimized for Creator setup assets & compliance documents
 * POST /api/creator/upload
 */
app.post('/api/creator/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const uploadType = req.query.uploadType as string; // 'avatar' | 'banner' | 'idFront' | 'idBack' | 'selfie' | 'tax'
    const user = req.body.user;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file was uploaded.' });
    }
    if (!uploadType) {
      return res.status(400).json({ success: false, error: 'Query parameter uploadType is required.' });
    }

    // Security Verification: MIME Type, Magic signature validation, double extensions, executables
    const securityType = (uploadType === 'avatar' || uploadType === 'banner' || uploadType === 'selfie') ? 'image' : 'product';
    const validation = UploadEngine.validateFile(file.originalname, file.size, file.mimetype, file.buffer, securityType);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const isKYCOrSecure = ['idFront', 'idBack', 'selfie', 'tax'].includes(uploadType);
    const bucket = isKYCOrSecure ? BUCKET_SECURE : BUCKET_USER;
    const visibility = isKYCOrSecure ? 'private' : 'public';

    const ext = path.extname(file.originalname).toLowerCase();
    const folder = isKYCOrSecure ? 'creators/documents/' : (uploadType === 'avatar' ? 'creators/avatars/' : 'creators/banners/');
    const key = `${folder}${crypto.randomUUID()}${ext}`;

    // Upload using StorageService
    await StorageService.uploadObject(bucket, key, file.buffer, file.mimetype, file.originalname, user, visibility);

    // Prepare retrieval URI
    let fileUrl = '';
    if (visibility === 'public') {
      fileUrl = `/api/storage/public/${bucket}/${key}`;
    } else {
      fileUrl = await StorageService.generateSignedUrl(bucket, key);
    }

    res.status(200).json({
      success: true,
      message: 'File successfully processed, secured, and stored.',
      file_key: key,
      bucket,
      original_filename: file.originalname,
      content_type: file.mimetype,
      file_size: file.size,
      url: fileUrl
    });
  } catch (err: any) {
    console.error('❌ Upload processing failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Access secure KYC document with temporary signed URLs
 * GET /api/creator/kyc-document-url
 */
app.get('/api/creator/kyc-document-url', requireAuth, async (req, res) => {
  try {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ success: false, error: 'Query parameter key is required.' });
    }

    const signedUrl = await StorageService.generateSignedUrl(BUCKET_SECURE, key);
    res.status(200).json({ success: true, url: signedUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Save progressive setup wizard onboarding state automatically
 * POST /api/creator/save-step
 */
app.post('/api/creator/save-step', requireAuth, async (req, res) => {
  try {
    const user = req.body.user;
    const { step, data } = req.body;

    if (!step || typeof step !== 'number') {
      return res.status(400).json({ success: false, error: 'Step number is required.' });
    }

    // Backend validations to prevent garbage submissions
    if (step === 2) {
      if (!data.first_name?.trim() || !data.last_name?.trim()) {
        return res.status(400).json({ success: false, error: 'First name and last name are required.' });
      }
    } else if (step === 3) {
      if (!data.address_line1?.trim() || !data.city?.trim() || !data.postal_code?.trim() || !data.country_id || !data.state_id) {
        return res.status(400).json({ success: false, error: 'Address block containing Country ID and State ID is incomplete.' });
      }
    } else if (step === 4) {
      if (!data.email?.trim() || !data.phone?.trim()) {
        return res.status(400).json({ success: false, error: 'Email and phone numbers are required.' });
      }
    } else if (step === 5) {
      if (!data.store_name?.trim() || !data.store_slug?.trim()) {
        return res.status(400).json({ success: false, error: 'Store brand name and unique slug handle are required.' });
      }
      if (!/^[a-z0-9_-]{3,20}$/.test(data.store_slug)) {
        return res.status(400).json({ success: false, error: 'Invalid brand handle format.' });
      }
    }

    let profileId: string;

    if ((global as any).isPostgresMode) {
      let profile = await dbGet('SELECT * FROM CreatorProfiles WHERE user_id = $1', [user]);
      if (!profile) {
        profileId = crypto.randomUUID();
        await dbRun(
          `INSERT INTO CreatorProfiles (id, user_id, first_name, last_name, email, phone, current_step, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [profileId, user, data.first_name || '', data.last_name || '', data.email || '', data.phone || '', step, 'Draft']
        );
      } else {
        profileId = profile.id;
        const nextStep = Math.max(profile.current_step, step);
        await dbRun('UPDATE CreatorProfiles SET current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nextStep, profileId]);
      }

      if (step === 2) {
        await dbRun('UPDATE CreatorProfiles SET first_name = ?, last_name = ? WHERE id = ?', [data.first_name, data.last_name, profileId]);
      } else if (step === 3) {
        const addr = await dbGet('SELECT 1 FROM CreatorAddresses WHERE profile_id = $1', [profileId]);
        if (addr) {
          await dbRun(
            `UPDATE CreatorAddresses SET address_line1 = ?, address_line2 = ?, city = ?, state_id = ?, country_id = ?, postal_code = ?, updated_at = CURRENT_TIMESTAMP WHERE profile_id = ?`,
            [data.address_line1, data.address_line2 || null, data.city, data.state_id, data.country_id, data.postal_code, profileId]
          );
        } else {
          await dbRun(
            `INSERT INTO CreatorAddresses (id, profile_id, address_line1, address_line2, city, state_id, country_id, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), profileId, data.address_line1, data.address_line2 || null, data.city, data.state_id, data.country_id, data.postal_code]
          );
        }
      } else if (step === 4) {
        await dbRun('UPDATE CreatorProfiles SET email = ?, phone = ?, phone_country_code = ? WHERE id = ?', [data.email, data.phone, data.phone_country_code || null, profileId]);
      } else if (step === 5) {
        // Enforce uniqueness constraints
        const existingStore = await dbGet('SELECT 1 FROM CreatorStores WHERE (store_slug = ? OR store_name = ?) AND profile_id != ?', [data.store_slug, data.store_name, profileId]);
        const existingSeller = await dbGet('SELECT 1 FROM Sellers WHERE store_name = ?', [data.store_slug]);
        if (existingStore || existingSeller) {
          return res.status(400).json({ success: false, error: 'Store brand name or handle already exists.' });
        }

        const store = await dbGet('SELECT * FROM CreatorStores WHERE profile_id = $1', [profileId]);
        if (store) {
          await dbRun('UPDATE CreatorStores SET store_name = ?, store_slug = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE profile_id = ?', [data.store_name, data.store_slug, data.description || null, profileId]);
        } else {
          const storeIdStr = 'OMYRA-STORE-' + crypto.randomBytes(3).toString('hex').toUpperCase();
          await dbRun(
            `INSERT INTO CreatorStores (id, profile_id, store_id_string, store_slug, store_name, description) VALUES (?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), profileId, storeIdStr, data.store_slug, data.store_name, data.description || null]
          );
        }
      } else if (step === 6) {
        if (data.avatar_url) {
          await dbRun('UPDATE CreatorProfiles SET avatar_url = ? WHERE id = ?', [data.avatar_url, profileId]);
        }
        if (data.banner_url) {
          await dbRun('UPDATE CreatorStores SET banner_url = ? WHERE profile_id = ?', [data.banner_url, profileId]);
        }
      } else if (step === 7) {
        const docTypeVal = data.doc_type || 'national_id';
        const docNumberVal = data.doc_number || 'PENDING';
        let issuingCountryIdVal = data.issuing_country_id;
        if (!issuingCountryIdVal) {
          const addr = await dbGet('SELECT country_id FROM CreatorAddresses WHERE profile_id = $1', [profileId]);
          issuingCountryIdVal = addr ? addr.country_id : 1;
        }
        const fileKeyVal = data.file_key || 'placeholder_file_key';

        const encryptedNum = encrypt(docNumberVal);
        // True check of decrypted numbers for absolute security
        const allDocs = await dbAll('SELECT id, doc_number_encrypted FROM CreatorDocuments WHERE profile_id != ?', [profileId]);
        for (const doc of allDocs) {
          const decrypted = decrypt(doc.doc_number_encrypted);
          if (decrypted === docNumberVal && docNumberVal !== 'PENDING') {
            return res.status(400).json({ success: false, error: 'This government identity document number has already been verified for another store.' });
          }
        }

        const existingDoc = await dbGet('SELECT id FROM CreatorDocuments WHERE profile_id = $1', [profileId]);
        if (existingDoc) {
          await dbRun(
            `UPDATE CreatorDocuments SET doc_type = ?, issuing_country_id = ?, doc_number_encrypted = ?, expiry_date = ?, file_key = ?, bucket = ?, original_filename = ?, content_type = ?, file_size = ?, updated_at = CURRENT_TIMESTAMP WHERE profile_id = ?`,
            [docTypeVal, issuingCountryIdVal, encryptedNum, data.expiry_date || null, fileKeyVal, BUCKET_SECURE, data.original_filename || 'document', data.content_type || 'application/pdf', data.file_size || 0, profileId]
          );
        } else {
          await dbRun(
            `INSERT INTO CreatorDocuments (id, profile_id, doc_type, issuing_country_id, doc_number_encrypted, expiry_date, file_key, bucket, original_filename, content_type, file_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), profileId, docTypeVal, issuingCountryIdVal, encryptedNum, data.expiry_date || null, fileKeyVal, BUCKET_SECURE, data.original_filename || 'document', data.content_type || 'application/pdf', data.file_size || 0]
          );
        }
      }
    } else {
      const db = getLocalDb();
      let profile = db.CreatorProfiles.find((p: any) => p.user_id === user);
      if (!profile) {
        profileId = crypto.randomUUID();
        profile = {
          id: profileId,
          user_id: user,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          phone_country_code: data.phone_country_code || null,
          current_step: step,
          status: 'Draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.CreatorProfiles.push(profile);
      } else {
        profileId = profile.id;
        profile.current_step = Math.max(profile.current_step, step);
        profile.updated_at = new Date().toISOString();
      }

      if (step === 2) {
        profile.first_name = data.first_name;
        profile.last_name = data.last_name;
      } else if (step === 3) {
        let addr = db.CreatorAddresses.find((a: any) => a.profile_id === profileId);
        if (addr) {
          addr.address_line1 = data.address_line1;
          addr.address_line2 = data.address_line2 || null;
          addr.city = data.city;
          addr.state_id = data.state_id;
          addr.country_id = data.country_id;
          addr.postal_code = data.postal_code;
          addr.updated_at = new Date().toISOString();
        } else {
          addr = {
            id: crypto.randomUUID(),
            profile_id: profileId,
            address_line1: data.address_line1,
            address_line2: data.address_line2 || null,
            city: data.city,
            state_id: data.state_id,
            country_id: data.country_id,
            postal_code: data.postal_code,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          db.CreatorAddresses.push(addr);
        }
      } else if (step === 4) {
        profile.email = data.email;
        profile.phone = data.phone;
        profile.phone_country_code = data.phone_country_code || null;
      } else if (step === 5) {
        const existingStore = db.CreatorStores.find((s: any) => (s.store_slug === data.store_slug || s.store_name === data.store_name) && s.profile_id !== profileId);
        const existingSeller = db.Sellers.find((s: any) => s.store_name === data.store_slug);
        if (existingStore || existingSeller) {
          return res.status(400).json({ success: false, error: 'Store brand name or handle already exists.' });
        }

        let store = db.CreatorStores.find((s: any) => s.profile_id === profileId);
        if (store) {
          store.store_name = data.store_name;
          store.store_slug = data.store_slug;
          store.description = data.description || null;
          store.updated_at = new Date().toISOString();
        } else {
          const storeIdStr = 'OMYRA-STORE-' + crypto.randomBytes(3).toString('hex').toUpperCase();
          store = {
            id: crypto.randomUUID(),
            profile_id: profileId,
            store_id_string: storeIdStr,
            store_slug: data.store_slug,
            store_name: data.store_name,
            description: data.description || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          db.CreatorStores.push(store);
        }
      } else if (step === 6) {
        if (data.avatar_url) profile.avatar_url = data.avatar_url;
        if (data.banner_url) {
          const store = db.CreatorStores.find((s: any) => s.profile_id === profileId);
          if (store) store.banner_url = data.banner_url;
        }
      } else if (step === 7) {
        const docTypeVal = data.doc_type || 'national_id';
        const docNumberVal = data.doc_number || 'PENDING';
        let issuingCountryIdVal = data.issuing_country_id;
        if (!issuingCountryIdVal) {
          const addr = db.CreatorAddresses.find((a: any) => a.profile_id === profileId);
          issuingCountryIdVal = addr ? addr.country_id : 1;
        }
        const fileKeyVal = data.file_key || 'placeholder_file_key';

        const encryptedNum = encrypt(docNumberVal);
        for (const doc of db.CreatorDocuments) {
          if (doc.profile_id !== profileId) {
            const decrypted = decrypt(doc.doc_number_encrypted);
            if (decrypted === docNumberVal && docNumberVal !== 'PENDING') {
              return res.status(400).json({ success: false, error: 'This government identity document number has already been verified for another store.' });
            }
          }
        }

        let doc = db.CreatorDocuments.find((d: any) => d.profile_id === profileId);
        if (doc) {
          doc.doc_type = docTypeVal;
          doc.issuing_country_id = issuingCountryIdVal;
          doc.doc_number_encrypted = encryptedNum;
          doc.expiry_date = data.expiry_date || null;
          doc.file_key = fileKeyVal;
          doc.bucket = BUCKET_SECURE;
          doc.original_filename = data.original_filename || 'document';
          doc.content_type = data.content_type || 'application/pdf';
          doc.file_size = data.file_size || 0;
          doc.updated_at = new Date().toISOString();
        } else {
          doc = {
            id: crypto.randomUUID(),
            profile_id: profileId,
            doc_type: docTypeVal,
            issuing_country_id: issuingCountryIdVal,
            doc_number_encrypted: encryptedNum,
            expiry_date: data.expiry_date || null,
            file_key: fileKeyVal,
            bucket: BUCKET_SECURE,
            original_filename: data.original_filename || 'document',
            content_type: data.content_type || 'application/pdf',
            file_size: data.file_size || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          db.CreatorDocuments.push(doc);
        }
      }

      saveLocalDb();
    }

    res.status(200).json({ success: true, message: `Onboarding step ${step} saved successfully.`, profileId });
  } catch (err: any) {
    console.error('❌ Failed to save onboarding step:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Submit final onboarding application with transaction and status mapping
 * POST /api/creator/submit
 */
app.post('/api/creator/submit', requireAuth, async (req, res) => {
  try {
    const user = req.body.user;
    const ip = req.body.ipAddress;
    const ua = req.body.userAgent;

    let profile: any = null;
    let store: any = null;
    let address: any = null;
    let documents: any[] = [];

    if ((global as any).isPostgresMode) {
      profile = await dbGet('SELECT * FROM CreatorProfiles WHERE user_id = $1', [user]);
      if (profile) {
        store = await dbGet('SELECT * FROM CreatorStores WHERE profile_id = $1', [profile.id]);
        address = await dbGet('SELECT * FROM CreatorAddresses WHERE profile_id = $1', [profile.id]);
        documents = await dbAll('SELECT * FROM CreatorDocuments WHERE profile_id = $1', [profile.id]);
      }
    } else {
      const db = getLocalDb();
      profile = db.CreatorProfiles.find((p: any) => p.user_id === user);
      if (profile) {
        store = db.CreatorStores.find((s: any) => s.profile_id === profile.id);
        address = db.CreatorAddresses.find((a: any) => a.profile_id === profile.id);
        documents = db.CreatorDocuments.filter((d: any) => d.profile_id === profile.id);
      }
    }

    if (!profile || !store || !address || documents.length === 0) {
      return res.status(400).json({ success: false, error: 'Onboarding is incomplete. Please complete all prior steps and uploads.' });
    }

    if ((global as any).isPostgresMode) {
      const pool = (global as any).getPgPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        let userRecord = await client.query('SELECT id FROM Users WHERE email = $1', [profile.email]);
        let dbUserId: string;
        if (userRecord.rows.length === 0) {
          dbUserId = crypto.randomUUID();
          await client.query(
            'INSERT INTO Users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)',
            [dbUserId, profile.email, null, 'seller']
          );
        } else {
          dbUserId = userRecord.rows[0].id;
        }

        // Update profile status
        await client.query(
          "UPDATE CreatorProfiles SET status = 'Submitted', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [profile.id]
        );

        // Upsert general Sellers table record
        await client.query(
          `INSERT INTO Sellers (id, user_id, store_name, description, banner_url, status) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (store_name) DO UPDATE SET description = $4, banner_url = $5, status = $6`,
          [crypto.randomUUID(), dbUserId, store.store_name, store.description, store.banner_url || null, 'pending']
        );

        // Audit Trail Logs
        await client.query(
          `INSERT INTO CreatorAuditLogs (id, user_id, action, ip_address, device_info, details) VALUES ($1, $2, $3, $4, $5, $6)`,
          [crypto.randomUUID(), user, 'Profile Submitted', ip, ua, `Creator ${profile.first_name} ${profile.last_name} submitted onboarding application for store ${store.store_name}`]
        );

        // Compliance status tracker
        await client.query(
          `INSERT INTO CreatorVerificationStatus (id, profile_id, step, status, comment) VALUES ($1, $2, $3, $4, $5)`,
          [crypto.randomUUID(), profile.id, 'Identity', 'Pending', 'Awaiting administrative verification']
        );

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      const db = getLocalDb();

      // Update profile status
      const localProfile = db.CreatorProfiles.find((p: any) => p.id === profile.id);
      if (localProfile) {
        localProfile.status = 'Submitted';
        localProfile.updated_at = new Date().toISOString();
      }

      // Upsert Users and Sellers
      let userRecord = db.Users.find((u: any) => u.email === profile.email);
      let dbUserId: string;
      if (!userRecord) {
        dbUserId = crypto.randomUUID();
        userRecord = { id: dbUserId, email: profile.email, password_hash: null, role: 'seller', created_at: new Date().toISOString() };
        db.Users.push(userRecord);
      } else {
        dbUserId = userRecord.id;
      }

      let sellerRecord = db.Sellers.find((s: any) => s.store_name === store.store_name);
      if (sellerRecord) {
        sellerRecord.description = store.description;
        sellerRecord.banner_url = store.banner_url || null;
        sellerRecord.status = 'pending';
      } else {
        sellerRecord = {
          id: crypto.randomUUID(),
          user_id: dbUserId,
          store_name: store.store_name,
          description: store.description,
          banner_url: store.banner_url || null,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        db.Sellers.push(sellerRecord);
      }

      // Audit logs
      db.CreatorAuditLogs.push({
        id: crypto.randomUUID(),
        user_id: user,
        action: 'Profile Submitted',
        ip_address: ip,
        device_info: ua,
        details: `Creator ${profile.first_name} ${profile.last_name} submitted onboarding application for store ${store.store_name}`,
        created_at: new Date().toISOString()
      });

      // Verification tracking
      db.CreatorVerificationStatus.push({
        id: crypto.randomUUID(),
        profile_id: profile.id,
        step: 'Identity',
        status: 'Pending',
        comment: 'Awaiting administrative verification',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      saveLocalDb();
    }

    // Queue Confirmation Emails
    try {
      await EmailService.enqueueEmail(
        profile.email,
        'noreply',
        'tpl-creator-submitted',
        {
          userName: `${profile.first_name} ${profile.last_name}`,
          shopName: store.store_name,
          shopUsername: store.store_slug
        }
      );
    } catch (emailErr) {
      console.warn('⚠️ Onboarding email queue warning (non-blocking):', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding application successfully submitted under strict compliance. Review is underway.'
    });
  } catch (err: any) {
    console.error('❌ Onboarding submission failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// VITE DEV SERVER MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OMYRA Storage Server is listening on http://localhost:${PORT}`);
  });
}

startServer();
