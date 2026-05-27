import {
  savedTheme,
  accentColorEnabled,
  accentColorValue,
} from '@/core/shared/state';

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
