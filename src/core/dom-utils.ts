/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file provides utility functions for common DOM manipulations and element retrieval.
 */

export function getById<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function getInputTarget(event: Event): HTMLInputElement | null {
  return event.target instanceof HTMLInputElement ? event.target : null;
}

export function getSelectTarget(event: Event): HTMLSelectElement | null {
  return event.target instanceof HTMLSelectElement ? event.target : null;
}

export function getInputById(id: string): HTMLInputElement | null {
  return getById<HTMLInputElement>(id);
}

export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';

  // Remove control characters and whitespace that might bypass protocol checks
  const cleanStr = url.replace(/[\x00-\x1F\x7F-\x9F\s]/g, '');
  if (cleanStr.toLowerCase().startsWith('javascript:')) {
    return '#';
  }

  try {
    const parsed = new URL(url, window.location.href);
    const allowedProtocols = ['http:', 'https:', 'ftp:', 'mailto:'];
    if (!allowedProtocols.includes(parsed.protocol.toLowerCase())) {
      return '#';
    }
    return url;
  } catch (e) {
    return '#';
  }
}

export function getLocalizedWarningText(
  key: string,
  fallback: string,
  replacements?: Record<string, string>,
): string {
  let text = (window as any).getTranslation(key);
  if (!text || text === key) text = fallback;

  if (replacements) {
    Object.entries(replacements).forEach(([token, value]) => {
      text = text.replace(new RegExp(`\\$${token}\\$`, 'g'), value);
    });
  }

  return text;
}
