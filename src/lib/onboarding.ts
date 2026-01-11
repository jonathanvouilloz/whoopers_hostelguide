/**
 * Multi-page onboarding tour for first-time guests
 * Uses Driver.js to highlight key features across different pages
 */

const STEP_KEY = 'hostelguide_onboarding_step';
const COMPLETED_KEY = 'hostelguide_onboarding_completed';

// Driver.js is loaded via CDN in BaseLayout
declare const driver: {
  js: {
    driver: (config: DriverConfig) => DriverInstance;
  };
};

interface DriverConfig {
  showProgress?: boolean;
  allowClose?: boolean;
  overlayClickNext?: boolean;
  popoverClass?: string;
  steps: DriverStep[];
  onDestroyed?: () => void;
  onCloseClick?: () => void;
}

interface DriverStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    onNextClick?: () => void;
    onPrevClick?: () => void;
  };
}

interface DriverInstance {
  drive: (stepIndex?: number) => void;
  destroy: () => void;
  moveNext: () => void;
  movePrevious: () => void;
}

export type TourPage = 'home' | 'events' | 'restaurants' | 'spot-detail' | 'info';

interface TourStepConfig {
  globalStep: number;
  element: string;
  title: string;
  description: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  navigateTo?: string;
  isLast?: boolean;
}

// Tour configuration by page
const tourConfig: Record<TourPage, TourStepConfig[]> = {
  home: [
    {
      globalStep: 0,
      element: '[data-tour="welcome"]',
      title: 'Welcome!',
      description: 'Let us show you around the app.',
      side: 'bottom',
    },
    {
      globalStep: 1,
      element: '[data-tour="wifi"]',
      title: 'Your WiFi Details',
      description: 'Tap the password to copy it instantly!',
      side: 'bottom',
    },
    {
      globalStep: 2,
      element: '[data-tour="nav-events"]',
      title: 'Events',
      description: "Let's check out what's happening...",
      side: 'top',
      navigateTo: '/events',
    },
  ],
  events: [
    {
      globalStep: 3,
      element: '[data-tour="events-list"]',
      title: 'Daily Events',
      description: 'See activities planned for the week!',
      side: 'bottom',
    },
    {
      globalStep: 4,
      element: '[data-tour="nav-explore"]',
      title: 'Explore',
      description: "Now let's find some good food...",
      side: 'top',
      navigateTo: '/restaurants',
    },
  ],
  restaurants: [
    {
      globalStep: 5,
      element: '[data-tour="first-spot"]',
      title: 'Local Spots',
      description: 'Tap any spot to see details...',
      side: 'bottom',
      // navigateTo will be set dynamically
    },
  ],
  'spot-detail': [
    {
      globalStep: 6,
      element: '[data-tour="directions-btn"]',
      title: 'Get Directions',
      description: 'Open in Maps with one tap!',
      side: 'top',
      navigateTo: '/info',
    },
  ],
  info: [
    {
      globalStep: 7,
      element: '[data-tour="house-rules"]',
      title: 'House Rules',
      description: "One last thing! Please read our house rules. Enjoy your stay!",
      side: 'bottom',
      isLast: true,
    },
  ],
};

// Get the global step range for a page
function getPageStepRange(page: TourPage): { min: number; max: number } {
  const steps = tourConfig[page];
  if (!steps || steps.length === 0) return { min: -1, max: -1 };
  return {
    min: steps[0].globalStep,
    max: steps[steps.length - 1].globalStep,
  };
}

/**
 * Get current onboarding step
 */
export function getCurrentStep(): number {
  return parseInt(localStorage.getItem(STEP_KEY) || '0');
}

/**
 * Set current onboarding step
 */
export function setCurrentStep(step: number): void {
  localStorage.setItem(STEP_KEY, step.toString());
}

/**
 * Check if onboarding is completed
 */
export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(COMPLETED_KEY) === 'true';
}

/**
 * Mark onboarding as completed
 */
function markCompleted(): void {
  localStorage.setItem(COMPLETED_KEY, 'true');
  localStorage.removeItem(STEP_KEY);
}

/**
 * Skip/close onboarding
 */
function skipOnboarding(): void {
  markCompleted();
}

/**
 * Run the tour for the current page
 * @param page - The current page type
 * @param options - Optional configuration (hostelName for home page, firstSpotUrl for restaurants)
 */
export function runTourForPage(
  page: TourPage,
  options?: { hostelName?: string; firstSpotUrl?: string }
): void {
  // Skip if already completed
  if (isOnboardingCompleted()) return;

  const currentStep = getCurrentStep();
  const pageRange = getPageStepRange(page);

  // Check if this page should show the tour
  if (currentStep < pageRange.min || currentStep > pageRange.max) {
    return;
  }

  // Get steps for this page
  const pageSteps = tourConfig[page];
  if (!pageSteps || pageSteps.length === 0) return;

  // Find which local step we should start at
  const localStartIndex = pageSteps.findIndex((s) => s.globalStep === currentStep);
  if (localStartIndex === -1) return;

  // Small delay to ensure DOM is ready
  setTimeout(() => {
    // We need driverInstance to be in scope for callbacks
    let driverInstance: DriverInstance;

    // Build Driver.js steps
    const driverSteps: DriverStep[] = pageSteps.slice(localStartIndex).map((step, index) => {
      let navigateTo = step.navigateTo;

      // Dynamic URL for restaurants -> first spot
      if (page === 'restaurants' && step.globalStep === 5 && options?.firstSpotUrl) {
        navigateTo = options.firstSpotUrl;
      }

      return {
        element: step.element,
        popover: {
          title: step.globalStep === 0 && options?.hostelName
            ? `Welcome to ${options.hostelName}!`
            : step.title,
          description: step.description,
          side: step.side || 'bottom',
          onNextClick: () => {
            const nextGlobalStep = step.globalStep + 1;
            setCurrentStep(nextGlobalStep);

            if (step.isLast) {
              markCompleted();
              driverInstance.destroy();
            } else if (navigateTo) {
              // Navigate to next page
              window.location.href = navigateTo;
            } else {
              // Move to next step on same page
              driverInstance.moveNext();
            }
          },
          onPrevClick: () => {
            if (step.globalStep > 0) {
              setCurrentStep(step.globalStep - 1);
              // For simplicity, go back in browser history
              if (localStartIndex + index === 0 && step.globalStep > 0) {
                window.history.back();
              } else {
                driverInstance.movePrevious();
              }
            }
          },
        },
      };
    });

    driverInstance = driver.js.driver({
      showProgress: true,
      allowClose: true,
      overlayClickNext: false,
      popoverClass: 'hostelguide-tour',
      steps: driverSteps,
      onCloseClick: () => {
        skipOnboarding();
        driverInstance.destroy();
      },
      onDestroyed: () => {
        // Only mark complete if on last step
        if (currentStep >= 7) {
          markCompleted();
        }
      },
    });

    driverInstance.drive();
  }, 300);
}

/**
 * Reset the onboarding state and redirect to home to replay the tour
 */
export function resetOnboarding(): void {
  localStorage.removeItem(COMPLETED_KEY);
  localStorage.removeItem(STEP_KEY);
  window.location.href = '/';
}

/**
 * Initialize onboarding for home page (backwards compatible)
 * @deprecated Use runTourForPage('home', { hostelName }) instead
 */
export function initOnboarding(hostelName: string): void {
  runTourForPage('home', { hostelName });
}
