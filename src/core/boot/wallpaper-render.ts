/*
 * Fluent New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { getWallpaperCache } from '@/core/shared/state';

const WALLPAPER_DB_NAME = 'FluentNewTabDB';
const WALLPAPER_DB_VERSION = 1;
export const WALLPAPER_STORE_NAME = 'wallpapers';

let dbPromise: Promise<IDBDatabase> | null = null;
let currentWallpaperObjectUrl: string | null = null;

export function setTrackedWallpaperObjectUrl(nextUrl: string | null): void {
  if (currentWallpaperObjectUrl && currentWallpaperObjectUrl !== nextUrl) {
    URL.revokeObjectURL(currentWallpaperObjectUrl);
  }
  currentWallpaperObjectUrl = nextUrl && nextUrl.startsWith('blob:') ? nextUrl : null;
}

export function openWallpaperDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(WALLPAPER_DB_NAME, WALLPAPER_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WALLPAPER_STORE_NAME)) {
        db.createObjectStore(WALLPAPER_STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.onclose = () => {
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = (event) => {
      dbPromise = null;
      const errorMsg = (event.target as IDBOpenDBRequest).error?.name || 'UnknownError';
      reject('Error opening database: ' + errorMsg);
    };
  });
  return dbPromise;
}

export async function getWallpaperFromDB(keyName = 'custom_wallpaper'): Promise<Blob | null> {
  try {
    const db = await openWallpaperDB();

    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readonly');
      const store = transaction.objectStore(WALLPAPER_STORE_NAME);
      const request = store.get(keyName);

      request.onsuccess = (event) => resolve((event.target as IDBRequest<Blob | undefined>).result ?? null);
      request.onerror = () => reject(new Error('Error reading from DB'));
    });
  } catch {
    return null;
  }
}

export function getActiveWallpaperKey(): string {
  const isDual = localStorage.getItem('dualWallpaperEnabled') === 'true';
  if (!isDual) {
    return 'custom_wallpaper';
  }
  const savedTheme = localStorage.getItem('theme') || 'auto';
  const isDark =
    savedTheme === 'dark' ||
    (savedTheme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return isDark ? 'custom_wallpaper_dark' : 'custom_wallpaper_light';
}

export async function getActiveWallpaperData(): Promise<{ blob: Blob | null; key: string }> {
  const isDual = localStorage.getItem('dualWallpaperEnabled') === 'true';
  if (!isDual) {
    const blob = await getWallpaperFromDB('custom_wallpaper');
    return { blob, key: 'custom_wallpaper' };
  }
  const key = getActiveWallpaperKey();
  const blob = await getWallpaperFromDB(key);
  if (blob) {
    return { blob, key };
  }
  const fallback = await getWallpaperFromDB('custom_wallpaper');
  return { blob: fallback, key: 'custom_wallpaper' };
}

export async function getActiveWallpaperBlob(): Promise<Blob | null> {
  const { blob } = await getActiveWallpaperData();
  return blob;
}

export function updateOverlay(sliderValue: number, isEnabled: boolean): void {
  let val = Number(sliderValue);
  if (isNaN(val)) val = 10;
  if (val > 0 && val <= 1) val = val * 100;
  const overlayOpacity = isEnabled ? (val / 100) * 0.9 : 0;
  document.documentElement.style.setProperty('--wallpaper-overlay', String(overlayOpacity));
}

export function updateBlur(val: number): void {
  const v = Math.max(0, Number(val) || 0);
  if (v > 0) {
    document.documentElement.style.setProperty('--wallpaper-blur', `blur(${v}px)`);
    document.documentElement.setAttribute('data-wallpaper-blur', 'true');
    if (document.body) {
      document.body.setAttribute('data-wallpaper-blur', 'true');
    }
  } else {
    document.documentElement.style.removeProperty('--wallpaper-blur');
    document.documentElement.removeAttribute('data-wallpaper-blur');
    if (document.body) {
      document.body.removeAttribute('data-wallpaper-blur');
    }
  }
}

export function hideCreditsBoot(): void {
  const creditsDiv = document.getElementById('wallpaperCredits');
  if (creditsDiv) {
    creditsDiv.classList.add('hidden');
  }
}

function safeRenderCreditHtml(container: HTMLElement, htmlString: string): void {
  container.textContent = '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const nodes = doc.body.childNodes;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        container.appendChild(document.createTextNode(node.textContent || ''));
      } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName.toLowerCase() === 'a') {
        const anchorNode = node as HTMLAnchorElement;
        const href = anchorNode.getAttribute('href') || '';

        if (/^https?:\/\//i.test(href)) {
          const a = document.createElement('a');
          a.href = href;
          a.target = '_blank';
          a.className = 'wallpaper-credit-link';
          a.style.cssText = 'color: inherit; text-decoration: none; pointer-events: auto;';
          a.textContent = anchorNode.textContent || '';
          container.appendChild(a);
        } else {
          container.appendChild(document.createTextNode(anchorNode.textContent || ''));
        }
      }
    }
  } catch (e) {
    container.textContent = htmlString.replace(/<[^>]*>?/gm, '');
  }
}

export function showCreditsBoot(sourceType: string): void {
  const creditsDiv = document.getElementById('wallpaperCredits');
  const creditTextSpan = document.getElementById('wallpaperCreditText');
  if (!creditsDiv || !creditTextSpan) return;

  const cacheKey = `wallpaper_cache_${sourceType}`;
  try {
    const cached = getWallpaperCache(cacheKey);
    if (cached && (cached.creditHtml || cached.credit || cached.creditUrl)) {
      if (cached.creditHtml) {
        safeRenderCreditHtml(creditTextSpan, cached.creditHtml);
      } else {
        const text = cached.credit || 'Daily Wallpaper';
        const url = cached.creditUrl || '';

        if (url) {
          creditTextSpan.textContent = '';
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.className = 'wallpaper-credit-link';
          a.style.cssText = 'color: inherit; text-decoration: none; pointer-events: auto;';
          a.textContent = text;
          creditTextSpan.appendChild(a);
        } else {
          creditTextSpan.textContent = text;
        }
      }
      creditsDiv.classList.remove('hidden');
    } else {
      creditsDiv.classList.add('hidden');
    }
  } catch (e) {
    creditsDiv.classList.add('hidden');
  }
}

export function isWallpaperCacheValid(type: string): boolean {
  const cacheKey = `wallpaper_cache_${type}`;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const cached = getWallpaperCache(cacheKey);
    return !!(cached && cached.url && cached.date === today && 'creditUrl' in cached);
  } catch {
    return false;
  }
}

export function clearWallpaper(): void {
  setTrackedWallpaperObjectUrl(null);
  document.documentElement.style.setProperty('--wallpaper-image', 'none');
  document.body.removeAttribute('data-wallpaper-active');
  const earlyStyle = document.getElementById('early-wallpaper-style');
  if (earlyStyle) earlyStyle.remove();
  document.querySelectorAll('.wallpaper-crossfade-layer').forEach((el) => el.remove());
  updateOverlay(0, false);
  hideCreditsBoot();
}

export async function bootWallpaper(enabled: boolean, source: string, type: string, overlay: number): Promise<void> {
  if (!enabled) {
    clearWallpaper();
    return;
  }

  let url = '';
  let wallpaperId = '';
  let appliedEarly = false;

  const earlyPromise = (window as any).__earlyWallpaperPromise as
    | Promise<{ url: string; id: string } | null>
    | undefined;
  if (earlyPromise) {
    try {
      const earlyResult = await earlyPromise;
      if (earlyResult && earlyResult.url) {
        url = earlyResult.url;
        wallpaperId = earlyResult.id;
        appliedEarly = true;
        setTrackedWallpaperObjectUrl(url);
      }
    } catch {}
    delete (window as any).__earlyWallpaperPromise;
  }

  if (!url) {
    if (source === 'local' && type === 'upload') {
      try {
        const { blob, key } = await getActiveWallpaperData();
        if (blob) {
          url = URL.createObjectURL(blob);
          wallpaperId = key;
          setTrackedWallpaperObjectUrl(url);
        }
      } catch {}
    } else if (source === 'api') {
      const cacheKey = `wallpaper_cache_${type}`;
      try {
        const cached = getWallpaperCache(cacheKey);
        const today = new Date().toISOString().slice(0, 10);
        if (cached && cached.url && cached.date === today) {
          url = cached.url;
          wallpaperId = cached.url;
        }
      } catch {}
    }
  }

  if (url) {
    updateOverlay(overlay, true);

    if (!appliedEarly) {
      const img = new Image();
      img.src = url;
      await img.decode().catch(() => {});
      document.documentElement.style.setProperty('--wallpaper-image', `url('${url}')`);
      document.body.setAttribute('data-wallpaper-active', 'true');
    }

    if (source === 'api') {
      showCreditsBoot(type);
    } else {
      hideCreditsBoot();
    }

    if ((localStorage.getItem('accentColorMode') || 'auto') === 'auto') {
      import('@/core/lazy/color-extractor').then(({ extractAndApplyAutoColor }) => {
        extractAndApplyAutoColor(url, wallpaperId || url);
      });
    }
  } else if (source !== 'api') {
    clearWallpaper();
  }
}
