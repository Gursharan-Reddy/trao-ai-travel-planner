import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js'; // Adjust this path if your DB initialization import differs

const router = express.Router();

// ==========================================================================
// Account Registration Endpoint Matrix (/api/auth/register)
// ==========================================================================
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  setError('');

  try {
    // 1. Check if the user record already exists in the Postgres profile matrix
    const userExistCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExistCheck.rows.length > 0) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    // 2. Encrypt the entry credentials bundle payload defensively
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Write data to the live transactional Supabase instance table rows
    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    // 4. Generate the production JWT pipeline auth token signature payload
    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email
      }
    });
  } catch (err) {
    console.error('🔥 Registration transaction fault sequence intercepted:', err.message);
    res.status(500).json({ message: 'Database writing failure during account validation.' });
  }
});

// ==========================================================================
// Account Authentication Sign In Endpoint (/api/auth/login)
// ==========================================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Inspect data tables for structural signature metrics match
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email address or access verification token credentials.' });
    }

    const user = userResult.rows[0];

    // 2. Compare encryption signatures against stored password hashes safely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email address or access verification token credentials.' });
    }

    // 3. Dispatch validated web authorization token layers stream parameters
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('🔥 Login authentication pipeline failure intercepted:', err.message);
    res.status(500).json({ message: 'Server side authentication transmission protocol failure.' });
  }
});

// CRITICAL EXPORT LINE: Standard ES Module default export block layout
export default router;