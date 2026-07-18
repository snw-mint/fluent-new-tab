/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

export const HOST_PERMISSIONS: Record<string, string[]> = {
  bing: ['https://peapix.com/*', 'https://img.peapix.com/*'],
  nasa: ['https://api.nasa.gov/*', 'https://apod.nasa.gov/*'],
  wikimedia: [
    'https://commons.wikimedia.org/*',
    'https://upload.wikimedia.org/',
  ],
  unsplash: ['https://unsplash.snw-mint.workers.dev/*'],
  pexels: ['https://pexels.snw-mint.workers.dev/*'],
  suggestions: ['https://duckduckgo.com/*'],
  weather: [
    'https://geocoding-api.open-meteo.com/*',
    'https://api.open-meteo.com/*',
  ],
  weatherAlerts: [
    'https://api.open-meteo.com/*',
    'https://air-quality-api.open-meteo.com/*',
  ],
  visualSearch: ['https://www.google.com/*', 'https://lens.google.com/*'],
};

export async function checkPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.contains) {
      console.warn('chrome.permissions API not available. Returning false.');
      return resolve(false);
    }

    try {
      chromeApi.permissions.contains({ origins }, (result: boolean) => {
        if (chromeApi.runtime?.lastError) {
          console.error(chromeApi.runtime.lastError);
          resolve(false);
        } else {
          resolve(Boolean(result));
        }
      });
    } catch (e) {
      console.error('Error checking permission:', e);
      resolve(false);
    }
  });
}

export async function requestPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.request) {
      console.warn('chrome.permissions API not available. Returning false.');
      return resolve(false);
    }

    try {
      chromeApi.permissions.request({ origins }, (granted: boolean) => {
        if (chromeApi.runtime?.lastError) {
          console.error(chromeApi.runtime.lastError);
          resolve(false);
        } else {
          resolve(Boolean(granted));
        }
      });
    } catch (e) {
      console.error('Error requesting permission:', e);
      resolve(false);
    }
  });
}

export async function checkApiPermission(permissions: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.contains) {
      console.warn('chrome.permissions API not available. Returning false.');
      return resolve(false);
    }

    try {
      chromeApi.permissions.contains({ permissions }, (result: boolean) => {
        if (chromeApi.runtime?.lastError) {
          console.error(chromeApi.runtime.lastError);
          resolve(false);
        } else {
          resolve(Boolean(result));
        }
      });
    } catch (e) {
      console.error('Error checking API permission:', e);
      resolve(false);
    }
  });
}

export async function requestApiPermission(permissions: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    if (!chromeApi?.permissions?.request) {
      console.warn('chrome.permissions API not available. Returning false.');
      return resolve(false);
    }

    try {
      chromeApi.permissions.request({ permissions }, (granted: boolean) => {
        if (chromeApi.runtime?.lastError) {
          console.error(chromeApi.runtime.lastError);
          resolve(false);
        } else {
          resolve(Boolean(granted));
        }
      });
    } catch (e) {
      console.error('Error requesting API permission:', e);
      resolve(false);
    }
  });
}
