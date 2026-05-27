import { WeatherApiResponse, WeatherUnit, CityData } from '@/core/shared/types';

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

  const degreeType = isCelsius ? 'C' : 'F';
  refs.weatherWidget.href = `https://www.msn.com/en-ph/weather/forecast/?weadegreetype=${degreeType}&uxmode=ruby`;
}
