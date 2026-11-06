/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

(function () {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeQuery.addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('theme') || 'auto';
    if (currentTheme === 'auto') {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  });

  const surfaceTintEnabled = localStorage.getItem('fluent_surface_tint') === 'true';
  if (surfaceTintEnabled) {
    document.documentElement.setAttribute('data-surface-tint', 'true');
  }

  const isFeedEnabled = localStorage.getItem('feedEnabled') === 'true';
  let hasFeedLinks = false;
  try {
    const fl = JSON.parse(localStorage.getItem('feedRssUrls') || '[]');
    hasFeedLinks = Array.isArray(fl) && fl.length > 0;
  } catch {}
  if (isFeedEnabled && hasFeedLinks) {
    const feedMode = localStorage.getItem('feedMode') || 'minimal';
    document.documentElement.setAttribute('data-feed-active', 'true');
    document.documentElement.setAttribute('data-feed-mode', feedMode);
    if (feedMode !== 'hidden' && feedMode !== 'autohide') {
      const style = document.createElement('style');
      style.id = 'early-feed-style';
      style.textContent = '#feedDrawer { display: flex !important; }';
      document.head.appendChild(style);
    }
  }

  const wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';

  if (!wallpaperEnabled) {
    return;
  }

  const rawOverlay = localStorage.getItem('wallpaperOverlay') || '10';
  let overlayVal = parseFloat(rawOverlay);
  if (isNaN(overlayVal)) overlayVal = 10;
  if (overlayVal > 0 && overlayVal <= 1) overlayVal = overlayVal * 100;
  const overlayOpacity = (overlayVal / 100) * 0.9;

  document.documentElement.style.setProperty('--wallpaper-overlay', String(overlayOpacity));

  const rawBlur = localStorage.getItem('wallpaperBlur') || '0';
  const blurVal = parseFloat(rawBlur) || 0;
  if (blurVal > 0) {
    document.documentElement.style.setProperty('--wallpaper-blur', `blur(${blurVal}px)`);
    document.documentElement.setAttribute('data-wallpaper-blur', 'true');
  }

  const wallpaperSource = localStorage.getItem('wallpaperSource') || 'local';
  const wallpaperType = localStorage.getItem('wallpaperType') || 'upload';

  function applyEarlyWallpaper(url) {
    if (!url) return;
    const style = document.createElement('style');
    style.id = 'early-wallpaper-style';
    style.textContent = `:root { --wallpaper-image: url('${url}'); }`;
    document.head.appendChild(style);
    document.documentElement.setAttribute('data-early-wallpaper', 'true');
    if (document.body) {
      document.body.setAttribute('data-wallpaper-active', 'true');
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.setAttribute('data-wallpaper-active', 'true');
      });
    }
  }

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
            applyEarlyWallpaper(cachedUrl);
          }
        } catch {}
      }
    } catch {}
  } else if (wallpaperSource === 'local') {
    try {
      const isDual = localStorage.getItem('dualWallpaperEnabled') === 'true';
      let key = 'custom_wallpaper';
      if (isDual) {
        const isDark =
          savedTheme === 'dark' ||
          (savedTheme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        key = isDark ? 'custom_wallpaper_dark' : 'custom_wallpaper_light';
      }

      const req = indexedDB.open('FluentNewTabDB', 1);
      req.onsuccess = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('wallpapers')) return;
        const tx = db.transaction(['wallpapers'], 'readonly');
        const store = tx.objectStore('wallpapers');
        const getReq = store.get(key);
        getReq.onsuccess = function () {
          const blob = getReq.result;
          if (blob) {
            applyEarlyWallpaper(URL.createObjectURL(blob));
          } else if (isDual) {
            const fallbackReq = store.get('custom_wallpaper');
            fallbackReq.onsuccess = function () {
              if (fallbackReq.result) {
                applyEarlyWallpaper(URL.createObjectURL(fallbackReq.result));
              }
            };
          }
        };
      };
    } catch {}
  }
})();
