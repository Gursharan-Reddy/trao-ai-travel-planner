const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.use(authMiddleware);

/**
 * @route   GET /api/trips
 * @desc    
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ message: 'Server database read exception.' });
  }
});

/**
 * @route   POST /api/trips/generate
 * @desc    
 */
router.post('/generate', async (req, res) => {
  const { destination, durationDays, budgetTier, interests } = req.body;
  const userId = req.user.id;

  try {
    const prompt = `Create a highly tailored travel plan itinerary for a trip to ${destination}.
    Duration: ${durationDays} days.
    Budget Profile Tier: ${budgetTier}.
    Core Focus Interests: ${interests.join(', ')}.
    Provide exactly ${durationDays} days in the schedule plan section, mapping realistic activities matching their interests.
    Provide a list of 2-3 curated hotel accommodations that match the ${budgetTier} tier.
    Provide a realistic breakdown estimating total costs and a custom packing checklist.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: {
              type: Type.ARRAY,
              description: "Day by day schedule plan breakdown.",
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  activities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["dayNumber", "activities"]
              }
            },
            hotels: {
              type: Type.ARRAY,
              description: "Curated hotel accommodation suggestions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  budget: { type: Type.STRING, description: "Budget description context relative to target constraints." }
                },
                required: ["name", "budget"]
              }
            },
            estimatedBudget: {
              type: Type.OBJECT,
              description: "Cost estimation details.",
              properties: {
                estimatedTotal: { type: Type.STRING, description: "Total approximate cost breakdown text (e.g. $1200 or ₹90,000)" }
              },
              required: ["estimatedTotal"]
            },
            packingList: {
              type: Type.ARRAY,
              description: "List of recommended items to pack.",
              items: { type: Type.STRING }
            }
          },
          required: ["itinerary", "hotels", "estimatedBudget", "packingList"]
        }
      }
    });

    const parsedData = JSON.parse(response.text);

    const result = await pool.query(
      `INSERT INTO trips 
       (user_id, destination, duration_days, budget_tier, interests, itinerary, hotels, estimated_budget, packing_list) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        userId, 
        destination, 
        durationDays, 
        budgetTier, 
        interests, 
        JSON.stringify(parsedData.itinerary), 
        JSON.stringify(parsedData.hotels),
        JSON.stringify(parsedData.estimatedBudget),
        JSON.stringify(parsedData.packingList)
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Gemini Live Compilation Failure:', err);
    res.status(500).json({ message: 'AI generative execution exception encountered.' });
  }
});

/**
 * @route   DELETE /api/trips/:id
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Trip variant not found or user unauthorized.' });
    }

    res.json({ message: 'Venture record successfully purged from database vault.' });
  } catch (err) {
    console.error('Deletion error:', err.message);
    res.status(500).json({ message: 'Server database drop exception encountered.' });
  }
});

module.exports = router;