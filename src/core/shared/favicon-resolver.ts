/*
 * Fluent New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { sanitizeUrl } from '@/core/shared/dom-utils';
import { Shortcut } from '@/core/shared/types';

const CACHE_KEY = 'faviconCache';
const CUSTOM_ICON_PREFIX = 'custom:';
const TTL = 14 * 24 * 60 * 60 * 1000;
const LOAD_TIMEOUT = 4000;
const CACHE_FLUSH_DELAY = 150;
const MAX_INLINE_ICON_BYTES = 64 * 1024;
const MAX_CACHE_BYTES = 4 * 1024 * 1024;
const LOCAL_ICON_PATHS = ['/favicon.ico', '/favicon.svg', '/favicon.png'];

interface FaviconEntry {
  src: string;
  ts: number;
}

type FaviconCache = Record<string, FaviconEntry>;

let cachePromise: Promise<FaviconCache> | null = null;
let loadedCache: FaviconCache | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let fallbackHash: Promise<string | null> | null = null;
const inflight = new Map<string, Promise<string | null>>();

function isLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '[::1]' ||
    !hostname.includes('.') ||
    /\.(local|lan|internal|home|test)$/.test(hostname) ||
    /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)
  );
}

function loadCache(): Promise<FaviconCache> {
  cachePromise ??= chrome.storage.local
    .get(CACHE_KEY)
    .then((stored) => {
      loadedCache = (stored[CACHE_KEY] as FaviconCache) ?? {};
      return loadedCache;
    })
    .catch(() => {
      loadedCache = {};
      return loadedCache;
    });
  return cachePromise;
}

function flushCache(): void {
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!loadedCache) return;
  try {
    void chrome.storage.local.set({ [CACHE_KEY]: loadedCache }).catch(() => {});
  } catch {}
}

window.addEventListener('pagehide', () => {
  if (flushTimer !== null) flushCache();
});

function getCacheInlineBytes(cache: FaviconCache): number {
  let totalBytes = 0;
  for (const key in cache) {
    const src = cache[key].src;
    if (src.startsWith('data:')) {
      totalBytes += src.length;
    }
  }
  return totalBytes;
}

function pruneExpiredEntries(cache: FaviconCache, now: number): boolean {
  let removed = false;
  for (const key in cache) {
    if (now - cache[key].ts >= TTL) {
      delete cache[key];
      removed = true;
    }
  }
  return removed;
}

function canInlineInCache(cache: FaviconCache): boolean {
  if (getCacheInlineBytes(cache) < MAX_CACHE_BYTES) return true;
  if (pruneExpiredEntries(cache, Date.now())) {
    scheduleCacheFlush();
  }
  return getCacheInlineBytes(cache) < MAX_CACHE_BYTES;
}

function scheduleCacheFlush(): void {
  if (flushTimer !== null) clearTimeout(flushTimer);
  flushTimer = setTimeout(flushCache, CACHE_FLUSH_DELAY);
}

async function writeEntry(key: string, src: string): Promise<void> {
  const cache = await loadCache();
  cache[key] = { src, ts: Date.now() };
  scheduleCacheFlush();
}

export function pruneFaviconCache(shortcuts: Shortcut[]): void {
  void loadCache().then((cache) => {
    const activeKeys = new Set<string>();
    const collectKeys = (list: Shortcut[]) => {
      for (const entry of list) {
        if (entry.url) {
          try {
            const parsed = new URL(entry.url);
            if (parsed.host) activeKeys.add(parsed.host);
          } catch {}
        }
        if (entry.customIcon) {
          try {
            const parsedIcon = new URL(sanitizeUrl(entry.customIcon));
            if (parsedIcon.protocol === 'http:' || parsedIcon.protocol === 'https:') {
              activeKeys.add(`${CUSTOM_ICON_PREFIX}${parsedIcon.href}`);
            }
          } catch {}
        }
        if (entry.children && entry.children.length > 0) {
          collectKeys(entry.children);
        }
      }
    };

    collectKeys(shortcuts);
    const now = Date.now();
    let changed = false;

    for (const key in cache) {
      if (!activeKeys.has(key) || now - cache[key].ts >= TTL) {
        delete cache[key];
        changed = true;
      }
    }

    if (changed) {
      scheduleCacheFlush();
    }
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function fetchIconAsCacheableSrc(url: string, allowInline: boolean): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOAD_TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) return null;
    const finalUrl = res.url || url;
    if (!allowInline) {
      void res.body?.cancel();
      return (await canLoad(finalUrl)) ? finalUrl : null;
    }
    const blob = await res.blob();
    if (!blob.size) return null;
    if (blob.size <= MAX_INLINE_ICON_BYTES) {
      const dataUrl = await blobToDataUrl(blob);
      if (await canLoad(dataUrl)) return dataUrl;
      return null;
    }
    return (await canLoad(finalUrl)) ? finalUrl : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
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
  return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hasChromeFaviconApi(): boolean {
  try {
    return Boolean(chrome.runtime?.getManifest?.().permissions?.includes('favicon'));
  } catch {
    return false;
  }
}

function isLocalFaviconUrl(src: string): boolean {
  return src.includes('/_favicon/?pageUrl=');
}

function chromeCandidatePages(u: URL): string[] {
  const pages = new Set<string>([u.href, `${u.origin}/`]);
  if (!isLocalHost(u.hostname)) {
    if (u.hostname.startsWith('www.')) {
      const bareHost = u.host.slice(4);
      pages.add(`${u.protocol}//${bareHost}${u.pathname}${u.search}`);
      pages.add(`${u.protocol}//${bareHost}/`);
    } else if (u.hostname.split('.').length === 2) {
      pages.add(`${u.protocol}//www.${u.host}${u.pathname}${u.search}`);
      pages.add(`${u.protocol}//www.${u.host}/`);
    }
  }
  return [...pages];
}

async function chromeIcon(u: URL): Promise<string | null> {
  if (!hasChromeFaviconApi()) {
    return null;
  }
  try {
    fallbackHash ??= fetch(chromeFaviconUrl('https://favicon-probe.invalid/'))
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => (b && b.size ? sha256(b) : null))
      .catch(() => null);
    const fbHash = await fallbackHash;
    if (!fbHash) return null;
    for (const pageUrl of chromeCandidatePages(u)) {
      const iconUrl = chromeFaviconUrl(pageUrl);
      const res = await fetch(iconUrl);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!blob.size) continue;
      if ((await sha256(blob)) !== fbHash) {
        return iconUrl;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function remoteCandidates(u: URL): string[] {
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return [];
  if (isLocalHost(u.hostname)) {
    return LOCAL_ICON_PATHS.map((path) => u.origin + path);
  }
  return [`https://favicon.vemetric.com/${u.hostname}?size=64`];
}

function isValidCachedSrc(src: string, allowChromeExt: boolean): boolean {
  if (!src) return false;
  if (src.includes('icons.duckduckgo.com')) return false;
  if (src.includes('default=none')) return false;
  if (isLocalFaviconUrl(src)) return allowChromeExt;
  return true;
}

export function resolveFavicon(pageUrl: string | undefined, force = false): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(pageUrl || '');
  } catch {
    return Promise.resolve(null);
  }
  if (!url.host) return Promise.resolve(null);

  const key = url.host;
  const taskKey = `${url.href}|${force}`;
  const running = inflight.get(taskKey);
  if (running) return running;

  const task = (async () => {
    const canUseChrome = hasChromeFaviconApi();
    const cache = await loadCache();
    const hit = !force ? cache[key] : undefined;
    const hasValidCache = Boolean(
      hit && Date.now() - hit.ts < TTL && isValidCachedSrc(hit.src, canUseChrome),
    );

    if (hasValidCache && hit) {
      if (canUseChrome && !isLocalFaviconUrl(hit.src) && !hit.src.startsWith('data:')) {
        void chromeIcon(url).then((fromChrome) => {
          if (fromChrome) void writeEntry(key, fromChrome);
        });
      }
      return hit.src;
    }

    if (canUseChrome) {
      const fromChrome = await chromeIcon(url);
      if (fromChrome) {
        await writeEntry(key, fromChrome);
        return fromChrome;
      }
    }

    for (const src of remoteCandidates(url)) {
      const cachedSrc = await fetchIconAsCacheableSrc(src, canInlineInCache(cache));
      if (cachedSrc) {
        await writeEntry(key, cachedSrc);
        return cachedSrc;
      }
      if (await canLoad(src)) {
        await writeEntry(key, src);
        return src;
      }
    }
    return null;
  })().finally(() => inflight.delete(taskKey));

  inflight.set(taskKey, task);
  return task;
}

export function resolveCustomIcon(rawIconUrl: string, force = false): Promise<string | null> {
  if (!rawIconUrl) return Promise.resolve(null);
  if (rawIconUrl.startsWith('data:') || rawIconUrl.startsWith('blob:')) {
    return Promise.resolve(rawIconUrl);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawIconUrl);
  } catch {
    return Promise.resolve(rawIconUrl);
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return Promise.resolve(rawIconUrl);
  }

  const normalizedUrl = parsedUrl.href;
  const cacheKey = `${CUSTOM_ICON_PREFIX}${normalizedUrl}`;
  const taskKey = `${cacheKey}|${force}`;
  const running = inflight.get(taskKey);
  if (running) return running;

  const task = (async () => {
    const cache = await loadCache();
    const hit = !force ? cache[cacheKey] : undefined;
    if (hit && Date.now() - hit.ts < TTL && hit.src) {
      return hit.src;
    }

    const cachedSrc = await fetchIconAsCacheableSrc(normalizedUrl, canInlineInCache(cache));
    if (cachedSrc) {
      await writeEntry(cacheKey, cachedSrc);
      return cachedSrc;
    }

    if (await canLoad(normalizedUrl)) {
      await writeEntry(cacheKey, normalizedUrl);
      return normalizedUrl;
    }

    return null;
  })().finally(() => inflight.delete(taskKey));

  inflight.set(taskKey, task);
  return task;
}

export function letterIcon(label: string): string {
  const ch = (label.trim()[0] ?? '?').toUpperCase().replace(/[&<>"']/g, '?');
  let hue = 0;
  for (const c of label) hue = (hue * 31 + c.charCodeAt(0)) % 360;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="14" fill="hsl(${hue} 45% 45%)"/>` +
    `<text x="32" y="43" font-family="Segoe UI,sans-serif" font-size="32" font-weight="600" text-anchor="middle" fill="#fff">${ch}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
