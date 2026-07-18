/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import * as state from '@/core/shared/state';
import * as refs from '@/core/shared/dom-refs';
import {
  applyInitialTheme,
  applyInitialAccentColorState,
  applyTheme,
  applyAccentColor,
  updateTabFavicon,
} from '@/core/boot/theme';
import { bootWallpaper, isWallpaperCacheValid } from '@/core/boot/wallpaper-render';
import { initDisplayWidget } from '@/core/boot/display';
import { renderShortcutsGrid } from '@/core/boot/shortcuts-render';
import { engines } from '@/core/boot/search-engines';
import { applyGoogleSearchParams } from '@/core/boot/search';
import { renderWeatherWidget } from '@/core/boot/weather-render';
import { Shortcut } from '@/core/shared/types';
import { initTabCustomization } from '@/core/ui/tab-customization';
import { initLocalization } from '@/core/ui/localization';
import { initBasicSearchUI } from '@/core/boot/search';

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

let shortcutsFormSystemInitialized = false;
function initShortcutsFormSystemLazy(): Promise<void> {
  if (shortcutsFormSystemInitialized) return Promise.resolve();
  shortcutsFormSystemInitialized = true;
  return import('@/core/ui/shortcuts-manager').then((m) => {
    m.initShortcutsFormSystem(
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
  });
}

function saveAndRenderShortcuts(): void {
  localStorage.setItem('shortcuts', JSON.stringify(state.shortcuts));
  triggerShortcutsRender();
}

function triggerShortcutsRender(): void {
  renderShortcutsGrid({
    shortcutsGrid: refs.shortcutsGrid,
    folderBackWrapper: refs.folderBackWrapper,
    rowsSelect: refs.rowsSelect,
    shortcuts: state.shortcuts,
    currentFolderId: state.currentFolderId,
    onOpenModal: (index) => {
      initShortcutsFormSystemLazy().then(() => {
        import('@/core/ui/shortcuts-manager').then(({ openModal }) =>
          openModal(index, getActiveShortcutsList),
        );
      });
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

  const { fetchWeatherData, fetchCityData, renderWeatherAlertWidget } =
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
    renderWeatherAlertWidget();
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
        import('@/core/lazy/providers/weather-api').then((m) =>
          m.renderWeatherAlertWidget(),
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

  const folderBackBtn = document.getElementById('folderBackBtn');
  if (folderBackBtn) {
    folderBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.setCurrentFolderId(null);
      triggerShortcutsRender();
    });
  }

  initBasicSearchUI(
    refs.searchWrapper,
    refs.voiceSearchBtn,
    refs.askAiBtn,
    refs.visualSearchBtn,
    state.searchBarVisible,
    state.compactBarEnabled,
    state.voiceSearchEnabled,
    state.askAiEnabled,
    state.visualSearchEnabled,
  );

  triggerShortcutsRender();
  applyBrandInterval();
}

async function bootInteractive(): Promise<void> {
  try {
    const chromeApi = (window as any).chrome;
    if (chromeApi && chromeApi.storage && chromeApi.storage.local) {
      chromeApi.storage.local.get(
        ['update_notice_pending', 'update_notice_version'],
        (data: any) => {
          if (data.update_notice_pending) {
            Promise.all([
              import('@/core/ui/ui-components'),
              import('@/core/shared/dom-utils'),
            ]).then(([{ showToast }, { getLocalizedWarningText }]) => {
              const version = data.update_notice_version || '';
              const prefix = getLocalizedWarningText(
                'updateNoticePrefix',
                `Fluent New Tab has been updated to version $VERSION$, `,
                { VERSION: version },
              );
              const suffix = getLocalizedWarningText(
                'updateNoticeChangelog',
                'see changelog',
              );
              const link = document.createElement('a');
              link.href = 'https://github.com/snw-mint/fluent-new-tab/releases';
              link.target = '_blank';
              link.className = 'update-release-notice-link';
              link.textContent = suffix;
              showToast([prefix, link], 'assets/icons/update.svg', 6000);
            });
            chromeApi.storage.local.remove([
              'update_notice_pending',
              'update_notice_version',
            ]);
          }
        },
      );
    }
  } catch (e) {
    console.error('Error checking for updates:', e);
  }

  const [
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
      bindSurfaceTintFeature,
    },
  ] = await Promise.all([import('@/core/ui/settings')]);

  if (refs.shortcutsGrid) {
    const initShortcutsDragLazy = () => {
      import('@/core/ui/drag-drop').then(({ initVanillaDragAndDrop }) => {
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
            const limit = Math.min(state.allowedRows * 10, 40);
            if (state.shortcuts.length >= limit) {
              import('@/core/ui/shortcuts-manager').then(
                ({ showGridLimitWarning }) => {
                  showGridLimitWarning(limit, false);
                },
              );
              return false;
            }
            const arr = getActiveShortcutsList();
            const item = arr.splice(itemIndex, 1)[0];
            if (item) {
              state.shortcuts.push(item);
              saveAndRenderShortcuts();
            }
          },
        });
      });
    };
    refs.shortcutsGrid.addEventListener('pointerover', initShortcutsDragLazy, {
      once: true,
    });
  }

  if (refs.launcherGrid) {
    const initLauncherDragLazy = () => {
      import('@/core/ui/drag-drop').then(({ initVanillaDragAndDrop }) => {
        initVanillaDragAndDrop({
          gridContainer: refs.launcherGrid,
          itemClass: 'launcher-item',
          onReorder: (oldIndex, newIndex) => {
            if (!refs.launcherGrid) return;
            const newItems = Array.from(refs.launcherGrid.children).filter(
              (el) =>
                el.classList.contains('launcher-item') &&
                !el.classList.contains('sortable-placeholder') &&
                !el.classList.contains('fluent-drag-ghost'),
            ) as HTMLElement[];
            const newOrder = newItems
              .map((item) => item.getAttribute('data-id'))
              .filter(Boolean) as string[];
            localStorage.setItem('launcherOrder', JSON.stringify(newOrder));
            newItems.forEach((item, idx) =>
              item.setAttribute('data-index', idx.toString()),
            );
          },
        });
      });
    };
    refs.launcherGrid.addEventListener('pointerover', initLauncherDragLazy, {
      once: true,
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

  import('@/core/ui/ui-components').then(({ applyMagneticSnap }) => {
    applyMagneticSnap('displayScaleSlider', 100, 5);
    applyMagneticSnap('shortcutRadiusSlider', 0, 5);
    applyMagneticSnap('mainUiScaleSlider', 1, 0.05);
  });

  const updateWeatherVisibility = (visible: boolean, animate = true) => {
    if (refs.weatherWidget)
      refs.weatherWidget.style.display = visible ? 'flex' : 'none';
    import('@/core/ui/ui-components').then(({ setCollapsible }) => {
      if (refs.cityInputGroup)
        setCollapsible(refs.cityInputGroup, visible, animate);
      const wms = document.getElementById('weatherMoreSetting');
      if (wms) setCollapsible(wms, visible, animate);
    });
  };

  const updateLauncherVisibility = (visible: boolean, animate = true) => {
    import('@/core/ui/ui-components').then(({ setCollapsible }) => {
      const lms = document.getElementById('launcherMoreSetting');
      if (lms) setCollapsible(lms, visible, animate);
      if (refs.launcherSelectGroup)
        setCollapsible(refs.launcherSelectGroup, visible, animate);
    });
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
    fetchCityOptions: async (query: string) => {
      const { fetchCityOptions } =
        await import('@/core/lazy/providers/weather-api');
      return fetchCityOptions(query);
    },
    selectCity: (cityData: any) => {
      state.setCurrentCityData(cityData);
      localStorage.setItem(state.CITY_KEY, JSON.stringify(cityData));
      fetchWeatherLogic(true);
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
      Promise.all([
        import('@/core/ui/launcher-data'),
        import('@/core/ui/launcher'),
      ]).then(([mData, mLauncher]) => {
        const data = mData.launcherData[provider];
        mLauncher.renderLauncherApps(data, {
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
  bindSurfaceTintFeature();

  bindAccentColorFeature({
    applyInitialAccentState: () => {
      if (refs.accentColorOptions) {
        refs.accentColorOptions.style.display = '';
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
      localStorage.removeItem('tabFavicon');
      localStorage.removeItem('tabIcon');
      document.title =
        (window as any).getTranslation?.('newTabTitle') || 'New Tab';

      updateTabFavicon();
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
      import('@/core/ui/ui-components').then(({ setCollapsible }) => {
        const smo = document.getElementById('searchMainOptions');
        if (smo) setCollapsible(smo, state.searchBarVisible, animate);
      });
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

  let searchManagerLoaded = false;
  const initSearchManagerLazy = () => {
    if (searchManagerLoaded) return;
    searchManagerLoaded = true;
    import('@/core/ui/search-manager').then(({ bindSearchFeature }) => {
      bindSearchFeature(searchUiConfig);
      import('@/core/ui/ui-components').then(({ setCollapsible }) => {
        const smo = document.getElementById('searchMainOptions');
        if (smo) setCollapsible(smo, state.searchBarVisible, false);
      });
    });
  };

  refs.searchInput?.addEventListener('focus', initSearchManagerLazy, {
    once: true,
  });
  refs.configBtn?.addEventListener('click', initSearchManagerLazy, {
    once: true,
  });
  refs.engineBtn?.addEventListener('pointerover', initSearchManagerLazy, {
    once: true,
  });
  refs.engineBtn?.addEventListener('click', initSearchManagerLazy, {
    once: true,
  });
  refs.voiceSearchBtn?.addEventListener('click', initSearchManagerLazy, {
    once: true,
  });

  const searchEngineTip = document.getElementById('searchEngineTip');
  if (searchEngineTip && !localStorage.getItem('hasSeenSearchEngineTip')) {
    setTimeout(() => searchEngineTip.classList.remove('is-hidden'), 1500);
    
    const dismissTip = () => {
      searchEngineTip.classList.add('is-hidden');
      localStorage.setItem('hasSeenSearchEngineTip', 'true');
    };
    
    setTimeout(dismissTip, 11500);
    
    refs.engineBtn?.addEventListener('click', dismissTip, { once: true });
  }
  refs.askAiBtn?.addEventListener('pointerover', initSearchManagerLazy, {
    once: true,
  });
  refs.askAiBtn?.addEventListener('click', initSearchManagerLazy, {
    once: true,
  });
  refs.visualSearchBtn?.addEventListener('pointerover', initSearchManagerLazy, {
    once: true,
  });
  // For the first click on visual search, load the manager AND open the interface
  // directly — this prevents the first click being "lost" while the manager loads async.
  refs.visualSearchBtn?.addEventListener(
    'click',
    (e) => {
      const wasAlreadyLoaded = searchManagerLoaded;
      initSearchManagerLazy();
      if (!wasAlreadyLoaded) {
        // Manager was just triggered for the first time; open the interface directly
        // so this click isn't lost while the manager loads async.
        e.preventDefault();
        e.stopPropagation();
        import('@/core/lazy/visual-search')
          .then((m) => m.openVisualSearchInterface())
          .catch((err) => console.error('Visual Search load error:', err));
      }
    },
    { once: true },
  );

  initTabCustomization();
  initLocalization();

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
    triggerRender: triggerShortcutsRender,
    setAllowedRows: state.setAllowedRows,
  });

  bindMainUiScaleFeature({
    getMainUiScale: () => state.mainUiScale,
    setMainUiScale: state.setMainUiScale,
  });

  const initWallpaperEngine = () => {
    bindWallpaperFeature(
      {
        getWallpaperEnabled: () => state.wallpaperEnabled,
        setWallpaperEnabled: state.setWallpaperEnabled,
        updateWallpaperUIState: (visible: boolean, animate = true) => {
          import('@/core/ui/ui-components').then(({ setCollapsible }) => {
            if (refs.wallpaperSourceContainer)
              setCollapsible(refs.wallpaperSourceContainer, visible, animate);
            if (refs.wallpaperOverlaySetting)
              setCollapsible(refs.wallpaperOverlaySetting, visible, animate);
          });
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
      async () => {
        const { WallpaperEngine } =
          await import('@/core/lazy/wallpaper-engine');
        return WallpaperEngine;
      },
    );
  };

  if (state.wallpaperEnabled || refs.toggleWallpaper) {
    initWallpaperEngine();
  }

  if (state.wallpaperEnabled && state.currentWallpaperSource === 'api') {
    if (!isWallpaperCacheValid(state.currentWallpaperType)) {
      import('@/core/lazy/wallpaper-engine').then(({ WallpaperEngine }) => {
        WallpaperEngine.render({
          enabled: state.wallpaperEnabled,
          source: state.currentWallpaperSource,
          type: state.currentWallpaperType,
          overlay: parseFloat(state.wallpaperOverlay),
        });
      });
    }
  }

  initGlobalUiSystem(saveAndRenderShortcuts, () => {
    if (refs.launcherPopup)
      refs.launcherPopup.classList.toggle(
        'folders-enabled',
        state.foldersEnabled,
      );
  });

  if (refs.themeBtns) {
    function playThemeAnimation(element: HTMLElement): void {
      element.classList.remove('animate');
      void element.offsetWidth; // force reflow to restart animation
      element.classList.add('animate');
      element.addEventListener(
        'animationend',
        () => {
          element.classList.remove('animate');
        },
        { once: true },
      );
    }

    refs.themeBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.theme === state.savedTheme);
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme as any;
        if (!theme) return;
        playThemeAnimation(btn);
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
  import('@/core/lazy/providers/weather-api').then((m) =>
    m.renderWeatherAlertWidget(),
  );
});

document.body.addEventListener('dragover', (e) => {
  if (document.body.classList.contains('is-sorting-shortcuts')) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }
});
