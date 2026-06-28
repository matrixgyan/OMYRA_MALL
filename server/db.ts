import path from 'path';
import fs from 'fs';
import pg from 'pg';

const DB_FILE = path.join(process.cwd(), 'storage_metadata.json');

// Interface for local/memory JSON storage schema fallback
interface Schema {
  StorageBuckets: any[];
  StorageObjects: any[];
  StorageUploads: any[];
  StorageDownloads: any[];
  StorageAuditLogs: any[];
  StoragePolicies: any[];
  Users: any[];
  Profiles: any[];
  Sellers: any[];
  Products: any[];
  Orders: any[];
  OrderItems: any[];
  Reviews: any[];
  EmailJobs: any[];
  EmailTemplates: any[];
  EmailLogs: any[];
  EmailEvents: any[];
  DeliveryAttempts: any[];
}

// Global in-memory DB state for local mode
let dbData: Schema = {
  StorageBuckets: [],
  StorageObjects: [],
  StorageUploads: [],
  StorageDownloads: [],
  StorageAuditLogs: [],
  StoragePolicies: [],
  Users: [],
  Profiles: [],
  Sellers: [],
  Products: [],
  Orders: [],
  OrderItems: [],
  Reviews: [],
  EmailJobs: [],
  EmailTemplates: [],
  EmailLogs: [],
  EmailEvents: [],
  DeliveryAttempts: [],
};

import { DatabaseService } from './database-service.js';

// Lazy loaded PG Pool via DatabaseService
export let isPostgresMode = false;

export function getPgPool(): pg.Pool | null {
  const pool = DatabaseService.getPool();
  isPostgresMode = DatabaseService.isPgMode();
  return pool;
}

// Safe atomic file write helper for JSON mode
function saveToDisk() {
  try {
    const tempPath = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(dbData, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE);
  } catch (err) {
    console.error('❌ Failed to persist local JSON database to disk:', err);
  }
}

// Load data from disk if exists
function loadFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      dbData = {
        StorageBuckets: loaded.StorageBuckets || [],
        StorageObjects: loaded.StorageObjects || [],
        StorageUploads: loaded.StorageUploads || [],
        StorageDownloads: loaded.StorageDownloads || [],
        StorageAuditLogs: loaded.StorageAuditLogs || [],
        StoragePolicies: loaded.StoragePolicies || [],
        Users: loaded.Users || [],
        Profiles: loaded.Profiles || [],
        Sellers: loaded.Sellers || [],
        Products: loaded.Products || [],
        Orders: loaded.Orders || [],
        OrderItems: loaded.OrderItems || [],
        Reviews: loaded.Reviews || [],
        EmailJobs: loaded.EmailJobs || [],
        EmailTemplates: loaded.EmailTemplates || [],
        EmailLogs: loaded.EmailLogs || [],
        EmailEvents: loaded.EmailEvents || [],
        DeliveryAttempts: loaded.DeliveryAttempts || [],
      };
      console.log('⚡ Local database loaded successfully from storage_metadata.json');
    }
  } catch (err) {
    console.error('⚠️ Could not load database from disk. Resetting local storage metadata:', err);
  }
}

/**
 * Converts standard SQLite style query placeholders '?' to PG style '$1', '$2'
 */
function convertSqlToPostgres(sql: string): string {
  let pgSql = sql.replace(/\s+/g, ' ').trim();

  // Convert INSERT OR IGNORE INTO StorageBuckets
  if (pgSql.includes('INSERT OR IGNORE INTO StorageBuckets')) {
    pgSql = pgSql.replace('INSERT OR IGNORE INTO StorageBuckets', 'INSERT INTO StorageBuckets');
    pgSql += ' ON CONFLICT (name) DO NOTHING';
  }

  // Convert SQLite specific CURRENT_TIMESTAMP overrides or syntax if needed.
  // Standard CURRENT_TIMESTAMP is supported in PostgreSQL directly.
  
  // Replace ? with $1, $2, $3...
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

  return pgSql;
}

/**
 * Initializes all the database tables in Postgres or memory and seeds default buckets.
 */
export async function initializeDatabase() {
  console.log('Initializing OMYRA Transactional Database Layer...');
  
  const pgPool = getPgPool();

  if (isPostgresMode && pgPool) {
    console.log('⚡ Initializing tables on Neon PostgreSQL cloud platform...');
    try {
      const client = await pgPool.connect();
      try {
        // Run full transactional migration script
        await client.query('BEGIN');

        // Storage tables
        await client.query(`
          CREATE TABLE IF NOT EXISTS StorageBuckets (
            name VARCHAR(255) PRIMARY KEY,
            provider VARCHAR(50) NOT NULL,
            region VARCHAR(50) NOT NULL,
            visibility VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS StorageObjects (
            id UUID PRIMARY KEY,
            bucket VARCHAR(255) NOT NULL,
            object_key TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            content_type VARCHAR(100) NOT NULL,
            file_size BIGINT NOT NULL,
            sha256_hash VARCHAR(64) NOT NULL,
            upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            uploaded_by VARCHAR(255) NOT NULL,
            storage_provider VARCHAR(50) NOT NULL,
            storage_region VARCHAR(50) NOT NULL,
            visibility VARCHAR(20) NOT NULL,
            download_count INTEGER DEFAULT 0
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS StorageUploads (
            id UUID PRIMARY KEY,
            object_id UUID NOT NULL,
            bucket VARCHAR(255) NOT NULL,
            object_key TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            content_type VARCHAR(100) NOT NULL,
            file_size BIGINT DEFAULT 0,
            status VARCHAR(50) NOT NULL,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            uploaded_by VARCHAR(255) NOT NULL,
            chunks_count INTEGER DEFAULT 1,
            uploaded_chunks_count INTEGER DEFAULT 0,
            upload_type VARCHAR(50) NOT NULL
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS StorageDownloads (
            id UUID PRIMARY KEY,
            object_id UUID NOT NULL,
            downloaded_by VARCHAR(255) NOT NULL,
            downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address VARCHAR(45) NOT NULL,
            user_agent TEXT NOT NULL,
            status VARCHAR(50) NOT NULL
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS StorageAuditLogs (
            id UUID PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            device_info TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            action VARCHAR(100) NOT NULL,
            bucket VARCHAR(255) NOT NULL,
            object_key TEXT NOT NULL,
            details TEXT
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS StoragePolicies (
            id UUID PRIMARY KEY,
            bucket VARCHAR(255) NOT NULL,
            principal TEXT NOT NULL,
            action VARCHAR(50) NOT NULL,
            effect VARCHAR(20) NOT NULL,
            conditions TEXT
          )
        `);

        // Marketplace transactional tables
        await client.query(`
          CREATE TABLE IF NOT EXISTS Users (
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS Profiles (
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
            display_name VARCHAR(255),
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS Sellers (
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
            store_name VARCHAR(255) UNIQUE NOT NULL,
            description TEXT,
            banner_url TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS Products (
            id UUID PRIMARY KEY,
            seller_id UUID REFERENCES Sellers(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price NUMERIC(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            download_url TEXT,
            preview_image_url TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS Orders (
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES Users(id) ON DELETE SET NULL,
            total_amount NUMERIC(10, 2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS OrderItems (
            id UUID PRIMARY KEY,
            order_id UUID REFERENCES Orders(id) ON DELETE CASCADE,
            product_id UUID REFERENCES Products(id) ON DELETE SET NULL,
            price NUMERIC(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS Reviews (
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
            product_id UUID REFERENCES Products(id) ON DELETE CASCADE,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Resend Email queue metadata tables
        await client.query(`
          CREATE TABLE IF NOT EXISTS EmailTemplates (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            html_content TEXT NOT NULL,
            text_content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS EmailJobs (
            id UUID PRIMARY KEY,
            recipient VARCHAR(255) NOT NULL,
            sender VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            template_id VARCHAR(100) REFERENCES EmailTemplates(id) ON DELETE SET NULL,
            variables TEXT NOT NULL, -- JSON string
            status VARCHAR(50) NOT NULL, -- pending, processing, sent, failed, dead_letter
            priority INTEGER DEFAULT 0,
            attempts INTEGER DEFAULT 0,
            next_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS EmailLogs (
            id UUID PRIMARY KEY,
            job_id UUID REFERENCES EmailJobs(id) ON DELETE SET NULL,
            sender VARCHAR(255) NOT NULL,
            recipient VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            body TEXT,
            error_message TEXT
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS EmailEvents (
            id UUID PRIMARY KEY,
            log_id UUID REFERENCES EmailLogs(id) ON DELETE CASCADE,
            event_type VARCHAR(100) NOT NULL, -- delivered, bounced, opened, clicked
            payload TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS DeliveryAttempts (
            id UUID PRIMARY KEY,
            job_id UUID REFERENCES EmailJobs(id) ON DELETE CASCADE,
            attempt_number INTEGER NOT NULL,
            status VARCHAR(50) NOT NULL,
            error_message TEXT,
            attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Index optimizations for production queries
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_email_jobs_status_priority_created_at 
          ON EmailJobs (status, priority DESC, created_at ASC)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_storage_objects_hash_bucket 
          ON StorageObjects (sha256_hash, bucket)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_key 
          ON StorageObjects (bucket, object_key)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_storage_policies_bucket_principal 
          ON StoragePolicies (bucket, principal)
        `);
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_storage_audit_logs_action_timestamp 
          ON StorageAuditLogs (action, timestamp DESC)
        `);

        // Seed default buckets in Postgres
        const defaultBuckets = [
          { name: 'omyra-market-downloads', provider: 'r2', region: 'auto', visibility: 'private' },
          { name: 'omyra-market-assets', provider: 'r2', region: 'auto', visibility: 'public' },
          { name: 'omyra-user-content', provider: 'r2', region: 'auto', visibility: 'public' },
          { name: 'omyra-temp-uploads', provider: 'r2', region: 'auto', visibility: 'private' }
        ];

        for (const b of defaultBuckets) {
          await client.query(
            `INSERT INTO StorageBuckets (name, provider, region, visibility) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (name) DO NOTHING`,
            [b.name, b.provider, b.region, b.visibility]
          );
        }

        await client.query('COMMIT');
        console.log('⚡ Neon PostgreSQL Cloud database tables initialized and verified successfully.');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('❌ Failed to run migrations on Neon database, using JSON fallback:', err);
      isPostgresMode = false;
      loadFromDisk();
    }
  } else {
    // Run local JSON fallback initialization
    loadFromDisk();

    // Seed default buckets in local mode
    const defaultBuckets = [
      { name: 'omyra-market-downloads', provider: 'r2', region: 'auto', visibility: 'private', created_at: new Date().toISOString() },
      { name: 'omyra-market-assets', provider: 'r2', region: 'auto', visibility: 'public', created_at: new Date().toISOString() },
      { name: 'omyra-user-content', provider: 'r2', region: 'auto', visibility: 'public', created_at: new Date().toISOString() },
      { name: 'omyra-temp-uploads', provider: 'r2', region: 'auto', visibility: 'private', created_at: new Date().toISOString() }
    ];

    for (const b of defaultBuckets) {
      const exists = dbData.StorageBuckets.some((existing) => existing.name === b.name);
      if (!exists) {
        dbData.StorageBuckets.push(b);
      }
    }

    saveToDisk();
    console.log('OMYRA JSON Transactional Database initialized successfully in developer preview mode.');
  }
}

/**
 * Emulates / executes db.run() command
 */
export async function dbRun(sql: string, params: any[] = []): Promise<void> {
  const pgPool = getPgPool();
  if (isPostgresMode && pgPool) {
    const pgSql = convertSqlToPostgres(sql);
    try {
      await DatabaseService.queryWithRetry(pgSql, params);
    } catch (err) {
      console.error(`❌ Neon PG dbRun failure executing query: ${pgSql}`, err);
      throw err;
    }
    return;
  }

  // JSON Falling back
  const query = sql.replace(/\s+/g, ' ').trim();

  // CREATE TABLE or CREATE INDEX IF NOT EXISTS (No-op)
  if (query.toUpperCase().startsWith('CREATE TABLE') || query.toUpperCase().startsWith('CREATE INDEX')) {
    return;
  }

  // INSERT OR IGNORE INTO StorageBuckets
  if (query.includes('INSERT OR IGNORE INTO StorageBuckets')) {
    const [name, provider, region, visibility] = params;
    const exists = dbData.StorageBuckets.some((b) => b.name === name);
    if (!exists) {
      dbData.StorageBuckets.push({
        name,
        provider,
        region,
        visibility,
        created_at: new Date().toISOString()
      });
      saveToDisk();
    }
    return;
  }

  // INSERT INTO StorageObjects
  if (query.includes('INSERT INTO StorageObjects')) {
    if (params.length === 13) {
      const [id, bucket, object_key, original_filename, content_type, file_size, sha256_hash, upload_time, uploaded_by, storage_provider, storage_region, visibility, download_count] = params;
      dbData.StorageObjects.push({
        id,
        bucket,
        object_key,
        original_filename,
        content_type,
        file_size,
        sha256_hash,
        upload_time: upload_time || new Date().toISOString(),
        uploaded_by,
        storage_provider,
        storage_region,
        visibility,
        download_count: download_count || 0
      });
    } else {
      const [id, bucket, object_key, original_filename, content_type, file_size, sha256_hash, uploaded_by, storage_provider, storage_region, visibility] = params;
      dbData.StorageObjects.push({
        id,
        bucket,
        object_key,
        original_filename,
        content_type,
        file_size,
        sha256_hash,
        upload_time: new Date().toISOString(),
        uploaded_by,
        storage_provider,
        storage_region,
        visibility,
        download_count: 0
      });
    }
    saveToDisk();
    return;
  }

  // UPDATE StorageUploads SET uploaded_chunks_count = uploaded_chunks_count + 1 WHERE id = ?
  if (query.includes('UPDATE StorageUploads SET uploaded_chunks_count = uploaded_chunks_count + 1')) {
    const [id] = params;
    const upload = dbData.StorageUploads.find((u) => u.id === id);
    if (upload) {
      upload.uploaded_chunks_count = (upload.uploaded_chunks_count || 0) + 1;
      saveToDisk();
    }
    return;
  }

  // UPDATE StorageUploads SET status = 'completed', completed_at = CURRENT_TIMESTAMP, file_size = ? WHERE id = ?
  if (query.includes("status = 'completed'")) {
    const [file_size, id] = params;
    const upload = dbData.StorageUploads.find((u) => u.id === id);
    if (upload) {
      upload.status = 'completed';
      upload.completed_at = new Date().toISOString();
      upload.file_size = file_size;
      saveToDisk();
    }
    return;
  }

  // UPDATE StorageObjects SET download_count = download_count + 1 WHERE id = ?
  if (query.includes('UPDATE StorageObjects SET download_count = download_count + 1')) {
    const [id] = params;
    const obj = dbData.StorageObjects.find((o) => o.id === id);
    if (obj) {
      obj.download_count = (obj.download_count || 0) + 1;
      saveToDisk();
    }
    return;
  }

  // DELETE FROM StorageObjects WHERE bucket = ? AND object_key = ?
  if (query.includes('DELETE FROM StorageObjects WHERE bucket = ? AND object_key = ?')) {
    const [bucket, key] = params;
    dbData.StorageObjects = dbData.StorageObjects.filter((o) => !(o.bucket === bucket && o.object_key === key));
    saveToDisk();
    return;
  }

  // DELETE FROM StoragePolicies WHERE principal = ?
  if (query.includes('DELETE FROM StoragePolicies WHERE principal = ?')) {
    const [principal] = params;
    dbData.StoragePolicies = dbData.StoragePolicies.filter((p) => p.principal !== principal);
    saveToDisk();
    return;
  }

  // INSERT INTO StorageUploads
  if (query.includes('INSERT INTO StorageUploads')) {
    const [id, object_id, bucket, object_key, original_filename, content_type, file_size, status, uploaded_by, upload_type] = params;
    dbData.StorageUploads.push({
      id,
      object_id,
      bucket,
      object_key,
      original_filename,
      content_type,
      file_size,
      status,
      started_at: new Date().toISOString(),
      completed_at: null,
      uploaded_by,
      chunks_count: 1,
      uploaded_chunks_count: 0,
      upload_type
    });
    saveToDisk();
    return;
  }

  // INSERT INTO StorageDownloads
  if (query.includes('INSERT INTO StorageDownloads')) {
    const [id, object_id, downloaded_by, ip_address, user_agent, status] = params;
    dbData.StorageDownloads.push({
      id,
      object_id,
      downloaded_by,
      downloaded_at: new Date().toISOString(),
      ip_address,
      user_agent,
      status
    });
    saveToDisk();
    return;
  }

  // INSERT INTO StorageAuditLogs
  if (query.includes('INSERT INTO StorageAuditLogs')) {
    const [id, user_id, ip_address, device_info, action, bucket, object_key, details] = params;
    dbData.StorageAuditLogs.push({
      id,
      user_id,
      ip_address,
      device_info,
      timestamp: new Date().toISOString(),
      action,
      bucket,
      object_key,
      details
    });
    saveToDisk();
    return;
  }

  // INSERT INTO StoragePolicies
  if (query.includes('INSERT INTO StoragePolicies')) {
    const [id, bucket, principal, action, effect, conditions] = params;
    dbData.StoragePolicies.push({
      id,
      bucket,
      principal,
      action,
      effect,
      conditions
    });
    saveToDisk();
    return;
  }

  // INSERT INTO EmailTemplates
  if (query.includes('INSERT INTO EmailTemplates')) {
    const [id, name, subject, html_content, text_content] = params;
    const exists = dbData.EmailTemplates.some((t) => t.id === id);
    if (!exists) {
      dbData.EmailTemplates.push({
        id,
        name,
        subject,
        html_content,
        text_content
      });
      saveToDisk();
    }
    return;
  }

  // INSERT INTO EmailJobs
  if (query.includes('INSERT INTO EmailJobs')) {
    const [id, recipient, sender, subject, template_id, variables, priority] = params;
    dbData.EmailJobs.push({
      id,
      recipient,
      sender,
      subject,
      template_id,
      variables,
      status: 'pending',
      priority: priority || 0,
      attempts: 0,
      next_attempt_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
    saveToDisk();
    return;
  }

  // UPDATE EmailJobs SET status = 'processing', attempts = ? WHERE id = ?
  if (query.includes("UPDATE EmailJobs SET status = 'processing', attempts = ?")) {
    const [attempts, id] = params;
    const job = dbData.EmailJobs.find((j) => j.id === id);
    if (job) {
      job.status = 'processing';
      job.attempts = attempts;
      saveToDisk();
    }
    return;
  }

  // UPDATE EmailJobs SET status = 'sent' WHERE id = ?
  if (query.includes("UPDATE EmailJobs SET status = 'sent'")) {
    const [id] = params;
    const job = dbData.EmailJobs.find((j) => j.id === id);
    if (job) {
      job.status = 'sent';
      saveToDisk();
    }
    return;
  }

  // UPDATE EmailJobs SET status = 'dead_letter' WHERE id = ?
  if (query.includes("UPDATE EmailJobs SET status = 'dead_letter'")) {
    const [id] = params;
    const job = dbData.EmailJobs.find((j) => j.id === id);
    if (job) {
      job.status = 'dead_letter';
      saveToDisk();
    }
    return;
  }

  // UPDATE EmailJobs SET status = 'pending', attempts = ?, next_attempt_at = ? WHERE id = ?
  if (query.includes("UPDATE EmailJobs SET status = 'pending', attempts = ?")) {
    const [attempts, next_attempt_at, id] = params;
    const job = dbData.EmailJobs.find((j) => j.id === id);
    if (job) {
      job.status = 'pending';
      job.attempts = attempts;
      job.next_attempt_at = next_attempt_at;
      saveToDisk();
    }
    return;
  }

  // INSERT INTO EmailLogs
  if (query.includes('INSERT INTO EmailLogs')) {
    if (query.includes("'dead_letter'")) {
      const [id, job_id, sender, recipient, subject, body, error_message] = params;
      dbData.EmailLogs.push({
        id,
        job_id,
        sender,
        recipient,
        subject,
        status: 'dead_letter',
        sent_at: new Date().toISOString(),
        body,
        error_message
      });
    } else {
      const [id, job_id, sender, recipient, subject, body] = params;
      dbData.EmailLogs.push({
        id,
        job_id,
        sender,
        recipient,
        subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
        body,
        error_message: null
      });
    }
    saveToDisk();
    return;
  }

  // INSERT INTO DeliveryAttempts
  if (query.includes('INSERT INTO DeliveryAttempts')) {
    if (query.includes("'success'")) {
      const [id, job_id, attempt_number] = params;
      dbData.DeliveryAttempts.push({
        id,
        job_id,
        attempt_number,
        status: 'success',
        error_message: null,
        attempted_at: new Date().toISOString()
      });
    } else {
      const [id, job_id, attempt_number, error_message] = params;
      dbData.DeliveryAttempts.push({
        id,
        job_id,
        attempt_number,
        status: 'failed',
        error_message,
        attempted_at: new Date().toISOString()
      });
    }
    saveToDisk();
    return;
  }

  // INSERT INTO EmailEvents
  if (query.includes('INSERT INTO EmailEvents')) {
    const [id, log_id, payload] = params;
    dbData.EmailEvents.push({
      id,
      log_id,
      event_type: 'delivered',
      payload,
      created_at: new Date().toISOString()
    });
    saveToDisk();
    return;
  }

  // Dynamic inserts or updates for other tables in local mode
  const tables = [
    'Users', 'Profiles', 'Sellers', 'Products', 'Orders', 'OrderItems', 'Reviews',
    'EmailTemplates', 'EmailJobs', 'EmailLogs', 'EmailEvents', 'DeliveryAttempts'
  ];

  for (const table of tables) {
    if (query.includes(`INSERT INTO ${table}`)) {
      // Match general columns and push
      const record: Record<string, any> = {};
      // For general purposes we store array of params
      record._id = params[0] || crypto.randomUUID();
      record.params = params;
      (dbData as any)[table].push(record);
      saveToDisk();
      return;
    }
  }

  console.warn('⚠️ dbRun Query was not matched in local fallback:', query);
}

/**
 * Emulates / executes db.get() command
 */
export async function dbGet(sql: string, params: any[] = []): Promise<any | null> {
  const pgPool = getPgPool();
  if (isPostgresMode && pgPool) {
    const pgSql = convertSqlToPostgres(sql);
    try {
      const res = await DatabaseService.queryWithRetry(pgSql, params);
      return res.rows[0] || null;
    } catch (err) {
      console.error(`❌ Neon PG dbGet failure executing query: ${pgSql}`, err);
      throw err;
    }
  }

  // JSON falling back
  const query = sql.replace(/\s+/g, ' ').trim();

  // SELECT * FROM StorageObjects WHERE sha256_hash = ? AND bucket = ? LIMIT 1
  if (query.includes('SELECT * FROM StorageObjects WHERE sha256_hash = ? AND bucket = ?')) {
    const [sha256, bucket] = params;
    const match = dbData.StorageObjects.find((o) => o.sha256_hash === sha256 && o.bucket === bucket);
    return match || null;
  }

  // SELECT * FROM StorageObjects WHERE bucket = ? AND object_key = ?
  if (query.includes('SELECT * FROM StorageObjects WHERE bucket = ? AND object_key = ?')) {
    const [bucket, key] = params;
    const match = dbData.StorageObjects.find((o) => o.bucket === bucket && o.object_key === key);
    return match || null;
  }

  // SELECT * FROM StorageUploads WHERE id = ?
  if (query.includes('SELECT * FROM StorageUploads WHERE id = ?')) {
    const [id] = params;
    const match = dbData.StorageUploads.find((u) => u.id === id);
    return match || null;
  }

  // SELECT * FROM StoragePolicies WHERE bucket = ? AND principal = ?
  if (query.includes('SELECT * FROM StoragePolicies WHERE bucket = ? AND principal = ?')) {
    const [bucket, principal] = params;
    const match = dbData.StoragePolicies.find((p) => p.bucket === bucket && p.principal === principal);
    return match || null;
  }

  // SELECT COUNT(*) as count FROM StorageDownloads
  if (query.includes('SELECT COUNT(*) as count FROM StorageDownloads')) {
    return { count: dbData.StorageDownloads.length };
  }

  // SELECT SUM(file_size) as totalSize, COUNT(*) as totalObjects FROM StorageObjects
  if (query.includes('SUM(file_size) as totalSize')) {
    const totalSize = dbData.StorageObjects.reduce((acc, o) => acc + (Number(o.file_size) || 0), 0);
    return {
      totalSize,
      totalObjects: dbData.StorageObjects.length
    };
  }

  // SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'sent'
  if (query.includes("SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'sent'")) {
    const count = dbData.EmailJobs.filter((j) => j.status === 'sent').length;
    return { count };
  }

  // SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'pending' OR status = 'processing'
  if (query.includes("SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'pending' OR status = 'processing'")) {
    const count = dbData.EmailJobs.filter((j) => j.status === 'pending' || j.status === 'processing').length;
    return { count };
  }

  // SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'failed' OR status = 'dead_letter'
  if (query.includes("SELECT COUNT(*) as count FROM EmailJobs WHERE status = 'failed' OR status = 'dead_letter'")) {
    const count = dbData.EmailJobs.filter((j) => j.status === 'failed' || j.status === 'dead_letter').length;
    return { count };
  }

  // SELECT COUNT(*) as count FROM EmailJobs
  if (query.includes("SELECT COUNT(*) as count FROM EmailJobs")) {
    const count = dbData.EmailJobs.length;
    return { count };
  }

  console.warn('⚠️ dbGet Query was not matched in local fallback:', query);
  return null;
}

/**
 * Emulates / executes db.all() command
 */
export async function dbAll(sql: string, params: any[] = []): Promise<any[]> {
  const pgPool = getPgPool();
  if (isPostgresMode && pgPool) {
    const pgSql = convertSqlToPostgres(sql);
    try {
      const res = await DatabaseService.queryWithRetry(pgSql, params);
      return res.rows;
    } catch (err) {
      console.error(`❌ Neon PG dbAll failure executing query: ${pgSql}`, err);
      throw err;
    }
  }

  // JSON falling back
  const query = sql.replace(/\s+/g, ' ').trim();

  // SELECT bucket, SUM(file_size) as size, COUNT(*) as count FROM StorageObjects GROUP BY bucket
  if (query.includes('GROUP BY bucket')) {
    const buckets: Record<string, { size: number; count: number }> = {};
    
    // Seed configured buckets so they always display
    const defaultBuckets = ['omyra-assets', 'omyra-downloads', 'omyra-user-avatars', 'omyra-temp'];
    defaultBuckets.forEach((b) => {
      buckets[b] = { size: 0, count: 0 };
    });

    dbData.StorageObjects.forEach((o) => {
      if (!buckets[o.bucket]) {
        buckets[o.bucket] = { size: 0, count: 0 };
      }
      buckets[o.bucket].size += Number(o.file_size) || 0;
      buckets[o.bucket].count += 1;
    });

    return Object.entries(buckets).map(([bucket, val]) => ({
      bucket,
      size: val.size,
      count: val.count
    }));
  }

  // SELECT * FROM StorageObjects ORDER BY upload_time DESC LIMIT 10
  if (query.includes('SELECT * FROM StorageObjects ORDER BY upload_time DESC')) {
    const sorted = [...dbData.StorageObjects].sort((a, b) => {
      return new Date(b.upload_time).getTime() - new Date(a.upload_time).getTime();
    });
    return sorted.slice(0, 10);
  }

  // SELECT * FROM StorageAuditLogs WHERE action = 'Security Block' ORDER BY timestamp DESC LIMIT 10
  if (query.includes("action = 'Security Block'")) {
    const filtered = dbData.StorageAuditLogs.filter((l) => l.action === 'Security Block');
    const sorted = filtered.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return sorted.slice(0, 10);
  }

  // JOIN Query: SELECT d.*, o.original_filename, o.bucket, o.object_key FROM StorageDownloads d JOIN StorageObjects o ON d.object_id = o.id ORDER BY d.downloaded_at DESC LIMIT 10
  if (query.includes('StorageDownloads d JOIN StorageObjects o')) {
    const joined = dbData.StorageDownloads.map((d) => {
      const obj = dbData.StorageObjects.find((o) => o.id === d.object_id);
      return {
        ...d,
        original_filename: obj ? obj.original_filename : 'unknown_file',
        bucket: obj ? obj.bucket : 'omyra-downloads',
        object_key: obj ? obj.object_key : 'unknown_key'
      };
    });
    const sorted = joined.sort((a, b) => {
      return new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime();
    });
    return sorted.slice(0, 10);
  }

  // SELECT * FROM EmailJobs WHERE status = 'pending' OR status = 'failed' ORDER BY priority DESC, created_at ASC LIMIT 5
  if (query.includes("SELECT * FROM EmailJobs WHERE status = 'pending' OR status = 'failed'")) {
    const pendingAndFailed = dbData.EmailJobs.filter((j) => j.status === 'pending' || j.status === 'failed');
    const sorted = pendingAndFailed.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    return sorted.slice(0, 5);
  }

  // SELECT * FROM EmailLogs ORDER BY sent_at DESC LIMIT 10
  if (query.includes("SELECT * FROM EmailLogs ORDER BY sent_at DESC")) {
    const sorted = [...dbData.EmailLogs].sort((a, b) => {
      return new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime();
    });
    return sorted.slice(0, 10);
  }

  console.warn('⚠️ dbAll Query was not matched in local fallback:', query);
  return [];
}
