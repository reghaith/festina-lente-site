import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Railway PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// JWT secret for session tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key'

// Database table names
export const TABLES = {
  USERS: 'users',
  SURVEYS: 'surveys',
  OFFERS: 'offers',
  TRANSACTIONS: 'transactions'
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
  }
}

export { pool }