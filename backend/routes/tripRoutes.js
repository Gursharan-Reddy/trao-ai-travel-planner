import express from 'express';
import { db } from '../config/db.js';
import { GoogleGenAI } from '@google/genai'; // Utilizing live 2026 version @google/genai syntax bindings 

const router = express.Router();

// Initialize the live Google Gemini developer dashboard orchestration layer instance 
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware function verifying security auth context headers explicitly
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access authorization vector missing.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token token verification authorization expired or invalid.' });
    req.user = user;
    next();
  });
};

// ==========================================================================
// Fetch Saved User Travel Plans Itineraries (/api/trips)
// ==========================================================================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const trips = await db.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.status(200).json(trips.rows);
  } catch (err) {
    console.error('🔥 Retrieval pipeline error intercepted:', err.message);
    res.status(500).json({ message: 'Failed to extract itinerary entries history logs.' });
  }
});

// ==========================================================================
// Generate and Save New Travel Itinerary AI Stream (/api/trips/generate)
// ==========================================================================
router.post('/generate', authenticateToken, async (req, res) => {
  const { destination, days, budget, interests } = req.body;

  try {
    // 1. Invoke the structural prompt formatting constraints schema mapping rules
    const prompt = `Generate a comprehensive travel itinerary dataset for a trip to ${destination} lasting ${days} days with a total spending tier budget profile of ${budget}. The user profile is strictly interested in: ${interests.join(', ')}. Return the raw response exclusively as clean, valid JSON matching this layout structure: { "destination": "${destination}", "duration": "${days} Days", "itinerary": [ { "day": 1, "title": "Day Title Description", "activities": ["Activity Detail 1", "Activity Detail 2"] } ], "hotels": [ { "name": "Recommended Hotel Name", "estimatedCost": "$XYZ per night" } ] }`;

    // 2. Fetch the target engine completion layers using model frameworks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const cleanGeneratedTextData = JSON.parse(response.text);

    // 3. Commit this verified payload object straight into your Supabase database instance tables rows
    const newTripRecord = await db.query(
      'INSERT INTO trips (user_id, destination, duration, budget, interests, data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, destination, `${days} Days`, budget, JSON.stringify(interests), JSON.stringify(cleanGeneratedTextData)]
    );

    res.status(201).json(newTripRecord.rows[0]);
  } catch (err) {
    console.error('🔥 Generative itinerary execution flow failure:', err.message);
    res.status(500).json({ message: 'Failed to process AI travel planner parameter data engines.' });
  }
});

// CRITICAL EXPORT LINE: Standard ES Module default export block layout
export default router;