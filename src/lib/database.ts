import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Railway PostgreSQL connection
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!')
  console.error('Please add PostgreSQL database to your Railway project.')
  console.error('Railway Dashboard → Your Project → + Add → Database → PostgreSQL')
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// JWT secret for session tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

// Database table names
export const TABLES = {
  USERS: 'users',
  SURVEYS: 'surveys',
  OFFERS: 'offers',
  TRANSACTIONS: 'transactions',
  USER_EXP: 'user_exp',
  DAILY_CLAIMS: 'daily_claims'
}

// User authentication functions
export const auth = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  },

  async generateToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  },

  async verifyToken(token: string): Promise<any> {
    return jwt.verify(token, JWT_SECRET)
  }
}

// Database query helpers
export const db = {
  async query(text: string, params?: any[]) {
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  },

  async getUserByEmail(email: string) {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0]
  },

  async getUserById(id: string) {
    const result = await this.query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0]
  },

  async createUser(email: string, passwordHash: string, name: string) {
    const result = await this.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, name]
    )
    return result.rows[0]
  },

  // EXP-related functions
  async getUserExp(userId: string) {
    const result = await this.query(`
      SELECT total_exp, current_level, exp_to_next_level, last_exp_change_reason, last_updated
      FROM user_exp
      WHERE user_id = $1
    `, [userId]);
    return result.rows[0];
  },

  async createUserExp(userId: string) {
    const result = await this.query(`
      INSERT INTO user_exp (user_id, total_exp, current_level, exp_to_next_level)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `, [userId, 0, 1, 100]);
    return result.rows[0];
  },

  async updateUserExp(userId: string, expChange: number, reason: string) {
    // First ensure user has an EXP record
    await this.createUserExp(userId);

    // Get current EXP
    const currentExp = await this.getUserExp(userId);
    const newTotalExp = (currentExp?.total_exp || 0) + expChange;

    // Calculate new level (level = floor(total_exp / 100))
    const newLevel = Math.floor(newTotalExp / 100) + 1;
    const expToNextLevel = (newLevel * 100) - newTotalExp;

    // Update EXP record
    const result = await this.query(`
      UPDATE user_exp
      SET total_exp = $2,
          current_level = $3,
          exp_to_next_level = $4,
          last_exp_change_reason = $5,
          last_updated = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `, [userId, newTotalExp, newLevel, expToNextLevel, reason]);

    return result.rows[0];
  },

  async getUserExpWithFallback(userId: string) {
    let expData = await this.getUserExp(userId);
    if (!expData) {
      expData = await this.createUserExp(userId);
    }
    return expData;
  },

  // Daily claims functions
  async getTodaysClaim(userId: string) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const result = await this.query(`
      SELECT * FROM daily_claims
      WHERE user_id = $1 AND claim_date = $2
    `, [userId, today]);
    return result.rows[0];
  },

  async getClaimStreak(userId: string) {
    const result = await this.query(`
      SELECT COUNT(*) as streak
      FROM daily_claims
      WHERE user_id = $1
      AND claim_date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY claim_date DESC
    `, [userId]);
    return parseInt(result.rows[0].streak) || 0;
  },

  async recordDailyClaim(userId: string, expGranted: number) {
    const today = new Date().toISOString().split('T')[0];
    const result = await this.query(`
      INSERT INTO daily_claims (user_id, claim_date, exp_granted)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, claim_date) DO NOTHING
      RETURNING *
    `, [userId, today, expGranted]);
    return result.rows[0];
  }
}

export { pool }