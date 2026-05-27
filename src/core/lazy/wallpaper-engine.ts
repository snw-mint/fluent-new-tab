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
  public static updateOverlay(opacity: number, enabled: boolean): void {
    updateOverlay(opacity, enabled);
  }

  public static async render(config: WallpaperConfig): Promise<void> {
    if (!config.enabled) {
      clearWallpaper();
      this.hideCredits();
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
          showToast(msg, '/assets/search-engines/system.svg');
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
          updateOverlay(config.overlay, config.enabled);
          
          document.body.getBoundingClientRect();
          document.body.style.transition = oldTransition;

          if (config.source === 'api') {
            this.showCredits(config.type);
          } else {
            this.hideCredits();
          }

          curtain.style.opacity = '0';
          curtain.addEventListener('transitionend', () => curtain.remove(), {
            once: true,
          });
        },
        { once: true }
      );
    };

    img.onerror = () => {
      clearWallpaper();
      this.hideCredits();
    };
  }

  private static hideCredits(): void {
    const creditsDiv = document.getElementById('wallpaperCredits');
    if (creditsDiv) {
      creditsDiv.classList.add('hidden');
    }
  }

  private static showCredits(sourceType: string): void {
    const creditsDiv = document.getElementById('wallpaperCredits');
    const creditTextSpan = document.getElementById('wallpaperCreditText');
    if (!creditsDiv || !creditTextSpan) return;

    const cacheKey = `wallpaper_cache_${sourceType}`;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && (cached.credit || cached.creditUrl)) {
        const text = cached.credit || 'Daily Wallpaper';
        const url = cached.creditUrl || '';

        if (url) {
          creditTextSpan.innerHTML = `<a href="${url}" target="_blank" class="wallpaper-credit-link" style="color: inherit; text-decoration: none;">${text}</a>`;
        } else {
          creditTextSpan.textContent = text;
        }
        creditsDiv.classList.remove('hidden');
      } else {
        creditsDiv.classList.add('hidden');
      }
    } catch (e) {
      creditsDiv.classList.add('hidden');
    }
  }
}
