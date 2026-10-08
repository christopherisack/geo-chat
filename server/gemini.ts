import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Create shared Gemini client with required User-Agent
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface MapContext {
  center: { lat: number; lng: number };
  zoom: number;
  locationName?: string;
  selectedPlace?: {
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
    rating?: number;
  };
  visiblePlacesCount?: number;
}

export interface PlaceRecommendation {
  id?: string;
  name: string;
  description: string;
  category: 'restaurant' | 'cafe' | 'attraction' | 'park' | 'hotel' | 'transit' | 'shopping' | 'other';
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  website?: string;
  tags?: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatResponsePayload {
  text: string;
  places: PlaceRecommendation[];
  sources: GroundingSource[];
  searchQueries: string[];
  modelUsed: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  mapContext: MapContext,
  modelType: string = 'gemini-3.5-flash',
  persona: string = 'guide'
): Promise<ChatResponsePayload> {
  const chosenModel = modelType || 'gemini-3.5-flash';

  const personaInstructions: Record<string, string> = {
    guide: `You are an enthusiastic, hyper-knowledgeable local guide and urban explorer. You share insider tips, vibe checks, best times to visit, architectural quirks, and culinary secrets.`,
    concierge: `You are a premium city concierge and itinerary planner. You provide structured recommendations, realistic walking/transit timings, and polished schedules tailored to the user's location.`,
    scout: `You are a fast, concise spatial scout. You give quick, punchy, high-precision recommendations with exact addresses and highlights.`,
    historian: `You are a local historian and cultural docent. You connect places with their historical backstory, cultural movements, architecture, and hidden heritage.`,
  };

  const personaIntro = personaInstructions[persona] || personaInstructions.guide;

  const systemInstruction = `${personaIntro}

Your job is to answer location-specific questions with real-time accuracy and contextual awareness based on the user's interactive Google Map viewport.

CURRENT MAP CONTEXT:
- Center Coordinates: Latitude ${mapContext.center.lat.toFixed(5)}, Longitude ${mapContext.center.lng.toFixed(5)}
- Current Zoom Level: ${mapContext.zoom}
${mapContext.locationName ? `- Named Location / Neighborhood: ${mapContext.locationName}` : ''}
${mapContext.selectedPlace ? `- Currently Inspected Place on Map: ${mapContext.selectedPlace.name} (${mapContext.selectedPlace.address || ''}, Rating: ${mapContext.selectedPlace.rating || 'N/A'})` : ''}

CRITICAL RESPONSE GUIDELINES:
1. Provide rich, insightful, and accurate descriptions. Answer questions about opening hours, atmosphere, signature dishes/sights, transit access, and local tips using up-to-date Google Search grounding.
2. Structure your response with readable Markdown: bold names, bullet points, and brief highlights.
3. Whenever you recommend or mention specific physical places, restaurants, attractions, or landmarks in or near the map area, ALWAYS append a structured JSON block at the very end of your response inside a code fence labeled \`\`\`json:places.
This structured block is used by the frontend to render interactive pins and cards directly on the Google Map!

Format for the JSON block:
\`\`\`json:places
[
  {
    "name": "Exact Name of Place",
    "description": "Short 1-2 sentence highlight of what makes it great",
    "category": "restaurant" | "cafe" | "attraction" | "park" | "hotel" | "transit" | "shopping" | "other",
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "123 Street Name, City",
    "rating": 4.7
  }
]
\`\`\`
Ensure each recommended place has sensible latitude and longitude coordinates in or reasonably close to the current map view area.

4. If the user asks about an itinerary or route, list each stop sequentially and include all of them in the \`\`\`json:places block so the user can see them on the map.
`;

  // Format turns for the API
  const contents = messages.map((msg) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // Enable Google Search tool, especially for gemini-3.5-flash
  const enableSearch = chosenModel === 'gemini-3.5-flash' || chosenModel === 'gemini-3.8-flash';

  const config: any = {
    systemInstruction,
    temperature: 0.7,
  };

  let response: any;
  let usedSearchGrounding = false;

  try {
    if (enableSearch) {
      try {
        response = await ai.models.generateContent({
          model: chosenModel,
          contents,
          config: {
            ...config,
            tools: [{ googleSearch: {} }],
          },
        });
        usedSearchGrounding = true;
      } catch (searchErr: any) {
        console.warn('Search grounding failed or quota exceeded, falling back to direct model generation:', searchErr.message);
        // Fallback without googleSearch tool
        response = await ai.models.generateContent({
          model: chosenModel,
          contents,
          config,
        });
      }
    } else {
      response = await ai.models.generateContent({
        model: chosenModel,
        contents,
        config,
      });
    }

    const fullText = response.text || 'No response received.';

    // Extract sources from grounding metadata
    const sources: GroundingSource[] = [];
    const searchQueries: string[] = [];

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }
    }

    if (groundingMetadata?.webSearchQueries) {
      for (const query of groundingMetadata.webSearchQueries) {
        if (typeof query === 'string') {
          searchQueries.push(query);
        }
      }
    }

    // Extract places JSON block
    let cleanText = fullText;
    const places: PlaceRecommendation[] = [];

    const jsonPlacesMatch = fullText.match(/```json:places\s*([\s\S]*?)\s*```/);
    if (jsonPlacesMatch) {
      try {
        const parsed = JSON.parse(jsonPlacesMatch[1]);
        if (Array.isArray(parsed)) {
          for (let i = 0; i < parsed.length; i++) {
            const item = parsed[i];
            if (item && item.name) {
              places.push({
                id: `rec-${Date.now()}-${i}`,
                name: String(item.name),
                description: String(item.description || ''),
                category: item.category || 'attraction',
                lat: Number(item.lat) || mapContext.center.lat,
                lng: Number(item.lng) || mapContext.center.lng,
                address: item.address,
                rating: item.rating,
              });
            }
          }
        }
        // Remove the json block from the visible markdown text
        cleanText = fullText.replace(/```json:places\s*([\s\S]*?)\s*```/, '').trim();
      } catch (e) {
        console.warn('Could not parse json:places block:', e);
      }
    }

    return {
      text: cleanText,
      places,
      sources,
      searchQueries,
      modelUsed: chosenModel,
    };
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}
