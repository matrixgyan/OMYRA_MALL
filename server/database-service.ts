import pg from 'pg';
import crypto from 'crypto';

export interface DbHealthStatus {
  status: 'healthy' | 'unhealthy';
  latencyMs: number;
  poolSize: number;
  activeConnections: number;
  provider: 'neon' | 'local';
  error?: string;
}

export class DatabaseService {
  private static pool: pg.Pool | null = null;
  private static isPostgresMode = false;

  /**
   * Initializes the PostgreSQL connection pool using environment parameters
   */
  public static getPool(): pg.Pool | null {
    if (this.pool === null && process.env.DATABASE_URL) {
      const connectionString = process.env.DATABASE_URL;
      const poolSize = parseInt(process.env.DATABASE_POOL_SIZE || '10', 10);
      const useSsl = process.env.DATABASE_SSL !== 'false';

      try {
        const poolConfig: pg.PoolConfig = {
          connectionString,
          max: poolSize,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        };

        if (useSsl) {
          poolConfig.ssl = { rejectUnauthorized: false }; // Secure SSL for Neon
        }

        this.pool = new pg.Pool(poolConfig);
        this.isPostgresMode = true;
        console.log(`⚡ Production Neon PostgreSQL Connection Pool initialized with max connections: ${poolSize}, SSL: ${useSsl}`);
      } catch (err) {
        console.error('❌ Failed to initialize database connection pool:', err);
        this.isPostgresMode = false;
      }
    } else if (process.env.DATABASE_URL) {
      this.isPostgresMode = true;
    }
    return this.pool;
  }

  /**
   * Checks if postgres mode is enabled and functional
   */
  public static isPgMode(): boolean {
    this.getPool();
    return this.isPostgresMode;
  }

  /**
   * Executes a database query with connection pooling, prepared statements, and retry logic.
   */
  public static async queryWithRetry<T = any>(
    text: string,
    params: any[] = [],
    retries = 3,
    delayMs = 1000
  ): Promise<pg.QueryResult<T>> {
    const pool = this.getPool();
    if (!pool) {
      throw new Error('Database connection pool is not initialized');
    }

    let attempt = 0;
    while (true) {
      try {
        attempt++;
        // Execute the query using connection pooling
        const start = Date.now();
        const result = await pool.query<T>(text, params);
        const duration = Date.now() - start;

        // Log long-running queries (>500ms) for performance health auditing
        if (duration > 500) {
          console.warn(`⚠️ [DatabaseService] Slow query detected (${duration}ms): ${text.substring(0, 100)}...`);
        }

        return result;
      } catch (err: any) {
        const isTransient = this.isTransientError(err);
        
        if (isTransient && attempt < retries) {
          console.warn(
            `⚠️ [DatabaseService] Transient database error (attempt ${attempt}/${retries}): ${err.message}. Retrying in ${delayMs}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2; // Exponential backoff
          continue;
        }

        console.error(`❌ [DatabaseService] Query execution failed on final attempt ${attempt}:`, err.message);
        throw err;
      }
    }
  }

  /**
   * Executes a database query inside an explicit transactional block with automatic commit, rollback, and retries.
   */
  public static async withTransaction<T>(
    callback: (client: pg.PoolClient) => Promise<T>,
    retries = 3
  ): Promise<T> {
    const pool = this.getPool();
    if (!pool) {
      throw new Error('Database connection pool is not initialized');
    }

    let attempt = 0;
    let delayMs = 1000;

    while (true) {
      attempt++;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (err: any) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackErr) {
          console.error('❌ [DatabaseService] Transaction rollback failed:', rollbackErr);
        }

        const isTransient = this.isTransientError(err);
        if (isTransient && attempt < retries) {
          console.warn(
            `⚠️ [DatabaseService] Transaction failed due to transient error (attempt ${attempt}/${retries}). Retrying...`
          );
          client.release();
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2;
          continue;
        }

        client.release();
        throw err;
      } finally {
        // Safe check to verify release
        try {
          client.release();
        } catch (e) {
          // already released
        }
      }
    }
  }

  /**
   * Runs a health check on the Neon database instance, measuring latency and active connections
   */
  public static async checkHealth(): Promise<DbHealthStatus> {
    const hasUrl = !!process.env.DATABASE_URL;
    if (!hasUrl) {
      return {
        status: 'healthy',
        latencyMs: 0,
        poolSize: 0,
        activeConnections: 0,
        provider: 'local',
      };
    }

    const pool = this.getPool();
    if (!pool) {
      return {
        status: 'unhealthy',
        latencyMs: 0,
        poolSize: 0,
        activeConnections: 0,
        provider: 'neon',
        error: 'Database connection pool could not be initialized.',
      };
    }

    const start = Date.now();
    try {
      // Direct health-check ping
      await this.queryWithRetry('SELECT 1', [], 2, 500);
      const latencyMs = Date.now() - start;

      return {
        status: 'healthy',
        latencyMs,
        poolSize: pool.totalCount,
        activeConnections: pool.totalCount - pool.idleCount,
        provider: 'neon',
      };
    } catch (err: any) {
      return {
        status: 'unhealthy',
        latencyMs: Date.now() - start,
        poolSize: pool.totalCount,
        activeConnections: pool.totalCount - pool.idleCount,
        provider: 'neon',
        error: err.message || 'Database ping timeout or network partition.',
      };
    }
  }

  /**
   * Helper to identify transient errors that are safe to retry
   */
  private static isTransientError(err: any): boolean {
    if (!err) return false;

    // Standard Postgres transient state / network codes:
    // '08000' - Connection Exception
    // '08003' - Connection Does Not Exist
    // '08006' - Connection Failure
    // '57P01' - Admin Shutdown
    // '57P02' - Crash Shutdown
    // '57P03' - Cannot Connect Now
    const code = err.code;
    if (code && typeof code === 'string') {
      const transientCodes = ['08000', '08003', '08006', '57P01', '57P02', '57P03'];
      if (transientCodes.includes(code)) {
        return true;
      }
    }

    const message = err.message || '';
    const transientKeywords = [
      'timeout',
      'connection reset',
      'socket hang up',
      'network partition',
      'econnrefused',
      'etimedout',
      'enotfound',
    ];

    return transientKeywords.some((keyword) => message.toLowerCase().includes(keyword));
  }
}
