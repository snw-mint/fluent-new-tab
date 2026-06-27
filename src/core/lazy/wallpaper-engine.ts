/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import {
  updateOverlay,
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

    img.onload = () => {
      const curtain = document.createElement('div');
      Object.assign(curtain.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        opacity: '0',
        zIndex: '-2',
        pointerEvents: 'none',
        transition: 'opacity 0.35s ease-in-out',
      });
      document.body.appendChild(curtain);

      curtain.getBoundingClientRect();
      curtain.style.opacity = '1';

      curtain.addEventListener(
        'transitionend',
        () => {
          const oldTransition = document.body.style.transition;
          document.body.style.transition = 'none';

          document.body.style.backgroundImage = `url('${url}')`;
          document.body.setAttribute('data-wallpaper-active', 'true');
          const currentOverlay = parseFloat(
            localStorage.getItem('wallpaperOverlay') || String(config.overlay),
          );
          updateOverlay(currentOverlay, config.enabled);

          hideToast();

          document.body.getBoundingClientRect();
          document.body.style.transition = oldTransition;

          if (config.source === 'api') {
            showCreditsBoot(config.type);
          } else {
            hideCreditsBoot();
          }

          curtain.style.opacity = '0';
          curtain.addEventListener('transitionend', () => curtain.remove(), {
            once: true,
          });
        },
        { once: true },
      );
    };

    img.onerror = () => {
      hideToast();
      clearWallpaper();
      hideCreditsBoot();
    };
  }
}
