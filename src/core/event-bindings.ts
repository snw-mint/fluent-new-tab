interface WeatherBindingOptions {
  applyInitialWeatherState: () => void;
  toggleWeather: HTMLInputElement | null;
  getWeatherEnabled: () => boolean;
  setWeatherEnabled: (enabled: boolean) => void;
  updateWeatherVisibility: () => void;
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
  updateLauncherVisibility: () => void;
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
  updateSearchSettings: () => void;
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
  debounce: (fn: (event: Event) => void, wait: number) => (event: Event) => void;
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
  updateWallpaperUIState: (enabled: boolean) => void;
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
}

function bindWeatherFeature(options: WeatherBindingOptions): void {
  options.applyInitialWeatherState();

  if (options.toggleWeather) {
    options.toggleWeather.checked = options.getWeatherEnabled();
    options.toggleWeather.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      options.setWeatherEnabled(target.checked);
      localStorage.setItem("weatherEnabled", String(target.checked));
      options.updateWeatherVisibility();
      if (target.checked) options.initWeather();
    });
  }

  options.unitBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const unit = btn.dataset.unit as WeatherUnit | undefined;
      if (!unit) return;

      options.setWeatherUnit(unit);
      localStorage.setItem("weatherUnit", unit);
      options.updateUnitButtons();
      options.initWeather();
    });
  });

  if (options.saveCityBtn) options.saveCityBtn.addEventListener("click", options.searchCity);
  if (options.cityInput) {
    options.cityInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") options.searchCity();
    });
  }
}

interface AccentColorBindingOptions {
  applyInitialAccentState: () => void;
  toggleAccentColor: HTMLInputElement | null;
  accentColorOptions: HTMLDivElement | null;
  setCollapsibleFn: (element: HTMLElement | null, shouldExpand: boolean, animate?: boolean) => void;
  accentPresetsRow: HTMLDivElement | null;
  accentCustomColor: HTMLInputElement | null;
  applyAccentColor: (color: string) => void;
  applyWallpaperLogic: () => Promise<void> | void;
}

function bindAccentColorFeature(options: AccentColorBindingOptions): void {
  options.applyInitialAccentState();

  const savedMode = localStorage.getItem("accentColorMode") || "auto";
  const savedColor = localStorage.getItem("accentColorValue") || "#0078D4";

  if (options.accentPresetsRow) {
    const presetBtns = options.accentPresetsRow.querySelectorAll(".color-preset-btn");
    presetBtns.forEach((b) => b.classList.remove("selected"));

    if (savedMode === "auto") {
      const autoBtn = options.accentPresetsRow.querySelector('[data-color="auto"]');
      if (autoBtn) autoBtn.classList.add("selected");
    } else {
      const presetBtn = options.accentPresetsRow.querySelector(`[data-color="${savedColor}"]`);
      if (presetBtn) {
        presetBtn.classList.add("selected");
      } else if (options.accentCustomColor) {
        const customBtn = options.accentCustomColor.closest(".custom-preset") as HTMLElement;
        if (customBtn) {
          customBtn.classList.add("selected");
          customBtn.style.backgroundColor = savedColor;
        }
        options.accentCustomColor.value = savedColor;
      }
    }
  }

  if (options.toggleAccentColor) {
    options.toggleAccentColor.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      const isEnabled = target.checked;
      localStorage.setItem("accentColorEnabled", String(isEnabled));
      options.setCollapsibleFn(options.accentColorOptions, isEnabled, true);
      const color = localStorage.getItem("accentColorValue") || "#0078D4";
      options.applyAccentColor(isEnabled ? color : "#0078D4");
    });
  }

  const toggleAuto = document.getElementById("toggleAccentWallpaper") as HTMLInputElement | null;

  if (toggleAuto) {
    toggleAuto.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;

      if (target.checked) {
        localStorage.setItem("accentColorMode", "auto");

        const allBtns = options.accentPresetsRow?.querySelectorAll(".color-preset-btn");
        allBtns?.forEach((b) => b.classList.remove("selected"));
        const autoBtn = options.accentPresetsRow?.querySelector('[data-color="auto"]');
        if (autoBtn) autoBtn.classList.add("selected");

        await options.applyWallpaperLogic();
      } else {
        localStorage.setItem("accentColorMode", "manual");

        const currentSavedColor = localStorage.getItem("accentColorValue") || "#0078D4";
        options.applyAccentColor(currentSavedColor);

        const allBtns = options.accentPresetsRow?.querySelectorAll(".color-preset-btn");
        allBtns?.forEach((b) => b.classList.remove("selected"));
        const presetBtn = options.accentPresetsRow?.querySelector(`[data-color="${currentSavedColor}"]`);

        if (presetBtn) {
          presetBtn.classList.add("selected");
        } else if (options.accentCustomColor) {
          const customBtn = options.accentCustomColor.closest(".custom-preset") as HTMLElement;
          if (customBtn) customBtn.classList.add("selected");
        }
      }
    });
  }

  if (options.accentPresetsRow) {
    const presetBtns = options.accentPresetsRow.querySelectorAll(".color-preset-btn");

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).tagName === "INPUT") return;

        presetBtns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        const color = btn.getAttribute("data-color");

        if (color && color !== "auto") {
          localStorage.setItem("accentColorValue", color);
          localStorage.setItem("accentColorMode", "manual");
          options.applyAccentColor(color);
          if (toggleAuto) toggleAuto.checked = false;
        } else if (color === "auto") {
          localStorage.setItem("accentColorMode", "auto");
          if (toggleAuto) toggleAuto.checked = true;
          void options.applyWallpaperLogic();
        }
      });
    });
  }

  if (options.accentCustomColor) {
    const customBtn = options.accentCustomColor.closest(".custom-preset") as HTMLElement;
    options.accentCustomColor.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;
      if (!target || !customBtn) return;

      const color = target.value;
      customBtn.style.backgroundColor = color;
      const allBtns = options.accentPresetsRow?.querySelectorAll(".color-preset-btn");
      allBtns?.forEach((b) => b.classList.remove("selected"));
      customBtn.classList.add("selected");
      options.applyAccentColor(color);
    });
    options.accentCustomColor.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (!target) return;

      const color = target.value;
      localStorage.setItem("accentColorValue", color);
      localStorage.setItem("accentColorMode", "manual");
      if (toggleAuto) toggleAuto.checked = false;
    });
  }
}

function bindLauncherFeature(options: LauncherBindingOptions): void {
  options.applyInitialLauncherState();

  if (options.toggleLauncher) {
    options.toggleLauncher.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;

      options.setLauncherEnabled(target.checked);
      localStorage.setItem("launcherEnabled", String(target.checked));
      options.updateLauncherVisibility();
      if (target.checked) options.renderLauncher(options.getCurrentProvider());
    });
  }

  if (options.launcherProvider) {
    options.launcherProvider.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;

      const provider = target.value as keyof typeof launcherData;
      options.setCurrentProvider(provider);
      localStorage.setItem("launcherProvider", provider);
      options.renderLauncher(provider);
    });
  }

  if (options.appLauncherBtn) {
    options.appLauncherBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      options.closePopups(options.launcherPopup);
      options.launcherPopup?.classList.toggle("active");
      options.appLauncherBtn?.classList.toggle("active");
    });
  }

  document.addEventListener("click", (event) => {
    const targetNode = event.target as Node | null;
    if (!targetNode || !options.launcherPopup || !options.appLauncherBtn) return;
    if (!options.launcherPopup.classList.contains("active")) return;

    if (!options.launcherPopup.contains(targetNode) && !options.appLauncherBtn.contains(targetNode)) {
      options.launcherPopup.classList.remove("active");
      options.appLauncherBtn.classList.remove("active");
    }
  });
}

function bindSearchFeature(options: SearchBindingOptions): void {
  options.applyInitialSearchEngine();
  if (options.engineBtn) {
    options.engineBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      options.closePopups(options.dropdown);
      options.dropdown?.classList.toggle("active");
    });
  }

  document.addEventListener("click", (event) => {
    const targetNode = event.target as Node | null;
    if (!targetNode) return;
    const dropdown = options.dropdown;
    const engineBtn = options.engineBtn;
    if (!dropdown || !dropdown.classList.contains("active")) return;
    if (dropdown.contains(targetNode) || engineBtn?.contains(targetNode)) return;
    dropdown.classList.remove("active");
  });

  options.items.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedEngine = item.getAttribute("data-engine");
      if (!selectedEngine || !options.hasEngine(selectedEngine)) return;
      options.setSearchEngine(selectedEngine as keyof typeof engines);
      localStorage.setItem("searchEngine", selectedEngine);
      options.dropdown?.classList.remove("active");
    });
  });

  options.applyInitialSearchBarVisibility();
  if (options.toggleSearchBar) {
    options.toggleSearchBar.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setSearchBarVisible(target.checked);
      localStorage.setItem("searchBarVisible", String(target.checked));
      options.updateSearchSettings();
    });
  }

  options.applyInitialSuggestionsActive();
  if (options.toggleSuggestions) {
    options.toggleSuggestions.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setSuggestionsActive(target.checked);
      localStorage.setItem("suggestionsEnabled", String(target.checked));
      if (!target.checked) options.clearSuggestions();
    });
  }

  options.applyInitialClearSearch();
  if (options.toggleClearSearch) {
    options.toggleClearSearch.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setClearSearchEnabled(target.checked);
      localStorage.setItem("clearSearchEnabled", String(target.checked));
      options.updateGoogleParams();
    });
  }

  if (options.toggleCompact) {
    options.toggleCompact.checked = options.getCompactBarEnabled();
    options.toggleCompact.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setCompactBarEnabled(target.checked);
      localStorage.setItem("compactBarEnabled", String(target.checked));
      options.updateCompactBarStyle();
    });
  }
  options.updateCompactBarStyle();

  options.applyInitialVoiceSearch();
  if (options.toggleVoiceSearch) {
    options.toggleVoiceSearch.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setVoiceSearchEnabled(target.checked);
      localStorage.setItem("voiceSearchEnabled", String(target.checked));
      options.updateVoiceSearchAvailability();
    });
  }

  if (options.searchInput) {
    options.searchInput.addEventListener(
      "input",
      options.debounce((event: Event) => {
        if (!options.getSuggestionsActive()) return;
        const target = event.target as HTMLInputElement | null;
        if (!target) return;
        const query = target.value.trim();
        if (query.length < 2) {
          options.clearSuggestions();
          return;
        }
        const cacheKey = query.toLowerCase();
        if (options.suggestionsCache.has(cacheKey)) {
          options.renderSuggestions(options.suggestionsCache.get(cacheKey) || []);
          return;
        }
        options.fetchSuggestions(query);
      }, 100),
    );

    options.searchInput.addEventListener("keydown", (event) => {
      if (!options.getSuggestionsActive()) return;
      const suggestionItems = Array.from(document.querySelectorAll<HTMLElement>(".suggestion-item"));
      if (suggestionItems.length === 0) return;

      let index = suggestionItems.findIndex((item) => item.classList.contains("selected"));
      if (event.key === "ArrowDown") {
        event.preventDefault();
        index = (index + 1) % suggestionItems.length;
        options.updateSelection(suggestionItems, index);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        index = (index - 1 + suggestionItems.length) % suggestionItems.length;
        options.updateSelection(suggestionItems, index);
      } else if (event.key === "Enter") {
        if (index > -1) {
          event.preventDefault();
          suggestionItems[index].click();
        }
      } else if (event.key === "Escape") {
        options.clearSuggestions();
      }
    });
  }
}

function bindWallpaperFeature(options: WallpaperBindingOptions): void {
  options.applyInitialWallpaperState();

  if (options.overlayToggleBtn) {
    options.overlayToggleBtn.addEventListener("click", () => {
      options.overlayToggleBtn?.classList.toggle("expanded");
      options.overlaySliderContainer?.classList.toggle("collapsed");
    });
  }

  if (options.overlaySlider) {
    options.overlaySlider.addEventListener("input", (event) => {
      const antiFlickerBlock = document.getElementById("anti-flicker-overlay");
      if (antiFlickerBlock) antiFlickerBlock.remove();
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.updateOverlaySliderProgress(target);
      options.setOverlayOpacity(target.value);
    });

    options.overlaySlider.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setOverlayOpacity(target.value, true);
    });
  }

  if (options.toggleWallpaper) {
    options.toggleWallpaper.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setWallpaperEnabled(target.checked);
      localStorage.setItem("wallpaperEnabled", String(target.checked));
      options.updateWallpaperUIState(target.checked);
      options.applyWallpaperLogic();
    });
  }

  options.wallpaperOptions.forEach((option) => {
    option.addEventListener("click", () => {
      if (!options.getWallpaperEnabled()) return;
      const value = option.dataset.value || "preset_1";
      options.setWallpaperSource("local");
      options.setWallpaperType("preset");
      options.setWallpaperValue(value);
      options.saveWallpaperConfig();
      if (options.wallpaperSourceSelect) options.wallpaperSourceSelect.value = "noSource";
      options.highlightSelectedWallpaper(value);
      options.applyWallpaperLogic();
    });
  });

  if (options.uploadOption && options.uploadInput) {
    options.uploadOption.addEventListener("click", () => {
      options.uploadInput?.click();
    });

    options.uploadInput.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;
      options.uploadOption!.style.opacity = "0.5";

      try {
        console.log("Processing image...");
        const processedBlob = await options.processWallpaperImage(file);
        console.log("Saving to database...");
        await options.saveWallpaperToDB(processedBlob);

        options.setWallpaperSource("local");
        options.setWallpaperType("upload");
        options.setWallpaperValue("custom");
        options.saveWallpaperConfig();

        if (!options.getWallpaperEnabled()) {
          options.setWallpaperEnabled(true);
          localStorage.setItem("wallpaperEnabled", "true");
          if (options.toggleWallpaper) options.toggleWallpaper.checked = true;
          options.updateWallpaperUIState(true);
        }

        if (options.wallpaperSourceSelect) options.wallpaperSourceSelect.value = "noSource";
        options.highlightSelectedWallpaper("upload");
        await options.applyWallpaperLogic();
        console.log("Success!");
      } catch (error) {
        console.error("Upload error:", error);
        const message = error instanceof Error ? error.message : String(error);
        const isStorageError = message.toLowerCase().includes("storage") || message.toLowerCase().includes("quota");
        alert(
          isStorageError
            ? "Could not save wallpaper. Your browser storage may be full."
            : "Error processing image. Try a smaller file.",
        );
      } finally {
        options.uploadOption!.style.opacity = "1";
        if (options.uploadInput) options.uploadInput.value = "";
      }
    });
  }

  if (options.wallpaperSourceSelect) {
    options.wallpaperSourceSelect.addEventListener("change", async (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      const selectedApi = target.value;
      if (selectedApi === "noSource") return;

      options.setWallpaperSource("api");
      options.setWallpaperType(selectedApi as WallpaperType);
      options.saveWallpaperConfig();
      options.clearPresetSelection();
      await options.applyWallpaperLogic();
    });
  }
}
