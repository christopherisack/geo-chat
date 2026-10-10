export type PlaceCategory =
  | 'restaurant'
  | 'cafe'
  | 'attraction'
  | 'park'
  | 'hotel'
  | 'transit'
  | 'shopping'
  | 'other';

export interface Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategory;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  places?: Place[];
  sources?: GroundingSource[];
  searchQueries?: string[];
  modelUsed?: string;
  locationContext?: string;
}

export interface MapViewport {
  center: { lat: number; lng: number };
  zoom: number;
  locationName: string;
}

export type PersonaId = 'guide' | 'concierge' | 'scout' | 'historian';

export type DrawingMode = 'none' | 'distance' | 'polygon';

export type MeasurementUnit = 'metric' | 'imperial' | 'nautical';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface DrawingMeasurement {
  mode: DrawingMode;
  points: LatLngPoint[];
  totalDistanceMeters: number;
  totalAreaSquareMeters?: number;
}

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  tagline: string;
  description: string;
  model: 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.8-flash';
  icon: string;
  badge: string;
  searchGrounded: boolean;
}
