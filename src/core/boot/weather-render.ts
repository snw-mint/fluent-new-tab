/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { WeatherApiResponse, WeatherUnit, CityData } from '@/core/shared/types';

const WEATHER_PATHS: Record<string, string> = {
  cs_CZ: 'cs-cz/pocasi/predpoved',
  da_DK: 'da-dk/vejr/vejrudsigt',
  de_DE: 'de-de/wetter/vorhersage',
  el_GR: 'el-gr/weather/forecast',
  en_US: 'en-us/weather/forecast',
  es_ES: 'es-es/eltiempo/prevision',
  fi_FI: 'fi-fi/saa/ennuste',
  fil_PH: 'en-ph/weather/forecast',
  fr_FR: 'fr-fr/meteo/previsions',
  hu_HU: 'hu-hu/idojaras/elorejelzes',
  id_ID: 'id-id/cuaca/prakiraan',
  it_IT: 'it-it/meteo/previsioni',
  ja_JP: 'ja-jp/weather/forecast',
  ko_KR: 'ko-kr/weather/forecast',
  nl_NL: 'nl-nl/weer/voorspelling',
  pl_PL: 'pl-pl/pogoda/prognoza',
  pt_BR: 'pt-br/clima/forecast',
  ro_RO: 'en-us/weather/forecast',
  ru_RU: 'ru-ru/weather/forecast',
  sv_SE: 'sv-se/vader/prognos',
  tr_TR: 'tr-tr/havadurumu/havadurumutahmini',
  uk_UA: 'uk-ua/weather/forecast',
  vi_VN: 'vi-vn/weather/forecast',
  zh_CN: 'zh-cn/weather/forecast',
  zh_TW: 'zh-tw/weather/forecast',
};

export function getFluentIconFilename(
  code: number,
  isDay: number | boolean,
): string {
  switch (code) {
    case 0:
    case 1:
      return isDay ? 'sunny.svg' : 'clear_night.svg';
    case 2:
      return isDay ? 'partly_cloudy_day.svg' : 'partly_cloudy_night.svg';
    case 3:
      return 'cloudy.svg';
    case 45:
    case 48:
      return 'fog.svg';
    case 51:
    case 53:
    case 55:
      return 'drizzle.svg';
    case 56:
    case 57:
    case 66:
    case 67:
      return 'rain_snow.svg';
    case 61:
    case 63:
    case 65:
      return 'rain.svg';
    case 71:
    case 73:
    case 75:
    case 77:
      return 'snow.svg';
    case 80:
    case 81:
    case 82:
      return isDay ? 'rain_showers_day.svg' : 'rain_showers_night.svg';
    case 85:
    case 86:
      return isDay ? 'snow_showers_day.svg' : 'snow_showers_night.svg';
    case 95:
      return 'thunderstorm.svg';
    case 96:
    case 99:
      return isDay ? 'hail_day.svg' : 'hail_night.svg';
    default:
      return 'cloudy.svg';
  }
}

export function renderWeatherWidget(
  data: WeatherApiResponse | null,
  weatherUnit: WeatherUnit,
  cityData: CityData,
  refs: {
    weatherCity: HTMLElement | null;
    weatherTemp: HTMLElement | null;
    weatherIcon: HTMLElement | null;
    weatherWidget: HTMLAnchorElement | null;
  },
): void {
  if (!data?.current_weather) return;
  if (
    !refs.weatherCity ||
    !refs.weatherTemp ||
    !refs.weatherIcon ||
    !refs.weatherWidget
  )
    return;

  const { temperature, weathercode, is_day } = data.current_weather;
  const isCelsius = weatherUnit.toLowerCase() === 'c';
  const tempValue = isCelsius ? temperature : (temperature * 9) / 5 + 32;
  const unitSymbol = isCelsius ? '°C' : '°F';
  const filename = getFluentIconFilename(weathercode, is_day);

  refs.weatherCity.textContent = cityData.name;
  refs.weatherTemp.textContent = `${Math.round(tempValue)}${unitSymbol}`;

  const img = document.createElement('img');
  img.src = `assets/weather/standart/${filename}`;
  img.alt = 'Weather Icon';
  img.className = 'fluent-icon';

  refs.weatherIcon.textContent = '';
  refs.weatherIcon.appendChild(img);

  updateWeatherHref(refs.weatherWidget, weatherUnit);
}

export function updateWeatherHref(
  el?: HTMLAnchorElement | null,
  unit?: WeatherUnit,
): void {
  const w =
    el || (document.getElementById('weatherWidget') as HTMLAnchorElement | null);
  if (!w) return;
  const u = unit || (localStorage.getItem('weatherUnit') as WeatherUnit) || 'c';
  const deg = u.toLowerCase() === 'c' ? 'C' : 'F';
  const lang = localStorage.getItem('userLanguage') || 'en_US';
  const path = WEATHER_PATHS[lang] || 'en-us/weather/forecast';
  w.href = `https://www.msn.com/${path}/?weadegreetype=${deg}&uxmode=ruby`;
}

document.addEventListener('i18nReady', () => {
  updateWeatherHref();
});

document.addEventListener('pointerdown', (e) => {
  const target = (e.target as HTMLElement | null)?.closest(
    '#weatherWidget',
  ) as HTMLAnchorElement | null;
  if (target) updateWeatherHref(target);
});

