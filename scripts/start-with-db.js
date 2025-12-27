#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Initialize database
try {
  console.log('🚀 Initializing Railway PostgreSQL database...');
  execSync('npm run db:init', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Database initialized successfully!');
} catch (error) {
  console.log('⚠️ Database initialization failed, but continuing with app startup...');
  console.log('This might be normal if tables already exist or DATABASE_URL is not set yet.');
  console.log('The app will still start and create tables on first use.');
}

// Start Next.js
console.log('🚀 Starting Next.js server...');
execSync('next start', {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});