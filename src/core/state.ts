/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file manages the application's global state, including user preferences,
 * feature settings, and cached data for various components.
 */

let shortcuts: Shortcut[] = [];
let editingIndex: number | null = null;
try {
  shortcuts =
    (JSON.parse(localStorage.getItem('shortcuts') || '[]') as Shortcut[]) || [];
} catch (e) {
  shortcuts = [];
}

let allowedRows = parseInt(localStorage.getItem('shortcutsRows') || '2');
let shortcutsVisible = localStorage.getItem('shortcutsVisible') !== 'false';
let currentFolderId: string | null = null;
let foldersEnabled = localStorage.getItem('foldersEnabled') === 'true';
let hideShortcutNames = localStorage.getItem('hideShortcutNames') === 'true';
let shortcutRadius = localStorage.getItem('shortcutRadius') || '0';

if (shortcutRadius !== '0') {
  let valNum = parseInt(shortcutRadius, 10);
  let radiusValue = '';

  if (valNum === 0) {
    radiusValue = '0.7875rem';
  } else if (valNum > 0) {
    radiusValue = `calc(0.7875rem + ((50% - 0.7875rem) * (${valNum} / 100)))`;
  } else {
    radiusValue = `calc(0.7875rem - ((0.7875rem - 0.18rem) * (${-valNum} / 100)))`;
  }

  document.documentElement.style.setProperty('--shortcut-radius', radiusValue);
}

const savedTheme = (localStorage.getItem('theme') || 'auto') as ThemeMode;
const savedEngine = (localStorage.getItem('searchEngine') ||
  'bing') as keyof typeof engines;
let searchBarVisible = localStorage.getItem('searchBarVisible') !== 'false';
let suggestionsActive = localStorage.getItem('suggestionsEnabled') === 'true';
const suggestionsCache = new Map<string, string[]>();
let clearSearchEnabled = localStorage.getItem('clearSearchEnabled') === 'true';
let compactBarEnabled = localStorage.getItem('compactBarEnabled') === 'true';
let voiceSearchEnabled = localStorage.getItem('voiceSearchEnabled') === 'true';
const savedAnimationsDisabled = localStorage.getItem('animationsDisabled');
let animationsDisabled =
  savedAnimationsDisabled !== null
    ? savedAnimationsDisabled === 'true'
    : localStorage.getItem('performanceModeEnabled') === 'true';
const savedBlurDisabled = localStorage.getItem('blurDisabled');
let blurDisabled = savedBlurDisabled === 'true';
let reducedEffectsEnabled =
  localStorage.getItem('reducedEffectsEnabled') !== 'false';

const CACHE_KEY = 'fluent_weather_cache';
const CITY_KEY = 'fluent_city_data';
const CACHE_DURATION = 3600000;

let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true';
let weatherAlertsEnabled =
  localStorage.getItem('weatherAlertsEnabled') === 'true';
let weatherUnit = (localStorage.getItem('weatherUnit') || 'c') as WeatherUnit;
let currentCityData: CityData = { name: 'New York', lat: 40.71, lon: -74.01 };
try {
  const saved = localStorage.getItem(CITY_KEY);
  if (saved) currentCityData = JSON.parse(saved) as CityData;
} catch (e) {
  console.error('Error reading saved city');
}

let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true';
let currentProvider = (localStorage.getItem('launcherProvider') ||
  'microsoft') as keyof typeof launcherData;

let wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';
let currentWallpaperSource = (localStorage.getItem('wallpaperSource') ||
  'local') as WallpaperSource;
let currentWallpaperType = (localStorage.getItem('wallpaperType') ||
  'upload') as WallpaperType;
let currentWallpaperValue = localStorage.getItem('wallpaperValue') || 'upload';
let wallpaperOverlay = localStorage.getItem('wallpaperOverlay') || '0.2';

let accentColorEnabled = localStorage.getItem('accentColorEnabled') === 'true';
let accentColorMode = localStorage.getItem('accentColorMode') || 'auto';
let accentColorValue = localStorage.getItem('accentColorValue') || '#0078d4';

let askAiEnabled = localStorage.getItem('askAiEnabled') !== 'false';
let askAiMode = false;
let sfxMicInstance: HTMLAudioElement | null = null;
let sfxAskAiInstance: HTMLAudioElement | null = null;

let mainUiScale = parseFloat(localStorage.getItem('mainUiScale') || '1');
if (mainUiScale !== 1) {
  document.documentElement.style.setProperty(
    '--main-ui-scale',
    `${mainUiScale}`,
  );
}

const savedDisplayScale = localStorage.getItem('displayScale');
let displayScale = parseInt(savedDisplayScale || '100');

if (!savedDisplayScale) {
  document.documentElement.style.setProperty(
    '--display-scale',
    `${mainUiScale}`,
  );
} else if (displayScale !== 100) {
  document.documentElement.style.setProperty(
    '--display-scale',
    `${displayScale / 100}`,
  );
}

let tabName = localStorage.getItem('tabName') || '';
let tabFavicon = localStorage.getItem('tabFavicon') || '';
