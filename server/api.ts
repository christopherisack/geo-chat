import express from 'express';
import { generateChatResponse, ChatMessage, MapContext } from './gemini.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json());

// POST /api/chat
apiRouter.post('/chat', async (req, res) => {
  try {
    const { messages, mapContext, modelType, persona } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const defaultMapContext: MapContext = mapContext || {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 13,
      locationName: 'San Francisco, CA',
    };

    const responsePayload = await generateChatResponse(
      messages as ChatMessage[],
      defaultMapContext,
      modelType,
      persona
    );

    return res.json(responsePayload);
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response from Gemini API',
    });
  }
});

// Proxy for Places Search if needed
apiRouter.post('/places/search', async (req, res) => {
  try {
    const { query, location, radius } = req.body;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key is not configured' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const requestBody: any = {
      textQuery: query,
      pageSize: 10,
    };

    if (location && location.lat && location.lng) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng,
          },
          radius: radius || 5000,
        },
      };
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.editorialSummary,places.googleMapsUri',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error('API /api/places/search error:', error);
    return res.status(500).json({ error: error.message || 'Places search failed' });
  }
});

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasMapsKey: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY),
  });
});
