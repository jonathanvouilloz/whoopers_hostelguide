import type {
  Settings,
  Spot,
  SpotCategory,
  CategoryMeta,
  Activity,
  ActivitiesFile,
  ScheduleFile,
  ScheduleDay,
  ScheduleSlot,
  SpecialEvent,
  SpecialEventsFile,
  ScheduledEvent,
} from './types';

// ============================================
// Utilities
// ============================================

/**
 * Generate a URL-safe slug from a string
 * Example: "Thai Cooking Class" -> "thai-cooking-class"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')      // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');         // Remove leading/trailing hyphens
}

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

  // Auto-generate IDs from name if not provided
  return data.spots.map((spot) => ({
    ...spot,
    id: spot.id || slugify(spot.name),
  }));
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
// Activities (Recurring library)
// ============================================

export async function getActivities(): Promise<Activity[]> {
  const data = await import('../../content/activities.json');
  const file = data.default as ActivitiesFile;

  return file.activities.map((activity) => ({
    ...activity,
    id: activity.id || slugify(activity.title),
  }));
}

export async function getActivityById(id: string): Promise<Activity | undefined> {
  const activities = await getActivities();
  return activities.find((a) => a.id === id);
}

// ============================================
// Schedule (Weekly recurring)
// ============================================

export async function getSchedule(): Promise<Record<ScheduleDay, ScheduleSlot[]>> {
  const data = await import('../../content/schedule.json');
  const file = data.default as ScheduleFile;
  return file.schedule;
}

// ============================================
// Special Events (One-off dated)
// ============================================

export async function getSpecialEvents(): Promise<SpecialEvent[]> {
  const data = await import('../../content/special-events.json');
  const file = data.default as SpecialEventsFile;

  return file.events.map((event) => ({
    ...event,
    id: event.id || slugify(event.title),
  }));
}

export async function getSpecialEventById(id: string): Promise<SpecialEvent | undefined> {
  const events = await getSpecialEvents();
  return events.find((e) => e.id === id);
}

// ============================================
// Unified Scheduled Events (for /events page)
// ============================================

const SCHEDULE_DAYS: ScheduleDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function getDayOfWeek(date: Date): ScheduleDay {
  return SCHEDULE_DAYS[date.getDay()];
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get all events for the next N days (combining schedule + special events)
 * This is the main function for the /events page
 */
export async function getUpcomingScheduledEvents(days: number = 7): Promise<ScheduledEvent[]> {
  const [activities, schedule, specialEvents] = await Promise.all([
    getActivities(),
    getSchedule(),
    getSpecialEvents(),
  ]);

  // Create a map for quick activity lookup
  const activityMap = new Map(activities.map((a) => [a.id, a]));

  const result: ScheduledEvent[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate events for each day
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = formatDateISO(currentDate);
    const dayOfWeek = getDayOfWeek(currentDate);

    // 1. Add recurring activities from schedule
    const slots = schedule[dayOfWeek] || [];
    for (const slot of slots) {
      const activity = activityMap.get(slot.activityId);
      if (activity) {
        result.push({
          id: `${activity.id}-${dateStr}`,
          title: activity.title,
          tagline: activity.tagline,
          description: activity.description,
          type: activity.type,
          startTime: slot.startTime,
          endTime: slot.endTime,
          location: activity.location,
          lat: activity.lat,
          lng: activity.lng,
          image: activity.image,
          price: activity.price,
          cta: activity.cta,
          date: dateStr,
          isRecurring: true,
          sourceId: activity.id,
        });
      }
    }

    // 2. Add special events for this date
    const daySpecialEvents = specialEvents.filter((e) => e.date === dateStr);
    for (const event of daySpecialEvents) {
      result.push({
        id: event.id,
        title: event.title,
        tagline: event.tagline,
        description: event.description,
        type: event.type,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        lat: event.lat,
        lng: event.lng,
        image: event.image,
        price: event.price,
        cta: event.cta,
        date: dateStr,
        isRecurring: false,
        sourceId: event.id,
      });
    }
  }

  // Sort by date, then by time (All Day first, then by startTime)
  return result.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;

    if (a.startTime === null && b.startTime !== null) return -1;
    if (a.startTime !== null && b.startTime === null) return 1;

    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }

    return 0;
  });
}

/**
 * Get a specific event by its display ID (for detail page)
 * Handles both recurring activities and special events
 */
export async function getScheduledEventById(
  id: string
): Promise<{ event: ScheduledEvent; isRecurring: boolean } | undefined> {
  // Check if it's a recurring event ID (format: "activity-id-YYYY-MM-DD")
  const recurringMatch = id.match(/^(.+)-(\d{4}-\d{2}-\d{2})$/);

  if (recurringMatch) {
    const [, activityId, dateStr] = recurringMatch;
    const activity = await getActivityById(activityId);

    if (activity) {
      // Get schedule to find the time for this activity on this day
      const schedule = await getSchedule();
      const date = new Date(dateStr);
      const dayOfWeek = getDayOfWeek(date);
      const slots = schedule[dayOfWeek] || [];
      const slot = slots.find((s) => s.activityId === activityId);

      return {
        event: {
          id,
          title: activity.title,
          tagline: activity.tagline,
          description: activity.description,
          type: activity.type,
          startTime: slot?.startTime ?? null,
          endTime: slot?.endTime ?? null,
          location: activity.location,
          lat: activity.lat,
          lng: activity.lng,
          image: activity.image,
          price: activity.price,
          cta: activity.cta,
          date: dateStr,
          isRecurring: true,
          sourceId: activityId,
        },
        isRecurring: true,
      };
    }
  }

  // Check special events
  const specialEvent = await getSpecialEventById(id);
  if (specialEvent) {
    return {
      event: {
        id: specialEvent.id,
        title: specialEvent.title,
        tagline: specialEvent.tagline,
        description: specialEvent.description,
        type: specialEvent.type,
        startTime: specialEvent.startTime,
        endTime: specialEvent.endTime,
        location: specialEvent.location,
        lat: specialEvent.lat,
        lng: specialEvent.lng,
        image: specialEvent.image,
        price: specialEvent.price,
        cta: specialEvent.cta,
        date: specialEvent.date,
        isRecurring: false,
        sourceId: specialEvent.id,
      },
      isRecurring: false,
    };
  }

  return undefined;
}

/**
 * Get all possible event IDs for static path generation
 * Used by getStaticPaths() in /event/[id].astro
 */
export async function getAllScheduledEventIds(): Promise<string[]> {
  const events = await getUpcomingScheduledEvents(30);
  return events.map((e) => e.id);
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
