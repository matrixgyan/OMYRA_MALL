import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { dbRun, dbGet } from './db.js';

// Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const BUCKET_DOWNLOADS = process.env.R2_DOWNLOAD_BUCKET || 'omyra-market-downloads';
export const BUCKET_ASSETS = process.env.R2_ASSETS_BUCKET || 'omyra-market-assets';
export const BUCKET_USER = process.env.R2_USER_BUCKET || 'omyra-user-content';
export const BUCKET_TEMP = process.env.R2_TEMP_BUCKET || 'omyra-temp-uploads';

// Lazy client setup
let s3Client: S3Client | null = null;
let isLocalMode = false;

// Create local storage emulator directory
const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'local_object_storage');
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

export function getS3Client(): { client: S3Client | null; isLocal: boolean } {
  if (s3Client === null && !isLocalMode) {
    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID) {
      console.warn(
        '⚠️ Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are missing. Running in SECURE LOCAL OBJECT STORAGE SANDBOX MODE.'
      );
      isLocalMode = true;
      return { client: null, isLocal: true };
    }

    try {
      s3Client = new S3Client({
        region: 'auto',
        endpoint: R2_ENDPOINT,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY
        },
        forcePathStyle: true
      });
      console.log('⚡ Cloudflare R2 S3 SDK client initialized successfully in production-grade mode.');
    } catch (err) {
      console.error('❌ Failed to initialize R2 S3 client, falling back to Local Mode:', err);
      isLocalMode = true;
    }
  }

  return { client: s3Client, isLocal: isLocalMode };
}

/**
 * Interface representing metadata of an object stored in the relational database.
 */
export interface StorageObjectMetadata {
  id: string;
  bucket: string;
  object_key: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  sha256_hash: string;
  upload_time: string;
  uploaded_by: string;
  storage_provider: string;
  storage_region: string;
  visibility: 'public' | 'private';
  download_count: number;
}

export class StorageService {
  /**
   * Calculates SHA256 Hash of a buffer to prevent duplicate uploads and maintain block integrity.
   */
  static calculateSHA256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Upload an Object
   */
  static async uploadObject(
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType: string,
    originalFilename: string,
    uploadedBy: string,
    visibility: 'public' | 'private' = 'private'
  ): Promise<StorageObjectMetadata> {
    const sha256 = this.calculateSHA256(buffer);
    const size = buffer.length;
    const { client, isLocal } = getS3Client();

    const objectId = crypto.randomUUID();
    let finalProvider = isLocal ? 'local_emulator' : 'cloudflare_r2';

    if (isLocal) {
      // Local Storage Mode
      const localBucketPath = path.join(LOCAL_STORAGE_DIR, bucket);
      const localFilePath = path.join(localBucketPath, key);
      fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
      fs.writeFileSync(localFilePath, buffer);
      console.log(`[Local Storage] Stored Object in: ${localFilePath}`);
    } else if (client) {
      // Real Cloudflare R2 Mode
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            Metadata: {
              sha256,
              originalFilename,
              uploadedBy,
              objectId
            }
          })
        );
      } catch (err: any) {
        console.warn(`⚠️ Cloud upload to bucket "${bucket}" failed (${err.message}). Falling back to local emulator storage.`);
        finalProvider = 'local_emulator_fallback';
        const localBucketPath = path.join(LOCAL_STORAGE_DIR, bucket);
        const localFilePath = path.join(localBucketPath, key);
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
        fs.writeFileSync(localFilePath, buffer);
      }
    }

    const metadata: StorageObjectMetadata = {
      id: objectId,
      bucket,
      object_key: key,
      original_filename: originalFilename,
      content_type: contentType,
      file_size: size,
      sha256_hash: sha256,
      upload_time: new Date().toISOString(),
      uploaded_by: uploadedBy,
      storage_provider: finalProvider,
      storage_region: 'auto',
      visibility,
      download_count: 0
    };

    // Save in relational StorageObjects database
    await dbRun(
      `INSERT INTO StorageObjects (id, bucket, object_key, original_filename, content_type, file_size, sha256_hash, upload_time, uploaded_by, storage_provider, storage_region, visibility, download_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        metadata.id,
        metadata.bucket,
        metadata.object_key,
        metadata.original_filename,
        metadata.content_type,
        metadata.file_size,
        metadata.sha256_hash,
        metadata.upload_time,
        metadata.uploaded_by,
        metadata.storage_provider,
        metadata.storage_region,
        metadata.visibility,
        metadata.download_count
      ]
    );

    // Record Event log in audit trail
    await this.logAudit(
      uploadedBy,
      'Upload Completed',
      bucket,
      key,
      JSON.stringify({ objectId, size, contentType, sha256, provider: finalProvider })
    );

    return metadata;
  }

  /**
   * Download Object (reads bytes)
   */
  static async downloadObject(
    bucket: string,
    key: string
  ): Promise<{ body: Buffer; contentType: string; originalFilename: string }> {
    const { client, isLocal } = getS3Client();

    // Query database to get proper original metadata
    const meta = await dbGet(
      `SELECT * FROM StorageObjects WHERE bucket = ? AND object_key = ?`,
      [bucket, key]
    );

    const localFilePath = path.join(LOCAL_STORAGE_DIR, bucket, key);

    if (isLocal || fs.existsSync(localFilePath)) {
      if (!fs.existsSync(localFilePath)) {
        throw new Error('Object not found in local storage.');
      }
      const buffer = fs.readFileSync(localFilePath);
      return {
        body: buffer,
        contentType: meta ? meta.content_type : 'application/octet-stream',
        originalFilename: meta ? meta.original_filename : path.basename(key)
      };
    } else if (client) {
      try {
        const response = await client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key
          })
        );
        const byteArray = await response.Body?.transformToByteArray();
        const buffer = Buffer.from(byteArray || []);
        return {
          body: buffer,
          contentType: response.ContentType || meta?.content_type || 'application/octet-stream',
          originalFilename: meta?.original_filename || path.basename(key)
        };
      } catch (err) {
        // Safe check for local fallback file
        if (fs.existsSync(localFilePath)) {
          const buffer = fs.readFileSync(localFilePath);
          return {
            body: buffer,
            contentType: meta ? meta.content_type : 'application/octet-stream',
            originalFilename: meta ? meta.original_filename : path.basename(key)
          };
        }
        throw err;
      }
    }

    throw new Error('Storage service is unavailable.');
  }

  /**
   * Delete Object
   */
  static async deleteObject(bucket: string, key: string, deletedBy: string): Promise<void> {
    const { client, isLocal } = getS3Client();
    const localFilePath = path.join(LOCAL_STORAGE_DIR, bucket, key);

    if (isLocal) {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } else if (client) {
      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
          })
        );
      } catch (err) {
        console.warn(`⚠️ Cloud delete from bucket "${bucket}" failed:`, err);
      }
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }

    // Delete metadata record
    await dbRun(`DELETE FROM StorageObjects WHERE bucket = ? AND object_key = ?`, [bucket, key]);

    // Record Audit
    await this.logAudit(deletedBy, 'Object Deleted', bucket, key, 'Deleted by user action');
  }

  /**
   * Copy Object
   */
  static async copyObject(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
    copiedBy: string
  ): Promise<void> {
    const { client, isLocal } = getS3Client();

    // Get original metadata
    const sourceMeta = await dbGet(
      `SELECT * FROM StorageObjects WHERE bucket = ? AND object_key = ?`,
      [sourceBucket, sourceKey]
    );

    if (!sourceMeta) {
      throw new Error('Source object metadata not found in database.');
    }

    const sourcePath = path.join(LOCAL_STORAGE_DIR, sourceBucket, sourceKey);
    const destPath = path.join(LOCAL_STORAGE_DIR, destBucket, destKey);
    let copiedLocally = false;

    if (isLocal) {
      if (!fs.existsSync(sourcePath)) {
        throw new Error('Source file missing in local storage.');
      }
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(sourcePath, destPath);
      copiedLocally = true;
    } else if (client) {
      try {
        await client.send(
          new CopyObjectCommand({
            Bucket: destBucket,
            Key: destKey,
            CopySource: `${sourceBucket}/${sourceKey}`
          })
        );
      } catch (err) {
        console.warn(`⚠️ Cloud copy failed (${err}). Performing fallback local copy.`);
        if (fs.existsSync(sourcePath)) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(sourcePath, destPath);
          copiedLocally = true;
        } else {
          throw err;
        }
      }
    }

    // Insert new metadata
    await dbRun(
      `INSERT INTO StorageObjects (id, bucket, object_key, original_filename, content_type, file_size, sha256_hash, uploaded_by, storage_provider, storage_region, visibility, download_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        crypto.randomUUID(),
        destBucket,
        destKey,
        sourceMeta.original_filename,
        sourceMeta.content_type,
        sourceMeta.file_size,
        sourceMeta.sha256_hash,
        copiedBy,
        copiedLocally ? 'local_emulator_fallback' : sourceMeta.storage_provider,
        sourceMeta.storage_region,
        sourceMeta.visibility
      ]
    );

    await this.logAudit(
      copiedBy,
      'Object Copied',
      destBucket,
      destKey,
      `Copied from ${sourceBucket}/${sourceKey}`
    );
  }

  /**
   * Move Object (Copy + Delete)
   */
  static async moveObject(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string,
    movedBy: string
  ): Promise<void> {
    await this.copyObject(sourceBucket, sourceKey, destBucket, destKey, movedBy);
    await this.deleteObject(sourceBucket, sourceKey, movedBy);
  }

  /**
   * Rename Object
   */
  static async renameObject(bucket: string, oldKey: string, newKey: string, renamedBy: string): Promise<void> {
    await this.moveObject(bucket, oldKey, bucket, newKey, renamedBy);
  }

  /**
   * Object Existence check
   */
  static async objectExists(bucket: string, key: string): Promise<boolean> {
    const { client, isLocal } = getS3Client();
    const localFilePath = path.join(LOCAL_STORAGE_DIR, bucket, key);

    if (isLocal || fs.existsSync(localFilePath)) {
      return fs.existsSync(localFilePath);
    } else if (client) {
      try {
        await client.send(
          new HeadObjectCommand({
            Bucket: bucket,
            Key: key
          })
        );
        return true;
      } catch (err) {
        if (fs.existsSync(localFilePath)) {
          return true;
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Generate Signed URLs for secure downloads
   */
  static async generateSignedUrl(bucket: string, key: string, expiresInSeconds = 3600): Promise<string> {
    const { client, isLocal } = getS3Client();
    const localFilePath = path.join(LOCAL_STORAGE_DIR, bucket, key);

    if (isLocal || fs.existsSync(localFilePath)) {
      // Local Signed URL emulator using direct server routes with secure transient tokens
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = Date.now() + expiresInSeconds * 1000;
      
      // Store transient emulator token in StoragePolicies schema for secure validation
      await dbRun(
        `INSERT INTO StoragePolicies (id, bucket, principal, action, effect, conditions)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), bucket, token, 'read', 'allow', JSON.stringify({ expiry, key })]
      );

      return `/api/storage/emulator-download?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}&token=${token}`;
    } else if (client) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key
        });
        return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
      } catch (err) {
        console.warn(`⚠️ Generating signed URL failed (${err}). Falling back to local emulator URL.`);
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + expiresInSeconds * 1000;
        await dbRun(
          `INSERT INTO StoragePolicies (id, bucket, principal, action, effect, conditions)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), bucket, token, 'read', 'allow', JSON.stringify({ expiry, key })]
        );
        return `/api/storage/emulator-download?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}&token=${token}`;
      }
    }

    throw new Error('Storage service is offline.');
  }

  /**
   * List Objects in a bucket
   */
  static async listObjects(bucket: string, prefix = ''): Promise<any[]> {
    const { client, isLocal } = getS3Client();

    if (isLocal) {
      const bucketDir = path.join(LOCAL_STORAGE_DIR, bucket);
      if (!fs.existsSync(bucketDir)) return [];
      
      const getFilesRecursively = (dir: string): string[] => {
        let results: string[] = [];
        const list = fs.readdirSync(dir);
        list.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat && stat.isDirectory()) {
            results = results.concat(getFilesRecursively(filePath));
          } else {
            results.push(filePath);
          }
        });
        return results;
      };

      const allFiles = getFilesRecursively(bucketDir);
      const objects = await Promise.all(
        allFiles.map(async (filePath) => {
          const relPath = path.relative(bucketDir, filePath).replace(/\\/g, '/');
          const stat = fs.statSync(filePath);
          const meta = await dbGet(
            `SELECT * FROM StorageObjects WHERE bucket = ? AND object_key = ?`,
            [bucket, relPath]
          );

          return {
            Key: relPath,
            Size: stat.size,
            LastModified: stat.mtime,
            Metadata: meta || null
          };
        })
      );

      return objects.filter((o) => o.Key.startsWith(prefix));
    } else if (client) {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix
        })
      );

      return Promise.all(
        (response.Contents || []).map(async (c) => {
          const meta = await dbGet(
            `SELECT * FROM StorageObjects WHERE bucket = ? AND object_key = ?`,
            [bucket, c.Key]
          );
          return {
            Key: c.Key,
            Size: c.Size,
            LastModified: c.LastModified,
            Metadata: meta || null
          };
        })
      );
    }

    return [];
  }

  /**
   * Multipart Upload: Initiate
   */
  static async initiateMultipart(
    bucket: string,
    key: string,
    contentType: string,
    originalFilename: string,
    uploadedBy: string
  ): Promise<{ uploadId: string; objectId: string }> {
    const { client, isLocal } = getS3Client();
    const objectId = crypto.randomUUID();
    const uploadId = crypto.randomUUID(); // Unique local or provider session ID

    if (!isLocal && client) {
      const response = await client.send(
        new CreateMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          ContentType: contentType,
          Metadata: {
            objectId,
            originalFilename,
            uploadedBy
          }
        })
      );
      return { uploadId: response.UploadId || uploadId, objectId };
    }

    // Register active multipart upload in database
    await dbRun(
      `INSERT INTO StorageUploads (id, object_id, bucket, object_key, original_filename, content_type, file_size, status, uploaded_by, upload_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uploadId, objectId, bucket, key, originalFilename, contentType, 0, 'uploading', uploadedBy, 'multipart']
    );

    return { uploadId, objectId };
  }

  /**
   * Multipart Upload: Complete
   */
  static async completeMultipart(
    bucket: string,
    key: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
    uploadedBy: string
  ): Promise<StorageObjectMetadata> {
    const { client, isLocal } = getS3Client();

    const uploadRecord = await dbGet(`SELECT * FROM StorageUploads WHERE id = ?`, [uploadId]);
    if (!uploadRecord) {
      throw new Error('Multipart upload session not found.');
    }

    let finalSize = 0;
    let sha256 = 'unknown';

    if (isLocal) {
      // Reassemble the parts in local mode
      const partDir = path.join(LOCAL_STORAGE_DIR, 'multiparts', uploadId);
      if (!fs.existsSync(partDir)) {
        throw new Error('Multipart upload temporary directory missing.');
      }

      // Read all parts in order and join them
      const sortedParts = fs.readdirSync(partDir).sort((a, b) => parseInt(a) - parseInt(b));
      const chunks: Buffer[] = [];
      sortedParts.forEach((pName) => {
        chunks.push(fs.readFileSync(path.join(partDir, pName)));
      });

      const fullBuffer = Buffer.concat(chunks);
      finalSize = fullBuffer.length;
      sha256 = this.calculateSHA256(fullBuffer);

      // Save full compiled object
      const localFilePath = path.join(LOCAL_STORAGE_DIR, bucket, key);
      fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
      fs.writeFileSync(localFilePath, fullBuffer);

      // Clean up part files
      fs.rmSync(partDir, { recursive: true, force: true });
    } else if (client) {
      await client.send(
        new CompleteMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts }
        })
      );

      // Query size and sha256 via HeadObject
      const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      finalSize = head.ContentLength || 0;
      sha256 = head.Metadata?.sha256 || 'r2_hash';
    }

    // Update upload status
    await dbRun(
      `UPDATE StorageUploads SET status = 'completed', completed_at = CURRENT_TIMESTAMP, file_size = ? WHERE id = ?`,
      [finalSize, uploadId]
    );

    // Save Object Metadata
    const metadata: StorageObjectMetadata = {
      id: uploadRecord.object_id,
      bucket,
      object_key: key,
      original_filename: uploadRecord.original_filename,
      content_type: uploadRecord.content_type,
      file_size: finalSize,
      sha256_hash: sha256,
      upload_time: new Date().toISOString(),
      uploaded_by: uploadedBy,
      storage_provider: isLocal ? 'local_emulator' : 'cloudflare_r2',
      storage_region: 'auto',
      visibility: 'private',
      download_count: 0
    };

    await dbRun(
      `INSERT INTO StorageObjects (id, bucket, object_key, original_filename, content_type, file_size, sha256_hash, upload_time, uploaded_by, storage_provider, storage_region, visibility, download_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        metadata.id,
        metadata.bucket,
        metadata.object_key,
        metadata.original_filename,
        metadata.content_type,
        metadata.file_size,
        metadata.sha256_hash,
        metadata.upload_time,
        metadata.uploaded_by,
        metadata.storage_provider,
        metadata.storage_region,
        metadata.visibility
      ]
    );

    await this.logAudit(
      uploadedBy,
      'Upload Completed',
      bucket,
      key,
      JSON.stringify({ uploadId, size: finalSize, sha256, isMultipart: true })
    );

    return metadata;
  }

  /**
   * Helper function to append to audit logs
   */
  static async logAudit(
    userId: string,
    action: string,
    bucket: string,
    key: string,
    details?: string
  ): Promise<void> {
    try {
      await dbRun(
        `INSERT INTO StorageAuditLogs (id, user_id, ip_address, device_info, timestamp, action, bucket, object_key, details)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
        [crypto.randomUUID(), userId || 'anonymous', '127.0.0.1', 'Node_Server_Process', action, bucket, key, details || null]
      );
    } catch (err) {
      console.error('Failed to log storage audit events:', err);
    }
  }

  /**
   * Automatically moves a validated temporary upload file to its correct production bucket
   */
  static async moveValidatedTempUpload(
    tempKey: string,
    destBucket: string,
    destKey: string,
    movedBy: string
  ): Promise<void> {
    console.log(`[StorageService] Automatically moving validated file from temporary bucket ${BUCKET_TEMP}/${tempKey} to production destination ${destBucket}/${destKey}`);
    try {
      await this.moveObject(BUCKET_TEMP, tempKey, destBucket, destKey, movedBy);
      await this.logAudit(movedBy, 'Temp Object Validated & Moved', destBucket, destKey, `Moved from ${BUCKET_TEMP}/${tempKey}`);
    } catch (err: any) {
      console.error(`❌ Failed to move validated temp object:`, err);
      await this.logAudit(movedBy, 'Temp Object Move Failed', destBucket, destKey, err.message);
      throw err;
    }
  }

  /**
   * Automatically scans and cleans expired temporary uploads older than 24 hours
   */
  static async cleanExpiredTempObjects(): Promise<void> {
    console.log('[StorageService] Scanning for expired temporary upload objects in queue...');
    try {
      const { client, isLocal } = getS3Client();
      
      // Select files in BUCKET_TEMP
      const objects = await this.listObjects(BUCKET_TEMP);
      const now = Date.now();
      const expirationAgeMs = 24 * 60 * 60 * 1000; // 24 Hours

      for (const obj of objects) {
        const fileAgeMs = now - new Date(obj.LastModified).getTime();
        if (fileAgeMs > expirationAgeMs) {
          console.log(`[StorageService] Cleaning expired temporary object: ${obj.Key} (Age: ${Math.round(fileAgeMs / 3600000)} hours)`);
          await this.deleteObject(BUCKET_TEMP, obj.Key, 'System Daemon');
        }
      }
    } catch (err) {
      console.error('❌ Failed to clean expired temporary objects:', err);
    }
  }

  /**
   * Starts background temporary file scavenger daemon running every 1 hour
   */
  static startScavengerDaemon(): void {
    console.log('⚡ Starting OMYRA Temporary Object Scavenger Daemon...');
    // Run once on boot
    this.cleanExpiredTempObjects().catch(() => {});
    // Scavenge every hour
    setInterval(() => {
      this.cleanExpiredTempObjects().catch(() => {});
    }, 60 * 60 * 1000);
  }
}
