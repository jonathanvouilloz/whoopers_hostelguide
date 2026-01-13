/**
 * Geolocation utilities for PWA
 * Calculates distance between user and spots
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

const PLACEHOLDER_TEXT = 'Activer localisation';
const LOADING_TEXT = 'Localisation...';

let clickHandlersAdded = false;

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string like "200m" or "1.2km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Get user's current position
 * @returns Promise with coordinates or null if denied/unavailable
 */
export function getUserLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Update all distance elements with a text value
 */
function setAllDistanceText(text: string, isClickable: boolean): void {
  // Update .distance-display elements
  const distanceElements = document.querySelectorAll('.distance-display[data-lat][data-lng]');
  distanceElements.forEach((el) => {
    el.textContent = text;
    if (isClickable) {
      el.classList.add('location-trigger');
    } else {
      el.classList.remove('location-trigger');
    }
  });

  // Update .distance-value-text elements (in cards)
  const valueTextElements = document.querySelectorAll('.distance-value-text');
  valueTextElements.forEach((el) => {
    el.textContent = text;
  });

  // Update .distance-value elements (in badges)
  const valueElements = document.querySelectorAll('.distance-value');
  valueElements.forEach((el) => {
    el.textContent = text;
  });
}

/**
 * Update all distance elements with actual distances from user location
 */
function updateAllDistances(userLocation: Coordinates): void {
  // Update .distance-display elements
  const distanceElements = document.querySelectorAll('.distance-display[data-lat][data-lng]');
  distanceElements.forEach((el) => {
    const spotLat = parseFloat(el.getAttribute('data-lat') || '0');
    const spotLng = parseFloat(el.getAttribute('data-lng') || '0');

    if (spotLat && spotLng) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, spotLat, spotLng);
      el.textContent = formatDistance(distance);
      el.classList.remove('location-trigger', 'cursor-pointer', 'hover:underline');
    }
  });

  // Update badge and footer elements on cards
  const badgeElements = document.querySelectorAll('.distance-badge[data-lat][data-lng]');
  badgeElements.forEach((badge) => {
    const spotLat = parseFloat(badge.getAttribute('data-lat') || '0');
    const spotLng = parseFloat(badge.getAttribute('data-lng') || '0');

    if (spotLat && spotLng) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, spotLat, spotLng);
      const formatted = formatDistance(distance);

      // Update badge value and show it
      const valueEl = badge.querySelector('.distance-value');
      if (valueEl) {
        valueEl.textContent = formatted;
      }
      badge.classList.remove('hidden');

      // Update footer distance text and icon
      const card = badge.closest('.spot-card');
      if (card) {
        const distanceText = card.querySelector('.distance-text');
        const textValueEl = card.querySelector('.distance-value-text');
        const iconEl = distanceText?.querySelector('.material-symbols-outlined');

        if (textValueEl) {
          textValueEl.textContent = `${formatted} walk`;
        }
        if (iconEl) {
          iconEl.textContent = 'directions_walk';
        }
        if (distanceText) {
          distanceText.classList.remove('location-trigger', 'cursor-pointer', 'hover:underline', 'text-primary');
          // Reset to inherit color from parent (text-secondary)
        }
      }
    }
  });
}

/**
 * Request location permission and update distances
 * Called when user clicks on "Activer localisation"
 */
export async function requestLocationPermission(): Promise<void> {
  // Show loading state
  setAllDistanceText(LOADING_TEXT, false);

  const userLocation = await getUserLocation();

  if (userLocation) {
    // Success - update all distances
    updateAllDistances(userLocation);
  } else {
    // Denied/failed - restore placeholder
    setAllDistanceText(PLACEHOLDER_TEXT, true);
  }
}

/**
 * Add click handlers to all location trigger elements
 */
function addClickHandlers(): void {
  if (clickHandlersAdded) return;
  clickHandlersAdded = true;

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const trigger = target.closest('.location-trigger');
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      requestLocationPermission();
    }
  });
}

/**
 * Check if geolocation permission is already granted
 */
async function checkPermissionState(): Promise<'granted' | 'prompt' | 'denied' | 'unknown'> {
  try {
    if (navigator.permissions) {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    }
  } catch {
    // Safari doesn't support permissions.query for geolocation
  }
  return 'unknown';
}

/**
 * Initialize distance display for all elements with data-lat and data-lng attributes
 * Shows "Activer localisation" placeholder if permission not granted
 * Auto-fetches distances if permission already granted
 */
export async function initDistanceDisplay(): Promise<void> {
  // Add click handlers FIRST (before any async operation)
  addClickHandlers();

  const permissionState = await checkPermissionState();

  if (permissionState === 'granted') {
    // Permission already granted - fetch and display distances
    const userLocation = await getUserLocation();
    if (userLocation) {
      updateAllDistances(userLocation);
    } else {
      setAllDistanceText(PLACEHOLDER_TEXT, true);
    }
  } else {
    // Show clickable placeholder
    setAllDistanceText(PLACEHOLDER_TEXT, true);
  }
}
