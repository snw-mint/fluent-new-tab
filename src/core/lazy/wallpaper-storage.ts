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

const MAX_LOCALSTORAGE_CACHE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB

export async function saveWallpaperToDB(
  blob: Blob,
  keyName = 'custom_wallpaper',
): Promise<boolean> {
  const db = await openWallpaperDB();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WALLPAPER_STORE_NAME);
    const request = store.put(blob, keyName);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error('INDEXED_DB_WRITE_ERROR'));
  });

  if (blob.size <= MAX_LOCALSTORAGE_CACHE_BYTES) {
    try {
      const base64Data = await convertBlobToBase64(blob);
      localStorage.setItem('wallpaper_local_cache', base64Data);
    } catch {
      localStorage.removeItem('wallpaper_local_cache');
    }
  } else {
    localStorage.removeItem('wallpaper_local_cache');
  }

  return true;
}
