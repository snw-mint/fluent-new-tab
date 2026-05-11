import { performance } from 'perf_hooks';

// Mock environment
const globalThisMock = global as any;

globalThisMock.window = {
  chrome: {
    permissions: {
      request: (perms: { origins: string[] }, callback: (granted: boolean) => void) => {
        // Simulate an asynchronous permission request overhead
        setTimeout(() => callback(true), 50);
      }
    },
    runtime: { lastError: null }
  }
};

const HOST_PERMISSIONS: Record<string, string[]> = {
  weather: ['https://api.weather.com/*'],
  suggestions: ['https://api.suggestions.com/*'],
  bing: ['https://api.bing.com/*'],
  nasa: ['https://api.nasa.gov/*'],
  wikimedia: ['https://api.wikimedia.org/*']
};

async function requestPermission(origins: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeApi = (window as any).chrome;
    chromeApi.permissions.request({ origins }, (granted: boolean) => {
      resolve(granted);
    });
  });
}

async function originalImplementation(features: string[]) {
  for (const feature of features) {
    const origins = HOST_PERMISSIONS[feature];
    if (origins) await requestPermission(origins);
  }
}

async function optimizedImplementation(features: string[]) {
  const allOrigins: string[] = [];
  for (const feature of features) {
    const origins = HOST_PERMISSIONS[feature];
    if (origins) {
      allOrigins.push(...origins);
    }
  }

  if (allOrigins.length > 0) {
    const uniqueOrigins = [...new Set(allOrigins)];
    await requestPermission(uniqueOrigins);
  }
}

async function runBenchmark() {
  const features = ['weather', 'suggestions', 'bing', 'nasa', 'wikimedia'];

  // Warmup
  await originalImplementation(['weather']);
  await optimizedImplementation(['weather']);

  const startOriginal = performance.now();
  await originalImplementation(features);
  const endOriginal = performance.now();

  const startOptimized = performance.now();
  await optimizedImplementation(features);
  const endOptimized = performance.now();

  console.log(`Original Time: ${(endOriginal - startOriginal).toFixed(2)} ms`);
  console.log(`Optimized Time: ${(endOptimized - startOptimized).toFixed(2)} ms`);
}

runBenchmark().catch(console.error);
