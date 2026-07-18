/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { HOST_PERMISSIONS, checkPermission } from '@/core/shared/permissions';
import {
  WallpaperType,
  WallpaperCacheEntry,
  NasaApodResponse,
} from '@/core/shared/types';

export async function fetchDailyWallpaper(
  source: WallpaperType,
): Promise<string | null> {
  const origins = HOST_PERMISSIONS[source as keyof typeof HOST_PERMISSIONS];
  if (origins) {
    const hasPerm = await checkPermission(origins);
    if (!hasPerm) return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `wallpaper_cache_${source}`;

  try {
    const cached = JSON.parse(
      localStorage.getItem(cacheKey) || 'null',
    ) as WallpaperCacheEntry | null;
    if (
      cached &&
      cached.url &&
      cached.date === today &&
      'creditUrl' in cached
    ) {
      return cached.url;
    }
  } catch (e) {
    console.error('Error reading cache', e);
  }

  let imageUrl = '';
  let creditText = '';
  let creditUrl = '';
  let creditHtml = '';

  const notifyWallpaperApiWarning = (reason: string): void => {
    window.dispatchEvent(
      new CustomEvent('wallpaper-api-warning', {
        detail: { source, reason },
      }),
    );
  };

  try {
    if (source === 'bing') {
      const res = await fetch('https://peapix.com/bing/feed?country=us');
      if (!res.ok) throw new Error(`Bing Error: ${res.status}`);
      const data = (await res.json()) as any[];

      if (data && data.length > 0) {
        const img = data[0];
        imageUrl = img.fullUrl || img.imageUrl || img.url || '';
        creditText = `Bing: ${img.copyright || 'Daily Image'}`;
        creditUrl = img.copyrightLink || img.copyrightlink || img.url || '';
      }
    } else if (source === 'nasa') {
      notifyWallpaperApiWarning('loading');

      const fetchNasaApod = async (
        date?: string,
      ): Promise<NasaApodResponse> => {
        const url = date
          ? `https://api.nasa.gov/planetary/apod?api_key=lP5JlT7l9NKOOWhBjDezKfFEvgwtmHfQH5pfSZHW&thumbs=True&date=${encodeURIComponent(date)}`
          : 'https://api.nasa.gov/planetary/apod?api_key=lP5JlT7l9NKOOWhBjDezKfFEvgwtmHfQH5pfSZHW&thumbs=True';
        const response = await fetch(url);
        if (response.status === 429) throw new Error('NASA API limit reached.');
        if (response.status >= 500)
          throw new Error(`NASA Error: ${response.status}`);
        if (!response.ok) throw new Error(`NASA Error: ${response.status}`);
        return await response.json();
      };

      const applyApodData = (
        data: NasaApodResponse,
        date?: string,
      ): boolean => {
        if (data.media_type !== 'image' && data.media_type !== 'video')
          return false;
        imageUrl =
          data.media_type === 'video'
            ? (data.thumbnail_url || data.url || '').replace(
                /(hqdefault|mqdefault|sddefault|0)\.jpg/i,
                'maxresdefault.jpg',
              )
            : data.hdurl || data.url || '';
        const suffix = date ? ` (${date})` : '';
        creditText = `NASA: ${data.title || 'APOD'}${suffix}`;
        creditUrl = 'https://apod.nasa.gov/apod/astropix.html';
        return true;
      };

      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .slice(0, 10);

      let todayData: NasaApodResponse | null = null;
      try {
        todayData = await fetchNasaApod();
      } catch (todayError) {
        // Server-side error (5xx / rate-limit): fall back to yesterday silently
        const msg =
          todayError instanceof Error ? todayError.message : String(todayError);
        const isServerErr =
          msg.includes('503') ||
          msg.includes('502') ||
          msg.includes('504') ||
          msg.includes('API limit');
        if (isServerErr) {
          console.warn(
            `NASA API unavailable (${msg}), trying yesterday's APOD…`,
          );
          try {
            const fallbackData = await fetchNasaApod(yesterday);
            if (!applyApodData(fallbackData, yesterday)) return null;
          } catch {
            throw todayError;
          }
        } else {
          throw todayError;
        }
      }

      if (todayData !== null) {
        if (!applyApodData(todayData)) {
          notifyWallpaperApiWarning('unavailable');
          try {
            const yesterdayData = await fetchNasaApod(yesterday);
            if (!applyApodData(yesterdayData, yesterday)) return null;
          } catch {
            return null;
          }
        }
      }
    } else if (source === 'wikimedia') {
      const fetchWiki = async (date: string): Promise<any> => {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=Template:Potd/${date}&prop=imageinfo&iiprop=url|thumburl|extmetadata|descriptionurl&iiurlwidth=3840&format=json&origin=*`;
        const response = await fetch(url);
        return await response.json();
      };

      let data = await fetchWiki(today);
      let pages = data.query?.pages;

      if (!pages) {
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        data = await fetchWiki(yesterday);
        pages = data.query?.pages;
      }

      if (pages) {
        for (const page of Object.values<any>(pages)) {
          if (page?.imageinfo?.[0]) {
            imageUrl = page.imageinfo[0].thumburl || page.imageinfo[0].url;
            creditUrl = page.imageinfo[0].descriptionurl || '';

            const meta = page.imageinfo[0].extmetadata;
            creditText = meta?.Artist?.value || 'Wikimedia Commons';
            creditText = creditText.replace(/<[^>]*>?/gm, '');

            const maxCreditLength = 120;
            if (creditText.length > maxCreditLength) {
              creditText =
                creditText.substring(0, maxCreditLength).trim() + '...';
            }
            break;
          }
        }
      }
    } else if (source === 'unsplash') {
      const url =
        'https://unsplash.snw-mint.workers.dev/photos/random?query=abstract+wallpaper&orientation=landscape';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Unsplash Worker Error: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.urls && data.urls.raw) {
        let screenWidth = window.screen.width * (window.devicePixelRatio || 1);
        screenWidth = Math.max(screenWidth, 1920);
        screenWidth = Math.min(screenWidth, 3840);
        screenWidth = Math.ceil(screenWidth / 240) * 240;

        const joiner = data.urls.raw.includes('?') ? '&' : '?';
        imageUrl = `${data.urls.raw}${joiner}w=${screenWidth}&q=80&fm=webp`;

        const photographerName = data.user?.name || 'Photographer';
        const photographerUrl = data.user?.links?.html
          ? `${data.user.links.html}?utm_source=fluent_new_tab&utm_medium=referral`
          : 'https://unsplash.com/?utm_source=fluent_new_tab&utm_medium=referral';
        const unsplashUrl = `https://unsplash.com/?utm_source=fluent_new_tab&utm_medium=referral`;

        creditHtml = `Photo by <a href="${photographerUrl}" target="_blank" class="wallpaper-credit-link" style="color: inherit; text-decoration: none; pointer-events: auto;">${photographerName}</a> on <a href="${unsplashUrl}" target="_blank" class="wallpaper-credit-link" style="color: inherit; text-decoration: none; pointer-events: auto;">Unsplash</a>`;
        creditText = `Photo by ${photographerName} on Unsplash`;
        creditUrl = photographerUrl;
      }
    } else if (source === 'pexels') {
      const randomPage = Math.floor(Math.random() * 100) + 1;
      const url = `https://pexels.snw-mint.workers.dev/curated?per_page=1&page=${randomPage}&orientation=landscape`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Pexels Worker Error: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.photos && data.photos.length > 0) {
        const photo = data.photos[0];
        let pexelsUrl = photo?.src?.original || photo?.src?.landscape || '';

        if (pexelsUrl && photo?.src?.original) {
          let screenWidth =
            window.screen.width * (window.devicePixelRatio || 1);
          screenWidth = Math.max(screenWidth, 1920);
          screenWidth = Math.min(screenWidth, 3840);
          screenWidth = Math.ceil(screenWidth / 240) * 240;

          const joiner = pexelsUrl.includes('?') ? '&' : '?';
          imageUrl = `${pexelsUrl}${joiner}auto=compress&cs=tinysrgb&w=${screenWidth}&q=80`;
        } else {
          imageUrl = pexelsUrl;
        }

        creditText = `Pexels: ${photo?.photographer || 'Photographer'}`;
        creditUrl = photo?.url || 'https://pexels.com/';
      }
    }

    if (imageUrl) {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          url: imageUrl,
          date: today,
          credit: creditText,
          creditUrl: creditUrl,
          ...(creditHtml ? { creditHtml } : {}),
        }),
      );
      return imageUrl;
    }

    throw new Error('No image URL found in the API response.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isServerError =
      errorMessage.includes('503') ||
      errorMessage.includes('502') ||
      errorMessage.includes('504') ||
      errorMessage.includes('API limit');

    if (source === 'nasa') {
      if (isServerError) {
        notifyWallpaperApiWarning('server-error');
      } else {
        notifyWallpaperApiWarning('error');
      }
    }

    console.error(`Error while searching ${source}:`, error);
    return null;
  }
}
