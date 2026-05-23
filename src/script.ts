/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { renderWeatherWidget } from './core/weather.js';
import { renderShortcutsGrid } from './core/shortcuts.js';
import { initVanillaDragAndDrop } from './core/drag-drop.js';
import { renderLauncherApps } from './core/launcher.js';
import { ThemeMode, WeatherApiResponse, Shortcut } from './core/types.js';
import {
  displaySliderContainer,
  displayToggleBtn,
  shortcutsMoreContainer,
  shortcutsMoreBtn,
  overlaySliderContainer,
  overlayToggleBtn,
  accentMoreContainer,
  accentMoreBtn,
  searchMoreContainer,
  searchMoreBtn,
  weatherMoreContainer,
  configPopup,
  launcherPopup,
  appLauncherBtn,
  dropdown,
  searchForm,
  toggleSearchBar,
  voiceSearchBtn,
  searchInput,
  toggleVoiceSearch,
  toggleReducedEffects,
  toggleDisableAnimations,
  toggleDisableBlur,
  wallpaperSourceSelect,
  overlaySlider,
  toggleWallpaper,
  greetingWrapper,
  shortcutsGrid,
  toggleShortcuts,
  toggleFolders,
  cityInput,
  toggleFahrenheit,
  toggleLauncher,
  launcherProvider,
  toggleAppearance,
  askAiBtn,
  themeBtns,
  accentColorOptions,
  accentPresetsRow,
  accentCustomColor,
  toggleDisplay,
  rowsSelect,
  toggleSuggestions,
  toggleClearSearch,
  shortcutForm,
  displayTypeSelect,
  displayAdvancedSetting,
  displayScaleSlider,
  shortcutRadiusSlider,
  shortcutRadiusRow,
  toggleHideShortcutNames,
  toggleSeconds,
  toggle12Hour,
  dateFormatSelect,
  greetingNameInput,
  greetingTypeSelect,
  configBtn,
  closeModalBtn,
  inputFolderName,
  inputFolderIcon,
  engineBtn,
  items,
  searchBarStyleSelect,
  toggleAskAi,
  toggleWeather,
  saveCityBtn,
  toggleWeatherAlerts,
  mainUiScaleSlider,
  uploadInput,
  languageSelect,
  versionDisplay,
  exportBtn,
  importBtn,
  importInput,
  subGreeting,
  subTime,
  subDate,
} from './core/dom-references.js';
import { engines, APP_KEYS, launcherData } from './core/config.js';
import {
  searchBarVisible,
  voiceSearchEnabled,
  wallpaperOverlay,
  shortcuts,
  suggestionsActive,
  editingIndex,
  displayScale,
  shortcutRadius,
  hideShortcutNames,
  weatherAlertsEnabled,
  mainUiScale,
  weatherEnabled,
  launcherEnabled,
  currentProvider,
  reducedEffectsEnabled,
  animationsDisabled,
  blurDisabled,
  currentCityData,
  weatherUnit,
  accentColorEnabled,
  askAiMode,
  clearSearchEnabled,
  allowedRows,
  currentFolderId,
  compactBarEnabled,
  currentWallpaperSource,
  currentWallpaperType,
  wallpaperEnabled,
  suggestionsCache,
  setEditingIndex,
  setAnimationsDisabled,
  setBlurDisabled,
  setReducedEffectsEnabled,
  setFoldersEnabled,
  setCurrentFolderId,
  setShortcuts,
  setAllowedRows,
  setAccentColorEnabled,
  setAskAiEnabled,
  setWeatherEnabled,
  setWeatherUnit,
  setWeatherAlertsEnabled,
  setLauncherEnabled,
  setCurrentProvider,
  setMainUiScale,
  setDisplayScale,
  setShortcutRadius,
  setHideShortcutNames,
  setSearchBarVisible,
  setSuggestionsActive,
  setClearSearchEnabled,
  setCompactBarEnabled,
  setVoiceSearchEnabled,
  setCurrentWallpaperSource,
  setCurrentWallpaperType,
  setCurrentWallpaperValue,
  setWallpaperEnabled,
} from './core/state.js';
import { applyGoogleSearchParams, performSearch } from './core/search.js';
import {
  applyInitialTheme,
  applyTheme,
  applyInitialAccentColorState,
  applyAccentColor,
} from './core/color.js';
import { initDisplayWidget } from './core/display.js';
import {
  getInputTarget,
  getSelectTarget,
  getInputById,
} from './core/dom-utils.js';
import {
  warningModal,
  applyMagneticSnap,
  showToast,
  setCollapsible,
} from './core/ui-components.js';
import {
  initCustomSelectSystem,
  closeSelectPopup,
} from './core/fluent-select.js';
import {
  bindWeatherFeature,
  bindAccentColorFeature,
  bindLauncherFeature,
  bindSearchFeature,
  bindDisplayFeature,
  bindShortcutRadiusFeature,
  bindMainUiScaleFeature,
  bindWallpaperFeature,
} from './core/event-bindings.js';

// --- Local helper functions (orchestration wrappers) ---

function getActiveShortcutsList(): Shortcut[] {
  if (currentFolderId) {
    const folder = shortcuts.find(
      (s) => s.id === currentFolderId && s.type === 'folder',
    );
    if (folder && folder.children) return folder.children;
  }
  return shortcuts;
}

function renderShortcuts(): void {
  renderShortcutsGrid({
    shortcutsGrid,
    rowsSelect,
    shortcuts,
    currentFolderId,
    onOpenModal: (index) => {
      setEditingIndex(index);
    },
    onDeleteShortcut: (index) => {
      const targetArray = getActiveShortcutsList();
      targetArray.splice(index, 1);
      saveAndRender();
    },
    onClosePopups: () => {
      document.querySelectorAll('.shortcut-dropdown.active').forEach((el) => {
        el.classList.remove('active');
      });
    },
    onOpenFolder: (id) => {
      setCurrentFolderId(id);
      renderShortcuts();
    },
    onGoBack: () => {
      setCurrentFolderId(null);
      renderShortcuts();
    },
  });
}

function saveAndRender(): void {
  localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
  renderShortcuts();
}

const WEATHER_CACHE_KEY = 'weatherCache';
const WEATHER_CACHE_DURATION = 15 * 60 * 1000;

function renderWeather(data: WeatherApiResponse | null): void {
  const weatherCity = document.getElementById('weatherCity');
  const weatherTemp = document.getElementById('weatherTemp');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherWidget = document.getElementById('weatherWidget') as HTMLAnchorElement | null;
  renderWeatherWidget(data, weatherUnit, currentCityData, {
    weatherCity,
    weatherTemp,
    weatherIcon,
    weatherWidget,
  });
}

async function fetchWeatherFromAPI(forceUpdate = false): Promise<void> {
  if (!currentCityData?.lat || !currentCityData?.lon) return;
  const { fetchWeatherData } = await import('./core/services.js');
  const data = await fetchWeatherData(currentCityData);
  if (data) {
    if (forceUpdate) {
      localStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), city: currentCityData.name, data }),
      );
    }
    renderWeather(data);
  }
}

async function initWeather(): Promise<void> {
  const cachedString = localStorage.getItem(WEATHER_CACHE_KEY);
  if (cachedString) {
    try {
      const cached = JSON.parse(cachedString) as { timestamp: number; city: string; data: WeatherApiResponse };
      if (Date.now() - cached.timestamp < WEATHER_CACHE_DURATION && cached.city === currentCityData.name) {
        renderWeather(cached.data);
        return;
      }
    } catch {
      // ignore corrupt cache
    }
  }
  await fetchWeatherFromAPI();
}

function renderLauncher(providerKey: keyof typeof launcherData): void {
  const launcherGrid = document.getElementById('launcherGrid');
  const launcherAllAppsLink = document.getElementById('launcherAllAppsLink') as HTMLAnchorElement | null;
  renderLauncherApps(launcherData[providerKey], { launcherGrid, launcherAllAppsLink });
}

// --- End local helpers ---

let brandIntervalStarted = false;
function applyBrandInterval() {
  if (greetingWrapper) initDisplayWidget(greetingWrapper);
  if (brandIntervalStarted) return;
  brandIntervalStarted = true;
  setInterval(() => {
    if (greetingWrapper) initDisplayWidget(greetingWrapper);
  }, 60000);
}

async function initCritical() {
  applyInitialTheme();

  if (themeBtns) {
    themeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme as ThemeMode | undefined;
        if (!theme) return;
        applyTheme(theme);
        localStorage.setItem('theme', theme);
      });
    });
  }

  bindAccentColorFeature({
    applyInitialAccentState: applyInitialAccentColorState,
    toggleAppearance,
    accentColorOptions,
    setCollapsibleFn: setCollapsible,
    accentPresetsRow,
    accentCustomColor,
    applyAccentColor,
    applyWallpaperLogic: () => {
      /* Delegado para bindings */
    },
  });

  applyBrandInterval();
}

function initVisual() {
  if (toggleDisplay) {
    toggleDisplay.checked = localStorage.getItem('displayEnabled') !== 'false';
  }

  if (rowsSelect) {
    rowsSelect.value = String(allowedRows);
  }

  renderShortcuts();

  if (shortcutsGrid) {
    initVanillaDragAndDrop({
      gridContainer: shortcutsGrid,
      onReorder: (oldIndex, newIndex) => {
        const targetArray = getActiveShortcutsList();
        const item = targetArray.splice(oldIndex, 1)[0];
        if (item) {
          targetArray.splice(newIndex, 0, item);
          saveAndRender();
        }
      },
      onMoveToFolder: (itemIndex, folderId) => {
        const targetArray = getActiveShortcutsList();
        const folder = shortcuts.find(
          (s) => s.id === folderId && s.type === 'folder',
        );
        const item = targetArray[itemIndex];
        if (folder && item && item.type !== 'folder') {
          folder.children = folder.children || [];
          targetArray.splice(itemIndex, 1);
          folder.children.push(item);
          saveAndRender();
        }
      },
      onMoveOutFolder: (itemIndex) => {
        if (!currentFolderId) return;
        const targetArray = getActiveShortcutsList();
        const item = targetArray.splice(itemIndex, 1)[0];
        if (item) {
          shortcuts.push(item);
          saveAndRender();
        }
      },
    });
  }

  if (launcherEnabled) renderLauncher(currentProvider);
  if (weatherEnabled) initWeather();
  initCustomSelectSystem();

  if (versionDisplay) {
    try {
      versionDisplay.textContent = `v${chrome.runtime.getManifest().version}`;
    } catch {
      versionDisplay.textContent = 'v1.0';
    }
  }
}

function initAllEventBindings() {
  if (toggleDisplay) {
    toggleDisplay.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('displayEnabled', String(target.checked));
      if (greetingWrapper) initDisplayWidget(greetingWrapper);
    });
  }

  bindDisplayFeature({
    displayTypeSelect,
    displayAdvancedSetting,
    displayToggleBtn,
    displaySliderContainer,
    subGreeting,
    subTime,
    subDate,
    displayScaleSlider,
    getDisplayScale: () => displayScale,
    setDisplayScale: (scale: number) => {
      setDisplayScale(scale); // Fixed Cannot assign to read-only
    },
  });

  bindShortcutRadiusFeature({
    shortcutRadiusSlider,
    shortcutRadiusRow,
    getShortcutRadius: () => shortcutRadius,
    setShortcutRadius: (radius: string) => {
      setShortcutRadius(radius); // Fixed Cannot assign to read-only
    },
    toggleHideShortcutNames,
    getHideShortcutNames: () => hideShortcutNames,
    setHideShortcutNames: (enabled: boolean) => {
      setHideShortcutNames(enabled); // Fixed Cannot assign to read-only
    },
  });

  bindMainUiScaleFeature({
    mainUiScaleSlider,
    getMainUiScale: () => mainUiScale,
    setMainUiScale: (val: number) => {
      setMainUiScale(val); // Fixed Cannot assign to read-only
    },
  });

  if (rowsSelect) {
    rowsSelect.value = String(allowedRows);
    rowsSelect.addEventListener('change', (e) => {
      const target = getSelectTarget(e);
      if (!target) return;
      setAllowedRows(parseInt(target.value)); // Fixed Cannot assign to read-only
      localStorage.setItem('shortcutsRows', String(allowedRows));
      renderShortcuts();
    });
  }

  if (toggleDisableAnimations) {
    toggleDisableAnimations.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      setAnimationsDisabled(target.checked); // Fixed Cannot assign to read-only
      localStorage.setItem('animationsDisabled', String(target.checked));
    });
  }

  if (toggleDisableBlur) {
    toggleDisableBlur.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      setBlurDisabled(target.checked); // Fixed Cannot assign to read-only
      localStorage.setItem('blurDisabled', String(target.checked));
    });
  }

  if (toggleReducedEffects) {
    toggleReducedEffects.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      setReducedEffectsEnabled(target.checked); // Fixed Cannot assign to read-only
      localStorage.setItem('reducedEffectsEnabled', String(target.checked));
    });
  }

  applyMagneticSnap('displayScaleSlider', 100, 5);
  applyMagneticSnap('shortcutRadiusSlider', 0, 5);
  applyMagneticSnap('mainUiScaleSlider', 1, 0.05);
  applyMagneticSnap('wallpaper-overlay-slider', 0.2, 0.05);
}

document.addEventListener('DOMContentLoaded', async () => {
  await initCritical();
  initVisual();

  const runDeferred = () => {
    initAllEventBindings();
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runDeferred, { timeout: 600 });
  } else {
    setTimeout(runDeferred, 0);
  }
});

document.addEventListener('i18nReady', () => {
  applyBrandInterval();
  renderShortcuts();
});

document.body.addEventListener('dragover', (e) => {
  if (document.body.classList.contains('is-sorting-shortcuts')) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }
});
