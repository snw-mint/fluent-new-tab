/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { getById } from './dom-utils';

export const configBtn = getById<HTMLButtonElement>('settingsBtn');
export const weatherMoreBtn = getById<HTMLDivElement>('weather-more-btn');
export const configPopup = getById<HTMLDivElement>('settingsPopup');
export const versionDisplay = getById<HTMLAnchorElement>('versionDisplay');
export const exportBtn = getById<HTMLButtonElement>('exportBtn');
export const importBtn = getById<HTMLButtonElement>('importBtn');
export const importInput = getById<HTMLInputElement>('importInput');
export const languageSelect = getById<HTMLSelectElement>('languageProvider');

export const themeBtns = document.querySelectorAll<HTMLElement>('.theme-btn');
export const toggleDisableAnimations = getById<HTMLInputElement>(
  'toggleDisableAnimations',
);

export const toggleAccessibility = getById<HTMLInputElement>(
  'toggleAccessibility',
);
export const accessibilityOptions = getById<HTMLDivElement>(
  'accessibilityOptions',
);
export const toggleAppearance = getById<HTMLInputElement>('toggleAppearance');
export const toggleSurfaceTint = getById<HTMLInputElement>('toggleSurfaceTint');
export const surfaceTintRow = getById<HTMLDivElement>('surfaceTintRow');
export const accentMoreSetting = getById<HTMLDivElement>('accentMoreSetting');
export const accentMoreBtn = getById<HTMLDivElement>('accent-more-btn');
export const accentMoreContainer = getById<HTMLDivElement>(
  'accent-more-container',
);
export const accentColorOptions = getById<HTMLDivElement>('accentColorOptions');
export const toggleAccentWallpaper = getById<HTMLInputElement>(
  'toggleAccentWallpaper',
);

export const accentPresetsRow = getById<HTMLDivElement>('accentPresetsRow');
export const accentCustomColor = getById<HTMLInputElement>('accentCustomColor');
export const mainUiScaleRow = getById<HTMLDivElement>('mainUiScaleRow');
export const mainUiScaleSlider = getById<HTMLInputElement>('mainUiScaleSlider');

export const shortcutsGrid = getById<HTMLDivElement>('shortcutsGrid');
export const folderBackWrapper = getById<HTMLElement>('folderBackWrapper');
export const addModal = getById<HTMLDivElement>('addModal');
export const shortcutForm = getById<HTMLFormElement>('shortcutForm');
export const closeModalBtn = getById<HTMLButtonElement>('closeModalBtn');
export const toggleCustomIcon = getById<HTMLButtonElement>('toggleCustomIcon');
export const customIconGroup = getById<HTMLDivElement>('customIconGroup');
export const toggleShortcuts = getById<HTMLInputElement>('toggleShortcuts');
export const shortcutsMoreSetting = getById<HTMLDivElement>(
  'shortcutsMoreSetting',
);
export const shortcutsMoreBtn = getById<HTMLDivElement>('shortcuts-more-btn');
export const shortcutsMoreContainer = getById<HTMLDivElement>(
  'shortcuts-more-container',
);
export const rowsSelect = getById<HTMLSelectElement>('rowsSelect');
export const rowsInputGroup = getById<HTMLDivElement>('rowsInputGroup');
export const foldersRow = getById<HTMLDivElement>('foldersRow');
export const toggleFolderCustomIcon = getById<HTMLButtonElement>(
  'toggleFolderCustomIcon',
);
export const folderCustomIconGroup = getById<HTMLDivElement>(
  'folderCustomIconGroup',
);
export const inputFolderIcon = getById<HTMLInputElement>('inputFolderIcon');
export const shortcutRadiusRow = getById<HTMLDivElement>('shortcutRadiusRow');
export const shortcutRadiusSlider = getById<HTMLInputElement>(
  'shortcutRadiusSlider',
);
export const toggleFolders = getById<HTMLInputElement>('toggleFolders');
export const toggleHideShortcutNames = getById<HTMLInputElement>(
  'toggleHideShortcutNames',
);
export const chooseTypeModal = getById<HTMLDivElement>('chooseTypeModal');
export const addFolderModal = getById<HTMLDivElement>('addFolderModal');
export const folderModalTitle = getById<HTMLHeadingElement>('folderModalTitle');
export const inputFolderName = getById<HTMLInputElement>('inputFolderName');

export const greetingWrapper =
  document.querySelector<HTMLElement>('.logo-wrapper');
export const toggleDisplay = getById<HTMLInputElement>('toggleDisplay');
export const displayMainOptions = getById<HTMLDivElement>('displayMainOptions');
export const displayTypeSelect =
  getById<HTMLSelectElement>('displayTypeSelect');
export const displayAdvancedSetting = getById<HTMLDivElement>(
  'displayAdvancedSetting',
);
export const displayToggleBtn = getById<HTMLDivElement>('display-toggle-btn');
export const displaySliderContainer = getById<HTMLDivElement>(
  'display-slider-container',
);
export const displayScaleSlider =
  getById<HTMLInputElement>('displayScaleSlider');
export const subGreeting = getById<HTMLDivElement>('subGreeting');
export const subTime = getById<HTMLDivElement>('subTime');
export const subDate = getById<HTMLDivElement>('subDate');
export const toggleSeconds = getById<HTMLInputElement>('toggleSeconds');
export const toggle12Hour = getById<HTMLInputElement>('toggle12Hour');
export const dateFormatSelect = getById<HTMLSelectElement>('dateFormatSelect');
export const greetingNameInput = getById<HTMLInputElement>('greetingNameInput');
export const toggleHighlightName = getById<HTMLInputElement>('toggleHighlightName');
export const greetingTypeSelect =
  getById<HTMLSelectElement>('greetingTypeSelect');

export const engineBtn = getById<HTMLButtonElement>('engineBtn');
export const dropdown = getById<HTMLDivElement>('engineDropdown');
export const currentIcon = getById<HTMLImageElement>('currentEngineIcon');
export const searchForm = getById<HTMLFormElement>('searchForm');
export const items = document.querySelectorAll<HTMLElement>('.dropdown-item');
export const searchWrapper = (document.querySelector('.search-wrapper') ||
  document.querySelector('.search-bar') ||
  getById<HTMLFormElement>('searchForm')) as HTMLElement | null;
export const toggleSearchBar = getById<HTMLInputElement>('toggleSearchBar');
export const searchStyleRow = getById<HTMLDivElement>('searchStyleRow');
export const searchBarStyleSelect = getById<HTMLSelectElement>(
  'searchBarStyleSelect',
);
export const searchMoreSetting = getById<HTMLDivElement>('searchMoreSetting');
export const searchMoreBtn = getById<HTMLDivElement>('search-more-btn');
export const searchMoreContainer = getById<HTMLDivElement>(
  'search-more-container',
);
export const suggestionsRow = getById<HTMLDivElement>('suggestionsRow');
export const toggleSuggestions = getById<HTMLInputElement>('toggleSuggestions');
export const toggleClearSearch = getById<HTMLInputElement>('toggleClearSearch');
export const clearSearchRow = getById<HTMLDivElement>('clearSearchRow');
export const toggleVoiceSearch = getById<HTMLInputElement>('toggleVoiceSearch');
export const toggleVisualSearch =
  getById<HTMLInputElement>('toggleVisualSearch');
export const visualSearchRow = getById<HTMLDivElement>('visualSearchRow');
export const visualSearchBtn = getById<HTMLButtonElement>('visualSearchBtn');
export const suggestionsContainer = getById<HTMLDivElement>(
  'suggestionsContainer',
);
export const searchInput = getById<HTMLInputElement>('searchInput');
export const voiceSearchBtn = getById<HTMLButtonElement>('voiceSearchBtn');

export const weatherWidget = getById<HTMLAnchorElement>('weatherWidget');
export const toggleWeather = getById<HTMLInputElement>('toggleWeather');
export const cityInputGroup = getById<HTMLDivElement>('cityInputGroup');
export const weatherUnitGroup = getById<HTMLDivElement>('weatherUnitGroup');
export const cityInput = getById<HTMLInputElement>('cityInput');
export const saveCityBtn = getById<HTMLButtonElement>('saveCityBtn');
export const citySuggestionsDropdown = getById<HTMLDivElement>('citySuggestionsDropdown');
export const citySuggestionsList = getById<HTMLUListElement>('citySuggestionsList');
export const weatherCity = getById<HTMLSpanElement>('weatherCity');
export const weatherIcon = getById<HTMLDivElement>('weatherIcon');
export const weatherTemp = getById<HTMLSpanElement>('weatherTemp');

export const toggleFahrenheit = getById<HTMLInputElement>('toggleFahrenheit');
export const toggleWeatherAlerts = getById<HTMLInputElement>(
  'toggleWeatherAlerts',
);
export const weatherAlertsGroup = getById<HTMLDivElement>('weatherAlertsGroup');
export const weatherMoreContainer = getById<HTMLDivElement>(
  'weather-more-container',
);

export const appLauncherWrapper = getById<HTMLDivElement>('appLauncherWrapper');
export const appLauncherBtn = getById<HTMLButtonElement>('appLauncherBtn');
export const launcherPopup = getById<HTMLDivElement>('launcherPopup');
export const launcherGrid = getById<HTMLDivElement>('launcherGrid');
export const launcherAllAppsLink = getById<HTMLAnchorElement>(
  'launcherAllAppsLink',
);
export const toggleLauncher = getById<HTMLInputElement>('toggleLauncher');
export const launcherProvider = getById<HTMLSelectElement>('launcherProvider');
export const launcherSelectGroup = getById<HTMLDivElement>(
  'launcherSelectGroup',
);

export const toggleWallpaper = getById<HTMLInputElement>('toggleWallpaper');
export const wallpaperSourceSelect =
  getById<HTMLSelectElement>('wallpaperSource');
export const wallpaperSourceContainer = getById<HTMLDivElement>(
  'wallpaperSourceContainer',
);
export const uploadWallpaperContainer = getById<HTMLDivElement>(
  'uploadWallpaperContainer',
);
export const uploadWallpaperBtn =
  getById<HTMLButtonElement>('uploadWallpaperBtn');
export const uploadInput = getById<HTMLInputElement>('wallpaperUploadInput');
export const wallpaperOverlaySetting = getById<HTMLDivElement>(
  'wallpaperOverlaySetting',
);
export const overlayToggleBtn = getById<HTMLDivElement>('overlay-toggle-btn');
export const overlaySliderContainer = getById<HTMLDivElement>(
  'overlay-slider-container',
);
export const overlaySlider = getById<HTMLInputElement>(
  'wallpaper-overlay-slider',
);

export const askAiBtn = getById<HTMLButtonElement>('askAiBtn');
export const toggleAskAi = getById<HTMLInputElement>('toggleAskAi');
export const askAiRow = getById<HTMLDivElement>('askAiRow');

export const tabNameInput = getById<HTMLInputElement>('tabNameInput');
export const tabFaviconInput = getById<HTMLInputElement>('tabFaviconInput');
export const tabFaviconUploadBtn = getById<HTMLButtonElement>(
  'tabFaviconUploadBtn',
);
export const tabFaviconFileInput = getById<HTMLInputElement>(
  'tabFaviconFileInput',
);
