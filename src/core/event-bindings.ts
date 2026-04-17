/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file contains functions to bind event listeners for various UI components and features,
 * managing user interactions and updating application state accordingly.
 */

interface WeatherBindingOptions {
  applyInitialWeatherState: () => void;
  toggleWeather: HTMLInputElement | null;
  getWeatherEnabled: () => boolean;
  setWeatherEnabled: (enabled: boolean) => void;
  updateWeatherVisibility: (animate?: boolean) => void;
  initWeather: () => void;
  unitBtns: NodeListOf<HTMLButtonElement>;
  setWeatherUnit: (unit: WeatherUnit) => void;
  updateUnitButtons: () => void;
  saveCityBtn: HTMLButtonElement | null;
  cityInput: HTMLInputElement | null;
  searchCity: () => void;
}

interface LauncherBindingOptions {
  applyInitialLauncherState: () => void;
  toggleLauncher: HTMLInputElement | null;
  getLauncherEnabled: () => boolean;
  setLauncherEnabled: (enabled: boolean) => void;
  updateLauncherVisibility: (animate?: boolean) => void;
  renderLauncher: (provider: keyof typeof launcherData) => void;
  getCurrentProvider: () => keyof typeof launcherData;
  setCurrentProvider: (provider: keyof typeof launcherData) => void;
  launcherProvider: HTMLSelectElement | null;
  appLauncherBtn: HTMLButtonElement | null;
  launcherPopup: HTMLDivElement | null;
  closePopups: (except?: Element | null) => void;
}

interface SearchBindingOptions {
  applyInitialSearchEngine: () => void;
  engineBtn: HTMLButtonElement | null;
  dropdown: HTMLDivElement | null;
  closePopups: (except?: Element | null) => void;
  items: NodeListOf<HTMLElement>;
  hasEngine: (engine: string) => boolean;
  setSearchEngine: (engine: keyof typeof engines) => void;
  applyInitialSearchBarVisibility: () => void;
  toggleSearchBar: HTMLInputElement | null;
  setSearchBarVisible: (visible: boolean) => void;
  updateSearchSettings: (animate?: boolean) => void;
  applyInitialSuggestionsActive: () => void;
  toggleSuggestions: HTMLInputElement | null;
  getSuggestionsActive: () => boolean;
  setSuggestionsActive: (enabled: boolean) => void;
  clearSuggestions: () => void;
  applyInitialClearSearch: () => void;
  toggleClearSearch: HTMLInputElement | null;
  setClearSearchEnabled: (enabled: boolean) => void;
  updateGoogleParams: () => void;
  toggleCompact: HTMLInputElement | null;
  getCompactBarEnabled: () => boolean;
  setCompactBarEnabled: (enabled: boolean) => void;
  updateCompactBarStyle: () => void;
  applyInitialVoiceSearch: () => void;
  toggleVoiceSearch: HTMLInputElement | null;
  setVoiceSearchEnabled: (enabled: boolean) => void;
  updateVoiceSearchAvailability: () => void;
  searchInput: HTMLInputElement | null;
  debounce: (
    fn: (event: Event) => void,
    wait: number,
  ) => (event: Event) => void;
  suggestionsCache: Map<string, string[]>;
  renderSuggestions: (suggestions: string[]) => void;
  fetchSuggestions: (query: string) => void;
  updateSelection: (items: HTMLElement[], index: number) => void;
}

interface WallpaperBindingOptions {
  applyInitialWallpaperState: () => void;
  toggleWallpaper: HTMLInputElement | null;
  setWallpaperEnabled: (enabled: boolean) => void;
  getWallpaperEnabled: () => boolean;
  updateWallpaperUIState: (enabled: boolean, animate?: boolean) => void;
  applyWallpaperLogic: () => Promise<void> | void;
  wallpaperOptions: NodeListOf<HTMLElement>;
  wallpaperSourceSelect: HTMLSelectElement | null;
  setWallpaperSource: (source: WallpaperSource) => void;
  setWallpaperType: (type: WallpaperType) => void;
  setWallpaperValue: (value: string) => void;
  saveWallpaperConfig: () => void;
  highlightSelectedWallpaper: (value: string) => void;
  uploadOption: HTMLElement | null;
  uploadInput: HTMLInputElement | null;
  processWallpaperImage: (file: File) => Promise<Blob>;
  saveWallpaperToDB: (blob: Blob) => Promise<boolean>;
  clearPresetSelection: () => void;
  overlayToggleBtn: HTMLElement | null;
  overlaySliderContainer: HTMLDivElement | null;
  overlaySlider: HTMLInputElement | null;
  updateOverlaySliderProgress: (slider: HTMLInputElement) => void;
  setOverlayOpacity: (value: string, persist?: boolean) => void;
  getCurrentWallpaperSource: () => string;
  getCurrentWallpaperType: () => string;
}

function bindWeatherFeature(options: WeatherBindingOptions): void {
  options.applyInitialWeatherState();

  if (options.toggleWeather) {
    options.toggleWeather.checked = options.getWeatherEnabled();
    options.toggleWeather.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      const wantsEnable = target.checked;

      if (wantsEnable) {
        options.setWeatherEnabled(true);
        options.updateWeatherVisibility(true);

        const apiName =
          window.getTranslation?.('apiNameWeather') || 'Open-Meteo API';
        requestFeaturePermissionUI(
          'weather',
          apiName,
          'https://open-meteo.com/',
          () => {
            localStorage.setItem('weatherEnabled', 'true');

            setTimeout(() => {
              options.initWeather();
            }, 250);
          },
          () => {
            target.checked = false;
            options.setWeatherEnabled(false);
            options.updateWeatherVisibility(true);
          },
        );
      } else {
        options.setWeatherEnabled(false);
        localStorage.setItem('weatherEnabled', 'false');
        options.updateWeatherVisibility(true);
      }
    });
  }

  options.unitBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const unit = btn.dataset.unit as WeatherUnit | undefined;
      if (unit) {
        options.setWeatherUnit(unit);
        localStorage.setItem('weatherUnit', unit);
        options.updateUnitButtons();
        options.initWeather();
      }
    });
  });

  if (options.saveCityBtn) {
    options.saveCityBtn.addEventListener('click', options.searchCity);
  }

  if (options.cityInput) {
    options.cityInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        options.searchCity();
      }
    });
  }
}

interface AccentColorBindingOptions {
  applyInitialAccentState: () => void;
  toggleAccentColor: HTMLInputElement | null;
  accentColorOptions: HTMLDivElement | null;
  setCollapsibleFn: (
    element: HTMLElement | null,
    shouldExpand: boolean,
    animate?: boolean,
  ) => void;
  accentPresetsRow: HTMLDivElement | null;
  accentCustomColor: HTMLInputElement | null;
  applyAccentColor: (color: string) => void;
  applyWallpaperLogic: () => Promise<void> | void;
}

function bindAccentColorFeature(options: AccentColorBindingOptions): void {
  options.applyInitialAccentState();

  const savedMode = localStorage.getItem('accentColorMode') || 'auto';
  const savedColor = localStorage.getItem('accentColorValue') || '#0078D4';

  if (options.accentPresetsRow) {
    const presetBtns =
      options.accentPresetsRow.querySelectorAll('.color-preset-btn');
    presetBtns.forEach((b) => b.classList.remove('selected'));

    if (savedMode === 'auto') {
      const autoBtn = options.accentPresetsRow.querySelector(
        '[data-color="auto"]',
      );
      if (autoBtn) autoBtn.classList.add('selected');
    } else {
      const presetBtn = options.accentPresetsRow.querySelector(
        `[data-color="${savedColor}"]`,
      );
      if (presetBtn) {
        presetBtn.classList.add('selected');
      } else if (options.accentCustomColor) {
        const customBtn = options.accentCustomColor.closest(
          '.custom-preset',
        ) as HTMLElement;
        if (customBtn) {
          customBtn.classList.add('selected');
          customBtn.style.backgroundColor = savedColor;
        }
        options.accentCustomColor.value = savedColor;
      }
    }
  }

  if (options.toggleAccentColor) {
    options.toggleAccentColor.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      const isEnabled = target.checked;
      localStorage.setItem('accentColorEnabled', String(isEnabled));
      options.setCollapsibleFn(options.accentColorOptions, isEnabled, true);

      if (!isEnabled) {
        const toggleAuto = document.getElementById(
          'toggleAccentWallpaper',
        ) as HTMLInputElement | null;
        if (toggleAuto && toggleAuto.checked) {
          toggleAuto.checked = false;
          localStorage.setItem('accentColorMode', 'manual');
          const allBtns =
            options.accentPresetsRow?.querySelectorAll('.color-preset-btn');
          allBtns?.forEach((b) => b.classList.remove('selected'));
          const currentSavedColor =
            localStorage.getItem('accentColorValue') || '#0078D4';
          const presetBtn = options.accentPresetsRow?.querySelector(
            `[data-color="${currentSavedColor}"]`,
          );
          if (presetBtn) presetBtn.classList.add('selected');
        }
        const toggleSurfaces = document.getElementById(
          'toggleAccentSurfaces',
        ) as HTMLInputElement | null;
        if (toggleSurfaces && toggleSurfaces.checked) {
          toggleSurfaces.checked = false;
          localStorage.setItem('accentColorSurfaces', 'false');
        }
      }

      const color = localStorage.getItem('accentColorValue') || '#0078D4';
      options.applyAccentColor(isEnabled ? color : '#0078D4');
    });
  }

  const toggleAuto = document.getElementById(
    'toggleAccentWallpaper',
  ) as HTMLInputElement | null;

  if (toggleAuto) {
    toggleAuto.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement;

      if (target.checked) {
        localStorage.setItem('accentColorMode', 'auto');

        const allBtns =
          options.accentPresetsRow?.querySelectorAll('.color-preset-btn');
        allBtns?.forEach((b) => b.classList.remove('selected'));
        const autoBtn = options.accentPresetsRow?.querySelector(
          '[data-color="auto"]',
        );
        if (autoBtn) autoBtn.classList.add('selected');

        await options.applyWallpaperLogic();
      } else {
        localStorage.setItem('accentColorMode', 'manual');

        const currentSavedColor =
          localStorage.getItem('accentColorValue') || '#0078D4';
        options.applyAccentColor(currentSavedColor);

        const allBtns =
          options.accentPresetsRow?.querySelectorAll('.color-preset-btn');
        allBtns?.forEach((b) => b.classList.remove('selected'));
        const presetBtn = options.accentPresetsRow?.querySelector(
          `[data-color="${currentSavedColor}"]`,
        );

        if (presetBtn) {
          presetBtn.classList.add('selected');
        } else if (options.accentCustomColor) {
          const customBtn = options.accentCustomColor.closest(
            '.custom-preset',
          ) as HTMLElement;
          if (customBtn) customBtn.classList.add('selected');
        }
      }
    });
  }

  if (options.accentPresetsRow) {
    const presetBtns =
      options.accentPresetsRow.querySelectorAll('.color-preset-btn');

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;

        presetBtns.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');

        const color = btn.getAttribute('data-color');

        if (color && color !== 'auto') {
          localStorage.setItem('accentColorValue', color);
          localStorage.setItem('accentColorMode', 'manual');
          options.applyAccentColor(color);
          if (toggleAuto) toggleAuto.checked = false;
        } else if (color === 'auto') {
          localStorage.setItem('accentColorMode', 'auto');
          if (toggleAuto) toggleAuto.checked = true;
          void options.applyWallpaperLogic();
        }
      });
    });
  }

  if (options.accentCustomColor) {
    const customBtn = options.accentCustomColor.closest(
      '.custom-preset',
    ) as HTMLElement;
    options.accentCustomColor.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (!target || !customBtn) return;

      const color = target.value;
      customBtn.style.backgroundColor = color;
      const allBtns =
        options.accentPresetsRow?.querySelectorAll('.color-preset-btn');
      allBtns?.forEach((b) => b.classList.remove('selected'));
      customBtn.classList.add('selected');
      options.applyAccentColor(color);
    });
    options.accentCustomColor.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (!target) return;

      const color = target.value;
      localStorage.setItem('accentColorValue', color);
      localStorage.setItem('accentColorMode', 'manual');
      if (toggleAuto) toggleAuto.checked = false;
    });
  }
}

function bindLauncherFeature(options: LauncherBindingOptions): void {
  options.applyInitialLauncherState();

  if (options.toggleLauncher) {
    options.toggleLauncher.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      options.setLauncherEnabled(target.checked);
      localStorage.setItem('launcherEnabled', String(target.checked));
      options.updateLauncherVisibility();
      if (target.checked) options.renderLauncher(options.getCurrentProvider());
    });
  }

  if (options.launcherProvider) {
    options.launcherProvider.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;

      const provider = target.value as keyof typeof launcherData;
      options.setCurrentProvider(provider);
      localStorage.setItem('launcherProvider', provider);
      options.renderLauncher(provider);
    });
  }

  if (options.appLauncherBtn) {
    options.appLauncherBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      options.closePopups(options.launcherPopup);
      options.launcherPopup?.classList.toggle('active');
      options.appLauncherBtn?.classList.toggle('active');
    });
  }

  document.addEventListener('click', (event) => {
    const targetNode = event.target as Node | null;
    if (!targetNode || !options.launcherPopup || !options.appLauncherBtn)
      return;
    if (!options.launcherPopup.classList.contains('active')) return;

    if (
      !options.launcherPopup.contains(targetNode) &&
      !options.appLauncherBtn.contains(targetNode)
    ) {
      options.launcherPopup.classList.remove('active');
      options.appLauncherBtn.classList.remove('active');
    }
  });
}

function bindSearchFeature(options: SearchBindingOptions): void {
  options.applyInitialSearchEngine();
  options.applyInitialSearchBarVisibility();
  options.applyInitialSuggestionsActive();
  options.applyInitialClearSearch();
  options.applyInitialVoiceSearch();

  if (options.toggleSearchBar) {
    options.toggleSearchBar.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setSearchBarVisible(target.checked);
      localStorage.setItem('searchBarVisible', String(target.checked));
      options.updateSearchSettings();
    });
  }

  if (options.toggleCompact) {
    options.toggleCompact.checked = options.getCompactBarEnabled();
    options.toggleCompact.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setCompactBarEnabled(target.checked);
      localStorage.setItem('compactBarEnabled', String(target.checked));
      options.updateCompactBarStyle();
    });
  }

  if (options.toggleVoiceSearch) {
    options.toggleVoiceSearch.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setVoiceSearchEnabled(target.checked);
      localStorage.setItem('voiceSearchEnabled', String(target.checked));
      options.updateVoiceSearchAvailability();
    });
  }

  if (options.toggleClearSearch) {
    options.toggleClearSearch.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setClearSearchEnabled(target.checked);
      localStorage.setItem('clearSearchEnabled', String(target.checked));
      options.updateGoogleParams();
    });
  }

  if (options.engineBtn && options.dropdown) {
    options.engineBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      options.closePopups(options.dropdown);
      options.dropdown?.classList.toggle('active');
    });

    options.items.forEach((item) => {
      item.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const engine = target.dataset.engine || 'bing';
        if (options.hasEngine(engine)) {
          localStorage.setItem('searchEngine', engine);
          options.setSearchEngine(engine as any);
        }
        options.dropdown?.classList.remove('active');
      });
    });

    document.addEventListener('click', (event) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;

      if (options.dropdown?.classList.contains('active')) {
        if (
          !options.dropdown.contains(targetNode) &&
          !options.engineBtn?.contains(targetNode)
        ) {
          options.dropdown.classList.remove('active');
        }
      }
    });
  }

  if (options.searchInput) {
    const handleInput = options.debounce((event: Event) => {
      const target = event.target as HTMLInputElement;
      const query = target.value.trim();

      if (!query || !options.getSuggestionsActive()) {
        options.clearSuggestions();
        return;
      }

      if (options.suggestionsCache.has(query.toLowerCase())) {
        options.renderSuggestions(
          options.suggestionsCache.get(query.toLowerCase())!,
        );
      } else {
        options.fetchSuggestions(query);
      }
    }, 150);

    options.searchInput.addEventListener('input', handleInput);
    options.searchInput.addEventListener('focus', handleInput);

    options.searchInput.addEventListener('keydown', (event) => {
      if (!options.getSuggestionsActive()) return;

      const suggestionItems = Array.from(
        document.querySelectorAll('.suggestion-item'),
      ) as HTMLElement[];
      if (!suggestionItems.length) return;

      let currentIndex = suggestionItems.findIndex((item) =>
        item.classList.contains('selected'),
      );

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        currentIndex =
          currentIndex < suggestionItems.length - 1 ? currentIndex + 1 : 0;
        options.updateSelection(suggestionItems, currentIndex);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        currentIndex =
          currentIndex > 0 ? currentIndex - 1 : suggestionItems.length - 1;
        options.updateSelection(suggestionItems, currentIndex);
      }
    });
  }

  document.addEventListener('click', (event) => {
    const targetNode = event.target as Node | null;
    if (!targetNode || !options.searchInput) return;

    const suggestionsContainer = document.getElementById(
      'suggestionsContainer',
    );
    if (
      suggestionsContainer &&
      suggestionsContainer.classList.contains('active')
    ) {
      if (
        !suggestionsContainer.contains(targetNode) &&
        !options.searchInput.contains(targetNode)
      ) {
        options.clearSuggestions();
      }
    }
  });

  if (options.toggleSuggestions) {
    options.toggleSuggestions.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      const wantsEnable = target.checked;

      if (wantsEnable) {
        requestFeaturePermissionUI(
          'suggestions',
          'Google Search Suggestions',
          'https://developers.google.com/workspace/cloud-search/docs/reference/rest/v1/query/suggest',
          () => {
            options.setSuggestionsActive(true);
            localStorage.setItem('suggestionsEnabled', 'true');
          },
          () => {
            target.checked = false;
          },
        );
      } else {
        options.setSuggestionsActive(false);
        localStorage.setItem('suggestionsEnabled', 'false');
        options.clearSuggestions();
      }
    });
  }
}

function bindWallpaperFeature(options: WallpaperBindingOptions): void {
  options.applyInitialWallpaperState();

  if (options.toggleWallpaper) {
    options.toggleWallpaper.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setWallpaperEnabled(target.checked);
      localStorage.setItem('wallpaperEnabled', String(target.checked));
      options.updateWallpaperUIState(target.checked);
      if (target.checked) {
        void options.applyWallpaperLogic();
      } else {
        document.body.style.backgroundImage = 'none';
        document.body.removeAttribute('data-wallpaper-active');
        options.setOverlayOpacity('0', false);
      }
    });
  }

  if (options.overlayToggleBtn && options.overlaySliderContainer) {
    options.overlayToggleBtn.addEventListener('click', () => {
      const isCollapsed =
        options.overlaySliderContainer!.classList.contains('collapsed');
      if (isCollapsed) {
        options.overlaySliderContainer!.classList.remove('collapsed');
        options.overlayToggleBtn!.classList.add('expanded');
      } else {
        options.overlaySliderContainer!.classList.add('collapsed');
        options.overlayToggleBtn!.classList.remove('expanded');
      }
    });
  }

  if (options.overlaySlider) {
    options.overlaySlider.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.updateOverlaySliderProgress(target);
      options.setOverlayOpacity(target.value, false);
    });

    options.overlaySlider.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setOverlayOpacity(target.value, true);
    });
  }

  if (options.wallpaperOptions) {
    options.wallpaperOptions.forEach((option) => {
      option.addEventListener('click', async () => {
        const value = option.dataset.value;
        if (!value) return;

        options.setWallpaperSource('local');
        options.setWallpaperType('preset');
        options.setWallpaperValue(value);
        options.saveWallpaperConfig();

        if (options.wallpaperSourceSelect) {
          options.wallpaperSourceSelect.value = 'noSource';
        }
        options.highlightSelectedWallpaper(value);
        await options.applyWallpaperLogic();
      });
    });
  }

  if (options.uploadOption && options.uploadInput) {
    options.uploadOption.addEventListener('click', () => {
      options.uploadInput!.click();
    });

    options.uploadInput.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;

      try {
        const blob = await options.processWallpaperImage(file);
        await options.saveWallpaperToDB(blob);

        options.setWallpaperSource('local');
        options.setWallpaperType('upload');
        options.setWallpaperValue('upload');
        options.saveWallpaperConfig();

        if (options.wallpaperSourceSelect) {
          options.wallpaperSourceSelect.value = 'noSource';
        }
        options.highlightSelectedWallpaper('upload');
        await options.applyWallpaperLogic();
      } catch (error) {
        console.error('Failed to process or save image', error);
        alert('Error saving image. It might be too large.');
      }
      options.uploadInput!.value = '';
    });
  }

  if (options.wallpaperSourceSelect) {
    options.wallpaperSourceSelect.addEventListener('change', async (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      const selectedApi = target.value;
      if (selectedApi === 'noSource') return;

      const revertSelection = () => {
        target.value =
          options.getCurrentWallpaperSource() === 'api'
            ? options.getCurrentWallpaperType()
            : 'noSource';
      };

      const applySelection = async () => {
        options.setWallpaperSource('api');
        options.setWallpaperType(selectedApi as WallpaperType);
        options.saveWallpaperConfig();
        options.clearPresetSelection();
        await options.applyWallpaperLogic();
      };

      if (selectedApi === 'bing') {
        const apiName =
          window.getTranslation?.('apiNameBing') || 'Bing Image of the Day';
        requestFeaturePermissionUI(
          'bing',
          apiName,
          'https://peapix.com/bing',
          applySelection,
          revertSelection,
        );
      } else if (selectedApi === 'nasa') {
        const apiName = window.getTranslation?.('apiNameNasa') || 'NASA APOD';
        requestFeaturePermissionUI(
          'nasa',
          apiName,
          'https://apod.nasa.gov/apod/',
          applySelection,
          revertSelection,
        );
      } else if (selectedApi === 'wikimedia') {
        const apiName =
          window.getTranslation?.('apiNameWiki') ||
          'Wikimedia Picture of the Day';
        requestFeaturePermissionUI(
          'wikimedia',
          apiName,
          'https://commons.wikimedia.org/wiki/Commons:Picture_of_the_day',
          applySelection,
          revertSelection,
        );
      } else {
        applySelection();
      }
    });
  }
}

interface DisplayBindingOptions {
  displayTypeSelect: HTMLSelectElement | null;
  displayAdvancedSetting: HTMLDivElement | null;
  displayToggleBtn: HTMLDivElement | null;
  displaySliderContainer: HTMLDivElement | null;
  subGreeting: HTMLDivElement | null;
  subTime: HTMLDivElement | null;
  subDate: HTMLDivElement | null;
}

function bindDisplayFeature(options: DisplayBindingOptions): void {
  // Gerencia apenas o clique de expandir/recolher o acordeão
  if (options.displayToggleBtn && options.displaySliderContainer) {
    options.displayToggleBtn.addEventListener('click', () => {
      const isCollapsed =
        options.displaySliderContainer!.classList.contains('collapsed');
      if (isCollapsed) {
        options.displaySliderContainer!.classList.remove('collapsed');
        options.displayToggleBtn!.classList.add('expanded');
        // Sobrescreve o max-height do CSS nativo para suportar conteúdos maiores
        options.displaySliderContainer!.style.maxHeight = '500px';
      } else {
        options.displaySliderContainer!.classList.add('collapsed');
        options.displayToggleBtn!.classList.remove('expanded');
        options.displaySliderContainer!.style.maxHeight = '';
      }
    });
  }
}
