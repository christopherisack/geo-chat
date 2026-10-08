import { PersonaConfig } from '../types.ts';

export interface CityPreset {
  name: string;
  country: string;
  region: 'Worldwide' | 'Americas' | 'Europe' | 'Asia' | 'Oceania' | 'Africa';
  center: { lat: number; lng: number };
  zoom: number;
  description: string;
  flag?: string;
}

export const WORLD_OVERVIEW: CityPreset = {
  name: 'Whole World Overview',
  country: 'Global Earth',
  region: 'Worldwide',
  center: { lat: 20, lng: 0 },
  zoom: 2,
  description: 'View the entire globe, select any country, and click anywhere to explore',
  flag: '🌍',
};

export const CITY_PRESETS: CityPreset[] = [
  // Worldwide
  WORLD_OVERVIEW,

  // Americas
  {
    name: 'San Francisco',
    country: 'United States',
    region: 'Americas',
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 14,
    description: 'Golden Gate, Ferry Building, Mission District & tech hubs',
    flag: '🇺🇸',
  },
  {
    name: 'New York City',
    country: 'United States',
    region: 'Americas',
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 14,
    description: 'Manhattan, Brooklyn, Central Park & Broadway',
    flag: '🇺🇸',
  },
  {
    name: 'Los Angeles',
    country: 'United States',
    region: 'Americas',
    center: { lat: 34.0522, lng: -118.2437 },
    zoom: 13,
    description: 'Hollywood, Santa Monica, Venice Beach & DTLA',
    flag: '🇺🇸',
  },
  {
    name: 'Mexico City',
    country: 'Mexico',
    region: 'Americas',
    center: { lat: 19.4326, lng: -99.1332 },
    zoom: 14,
    description: 'Zócalo, Roma Norte, Condesa & Chapultepec',
    flag: '🇲🇽',
  },
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'Americas',
    center: { lat: -22.9068, lng: -43.1729 },
    zoom: 13,
    description: 'Christ the Redeemer, Copacabana & Sugarloaf Mountain',
    flag: '🇧🇷',
  },
  {
    name: 'Buenos Aires',
    country: 'Argentina',
    region: 'Americas',
    center: { lat: -34.6037, lng: -58.3816 },
    zoom: 14,
    description: 'Palermo, Recoleta, tango halls & historic cafes',
    flag: '🇦🇷',
  },
  {
    name: 'Toronto',
    country: 'Canada',
    region: 'Americas',
    center: { lat: 43.6532, lng: -79.3832 },
    zoom: 14,
    description: 'CN Tower, Kensington Market & waterfront',
    flag: '🇨🇦',
  },

  // Europe
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: 14,
    description: 'Eiffel Tower, Louvre, Le Marais & historic bistros',
    flag: '🇫🇷',
  },
  {
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    center: { lat: 51.5074, lng: -0.1278 },
    zoom: 14,
    description: 'Westminster, Soho, Tower Bridge & royal parks',
    flag: '🇬🇧',
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    center: { lat: 41.9028, lng: 12.4964 },
    zoom: 14,
    description: 'Colosseum, Trastevere, Pantheon & Roman cafes',
    flag: '🇮🇹',
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    center: { lat: 41.3879, lng: 2.1699 },
    zoom: 14,
    description: 'Sagrada Família, Gothic Quarter & Mediterranean coast',
    flag: '🇪🇸',
  },
  {
    name: 'Berlin',
    country: 'Germany',
    region: 'Europe',
    center: { lat: 52.52, lng: 13.405 },
    zoom: 14,
    description: 'Brandenburg Gate, Museum Island & Kreuzberg vibes',
    flag: '🇩🇪',
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    region: 'Europe',
    center: { lat: 52.3676, lng: 4.9041 },
    zoom: 14,
    description: 'Canal ring, Jordaan, Rijksmuseum & cycling culture',
    flag: '🇳🇱',
  },
  {
    name: 'Athens',
    country: 'Greece',
    region: 'Europe',
    center: { lat: 37.9838, lng: 23.7275 },
    zoom: 14,
    description: 'Acropolis, Parthenon, Plaka & ancient ruins',
    flag: '🇬🇷',
  },

  // Asia
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    center: { lat: 35.6762, lng: 139.6503 },
    zoom: 14,
    description: 'Shibuya, Shinjuku, Senso-ji & world-class dining',
    flag: '🇯🇵',
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    center: { lat: 35.0116, lng: 135.7681 },
    zoom: 14,
    description: 'Gion, Fushimi Inari, zen gardens & historic teahouses',
    flag: '🇯🇵',
  },
  {
    name: 'Seoul',
    country: 'South Korea',
    region: 'Asia',
    center: { lat: 37.5665, lng: 126.978 },
    zoom: 14,
    description: 'Gyeongbokgung Palace, Hongdae & street food markets',
    flag: '🇰🇷',
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    center: { lat: 1.3521, lng: 103.8198 },
    zoom: 14,
    description: 'Marina Bay Sands, Gardens by the Bay & Hawker Centers',
    flag: '🇸🇬',
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Asia',
    center: { lat: 25.2048, lng: 55.2708 },
    zoom: 13,
    description: 'Burj Khalifa, Dubai Mall, Palm Jumeirah & Marina',
    flag: '🇦🇪',
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    center: { lat: 13.7563, lng: 100.5018 },
    zoom: 14,
    description: 'Grand Palace, Wat Arun, vibrant markets & street food',
    flag: '🇹🇭',
  },
  {
    name: 'Mumbai',
    country: 'India',
    region: 'Asia',
    center: { lat: 19.076, lng: 72.8777 },
    zoom: 13,
    description: 'Gateway of India, Marine Drive & Bollywood culture',
    flag: '🇮🇳',
  },

  // Oceania
  {
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    center: { lat: -33.8688, lng: 151.2093 },
    zoom: 14,
    description: 'Sydney Opera House, Harbour Bridge & Bondi Beach',
    flag: '🇦🇺',
  },
  {
    name: 'Melbourne',
    country: 'Australia',
    region: 'Oceania',
    center: { lat: -37.8136, lng: 144.9631 },
    zoom: 14,
    description: 'Laneways, coffee culture, Fitzroy & Yarra River',
    flag: '🇦🇺',
  },
  {
    name: 'Auckland',
    country: 'New Zealand',
    region: 'Oceania',
    center: { lat: -36.8485, lng: 174.7633 },
    zoom: 14,
    description: 'Sky Tower, Waitematā Harbour & volcanic peaks',
    flag: '🇳🇿',
  },

  // Africa
  {
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    center: { lat: 30.0444, lng: 31.2357 },
    zoom: 13,
    description: 'Giza Pyramids, Nile River, Khan el-Khalili bazaar',
    flag: '🇪🇬',
  },
  {
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    center: { lat: -33.9249, lng: 18.4241 },
    zoom: 13,
    description: 'Table Mountain, Waterfront, Camps Bay & ocean views',
    flag: '🇿🇦',
  },
  {
    name: 'Marrakech',
    country: 'Morocco',
    region: 'Africa',
    center: { lat: 31.6295, lng: -7.9811 },
    zoom: 14,
    description: 'Jemaa el-Fnaa, Medina, Bahia Palace & souks',
    flag: '🇲🇦',
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
