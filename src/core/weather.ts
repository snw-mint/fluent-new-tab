/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file handles the rendering and display of weather information on the new tab page.
 */

interface WeatherRenderElements {
  weatherCity: HTMLElement | null;
  weatherTemp: HTMLElement | null;
  weatherIcon: HTMLElement | null;
  weatherWidget: HTMLAnchorElement | null;
}

function getFluentIconFilename(code: number, isDay: number | boolean): string {
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

function renderWeatherAlertWidget(): void {
  const containerId = 'weather-alerts-widget';
  let widget = document.getElementById(containerId);

  if (typeof weatherAlertsEnabled === 'undefined' || !weatherAlertsEnabled) {
    if (widget) widget.remove();
    return;
  }

  const chromeApi = window.chrome;
  if (!chromeApi?.storage?.local) return;

  chromeApi.storage.local.get(['currentWeatherAlert'], (result: any) => {
    const alert = result.currentWeatherAlert;

    if (!alert || Date.now() - alert.timestamp > 3600000) {
      if (widget) widget.remove();
      return;
    }

    if (!widget) {
      widget = document.createElement('div');
      widget.id = containerId;
      widget.className = 'weather-alert-container';
      document.body.appendChild(widget);
    }

    widget.innerHTML = '';

    const img = document.createElement('img');
    img.src = `assets/weather/alerts/${alert.type}.svg`;
    img.className = 'weather-alert-icon';
    img.alt = alert.type;

    const text = document.createElement('span');
    text.className = 'weather-alert-text';

    let message = '';
    let i18nKey = '';

    switch (alert.type) {
      case 'temp_drop':
        i18nKey = 'alertTempDrop';
        message = `Expected temperature drop: ${alert.value}°`;
        break;
      case 'temp_rise':
        i18nKey = 'alertTempRise';
        message = `Expected temperature rise: ${alert.value}°`;
        break;
      case 'storm':
        i18nKey = 'alertStorm';
        message = 'Storms expected in the next few hours.';
        break;
      case 'wind_high':
        i18nKey = 'alertWindHigh';
        message = `Strong winds expected: ${alert.value} km/h`;
        break;
      case 'uv_high':
        i18nKey = 'alertUvHigh';
        message = `UV rays at critical levels: ${alert.value}`;
        break;
      case 'pollen_high':
        i18nKey = 'alertPollenHigh';
        const pollenName = String(alert.value).replace('_pollen', '');
        message = `High pollen levels (${pollenName}) expected.`;
        break;
    }

    text.setAttribute('data-i18n', i18nKey);
    if (typeof (window as any).getTranslation === 'function') {
      let translated = (window as any).getTranslation(i18nKey) || message;
      translated = translated.replace('$VALUE$', String(alert.value || ''));
      if (alert.type === 'pollen_high') {
        const pName = String(alert.value).replace('_pollen', '');
        translated = translated.replace('$POLLEN$', pName);
      }
      text.textContent = translated;
    } else {
      text.textContent = message;
    }

    text.setAttribute('data-i18n', i18nKey);
    text.textContent = message;

    widget.appendChild(img);
    widget.appendChild(text);
  });
}

function renderWeatherWidget(
  data: WeatherApiResponse | null,
  weatherUnit: WeatherUnit,
  cityData: CityData,
  refs: WeatherRenderElements,
): void {
  renderWeatherAlertWidget();

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
