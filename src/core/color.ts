import {
  toggleAppearance,
  accentColorOptions,
  toggleAccentWallpaper,
  themeBtns,
} from './dom-references.js';
import {
  accentColorEnabled,
  accentColorMode,
  accentColorValue,
  savedTheme,
} from './state.js';
import { setCollapsible } from './ui-components.js';
import { ThemeMode } from './types.js';

/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file manages accent color application, contrast calculation,
 * and dynamic color extraction from images for theming.
 */

export const DEFAULT_ACCENT_COLOR = '#0078D4';

export function applyAccentColor(color: string): void {
  document.documentElement.style.setProperty('--accent-color', color);
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  document.documentElement.style.setProperty(
    '--accent-contrast-color',
    yiq >= 128 ? '#202020' : '#FFFFFF',
  );
}

export async function getAverageColorFromImage(
  imageUrl: string,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve(DEFAULT_ACCENT_COLOR);

      const size = 10;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      try {
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        if (count === 0) return resolve(DEFAULT_ACCENT_COLOR);

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        resolve(hex);
      } catch {
        resolve(DEFAULT_ACCENT_COLOR);
      }
    };

    img.onerror = () => resolve(DEFAULT_ACCENT_COLOR);
    img.src = imageUrl;
  });
}

export async function handleAutoAccentColor(
  imageUrl: string,
  wallpaperId: string,
): Promise<void> {
  const isEnabled = localStorage.getItem('accentColorEnabled') === 'true';
  if (!isEnabled) return;

  const mode = localStorage.getItem('accentColorMode') || 'auto';
  if (mode !== 'auto') return;

  const cachedId = localStorage.getItem('autoAccentColorId');
  const cachedColor = localStorage.getItem('autoAccentColorValue');

  if (cachedId === wallpaperId && cachedColor) {
    applyAccentColor(cachedColor);
    return;
  }

  const extractedColor = await getAverageColorFromImage(imageUrl);
  localStorage.setItem('autoAccentColorId', wallpaperId);
  localStorage.setItem('autoAccentColorValue', extractedColor);

  applyAccentColor(extractedColor);
}

export function applyInitialAccentColorState(): void {
  if (toggleAppearance) {
    toggleAppearance.checked = accentColorEnabled;
    setCollapsible(accentColorOptions, accentColorEnabled, false);
  }
  if (toggleAccentWallpaper)
    toggleAccentWallpaper.checked = accentColorMode === 'auto';

  const colorToApply = accentColorEnabled
    ? accentColorValue
    : DEFAULT_ACCENT_COLOR;
  applyAccentColor(colorToApply);
}

export function applyTheme(theme: ThemeMode): void {
  if (themeBtns) {
    themeBtns.forEach((btn) =>
      btn.classList.toggle('active', btn.dataset.theme === theme),
    );
  }
  document.documentElement.removeAttribute('data-theme');
  if (theme === 'auto') {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function applyInitialTheme(): void {
  applyTheme(savedTheme);
}

export function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => v - v * s * Math.max(Math.min(k(n), 4 - k(n), 1), 0);
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16) || 0,
    g: parseInt(cleanHex.substring(2, 4), 16) || 0,
    b: parseInt(cleanHex.substring(4, 6), 16) || 0,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}
