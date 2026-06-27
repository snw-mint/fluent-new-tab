/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import {
  savedTheme,
  accentColorEnabled,
  accentColorValue,
} from '@/core/shared/state';

export const DEFAULT_ACCENT_COLOR = '#0078D4';

export function updateTabFavicon(accentColor?: string): void {
  const hasCustomFavicon =
    localStorage.getItem('tabFavicon') || localStorage.getItem('tabIcon');
  if (hasCustomFavicon) {
    return;
  }

  let color = accentColor;
  if (!color) {
    const enabled = localStorage.getItem('accentColorEnabled') !== 'false';
    const savedColor =
      localStorage.getItem('accentColorValue') || DEFAULT_ACCENT_COLOR;
    color = enabled ? savedColor : DEFAULT_ACCENT_COLOR;
  }

  const svgContent = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.45 2.533a2.25 2.25 0 0 0-2.9 0L3.8 8.228a2.25 2.25 0 0 0-.8 1.72v9.305c0 .966.784 1.75 1.75 1.75h3a1.75 1.75 0 0 0 1.75-1.75V15.25c0-.68.542-1.232 1.217-1.25h2.566a1.25 1.25 0 0 1 1.217 1.25v4.003c0 .966.784 1.75 1.75 1.75h3a1.75 1.75 0 0 0 1.75-1.75V9.947a2.25 2.25 0 0 0-.8-1.72z" fill="${color}"/></svg>`;
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = dataUri;
}

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
  updateTabFavicon(color);
}


export function applyTheme(theme: string): void {
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

export function applyInitialAccentColorState(): void {
  const colorToApply = accentColorEnabled
    ? accentColorValue
    : DEFAULT_ACCENT_COLOR;
  applyAccentColor(colorToApply);
}
