export const HOST_PERMISSIONS: Record<string, string[]> = {
  bing: ['https://peapix.com/*', 'https://img.peapix.com/*'],
  nasa: ['https://api.nasa.gov/*', 'https://apod.nasa.gov/*'],
  wikimedia: [
    'https://commons.wikimedia.org/*',
    'https://upload.wikimedia.org/',
  ],
  suggestions: ['https://suggestqueries.google.com/*'],
  weather: [
    'https://geocoding-api.open-meteo.com/*',
    'https://api.open-meteo.com/*',
  ],
  weatherAlerts: [
    'https://api.open-meteo.com/*',
    'https://air-quality-api.open-meteo.com/*',
  ],
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
