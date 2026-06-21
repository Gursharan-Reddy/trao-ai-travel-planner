import pg from 'pg';
import dotenv from 'dotenv';

// Initialize configuration environment parameters
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Force an immediate test connection query on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Supabase Connection Error:', err.message);
  } else {
    console.log('Supabase PostgreSQL Instance Authenticated and Connected Safely.');
  }
});

// Explicit named export wrapper matching your routes' `import { db }` statements
export const db = {
  query: (text, params) => pool.query(text, params),
};