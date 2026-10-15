/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const CACHE_KEY = 'faviconCache';
const TTL = 14 * 24 * 60 * 60 * 1000;
const LOAD_TIMEOUT = 4000;
const LOCAL_ICON_PATHS = ['/favicon.ico', '/favicon.svg', '/favicon.png'];

interface FaviconEntry {
  src: string;
  ts: number;
}

type FaviconCache = Record<string, FaviconEntry>;

let cachePromise: Promise<FaviconCache> | null = null;
let fallbackHash: Promise<string | null> | null = null;
const inflight = new Map<string, Promise<string | null>>();

function isLocalHost(h: string): boolean {
  return (
    h === 'localhost' ||
    h === '[::1]' ||
    !h.includes('.') ||
    /\.(local|lan|internal|home|test)$/.test(h) ||
    /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)
  );
}

function loadCache(): Promise<FaviconCache> {
  cachePromise ??= chrome.storage.local
    .get(CACHE_KEY)
    .then((data) => (data[CACHE_KEY] as FaviconCache) ?? {})
    .catch(() => ({}));
  return cachePromise;
}

async function writeEntry(key: string, src: string): Promise<void> {
  const cache = await loadCache();
  cache[key] = { src, ts: Date.now() };
  try {
    await chrome.storage.local.set({ [CACHE_KEY]: cache });
  } catch {}
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function fetchHttpIconAsDataUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LOAD_TIMEOUT);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

function canLoad(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), LOAD_TIMEOUT);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img.naturalWidth === 0 || img.naturalWidth >= 16);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.src = src;
  });
}

const chromeFaviconUrl = (page: string) =>
  `${chrome.runtime.getURL('/_favicon/')}?pageUrl=${encodeURIComponent(page)}&size=64`;

async function sha256(blob: Blob): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return [...new Uint8Array(buf)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

async function chromeIcon(pageUrl: string): Promise<string | null> {
  if (!chrome.runtime.getManifest().permissions?.includes('favicon')) {
    return null;
  }
  try {
    fallbackHash ??= fetch(chromeFaviconUrl('https://favicon-probe.invalid/'))
      .then((r) => r.blob())
      .then(sha256)
      .catch(() => null);
    const iconUrl = chromeFaviconUrl(pageUrl);
    const blob = await (await fetch(iconUrl)).blob();
    if (!blob.size) return null;
    return (await sha256(blob)) !== (await fallbackHash) ? iconUrl : null;
  } catch {
    return null;
  }
}

async function candidates(u: URL): Promise<string[]> {
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return [];

  const list: string[] = [];
  const fromChrome = await chromeIcon(u.href);
  if (fromChrome) list.push(fromChrome);

  if (isLocalHost(u.hostname)) {
    list.push(...LOCAL_ICON_PATHS.map((path) => u.origin + path));
  } else {
    list.push(`https://favicon.vemetric.com/${u.hostname}?size=64`);
    list.push(`https://icons.duckduckgo.com/ip3/${u.hostname}.ico`);
  }
  return list;
}

export function resolveFavicon(
  pageUrl: string | undefined,
  force = false,
): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(pageUrl || '');
  } catch {
    return Promise.resolve(null);
  }
  if (!url.host) return Promise.resolve(null);

  const key = url.host;
  const taskKey = `${key}|${force}`;
  const running = inflight.get(taskKey);
  if (running) return running;

  const task = (async () => {
    if (!force) {
      const hit = (await loadCache())[key];
      if (hit && Date.now() - hit.ts < TTL) return hit.src;
    }
    for (const src of await candidates(url)) {
      if (src.startsWith('http:')) {
        const dataUrl = await fetchHttpIconAsDataUrl(src);
        if (dataUrl && (await canLoad(dataUrl))) {
          await writeEntry(key, dataUrl);
          return dataUrl;
        }
      } else if (await canLoad(src)) {
        await writeEntry(key, src);
        return src;
      }
    }
    return null;
  })().finally(() => inflight.delete(taskKey));

  inflight.set(taskKey, task);
  return task;
}

export function letterIcon(label: string): string {
  const ch = (label.trim()[0] ?? '?')
    .toUpperCase()
    .replace(/[&<>"']/g, '?');
  let hue = 0;
  for (const c of label) hue = (hue * 31 + c.charCodeAt(0)) % 360;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="hsl(${hue} 45% 45%)"/>` +
    `<text x="32" y="43" font-family="Segoe UI,sans-serif" font-size="32" font-weight="600" text-anchor="middle" fill="#fff">${ch}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
