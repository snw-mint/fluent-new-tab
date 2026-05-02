/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file centralizes all DOM element references used across the application
 * for easier access and management.
 */

const configBtn = getById<HTMLButtonElement>('settingsBtn');
const configPopup = getById<HTMLDivElement>('settingsPopup');
const versionDisplay = getById<HTMLAnchorElement>('versionDisplay');
const exportBtn = getById<HTMLButtonElement>('exportBtn');
const importBtn = getById<HTMLButtonElement>('importBtn');
const importInput = getById<HTMLInputElement>('importInput');
const languageSelect = getById<HTMLSelectElement>('languageProvider');

const themeBtns = document.querySelectorAll<HTMLElement>('.theme-btn');
const toggleDisableAnimations = getById<HTMLInputElement>(
  'toggleDisableAnimations',
);
const toggleDisableBlur = getById<HTMLInputElement>('toggleDisableBlur');
const toggleReducedEffects = getById<HTMLInputElement>('toggleReducedEffects');
const reducedEffectsOptions = getById<HTMLDivElement>('reducedEffectsOptions');
const toggleAccentColor = getById<HTMLInputElement>('toggleAccentColor');
const accentMoreSetting = getById<HTMLDivElement>('accentMoreSetting');
const accentMoreBtn = getById<HTMLDivElement>('accent-more-btn');
const accentMoreContainer = getById<HTMLDivElement>('accent-more-container');
const accentColorOptions = getById<HTMLDivElement>('accentColorOptions');
const toggleAccentWallpaper = getById<HTMLInputElement>(
  'toggleAccentWallpaper',
);
const toggleAccentSurfaces = getById<HTMLInputElement>('toggleAccentSurfaces');
const accentPresetsRow = getById<HTMLDivElement>('accentPresetsRow');
const accentCustomColor = getById<HTMLInputElement>('accentCustomColor');

const shortcutsGrid = getById<HTMLDivElement>('shortcutsGrid');
const addModal = getById<HTMLDivElement>('addModal');
const shortcutForm = getById<HTMLFormElement>('shortcutForm');
const closeModalBtn = getById<HTMLButtonElement>('closeModalBtn');
const toggleCustomIcon = getById<HTMLButtonElement>('toggleCustomIcon');
const customIconGroup = getById<HTMLDivElement>('customIconGroup');
const toggleShortcuts = getById<HTMLInputElement>('toggleShortcuts');
const shortcutsMoreSetting = getById<HTMLDivElement>('shortcutsMoreSetting');
const shortcutsMoreBtn = getById<HTMLDivElement>('shortcuts-more-btn');
const shortcutsMoreContainer = getById<HTMLDivElement>(
  'shortcuts-more-container',
);
const rowsSelect = getById<HTMLSelectElement>('rowsSelect');
const rowsInputGroup = getById<HTMLDivElement>('rowsInputGroup');
const foldersRow = getById<HTMLDivElement>('foldersRow');
const toggleFolderCustomIcon = getById<HTMLButtonElement>(
  'toggleFolderCustomIcon',
);
const folderCustomIconGroup = getById<HTMLDivElement>('folderCustomIconGroup');
const inputFolderIcon = getById<HTMLInputElement>('inputFolderIcon');
const shortcutRadiusRow = getById<HTMLDivElement>('shortcutRadiusRow');
const shortcutRadiusSlider = getById<HTMLInputElement>('shortcutRadiusSlider');
const toggleFolders = getById<HTMLInputElement>('toggleFolders');
const toggleHideShortcutNames = getById<HTMLInputElement>(
  'toggleHideShortcutNames',
);
const chooseTypeModal = getById<HTMLDivElement>('chooseTypeModal');
const addFolderModal = getById<HTMLDivElement>('addFolderModal');
const folderModalTitle = getById<HTMLHeadingElement>('folderModalTitle');
const inputFolderName = getById<HTMLInputElement>('inputFolderName');

const greetingWrapper = document.querySelector<HTMLElement>('.logo-wrapper');
const toggleDisplay = getById<HTMLInputElement>('toggleDisplay');
const displayMainOptions = getById<HTMLDivElement>('displayMainOptions');
const displayTypeSelect = getById<HTMLSelectElement>('displayTypeSelect');
const displayAdvancedSetting = getById<HTMLDivElement>(
  'displayAdvancedSetting',
);
const displayToggleBtn = getById<HTMLDivElement>('display-toggle-btn');
const displaySliderContainer = getById<HTMLDivElement>(
  'display-slider-container',
);
const displayScaleSlider = getById<HTMLInputElement>('displayScaleSlider');
const subGreeting = getById<HTMLDivElement>('subGreeting');
const subTime = getById<HTMLDivElement>('subTime');
const subDate = getById<HTMLDivElement>('subDate');
const toggleSeconds = getById<HTMLInputElement>('toggleSeconds');
const toggle12Hour = getById<HTMLInputElement>('toggle12Hour');
const dateFormatSelect = getById<HTMLSelectElement>('dateFormatSelect');
const greetingNameInput = getById<HTMLInputElement>('greetingNameInput');
const greetingStyleSelect = getById<HTMLSelectElement>('greetingStyleSelect');

const engineBtn = getById<HTMLButtonElement>('engineBtn');
const dropdown = getById<HTMLDivElement>('engineDropdown');
const currentIcon = getById<HTMLImageElement>('currentEngineIcon');
const searchForm = getById<HTMLFormElement>('searchForm');
const items = document.querySelectorAll<HTMLElement>('.dropdown-item');
const searchWrapper = (document.querySelector('.search-wrapper') ||
  document.querySelector('.search-bar') ||
  getById<HTMLFormElement>('searchForm')) as HTMLElement | null;
const toggleSearchBar = getById<HTMLInputElement>('toggleSearchBar');
const searchStyleRow = getById<HTMLDivElement>('searchStyleRow');
const searchBarStyleSelect = getById<HTMLSelectElement>('searchBarStyleSelect');
const searchMoreSetting = getById<HTMLDivElement>('searchMoreSetting');
const searchMoreBtn = getById<HTMLDivElement>('search-more-btn');
const searchMoreContainer = getById<HTMLDivElement>('search-more-container');
const suggestionsRow = getById<HTMLDivElement>('suggestionsRow');
const toggleSuggestions = getById<HTMLInputElement>('toggleSuggestions');
const toggleClearSearch = getById<HTMLInputElement>('toggleClearSearch');
const clearSearchRow = getById<HTMLDivElement>('clearSearchRow');
const toggleVoiceSearch = getById<HTMLInputElement>('toggleVoiceSearch');
const suggestionsContainer = getById<HTMLDivElement>('suggestionsContainer');
const searchInput = getById<HTMLInputElement>('searchInput');
const voiceSearchBtn = getById<HTMLButtonElement>('voiceSearchBtn');

const weatherWidget = getById<HTMLAnchorElement>('weatherWidget');
const toggleWeather = getById<HTMLInputElement>('toggleWeather');
const cityInputGroup = getById<HTMLDivElement>('cityInputGroup');
const weatherUnitGroup = getById<HTMLDivElement>('weatherUnitGroup');
const cityInput = getById<HTMLInputElement>('cityInput');
const saveCityBtn = getById<HTMLButtonElement>('saveCityBtn');
const weatherCity = getById<HTMLSpanElement>('weatherCity');
const weatherIcon = getById<HTMLDivElement>('weatherIcon');
const weatherTemp = getById<HTMLSpanElement>('weatherTemp');
const unitBtns = document.querySelectorAll<HTMLButtonElement>('.unit-btn');

const appLauncherWrapper = getById<HTMLDivElement>('appLauncherWrapper');
const appLauncherBtn = getById<HTMLButtonElement>('appLauncherBtn');
const launcherPopup = getById<HTMLDivElement>('launcherPopup');
const launcherGrid = getById<HTMLDivElement>('launcherGrid');
const launcherAllAppsLink = getById<HTMLAnchorElement>('launcherAllAppsLink');
const btnLauncherToFolder = getById<HTMLButtonElement>(
  'btn-launcher-to-folder',
);
const toggleLauncher = getById<HTMLInputElement>('toggleLauncher');
const launcherProvider = getById<HTMLSelectElement>('launcherProvider');
const launcherSelectGroup = getById<HTMLDivElement>('launcherSelectGroup');

const toggleWallpaper = getById<HTMLInputElement>('toggleWallpaper');
const wallpaperSourceSelect = getById<HTMLSelectElement>('wallpaperSource');
const wallpaperSourceContainer = getById<HTMLDivElement>(
  'wallpaperSourceContainer',
);
const uploadWallpaperContainer = getById<HTMLDivElement>(
  'uploadWallpaperContainer',
);
const uploadWallpaperBtn = getById<HTMLButtonElement>('uploadWallpaperBtn');
const uploadInput = getById<HTMLInputElement>('wallpaperUploadInput');
const wallpaperOverlaySetting = getById<HTMLDivElement>(
  'wallpaperOverlaySetting',
);
const overlayToggleBtn = getById<HTMLDivElement>('overlay-toggle-btn');
const overlaySliderContainer = getById<HTMLDivElement>(
  'overlay-slider-container',
);
const overlaySlider = getById<HTMLInputElement>('wallpaper-overlay-slider');

const askAiBtn = getById<HTMLButtonElement>('askAiBtn');
const toggleAskAi = getById<HTMLInputElement>('toggleAskAi');
const askAiRow = getById<HTMLDivElement>('askAiRow');
