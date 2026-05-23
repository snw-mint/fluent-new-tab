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

export function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error('Failed to convert Blob to Base64'));
    reader.readAsDataURL(blob);
  });
}

export function convertBase64ToBlob(base64: string): Promise<Blob> {
  return fetch(base64).then((res) => res.blob());
}

export async function saveWallpaperToDB(
  blob: Blob,
  keyName: string = 'custom_wallpaper',
): Promise<boolean> {
  try {
    const db = await openWallpaperDB();

    return await new Promise<boolean>((resolve, reject) => {
      const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(WALLPAPER_STORE_NAME);
      const request = store.put(blob, keyName);

      request.onsuccess = () => resolve(true);
      request.onerror = () =>
        reject(
          new Error(
            'Cannot save wallpaper. You may have hit the maximum storage capacity.',
          ),
        );
    });
  } catch (error) {
    const errorString = String(error);

    if (
      errorString.includes('InvalidStateError') ||
      errorString.includes('Error opening database')
    ) {
      console.warn(
        'IndexedDB restricted. Falling back to chrome.storage.local...',
      );

      try {
        const base64Data = await convertBlobToBase64(blob);
        return await new Promise<boolean>((resolve, reject) => {
          chrome.storage.local.set({ [keyName]: base64Data }, () => {
            // @ts-expect-error: Bypassing incomplete local chrome.runtime typings
            if (chrome.runtime.lastError) {
              // @ts-expect-error: Bypassing incomplete local chrome.runtime typings
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(true);
            }
          });
        });
      } catch (fallbackError) {
        throw new Error('Both IndexedDB and local storage fallback failed.');
      }
    }

    throw error;
  }
}

export async function getWallpaperFromDB(
  keyName: string = 'custom_wallpaper',
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
      console.warn(
        'IndexedDB restricted. Fetching from chrome.storage.local...',
      );

      return await new Promise<Blob | null>((resolve) => {
        chrome.storage.local.get([keyName], async (result) => {
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

export function convertImageToWebp(
  imageSource: string,
  maxWidth = 1920,
  quality = 0.82,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSource;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Error converting to WebP'));
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = (error) => reject(error);
  });
}

export function processWallpaperImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const screenMax =
        Math.max(window.screen.width, window.screen.height) *
        (window.devicePixelRatio || 1);
      const targetWidth =
        screenMax >= 3840 ? 3840 : screenMax >= 2560 ? 2560 : 1920;
      const targetQuality = screenMax >= 3840 ? 0.88 : 0.8;

      convertImageToWebp(
        String((event.target as FileReader).result || ''),
        targetWidth,
        targetQuality,
      )
        .then(resolve)
        .catch(reject);
    };

    reader.onerror = (error) => reject(error);
  });
}
