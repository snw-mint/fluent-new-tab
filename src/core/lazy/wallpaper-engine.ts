import {
  updateOverlay,
  getWallpaperFromDB,
  clearWallpaper,
} from '@/core/boot/wallpaper-render';
import { fetchDailyWallpaper } from '@/core/lazy/providers/wallpaper-apis';
import { showToast } from '@/core/ui/ui-components';

export interface WallpaperConfig {
  enabled: boolean;
  source: string;
  type: string;
  overlay: number;
}

export class WallpaperEngine {
  public static async render(config: WallpaperConfig): Promise<void> {
    if (!config.enabled) {
      clearWallpaper();
      return;
    }

    let targetUrl: string | null = null;

    try {
      if (config.source === 'local' && config.type === 'upload') {
        const blob = await getWallpaperFromDB();
        if (blob) targetUrl = URL.createObjectURL(blob);
      } else if (config.source === 'api') {
        const today = new Date().toISOString().slice(0, 10);
        const cacheKey = `wallpaper_cache_${config.type}`;
        let hasValidCache = false;

        try {
          const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
          if (
            cached &&
            cached.url &&
            cached.date === today &&
            'creditUrl' in cached
          ) {
            hasValidCache = true;
          }
        } catch {}

        if (!hasValidCache) {
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
          showToast(msg, '');
        }

        targetUrl = await fetchDailyWallpaper(config.type as any);
      }
    } catch (err) {
      console.error('Wallpaper Engine Error:', err);
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

    const completeFadeIn = () => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        document.body.style.backgroundImage = `url('${url}')`;
        document.body.setAttribute('data-wallpaper-active', 'true');
        updateOverlay(config.overlay, config.enabled);

        curtain.style.opacity = '0';
        curtain.addEventListener('transitionend', () => curtain.remove(), {
          once: true,
        });
      };
      img.onerror = () => {
        curtain.style.opacity = '0';
        curtain.addEventListener('transitionend', () => curtain.remove(), {
          once: true,
        });
      };
    };

    curtain.addEventListener('transitionend', completeFadeIn, { once: true });
  }
}
