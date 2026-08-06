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

  const surfaceTintEnabled =
    localStorage.getItem('fluent_surface_tint') === 'true';
  if (surfaceTintEnabled) {
    document.documentElement.setAttribute('data-surface-tint', 'true');
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

  document.documentElement.style.setProperty(
    '--wallpaper-overlay',
    String(overlayOpacity),
  );

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
  } else if (wallpaperSource === 'local') {
    initialWallpaperUrl = localStorage.getItem('wallpaper_local_cache') || null;
  }

  if (!initialWallpaperUrl) return;

  const style = document.createElement('style');
  style.id = 'early-wallpaper-style';
  style.textContent = `:root { --wallpaper-image: url('${initialWallpaperUrl}'); }`;
  document.head.appendChild(style);
  document.documentElement.setAttribute('data-early-wallpaper', 'true');
  document.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-wallpaper-active', 'true');
  });
})();
