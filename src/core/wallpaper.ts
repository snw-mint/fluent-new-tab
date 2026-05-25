import { fetchDailyWallpaper } from './services.js';
import { getWallpaperFromDB } from './wallpaper-storage.js';

export interface WallpaperConfig {
  enabled: boolean;
  source: string;
  type: string;
  overlay: number;
}

declare const window: any;
declare const chrome: any;
declare const document: any;

export class WallpaperEngine {
  private static fetchingNoticeInstance: HTMLElement | null = null;
  private static fetchingTimeout: number | null = null;

  public static updateOverlay(opacityValue: number, isEnabled: boolean): void {
    const finalOpacity = isEnabled ? String(opacityValue) : '0';
    document.documentElement.style.setProperty(
      '--overlay-opacity',
      finalOpacity,
    );
    if (document.body) {
      document.body.style.setProperty('--overlay-opacity', finalOpacity);
    }
  }

  public static async render(config: WallpaperConfig): Promise<void> {
    if (!config.enabled) {
      this.clear();
      return;
    }

    let targetUrl: string | null = null;

    try {
      if (config.source === 'local' && config.type === 'upload') {
        this.updateCreditsUI('local');
        const blob = await getWallpaperFromDB();
        if (blob) targetUrl = URL.createObjectURL(blob);
      } else if (config.source === 'api') {
        const sourceName =
          config.type.charAt(0).toUpperCase() + config.type.slice(1);
        let msg = window.getTranslation?.('fetchingImagePlaceholder');

        if (!msg || msg === 'fetchingImagePlaceholder') {
          msg = `Fetching ${sourceName} image...`;
        } else {
          msg = msg.replace(/\$SOURCE\$/g, sourceName);
        }

        this.fetchingTimeout = window.setTimeout(() => {
          this.showFetchingNotice(msg);
        }, 150);

        targetUrl = await fetchDailyWallpaper(config.type as any);

        this.hideFetchingNotice();

        try {
          const cacheKey = `wallpaper_cache_${config.type}`;
          const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
          let credit = cached?.credit;
          let creditUrl = cached?.creditUrl;

          if (!credit) {
            if (config.type === 'bing') credit = 'Microsoft Bing';
            else if (config.type === 'nasa') credit = 'NASA APOD';
            else if (config.type === 'wikimedia') credit = 'Wikimedia Commons';
            else credit = 'Daily Wallpaper';
          }
          this.updateCreditsUI('api', credit, creditUrl);
        } catch (e) {
          this.updateCreditsUI('api', 'Daily Wallpaper');
        }
      }
    } catch (err) {
      console.error('Wallpaper Engine Error:', err);
      this.hideFetchingNotice();
    }

    if (targetUrl) {
      this.applyWallpaper(targetUrl, config);
    } else {
      this.clear();
    }
  }

  private static applyWallpaper(url: string, config: WallpaperConfig): void {
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.setAttribute('data-wallpaper-active', 'true');
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    this.updateOverlay(config.overlay, config.enabled);
  }

  public static clear(): void {
    document.body.style.backgroundImage = 'none';
    document.body.removeAttribute('data-wallpaper-active');
    this.updateOverlay(0, false);
    this.updateCreditsUI('none');
  }

  private static updateCreditsUI(
    source: string,
    creditText?: string,
    creditUrl?: string,
  ): void {
    const creditsContainer = document.getElementById('wallpaperCredits');
    const creditsSpan = document.getElementById('wallpaperCreditText');

    if (!creditsContainer || !creditsSpan) return;

    if (
      source === 'local' ||
      source === 'preset' ||
      source === 'upload' ||
      source === 'none'
    ) {
      creditsContainer.classList.add('hidden');
    } else {
      creditsSpan.innerHTML = '';
      const textToShow = creditText || 'Daily Wallpaper';

      if (creditUrl) {
        const a = document.createElement('a');
        a.href = creditUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = textToShow;
        a.className = 'wallpaper-credit-link';
        a.style.color = 'inherit';
        a.style.textDecoration = 'underline';
        a.style.pointerEvents = 'auto';
        a.style.cursor = 'pointer';
        creditsSpan.appendChild(a);
      } else {
        creditsSpan.textContent = textToShow;
      }
      creditsContainer.classList.remove('hidden');
    }
  }

  private static showFetchingNotice(message: string): void {
    if (this.fetchingNoticeInstance) this.fetchingNoticeInstance.remove();

    const notice = document.createElement('div');
    notice.className = 'update-release-notice fetching-notice';

    const icon = document.createElement('img');
    icon.className = 'update-release-notice-icon';

    try {
      icon.src = chrome.runtime.getURL('assets/search-engines/system.svg');
    } catch {
      icon.src = 'assets/search-engines/system.svg';
    }
    icon.alt = '';

    const textSpan = document.createElement('span');
    textSpan.className = 'update-release-notice-prefix';
    textSpan.textContent = message;

    notice.append(icon, textSpan);
    document.body.appendChild(notice);
    this.fetchingNoticeInstance = notice;

    requestAnimationFrame(() => notice.classList.add('visible'));
  }

  private static hideFetchingNotice(): void {
    if (this.fetchingTimeout !== null) {
      window.clearTimeout(this.fetchingTimeout);
      this.fetchingTimeout = null;
    }

    if (!this.fetchingNoticeInstance) return;
    const notice = this.fetchingNoticeInstance;
    notice.classList.remove('visible');
    setTimeout(() => {
      notice.remove();
      if (this.fetchingNoticeInstance === notice) {
        this.fetchingNoticeInstance = null;
      }
    }, 250);
  }
}
