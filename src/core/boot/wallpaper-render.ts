/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { getWallpaperCache } from '@/core/shared/state';

export const WALLPAPER_DB_NAME = 'FluentNewTabDB';
export const WALLPAPER_DB_VERSION = 1;
export const WALLPAPER_STORE_NAME = 'wallpapers';

export function openWallpaperDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(WALLPAPER_DB_NAME, WALLPAPER_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WALLPAPER_STORE_NAME)) {
        db.createObjectStore(WALLPAPER_STORE_NAME);
      }
    };

    request.onsuccess = (event) =>
      resolve((event.target as IDBOpenDBRequest).result);

    request.onerror = (event) => {
      const errorMsg =
        (event.target as IDBOpenDBRequest).error?.name || 'UnknownError';
      reject('Error opening database: ' + errorMsg);
    };
  });
}

export function convertBase64ToBlob(base64: string): Promise<Blob> {
  return fetch(base64).then((res) => res.blob());
}

export function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error('Failed to convert Blob to Base64'));
    reader.readAsDataURL(blob);
  });
}

export async function getWallpaperFromDB(
  keyName = 'custom_wallpaper',
): Promise<Blob | null> {
  try {
    const db = await openWallpaperDB();

    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readonly');
      const store = transaction.objectStore(WALLPAPER_STORE_NAME);
      const request = store.get(keyName);

      request.onsuccess = (event) =>
        resolve((event.target as IDBRequest<Blob | undefined>).result ?? null);
      request.onerror = () => reject(new Error('Error reading from DB'));
    });
  } catch (error) {
    const errorString = String(error);

    if (
      errorString.includes('InvalidStateError') ||
      errorString.includes('Error opening database')
    ) {
      return await new Promise<Blob | null>((resolve) => {
        const chromeApi = (window as any).chrome;
        chromeApi.storage.local.get([keyName], async (result: any) => {
          if (result[keyName]) {
            try {
              const blob = await convertBase64ToBlob(String(result[keyName]));
              resolve(blob);
            } catch (e) {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      });
    }
    throw error;
  }
}

export function updateOverlay(sliderValue: number, isEnabled: boolean): void {
  let val = Number(sliderValue);
  if (isNaN(val)) val = 10;
  if (val > 0 && val <= 1) val = val * 100;
  const overlayOpacity = isEnabled ? (val / 100) * 0.9 : 0;
  document.documentElement.style.setProperty(
    '--wallpaper-overlay',
    String(overlayOpacity),
  );
}

export function hideCreditsBoot(): void {
  const creditsDiv = document.getElementById('wallpaperCredits');
  if (creditsDiv) {
    creditsDiv.classList.add('hidden');
  }
}

function safeRenderCreditHtml(
  container: HTMLElement,
  htmlString: string,
): void {
  container.textContent = '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const nodes = doc.body.childNodes;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        container.appendChild(document.createTextNode(node.textContent || ''));
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.nodeName.toLowerCase() === 'a'
      ) {
        const anchorNode = node as HTMLAnchorElement;
        const href = anchorNode.getAttribute('href') || '';

        if (/^https?:\/\//i.test(href)) {
          const a = document.createElement('a');
          a.href = href;
          a.target = '_blank';
          a.className = 'wallpaper-credit-link';
          a.style.cssText =
            'color: inherit; text-decoration: none; pointer-events: auto;';
          a.textContent = anchorNode.textContent || '';
          container.appendChild(a);
        } else {
          container.appendChild(
            document.createTextNode(anchorNode.textContent || ''),
          );
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
          a.style.cssText =
            'color: inherit; text-decoration: none; pointer-events: auto;';
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
    return !!(
      cached &&
      cached.url &&
      cached.date === today &&
      'creditUrl' in cached
    );
  } catch {
    return false;
  }
}

export function clearWallpaper(): void {
  document.documentElement.style.setProperty('--wallpaper-image', 'none');
  document.body.removeAttribute('data-wallpaper-active');
  try {
    localStorage.removeItem('wallpaper_local_cache');
  } catch {}
  const earlyBg = document.getElementById('early-bg-black');
  if (earlyBg) earlyBg.remove();
  const earlyFade = document.getElementById('wallpaper-fade-overlay');
  if (earlyFade) earlyFade.remove();
  const earlyStyle = document.getElementById('early-wallpaper-style');
  if (earlyStyle) earlyStyle.remove();
  document.documentElement.removeAttribute('data-early-wallpaper');
  updateOverlay(0, false);
  hideCreditsBoot();
}

export async function bootWallpaper(
  enabled: boolean,
  source: string,
  type: string,
  overlay: number,
): Promise<void> {
  if (!enabled) {
    clearWallpaper();
    return;
  }

  let url = '';
  if (source === 'local' && type === 'upload') {
    url = localStorage.getItem('wallpaper_local_cache') || '';
    if (!url) {
      const blob = await getWallpaperFromDB();
      if (blob) {
        url = URL.createObjectURL(blob);
        try {
          const base64 = await convertBlobToBase64(blob);
          localStorage.setItem('wallpaper_local_cache', base64);
        } catch {}
      }
    }
  } else if (source === 'api') {
    const cacheKey = `wallpaper_cache_${type}`;
    try {
      const cached = getWallpaperCache(cacheKey);
      const today = new Date().toISOString().slice(0, 10);
      if (cached && cached.url && cached.date === today) {
        url = cached.url;
      }
    } catch {}
  }

  if (url) {
    updateOverlay(overlay, true);
    document.documentElement.style.setProperty(
      '--wallpaper-image',
      `url('${url}')`,
    );
    document.body.setAttribute('data-wallpaper-active', 'true');

    if (source === 'api') {
      showCreditsBoot(type);
    } else {
      hideCreditsBoot();
    }
  } else if (source !== 'api') {
    clearWallpaper();
  }
}
