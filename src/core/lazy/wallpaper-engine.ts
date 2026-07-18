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
      const isActive = document.body.getAttribute('data-wallpaper-active') === 'true';
      
      const applyWallpaper = () => {
        document.documentElement.style.setProperty('--wallpaper-image', `url('${url}')`);
        document.body.setAttribute('data-wallpaper-active', 'true');
        
        const currentOverlay = parseFloat(
          localStorage.getItem('wallpaperOverlay') || String(config.overlay),
        );
        updateOverlay(currentOverlay, config.enabled);

        hideToast();

        if (config.source === 'api') {
          showCreditsBoot(config.type);
        } else {
          hideCreditsBoot();
        }
      };

      if (isActive) {
        document.documentElement.style.setProperty('--wallpaper-opacity', '0');
        setTimeout(applyWallpaper, 350);
      } else {
        applyWallpaper();
      }
    };

    img.onerror = () => {
      hideToast();
      clearWallpaper();
      hideCreditsBoot();
    };
  }
}
