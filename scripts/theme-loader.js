/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

(function () {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  if (
    savedTheme === 'dark' ||
    (savedTheme === 'auto' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  const wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';

  if (!wallpaperEnabled) {
    const hideOverlayStyle = document.createElement('style');
    hideOverlayStyle.id = 'anti-flicker-overlay';
    hideOverlayStyle.textContent =
      '.wallpaper-overlay { display: none !important; }';
    document.head.appendChild(hideOverlayStyle);
    return;
  }

  const wallpaperSource = localStorage.getItem('wallpaperSource') || 'local';
  const wallpaperType = localStorage.getItem('wallpaperType') || 'upload';

  let initialWallpaperUrl = null;

  if (wallpaperSource === 'api') {
    const cacheKey = `wallpaper_cache_${wallpaperType}`;
    const cacheDuration = 10 * 60 * 60 * 1000;

    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      const now = Date.now();
      const timestamp = Number(cached?.timestamp || 0);
      const cachedUrl = typeof cached?.url === 'string' ? cached.url : '';

      if (cachedUrl && timestamp > 0 && now - timestamp < cacheDuration) {
        try {
          const parsed = new URL(cachedUrl);
          if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            initialWallpaperUrl = cachedUrl;
          }
        } catch {
          initialWallpaperUrl = null;
        }
      }
    } catch {
      initialWallpaperUrl = null;
    }
  }

  const fadeOverlay = document.createElement('style');
  fadeOverlay.id = 'wallpaper-fade-overlay';
  fadeOverlay.textContent = `
    #wallpaper-fade {
      position: fixed;
      inset: 0;
      background: #000;
      z-index: 99999;
      opacity: 1;
      transition: opacity 0.45s ease;
      pointer-events: none;
    }
    body.loaded #wallpaper-fade {
      opacity: 0;
    }
  `;
  document.head.appendChild(fadeOverlay);

  const fadeEl = document.createElement('div');
  fadeEl.id = 'wallpaper-fade';
  document.addEventListener('DOMContentLoaded', () => {
    document.body.prepend(fadeEl);
  });

  if (!initialWallpaperUrl) return;

  const style = document.createElement('style');
  style.id = 'early-wallpaper-style';
  style.textContent = `body { background-image: url('${initialWallpaperUrl}'); background-size: cover; background-position: center; background-attachment: fixed; }`;
  document.head.appendChild(style);
  document.documentElement.setAttribute('data-early-wallpaper', 'true');
})();
