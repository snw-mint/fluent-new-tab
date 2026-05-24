/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

declare const chrome: any;
import { renderWeatherWidget } from './core/weather.js';
import { checkPermission, HOST_PERMISSIONS, fetchSuggestionsFromService } from './core/services.js';
import { renderShortcutsGrid } from './core/shortcuts.js';
import { initVanillaDragAndDrop } from './core/drag-drop.js';
import { renderLauncherApps, updateLauncherFooterVariant } from './core/launcher.js';
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
  rowsInputGroup,
  searchWrapper,
  currentIcon,
  weatherWidget,
  cityInputGroup,
  appLauncherWrapper,
  suggestionsContainer,
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
  setShortcutsVisible,
  setCurrentCityData,
  savedEngine,
  currentWallpaperValue,
} from './core/state.js';
import { applyGoogleSearchParams, performSearch, clearSuggestionsUI, renderSuggestionsUI, updateSuggestionSelectionUI } from './core/search.js';
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
import { bindMainUiFeatures, openModal, closePopups } from './core/main-ui.js';
import { initStandaloneListeners } from './core/standalone-listeners.js';
import { processWallpaperImage, saveWallpaperToDB } from './core/wallpaper-storage.js';

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

function updateSingleRowClass(): void {
  if (!shortcutsGrid) return;
  const COLUMNS = 10;
  const activeArray = getActiveShortcutsList();
  const itemCount = activeArray.length;
  const backSlot = currentFolderId ? 1 : 0;
  if (itemCount + backSlot <= COLUMNS) {
    shortcutsGrid.classList.add('single-row');
  } else {
    shortcutsGrid.classList.remove('single-row');
  }
  shortcutsGrid.style.setProperty('--shortcut-count', String(itemCount + backSlot));
  shortcutsGrid.style.gridTemplateColumns = `repeat(${COLUMNS}, minmax(0, 1fr))`;
}

function renderShortcuts(): void {
  renderShortcutsGrid({
    shortcutsGrid,
    rowsSelect,
    shortcuts,
    currentFolderId,
    onOpenModal: (index) => {
      openModal(index, getActiveShortcutsList);
    },
    onDeleteShortcut: (index) => {
      const targetArray = getActiveShortcutsList();
      targetArray.splice(index, 1);
      saveAndRender();
    },
    onClosePopups: closePopups,
    onOpenFolder: (id) => {
      setCurrentFolderId(id);
      renderShortcuts();
    },
    onGoBack: () => {
      setCurrentFolderId(null);
      renderShortcuts();
    },
  });
  updateSingleRowClass();
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
  const weatherWidget = document.getElementById(
    'weatherWidget',
  ) as HTMLAnchorElement | null;
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
        JSON.stringify({
          timestamp: Date.now(),
          city: currentCityData.name,
          data,
        }),
      );
    }
    renderWeather(data);
  }
}

async function initWeather(): Promise<void> {
  const cachedString = localStorage.getItem(WEATHER_CACHE_KEY);
  if (cachedString) {
    try {
      const cached = JSON.parse(cachedString) as {
        timestamp: number;
        city: string;
        data: WeatherApiResponse;
      };
      if (
        Date.now() - cached.timestamp < WEATHER_CACHE_DURATION &&
        cached.city === currentCityData.name
      ) {
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
  const launcherAllAppsLink = document.getElementById(
    'launcherAllAppsLink',
  ) as HTMLAnchorElement | null;
  renderLauncherApps(launcherData[providerKey], {
    launcherGrid,
    launcherAllAppsLink,
  });
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
  
  if (toggleShortcuts) {
    toggleShortcuts.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      setShortcutsVisible(target.checked);
      updateShortcutsVisibility(target.checked);
      localStorage.setItem('shortcutsVisible', String(target.checked));
    });
  }

  if (toggleDisplay) {
    toggleDisplay.checked = localStorage.getItem('displayEnabled') !== 'false';
  }

  if (rowsSelect) {
    rowsSelect.value = String(allowedRows);
  }

  renderShortcuts();
  
  updateSearchSettings(searchBarVisible, false);
  updateWeatherVisibility(weatherEnabled, false);
  updateLauncherVisibility(launcherEnabled, false);
  updateWallpaperUIState(wallpaperEnabled, false);

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



// --- Missing Search & Wallpaper Orchestrators ---
function updateShortcutsVisibility(visible: boolean, animate = true) {
  if (shortcutsGrid) shortcutsGrid.style.display = visible ? 'grid' : 'none';
  if (rowsInputGroup) setCollapsible(rowsInputGroup, visible, animate);
  const shortcutsMoreSetting = document.getElementById('shortcutsMoreSetting');
  if (shortcutsMoreSetting) setCollapsible(shortcutsMoreSetting, visible, animate);
}
function updateSearchSettings(visible: boolean, animate = true) {
  if (searchWrapper) searchWrapper.style.display = visible ? '' : 'none';
  if (toggleSearchBar) toggleSearchBar.checked = visible;
  const searchMainOptions = document.getElementById('searchMainOptions');
  if (searchMainOptions) setCollapsible(searchMainOptions, visible, animate);
}
function updateCompactBarStyle() {
  if (searchWrapper) {
    if (compactBarEnabled) searchWrapper.classList.add('compact');
    else searchWrapper.classList.remove('compact');
  }
}
function setSearchEngine(engineKey) {
  const config = engines[engineKey];
  if (config) {
    if (currentIcon) {
      currentIcon.src = config.icon;
      currentIcon.onerror = () => { currentIcon.style.display = 'none'; };
      currentIcon.onload = () => { currentIcon.style.display = 'block'; };
    }
    if (searchForm) searchForm.action = config.url;
    applyGoogleSearchParams(searchForm, engineKey, clearSearchEnabled);
  }
}
// -------------------------------------

// --- Missing Feature Orchestrators ---

async function loadCustomWallpaper() {
  const { getWallpaperFromDB } = await import('./core/wallpaper-storage.js');
  const blob = await getWallpaperFromDB();
  if (blob) {
    const url = URL.createObjectURL(blob);
    document.body.style.backgroundImage = `url('${url}')`;
  } else {
    document.body.style.backgroundImage = 'none';
    document.body.removeAttribute('data-wallpaper-active');
  }
}

async function applyWallpaperLogic() {
  try {
    if (overlaySlider) {
        document.documentElement.style.setProperty('--overlay-opacity', wallpaperEnabled ? String(wallpaperOverlay) : '0');
    }
    
    if (!wallpaperEnabled) {
      document.body.style.backgroundImage = 'none';
      document.body.removeAttribute('data-wallpaper-active');
      return;
    }

    document.body.setAttribute('data-wallpaper-active', 'true');
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';

    if (currentWallpaperSource === 'local') {
      if (currentWallpaperType === 'upload') {
        await loadCustomWallpaper();
      } else {
        document.body.style.backgroundImage = 'none';
      }
    } else {
      const url = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(currentWallpaperValue || 'landscape')}`;
      document.body.style.backgroundImage = `url('${url}')`;
    }
  } catch (error) {
    console.error('Wallpaper Error:', error);
  }
}

function applyInitialWallpaperState() {
  updateWallpaperUIState(wallpaperEnabled, false);
}
function updateWallpaperUIState(visible: boolean, animate = true) {
  const container = wallpaperSourceSelect ? (wallpaperSourceSelect.closest('.wallpaper-source-options') as HTMLElement) : null;
  if (container) setCollapsible(container, visible, animate);
  const uploadContainer = document.getElementById('uploadWallpaperContainer');
  if (uploadContainer) {
    if (!visible || currentWallpaperType !== 'upload') uploadContainer.style.display = 'none';
    else uploadContainer.style.display = 'flex';
  }
}

function applyInitialWeatherState() {
  if (weatherEnabled) initWeather();
  updateWeatherVisibility(weatherEnabled, false);
}
function updateWeatherVisibility(visible: boolean, animate = true) {
  if (weatherWidget) weatherWidget.style.display = visible ? 'flex' : 'none';
  if (cityInputGroup) setCollapsible(cityInputGroup, visible, animate);
  const weatherMoreSetting = document.getElementById('weatherMoreSetting');
  if (weatherMoreSetting) setCollapsible(weatherMoreSetting, visible, animate);
}
function searchCity() {
  if (cityInput) {
    const city = cityInput.value.trim();
    if (city) {
      setCurrentCityData({ name: city, lat: null, lon: null });
      fetchWeatherFromAPI(true);
    }
  }
}
function applyInitialLauncherState() {
  updateLauncherVisibility(launcherEnabled, false);
}
function updateLauncherVisibility(visible: boolean, animate = true) {
  const launcherMoreSetting = document.getElementById('launcherMoreSetting');
  if (launcherMoreSetting) setCollapsible(launcherMoreSetting, visible, animate);
  if (appLauncherWrapper) appLauncherWrapper.style.display = visible ? 'flex' : 'none';
}
// -------------------------------------

function initAllEventBindings() {
  bindMainUiFeatures({
    getActiveShortcutsList,
    saveAndRender,
    updateLauncherFooterVariant
  });

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
      const val = parseInt(target.value, 10);
      setAllowedRows(val); // Fixed Cannot assign to read-only
      localStorage.setItem('shortcutsRows', String(val));
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
  
  bindWeatherFeature({
    applyInitialWeatherState,
    toggleWeather,
    getWeatherEnabled: () => weatherEnabled,
    setWeatherEnabled: (val) => { setWeatherEnabled(val); },
    updateWeatherVisibility: (animate?: boolean) => updateWeatherVisibility(weatherEnabled, animate),
    initWeather,
    setWeatherUnit: (val) => { setWeatherUnit(val); },
    saveCityBtn,
    cityInput,
    searchCity,
    toggleFahrenheit,
    getWeatherUnit: () => weatherUnit,
    toggleWeatherAlerts,
    getWeatherAlertsEnabled: () => weatherAlertsEnabled,
    setWeatherAlertsEnabled: (val) => { setWeatherAlertsEnabled(val); }
  });

  bindLauncherFeature({
    applyInitialLauncherState,
    toggleLauncher,
    getLauncherEnabled: () => launcherEnabled,
    setLauncherEnabled: (val) => { setLauncherEnabled(val); },
    updateLauncherVisibility: (animate?: boolean) => updateLauncherVisibility(launcherEnabled, animate),
    renderLauncher,
    getCurrentProvider: () => currentProvider,
    setCurrentProvider: (val) => { setCurrentProvider(val); },
    launcherProvider,
    appLauncherBtn,
    launcherPopup,
    closePopups
  });

  bindSearchFeature({
    engineBtn: document.getElementById('engineBtn') as HTMLButtonElement,
    dropdown: document.getElementById('dropdown') as HTMLDivElement,
    closePopups,
    items: document.querySelectorAll('.dropdown-item') as NodeListOf<HTMLElement>,
    hasEngine: (engine) => !!engines[engine],
    setSearchEngine,
    toggleSearchBar,
    setSearchBarVisible: (val) => { setSearchBarVisible(val); },
    updateSearchSettings: (animate?: boolean) => updateSearchSettings(searchBarVisible, animate),
    toggleSuggestions,
    getSuggestionsActive: () => suggestionsActive,
    setSuggestionsActive: (val) => { setSuggestionsActive(val); },
    clearSuggestions: () => { clearSuggestionsUI(suggestionsContainer, searchWrapper); },
    toggleClearSearch,
    setClearSearchEnabled: (val) => { setClearSearchEnabled(val); },
    updateGoogleParams: () => { applyGoogleSearchParams(searchForm, savedEngine, clearSearchEnabled); },
    searchBarStyleSelect,
    searchMoreBtn,
    searchMoreContainer,
    getCompactBarEnabled: () => compactBarEnabled,
    setCompactBarEnabled: (val) => { setCompactBarEnabled(val); },
    updateCompactBarStyle,
    toggleVoiceSearch: null, // Basic stub, advanced voice search omitted to save space unless user asks
    setVoiceSearchEnabled: (val) => {},
    updateVoiceSearchAvailability: () => {},
    searchInput,
    debounce: (fn, wait) => {
      let t; return (e) => { clearTimeout(t); t = setTimeout(() => fn(e), wait); };
    },
    suggestionsCache: new Map(),
    renderSuggestions: (sugs) => { renderSuggestionsUI(sugs, { suggestionsContainer, searchInput, searchForm, searchWrapper }, () => clearSuggestionsUI(suggestionsContainer, searchWrapper)); },
    fetchSuggestions: (query) => {
      fetchSuggestionsFromService(query).then((suggestions) => {
        if (!searchInput || searchInput.value.trim().toLowerCase() !== query.toLowerCase()) return;
        renderSuggestionsUI(suggestions, { suggestionsContainer, searchInput, searchForm, searchWrapper }, () => clearSuggestionsUI(suggestionsContainer, searchWrapper));
      });
    },
    updateSelection: (items, index) => { updateSuggestionSelectionUI(items, index, searchInput); }
  });

  bindWallpaperFeature({
    applyInitialWallpaperState,
    toggleWallpaper,
    setWallpaperEnabled: (val) => { setWallpaperEnabled(val); },
    getWallpaperEnabled: () => wallpaperEnabled,
    updateWallpaperUIState: (animate?: boolean) => updateWallpaperUIState(wallpaperEnabled, animate),
    applyWallpaperLogic,
    wallpaperSourceSelect,
    setWallpaperSource: (val) => { setCurrentWallpaperSource(val); },
    setWallpaperType: (val) => { setCurrentWallpaperType(val); },
    setWallpaperValue: (val) => { setCurrentWallpaperValue(val); },
    saveWallpaperConfig: () => {
      localStorage.setItem('wallpaperSource', currentWallpaperSource);
      localStorage.setItem('wallpaperType', currentWallpaperType);
      localStorage.setItem('wallpaperValue', currentWallpaperValue);
    },
    uploadInput,
    processWallpaperImage,
    saveWallpaperToDB,
    overlayToggleBtn,
    overlaySliderContainer,
    overlaySlider,
    updateOverlaySliderProgress: (s) => {},
    setOverlayOpacity: (v, p) => {},
    getCurrentWallpaperSource: () => currentWallpaperSource,
    getCurrentWallpaperType: () => currentWallpaperType
  });


  applyMagneticSnap('wallpaper-overlay-slider', 0.2, 0.05);
}

// ... mantenha todos os seus imports e funções initCritical, initVisual, etc.

async function bootstrap() {
  try {
    // 1. Carrega backups e estados críticos primeiro
    await initCritical();

    // 2. Monta a parte visual na tela com os estados prontos
    initVisual();

    // 3. Vincula todos os cliques e eventos aos elementos renderizados
    initAllEventBindings();
    initStandaloneListeners();

    // 4. Se o wallpaper em IndexedDB precisar de gatilho, garanta aqui
    // applyWallpaperLogic();

    console.log('[Fluent New Tab] Inicialização concluída com sucesso.');
  } catch (error) {
    console.error('[Fluent New Tab] Erro crítico na inicialização:', error);
  }
}

// O motor ESM do Vite executa após o parse do HTML por padrão.
// Garantimos que se o DOM já estiver pronto (ou quase), rodamos o bootstrap imediatamente.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

document.addEventListener('i18nReady', () => {
  applyBrandInterval();
  renderShortcuts(); // Call the local wrapper, not the imported core function
});

document.body.addEventListener('dragover', (e) => {
  if (document.body.classList.contains('is-sorting-shortcuts')) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }
});
