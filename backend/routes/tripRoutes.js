import express from 'express';
import { db } from '../config/db.js';
import { GoogleGenAI } from '@google/genai';
import jwt from 'jsonwebtoken';

const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access authorization vector missing.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token verification authorization expired or invalid.' });
    req.user = user;
    next();
  });
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const trips = await db.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.status(200).json(trips.rows);
  } catch (err) {
    console.error('Retrieval pipeline error intercepted:', err.message);
    res.status(500).json({ message: 'Failed to extract itinerary entries history logs.' });
  }
});

router.post('/generate', authenticateToken, async (req, res) => {
  console.log("DEBUG: Running fully synchronized schema script version!");
  
  const { destination, days, budget, budget_tier, estimated_budget, interests } = req.body;
  const resolvedBudgetTier = budget || budget_tier || estimated_budget || 'Mid-Range Balanced';

  try {
    const interestsArray = Array.isArray(interests) 
      ? interests 
      : interests ? interests.split(',').map(i => i.trim()) : [];
      
    const interestsString = interestsArray.join(', ');
    
    const prompt = `Generate a comprehensive travel itinerary dataset for a trip to ${destination} lasting ${days} days with a total spending tier budget profile of ${resolvedBudgetTier}. The user profile is strictly interested in: ${interestsString}. Return the response strictly as valid, raw JSON object structure without markdown wrapping blocks. Matching structure format: { "destination": "${destination}", "duration": "${days} Days", "itinerary": [ { "day": 1, "title": "Day Title Description", "activities": ["Activity Detail 1", "Activity Detail 2"] } ], "hotels": [ { "name": "Recommended Hotel Name", "estimatedCost": "$XYZ per night" } ] }`;

    console.log('Dispatched request sequence to Gemini layout container...');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let textResponse = response.text || '';
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    let cleanGeneratedTextData;
    try {
      cleanGeneratedTextData = JSON.parse(textResponse);
    } catch (parseErr) {
      console.error('JSON parsing discrepancy from model stream:', textResponse);
      throw new Error('Gemini model signature did not render structurally correct JSON objects.');
    }

    console.log('Writing compiled itinerary payload down into Supabase rows...');
    
    const itineraryBlock = cleanGeneratedTextData.itinerary ? cleanGeneratedTextData.itinerary : [];
    const hotelsBlock = cleanGeneratedTextData.hotels ? cleanGeneratedTextData.hotels : [];
    
    const estimatedBudgetJson = { 
      total: resolvedBudgetTier, 
      breakdown: { accommodation: "Included", activities: "Included" } 
    };

    const packingListArray = [
      "Travel documents & Identification",
      `Appropriate gear for ${interestsString || 'sightseeing'}`,
      "Personal care items & Chargers"
    ];

    const newTripRecord = await db.query(
      `INSERT INTO trips (
        user_id, destination, duration_days, budget_tier, interests, 
        itinerary, hotels, estimated_budget, packing_list
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        req.user.id, 
        destination, 
        parseInt(days) || 3,
        resolvedBudgetTier,
        interestsArray,
        JSON.stringify(itineraryBlock),
        JSON.stringify(hotelsBlock),
        JSON.stringify(estimatedBudgetJson),
        JSON.stringify(packingListArray)
      ]
    );

    res.status(201).json(newTripRecord.rows[0]);
  } catch (err) {
    console.error('Generative itinerary execution flow failure details:', err.message);
    res.status(500).json({ message: `AI Processing exception encountered: ${err.message}` });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const tripId = req.params.id;
  try {
    console.log(`Intercepted delete request for Trip ID: ${tripId} by User ID: ${req.user.id}`);
    const deleteResult = await db.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING *',
      [tripId, req.user.id]
    );
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Itinerary trace entry not found or unauthorized.' });
    }
    console.log('Database row dropped successfully from Supabase storage arrays.');
    res.status(200).json({ message: 'Trip cancelled and removed successfully.' });
  } catch (err) {
    console.error('Error encountered during itinerary deletion sequence:', err.message);
    res.status(500).json({ message: `Failed to drop database record stream: ${err.message}` });
  }
});

export default router;