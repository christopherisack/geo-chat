import { PersonaConfig } from '../types.ts';

export interface CityPreset {
  name: string;
  country: string;
  center: { lat: number; lng: number };
  zoom: number;
  description: string;
}

export const CITY_PRESETS: CityPreset[] = [
  {
    name: 'San Francisco',
    country: 'United States',
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 14,
    description: 'Golden Gate, Ferry Building, Mission District & tech hubs',
  },
  {
    name: 'Paris',
    country: 'France',
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: 14,
    description: 'Eiffel Tower, Louvre, Le Marais & historic bistros',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    center: { lat: 35.6762, lng: 139.6503 },
    zoom: 14,
    description: 'Shibuya, Shinjuku, Senso-ji & world-class dining',
  },
  {
    name: 'New York City',
    country: 'United States',
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 14,
    description: 'Manhattan, Brooklyn, Central Park & Broadway',
  },
  {
    name: 'Rome',
    country: 'Italy',
    center: { lat: 41.9028, lng: 12.4964 },
    zoom: 14,
    description: 'Colosseum, Trastevere, Pantheon & Roman cafes',
  },
  {
    name: 'London',
    country: 'United Kingdom',
    center: { lat: 51.5074, lng: -0.1278 },
    zoom: 14,
    description: 'Westminster, Soho, Tower Bridge & royal parks',
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    center: { lat: 41.3879, lng: 2.1699 },
    zoom: 14,
    description: 'Sagrada Família, Gothic Quarter & Mediterranean coast',
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    center: { lat: 35.0116, lng: 135.7681 },
    zoom: 14,
    description: 'Gion, Fushimi Inari, zen gardens & historic teahouses',
  },
];

export const PERSONAS: PersonaConfig[] = [
  {
    id: 'guide',
    name: 'Local Explorer',
    tagline: 'Vibrant local knowledge & insider secrets',
    description: 'Grounded with real-time Google Search & Google Maps data to discover trending spots, opening status, and hidden gems.',
    model: 'gemini-3.5-flash',
    icon: 'Compass',
    badge: 'Search Grounded',
    searchGrounded: true,
  },
  {
    id: 'scout',
    name: 'Fast Scout',
    tagline: 'Instant answers & rapid lookups',
    description: 'Optimized for high-speed queries, quick coordinates, and rapid place highlights.',
    model: 'gemini-3.1-flash-lite',
    icon: 'Zap',
    badge: 'Fast & Agile',
    searchGrounded: false,
  },
  {
    id: 'concierge',
    name: 'Trip Concierge',
    tagline: 'Deep itinerary planning & complex schedules',
    description: 'Advanced reasoning for full-day itineraries, logical walking routes, and timing logistics.',
    model: 'gemini-3.8-flash',
    icon: 'Sparkles',
    badge: 'Complex Reasoning',
    searchGrounded: true,
  },
  {
    id: 'historian',
    name: 'Cultural Historian',
    tagline: 'Heritage, architecture & stories',
    description: 'Deep dives into architectural styles, historical milestones, and the stories behind monuments.',
    model: 'gemini-3.5-flash',
    icon: 'Landmark',
    badge: 'Search Grounded',
    searchGrounded: true,
  },
];

export const SAMPLE_PROMPTS = [
  {
    label: '☕ Top Specialty Coffee',
    prompt: 'What are the top rated specialty coffee shops within walking distance of this map location? Highlight their signature roasts and atmospheres.',
  },
  {
    label: '🍽️ Local Dinner Gems',
    prompt: 'Recommend 4 authentic dinner spots around here with great vibes, mentioning signature dishes and why locals love them.',
  },
  {
    label: '🏛️ Landmarks & Hidden Sights',
    prompt: 'What are the most notable architectural sights and hidden cultural corners right around this neighborhood?',
  },
  {
    label: '🚶 2-Hour Walking Tour',
    prompt: 'Plan a pleasant 2-hour walking tour starting from this area with 3-4 distinct stops and scenic paths.',
  },
  {
    label: '🕒 What is Open Late?',
    prompt: 'What cafes, casual bites, or activities are open late tonight in this immediate vicinity?',
  },
  {
    label: '🚇 Transit & Getting Around',
    prompt: 'What are the best transit options, nearest metro/bus stops, and walkability tips for this area?',
  },
];
