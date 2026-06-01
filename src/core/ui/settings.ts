import * as refs from '@/core/shared/dom-refs';
import { getInputTarget, getSelectTarget } from '@/core/shared/dom-utils';
import { applyAccentColor } from '@/core/boot/theme';

import {
  currentCityData,
  foldersEnabled,
  shortcuts,
  setFoldersEnabled,
  setShortcuts,
} from '@/core/shared/state';
import {
  WeatherUnit,
  WallpaperType,
  WallpaperSource,
} from '@/core/shared/types';

export function bindWeatherFeature(options: any): void {
  options.applyInitialWeatherState();
  if (refs.cityInput && currentCityData && currentCityData.name) {
    refs.cityInput.value = currentCityData.name;
  }
  if (refs.toggleWeather) {
    refs.toggleWeather.checked = options.getWeatherEnabled();
    refs.toggleWeather.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const wantsEnable = target.checked;

      if (wantsEnable) {
        options.setWeatherEnabled(true);
        options.updateWeatherVisibility(true);
        import('@/core/ui/ui-components').then(
          ({ requestFeaturePermissionUI }) => {
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
                options.updateWeatherVisibility(false);
              },
            );
          },
        );
      } else {
        options.setWeatherEnabled(false);
        localStorage.setItem('weatherEnabled', 'false');
        options.updateWeatherVisibility(false);
      }
    });
  }

  if (refs.toggleFahrenheit) {
    refs.toggleFahrenheit.checked = options.getWeatherUnit() === 'f';
    refs.toggleFahrenheit.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const unit: WeatherUnit = target.checked ? 'f' : 'c';
      options.setWeatherUnit(unit);
      localStorage.setItem('weatherUnit', unit);
      options.initWeather();
    });
  }

  if (refs.saveCityBtn)
    refs.saveCityBtn.addEventListener('click', options.searchCity);
  if (refs.cityInput) {
    refs.cityInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') options.searchCity();
    });
  }

  if (refs.weatherMoreBtn && refs.weatherMoreContainer) {
    refs.weatherMoreBtn.addEventListener('click', () => {
      const isCollapsed =
        refs.weatherMoreContainer.classList.contains('collapsed');
      if (isCollapsed) {
        refs.weatherMoreContainer.classList.remove('collapsed');
        refs.weatherMoreBtn.classList.add('expanded');
        refs.weatherMoreContainer.style.maxHeight = '500px';
      } else {
        refs.weatherMoreContainer.classList.add('collapsed');
        refs.weatherMoreBtn.classList.remove('expanded');
        refs.weatherMoreContainer.style.maxHeight = '';
      }
    });
  }

  if (refs.toggleWeatherAlerts) {
    refs.toggleWeatherAlerts.checked = options.getWeatherAlertsEnabled();
    refs.toggleWeatherAlerts.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.checked) {
        import('@/core/ui/ui-components').then(
          ({ requestFeaturePermissionUI }) => {
            requestFeaturePermissionUI(
              'weatherAlerts',
              'Air Quality API',
              'https://open-meteo.com/en/docs/air-quality-api',
              () => {
                options.setWeatherAlertsEnabled(true);
                localStorage.setItem('weatherAlertsEnabled', 'true');
                chrome.runtime.sendMessage({
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
          },
        );
      } else {
        options.setWeatherAlertsEnabled(false);
        localStorage.setItem('weatherAlertsEnabled', 'false');
        chrome.runtime.sendMessage({
          action: 'updateWeatherAlertsStatus',
          enabled: false,
        });
        document.getElementById('weather-alerts-widget')?.remove();
      }
    });
  }
}

export function bindAccentColorFeature(options: any): void {
  options.applyInitialAccentState();
  const savedMode = localStorage.getItem('accentColorMode') || 'auto';
  const savedColor = localStorage.getItem('accentColorValue') || '#0078D4';

  const clearPresetSelection = () => {
    refs.accentPresetsRow
      ?.querySelectorAll<HTMLElement>('.color-preset-btn')
      .forEach((b) => {
        b.classList.remove('selected');
        if (
          b.classList.contains('auto-preset') ||
          b.classList.contains('custom-preset')
        )
          b.style.backgroundColor = '';
      });
  };

  if (refs.accentPresetsRow) {
    clearPresetSelection();
    if (savedMode === 'auto') {
      refs.accentPresetsRow
        .querySelector<HTMLElement>('[data-color="auto"]')
        ?.classList.add('selected');
    } else {
      const presetBtn = refs.accentPresetsRow.querySelector<HTMLElement>(
        `[data-color="${savedColor}"]`,
      );
      if (presetBtn) {
        presetBtn.classList.add('selected');
      } else if (refs.accentCustomColor) {
        refs.accentCustomColor
          .closest('.custom-preset')
          ?.classList.add('selected');
        refs.accentCustomColor.value = savedColor;
      }
    }
  }

  if (refs.toggleAppearance) {
    const isEnabled = localStorage.getItem('accentColorEnabled') !== 'false';
    refs.toggleAppearance.checked = isEnabled;

    import('@/core/ui/ui-components').then(({ setCollapsible }) => {
      setCollapsible(refs.accentColorOptions, isEnabled, false);
    });

    refs.toggleAppearance.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const isEnabled = target.checked;
      localStorage.setItem('accentColorEnabled', String(isEnabled));
      import('@/core/ui/ui-components').then(({ setCollapsible }) => {
        setCollapsible(refs.accentColorOptions, isEnabled, true);
      });

      if (!isEnabled) {
        const toggleAuto = document.getElementById(
          'toggleAccentWallpaper',
        ) as HTMLInputElement | null;
        if (toggleAuto && toggleAuto.checked) {
          toggleAuto.checked = false;
          localStorage.setItem('accentColorMode', 'manual');
          clearPresetSelection();
          refs.accentPresetsRow
            ?.querySelector(
              `[data-color="${localStorage.getItem('accentColorValue') || '#0078D4'}"]`,
            )
            ?.classList.add('selected');
        }
      }
      applyAccentColor(
        isEnabled
          ? localStorage.getItem('accentColorValue') || '#0078D4'
          : '#0078D4',
      );
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
        clearPresetSelection();
        refs.accentPresetsRow
          ?.querySelector('[data-color="auto"]')
          ?.classList.add('selected');
        await options.applyWallpaperLogic();
      } else {
        localStorage.setItem('accentColorMode', 'manual');
        const currentSavedColor =
          localStorage.getItem('accentColorValue') || '#0078D4';
        applyAccentColor(currentSavedColor);
        clearPresetSelection();
        const presetBtn = refs.accentPresetsRow?.querySelector(
          `[data-color="${currentSavedColor}"]`,
        );
        if (presetBtn) presetBtn.classList.add('selected');
        else
          refs.accentCustomColor
            ?.closest('.custom-preset')
            ?.classList.add('selected');
      }
    });
  }

  if (refs.accentPresetsRow) {
    refs.accentPresetsRow
      .querySelectorAll<HTMLElement>('.color-preset-btn')
      .forEach((btn) => {
        btn.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).tagName === 'INPUT') return;
          clearPresetSelection();
          btn.classList.add('selected');
          if (
            !btn.classList.contains('custom-preset') &&
            refs.accentCustomColor
          )
            refs.accentCustomColor.value = '#000000';

          const color = btn.getAttribute('data-color');
          if (color && color !== 'auto') {
            localStorage.setItem('accentColorValue', color);
            localStorage.setItem('accentColorMode', 'manual');
            applyAccentColor(color);
            if (toggleAuto) toggleAuto.checked = false;
          } else if (color === 'auto') {
            localStorage.setItem('accentColorMode', 'auto');
            if (toggleAuto) toggleAuto.checked = true;
            void options.applyWallpaperLogic();
          }
        });
      });
  }

  if (refs.accentCustomColor) {
    const customBtn = refs.accentCustomColor.closest(
      '.custom-preset',
    ) as HTMLElement;
    refs.accentCustomColor.addEventListener('click', async (event) => {
      event.preventDefault();
      const { initCustomColorPicker } =
        await import('@/core/lazy/color-picker');
      const { warningModal } = await import('@/core/ui/ui-components');
      initCustomColorPicker(customBtn, warningModal, clearPresetSelection);
    });
  }

  if (refs.accentMoreBtn && refs.accentMoreContainer) {
    refs.accentMoreBtn.addEventListener('click', () => {
      const isCollapsed =
        refs.accentMoreContainer.classList.contains('collapsed');
      if (isCollapsed) {
        refs.accentMoreContainer.classList.remove('collapsed');
        refs.accentMoreBtn.classList.add('expanded');
        refs.accentMoreContainer.style.maxHeight = '500px';
      } else {
        refs.accentMoreContainer.classList.add('collapsed');
        refs.accentMoreBtn.classList.remove('expanded');
        refs.accentMoreContainer.style.maxHeight = '';
      }
    });
  }
}

export function bindSurfaceTintFeature(): void {
  const toggleSurfaceTint = document.getElementById(
    'toggleSurfaceTint',
  ) as HTMLInputElement | null;

  if (!toggleSurfaceTint) return;

  const isActive = localStorage.getItem('fluent_surface_tint') === 'true';
  toggleSurfaceTint.checked = isActive;

  toggleSurfaceTint.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const isChecked = target.checked;
    localStorage.setItem('fluent_surface_tint', String(isChecked));

    if (isChecked) {
      document.documentElement.setAttribute('data-surface-tint', 'true');
    } else {
      document.documentElement.removeAttribute('data-surface-tint');
    }
  });
}

export function bindDisplayFeature(options: any): void {
  const toggleDisplay = document.getElementById(
    'toggleDisplay',
  ) as HTMLInputElement | null;
  if (toggleDisplay) {
    toggleDisplay.checked = options.getDisplayEnabled();
    import('@/core/ui/ui-components').then(({ setCollapsible }) => {
      const mainOptionsInit = document.getElementById('displayMainOptions');
      setCollapsible(mainOptionsInit, toggleDisplay.checked, false);
    });

    toggleDisplay.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setDisplayVisible(target.checked);
      import('@/core/ui/ui-components').then(({ setCollapsible }) => {
        const mainOptions = document.getElementById('displayMainOptions');
        setCollapsible(mainOptions, target.checked, true);
      });
    });
  }

  if (refs.displayToggleBtn && refs.displaySliderContainer) {
    refs.displayToggleBtn.addEventListener('click', () => {
      const isCollapsed =
        refs.displaySliderContainer.classList.contains('collapsed');
      if (isCollapsed) {
        refs.displaySliderContainer.classList.remove('collapsed');
        refs.displayToggleBtn.classList.add('expanded');
        refs.displaySliderContainer.style.maxHeight = '500px';
      } else {
        refs.displaySliderContainer.classList.add('collapsed');
        refs.displayToggleBtn.classList.remove('expanded');
        refs.displaySliderContainer.style.maxHeight = '';
      }
    });
  }

  if (refs.displayScaleSlider) {
    const slider = refs.displayScaleSlider;
    slider.value = String(options.getDisplayScale());

    const updateSliderProgress = (sliderInput: HTMLInputElement) => {
      const min = parseInt(sliderInput.min, 10);
      const max = parseInt(sliderInput.max, 10);
      const val = parseInt(sliderInput.value, 10);
      sliderInput.style.setProperty(
        '--slider-progress',
        `${(val - min) / (max - min)}`,
      );
    };

    updateSliderProgress(slider);
    slider.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      updateSliderProgress(target);
      document.documentElement.style.setProperty(
        '--display-scale',
        `${parseInt(target.value, 10) / 100}`,
      );
    });

    slider.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const value = parseInt(target.value, 10);
      options.setDisplayScale(value);
      localStorage.setItem('displayScale', String(value));
    });
  }

  if (refs.greetingNameInput) {
    refs.greetingNameInput.value = localStorage.getItem('greetingName') || '';
  }

  if (refs.greetingTypeSelect) {
    refs.greetingTypeSelect.value =
      localStorage.getItem('greetingType') || 'static';
  }

  if (refs.toggleSeconds) {
    refs.toggleSeconds.checked = localStorage.getItem('showSeconds') === 'true';
  }

  if (refs.toggle12Hour) {
    refs.toggle12Hour.checked = localStorage.getItem('use12Hour') === 'true';
  }

  if (refs.dateFormatSelect) {
    refs.dateFormatSelect.value = localStorage.getItem('dateFormat') || 'text';
  }

  if (refs.displayTypeSelect) {
    const savedPreset = localStorage.getItem('displayPreset') || 'greeting';
    refs.displayTypeSelect.value = savedPreset;

    const updateAdvancedUI = (preset: string) => {
      if (refs.subGreeting) refs.subGreeting.style.display = 'none';
      if (refs.subTime) refs.subTime.style.display = 'none';
      if (refs.subDate) refs.subDate.style.display = 'none';

      const hasAdvanced = ['greeting', 'time', 'date', 'advanced'].includes(
        preset,
      );
      if (refs.displayAdvancedSetting) {
        refs.displayAdvancedSetting.style.display = hasAdvanced
          ? 'flex'
          : 'none';
      }

      if (hasAdvanced && refs.displaySliderContainer && refs.displayToggleBtn) {
        if (!refs.displaySliderContainer.classList.contains('collapsed')) {
          refs.displaySliderContainer.classList.add('collapsed');
          refs.displayToggleBtn.classList.remove('expanded');
          refs.displaySliderContainer.style.maxHeight = '';
        }
      }

      if (preset === 'greeting' && refs.subGreeting)
        refs.subGreeting.style.display = 'flex';
      if (preset === 'time' && refs.subTime)
        refs.subTime.style.display = 'flex';
      if (preset === 'date' && refs.subDate)
        refs.subDate.style.display = 'flex';
      if (preset === 'advanced') {
        if (refs.subTime) refs.subTime.style.display = 'flex';
        if (refs.subDate) refs.subDate.style.display = 'flex';
      }
    };

    updateAdvancedUI(savedPreset);

    refs.displayTypeSelect.addEventListener('change', (e: Event) => {
      const target = getSelectTarget(e);
      if (!target) return;

      const preset = target.value;
      localStorage.setItem('displayPreset', preset);

      if (preset === 'greeting')
        localStorage.setItem('displayType', 'greeting');
      else if (preset === 'time') localStorage.setItem('displayType', 'time');
      else if (preset === 'date') localStorage.setItem('displayType', 'date');
      else if (preset === 'weekday')
        localStorage.setItem('displayType', 'weekday');
      else if (preset === 'advanced')
        localStorage.setItem('displayType', 'timedate');

      if (refs.toggleSeconds)
        refs.toggleSeconds.checked =
          localStorage.getItem('showSeconds') === 'true';
      if (refs.toggle12Hour)
        refs.toggle12Hour.checked =
          localStorage.getItem('use12Hour') === 'true';
      if (refs.dateFormatSelect)
        refs.dateFormatSelect.value =
          localStorage.getItem('dateFormat') || 'text';

      updateAdvancedUI(preset);

      if (refs.greetingWrapper) {
        refs.greetingWrapper.dataset.lastCache = '';
        options.initDisplayWidget(refs.greetingWrapper);
      }
    });
  }

  if (refs.toggleSeconds) {
    refs.toggleSeconds.addEventListener('change', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('showSeconds', String(target.checked));
      if (refs.greetingWrapper) options.initDisplayWidget(refs.greetingWrapper);
    });
  }

  if (refs.toggle12Hour) {
    refs.toggle12Hour.addEventListener('change', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('use12Hour', String(target.checked));
      if (refs.greetingWrapper) options.initDisplayWidget(refs.greetingWrapper);
    });
  }

  if (refs.dateFormatSelect) {
    refs.dateFormatSelect.addEventListener('change', (e: Event) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('dateFormat', target.value);
      if (refs.greetingWrapper) options.initDisplayWidget(refs.greetingWrapper);
    });
  }

  if (refs.greetingNameInput) {
    refs.greetingNameInput.addEventListener('input', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('greetingName', target.value);
      if (refs.greetingWrapper) {
        refs.greetingWrapper.dataset.lastCache = '';
        options.initDisplayWidget(refs.greetingWrapper);
      }
    });
  }

  if (refs.greetingTypeSelect) {
    refs.greetingTypeSelect.addEventListener('change', (e: Event) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('greetingType', target.value);
      if (refs.greetingWrapper) {
        refs.greetingWrapper.dataset.lastCache = '';
        options.initDisplayWidget(refs.greetingWrapper);
      }
    });
  }

  if (refs.displayTypeSelect) {
    refs.displayTypeSelect.dispatchEvent(new Event('change'));
  }
  if (refs.greetingTypeSelect) {
    refs.greetingTypeSelect.dispatchEvent(new Event('change'));
  }
  if (refs.dateFormatSelect) {
    refs.dateFormatSelect.dispatchEvent(new Event('change'));
  }
}

export function bindShortcutRadiusFeature(options: any): void {
  const toggleShortcuts = document.getElementById(
    'toggleShortcuts',
  ) as HTMLInputElement | null;
  const rowsInputGroup = document.getElementById('rowsInputGroup');
  const shortcutsMoreSetting = document.getElementById('shortcutsMoreSetting');
  const shortcutsGrid = document.getElementById('shortcutsGrid');

  if (toggleShortcuts) {
    const isVisible = localStorage.getItem('shortcutsVisible') !== 'false';
    toggleShortcuts.checked = isVisible;

    if (shortcutsGrid)
      shortcutsGrid.style.display = isVisible ? 'grid' : 'none';
    import('@/core/ui/ui-components').then(({ setCollapsible }) => {
      setCollapsible(rowsInputGroup, isVisible, false);
      setCollapsible(shortcutsMoreSetting, isVisible, false);
    });

    toggleShortcuts.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const checked = target.checked;
      localStorage.setItem('shortcutsVisible', String(checked));

      if (shortcutsGrid)
        shortcutsGrid.style.display = checked ? 'grid' : 'none';
      import('@/core/ui/ui-components').then(({ setCollapsible }) => {
        setCollapsible(rowsInputGroup, checked, true);
        setCollapsible(shortcutsMoreSetting, checked, true);
      });

      if (!checked) {
        if (refs.shortcutsMoreContainer) {
          refs.shortcutsMoreContainer.classList.add('collapsed');
          refs.shortcutsMoreContainer.style.maxHeight = '';
        }
        if (refs.shortcutsMoreBtn) {
          refs.shortcutsMoreBtn.classList.remove('expanded');
        }
      }
    });
  }

  if (refs.shortcutRadiusSlider && refs.shortcutRadiusRow) {
    const currentRadius = options.getShortcutRadius();
    refs.shortcutRadiusSlider.value = currentRadius;

    const updateSliderUI = (value: string) => {
      let valNum = parseInt(value, 10);
      if (valNum >= -3 && valNum <= 3) valNum = 0;
      const min = parseInt(refs.shortcutRadiusSlider.min, 10);
      const max = parseInt(refs.shortcutRadiusSlider.max, 10);
      refs.shortcutRadiusSlider.style.setProperty(
        '--slider-progress',
        `${(valNum - min) / (max - min)}`,
      );
    };

    updateSliderUI(currentRadius);

    const applyRadius = (valNum: number) => {
      const radiusValue =
        valNum === 0
          ? '0.7875rem'
          : valNum > 0
            ? `calc(0.7875rem + ((50% - 0.7875rem) * (${valNum} / 100)))`
            : `calc(0.7875rem - ((0.7875rem - 0.18rem) * (${-valNum} / 100)))`;
      document.documentElement.style.setProperty(
        '--shortcut-radius',
        radiusValue,
      );
    };

    refs.shortcutRadiusSlider.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      updateSliderUI(target.value);
      let finalVal = parseInt(target.value, 10);
      if (finalVal >= -3 && finalVal <= 3) finalVal = 0;
      applyRadius(finalVal);
    });

    refs.shortcutRadiusSlider.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      let finalVal = parseInt(target.value, 10);
      if (finalVal >= -3 && finalVal <= 3) finalVal = 0;
      options.setShortcutRadius(String(finalVal));
      localStorage.setItem('shortcutRadius', String(finalVal));
      applyRadius(finalVal);
    });
  }

  if (refs.toggleHideShortcutNames) {
    refs.toggleHideShortcutNames.checked = options.getHideShortcutNames();
    refs.toggleHideShortcutNames.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const isEnabled = target.checked;
      options.setHideShortcutNames(isEnabled);
      localStorage.setItem('hideShortcutNames', String(isEnabled));
      document
        .getElementById('shortcutsGrid')
        ?.setAttribute('data-hide-names', String(isEnabled));
    });
  }

  if (refs.shortcutsMoreBtn && refs.shortcutsMoreContainer) {
    refs.shortcutsMoreBtn.addEventListener('click', () => {
      const isCollapsed =
        refs.shortcutsMoreContainer.classList.contains('collapsed');
      if (isCollapsed) {
        refs.shortcutsMoreContainer.classList.remove('collapsed');
        refs.shortcutsMoreBtn.classList.add('expanded');
        refs.shortcutsMoreContainer.style.maxHeight = '500px';
      } else {
        refs.shortcutsMoreContainer.classList.add('collapsed');
        refs.shortcutsMoreBtn.classList.remove('expanded');
        refs.shortcutsMoreContainer.style.maxHeight = '';
      }
    });
  }

  if (refs.rowsSelect) {
    refs.rowsSelect.value = localStorage.getItem('shortcutsRows') || '2';
    refs.rowsSelect.dispatchEvent(new Event('change', { bubbles: true }));
    refs.rowsSelect.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      localStorage.setItem('shortcutsRows', target.value);
      if (options.setAllowedRows) {
        options.setAllowedRows(parseInt(target.value, 10));
      }
      if (options.triggerRender) options.triggerRender();
    });
  }
}

export function bindLauncherFeature(options: any): void {
  const toggleLauncher = document.getElementById(
    'toggleLauncher',
  ) as HTMLInputElement | null;
  const launcherSelectGroup = document.getElementById('launcherSelectGroup');

  if (toggleLauncher) {
    const isEnabled = options.getLauncherEnabled();
    toggleLauncher.checked = isEnabled;

    import('@/core/ui/ui-components').then(({ setCollapsible }) => {
      setCollapsible(launcherSelectGroup, isEnabled, false);
    });

    toggleLauncher.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const checked = target.checked;

      options.setLauncherEnabled(checked);
      localStorage.setItem('launcherEnabled', String(checked));

      import('@/core/ui/ui-components').then(({ setCollapsible }) => {
        setCollapsible(launcherSelectGroup, checked, true);
      });
      options.updateLauncherVisibility(checked);

      if (checked) {
        options.renderLauncher(options.getCurrentProvider());
      } else {
        const lms = document.getElementById('launcherMoreSetting');
        if (lms) {
          import('@/core/ui/ui-components').then(({ setCollapsible }) => {
            setCollapsible(lms, false, true);
          });
        }
      }
    });
  }

  if (refs.launcherProvider) {
    refs.launcherProvider.value = options.getCurrentProvider();
    refs.launcherProvider.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      const provider = target.value;
      options.setCurrentProvider(provider);
      localStorage.setItem('launcherProvider', provider);
      options.renderLauncher(provider);
    });

    if (options.getLauncherEnabled() && refs.appLauncherBtn) {
      let isLauncherLoaded = false;
      const loadLauncher = () => {
        if (isLauncherLoaded) return;
        isLauncherLoaded = true;
        options.renderLauncher(options.getCurrentProvider());
      };
      refs.appLauncherBtn.addEventListener('pointerover', loadLauncher, {
        once: true,
      });
      refs.appLauncherBtn.addEventListener('click', loadLauncher, {
        once: true,
      });
    }
  }
}

export function bindReduceEffectsFeature(): void {
  const toggleReduceEffects = document.getElementById(
    'toggleAccessibility',
  ) as HTMLInputElement | null;
  const accessibilityOptions = document.getElementById('accessibilityOptions');
  const toggleDisableAnimations = document.getElementById(
    'toggleDisableAnimations',
  ) as HTMLInputElement | null;

  const applyAnimationsDisabled = (disabled: boolean) => {
    if (disabled) {
      document.documentElement.classList.add('animations-disabled');
    } else {
      document.documentElement.classList.remove('animations-disabled');
    }
  };

  if (toggleReduceEffects) {
    const isReduced = localStorage.getItem('reducedEffectsEnabled') === 'true';
    toggleReduceEffects.checked = isReduced;

    if (isReduced)
      document.documentElement.setAttribute('data-reduce-effects', 'true');
    else document.documentElement.removeAttribute('data-reduce-effects');

    import('@/core/ui/ui-components').then(({ setCollapsible }) => {
      setCollapsible(accessibilityOptions, isReduced, false);
    });
    if (toggleDisableAnimations) {
      const animsDisabled =
        localStorage.getItem('animationsDisabled') === 'true';
      toggleDisableAnimations.checked = animsDisabled;
      toggleDisableAnimations.disabled = !isReduced;
      applyAnimationsDisabled(isReduced && animsDisabled);
    }

    toggleReduceEffects.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const value = target.checked;

      localStorage.setItem('reducedEffectsEnabled', String(value));

      if (value) {
        document.documentElement.setAttribute('data-reduce-effects', 'true');
      } else {
        document.documentElement.removeAttribute('data-reduce-effects');
        if (toggleDisableAnimations) {
          toggleDisableAnimations.checked = false;
          localStorage.setItem('animationsDisabled', 'false');
          applyAnimationsDisabled(false);
        }
      }

      import('@/core/ui/ui-components').then(({ setCollapsible }) => {
        setCollapsible(accessibilityOptions, value, true);
      });
      if (toggleDisableAnimations) toggleDisableAnimations.disabled = !value;
    });
  }

  if (toggleDisableAnimations) {
    toggleDisableAnimations.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const disabled = target.checked;
      localStorage.setItem('animationsDisabled', String(disabled));
      applyAnimationsDisabled(disabled);
    });
  }
}

export function bindMainUiScaleFeature(options: any): void {
  if (refs.mainUiScaleSlider) {
    const slider = refs.mainUiScaleSlider;
    slider.value = String(options.getMainUiScale());

    const updateSliderProgress = (sliderInput: HTMLInputElement) => {
      const min = parseFloat(sliderInput.min);
      const max = parseFloat(sliderInput.max);
      const val = parseFloat(sliderInput.value);
      sliderInput.style.setProperty(
        '--slider-progress',
        `${(val - min) / (max - min)}`,
      );
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

export function bindWallpaperFeature(
  options: any,
  getWallpaperEngine: () => Promise<any>,
): void {
  const autoColorBtn = document.querySelector(
    '.color-preset-btn.auto-preset',
  ) as HTMLButtonElement | null;
  if (autoColorBtn) autoColorBtn.disabled = !options.getWallpaperEnabled();

  if (refs.toggleWallpaper) {
    const isWallpaperEnabled =
      localStorage.getItem('wallpaperEnabled') === 'true';
    refs.toggleWallpaper.checked = isWallpaperEnabled;
    options.updateWallpaperUIState(isWallpaperEnabled, false);

    refs.toggleWallpaper.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const isEnabled = target.checked;
      options.setWallpaperEnabled(isEnabled);
      localStorage.setItem('wallpaperEnabled', String(isEnabled));
      options.updateWallpaperUIState(isEnabled, true);

      if (autoColorBtn) {
        autoColorBtn.disabled = !isEnabled;
        if (!isEnabled && autoColorBtn.classList.contains('selected')) {
          (
            document.querySelector(
              '.color-preset-btn[data-color="#0078d4"]',
            ) as HTMLButtonElement | null
          )?.click();
        }
      }
      const engine = await getWallpaperEngine();
      await engine.render({
        enabled: isEnabled,
        source: localStorage.getItem('wallpaperSource') || 'local',
        type: localStorage.getItem('wallpaperType') || 'upload',
        overlay: parseFloat(localStorage.getItem('wallpaperOverlay') || '0.2'),
      });
    });
  }

  if (refs.wallpaperSourceSelect) {
    const savedType = localStorage.getItem('wallpaperType') || 'upload';
    refs.wallpaperSourceSelect.value = savedType;

    const triggerValue = refs.wallpaperSourceContainer?.querySelector(
      '.fluent-select-value',
    );
    const selectedOption = refs.wallpaperSourceSelect.querySelector(
      `option[value="${savedType}"]`,
    );
    if (triggerValue && selectedOption) {
      triggerValue.textContent = selectedOption.textContent;
      const i18nKey = selectedOption.getAttribute('data-i18n');
      if (i18nKey) {
        triggerValue.setAttribute('data-i18n', i18nKey);
      } else {
        triggerValue.removeAttribute('data-i18n');
      }
    }

    const uploadContainer = document.getElementById('uploadWallpaperContainer');
    if (uploadContainer) {
      const wallpaperActive =
        localStorage.getItem('wallpaperEnabled') === 'true';
      uploadContainer.style.display =
        wallpaperActive && savedType === 'upload' ? 'flex' : 'none';
    }

    refs.wallpaperSourceSelect.addEventListener('change', async (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      const type = target.value as WallpaperType;
      const source: WallpaperSource = type === 'upload' ? 'local' : 'api';

      options.setWallpaperSource(source);
      options.setWallpaperType(type);
      options.saveWallpaperConfig();
      localStorage.setItem('wallpaperSource', source);
      localStorage.setItem('wallpaperType', type);

      if (uploadContainer)
        uploadContainer.style.display = type === 'upload' ? 'flex' : 'none';
      const overlay = parseFloat(
        localStorage.getItem('wallpaperOverlay') || '0.2',
      );

      if (source === 'api') {
        const apiName =
          type === 'bing'
            ? 'Bing Wallpaper'
            : type === 'nasa'
              ? 'NASA APOD'
              : 'Wikimedia';
        const learnMore =
          type === 'bing'
            ? 'https://peapix.com/'
            : type === 'nasa'
              ? 'https://apod.nasa.gov/'
              : 'https://commons.wikimedia.org/';

        import('@/core/ui/ui-components').then(
          ({ requestFeaturePermissionUI }) => {
            requestFeaturePermissionUI(
              type as any,
              apiName,
              learnMore,
              async () => {
                const engine = await getWallpaperEngine();
                await engine.render({
                  enabled: options.getWallpaperEnabled(),
                  source,
                  type,
                  overlay,
                });
              },
              () => {
                target.value = 'upload';
                options.setWallpaperSource('local');
                options.setWallpaperType('upload');
                options.saveWallpaperConfig();
                localStorage.setItem('wallpaperSource', 'local');
                localStorage.setItem('wallpaperType', 'upload');
                if (uploadContainer) uploadContainer.style.display = 'flex';
              },
            );
          },
        );
      } else {
        const engine = await getWallpaperEngine();
        await engine.render({
          enabled: options.getWallpaperEnabled(),
          source,
          type,
          overlay,
        });
      }
    });
  }

  if (refs.uploadInput) {
    refs.uploadWallpaperBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      refs.uploadInput.click();
    });
    refs.uploadInput.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;
      try {
        const { processWallpaperImage, saveWallpaperToDB } =
          await import('@/core/lazy/wallpaper-storage');
        const blob = await processWallpaperImage(file);
        await saveWallpaperToDB(blob);

        options.setWallpaperSource('local');
        options.setWallpaperType('upload');
        options.saveWallpaperConfig();
        localStorage.setItem('wallpaperSource', 'local');
        localStorage.setItem('wallpaperType', 'upload');
        const engine = await getWallpaperEngine();
        await engine.render({
          enabled: options.getWallpaperEnabled(),
          source: 'local',
          type: 'upload',
          overlay: parseFloat(
            localStorage.getItem('wallpaperOverlay') || '0.2',
          ),
        });
      } catch (error) {
        console.error('Failed to process image', error);
        alert('Error saving image. It might be too large.');
      }
      refs.uploadInput.value = '';
    });
  }

  if (refs.overlayToggleBtn && refs.overlaySliderContainer) {
    refs.overlayToggleBtn.addEventListener('click', () => {
      const isCollapsed =
        refs.overlaySliderContainer.classList.contains('collapsed');
      if (isCollapsed) {
        refs.overlaySliderContainer.classList.remove('collapsed');
        refs.overlayToggleBtn.classList.add('expanded');
        refs.overlaySliderContainer.style.maxHeight = '500px';
      } else {
        refs.overlaySliderContainer.classList.add('collapsed');
        refs.overlayToggleBtn.classList.remove('expanded');
        refs.overlaySliderContainer.style.maxHeight = '';
      }
    });
  }

  if (refs.overlaySlider) {
    const savedOverlay = localStorage.getItem('wallpaperOverlay') || '0.2';
    refs.overlaySlider.value = savedOverlay;

    const updateSliderProg = (slider: HTMLInputElement) => {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 0.7;
      const val = parseFloat(slider.value) || 0;
      slider.style.setProperty(
        '--slider-progress',
        String((val - min) / (max - min)),
      );
      document.documentElement.style.setProperty(
        '--overlay-opacity',
        String(val),
      );
    };

    updateSliderProg(refs.overlaySlider);

    refs.overlaySlider.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      updateSliderProg(target);
      getWallpaperEngine().then((engine) => {
        engine.updateOverlay(
          parseFloat(target.value),
          options.getWallpaperEnabled(),
        );
      });
    });

    refs.overlaySlider.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      const opacity = parseFloat(target.value);
      getWallpaperEngine().then((engine) => {
        engine.updateOverlay(opacity, options.getWallpaperEnabled());
      });
      localStorage.setItem('wallpaperOverlay', String(opacity));
    });
  }
}

export function resetSettingsAccordions(): void {
  const accordions = [
    { container: refs.displaySliderContainer, btn: refs.displayToggleBtn },
    { container: refs.shortcutsMoreContainer, btn: refs.shortcutsMoreBtn },
    { container: refs.overlaySliderContainer, btn: refs.overlayToggleBtn },
    { container: refs.accentMoreContainer, btn: refs.accentMoreBtn },
    { container: refs.searchMoreContainer, btn: refs.searchMoreBtn },
    { container: refs.weatherMoreContainer, btn: refs.weatherMoreBtn },
  ];

  accordions.forEach((acc) => {
    if (acc.container) {
      acc.container.classList.add('collapsed');
      acc.container.style.maxHeight = '';
    }
    if (acc.btn) acc.btn.classList.remove('expanded');
  });
}

export function closePopups(except: Element | null = null): void {
  if (refs.configPopup && refs.configPopup !== except) {
    refs.configPopup.classList.remove('active');
    resetSettingsAccordions();
  }
  if (refs.launcherPopup && refs.launcherPopup !== except) {
    refs.launcherPopup.classList.remove('active');
    if (refs.appLauncherBtn) refs.appLauncherBtn.classList.remove('active');
  }
  document.querySelectorAll('.shortcut-dropdown.active').forEach((menu) => {
    if (menu !== except) menu.classList.remove('active');
  });
  if (refs.dropdown && refs.dropdown !== except)
    refs.dropdown.classList.remove('active');

  const activeSelectTrigger = (window as any).activeSelectTrigger;
  if (activeSelectTrigger && activeSelectTrigger !== except) {
    const selectPopup = document.getElementById('fluent-select-popup');
    if (selectPopup && selectPopup !== except) {
      selectPopup.classList.remove('active');
      activeSelectTrigger.classList.remove('popup-open');
      (window as any).activeSelectTrigger = null;
    }
  }
}

export function initGlobalUiSystem(
  saveAndRender: () => void,
  updateLauncherFooter: () => void,
): void {
  if (refs.configBtn && refs.configPopup) {
    refs.configBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closePopups(refs.configPopup);
      refs.configPopup.classList.toggle('active');
      refs.configBtn?.classList.toggle('active');

      if (!(window as any).customSelectSystemInitialized) {
        (window as any).customSelectSystemInitialized = true;
        import('@/core/ui/fluent-select').then((m) => {
          m.initCustomSelectSystem();
        });
      }

      if (!refs.configPopup.classList.contains('active'))
        resetSettingsAccordions();
    });

    document.addEventListener('click', (e) => {
      const targetNode = e.target as Node | null;
      if (targetNode && refs.configPopup.classList.contains('active')) {
        if (
          !refs.configPopup.contains(targetNode) &&
          !refs.configBtn.contains(targetNode)
        ) {
          refs.configPopup.classList.remove('active');
          resetSettingsAccordions();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && refs.configPopup.classList.contains('active')) {
        refs.configPopup.classList.remove('active');
        resetSettingsAccordions();
      }
    });
  }

  if (refs.appLauncherBtn && refs.launcherPopup) {
    refs.appLauncherBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closePopups(refs.launcherPopup);
      refs.launcherPopup.classList.toggle('active');
      refs.appLauncherBtn?.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      const targetNode = e.target as Node | null;
      if (targetNode && refs.launcherPopup.classList.contains('active')) {
        if (
          !refs.launcherPopup.contains(targetNode) &&
          !refs.appLauncherBtn.contains(targetNode)
        ) {
          refs.launcherPopup.classList.remove('active');
          refs.appLauncherBtn.classList.remove('active');
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Escape' &&
        refs.launcherPopup.classList.contains('active')
      ) {
        refs.launcherPopup.classList.remove('active');
        refs.appLauncherBtn.classList.remove('active');
      }
    });
  }

  if (refs.toggleFolders) {
    refs.toggleFolders.checked = foldersEnabled;
    refs.toggleFolders.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.checked) {
        const hasFolders = shortcuts.some(
          (s: any) =>
            s.type === 'folder' ||
            (Array.isArray(s.children) && s.children.length > 0),
        );
        if (hasFolders) {
          import('@/core/ui/ui-components').then(({ warningModal }) => {
            warningModal.show({
              title: 'Disable Folders?',
              message:
                'All folders and their shortcuts will be deleted. This cannot be undone unless you have a backup.',
              confirmText: 'Delete Folders',
              cancelText: 'Keep Enabled',
              confirmVariant: 'danger',
              onConfirm: () => {
                const pruned = shortcuts.filter(
                  (item: any) =>
                    item.type !== 'folder' && !Array.isArray(item.children),
                );
                shortcuts.length = 0;
                shortcuts.push(...pruned);
                setFoldersEnabled(false);
                localStorage.setItem('foldersEnabled', 'false');
                updateLauncherFooter();
                saveAndRender();
              },
              onCancel: () => {
                target.checked = true;
              },
            });
          });
          return;
        }
      }
      setFoldersEnabled(target.checked);
      localStorage.setItem('foldersEnabled', String(target.checked));
      updateLauncherFooter();
    });
  }

  if (refs.exportBtn) {
    refs.exportBtn.addEventListener(
      'click',
      (e) => {
        import('@/core/lazy/backup').then((m) => {
          m.initBackupSystem();
          refs.exportBtn?.click();
        });
      },
      { once: true },
    );
  }

  if (refs.importBtn) {
    refs.importBtn.addEventListener(
      'click',
      (e) => {
        import('@/core/lazy/backup').then((m) => {
          m.initBackupSystem();
          refs.importBtn?.click();
        });
      },
      { once: true },
    );
  }
}
