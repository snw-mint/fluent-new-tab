/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

async function fetchDailyWallpaper(source: WallpaperType): Promise<string | null> {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `wallpaper_cache_${source}`;
  const now = Date.now();

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now;
  const msSinceMidnight = 86400000 - msUntilMidnight;

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null") as WallpaperCacheEntry | null;
    const timestamp = cached?.timestamp || 0;
    const cachedDate = cached?.date || "";
    if (cached && cached.url && cachedDate === today && "creditUrl" in cached) {
      console.log(`Loading ${source} from today's cache.`);
      return cached.url;
    }
  } catch (e) {
    console.error("Error reading cache", e);
  }

  console.log(`Fetching new image from: ${source}...`);
  let imageUrl = "";
  let creditText = "";
  let creditUrl = "";

  const notifyWallpaperApiWarning = (reason: string): void => {
    window.dispatchEvent(
      new CustomEvent("wallpaper-api-warning", {
        detail: { source, reason },
      }),
    );
  };

  try {
    if (source === "bing") {
      const res = await fetch("https://peapix.com/bing/feed?country=us");
      if (!res.ok) throw new Error(`Bing Error: ${res.status}`);
      const data = (await res.json()) as any[];

      if (data && data.length > 0) {
        const img = data[0];
        imageUrl = img.fullUrl || img.imageUrl || img.url || "";
        creditText = `Bing: ${img.copyright || "Daily Image"}`;
        creditUrl = img.copyrightLink || img.copyrightlink || img.url || "";
      }
    } else if (source === "nasa") {
      const fetchNasaApod = async (date?: string): Promise<any> => {
        const url = date
          ? `https://api.nasa.gov/planetary/apod?api_key=lP5JlT7l9NKOOWhBjDezKfFEvgwtmHfQH5pfSZHW&date=${encodeURIComponent(date)}`
          : "https://api.nasa.gov/planetary/apod?api_key=lP5JlT7l9NKOOWhBjDezKfFEvgwtmHfQH5pfSZHW";
        const response = await fetch(url);
        if (response.status === 429) throw new Error("NASA API limit reached.");
        if (response.status >= 500) throw new Error(`NASA Error: ${response.status}`);
        if (!response.ok) throw new Error(`NASA Error: ${response.status}`);
        return await response.json();
      };

      const todayData = await fetchNasaApod();

      if (todayData.media_type === "image") {
        imageUrl = todayData.hdurl || todayData.url || "";
        creditText = `NASA: ${todayData.title || "APOD"}`;
        creditUrl = "https://apod.nasa.gov/apod/astropix.html";
      } else {
        notifyWallpaperApiWarning(todayData.media_type === "video" ? "video" : "unavailable");

        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        console.log(`APOD today is not an image, trying yesterday (${yesterday})...`);

        try {
          const yesterdayData = await fetchNasaApod(yesterday);
          if (yesterdayData.media_type === "image") {
            imageUrl = yesterdayData.hdurl || yesterdayData.url || "";
            creditText = `NASA: ${yesterdayData.title || "APOD"} (${yesterday})`;
            creditUrl = "https://apod.nasa.gov/apod/astropix.html";
            console.log(`Using yesterday's APOD image.`);
          } else {
            console.warn("Yesterday APOD is also not an image.");
            return null;
          }
        } catch (fallbackError) {
          console.error("Failed to fetch yesterday APOD:", fallbackError);
          return null;
        }
      }
    } else if (source === "wikimedia") {
      const fetchWiki = async (date: string): Promise<any> => {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=Template:Potd/${date}&prop=imageinfo&iiprop=url|thumburl|extmetadata|descriptionurl&iiurlwidth=3840&format=json&origin=*`;
        const response = await fetch(url);
        return await response.json();
      };

      let data = await fetchWiki(today);
      let pages = data.query?.pages;

      if (!pages) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        data = await fetchWiki(yesterday);
        pages = data.query?.pages;
      }

      if (pages) {
        for (const page of Object.values<any>(pages)) {
          if (page?.imageinfo?.[0]) {
            imageUrl = page.imageinfo[0].thumburl || page.imageinfo[0].url;
            creditUrl = page.imageinfo[0].descriptionurl || "";

            const meta = page.imageinfo[0].extmetadata;
            creditText = meta?.Artist?.value || "Wikimedia Commons";
            creditText = creditText.replace(/<[^>]*>?/gm, "");

            const MAX_CREDIT_LENGTH = 120;
            if (creditText.length > MAX_CREDIT_LENGTH) {
              creditText = creditText.substring(0, MAX_CREDIT_LENGTH).trim() + "...";
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
          timestamp: now,
          credit: creditText,
          creditUrl: creditUrl,
        }),
      );

      return imageUrl;
    }

    throw new Error("No image URL found in the API response.");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isServerError =
      errorMessage.includes("503") ||
      errorMessage.includes("502") ||
      errorMessage.includes("504") ||
      errorMessage.includes("API limit");

    if (source === "nasa" && !isServerError) {
      notifyWallpaperApiWarning("error");
    }

    console.error(`Error while searching ${source}:`, error);
    return null;
  }
}

function fetchSuggestionsFromService(query: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
  return fetch(url)
    .then((response) => response.json())
    .then((data: SuggestionApiResponse) => {
      if (Array.isArray(data?.[1])) {
        return data[1].slice(0, 5);
      }
      return [];
    })
    .catch((error) => {
      console.error("Error retrieving suggestions:", error);
      return [];
    });
}

async function fetchCityData(query: string): Promise<CityData | null> {
  const language = "en";

  const normalizeText = (value: string): string =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const queryParts = query
    .split(",")
    .map((part) => normalizeText(part))
    .filter(Boolean);
  const primaryTerm = queryParts[0] || normalizeText(query);
  const qualifiers = queryParts.slice(1);

  const scoreResult = (result: GeocodingResult): number => {
    const name = normalizeText(result.name || "");
    const country = normalizeText(result.country || "");
    const countryCode = normalizeText(result.country_code || "");
    const admin1 = normalizeText(result.admin1 || "");
    const admin2 = normalizeText(result.admin2 || "");
    const admin3 = normalizeText(result.admin3 || "");
    const context = [country, countryCode, admin1, admin2, admin3].filter(Boolean);

    let score = 0;

    if (name === primaryTerm) score += 200;
    else if (name.startsWith(primaryTerm)) score += 120;
    else if (name.includes(primaryTerm)) score += 70;

    qualifiers.forEach((qualifier) => {
      if (context.some((part) => part === qualifier)) {
        score += 90;
      } else if (context.some((part) => part.includes(qualifier))) {
        score += 45;
      }
    });

    if (qualifiers.length > 0 && score > 0) {
      const matchesAllQualifiers = qualifiers.every((qualifier) => context.some((part) => part.includes(qualifier)));
      if (matchesAllQualifiers) score += 40;
    }

    return score;
  };

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=${encodeURIComponent(language)}&format=json`;
  const response = await fetch(url);
  const data = (await response.json()) as GeocodingResponse;

  if (data.results && data.results.length > 0) {
    const sorted = [...data.results].sort((a, b) => scoreResult(b) - scoreResult(a));
    const result = sorted[0];
    return { name: result.name, lat: result.latitude, lon: result.longitude, country: result.country };
  }

  return null;
}

async function fetchWeatherData(cityData: CityData): Promise<WeatherApiResponse | null> {
  const { lat, lon } = cityData;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const response = await fetch(url);
  return (await response.json()) as WeatherApiResponse;
}
