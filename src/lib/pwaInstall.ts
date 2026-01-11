/**
 * PWA Install Prompt utilities
 * Shows install prompt on second visit (after onboarding)
 */

const VISIT_KEY = 'hostelguide_visit_count';
const INSTALL_DISMISSED_KEY = 'hostelguide_install_dismissed';

// BeforeInstallPromptEvent type (not in standard lib)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Initialize PWA install prompt capture
 * Must be called early to catch the beforeinstallprompt event
 */
export function initPwaInstall(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });

  // Reset prompt reference if app is installed
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
  });
}

/**
 * Increment visit count and return new value
 */
export function incrementVisitCount(): number {
  const count = parseInt(localStorage.getItem(VISIT_KEY) || '0') + 1;
  localStorage.setItem(VISIT_KEY, count.toString());
  return count;
}

/**
 * Get current visit count
 */
export function getVisitCount(): number {
  return parseInt(localStorage.getItem(VISIT_KEY) || '0');
}

/**
 * Check if we should show the install prompt
 * - At least 2 visits
 * - Not dismissed before
 * - Not already in standalone mode
 * - Install prompt available
 */
export function shouldShowInstallPrompt(): boolean {
  const visitCount = getVisitCount();
  const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return visitCount >= 2 && !dismissed && !isStandalone && deferredPrompt !== null;
}

/**
 * Check if install prompt is available (for UI display)
 */
export function isInstallAvailable(): boolean {
  return deferredPrompt !== null;
}

/**
 * Trigger the native install prompt
 * Returns true if user accepted, false otherwise
 */
export async function triggerInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;

  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  if (outcome === 'accepted') {
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
  }

  return outcome === 'accepted';
}

/**
 * Dismiss the install prompt (don't show again)
 */
export function dismissInstallPrompt(): void {
  localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
}

/**
 * Reset install prompt state (for testing)
 */
export function resetInstallPrompt(): void {
  localStorage.removeItem(INSTALL_DISMISSED_KEY);
  localStorage.removeItem(VISIT_KEY);
}
