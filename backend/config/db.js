import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Supabase Connection Error:', err.message);
  } else {
    console.log('Supabase PostgreSQL Instance Authenticated and Connected Safely.');
  }
});

export const db = {
  query: (text, params) => pool.query(text, params),
};