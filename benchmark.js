const { performance } = require('perf_hooks');

const locale = 'en-US';
const showSeconds = true;
const use12Hour = true;
const now = new Date();

// Baseline: creating new instance every time
function baseline() {
  for (let i = 0; i < 10000; i++) {
    const parts = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: use12Hour,
    }).formatToParts(now);
  }
}

// Optimized: caching the instance
const cache = new Map();
function optimized() {
  for (let i = 0; i < 10000; i++) {
    const key = `${locale}:${showSeconds}:${use12Hour}`;
    let formatter = cache.get(key);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: use12Hour,
      });
      cache.set(key, formatter);
    }
    const parts = formatter.formatToParts(now);
  }
}

const start1 = performance.now();
baseline();
const end1 = performance.now();
console.log(`Baseline (10000 iterations): ${(end1 - start1).toFixed(2)} ms`);

const start2 = performance.now();
optimized();
const end2 = performance.now();
console.log(`Optimized (10000 iterations): ${(end2 - start2).toFixed(2)} ms`);
