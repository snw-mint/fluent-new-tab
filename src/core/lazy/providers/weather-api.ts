/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { HOST_PERMISSIONS, checkPermission } from '@/core/shared/permissions';
import {
  CityData,
  GeocodingResponse,
  GeocodingResult,
  WeatherApiResponse,
} from '@/core/shared/types';

export async function fetchCityData(query: string): Promise<CityData | null> {
  const hasPerm = await checkPermission(HOST_PERMISSIONS.weather);
  if (!hasPerm) return null;

  const language = 'en_US';
  const normalizeText = (value: string): string =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const queryParts = query
    .split(',')
    .map((part) => normalizeText(part))
    .filter(Boolean);
  const primaryTerm = queryParts[0] || normalizeText(query);
  const qualifiers = queryParts.slice(1);

  const scoreResult = (result: GeocodingResult): number => {
    const name = normalizeText(result.name || '');
    const country = normalizeText(result.country || '');
    const countryCode = normalizeText(result.country_code || '');
    const admin1 = normalizeText(result.admin1 || '');
    const admin2 = normalizeText(result.admin2 || '');
    const admin3 = normalizeText(result.admin3 || '');
    const context = [country, countryCode, admin1, admin2, admin3].filter(
      Boolean,
    );

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
      const matchesAllQualifiers = qualifiers.every((qualifier) =>
        context.some((part) => part.includes(qualifier)),
      );
      if (matchesAllQualifiers) score += 40;
    }

    return score;
  };

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=${encodeURIComponent(language)}&format=json`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as GeocodingResponse;

    if (data.results && data.results.length > 0) {
      const sorted = [...data.results].sort(
        (a, b) => scoreResult(b) - scoreResult(a),
      );
      const result = sorted[0];
      return {
        name: result.name,
        lat: result.latitude,
        lon: result.longitude,
        country: result.country,
      };
    }
  } catch (error) {
    console.error('Geocoding fetch error:', error);
  }

  return null;
}

export async function fetchWeatherData(
  cityData: CityData,
): Promise<WeatherApiResponse | null> {
  const hasPerm = await checkPermission(HOST_PERMISSIONS.weather);
  if (!hasPerm) return null;

  const { lat, lon } = cityData;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  try {
    const response = await fetch(url);
    return (await response.json()) as WeatherApiResponse;
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
}

export function renderWeatherAlertWidget(): void {
  const containerId = 'weather-alerts-widget';
  let widget = document.getElementById(containerId);

  const isAlertsEnabled =
    localStorage.getItem('weatherAlertsEnabled') === 'true' &&
    localStorage.getItem('weatherEnabled') === 'true';
  if (!isAlertsEnabled) {
    if (widget) widget.remove();
    return;
  }

  const chromeApi = (window as any).chrome;
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

    widget.textContent = '';

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

    // Remove data-i18n so it doesn't get incorrectly overwritten by applyToDOM
    // text.setAttribute('data-i18n', i18nKey);
    const win = window as any;
    if (typeof win.getTranslation === 'function') {
      let translated = win.getTranslation(i18nKey) || message;
      translated = translated.replace('$VALUE$', String(alert.value || ''));
      if (alert.type === 'pollen_high') {
        const pName = String(alert.value).replace('_pollen', '');
        translated = translated.replace('$POLLEN$', pName);
      }
      text.textContent = translated;
    } else {
      text.textContent = message;
    }

    widget.appendChild(img);
    widget.appendChild(text);
  });
}
