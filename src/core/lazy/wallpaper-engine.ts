/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import {
  updateOverlay,
  updateBlur,
  getWallpaperFromDB,
  clearWallpaper,
  showCreditsBoot,
  hideCreditsBoot,
  isWallpaperCacheValid,
} from '@/core/boot/wallpaper-render';
import { fetchDailyWallpaper } from '@/core/lazy/providers/wallpaper-apis';
import { showToast, hideToast } from '@/core/ui/ui-components';

export interface WallpaperConfig {
  enabled: boolean;
  source: string;
  type: string;
  overlay: number;
}

export class WallpaperEngine {
  public static updateOverlay(opacity: number, enabled: boolean): void {
    updateOverlay(opacity, enabled);
  }

  public static updateBlur(blur: number): void {
    updateBlur(blur);
  }

  public static async render(config: WallpaperConfig): Promise<void> {
    if (!config.enabled) {
      clearWallpaper();
      hideCreditsBoot();
      return;
    }

    let targetUrl: string | null = null;

    try {
      if (config.source === 'local' && config.type === 'upload') {
        const blob = await getWallpaperFromDB();
        if (blob) targetUrl = URL.createObjectURL(blob);
      } else if (config.source === 'api') {
        if (!isWallpaperCacheValid(config.type)) {
          const sourceName =
            config.type.charAt(0).toUpperCase() + config.type.slice(1);
          let msg = (window as any).getTranslation?.(
            'fetchingImagePlaceholder',
          );
          if (!msg || msg === 'fetchingImagePlaceholder') {
            msg = `Fetching ${sourceName} image...`;
          } else {
            msg = msg.replace(/\$SOURCE\$/g, sourceName);
          }
          showToast(msg, '/assets/icons/fetch.svg', 0);
        }

        targetUrl = await fetchDailyWallpaper(config.type as any);
      }
    } catch (err) {
      console.error('Wallpaper Engine Error:', err);
      hideToast();
    }

    if (targetUrl) {
      this.applyCinematicTransition(targetUrl, config);
    } else {
      clearWallpaper();
    }
  }

  private static applyCinematicTransition(
    url: string,
    config: WallpaperConfig,
  ): void {
    const img = new Image();
    img.src = url;

    img.decode().catch(() => { }).finally(() => {
      document.documentElement.removeAttribute('data-early-wallpaper');

      document
        .querySelectorAll('.wallpaper-crossfade-layer')
        .forEach((el) => el.remove());

      const updateConfigOnly = () => {
        document.body.setAttribute('data-wallpaper-active', 'true');

        const currentOverlay = parseFloat(
          localStorage.getItem('wallpaperOverlay') || String(config.overlay),
        );
        updateOverlay(currentOverlay, config.enabled);

        const currentBlur = parseFloat(
          localStorage.getItem('wallpaperBlur') || '0',
        );
        updateBlur(currentBlur);

        hideToast();

        if (config.source === 'api') {
          showCreditsBoot(config.type);
        } else {
          hideCreditsBoot();
        }

        if ((localStorage.getItem('accentColorMode') || 'auto') === 'auto') {
          import('@/core/lazy/color-extractor').then(
            ({ extractAndApplyAutoColor }) => {
              extractAndApplyAutoColor(url, url);
            },
          );
        }
      };

      updateConfigOnly();

      const crossfade = document.createElement('div');
      crossfade.className = 'wallpaper-crossfade-layer';
      crossfade.style.backgroundImage = `url('${url}')`;
      document.body.appendChild(crossfade);

      void crossfade.offsetWidth;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          crossfade.classList.add('visible');
        });
      });

      let cleanedUp = false;
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        document.documentElement.style.setProperty(
          '--wallpaper-image',
          `url('${url}')`,
        );
        crossfade.remove();
      };

      crossfade.addEventListener('transitionend', (e) => {
        if (e.target === crossfade && e.propertyName === 'opacity') {
          cleanup();
        }
      });
      setTimeout(cleanup, 500);
    });

    img.onerror = () => {
      hideToast();
      clearWallpaper();
      hideCreditsBoot();
    };
  }
}
