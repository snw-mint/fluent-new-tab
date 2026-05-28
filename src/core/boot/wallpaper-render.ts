/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

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

export function updateOverlay(opacityValue: number, isEnabled: boolean): void {
  const finalOpacity = isEnabled ? String(opacityValue) : '0';
  document.documentElement.style.setProperty('--overlay-opacity', finalOpacity);
}

function hideCreditsBoot(): void {
  const creditsDiv = document.getElementById('wallpaperCredits');
  if (creditsDiv) {
    creditsDiv.classList.add('hidden');
  }
}

function showCreditsBoot(sourceType: string): void {
  const creditsDiv = document.getElementById('wallpaperCredits');
  const creditTextSpan = document.getElementById('wallpaperCreditText');
  if (!creditsDiv || !creditTextSpan) return;

  const cacheKey = `wallpaper_cache_${sourceType}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && (cached.credit || cached.creditUrl)) {
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
      creditsDiv.classList.remove('hidden');
    } else {
      creditsDiv.classList.add('hidden');
    }
  } catch (e) {
    creditsDiv.classList.add('hidden');
  }
}

export function clearWallpaper(): void {
  document.body.style.backgroundImage = 'none';
  document.body.removeAttribute('data-wallpaper-active');
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
    const blob = await getWallpaperFromDB();
    if (blob) url = URL.createObjectURL(blob);
  } else if (source === 'api') {
    const cacheKey = `wallpaper_cache_${type}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      const today = new Date().toISOString().slice(0, 10);
      if (cached && cached.url && cached.date === today) {
        url = cached.url;
      }
    } catch {}
  }

  if (url) {
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.setAttribute('data-wallpaper-active', 'true');
    updateOverlay(overlay, true);
    if (source === 'api') {
      showCreditsBoot(type);
    } else {
      hideCreditsBoot();
    }
  } else {
    clearWallpaper();
  }
}
