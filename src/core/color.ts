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

const DEFAULT_ACCENT_COLOR = '#0078D4';

function applyAccentColor(color: string): void {
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

async function getAverageColorFromImage(imageUrl: string): Promise<string> {
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

async function handleAutoAccentColor(
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

function applyInitialAccentColorState(): void {
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

function applyTheme(theme: ThemeMode): void {
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

function applyInitialTheme(): void {
  applyTheme(savedTheme);
}
