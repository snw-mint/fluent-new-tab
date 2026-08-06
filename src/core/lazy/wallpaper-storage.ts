/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import {
  WALLPAPER_STORE_NAME,
  openWallpaperDB,
  convertBlobToBase64,
} from '@/core/boot/wallpaper-render';

export { convertBlobToBase64 };

export async function saveWallpaperToDB(
  blob: Blob,
  keyName = 'custom_wallpaper',
): Promise<boolean> {
  try {
    try {
      const base64Data = await convertBlobToBase64(blob);
      localStorage.setItem('wallpaper_local_cache', base64Data);
    } catch (e) {
      console.warn('Could not cache wallpaper in localStorage', e);
    }

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
      try {
        const base64Data = await convertBlobToBase64(blob);
        return await new Promise<boolean>((resolve, reject) => {
          const chromeApi = (window as any).chrome;
          chromeApi.storage.local.set({ [keyName]: base64Data }, () => {
            if (chromeApi.runtime.lastError) {
              reject(new Error(chromeApi.runtime.lastError.message));
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

export function convertImageToWebp(
  imageSource: File | Blob | string,
  maxDimension = 3840,
  quality = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const isString = typeof imageSource === 'string';
    const objectUrl = isString ? imageSource : URL.createObjectURL(imageSource);
    const img = new Image();

    const cleanup = () => {
      if (!isString) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) resolve(blob);
            else reject(new Error('Error converting to WebP'));
          },
          'image/webp',
          quality,
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    img.onerror = (error) => {
      cleanup();
      reject(error);
    };

    img.src = objectUrl;
  });
}

export function processWallpaperImage(file: File): Promise<Blob> {
  return convertImageToWebp(file, 2560, 0.85);
}
