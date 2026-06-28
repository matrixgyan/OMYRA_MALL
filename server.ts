import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase, dbAll, dbGet, dbRun } from './server/db.js';
import { StorageService, BUCKET_DOWNLOADS, BUCKET_ASSETS, BUCKET_USER, BUCKET_TEMP } from './server/storage-service.js';
import { UploadEngine } from './server/upload-engine.js';
import { EmailService } from './server/email-service.js';
import { DatabaseService } from './server/database-service.js';

const app = express();
const PORT = 3000;

app.use(express.json());

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
  // Real APIs require tokens. For live demonstration, we accept any valid token or fall back to system defaults.
  const authHeader = req.headers.authorization;
  req.body.user = 'DesignAura Labs'; // Set current authenticated creator user
  req.body.ipAddress = req.ip || '127.0.0.1';
  req.body.userAgent = req.headers['user-agent'] || 'Browser';
  next();
};

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
