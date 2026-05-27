import {
  WALLPAPER_STORE_NAME,
  openWallpaperDB,
} from '@/core/boot/wallpaper-render';

export function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error('Failed to convert Blob to Base64'));
    reader.readAsDataURL(blob);
  });
}

export async function saveWallpaperToDB(
  blob: Blob,
  keyName = 'custom_wallpaper',
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
