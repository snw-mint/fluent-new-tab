/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const UPDATE_NOTICE_PENDING_KEY = 'update_notice_pending';
const UPDATE_NOTICE_VERSION_KEY = 'update_notice_version';
const PERSISTENT_BACKUP_KEY = 'fluent_persistent_backup_v1';

const DEFAULT_INSTALL_PREFERENCES = {
  shortcuts:
    '[{"name":"Wikipedia","url":"https://wikipedia.com","customIcon":"https://upload.wikimedia.org/wikipedia/en/8/80/Wikipedia-logo-v2.svg"},{"name":"YouTube","url":"https://youtube.com","customIcon":null},{"name":"Github","url":"https://github.com/snw-mint/fluent-new-tab","customIcon":"https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"},{"name":"BMC","url":"https://buymeacoffee.com/snw.mint"},{"name":"Help","url":"https://snw-mint.github.io/fluent-new-tab/help","customIcon":"https://github.com/snw-mint/fluent-new-tab/blob/leading/android-chrome-512x512.png?raw=true","type":"link"},{"name":"Spotify","url":"https://spotify.com","customIcon":null},{"name":"MD3: New Tab","url":"https://snw-mint.github.io/md3-new-tab/","customIcon":"https://snw-mint.github.io/md3-new-tab/assets/md3-logo.svg"}]',
  shortcutsTree:
    '[{"name":"Wikipedia","url":"https://wikipedia.com","customIcon":"https://upload.wikimedia.org/wikipedia/en/8/80/Wikipedia-logo-v2.svg"},{"name":"YouTube","url":"https://youtube.com","customIcon":null},{"name":"Github","url":"https://github.com/snw-mint/fluent-new-tab","customIcon":"https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"},{"name":"BMC","url":"https://buymeacoffee.com/snow.mint"},{"name":"Help","url":"https://snw-mint.github.io/fluent-new-tab/help","customIcon":"https://github.com/snw-mint/fluent-new-tab/blob/leading/android-chrome-512x512.png?raw=true","type":"link"},{"name":"Spotify","url":"https://spotify.com","customIcon":null},{"name":"MD3: New Tab","url":"https://snw-mint.github.io/md3-new-tab/","customIcon":"https://snw-mint.github.io/md3-new-tab/assets/md3-logo.svg"}]',
  theme: 'auto',
  shortcutsVisible: 'true',
  shortcutsRows: '1',
  launcherEnabled: 'true',
  launcherProvider: 'microsoft',
  showGreeting: 'true',
  greetingName: '',
  greetingType: 'none',
  userLanguage: 'en_US',
  searchEngine: 'system',
  searchBarVisible: 'true',
  compactBarEnabled: 'false',
  accentColorEnabled: 'true',
  accentColorMode: 'manual',
  accentColorValue: '#107C41',
  displayType: 'greeting',
  showSeconds: 'false',
  use12Hour: 'false',
  dateFormat: 'numeric',
  askAiEnabled: 'false',
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.runtime.setUninstallURL(
    'https://snw-mint.github.io/fluent-new-tab/uninstall.html',
  );

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const rateUsScheduledTime = Date.now() + SEVEN_DAYS_MS;

  if (details.reason === 'install') {
    chrome.storage.local.set({
      [PERSISTENT_BACKUP_KEY]: DEFAULT_INSTALL_PREFERENCES,
      rate_us_scheduled_time: rateUsScheduledTime,
      rate_us_pending: true,
    });

    chrome.tabs.create({
      url: chrome.runtime.getURL('setup/setup.html'),
    });
  }

  if (details.reason === 'update') {
    const version = chrome.runtime.getManifest().version;

    chrome.storage.local.set({
      [UPDATE_NOTICE_PENDING_KEY]: true,
      [UPDATE_NOTICE_VERSION_KEY]: version,
      rate_us_scheduled_time: rateUsScheduledTime,
      rate_us_pending: true,
    });
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateWeatherAlertsStatus') {
    if (message.enabled) {
      chrome.storage.local.set({
        fluent_city_lat: message.lat,
        fluent_city_lon: message.lon,
      });

      chrome.alarms.create('weatherAlertsFetch', { periodInMinutes: 180 });
      fetchAndEvaluateAlerts(message.lat, message.lon);
    } else {
      chrome.alarms.clear('weatherAlertsFetch');
      chrome.storage.local.remove('currentWeatherAlert');
    }
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'weatherAlertsFetch') {
    chrome.storage.local.get(['fluent_city_lat', 'fluent_city_lon'], (data) => {
      if (data.fluent_city_lat && data.fluent_city_lon) {
        fetchAndEvaluateAlerts(data.fluent_city_lat, data.fluent_city_lon);
      }
    });
  }
});

async function fetchAndEvaluateAlerts(lat, lon) {
  try {
    const climateUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,windgusts_10m,weathercode,uv_index&timezone=auto&forecast_hours=14`;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto&forecast_hours=14`;

    const [climateRes, airRes] = await Promise.all([
      fetch(climateUrl).then((res) => res.json()),
      fetch(airUrl).then((res) => res.json()),
    ]);

    let activeAlert = null;

    const temps = climateRes.hourly.temperature_2m;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const currentTemp = temps[0];

    if (currentTemp - minTemp >= 5) {
      activeAlert = { type: 'temp_drop', value: Math.round(minTemp) };
    } else if (maxTemp - currentTemp >= 5) {
      activeAlert = { type: 'temp_rise', value: Math.round(maxTemp) };
    }

    if (!activeAlert) {
      const uvIndexes = climateRes.hourly.uv_index;
      const maxUv = Math.max(...uvIndexes);
      if (maxUv >= 6)
        activeAlert = { type: 'uv_high', value: Math.round(maxUv) };
    }

    if (!activeAlert) {
      const codes = climateRes.hourly.weathercode;
      const hasStorm = codes.some((code) =>
        [65, 75, 95, 96, 99].includes(code),
      );
      if (hasStorm) activeAlert = { type: 'storm', value: null };
    }

    if (!activeAlert) {
      const gusts = climateRes.hourly.windgusts_10m;
      const maxGust = Math.max(...gusts);
      if (maxGust >= 45)
        activeAlert = { type: 'wind_high', value: Math.round(maxGust) };
    }

    if (!activeAlert && airRes.hourly) {
      const pollens = [
        'alder_pollen',
        'birch_pollen',
        'grass_pollen',
        'mugwort_pollen',
        'olive_pollen',
        'ragweed_pollen',
      ];
      for (const pollen of pollens) {
        if (!airRes.hourly[pollen]) continue;
        const values = airRes.hourly[pollen];
        const maxPollen = Math.max(...values);
        if (maxPollen >= 25) {
          activeAlert = { type: 'pollen_high', value: pollen };
          break;
        }
      }
    }

    chrome.storage.local.set({
      currentWeatherAlert: activeAlert
        ? {
            ...activeAlert,
            timestamp: Date.now(),
          }
        : null,
    });
  } catch (e) {
    console.error('Weather Alerts Fetch Error:', e);
  }
}
