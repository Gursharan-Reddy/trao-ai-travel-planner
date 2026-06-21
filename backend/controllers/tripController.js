const db = require('../config/db');

async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`Upstream Agent Engine returned code: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

exports.generateNewTrip = async (req, res) => {
  const { destination, durationDays, budgetTier, interests } = req.body;
  const userId = req.user.id; 

  const prompt = `
    Create a detailed travel plan for a ${durationDays}-day trip to ${destination}.
    Budget preference is ${budgetTier}. Interests are: ${interests.join(', ')}.

    You must output ONLY a valid JSON object matching this structure:
    {
      "itinerary": [
        {
          "dayNumber": 1,
          "activities": [
            { "title": "Activity name", "description": "Brief details", "estimatedCostUSD": 20, "timeOfDay": "Morning" }
          ]
        }
      ],
      "hotels": [
        { "name": "Recommended Hotel", "tier": "Budget", "estimatedCostNightUSD": 85, "rating": "4.5/5" }
      ],
      "estimatedBudget": {
        "transport": 120,
        "accommodation": 300,
        "food": 150,
        "activities": 100,
        "total": 670
      },
      "packingList": [
        { "item": "Passport", "category": "Documents", "isPacked": false }
      ]
    }
    Ensure response text is strict, valid, raw JSON data only. Do not wrap code block format or anything extra.
  `;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const parsedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedText) throw new Error("Malformation in AI stream serialization context");

    const cleanResult = JSON.parse(parsedText);

    const newTrip = await db.query(
      `INSERT INTO trips (user_id, destination, duration_days, budget_tier, interests, itinerary, hotels, estimated_budget, packing_list)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        userId, destination, durationDays, budgetTier, interests,
        JSON.stringify(cleanResult.itinerary),
        JSON.stringify(cleanResult.hotels),
        JSON.stringify(cleanResult.estimatedBudget),
        JSON.stringify(cleanResult.packingList)
      ]
    );

    res.status(201).json(newTrip.rows[0]);
  } catch (error) {
    console.error("AI Component Exception:", error);
    res.status(500).json({ message: "Engine Failure generating itinerary dataset safely." });
  }
};

exports.getUserTrips = async (req, res) => {
  try {
    const trips = await db.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(trips.rows);
  } catch (err) {
    res.status(500).json({ message: "Data core parsing error" });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ message: "No fields provided" });

    let setClause = [];
    let values = [id, req.user.id];
    
    keys.forEach((key, index) => {
      setClause.push(`${key} = $${index + 3}`);
      values.push(typeof fields[key] === 'object' ? JSON.stringify(fields[key]) : fields[key]);
    });

    const queryText = `UPDATE trips SET ${setClause.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`;
    const updatedTrip = await db.query(queryText, values);

    if (updatedTrip.rows.length === 0) return res.status(404).json({ message: "No context matched trip boundaries" });
    res.json(updatedTrip.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Mutation transaction processing error" });
  }
};