/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { applyAccentColor } from '@/core/boot/theme';

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export async function extractAndApplyAutoColor(
  imageUrl: string,
  wallpaperId: string,
): Promise<void> {
  const mode = localStorage.getItem('accentColorMode') || 'auto';
  if (mode !== 'auto' || !imageUrl || imageUrl === 'none') {
    return;
  }

  const cachedId = localStorage.getItem('autoAccentColorId');
  const cachedColor = localStorage.getItem('autoAccentColorValue');

  if (cachedId === wallpaperId && cachedColor) {
    applyAccentColor(cachedColor);
    return;
  }

  let blobUrl: string | null = null;
  let srcToLoad = imageUrl;

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const res = await fetch(imageUrl);
      if (res.ok) {
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
        srcToLoad = blobUrl;
      }
    } catch (e) {}
  }

  return new Promise((resolve) => {
    const img = new Image();
    if (!blobUrl && !imageUrl.startsWith('data:')) {
      img.crossOrigin = 'Anonymous';
    }

    const cleanup = () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      resolve();
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          cleanup();
          return;
        }

        canvas.width = 10;
        canvas.height = 10;
        context.drawImage(img, 0, 0, 10, 10);

        const imageData = context.getImageData(0, 0, 10, 10).data;
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          const alpha = imageData[i + 3];
          if (alpha < 128) continue;
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
          count++;
        }

        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);

          const hexColor = rgbToHex(r, g, b);

          localStorage.setItem('autoAccentColorId', wallpaperId);
          localStorage.setItem('autoAccentColorValue', hexColor);

          applyAccentColor(hexColor);
        }
      } catch (error) {
        console.warn('Failed to extract wallpaper color:', error);
      } finally {
        cleanup();
      }
    };

    img.onerror = () => {
      console.warn('Error loading image for color extraction.');
      cleanup();
    };

    img.src = srcToLoad;
  });
}
