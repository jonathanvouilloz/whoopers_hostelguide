import type {
  Settings,
  Spot,
  SpotCategory,
  HostelEvent,
  EventsFile,
  CategoryMeta,
} from './types';

// ============================================
// Settings
// ============================================

let cachedSettings: Settings | null = null;

export async function getSettings(): Promise<Settings> {
  if (cachedSettings) {
    return cachedSettings;
  }

  const data = await import('../../content/settings.json');
  cachedSettings = data.default as Settings;
  return cachedSettings;
}

// ============================================
// Spots
// ============================================

export async function getSpots(category: SpotCategory): Promise<Spot[]> {
  let rawData: unknown;

  switch (category) {
    case 'restaurants':
      rawData = (await import('../../content/spots/restaurants.json')).default;
      break;
    case 'laundry':
      rawData = (await import('../../content/spots/laundry.json')).default;
      break;
    case 'transport':
      rawData = (await import('../../content/spots/transport.json')).default;
      break;
    case 'bars':
      rawData = (await import('../../content/spots/bars.json')).default;
      break;
    case 'activities':
      rawData = (await import('../../content/spots/activities.json')).default;
      break;
  }

  const data = rawData as { spots: Spot[] };
  return data.spots;
}

export async function getSpotById(category: SpotCategory, id: string): Promise<Spot | undefined> {
  const spots = await getSpots(category);
  return spots.find((spot) => spot.id === id);
}

export async function getAllSpots(): Promise<Record<SpotCategory, Spot[]>> {
  const categories: SpotCategory[] = ['restaurants', 'laundry', 'transport', 'bars', 'activities'];

  const results = await Promise.all(
    categories.map(async (category) => ({
      category,
      spots: await getSpots(category),
    }))
  );

  return results.reduce(
    (acc, { category, spots }) => {
      acc[category] = spots;
      return acc;
    },
    {} as Record<SpotCategory, Spot[]>
  );
}

export async function findSpotById(
  id: string
): Promise<{ spot: Spot; category: SpotCategory } | undefined> {
  const allSpots = await getAllSpots();

  for (const [category, spots] of Object.entries(allSpots)) {
    const spot = spots.find((s) => s.id === id);
    if (spot) {
      return { spot, category: category as SpotCategory };
    }
  }

  return undefined;
}

// ============================================
// Events
// ============================================

export async function getEvents(): Promise<HostelEvent[]> {
  const data = await import('../../content/events.json');
  const eventsFile = data.default as EventsFile;
  return eventsFile.events;
}

export async function getEventById(id: string): Promise<HostelEvent | undefined> {
  const events = await getEvents();
  return events.find((event) => event.id === id);
}

export async function getUpcomingEvents(days: number = 7): Promise<HostelEvent[]> {
  const events = await getEvents();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return events
    .filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= now && eventDate <= futureDate;
    })
    .sort((a, b) => {
      // First sort by date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;

      // All Day events first (null startTime)
      if (a.startTime === null && b.startTime !== null) return -1;
      if (a.startTime !== null && b.startTime === null) return 1;

      // Then sort by startTime
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
}

// ============================================
// Category Metadata
// ============================================

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: 'restaurants',
    name: 'Restaurants',
    emoji: '🍜',
    description: 'Local restaurants and cafes',
  },
  {
    slug: 'laundry',
    name: 'Laundry',
    emoji: '🧺',
    description: 'Laundry services nearby',
  },
  {
    slug: 'transport',
    name: 'Transport',
    emoji: '🛵',
    description: 'Scooter rental and transport',
  },
  {
    slug: 'bars',
    name: 'Bars',
    emoji: '🍺',
    description: 'Bars and nightlife',
  },
  {
    slug: 'activities',
    name: 'Activities',
    emoji: '🎯',
    description: 'Tours and activities',
  },
];

export function getCategoryMeta(slug: SpotCategory): CategoryMeta | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}
