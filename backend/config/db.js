const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

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

module.exports = {
  query: (text, params) => pool.query(text, params),
};