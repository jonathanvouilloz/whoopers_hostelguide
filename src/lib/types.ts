// ============================================
// Settings Types
// ============================================

export interface WiFiSettings {
  name: string;
  password: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface CategoryImages {
  food?: string;
  activities?: string;
  services?: string;
  bars?: string;
}

export interface Settings {
  hostelName: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  wifi: WiFiSettings;
  checkIn: string;
  checkOut: string;
  contactWhatsApp: string;
  emergencyContacts: EmergencyContact[];
  timezone: string;
  heroImage?: string;
  categoryImages?: CategoryImages;
}

// ============================================
// Spot Types
// ============================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export type CuisineType =
  | 'thai'
  | 'western'
  | 'japanese'
  | 'chinese'
  | 'indian'
  | 'italian'
  | 'mexican'
  | 'korean'
  | 'vietnamese'
  | 'vegetarian'
  | 'vegan'
  | 'seafood'
  | 'street-food'
  | 'cafe'
  | 'other';

export type BarType =
  | 'cocktail'
  | 'beer'
  | 'wine'
  | 'rooftop'
  | 'live-music'
  | 'sports'
  | 'club'
  | 'lounge'
  | 'pub'
  | 'other';

export type PriceRange = '€' | '€€' | '€€€';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface OpeningHoursDetailed {
  default: string; // e.g., "11:30-22:00"
  exceptions?: Partial<Record<DayOfWeek, string>>; // e.g., { monday: "closed", sunday: "12:00-20:00" }
}

export interface Spot {
  id: string;
  name: string;
  description: string;
  cuisineType?: CuisineType;
  barType?: BarType;
  priceRange?: PriceRange;
  image?: string;
  address?: string;
  coordinates?: Coordinates;
  location?: Coordinates; // Alias for PagesCMS compatibility
  phone?: string;
  openingHours?: string | OpeningHoursDetailed; // Support both simple and detailed format
  tags?: string[];
  // New properties for redesign
  tagline?: string;
  rating?: string;
  walkingDistance?: string;
}

export interface SpotsFile {
  spots: Spot[];
}

export type SpotCategory = 'restaurants' | 'laundry' | 'transport' | 'bars' | 'activities';

// ============================================
// Event Types
// ============================================

export type EventType = 'food' | 'bars' | 'activities';

export type CTAType = 'whatsapp' | 'link';

export interface EventCTA {
  type: CTAType;
  label: string;
  url: string;
  message?: string;
}

export interface HostelEvent {
  id: string;
  title: string;
  tagline: string;
  description: string;
  type: EventType;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string;
  lat?: number | null;
  lng?: number | null;
  image?: string | null;
  price: string | null;
  cta: EventCTA | null;
}

export interface EventsFile {
  events: HostelEvent[];
}

// ============================================
// Category Metadata
// ============================================

export interface CategoryMeta {
  slug: SpotCategory;
  name: string;
  emoji: string;
  description: string;
}
