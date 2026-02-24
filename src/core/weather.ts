interface WeatherRenderElements {
    weatherCity: HTMLElement | null;
    weatherTemp: HTMLElement | null;
    weatherIcon: HTMLElement | null;
    weatherWidget: HTMLAnchorElement | null;
}

function getFluentIconFilename(code: number, isDay: number | boolean): string {
    switch (code) {
        case 0: return isDay ? 'sunny.svg' : 'clear_night.svg';
        case 1: return isDay ? 'sunny.svg' : 'clear_night.svg';
        case 2: return isDay ? 'partly_cloudy_day.svg' : 'partly_cloudy_night.svg';
        case 3: return 'cloudy.svg';
        case 45:
        case 48: return 'fog.svg';
        case 51:
        case 53:
        case 55: return 'drizzle.svg';
        case 56:
        case 57:
        case 66:
        case 67: return 'rain_snow.svg';
        case 61:
        case 63:
        case 65: return 'rain.svg';
        case 71:
        case 73:
        case 75:
        case 77: return 'snow.svg';
        case 80:
        case 81:
        case 82: return isDay ? 'rain_showers_day.svg' : 'rain_showers_night.svg';
        case 85:
        case 86: return isDay ? 'snow_showers_day.svg' : 'snow_showers_night.svg';
        case 95: return 'thunderstorm.svg';
        case 96:
        case 99: return isDay ? 'hail_day.svg' : 'hail_night.svg';
        default: return 'cloudy.svg';
    }
}

function getActiveLocaleSegment(): string {
    const savedLocale = localStorage.getItem('userLanguage') || 'en';
    const normalized = savedLocale.replace('_', '-').trim() || 'en';

    try {
        const canonical = Intl.getCanonicalLocales([normalized])[0];
        if (canonical) return canonical.toLowerCase();
    } catch (e) { /* fallback to normalized below */ }

    return normalized.toLowerCase();
}

function buildMsnLocationPath(cityData: CityData): string {
    const sanitize = (value?: string): string => {
        if (!value) return '';
        const trimmed = value.trim();
        if (!trimmed) return '';
        return encodeURIComponent(trimmed.replace(/\s+/g, '-'));
    };

    const city = sanitize(cityData.name) || 'city';
    const state = sanitize(cityData.admin1);
    const location = state ? `${city},${state}` : city;

    return `/in-${location}`;
}

function renderWeatherWidget(data: WeatherApiResponse | null, weatherUnit: WeatherUnit, cityData: CityData, refs: WeatherRenderElements): void {
    if (!data?.current_weather) return;
    if (!refs.weatherCity || !refs.weatherTemp || !refs.weatherIcon || !refs.weatherWidget) return;

    const { temperature, weathercode, is_day } = data.current_weather;
    const isCelsius = weatherUnit === 'c';
    const tempValue = isCelsius ? temperature : (temperature * 9 / 5) + 32;
    const unitSymbol = isCelsius ? '°C' : '°F';
    const filename = getFluentIconFilename(weathercode, is_day);

    refs.weatherCity.textContent = cityData.name;
    refs.weatherTemp.textContent = `${Math.round(tempValue)}${unitSymbol}`;
    refs.weatherIcon.innerHTML = `<img src="assets/weather/${filename}" alt="Weather Icon" class="fluent-icon">`;

    const degreeMode = isCelsius ? 'C' : 'F';

    refs.weatherWidget.href = `https://www.msn.com/en-us/weather/forecast/?weadegreetype=${degreeMode}&uxmode=ruby`;
}
