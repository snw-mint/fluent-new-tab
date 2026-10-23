/*
 * Fluent New Tab
 * Copyright (c) 2026 SnowMint
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

export const toggleSurfaceTint = getById<HTMLInputElement>('toggleSurfaceTint');
export const accentMoreBtn = getById<HTMLDivElement>('accent-more-btn');
export const accentMoreContainer = getById<HTMLDivElement>(
  'accent-more-container',
);
export const accentColorOptions = getById<HTMLDivElement>('accentColorOptions');

export const accentPresetsRow = getById<HTMLDivElement>('accentPresetsRow');
export const accentCustomColor = getById<HTMLInputElement>('accentCustomColor');
export const mainUiScaleSlider = getById<HTMLInputElement>('mainUiScaleSlider');

export const shortcutsGrid = getById<HTMLDivElement>('shortcutsGrid');
export const folderBackWrapper = getById<HTMLElement>('folderBackWrapper');
export let addModal = getById<HTMLDivElement>('addModal');
export let shortcutForm = getById<HTMLFormElement>('shortcutForm');
export let closeModalBtn = getById<HTMLButtonElement>('closeModalBtn');
export let toggleCustomIcon = getById<HTMLButtonElement>('toggleCustomIcon');
export let customIconGroup = getById<HTMLDivElement>('customIconGroup');
export const shortcutsMoreBtn = getById<HTMLDivElement>('shortcuts-more-btn');
export const shortcutsMoreContainer = getById<HTMLDivElement>(
  'shortcuts-more-container',
);
export const rowsSelect = getById<HTMLSelectElement>('rowsSelect');
export let toggleFolderCustomIcon = getById<HTMLButtonElement>(
  'toggleFolderCustomIcon',
);
export let folderCustomIconGroup = getById<HTMLDivElement>(
  'folderCustomIconGroup',
);
export let inputFolderIcon = getById<HTMLInputElement>('inputFolderIcon');
export const shortcutRadiusRow = getById<HTMLDivElement>('shortcutRadiusRow');
export const shortcutRadiusSlider = getById<HTMLInputElement>(
  'shortcutRadiusSlider',
);
export const toggleHideShortcutNames = getById<HTMLInputElement>(
  'toggleHideShortcutNames',
);
export const importBookmarksBtn = getById<HTMLButtonElement>('importBookmarksBtn');
export let chooseTypeModal = getById<HTMLDivElement>('chooseTypeModal');
export let addFolderModal = getById<HTMLDivElement>('addFolderModal');
export let folderModalTitle = getById<HTMLHeadingElement>('folderModalTitle');
export let inputFolderName = getById<HTMLInputElement>('inputFolderName');

export function refreshShortcutModalRefs(): void {
  addModal = getById<HTMLDivElement>('addModal');
  shortcutForm = getById<HTMLFormElement>('shortcutForm');
  closeModalBtn = getById<HTMLButtonElement>('closeModalBtn');
  toggleCustomIcon = getById<HTMLButtonElement>('toggleCustomIcon');
  customIconGroup = getById<HTMLDivElement>('customIconGroup');
  toggleFolderCustomIcon = getById<HTMLButtonElement>('toggleFolderCustomIcon');
  folderCustomIconGroup = getById<HTMLDivElement>('folderCustomIconGroup');
  inputFolderIcon = getById<HTMLInputElement>('inputFolderIcon');
  chooseTypeModal = getById<HTMLDivElement>('chooseTypeModal');
  addFolderModal = getById<HTMLDivElement>('addFolderModal');
  folderModalTitle = getById<HTMLHeadingElement>('folderModalTitle');
  inputFolderName = getById<HTMLInputElement>('inputFolderName');
}

export const displayWrapper =
  document.querySelector<HTMLElement>('.display-wrapper');
export const greetingWrapper = displayWrapper;
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
export const dateFormatSelect = getById<HTMLSelectElement>('dateFormatSelect');
export const timeFormatSelect = getById<HTMLSelectElement>('timeFormatSelect');
export const customTimeFormatGroup = getById<HTMLDivElement>(
  'customTimeFormatGroup',
);
export const customTimeFormatInput = getById<HTMLInputElement>(
  'customTimeFormatInput',
);
export const timezoneInput = getById<HTMLInputElement>('timezoneInput');
export const greetingNameInput = getById<HTMLInputElement>('greetingNameInput');
export const toggleHighlightName = getById<HTMLInputElement>('toggleHighlightName');

export const engineBtn = getById<HTMLButtonElement>('engineBtn');
export const dropdown = getById<HTMLDivElement>('engineDropdown');
export const currentIcon = getById<HTMLImageElement>('currentEngineIcon');
export const searchForm = getById<HTMLFormElement>('searchForm');
export const searchWrapper = (document.querySelector('.search-wrapper') ||
  document.querySelector('.search-bar') ||
  getById<HTMLFormElement>('searchForm')) as HTMLElement | null;
export const toggleSearchBar = getById<HTMLInputElement>('toggleSearchBar');
export const searchBarStyleSelect = getById<HTMLSelectElement>(
  'searchBarStyleSelect',
);
export const searchMoreBtn = getById<HTMLDivElement>('search-more-btn');
export const searchMoreContainer = getById<HTMLDivElement>(
  'search-more-container',
);
export const toggleSuggestions = getById<HTMLInputElement>('toggleSuggestions');
export const toggleClearSearch = getById<HTMLInputElement>('toggleClearSearch');
export const toggleVoiceSearch = getById<HTMLInputElement>('toggleVoiceSearch');
export const suggestionsContainer = getById<HTMLDivElement>(
  'suggestionsContainer',
);
export const searchInput = getById<HTMLInputElement>('searchInput');
export const voiceSearchBtn = getById<HTMLButtonElement>('voiceSearchBtn');

export const weatherWidget = getById<HTMLAnchorElement>('weatherWidget');
export const toggleWeather = getById<HTMLInputElement>('toggleWeather');
export const cityInputGroup = getById<HTMLDivElement>('cityInputGroup');
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
export const wallpaperBlurSlider = getById<HTMLInputElement>(
  'wallpaperBlurSlider',
);

export const askAiBtn = getById<HTMLButtonElement>('askAiBtn');
export const toggleAskAi = getById<HTMLInputElement>('toggleAskAi');

export const tabNameInput = getById<HTMLInputElement>('tabNameInput');
export const tabFaviconInput = getById<HTMLInputElement>('tabFaviconInput');
export const tabFaviconUploadBtn = getById<HTMLButtonElement>(
  'tabFaviconUploadBtn',
);
export const tabFaviconFileInput = getById<HTMLInputElement>(
  'tabFaviconFileInput',
);

export const feedOptionsGroup = getById<HTMLDivElement>('feedOptionsGroup');
export const feedModeSelect = getById<HTMLSelectElement>('feedModeSelect');
export const editFeedRssBtn = getById<HTMLButtonElement>('editFeedRssBtn');
export const feedDrawer = getById<HTMLDivElement>('feedDrawer');


