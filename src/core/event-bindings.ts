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
  setWeatherUnit: (unit: WeatherUnit) => void;
  saveCityBtn: HTMLButtonElement | null;
  cityInput: HTMLInputElement | null;
  searchCity: () => void;
  toggleFahrenheit: HTMLInputElement | null;
  getWeatherUnit: () => WeatherUnit;
  toggleWeatherAlerts: HTMLInputElement | null;
  getWeatherAlertsEnabled: () => boolean;
  setWeatherAlertsEnabled: (enabled: boolean) => void;
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
  searchBarStyleSelect: HTMLSelectElement | null;
  searchMoreBtn: HTMLDivElement | null;
  searchMoreContainer: HTMLDivElement | null;
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
  wallpaperSourceSelect: HTMLSelectElement | null;
  setWallpaperSource: (source: WallpaperSource) => void;
  setWallpaperType: (type: WallpaperType) => void;
  setWallpaperValue: (value: string) => void;
  saveWallpaperConfig: () => void;
  uploadInput: HTMLInputElement | null;
  processWallpaperImage: (file: File) => Promise<Blob>;
  saveWallpaperToDB: (blob: Blob) => Promise<boolean>;
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

        requestFeaturePermissionUI(
          'weather',
          'Open-Meteo API',
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

  if (options.toggleFahrenheit) {
    options.toggleFahrenheit.checked = options.getWeatherUnit() === 'f';
    options.toggleFahrenheit.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const unit: WeatherUnit = target.checked ? 'f' : 'c';
      options.setWeatherUnit(unit);
      localStorage.setItem('weatherUnit', unit);
      options.initWeather();
    });
  }

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

  if (options.toggleWeatherAlerts) {
    options.toggleWeatherAlerts.checked = options.getWeatherAlertsEnabled();
    options.toggleWeatherAlerts.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const wantsEnable = target.checked;

      if (wantsEnable) {
        requestFeaturePermissionUI(
          'weatherAlerts',
          'Air Quality API',
          'https://open-meteo.com/en/docs/air-quality-api',
          () => {
            options.setWeatherAlertsEnabled(true);
            localStorage.setItem('weatherAlertsEnabled', 'true');
            (chrome.runtime as any).sendMessage({
              action: 'updateWeatherAlertsStatus',
              enabled: true,
              lat: currentCityData.lat,
              lon: currentCityData.lon,
            });
            options.initWeather();
          },
          () => {
            target.checked = false;
            options.setWeatherAlertsEnabled(false);
          },
        );
      } else {
        options.setWeatherAlertsEnabled(false);
        localStorage.setItem('weatherAlertsEnabled', 'false');
        (chrome.runtime as any).sendMessage({
          action: 'updateWeatherAlertsStatus',
          enabled: false,
        });

        const widget = document.getElementById('weather-alerts-widget');
        if (widget) widget.remove();
      }
    });
  }
}

interface AccentColorBindingOptions {
  applyInitialAccentState: () => void;
  toggleAppearance: HTMLInputElement | null;
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
      options.accentPresetsRow.querySelectorAll<HTMLElement>(
        '.color-preset-btn',
      );

    // 1. Limpa o estado visual de todos os botões no carregamento da página
    presetBtns.forEach((b) => {
      b.classList.remove('selected');
      if (
        b.classList.contains('auto-preset') ||
        b.classList.contains('custom-preset')
      ) {
        b.style.backgroundColor = '';
      }
    });

    // 2. Aplica a classe 'selected' apenas no botão correto baseado no cache
    if (savedMode === 'auto') {
      const autoBtn = options.accentPresetsRow.querySelector<HTMLElement>(
        '[data-color="auto"]',
      );
      if (autoBtn) autoBtn.classList.add('selected');
    } else {
      const presetBtn = options.accentPresetsRow.querySelector<HTMLElement>(
        `[data-color="${savedColor}"]`,
      );
      if (presetBtn) {
        presetBtn.classList.add('selected');
      } else if (options.accentCustomColor) {
        const customBtn = options.accentCustomColor.closest(
          '.custom-preset',
        ) as HTMLElement;
        if (customBtn) customBtn.classList.add('selected');
        options.accentCustomColor.value = savedColor;
      }
    }

    // 3. Recria os ouvintes de clique limpando regras antigas do toggle
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;

        // Limpa visualmente ao clicar
        presetBtns.forEach((b) => {
          b.classList.remove('selected');
          if (
            b.classList.contains('auto-preset') ||
            b.classList.contains('custom-preset')
          ) {
            b.style.backgroundColor = '';
          }
        });

        btn.classList.add('selected');

        const color = btn.getAttribute('data-color');

        if (color === 'auto') {
          localStorage.setItem('accentColorMode', 'auto');
          void options.applyWallpaperLogic();
        } else if (color) {
          localStorage.setItem('accentColorValue', color);
          localStorage.setItem('accentColorMode', 'manual');
          options.applyAccentColor(color);

          // Limpa o valor do conta-gotas se escolheu uma cor sólida padrão
          if (
            !btn.classList.contains('custom-preset') &&
            options.accentCustomColor
          ) {
            options.accentCustomColor.value = '#000000';
          }
        }
      });
    });
  }

  // 4. Garante que o Conta-gotas salve apenas no modo manual
  if (options.accentCustomColor) {
    const customBtn = options.accentCustomColor.closest(
      '.custom-preset',
    ) as HTMLElement;

    options.accentCustomColor.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (!target || !customBtn) return;

      const color = target.value;
      const allBtns =
        options.accentPresetsRow?.querySelectorAll<HTMLElement>(
          '.color-preset-btn',
        );
      allBtns?.forEach((b) => {
        b.classList.remove('selected');
        if (b.classList.contains('auto-preset')) b.style.backgroundColor = '';
      });

      customBtn.classList.add('selected');
      options.applyAccentColor(color);
    });

    options.accentCustomColor.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (!target) return;

      localStorage.setItem('accentColorValue', target.value);
      localStorage.setItem('accentColorMode', 'manual');
    });
  }

  if (options.toggleAppearance) {
    options.toggleAppearance.addEventListener('change', (event) => {
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
      options.accentPresetsRow.querySelectorAll<HTMLElement>(
        '.color-preset-btn',
      );

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        presetBtns.forEach((b) => {
          b.classList.remove('selected');
          if (
            b.classList.contains('auto-preset') ||
            b.classList.contains('custom-preset')
          ) {
            b.style.backgroundColor = '';
          }
        });

        btn.classList.add('selected');
        if (
          !btn.classList.contains('custom-preset') &&
          options.accentCustomColor
        ) {
          options.accentCustomColor.value = '#000000';
        }

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

  const accentMoreBtn = document.getElementById('accent-more-btn');
  const accentMoreContainer = document.getElementById('accent-more-container');

  if (accentMoreBtn && accentMoreContainer) {
    accentMoreBtn.addEventListener('click', () => {
      const isCollapsed = accentMoreContainer.classList.contains('collapsed');
      if (isCollapsed) {
        accentMoreContainer.classList.remove('collapsed');
        accentMoreBtn.classList.add('expanded');
        accentMoreContainer.style.maxHeight = '500px';
      } else {
        accentMoreContainer.classList.add('collapsed');
        accentMoreBtn.classList.remove('expanded');
        accentMoreContainer.style.maxHeight = '';
      }
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

  if (options.searchMoreBtn && options.searchMoreContainer) {
    options.searchMoreBtn.addEventListener('click', () => {
      const isCollapsed =
        options.searchMoreContainer!.classList.contains('collapsed');
      if (isCollapsed) {
        options.searchMoreContainer!.classList.remove('collapsed');
        options.searchMoreBtn!.classList.add('expanded');
        options.searchMoreContainer!.style.maxHeight = '500px';
      } else {
        options.searchMoreContainer!.classList.add('collapsed');
        options.searchMoreBtn!.classList.remove('expanded');
        options.searchMoreContainer!.style.maxHeight = '';
      }
    });
  }

  if (options.searchBarStyleSelect) {
    options.searchBarStyleSelect.value = options.getCompactBarEnabled()
      ? 'compact'
      : 'full';
    options.searchBarStyleSelect.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      const isCompact = target.value === 'compact';
      options.setCompactBarEnabled(isCompact);
      localStorage.setItem('compactBarEnabled', String(isCompact));

      if (isCompact) {
        document.documentElement.setAttribute('data-compact-bar', 'true');
      } else {
        document.documentElement.removeAttribute('data-compact-bar');
      }

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

interface DisplayBindingOptions {
  displayTypeSelect: HTMLSelectElement | null;
  displayAdvancedSetting: HTMLDivElement | null;
  displayToggleBtn: HTMLDivElement | null;
  displaySliderContainer: HTMLDivElement | null;
  subGreeting: HTMLDivElement | null;
  subTime: HTMLDivElement | null;
  subDate: HTMLDivElement | null;
  displayScaleSlider: HTMLInputElement | null;
  getDisplayScale: () => number;
  setDisplayScale: (scale: number) => void;
}

interface ShortcutRadiusBindingOptions {
  shortcutRadiusSlider: HTMLInputElement | null;
  shortcutRadiusRow: HTMLDivElement | null;
  getShortcutRadius: () => string;
  setShortcutRadius: (radius: string) => void;
  toggleHideShortcutNames: HTMLInputElement | null;
  getHideShortcutNames: () => boolean;
  setHideShortcutNames: (enabled: boolean) => void;
}

function bindDisplayFeature(options: DisplayBindingOptions): void {
  if (options.displayToggleBtn && options.displaySliderContainer) {
    options.displayToggleBtn.addEventListener('click', () => {
      const isCollapsed =
        options.displaySliderContainer!.classList.contains('collapsed');
      if (isCollapsed) {
        options.displaySliderContainer!.classList.remove('collapsed');
        options.displayToggleBtn!.classList.add('expanded');
        options.displaySliderContainer!.style.maxHeight = '500px';
      } else {
        options.displaySliderContainer!.classList.add('collapsed');
        options.displayToggleBtn!.classList.remove('expanded');
        options.displaySliderContainer!.style.maxHeight = '';
      }
    });
  }
  if (options.displayScaleSlider) {
    const slider = options.displayScaleSlider;
    slider.value = String(options.getDisplayScale());
    updateSliderProgress(slider);

    slider.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      updateSliderProgress(target);
      document.documentElement.style.setProperty(
        '--display-scale',
        `${parseInt(target.value) / 100}`,
      );
    });

    slider.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const value = parseInt(target.value);
      options.setDisplayScale(value);
      localStorage.setItem('displayScale', String(value));
    });

    function updateSliderProgress(slider: HTMLInputElement) {
      const min = parseInt(slider.min);
      const max = parseInt(slider.max);
      const val = parseInt(slider.value);
      const progress = (val - min) / (max - min); // Sem o * 100
      slider.style.setProperty('--slider-progress', `${progress}`);
    }
  }
}

function bindShortcutRadiusFeature(
  options: ShortcutRadiusBindingOptions,
): void {
  if (options.shortcutRadiusSlider && options.shortcutRadiusRow) {
    const currentRadius = options.getShortcutRadius();
    options.shortcutRadiusSlider.value = currentRadius;

    const updateSliderUI = (value: string) => {
      let valNum = parseInt(value, 10);

      if (valNum >= -3 && valNum <= 3) {
        valNum = 0;
        options.shortcutRadiusSlider!.value = '0';
      }

      const min = parseInt(options.shortcutRadiusSlider!.min, 10);
      const max = parseInt(options.shortcutRadiusSlider!.max, 10);
      const progress = (valNum - min) / (max - min);
      options.shortcutRadiusSlider!.style.setProperty(
        '--slider-progress',
        `${progress}`,
      );
    };

    updateSliderUI(currentRadius);

    const applyRadius = (valNum: number) => {
      let radiusValue = '';
      if (valNum === 0) {
        radiusValue = '0.875rem';
      } else if (valNum > 0) {
        radiusValue = `calc(0.875rem + ((50% - 0.875rem) * (${valNum} / 100)))`;
      } else {
        radiusValue = `calc(0.875rem - ((0.875rem - 0.2rem) * (${-valNum} / 100)))`;
      }

      document.documentElement.style.setProperty(
        '--shortcut-radius',
        radiusValue,
      );
    };

    options.shortcutRadiusSlider.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      updateSliderUI(value);

      let finalVal = parseInt(value, 10);
      if (finalVal >= -3 && finalVal <= 3) {
        finalVal = 0;
      }
      applyRadius(finalVal);
    });

    options.shortcutRadiusSlider.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      let finalVal = parseInt(target.value, 10);
      if (finalVal >= -3 && finalVal <= 3) {
        finalVal = 0;
      }

      options.setShortcutRadius(String(finalVal));
      localStorage.setItem('shortcutRadius', String(finalVal));
      applyRadius(finalVal);
    });
  }

  if (options.toggleHideShortcutNames) {
    options.toggleHideShortcutNames.checked = options.getHideShortcutNames();

    options.toggleHideShortcutNames.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      const isEnabled = target.checked;
      options.setHideShortcutNames(isEnabled);
      localStorage.setItem('hideShortcutNames', String(isEnabled));

      const grid = document.getElementById('shortcutsGrid');
      if (grid) {
        grid.setAttribute('data-hide-names', String(isEnabled));
      }
    });
  }
}

interface MainUiScaleBindingOptions {
  mainUiScaleSlider: HTMLInputElement | null;
  getMainUiScale: () => number;
  setMainUiScale: (scale: number) => void;
}

function bindMainUiScaleFeature(options: MainUiScaleBindingOptions): void {
  if (options.mainUiScaleSlider) {
    const slider = options.mainUiScaleSlider;
    slider.value = String(options.getMainUiScale());

    const updateSliderProgress = (sliderInput: HTMLInputElement) => {
      const min = parseFloat(sliderInput.min);
      const max = parseFloat(sliderInput.max);
      const val = parseFloat(sliderInput.value);
      const progress = (val - min) / (max - min);
      sliderInput.style.setProperty('--slider-progress', `${progress}`);
    };

    updateSliderProgress(slider);

    slider.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      updateSliderProgress(target);
      document.documentElement.style.setProperty(
        '--main-ui-scale',
        target.value,
      );

      if (!localStorage.getItem('displayScale')) {
        document.documentElement.style.setProperty(
          '--display-scale',
          target.value,
        );
      }
    });

    slider.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      options.setMainUiScale(value);
      localStorage.setItem('mainUiScale', String(value));
    });
  }
}

function bindWallpaperFeature(options: WallpaperBindingOptions): void {
  const autoColorBtn = document.querySelector(
    '.color-preset-btn.auto-preset',
  ) as HTMLButtonElement | null;

  if (autoColorBtn) {
    autoColorBtn.disabled = !options.getWallpaperEnabled();
  }

  if (options.toggleWallpaper) {
    options.toggleWallpaper.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      const isEnabled = target.checked;
      options.setWallpaperEnabled(isEnabled);
      localStorage.setItem('wallpaperEnabled', String(isEnabled));
      options.updateWallpaperUIState(isEnabled, true);

      if (autoColorBtn) {
        autoColorBtn.disabled = !isEnabled;
        if (!isEnabled && autoColorBtn.classList.contains('selected')) {
          const defaultColorBtn = document.querySelector(
            '.color-preset-btn[data-color="#0078d4"]',
          ) as HTMLButtonElement | null;
          if (defaultColorBtn) defaultColorBtn.click();
        }
      }

      await options.applyWallpaperLogic();
    });
  }

  if (options.wallpaperSourceSelect) {
    options.wallpaperSourceSelect.addEventListener('change', async (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;

      const type = target.value as WallpaperType;
      let source: WallpaperSource = 'api';
      if (type === 'upload') {
        source = 'local';
      }

      options.setWallpaperSource(source);
      options.setWallpaperType(type);
      options.saveWallpaperConfig();
      options.updateWallpaperUIState(options.getWallpaperEnabled(), true);

      if (source === 'api') {
        let apiName = 'Wallpaper API';
        let learnMore = '';

        if (type === 'bing') {
          apiName = 'Bing Wallpaper';
          learnMore = 'https://peapix.com/';
        } else if (type === 'nasa') {
          apiName = 'NASA APOD';
          learnMore = 'https://apod.nasa.gov/';
        } else if (type === 'wikimedia') {
          apiName = 'Wikimedia Wallpaper';
          learnMore = 'https://commons.wikimedia.org/';
        }

        requestFeaturePermissionUI(
          type as any,
          apiName,
          learnMore,
          () => {
            void options.applyWallpaperLogic();
          },
          () => {
            target.value = 'upload';
            options.setWallpaperSource('local');
            options.setWallpaperType('upload');
            options.saveWallpaperConfig();
            options.updateWallpaperUIState(options.getWallpaperEnabled(), true);
            void options.applyWallpaperLogic();
          },
        );
      } else {
        await options.applyWallpaperLogic();
      }
    });
  }

  const uploadBtnLive = document.getElementById('uploadWallpaperBtn');
  const uploadInputLive = document.getElementById(
    'wallpaperUploadInput',
  ) as HTMLInputElement | null;

  if (uploadBtnLive && uploadInputLive) {
    uploadBtnLive.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadInputLive.click();
    });

    uploadInputLive.addEventListener('change', async (event) => {
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

        await options.applyWallpaperLogic();
      } catch (error) {
        console.error('Failed to process or save image', error);
        alert('Error saving image. It might be too large.');
      }
      uploadInputLive.value = '';
    });
  }

  if (options.overlayToggleBtn && options.overlaySliderContainer) {
    options.overlayToggleBtn.addEventListener('click', () => {
      const isCollapsed =
        options.overlaySliderContainer!.classList.contains('collapsed');
      if (isCollapsed) {
        options.overlaySliderContainer!.classList.remove('collapsed');
        options.overlayToggleBtn!.classList.add('expanded');
        options.overlaySliderContainer!.style.maxHeight = '500px';
      } else {
        options.overlaySliderContainer!.classList.add('collapsed');
        options.overlayToggleBtn!.classList.remove('expanded');
        options.overlaySliderContainer!.style.maxHeight = '';
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
}
