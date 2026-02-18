async function fetchDailyWallpaper(source: WallpaperType): Promise<string | null> {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `wallpaper_cache_${source}`;
    const now = Date.now();
    const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

    try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null') as WallpaperCacheEntry | null;
        const timestamp = cached?.timestamp || 0;
        if (cached && cached.url && timestamp > 0 && (now - timestamp) < CACHE_DURATION_MS) {
            console.log(`Carregando ${source} do cache 24h.`);
            return cached.url;
        }
    } catch (e) { console.error('Erro ao ler cache', e); }

    console.log(`Buscando nova imagem de: ${source}...`);
    let imageUrl = '';
    let creditText = '';

    try {
        if (source === 'bing') {
            const res = await fetch('https://peapix.com/bing/feed?country=us');
            if (!res.ok) throw new Error(`Bing Error: ${res.status}`);
            const data = await res.json() as BingWallpaperItem[];

            if (data && data.length > 0) {
                const img = data[0];
                imageUrl = img.fullUrl || img.imageUrl || img.url || '';
                creditText = `Bing: ${img.copyright || 'Daily Image'}`;
            }
        } else if (source === 'nasa') {
            const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=lP5JlT7l9NKOOWhBjDezKfFEvgwtmHfQH5pfSZHW');
            if (res.status === 429) throw new Error('NASA API limit reached.');
            if (!res.ok) throw new Error(`NASA Error: ${res.status}`);
            const data = await res.json() as NasaApodResponse;

            if (data.media_type === 'image') {
                imageUrl = data.hdurl || data.url || '';
                creditText = `NASA: ${data.title || 'APOD'}`;
            } else {
                throw new Error('Today NASA posted a video, not an image.');
            }
        } else if (source === 'wikimedia') {
            const fetchWiki = async (date: string): Promise<WikimediaQueryResponse> => {
                const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=Template:Potd/${date}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
                const response = await fetch(url);
                return await response.json() as WikimediaQueryResponse;
            };

            let data = await fetchWiki(today);
            let pages = data.query?.pages;

            if (!pages) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                data = await fetchWiki(yesterday);
                pages = data.query?.pages;
            }

            if (pages) {
                for (const page of Object.values(pages)) {
                    if (page?.imageinfo?.[0]) {
                        imageUrl = page.imageinfo[0].url;
                        const meta = page.imageinfo[0].extmetadata;
                        creditText = meta?.Artist?.value || 'Wikimedia Commons';
                        creditText = creditText.replace(/<[^>]*>?/gm, '');
                        break;
                    }
                }
            }
        }

        if (imageUrl) {
            localStorage.setItem(cacheKey, JSON.stringify({
                url: imageUrl,
                timestamp: now,
                credit: creditText
            }));

            return imageUrl;
        }

        throw new Error('No image URL found in the API response.');
    } catch (error) {
        console.error(`Error while searching ${source}:`, error);
        return null;
    }
}

function fetchSuggestionsFromService(query: string): Promise<string[]> {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    return fetch(url)
        .then(response => response.json())
        .then((data: SuggestionApiResponse) => {
            if (Array.isArray(data?.[1])) {
                return data[1].slice(0, 5);
            }
            return [];
        })
        .catch(error => {
            console.error('Error retrieving suggestions:', error);
            return [];
        });
}

async function fetchCityData(query: string): Promise<CityData | null> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&format=json`;
    const response = await fetch(url);
    const data = await response.json() as GeocodingResponse;

    if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return { name: result.name, lat: result.latitude, lon: result.longitude, country: result.country };
    }

    return null;
}

async function fetchWeatherData(cityData: CityData): Promise<WeatherApiResponse | null> {
    const { lat, lon } = cityData;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    return await response.json() as WeatherApiResponse;
}
