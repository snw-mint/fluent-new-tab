import * as state from '@/core/shared/state';
import * as refs from '@/core/shared/dom-refs';
import {
  applyInitialTheme,
  applyInitialAccentColorState,
  applyTheme,
  applyAccentColor,
} from '@/core/boot/theme';
import { bootWallpaper } from '@/core/boot/wallpaper-render';
import { initDisplayWidget } from '@/core/boot/display';
import { renderShortcutsGrid } from '@/core/boot/shortcuts-render';
import { engines } from '@/core/boot/search-engines';
import { applyGoogleSearchParams } from '@/core/boot/search';
import { renderWeatherWidget } from '@/core/boot/weather-render';
import { Shortcut } from '@/core/shared/types';
import { initTabCustomization } from '@/core/ui/tab-customization';
import { initLocalization } from '@/core/ui/localization';

let brandIntervalStarted = false;

function applyBrandInterval(): void {
  if (refs.greetingWrapper) initDisplayWidget(refs.greetingWrapper);
  if (brandIntervalStarted) return;
  brandIntervalStarted = true;
  setInterval(() => {
    if (refs.greetingWrapper) initDisplayWidget(refs.greetingWrapper);
  }, 60000);
}

function getActiveShortcutsList(): Shortcut[] {
  if (state.currentFolderId) {
    const folder = state.shortcuts.find(
      (s) => s.id === state.currentFolderId && s.type === 'folder',
    );
    if (folder && folder.children) return folder.children;
  }
  return state.shortcuts;
}

function saveAndRenderShortcuts(): void {
  localStorage.setItem('shortcuts', JSON.stringify(state.shortcuts));
  triggerShortcutsRender();
}

function triggerShortcutsRender(): void {
  renderShortcutsGrid({
    shortcutsGrid: refs.shortcutsGrid,
    rowsSelect: refs.rowsSelect,
    shortcuts: state.shortcuts,
    currentFolderId: state.currentFolderId,
    onOpenModal: (index) => {
      import('@/core/ui/shortcuts-manager').then(({ openModal }) =>
        openModal(index, getActiveShortcutsList),
      );
    },
    onDeleteShortcut: (index) => {
      const targetArray = getActiveShortcutsList();
      targetArray.splice(index, 1);
      saveAndRenderShortcuts();
    },
    onClosePopups: (except) => {
      import('@/core/ui/settings').then(({ closePopups }) =>
        closePopups(except),
      );
    },
    onOpenFolder: (id) => {
      state.setCurrentFolderId(id);
      triggerShortcutsRender();
    },
    onGoBack: () => {
      state.setCurrentFolderId(null);
      triggerShortcutsRender();
    },
    syncShortcutDropdownState: () => {
      import('@/core/ui/ui-components').then(({ syncShortcutDropdownState }) =>
        syncShortcutDropdownState(),
      );
    },
  });
}

async function fetchWeatherLogic(forceUpdate = false): Promise<void> {
  if (!state.currentCityData) return;

  const { fetchWeatherData, fetchCityData } =
    await import('@/core/lazy/providers/weather-api');
  let city = state.currentCityData;

  if (forceUpdate && city.name && (!city.lat || !city.lon)) {
    const found = await fetchCityData(city.name);
    if (found) {
      city = found;
      state.setCurrentCityData(city);
      localStorage.setItem(state.CITY_KEY, JSON.stringify(city));
    }
  }

  if (!city.lat || !city.lon) return;

  const data = await fetchWeatherData(city);
  if (data) {
    if (forceUpdate) {
      localStorage.setItem(
        state.CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), city: city.name, data }),
      );
    }
    renderWeatherWidget(data, state.weatherUnit, city, {
      weatherCity: refs.weatherCity,
      weatherTemp: refs.weatherTemp,
      weatherIcon: refs.weatherIcon,
      weatherWidget: refs.weatherWidget,
    });
  }
}

async function initWeatherLogic(): Promise<void> {
  const cachedString = localStorage.getItem(state.CACHE_KEY);
  if (cachedString) {
    try {
      const cached = JSON.parse(cachedString);
      if (
        Date.now() - cached.timestamp < state.CACHE_DURATION &&
        cached.city === state.currentCityData.name
      ) {
        renderWeatherWidget(
          cached.data,
          state.weatherUnit,
          state.currentCityData,
          {
            weatherCity: refs.weatherCity,
            weatherTemp: refs.weatherTemp,
            weatherIcon: refs.weatherIcon,
            weatherWidget: refs.weatherWidget,
          },
        );
        return;
      }
    } catch {}
  }
  await fetchWeatherLogic();
}

async function bootCritical(): Promise<void> {
  applyInitialTheme();
  applyInitialAccentColorState();

  await bootWallpaper(
    state.wallpaperEnabled,
    state.currentWallpaperSource,
    state.currentWallpaperType,
    parseFloat(state.wallpaperOverlay),
  );

  if (
    localStorage.getItem('displayEnabled') !== 'false' &&
    refs.greetingWrapper
  ) {
    refs.greetingWrapper.style.display = 'flex';
    initDisplayWidget(refs.greetingWrapper);
  } else if (refs.greetingWrapper) {
    refs.greetingWrapper.style.display = 'none';
  }

  const engine = engines[state.savedEngine];
  if (engine && refs.currentIcon && refs.searchForm) {
    refs.currentIcon.src = engine.icon;
    refs.searchForm.action = engine.url;
    applyGoogleSearchParams(
      refs.searchForm,
      state.savedEngine,
      state.clearSearchEnabled,
    );
  }

  if (refs.shortcutsGrid) {
    refs.shortcutsGrid.style.display = state.shortcutsVisible ? 'grid' : 'none';
  }

  triggerShortcutsRender();
  applyBrandInterval();
}

async function bootInteractive(): Promise<void> {
  const [
    { initCustomSelectSystem },
    { initVanillaDragAndDrop },
    { renderLauncherApps },
    {
      bindWeatherFeature,
      bindAccentColorFeature,
      bindDisplayFeature,
      bindMainUiScaleFeature,
      bindWallpaperFeature,
      initGlobalUiSystem,
      bindShortcutRadiusFeature,
      bindLauncherFeature,
      bindReduceEffectsFeature,
    },
    { initShortcutsFormSystem },
    { bindSearchFeature },
    { setCollapsible, applyMagneticSnap },
    { WallpaperEngine },
  ] = await Promise.all([
    import('@/core/ui/fluent-select'),
    import('@/core/ui/drag-drop'),
    import('@/core/ui/launcher'),
    import('@/core/ui/settings'),
    import('@/core/ui/shortcuts-manager'),
    import('@/core/ui/search-manager'),
    import('@/core/ui/ui-components'),
    import('@/core/lazy/wallpaper-engine'),
  ]);

  initCustomSelectSystem();

  if (refs.shortcutsGrid) {
    initVanillaDragAndDrop({
      gridContainer: refs.shortcutsGrid,
      onReorder: (oldIndex, newIndex) => {
        const arr = getActiveShortcutsList();
        const item = arr.splice(oldIndex, 1)[0];
        if (item) {
          arr.splice(newIndex, 0, item);
          saveAndRenderShortcuts();
        }
      },
      onMoveToFolder: (itemIndex, folderId) => {
        const arr = getActiveShortcutsList();
        const folder = state.shortcuts.find(
          (s) => s.id === folderId && s.type === 'folder',
        );
        const item = arr[itemIndex];
        if (folder && item && item.type !== 'folder') {
          folder.children = folder.children || [];
          arr.splice(itemIndex, 1);
          folder.children.push(item);
          saveAndRenderShortcuts();
        }
      },
      onMoveOutFolder: (itemIndex) => {
        if (!state.currentFolderId) return;
        const arr = getActiveShortcutsList();
        const item = arr.splice(itemIndex, 1)[0];
        if (item) {
          state.shortcuts.push(item);
          saveAndRenderShortcuts();
        }
      },
    });
  }

  if (refs.launcherGrid) {
    initVanillaDragAndDrop({
      gridContainer: refs.launcherGrid,
      itemClass: 'launcher-item',
      onReorder: (oldIndex, newIndex) => {
        if (!refs.launcherGrid) return;
        const items = Array.from(refs.launcherGrid.children).filter((el) =>
          el.classList.contains('launcher-item') &&
          !el.classList.contains('sortable-placeholder') &&
          !el.classList.contains('fluent-drag-ghost')
        ) as HTMLElement[];
        
        const dragged = items[oldIndex];
        const target = items[newIndex];
        
        if (dragged && target) {
          if (oldIndex < newIndex) {
            target.after(dragged);
          } else {
            target.before(dragged);
          }
        }

        const newItems = Array.from(refs.launcherGrid.children).filter((el) =>
          el.classList.contains('launcher-item') &&
          !el.classList.contains('sortable-placeholder') &&
          !el.classList.contains('fluent-drag-ghost')
        ) as HTMLElement[];
        const newOrder = newItems.map((item) => item.getAttribute('data-id')).filter(Boolean) as string[];
        localStorage.setItem('launcherOrder', JSON.stringify(newOrder));
        newItems.forEach((item, idx) => item.setAttribute('data-index', idx.toString()));
      },
    });
  }

  if (refs.versionDisplay) {
    try {
      const chromeApi = (window as any).chrome;
      refs.versionDisplay.textContent = `v${chromeApi.runtime.getManifest().version}`;
    } catch {
      refs.versionDisplay.textContent = 'v1.0';
    }
  }

  applyMagneticSnap('displayScaleSlider', 100, 5);
  applyMagneticSnap('shortcutRadiusSlider', 0, 5);
  applyMagneticSnap('mainUiScaleSlider', 1, 0.05);

  const updateWeatherVisibility = (visible: boolean, animate = true) => {
    if (refs.weatherWidget)
      refs.weatherWidget.style.display = visible ? 'flex' : 'none';
    if (refs.cityInputGroup)
      setCollapsible(refs.cityInputGroup, visible, animate);
    const wms = document.getElementById('weatherMoreSetting');
    if (wms) setCollapsible(wms, visible, animate);
  };

  const updateLauncherVisibility = (visible: boolean, animate = true) => {
    const lms = document.getElementById('launcherMoreSetting');
    if (lms) setCollapsible(lms, visible, animate);
    if (refs.launcherSelectGroup)
      setCollapsible(refs.launcherSelectGroup, visible, animate);
    if (refs.appLauncherWrapper)
      refs.appLauncherWrapper.style.display = visible ? 'flex' : 'none';
  };

  bindWeatherFeature({
    applyInitialWeatherState: () => {
      if (state.weatherEnabled) initWeatherLogic();
      updateWeatherVisibility(state.weatherEnabled, false);
    },
    getWeatherEnabled: () => state.weatherEnabled,
    setWeatherEnabled: state.setWeatherEnabled,
    updateWeatherVisibility,
    initWeather: initWeatherLogic,
    setWeatherUnit: state.setWeatherUnit,
    searchCity: () => {
      if (refs.cityInput && refs.cityInput.value.trim()) {
        state.setCurrentCityData({
          name: refs.cityInput.value.trim(),
          lat: 0,
          lon: 0,
        });
        fetchWeatherLogic(true);
      }
    },
    getWeatherUnit: () => state.weatherUnit,
    getWeatherAlertsEnabled: () => state.weatherAlertsEnabled,
    setWeatherAlertsEnabled: state.setWeatherAlertsEnabled,
  });

  bindLauncherFeature({
    applyInitialLauncherState: () =>
      updateLauncherVisibility(state.launcherEnabled, false),
    getLauncherEnabled: () => state.launcherEnabled,
    setLauncherEnabled: state.setLauncherEnabled,
    updateLauncherVisibility,
    renderLauncher: (provider: string) => {
      import('@/core/ui/launcher-data').then((m) => {
        const data = m.launcherData[provider];
        renderLauncherApps(data, {
          launcherGrid: refs.launcherGrid,
          launcherAllAppsLink: refs.launcherAllAppsLink,
        });
      });
    },
    getCurrentProvider: () => state.currentProvider as any,
    setCurrentProvider: state.setCurrentProvider as any,
  });

  updateLauncherVisibility(state.launcherEnabled, false);
  bindReduceEffectsFeature();

  bindAccentColorFeature({
    applyInitialAccentState: () => {
      const isEnabled = localStorage.getItem('accentColorEnabled') !== 'false';
      if (refs.accentColorOptions) {
        refs.accentColorOptions.style.display = isEnabled ? '' : 'none';
      }
    },
    applyAccentColor: applyAccentColor,
    applyWallpaperLogic: async () => {
      const { extractAndApplyAutoColor } =
        await import('@/core/lazy/color-extractor');
      const bg = document.body.style.backgroundImage;
      if (bg && bg !== 'none') {
        const urlMatch = bg.match(/url\(['"]?(.*?)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
          await extractAndApplyAutoColor(urlMatch[1], urlMatch[1]);
        }
      }
    },
    resetAppearanceFeatures: () => {
      localStorage.removeItem('tabName');
      localStorage.removeItem('tabIcon');
      document.title = 'Fluent New Tab';

      const link = document.querySelector(
        "link[rel~='icon']",
      ) as HTMLLinkElement;
      if (link) link.href = 'assets/icon-32.png';
      if (refs.tabNameInput) refs.tabNameInput.value = '';
      if (refs.tabFaviconInput) refs.tabFaviconInput.value = '';

      state.setMainUiScale(1);
      localStorage.setItem('mainUiScale', '1');
      document.documentElement.style.setProperty('--main-ui-scale', '1');
      if (refs.mainUiScaleSlider) {
        refs.mainUiScaleSlider.value = '1';
        refs.mainUiScaleSlider.style.setProperty('--slider-progress', '0.5');
      }
    },
  });

  const searchUiConfig = {
    hasEngine: (engine: string) => !!engines[engine],
    setSearchEngine: (engineKey: string) => {
      const config = engines[engineKey];
      if (config) {
        if (refs.currentIcon) {
          refs.currentIcon.src = config.icon;
          refs.currentIcon.style.display = 'block';
        }
        if (refs.searchForm) refs.searchForm.action = config.url;
        applyGoogleSearchParams(
          refs.searchForm,
          engineKey,
          state.clearSearchEnabled,
        );
      }
    },
    setSearchBarVisible: state.setSearchBarVisible,
    updateSearchSettings: (animate = true) => {
      if (refs.searchWrapper)
        refs.searchWrapper.style.display = state.searchBarVisible ? '' : 'none';
      const smo = document.getElementById('searchMainOptions');
      if (smo) setCollapsible(smo, state.searchBarVisible, animate);
    },
    getSuggestionsActive: () => state.suggestionsActive,
    setSuggestionsActive: state.setSuggestionsActive,
    clearSuggestions: () => {
      import('@/core/lazy/search-features').then((m) =>
        m.clearSuggestionsUI(refs.suggestionsContainer, refs.searchWrapper),
      );
    },
    setClearSearchEnabled: state.setClearSearchEnabled,
    updateGoogleParams: () =>
      applyGoogleSearchParams(
        refs.searchForm,
        state.savedEngine,
        state.clearSearchEnabled,
      ),
    getCompactBarEnabled: () => state.compactBarEnabled,
    setCompactBarEnabled: state.setCompactBarEnabled,
    updateCompactBarStyle: () => {
      if (refs.searchWrapper) {
        if (state.compactBarEnabled)
          refs.searchWrapper.classList.add('compact');
        else refs.searchWrapper.classList.remove('compact');
      }
    },
    setVoiceSearchEnabled: state.setVoiceSearchEnabled,
    updateVoiceSearchAvailability: () => {
      if (refs.voiceSearchBtn) {
        const hasSpeechSupport =
          'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        refs.voiceSearchBtn.style.display =
          state.voiceSearchEnabled && hasSpeechSupport ? 'flex' : 'none';
      }
    },
    debounce: (fn: (...args: any[]) => void, wait: number) => {
      let t: any;
      return (e: any) => {
        clearTimeout(t);
        t = setTimeout(() => fn(e), wait);
      };
    },
    fetchSuggestions: (query: string) => {
      import('@/core/lazy/search-features').then((m) => {
        m.fetchSuggestionsFromService(query).then((suggestions) => {
          if (
            !refs.searchInput ||
            refs.searchInput.value.trim().toLowerCase() !== query.toLowerCase()
          )
            return;
          m.renderSuggestionsUI(
            suggestions,
            {
              suggestionsContainer: refs.suggestionsContainer,
              searchInput: refs.searchInput,
              searchForm: refs.searchForm,
              searchWrapper: refs.searchWrapper,
            },
            () =>
              m.clearSuggestionsUI(
                refs.suggestionsContainer,
                refs.searchWrapper,
              ),
          );
        });
      });
    },
    renderSuggestions: (sugs: any[]) => {
      import('@/core/lazy/search-features').then((m) =>
        m.renderSuggestionsUI(
          sugs,
          {
            suggestionsContainer: refs.suggestionsContainer,
            searchInput: refs.searchInput,
            searchForm: refs.searchForm,
            searchWrapper: refs.searchWrapper,
          },
          () =>
            m.clearSuggestionsUI(refs.suggestionsContainer, refs.searchWrapper),
        ),
      );
    },
    updateSelection: (items: any[], index: number) => {
      import('@/core/lazy/search-features').then((m) =>
        m.updateSuggestionSelectionUI(items, index, refs.searchInput),
      );
    },
  };

  bindSearchFeature(searchUiConfig);
  initTabCustomization();
  initLocalization();
  searchUiConfig.updateSearchSettings(false);
  searchUiConfig.updateCompactBarStyle();
  searchUiConfig.updateVoiceSearchAvailability();

  bindDisplayFeature({
    getDisplayScale: () => state.displayScale,
    setDisplayScale: state.setDisplayScale,
    setDisplayVisible: (visible: boolean) => {
      localStorage.setItem('displayEnabled', String(visible));
      if (refs.greetingWrapper) {
        refs.greetingWrapper.style.display = visible ? 'flex' : 'none';
        if (visible) {
          initDisplayWidget(refs.greetingWrapper);
        }
      }
    },
    getDisplayEnabled: () => localStorage.getItem('displayEnabled') !== 'false',
    initDisplayWidget,
  });

  bindShortcutRadiusFeature({
    getShortcutRadius: () => state.shortcutRadius,
    setShortcutRadius: state.setShortcutRadius,
    getHideShortcutNames: () => state.hideShortcutNames,
    setHideShortcutNames: state.setHideShortcutNames,
  });

  bindMainUiScaleFeature({
    getMainUiScale: () => state.mainUiScale,
    setMainUiScale: state.setMainUiScale,
  });

  bindWallpaperFeature(
    {
      getWallpaperEnabled: () => state.wallpaperEnabled,
      setWallpaperEnabled: state.setWallpaperEnabled,
      updateWallpaperUIState: (visible: boolean, animate = true) => {
        if (refs.wallpaperSourceContainer)
          setCollapsible(refs.wallpaperSourceContainer, visible, animate);
        if (refs.wallpaperOverlaySetting)
          setCollapsible(refs.wallpaperOverlaySetting, visible, animate);
        const uploadContainer = document.getElementById(
          'uploadWallpaperContainer',
        );
        if (uploadContainer) {
          uploadContainer.style.display =
            visible && state.currentWallpaperType === 'upload'
              ? 'flex'
              : 'none';
        }
      },
      setWallpaperSource: state.setCurrentWallpaperSource,
      setWallpaperType: state.setCurrentWallpaperType,
      saveWallpaperConfig: () => {
        localStorage.setItem('wallpaperSource', state.currentWallpaperSource);
        localStorage.setItem('wallpaperType', state.currentWallpaperType);
      },
      getCurrentWallpaperType: () => state.currentWallpaperType,
    },
    WallpaperEngine,
  );

  initShortcutsFormSystem(
    getActiveShortcutsList,
    saveAndRenderShortcuts,
    () => {
      if (refs.launcherPopup)
        refs.launcherPopup.classList.toggle(
          'folders-enabled',
          state.foldersEnabled,
        );
    },
  );

  initGlobalUiSystem(saveAndRenderShortcuts, () => {
    if (refs.launcherPopup)
      refs.launcherPopup.classList.toggle(
        'folders-enabled',
        state.foldersEnabled,
      );
  });

  import('@/core/lazy/backup').then((m) => m.initBackupSystem());

  if (refs.themeBtns) {
    refs.themeBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.theme === state.savedTheme);
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme as any;
        if (!theme) return;
        applyTheme(theme);
        localStorage.setItem('theme', theme);
        refs.themeBtns.forEach((b) => {
          b.classList.toggle('active', b.dataset.theme === theme);
        });
      });
    });
  }

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.menu-wrapper')) {
      document.querySelectorAll('.shortcut-dropdown.active').forEach((menu) => {
        menu.classList.remove('active');
      });
      import('@/core/ui/ui-components').then(
        ({ syncShortcutDropdownState }) => {
          syncShortcutDropdownState();
        },
      );
    }
  });
}

async function bootstrap(): Promise<void> {
  try {
    await bootCritical();
    setTimeout(bootInteractive, 0);
  } catch (error) {
    console.error(
      '[Fluent New Tab] Critical error during initialization:',
      error,
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

document.addEventListener('i18nReady', () => {
  applyBrandInterval();
  triggerShortcutsRender();
});

document.body.addEventListener('dragover', (e) => {
  if (document.body.classList.contains('is-sorting-shortcuts')) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }
});
