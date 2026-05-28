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

      const todayData = await fetchNasaApod();

      if (
        todayData.media_type === 'image' ||
        todayData.media_type === 'video'
      ) {
        imageUrl =
          todayData.media_type === 'video'
            ? (todayData.thumbnail_url || todayData.url || '').replace(
                /(hqdefault|mqdefault|sddefault|0)\.jpg/i,
                'maxresdefault.jpg',
              )
            : todayData.hdurl || todayData.url || '';
        creditText = `NASA: ${todayData.title || 'APOD'}`;
        creditUrl = 'https://apod.nasa.gov/apod/astropix.html';
      } else {
        notifyWallpaperApiWarning('unavailable');
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);

        try {
          const yesterdayData = await fetchNasaApod(yesterday);
          if (
            yesterdayData.media_type === 'image' ||
            yesterdayData.media_type === 'video'
          ) {
            imageUrl =
              yesterdayData.media_type === 'video'
                ? (
                    yesterdayData.thumbnail_url ||
                    yesterdayData.url ||
                    ''
                  ).replace(
                    /(hqdefault|mqdefault|sddefault|0)\.jpg/i,
                    'maxresdefault.jpg',
                  )
                : yesterdayData.hdurl || yesterdayData.url || '';
            creditText = `NASA: ${yesterdayData.title || 'APOD'} (${yesterday})`;
            creditUrl = 'https://apod.nasa.gov/apod/astropix.html';
          } else {
            return null;
          }
        } catch (fallbackError) {
          return null;
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
    }

    if (imageUrl) {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          url: imageUrl,
          date: today,
          credit: creditText,
          creditUrl: creditUrl,
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

    if (source === 'nasa' && !isServerError) {
      notifyWallpaperApiWarning('error');
    }

    console.error(`Error while searching ${source}:`, error);
    return null;
  }
}
