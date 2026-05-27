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
  const windowObj = window as any;
  if (typeof windowObj.getTranslation === 'function') {
    let text = windowObj.getTranslation(key) || fallback;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`\\$${k}\\$`, 'g'), v);
      }
    }
    return text;
  }
  return fallback;
}

export function deriveShortcutNameFromUrl(rawUrl: string): string {
  try {
    const host = new URL(rawUrl).hostname.replace(/^www\./i, '');
    if (!host) return 'New Shortcut';
    const name = host.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return 'New Shortcut';
  }
}
