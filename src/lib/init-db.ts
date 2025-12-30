import { db } from './database';

async function initializeDatabase() {
  try {
    console.log('Initializing Railway PostgreSQL database...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create surveys table
    await db.query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        questions JSONB,
        reward_amount DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create offers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reward_amount DECIMAL(10,2) DEFAULT 0,
        link VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        reference_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user balances table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_balances (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        available_balance DECIMAL(10,2) DEFAULT 0,
        pending_balance DECIMAL(10,2) DEFAULT 0,
        total_earned DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create CPX survey completions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cpx_survey_completions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cpx_user_id VARCHAR(255) NOT NULL,
        survey_id VARCHAR(255) NOT NULL,
        survey_title VARCHAR(500),
        payout_cents INTEGER NOT NULL,
        points_credited DECIMAL(10,2) NOT NULL,
        transaction_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'completed',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, survey_id)
      )
    `);

    // Create withdrawal requests table
    await db.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        details JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_exp table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_exp (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        total_exp INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        exp_to_next_level INTEGER DEFAULT 100,
        last_exp_change_reason VARCHAR(255),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes (these will not error if they already exist)
    try {
      await db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_cpx_completions_user_id ON cpx_survey_completions(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_cpx_completions_survey_id ON cpx_survey_completions(survey_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_user_exp_user_id ON user_exp(user_id)`);
    } catch (indexError) {
      console.log('⚠️ Some indexes may already exist, continuing...');
    }

    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.log('This might happen if tables already exist or DATABASE_URL is not set.');
    console.log('The app will continue starting...');
    // Don't exit with error - let the app start anyway
  }
}

// Run if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };