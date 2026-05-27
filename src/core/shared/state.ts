import {
  Shortcut,
  ThemeMode,
  WeatherUnit,
  CityData,
  WallpaperSource,
  WallpaperType,
} from '@/core/shared/types';

export let shortcuts: Shortcut[] = [];
export let editingIndex: number | null = null;

try {
  shortcuts =
    (JSON.parse(localStorage.getItem('shortcuts') || '[]') as Shortcut[]) || [];
} catch (e) {
  shortcuts = [];
}

export let allowedRows = parseInt(
  localStorage.getItem('shortcutsRows') || '2',
  10,
);
export let shortcutsVisible =
  localStorage.getItem('shortcutsVisible') !== 'false';
export let currentFolderId: string | null = null;
export let foldersEnabled = localStorage.getItem('foldersEnabled') === 'true';
export let hideShortcutNames =
  localStorage.getItem('hideShortcutNames') === 'true';
export let shortcutRadius = localStorage.getItem('shortcutRadius') || '0';

if (shortcutRadius !== '0') {
  const valNum = parseInt(shortcutRadius, 10);
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

export const savedTheme = (localStorage.getItem('theme') ||
  'auto') as ThemeMode;
export const savedEngine = localStorage.getItem('searchEngine') || 'bing';
export let searchBarVisible =
  localStorage.getItem('searchBarVisible') !== 'false';
export let suggestionsActive =
  localStorage.getItem('suggestionsEnabled') === 'true';
export const suggestionsCache = new Map<string, string[]>();
export let clearSearchEnabled =
  localStorage.getItem('clearSearchEnabled') === 'true';
export let compactBarEnabled =
  localStorage.getItem('compactBarEnabled') === 'true';
export let voiceSearchEnabled =
  localStorage.getItem('voiceSearchEnabled') === 'true';
export const savedAnimationsDisabled =
  localStorage.getItem('animationsDisabled');
export let animationsDisabled =
  savedAnimationsDisabled !== null
    ? savedAnimationsDisabled === 'true'
    : localStorage.getItem('performanceModeEnabled') === 'true';
export const savedBlurDisabled = localStorage.getItem('blurDisabled');
export let blurDisabled = savedBlurDisabled === 'true';
export let reducedEffectsEnabled =
  localStorage.getItem('reducedEffectsEnabled') !== 'false';

export const CACHE_KEY = 'fluent_weather_cache';
export const CITY_KEY = 'fluent_city_data';
export const CACHE_DURATION = 3600000;

export let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true';
export let weatherAlertsEnabled =
  localStorage.getItem('weatherAlertsEnabled') === 'true';
export let weatherUnit = (localStorage.getItem('weatherUnit') ||
  'c') as WeatherUnit;
export let currentCityData: CityData = {
  name: 'New York',
  lat: 40.71,
  lon: -74.01,
};

try {
  const saved = localStorage.getItem(CITY_KEY);
  if (saved) currentCityData = JSON.parse(saved) as CityData;
} catch (e) {
  console.error('Error reading saved city');
}

export let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true';
export let currentProvider =
  localStorage.getItem('launcherProvider') || 'microsoft';

export let wallpaperEnabled =
  localStorage.getItem('wallpaperEnabled') === 'true';
export let currentWallpaperSource = (localStorage.getItem('wallpaperSource') ||
  'local') as WallpaperSource;
export let currentWallpaperType = (localStorage.getItem('wallpaperType') ||
  'upload') as WallpaperType;
export let currentWallpaperValue =
  localStorage.getItem('wallpaperValue') || 'upload';
export let wallpaperOverlay = localStorage.getItem('wallpaperOverlay') || '0.2';

export let accentColorEnabled =
  localStorage.getItem('accentColorEnabled') === 'true';
export let accentColorMode = localStorage.getItem('accentColorMode') || 'auto';
export let accentColorValue =
  localStorage.getItem('accentColorValue') || '#0078d4';

export let askAiEnabled = localStorage.getItem('askAiEnabled') !== 'false';
export let askAiMode = false;
export let sfxMicInstance: HTMLAudioElement | null = null;
export let sfxAskAiInstance: HTMLAudioElement | null = null;

export let mainUiScale = parseFloat(localStorage.getItem('mainUiScale') || '1');
if (mainUiScale !== 1) {
  document.documentElement.style.setProperty(
    '--main-ui-scale',
    `${mainUiScale}`,
  );
}

export const savedDisplayScale = localStorage.getItem('displayScale');
export let displayScale = parseInt(savedDisplayScale || '100', 10);

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

export let tabName = localStorage.getItem('tabName') || '';
export let tabFavicon = localStorage.getItem('tabFavicon') || '';
export let activeSelectTrigger: HTMLButtonElement | null = null;

export function setShortcuts(val: any) {
  shortcuts = val;
}
export function setEditingIndex(val: any) {
  editingIndex = val;
}
export function setAllowedRows(val: any) {
  allowedRows = val;
}
export function setShortcutsVisible(val: any) {
  shortcutsVisible = val;
}
export function setCurrentFolderId(val: any) {
  currentFolderId = val;
}
export function setFoldersEnabled(val: any) {
  foldersEnabled = val;
}
export function setHideShortcutNames(val: any) {
  hideShortcutNames = val;
}
export function setShortcutRadius(val: any) {
  shortcutRadius = val;
}
export function setSearchBarVisible(val: any) {
  searchBarVisible = val;
}
export function setSuggestionsActive(val: any) {
  suggestionsActive = val;
}
export function setClearSearchEnabled(val: any) {
  clearSearchEnabled = val;
}
export function setCompactBarEnabled(val: any) {
  compactBarEnabled = val;
}
export function setVoiceSearchEnabled(val: any) {
  voiceSearchEnabled = val;
}
export function setAnimationsDisabled(val: any) {
  animationsDisabled = val;
}
export function setBlurDisabled(val: any) {
  blurDisabled = val;
}
export function setReducedEffectsEnabled(val: any) {
  reducedEffectsEnabled = val;
}
export function setWeatherEnabled(val: any) {
  weatherEnabled = val;
}
export function setWeatherAlertsEnabled(val: any) {
  weatherAlertsEnabled = val;
}
export function setWeatherUnit(val: any) {
  weatherUnit = val;
}
export function setCurrentCityData(val: any) {
  currentCityData = val;
}
export function setLauncherEnabled(val: any) {
  launcherEnabled = val;
}
export function setCurrentProvider(val: any) {
  currentProvider = val;
}
export function setWallpaperEnabled(val: any) {
  wallpaperEnabled = val;
}
export function setCurrentWallpaperSource(val: any) {
  currentWallpaperSource = val;
}
export function setCurrentWallpaperType(val: any) {
  currentWallpaperType = val;
}
export function setCurrentWallpaperValue(val: any) {
  currentWallpaperValue = val;
}
export function setWallpaperOverlay(val: any) {
  wallpaperOverlay = val;
}
export function setAccentColorEnabled(val: any) {
  accentColorEnabled = val;
}
export function setAccentColorMode(val: any) {
  accentColorMode = val;
}
export function setAccentColorValue(val: any) {
  accentColorValue = val;
}
export function setAskAiEnabled(val: any) {
  askAiEnabled = val;
}
export function setAskAiMode(val: any) {
  askAiMode = val;
}
export function setSfxMicInstance(val: any) {
  sfxMicInstance = val;
}
export function setSfxAskAiInstance(val: any) {
  sfxAskAiInstance = val;
}
export function setMainUiScale(val: any) {
  mainUiScale = val;
}
export function setDisplayScale(val: any) {
  displayScale = val;
}
export function setTabName(val: any) {
  tabName = val;
}
export function setTabFavicon(val: any) {
  tabFavicon = val;
}
export function setActiveSelectTrigger(val: any) {
  activeSelectTrigger = val;
}
