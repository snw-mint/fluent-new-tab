/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file serves as the main entry point for the Fluent New Tab extension,
 * orchestrating all core functionalities, event bindings, and UI updates.
 */

import { initWeather, searchCity, updateWeatherVisibility } from './core/weather.js';
import {
  saveAndRender,
  deleteShortcut,
  updateShortcutsVisibility,
  renderShortcuts,
  updateSingleRowClass,
  getActiveShortcutsList,
  openModal,
  openChooseTypeModal,
  openFolderModal,
  openShortcutModal,
  closeModal,
  hideAllModals,
  setCustomIconVisibility,
  initCustomIconToggle,
  setFolderCustomIconVisibility,
  initFolderCustomIconToggle,
  syncShortcutDropdownState
} from './core/shortcuts.js';
import { initVanillaDragAndDrop } from './core/drag-drop.js';
import {
  renderLauncher,
  createFolderFromLauncher,
  getLauncherProviderKey,
  getLauncherFolderName,
  bindLauncherFolderButton,
  updateLauncherFooterVariant,
  updateLauncherVisibility
} from './core/launcher.js';
import { BackupPayload, ThemeMode } from './core/types.js';
import { displaySliderContainer, displayToggleBtn, shortcutsMoreContainer, shortcutsMoreBtn, overlaySliderContainer, overlayToggleBtn, accentMoreContainer, accentMoreBtn, searchMoreContainer, searchMoreBtn, weatherMoreContainer, configPopup, launcherPopup, appLauncherBtn, dropdown, currentIcon, searchForm, searchWrapper, toggleSearchBar, voiceSearchBtn, searchInput, toggleVoiceSearch, suggestionsContainer, reducedEffectsOptions, toggleReducedEffects, toggleDisableAnimations, toggleDisableBlur, wallpaperSourceContainer, wallpaperSourceSelect, wallpaperOverlaySetting, overlaySlider, toggleWallpaper, displayMainOptions, subGreeting, subTime, subDate, greetingWrapper, shortcutsGrid, toggleShortcuts, toggleFolders, cityInput, toggleFahrenheit, toggleLauncher, launcherProvider, tabFaviconUploadBtn, tabFaviconInput, tabNameInput, tabFaviconFileInput, toggleAppearance, askAiBtn, themeBtns, accentColorOptions, accentPresetsRow, accentCustomColor, toggleDisplay, rowsSelect, toggleSuggestions, toggleClearSearch, shortcutForm, displayTypeSelect, displayAdvancedSetting, displayScaleSlider, shortcutRadiusSlider, shortcutRadiusRow, toggleHideShortcutNames, toggleSeconds, toggle12Hour, dateFormatSelect, greetingNameInput, greetingTypeSelect, configBtn, closeModalBtn, inputFolderName, inputFolderIcon, engineBtn, items, searchBarStyleSelect, toggleAskAi, toggleWeather, saveCityBtn, toggleWeatherAlerts, mainUiScaleSlider, uploadInput, languageSelect, versionDisplay, exportBtn, importBtn, importInput } from './core/dom-references.js';
import { HOST_PERMISSIONS, checkPermission, requestPermission, fetchDailyWallpaper, fetchSuggestionsFromService } from './core/services.js';
import { engines, APP_KEYS } from './core/config.js';
import { searchBarVisible, compactBarEnabled, voiceSearchEnabled, wallpaperOverlay, currentWallpaperType, wallpaperEnabled, currentWallpaperSource, currentWallpaperValue, suggestionsCache, clearSearchEnabled, currentFolderId, allowedRows, savedEngine, shortcutsVisible, foldersEnabled, reducedEffectsEnabled, animationsDisabled, blurDisabled, currentCityData, weatherUnit, weatherEnabled, launcherEnabled, currentProvider, accentColorEnabled, tabName, tabFavicon, askAiEnabled, sfxMicInstance, sfxAskAiInstance, askAiMode, shortcuts, suggestionsActive, editingIndex, displayScale, shortcutRadius, hideShortcutNames, weatherAlertsEnabled, mainUiScale } from './core/state.js';
import { renderSuggestionsUI, clearSuggestionsUI, updateSuggestionSelectionUI, applyGoogleSearchParams, performSearch } from './core/search.js';
import { getWallpaperFromDB, saveWallpaperToDB, convertImageToWebp, processWallpaperImage } from './core/wallpaper-storage.js';
import { handleAutoAccentColor, applyInitialTheme, applyTheme, applyInitialAccentColorState, applyAccentColor } from './core/color.js';
import { initDisplayWidget } from './core/display.js';
import { getById, getInputTarget, getInputById, getSelectTarget, getLocalizedWarningText } from './core/dom-utils.js';
import { warningModal, requestFeaturePermissionUI } from './core/ui-components.js';
import {
  bindWeatherFeature,
  bindAccentColorFeature,
  bindLauncherFeature,
  bindSearchFeature,
  bindDisplayFeature,
  bindShortcutRadiusFeature,
  bindMainUiScaleFeature,
  bindWallpaperFeature
} from './core/event-bindings.js';

function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait: number,
): (...args: T) => void {
  let timeout: number;
  return function (...args: T): void {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

function isValidBackupPayload(data: unknown): data is BackupPayload {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value !== 'string') {
        return false;
      }
    }
  }
  return true;
}

function applyMagneticSnap(
  sliderId: string,
  defaultValue: number,
  snapThreshold = 5,
): void {
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  if (!slider) return;

  slider.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    const currentValue = parseFloat(target.value);

    if (Math.abs(currentValue - defaultValue) <= snapThreshold) {
      target.value = defaultValue.toString();
    }
    const min = parseFloat(target.min || '0');
    const max = parseFloat(target.max || '100');
    const progress = (parseFloat(target.value) - min) / (max - min || 1);
    target.style.setProperty('--slider-progress', progress.toString());
  });

  slider.addEventListener('dblclick', (event) => {
    const target = event.target as HTMLInputElement;
    target.value = defaultValue.toString();

    const min = parseFloat(target.min || '0');
    const max = parseFloat(target.max || '100');
    const progress = (parseFloat(target.value) - min) / (max - min || 1);
    target.style.setProperty('--slider-progress', progress.toString());
    target.dispatchEvent(new Event('input'));
    target.dispatchEvent(new Event('change'));
  });
}

function resetSettingsAccordions(): void {
  try {
    const accordions = [
      { container: displaySliderContainer, btn: displayToggleBtn },
      { container: shortcutsMoreContainer, btn: shortcutsMoreBtn },
      { container: overlaySliderContainer, btn: overlayToggleBtn },
      { container: accentMoreContainer, btn: accentMoreBtn },
      { container: searchMoreContainer, btn: searchMoreBtn },
      {
        container: weatherMoreContainer,
        btn: document.getElementById('weather-more-btn'),
      },
    ];

    accordions.forEach((acc) => {
      if (acc.container) {
        acc.container.classList.add('collapsed');
        acc.container.style.maxHeight = '';
      }
      if (acc.btn) {
        acc.btn.classList.remove('expanded');
      }
    });
  } catch (error) {
    console.error('Erro ao resetar acordeões:', error);
  }
}

export function closePopups(except: Element | null = null): void {
  if (configPopup && configPopup !== except) {
    configPopup.classList.remove('active');
    resetSettingsAccordions();
  }
  if (launcherPopup && launcherPopup !== except) {
    launcherPopup.classList.remove('active');
    if (appLauncherBtn) appLauncherBtn.classList.remove('active');
  }
  document.querySelectorAll('.shortcut-dropdown.active').forEach((menu) => {
    if (menu !== except) menu.classList.remove('active');
  });
  if (dropdown && dropdown !== except) dropdown.classList.remove('active');

  if (activeSelectTrigger && activeSelectTrigger !== except) {
    const selectPopup = document.getElementById('fluent-select-popup');
    if (selectPopup && selectPopup !== except) {
      selectPopup.classList.remove('active');
      activeSelectTrigger.classList.remove('popup-open');
      activeSelectTrigger = null;
    }
  }

  syncShortcutDropdownState();
}







function setSearchEngine(engineKey: keyof typeof engines): void {
  const config = engines[engineKey];
  if (config) {
    if (currentIcon) {
      currentIcon.src = config.icon;
      currentIcon.onerror = () => {
        currentIcon.style.display = 'none';
      };
      currentIcon.onload = () => {
        currentIcon.style.display = 'block';
      };
    }
    if (searchForm) searchForm.action = config.url;
    updateGoogleParams();
  }
}

function updateSearchSettings(animate = true): void {
  if (searchWrapper) {
    searchWrapper.style.display = searchBarVisible ? '' : 'none';
  }
  if (toggleSearchBar) {
    toggleSearchBar.checked = searchBarVisible;
  }

  const searchMainOptions = document.getElementById('searchMainOptions');
  if (searchMainOptions) {
    setCollapsible(searchMainOptions, searchBarVisible, animate);
  }

  updateVoiceSearchAvailability();
  updateAskAiBtnVisibility();
}

function updateCompactBarStyle(): void {
  if (searchWrapper) {
    if (compactBarEnabled) searchWrapper.classList.add('compact');
    else searchWrapper.classList.remove('compact');
  }
}
const SpeechRecognitionCtor =
  (
    window as Window & {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    }
  ).SpeechRecognition ||
  (
    window as Window & {
      webkitSpeechRecognition?: new () => any;
    }
  ).webkitSpeechRecognition;

const voiceSearchSupported = typeof SpeechRecognitionCtor === 'function';
let voiceRecognition: any = null;
let voiceRecording = false;
let voiceShouldSubmitOnEnd = false;
let voiceFinalTranscript = '';
let voiceSilenceTimeout: number | null = null;
let isVoiceTransitioning = false;
const VOICE_SILENCE_MS = 8000;

function stopVoiceRingAnimation(): void {
  if (!searchWrapper) return;
  searchWrapper.classList.remove('voice-active');
}

function startVoiceRingAnimation(): void {
  if (!searchWrapper) return;
  searchWrapper.classList.add('voice-active');
}

function playVoiceStartSound(): void {
  const sfx = getSfx('mic');
  if (!sfx) return;
  sfx.currentTime = 0;
  sfx.play().catch(() => {});
}

function updateVoiceButtonRecordingState(): void {
  if (!voiceSearchBtn) return;
  voiceSearchBtn.classList.toggle('recording', voiceRecording);
  voiceSearchBtn.setAttribute(
    'aria-pressed',
    voiceRecording ? 'true' : 'false',
  );
}

function normalizeVoiceLanguage(code: string | null | undefined): string {
  if (!code) return '';
  const normalized = code.replace('_', '-').trim();
  if (!normalized) return '';
  try {
    const canonical = Intl.getCanonicalLocales([normalized])[0];
    return canonical || '';
  } catch {
    return '';
  }
}

function getVoiceRecognitionLanguage(): string {
  const fromBrowser = normalizeVoiceLanguage(navigator.language);
  if (fromBrowser) return fromBrowser;
  return 'en-US';
}

function clearVoiceSilenceTimer(): void {
  if (voiceSilenceTimeout === null) return;
  window.clearTimeout(voiceSilenceTimeout);
  voiceSilenceTimeout = null;
}

function scheduleVoiceSilenceStop(): void {
  clearVoiceSilenceTimer();
  voiceSilenceTimeout = window.setTimeout(() => {
    if (!voiceRecording) return;
    stopVoiceSearch(true);
  }, VOICE_SILENCE_MS);
}

function stopVoiceSearch(submitAfterStop = false): void {
  voiceShouldSubmitOnEnd = submitAfterStop;
  if (!voiceRecording || !voiceRecognition) return;
  isVoiceTransitioning = true;
  try {
    voiceRecognition.stop();
  } catch {
    isVoiceTransitioning = false;
  }
}

function ensureVoiceRecognition(): any {
  if (!voiceSearchSupported || !SpeechRecognitionCtor) return null;

  if (voiceRecognition) {
    try {
      voiceRecognition.onstart = null;
      voiceRecognition.onresult = null;
      voiceRecognition.onerror = null;
      voiceRecognition.onend = null;
      voiceRecognition.abort();
    } catch {}
  }

  voiceRecognition = new SpeechRecognitionCtor();
  voiceRecognition.interimResults = false;
  voiceRecognition.continuous = false;
  voiceRecognition.maxAlternatives = 1;

  voiceRecognition.onstart = () => {
    voiceRecording = true;
    isVoiceTransitioning = false;
    updateVoiceButtonRecordingState();
    startVoiceRingAnimation();
    scheduleVoiceSilenceStop();
  };

  voiceRecognition.onresult = (event: any) => {
    if (!searchInput) return;
    let finalTranscript = '';

    for (
      let index = event.resultIndex;
      index < event.results.length;
      index += 1
    ) {
      const result = event.results[index];
      const transcript = result[0]?.transcript?.trim() || '';
      if (!transcript) continue;

      if (result.isFinal) {
        finalTranscript = `${finalTranscript} ${transcript}`.trim();
      }
    }

    if (finalTranscript) {
      voiceFinalTranscript = finalTranscript;
      searchInput.value = finalTranscript;
    }
    scheduleVoiceSilenceStop();
  };

  voiceRecognition.onerror = () => {
    voiceShouldSubmitOnEnd = false;
    clearVoiceSilenceTimer();
    isVoiceTransitioning = false;
  };

  voiceRecognition.onend = () => {
    const shouldSubmit = voiceShouldSubmitOnEnd;
    voiceRecording = false;
    voiceShouldSubmitOnEnd = false;
    isVoiceTransitioning = false;
    clearVoiceSilenceTimer();
    updateVoiceButtonRecordingState();
    stopVoiceRingAnimation();

    const finalQuery = searchInput?.value.trim() || voiceFinalTranscript.trim();
    voiceFinalTranscript = '';

    if (shouldSubmit && finalQuery && searchForm) {
      clearSuggestions();
      if (typeof searchForm.requestSubmit === 'function') {
        searchForm.requestSubmit();
      } else {
        searchForm.submit();
      }
    }
  };

  return voiceRecognition;
}

function startVoiceSearch(): void {
  if (
    !voiceSearchEnabled ||
    !voiceSearchSupported ||
    !searchBarVisible ||
    isVoiceTransitioning
  )
    return;

  if (voiceRecording) {
    stopVoiceSearch(false);
    return;
  }

  const recognition = ensureVoiceRecognition();
  if (!recognition) return;

  voiceFinalTranscript = '';
  voiceShouldSubmitOnEnd = true;
  recognition.lang = getVoiceRecognitionLanguage();

  playVoiceStartSound();
  startVoiceRingAnimation();
  scheduleVoiceSilenceStop();

  try {
    isVoiceTransitioning = true;
    recognition.start();
  } catch (error) {
    console.warn('Unable to start voice recognition.', error);
    voiceShouldSubmitOnEnd = false;
    isVoiceTransitioning = false;
    stopVoiceRingAnimation();
  }
}

function updateVoiceSearchAvailability(): void {
  const canUseVoice =
    voiceSearchEnabled && searchBarVisible && voiceSearchSupported;
  if (voiceSearchBtn) {
    voiceSearchBtn.style.display = canUseVoice ? 'flex' : 'none';
    voiceSearchBtn.disabled = !canUseVoice;
  }

  if (toggleVoiceSearch) {
    toggleVoiceSearch.disabled = !voiceSearchSupported;
    toggleVoiceSearch.title = voiceSearchSupported
      ? ''
      : 'Voice recognition is not supported in this browser.';
  }

  if (!canUseVoice) {
    if (voiceRecording) stopVoiceSearch(false);
    stopVoiceRingAnimation();
  }
}
function renderSuggestions(suggestions: string[]): void {
  renderSuggestionsUI(
    suggestions,
    {
      suggestionsContainer,
      searchInput,
      searchForm,
      searchWrapper,
    },
    clearSuggestions,
  );
}

function clearSuggestions(): void {
  clearSuggestionsUI(suggestionsContainer, searchWrapper);
}

function updateSelection(items: HTMLElement[], index: number): void {
  updateSuggestionSelectionUI(items, index, searchInput);
}





function updateReducedEffectsVisibility(
  enabled: boolean,
  animate = true,
): void {
  if (reducedEffectsOptions)
    setCollapsible(reducedEffectsOptions, enabled, animate);
  if (toggleReducedEffects) toggleReducedEffects.checked = enabled;
  [toggleDisableAnimations, toggleDisableBlur].forEach((input) => {
    if (!input) return;
    input.disabled = !enabled;
  });
}

function updateWallpaperUIState(enabled: boolean, animate = true): void {
  const container =
    wallpaperSourceContainer ||
    (wallpaperSourceSelect
      ? wallpaperSourceSelect.closest('.wallpaper-source-options')
      : null);
  if (container) {
    setCollapsible(container, enabled, animate);
  } else if (wallpaperSourceSelect) {
    wallpaperSourceSelect.dataset.collapsibleDisplay = 'block';
    setCollapsible(wallpaperSourceSelect, enabled, animate);
    const label = (document.querySelector(
      `label[for="${wallpaperSourceSelect.id}"]`,
    ) ||
      (wallpaperSourceSelect.previousElementSibling &&
      wallpaperSourceSelect.previousElementSibling.tagName === 'LABEL'
        ? wallpaperSourceSelect.previousElementSibling
        : null)) as HTMLElement | null;
    if (label) setCollapsible(label, enabled, animate);
  }

  const overlaySetting =
    wallpaperOverlaySetting ||
    (overlaySliderContainer?.closest(
      '.collapsible-setting',
    ) as HTMLElement | null);
  if (overlaySetting) {
    overlaySetting.dataset.collapsibleDisplay = 'flex';
    setCollapsible(overlaySetting, enabled, animate);
  }

  if (overlaySlider) updateOverlaySliderProgress(overlaySlider);
  setOverlayOpacity(wallpaperOverlay, false);
  if (toggleWallpaper) {
    const row = toggleWallpaper.closest('.switch-row');
    if (row) (row as HTMLElement).style.marginBottom = enabled ? '' : '0';
  }

  const uploadContainer = document.getElementById('uploadWallpaperContainer');
  if (uploadContainer) {
    if (!enabled || currentWallpaperType !== 'upload') {
      uploadContainer.style.display = 'none';
    } else {
      uploadContainer.style.display = 'flex';
    }
  }
}

function updateDisplaySettingsVisibility(show: boolean, animate = true): void {
  if (displayMainOptions) setCollapsible(displayMainOptions, show, animate);
}

function updateDisplaySubSettingsUI(preset: string): void {
  if (subGreeting) subGreeting.style.display = 'none';
  if (subTime) subTime.style.display = 'none';
  if (subDate) subDate.style.display = 'none';
  if (preset === 'greeting' && subGreeting) {
    subGreeting.style.display = 'flex';
  } else if (preset === 'timedate') {
    if (subTime) subTime.style.display = 'flex';
    if (subDate) subDate.style.display = 'flex';
  }
}

function updateAnimationsDisabled(enabled: boolean): void {
  document.body.classList.toggle('animations-disabled', enabled);
}

function updateBlurDisabled(enabled: boolean): void {
  document.body.classList.toggle('blur-reduced', enabled);
}

function prepareCollapsible(element: HTMLElement | null): void {
  if (!element || element.dataset.collapsibleReady === 'true') return;
  const previousDisplay = element.style.display;
  if (previousDisplay === 'none') {
    element.style.display = '';
  }
  let computedDisplay = window.getComputedStyle(element).display;
  if (computedDisplay === 'none') {
    computedDisplay = element.dataset.collapsibleDisplay || 'block';
  }
  if (previousDisplay === 'none') {
    element.style.display = previousDisplay;
  }
  const computedStyles = window.getComputedStyle(element);
  element.dataset.originalDisplay = computedDisplay;
  element.dataset.originalMarginTop = computedStyles.marginTop;
  element.dataset.originalMarginBottom = computedStyles.marginBottom;
  element.dataset.originalPaddingTop = computedStyles.paddingTop;
  element.dataset.originalPaddingBottom = computedStyles.paddingBottom;
  element.classList.add('collapsible-section');
  element.dataset.collapsibleReady = 'true';
}

function setCollapsible(
  element: HTMLElement | null,
  shouldExpand: boolean,
  animate = true,
): void {
  if (!element) return;
  if (document.body.classList.contains('animations-disabled')) {
    animate = false;
  }
  prepareCollapsible(element);

  const restoreSpacing = () => {
    element.style.marginTop = element.dataset.originalMarginTop;
    element.style.marginBottom = element.dataset.originalMarginBottom;
    element.style.paddingTop = element.dataset.originalPaddingTop;
    element.style.paddingBottom = element.dataset.originalPaddingBottom;
  };

  const transitionValue =
    'height 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), margin 0.28s ease, padding 0.28s ease';
  const currentState = element.dataset.state || 'open';

  if (!animate) {
    element.style.transition = 'none';
    if (shouldExpand) {
      element.style.display = element.dataset.originalDisplay;
      restoreSpacing();
      element.style.height = 'auto';
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.style.pointerEvents = 'auto';
      element.style.overflow = '';
      element.dataset.state = 'open';
    } else {
      element.style.display = element.dataset.originalDisplay;
      element.style.height = '0px';
      element.style.opacity = '0';
      element.style.transform = 'scaleY(0.98) translateY(-6px)';
      element.style.pointerEvents = 'none';
      element.style.overflow = 'hidden';
      element.style.marginTop = '0px';
      element.style.marginBottom = '0px';
      element.style.paddingTop = '0px';
      element.style.paddingBottom = '0px';
      element.dataset.state = 'closed';
    }
    requestAnimationFrame(() => {
      element.style.transition = '';
    });
    return;
  }

  element.style.transition = transitionValue;

  if (shouldExpand) {
    if (currentState === 'open') return;
    element.dataset.state = 'animating';
    element.style.display = element.dataset.originalDisplay;
    element.style.pointerEvents = 'none';
    element.style.overflow = 'hidden';

    restoreSpacing();
    const targetHeight = element.scrollHeight;

    element.style.height = '0px';
    element.style.opacity = '0';
    element.style.transform = 'scaleY(0.98) translateY(-6px)';
    element.style.marginTop = '0px';
    element.style.marginBottom = '0px';
    element.style.paddingTop = '0px';
    element.style.paddingBottom = '0px';

    requestAnimationFrame(() => {
      element.style.height = `${targetHeight}px`;
      element.style.opacity = '1';
      element.style.transform = 'scaleY(1) translateY(0)';
      restoreSpacing();
    });

    const onExpandEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'height') return;
      element.style.height = 'auto';
      element.style.overflow = '';
      element.style.pointerEvents = 'auto';
      element.dataset.state = 'open';
      element.style.transition = '';
      element.removeEventListener('transitionend', onExpandEnd);
    };
    element.addEventListener('transitionend', onExpandEnd);
  } else {
    if (currentState === 'closed') return;
    element.dataset.state = 'animating';
    element.style.overflow = 'hidden';
    element.style.pointerEvents = 'none';

    restoreSpacing();
    const startHeight = element.scrollHeight;
    element.style.height = `${startHeight}px`;
    element.style.opacity = '1';
    element.style.transform = 'scaleY(1) translateY(0)';

    requestAnimationFrame(() => {
      element.style.height = '0px';
      element.style.opacity = '0';
      element.style.transform = 'scaleY(0.98) translateY(-6px)';
      element.style.marginTop = '0px';
      element.style.marginBottom = '0px';
      element.style.paddingTop = '0px';
      element.style.paddingBottom = '0px';
    });

    const onCollapseEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'height') return;
      element.dataset.state = 'closed';
      element.style.transition = '';
      element.style.overflow = 'hidden';
      element.removeEventListener('transitionend', onCollapseEnd);
    };
    element.addEventListener('transitionend', onCollapseEnd);
  }
}

function updateOverlaySliderProgress(slider: HTMLInputElement): void {
  const value = parseFloat(slider.value);
  const min = parseFloat(slider.min || '0');
  const max = parseFloat(slider.max || '0.9');
  const range = max - min || 1;
  const progress = (value - min) / range;
  slider.style.setProperty('--slider-progress', `${progress}`);
}

const MAX_OVERLAY_OPACITY = 0.7;

function setOverlayOpacity(value: string, persist = false): void {
  const parsed = Math.min(
    Math.max(parseFloat(value) || 0, 0),
    MAX_OVERLAY_OPACITY,
  );
  const normalized = parsed.toString();
  wallpaperOverlay = normalized;
  if (persist) localStorage.setItem('wallpaperOverlay', normalized);

  const targetValue = wallpaperEnabled ? normalized : '0';
  document.documentElement.style.setProperty('--overlay-opacity', targetValue);
  if (document.body) {
    document.body.style.setProperty('--overlay-opacity', targetValue);
  }

  if (overlaySlider && overlaySlider.value !== normalized) {
    overlaySlider.value = normalized;
    updateOverlaySliderProgress(overlaySlider);
  }
}

function saveWallpaperConfig(): void {
  localStorage.setItem('wallpaperSource', currentWallpaperSource);
  localStorage.setItem('wallpaperType', currentWallpaperType);
  localStorage.setItem('wallpaperValue', currentWallpaperValue);
}
let currentWallpaperObjectUrl: string | null = null;

function clearEarlyWallpaperBootstrap(): void {
  const earlyStyle = document.getElementById('early-wallpaper-style');
  if (earlyStyle) earlyStyle.remove();
  document.documentElement.removeAttribute('data-early-wallpaper');
  const fadeEl = document.getElementById('wallpaper-fade');
  if (fadeEl) {
    fadeEl.classList.add('hidden');
    setTimeout(() => fadeEl.remove(), 400);
  }
}

async function applyWallpaperImage(url: string): Promise<void> {
  if (
    currentWallpaperObjectUrl &&
    currentWallpaperObjectUrl.startsWith('blob:') &&
    currentWallpaperObjectUrl !== url
  ) {
    URL.revokeObjectURL(currentWallpaperObjectUrl);
  }

  currentWallpaperObjectUrl = url.startsWith('blob:') ? url : null;

  document.body.style.backgroundImage = `url('${url}')`;
}

async function getOptimizedApiWallpaper(
  remoteUrl: string,
  source: string,
): Promise<string> {
  const cacheKey = `api_wallpaper_${source}`;
  const urlCacheKey = `${cacheKey}_url`;
  const lastProcessedUrl = localStorage.getItem(urlCacheKey);

  if (lastProcessedUrl === remoteUrl) {
    try {
      const cachedBlob = await getWallpaperFromDB(cacheKey);
      if (cachedBlob) {
        return URL.createObjectURL(cachedBlob);
      }
    } catch (e) {
      console.warn(
        '[Wallpaper] Failed to read from IndexedDB, re-fetching.',
        e,
      );
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);
    const response = await fetch(remoteUrl, { signal: controller.signal });
    window.clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const blob = await response.blob();
    console.log(
      `[Wallpaper] ${source} raw size: ${(blob.size / 1024 / 1024).toFixed(1)}MB`,
    );

    if (blob.size > 8 * 1024 * 1024) {
      console.warn(`[Wallpaper] Image too large, skipping WebP conversion.`);
      await saveWallpaperToDB(blob, cacheKey);
      localStorage.setItem(urlCacheKey, remoteUrl);
      return URL.createObjectURL(blob);
    }

    const tempUrl = URL.createObjectURL(blob);
    const webpBlob = await convertImageToWebp(tempUrl, 3840, 0.85);
    URL.revokeObjectURL(tempUrl);

    await saveWallpaperToDB(webpBlob, cacheKey);
    localStorage.setItem(urlCacheKey, remoteUrl);

    return URL.createObjectURL(webpBlob);
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    console.warn(
      `[Wallpaper] ${isAbort ? 'Timeout' : 'Compression failed'} for ${source}, using original URL.`,
      error,
    );
    return remoteUrl;
  }
}

async function applyWallpaperLogic() {
  try {
    setOverlayOpacity(wallpaperOverlay, false);
    if (!wallpaperEnabled) {
      document.body.style.backgroundImage = 'none';
      document.body.removeAttribute('data-wallpaper-active');
      updateCreditsUI('none');
      return;
    }

    document.body.setAttribute('data-wallpaper-active', 'true');
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';

    if (currentWallpaperSource === 'local') {
      updateCreditsUI('local');
      if (currentWallpaperType === 'upload') {
        await loadCustomWallpaper();
      } else {
        document.body.style.backgroundImage = 'none';
        document.body.removeAttribute('data-wallpaper-active');
      }
    } else if (currentWallpaperSource === 'api') {
      let isFetching = true;
      const noticeTimeout = setTimeout(() => {
        if (isFetching) showFetchingNotice(currentWallpaperType);
      }, 350);

      try {
        const url = await fetchDailyWallpaper(currentWallpaperType);

        if (url) {
          const optimizedUrl = await getOptimizedApiWallpaper(
            url,
            currentWallpaperType,
          );
          await applyWallpaperImage(optimizedUrl);
          void handleAutoAccentColor(
            optimizedUrl,
            `api_${currentWallpaperType}_${url}`,
          );

          const cacheKey = `wallpaper_cache_${currentWallpaperType}`;
          try {
            const cached = JSON.parse(
              localStorage.getItem(cacheKey) || 'null',
            ) as any;
            let credit = cached ? cached.credit : '';
            let creditUrl = cached ? cached.creditUrl : '';

            if (!credit) {
              if (currentWallpaperType === 'bing') credit = 'Microsoft Bing';
              else if (currentWallpaperType === 'nasa') credit = 'NASA APOD';
              else if (currentWallpaperType === 'wikimedia')
                credit = 'Wikimedia Commons';
            }
            updateCreditsUI('api', credit, creditUrl);
          } catch (e) {
            updateCreditsUI('api', 'Daily Wallpaper');
          }
        } else {
          const cacheKey = `wallpaper_cache_${currentWallpaperType}`;
          const apiCacheKey = `api_wallpaper_${currentWallpaperType}`;
          try {
            const cachedBlob = await getWallpaperFromDB(apiCacheKey);
            if (cachedBlob) {
              const blobUrl = URL.createObjectURL(cachedBlob);
              await applyWallpaperImage(blobUrl);
              const cached = JSON.parse(
                localStorage.getItem(cacheKey) || 'null',
              ) as any;
              if (cached?.credit) {
                updateCreditsUI('api', cached.credit, cached.creditUrl || '');
              } else {
                updateCreditsUI('api', 'Daily Wallpaper');
              }
            } else {
              document.body.style.backgroundImage = 'none';
              document.body.removeAttribute('data-wallpaper-active');
              updateCreditsUI('none');
            }
          } catch (e) {
            document.body.style.backgroundImage = 'none';
            document.body.removeAttribute('data-wallpaper-active');
            updateCreditsUI('none');
          }
        }
      } finally {
        isFetching = false;
        clearTimeout(noticeTimeout);
        hideFetchingNotice();
      }
    }
  } finally {
    clearEarlyWallpaperBootstrap();
  }
}

async function loadCustomWallpaper() {
  const body = document.body;
  try {
    const blob = await getWallpaperFromDB();
    if (blob) {
      const url = URL.createObjectURL(blob);
      await applyWallpaperImage(url);
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';

      void handleAutoAccentColor(url, `upload_${blob.size}`);
    } else {
      console.warn('No custom wallpaper found.');
      body.style.backgroundImage = 'none';
      body.removeAttribute('data-wallpaper-active');
    }
  } catch (e) {
    console.error('Failed to load wallpaper:', e);
    body.style.backgroundImage = 'none';
    body.removeAttribute('data-wallpaper-active');
  }
}

function initBrand() {
  initDisplayWidget(greetingWrapper);
}

function fetchSuggestions(query: string): void {
  fetchSuggestionsFromService(query).then((suggestions) => {
    if (
      !searchInput ||
      searchInput.value.trim().toLowerCase() !== query.toLowerCase()
    )
      return;
    suggestionsCache.set(query.toLowerCase(), suggestions);
    renderSuggestions(suggestions);
  });
}

function updateGoogleParams() {
  const currentEngine = localStorage.getItem('searchEngine') || 'bing';
  applyGoogleSearchParams(searchForm, currentEngine, clearSearchEnabled);
}



const MAX_MAIN_GRID_ITEMS = 40;
const MAX_FOLDER_GRID_ROWS = 4;
const MAX_FOLDER_CAPACITY = MAX_FOLDER_GRID_ROWS * 10 - 1;

function deriveShortcutNameFromUrl(rawUrl: string): string {
  try {
    const host = new URL(rawUrl).hostname.replace(/^www\./i, '');
    if (!host) return 'New Shortcut';
    const name = host.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return 'New Shortcut';
  }
}

function showGridLimitWarning(
  currentLimit: number,
  isFolderGrid: boolean,
): void {
  const title = isFolderGrid
    ? getLocalizedWarningText('warningFolderFullTitle', 'Folder is Full')
    : getLocalizedWarningText('warningGridFullTitle', 'Grid is Full');
  const message = isFolderGrid
    ? getLocalizedWarningText(
        'warningFolderFullMessage',
        'This folder has reached the absolute limit of $LIMIT$ items. Please remove some shortcuts before adding new ones.',
        { LIMIT: String(currentLimit) },
      )
    : getLocalizedWarningText(
        'warningGridFullMessage',
        'You have reached the maximum limit of $LIMIT$ shortcuts on the main screen. Delete some items or group them into a folder to free up space.',
        { LIMIT: String(currentLimit) },
      );

  warningModal.show({
    title,
    message,
    confirmText: getLocalizedWarningText('warningUnderstood', 'Understood'),
    cancelText: getLocalizedWarningText('warningClose', 'Close'),
    confirmVariant: 'accent',
    onConfirm: () => {},
  });
}

function bindExternalShortcutDrop(): void {
  if (!shortcutsGrid) return;

  shortcutsGrid.addEventListener('dragover', (event) => {
    if (!event.dataTransfer) return;
    const hasUrl = Array.from(event.dataTransfer.types).some(
      (type) =>
        type === 'text/uri-list' ||
        type === 'text/plain' ||
        type === 'text/html',
    );
    if (!hasUrl) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });

  shortcutsGrid.addEventListener('drop', (event) => {
    event.preventDefault();

    if (shortcutsGrid.classList.contains('sorting')) return;
    if (!event.dataTransfer) return;

    const targetArray = getActiveShortcutsList();
    const isFolderGrid = Boolean(currentFolderId);
    const effectiveLimit = isFolderGrid
      ? MAX_FOLDER_CAPACITY
      : Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);

    if (targetArray.length >= effectiveLimit) {
      showGridLimitWarning(effectiveLimit, isFolderGrid);
      return;
    }

    let droppedUrl =
      event.dataTransfer.getData('text/uri-list') ||
      event.dataTransfer.getData('text/plain');
    let droppedName = '';

    const htmlData = event.dataTransfer.getData('text/html');
    if (htmlData) {
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(htmlData, 'text/html');
      const anchor = parsedDoc.querySelector('a');

      if (anchor) {
        droppedUrl = anchor.href || droppedUrl;
        droppedName = anchor.textContent?.trim() || '';
      }
    }

    if (!droppedUrl || !/^https?:\/\//i.test(droppedUrl)) return;

    try {
      const parsedHost = new URL(droppedUrl).hostname.toLowerCase();
      const cleanedName = droppedName
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');

      if (
        cleanedName === parsedHost ||
        cleanedName === droppedUrl.toLowerCase()
      ) {
        droppedName = '';
      }
    } catch (error) {
      console.warn('URL parsing failed during drop evaluation', error);
    }

    if (!droppedName) droppedName = deriveShortcutNameFromUrl(droppedUrl);

    targetArray.push({
      type: 'link',
      name: droppedName,
      url: droppedUrl,
      customIcon: null,
    });
    saveAndRender();
  });
}





function toTitleCase(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

let activeToastInstance: HTMLElement | null = null;

function showToast(message: string, iconPath: string, duration = 3500): void {
  if (activeToastInstance) {
    activeToastInstance.remove();
  }

  const notice = document.createElement('div');
  notice.className = 'update-release-notice';

  const icon = document.createElement('img');
  icon.className = 'update-release-notice-icon';
  icon.src = iconPath;
  icon.alt = '';

  const text = document.createElement('span');
  text.className = 'update-release-notice-prefix';
  text.textContent = message;

  notice.append(icon, text);
  document.body.appendChild(notice);
  activeToastInstance = notice;

  requestAnimationFrame(() => notice.classList.add('visible'));

  window.setTimeout(() => {
    if (activeToastInstance === notice) {
      notice.classList.remove('visible');
      window.setTimeout(() => {
        if (notice.parentNode) notice.remove();
      }, 250);
      activeToastInstance = null;
    }
  }, duration);
}





function updateCreditsUI(
  source: string,
  creditText?: string,
  creditUrl?: string,
) {
  const creditsContainer = getById<HTMLDivElement>('wallpaperCredits');
  const creditsSpan = getById<HTMLSpanElement>('wallpaperCreditText');

  if (!creditsContainer || !creditsSpan) return;

  if (
    source === 'local' ||
    source === 'preset' ||
    source === 'upload' ||
    source === 'none'
  ) {
    creditsContainer.classList.add('hidden');
  } else {
    creditsSpan.innerHTML = '';

    const textToShow = creditText || 'Daily Wallpaper';

    if (creditUrl) {
      const a = document.createElement('a');
      a.href = creditUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = textToShow;
      a.className = 'wallpaper-credit-link';

      a.style.color = 'inherit';
      a.style.textDecoration = 'underline';
      a.style.pointerEvents = 'auto';
      a.style.cursor = 'pointer';

      creditsSpan.appendChild(a);
    } else {
      creditsSpan.textContent = textToShow;
    }

    creditsContainer.classList.remove('hidden');
  }
}

function applyInitialSearchEngine() {
  setSearchEngine(savedEngine);
}

function applyInitialShortcutsVisibility() {
  if (toggleShortcuts) {
    toggleShortcuts.checked = shortcutsVisible;
    updateShortcutsVisibility(shortcutsVisible, false);
  }
}

function applyInitialFoldersSetting() {
  if (toggleFolders) toggleFolders.checked = foldersEnabled;
  updateLauncherFooterVariant();
}

function applyInitialReducedEffectsState() {
  updateReducedEffectsVisibility(reducedEffectsEnabled, false);

  if (!reducedEffectsEnabled) {
    if (animationsDisabled) {
      animationsDisabled = false;
      localStorage.setItem('animationsDisabled', 'false');
      updateAnimationsDisabled(false);
      if (toggleDisableAnimations) toggleDisableAnimations.checked = false;
    }
    if (blurDisabled) {
      blurDisabled = false;
      localStorage.setItem('blurDisabled', 'false');
      updateBlurDisabled(false);
      if (toggleDisableBlur) toggleDisableBlur.checked = false;
    }
  }
}

function applyInitialAnimationsDisabled() {
  if (toggleDisableAnimations) {
    toggleDisableAnimations.checked = animationsDisabled;
  }
  updateAnimationsDisabled(animationsDisabled);
}

function applyInitialBlurDisabled() {
  if (toggleDisableBlur) {
    toggleDisableBlur.checked = blurDisabled;
  }
  updateBlurDisabled(blurDisabled);
}

function applyInitialWeatherState() {
  if (cityInput) cityInput.value = currentCityData.name;
  if (toggleFahrenheit) toggleFahrenheit.checked = weatherUnit === 'f';
  updateWeatherVisibility(false);
  if (weatherEnabled) initWeather();
}

function applyInitialLauncherState() {
  if (toggleLauncher) toggleLauncher.checked = launcherEnabled;
  if (launcherProvider) launcherProvider.value = currentProvider;
  updateLauncherVisibility(false);
  if (launcherEnabled) renderLauncher(currentProvider);
}

const uploadIconSVG = `<svg width="17" height="17" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.25 3.509a.75.75 0 1 0 0-1.5l-13-.004a.75.75 0 1 0 0 1.5zm-6.602 18.488.102.007a.75.75 0 0 0 .743-.649l.007-.101-.001-13.685 3.722 3.72a.75.75 0 0 0 .976.072l.085-.072a.75.75 0 0 0 .072-.977l-.073-.084-4.997-4.996a.75.75 0 0 0-.976-.073l-.085.072-5.003 4.997a.75.75 0 0 0 .976 1.134l.084-.073 3.719-3.713L11 21.254c0 .38.282.693.648.743" fill="currentColor"/></svg>`;
const clearIconSVG = `<svg width="17" height="17" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m4.397 4.554.073-.084a.75.75 0 0 1 .976-.073l.084.073L12 10.939l6.47-6.47a.75.75 0 1 1 1.06 1.061L13.061 12l6.47 6.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L12 13.061l-6.47 6.47a.75.75 0 0 1-1.06-1.061L10.939 12l-6.47-6.47a.75.75 0 0 1-.072-.976l.073-.084z" fill="currentColor"/></svg>`;

let originalFaviconHref: string | null = null;

function applyTabCustomization(): void {
  if (originalFaviconHref === null) {
    originalFaviconHref = 'assets/icon-128.png';
  }

  document
    .querySelectorAll('link[rel~="icon"]')
    .forEach((node) => node.remove());

  const link = document.createElement('link');
  link.rel = 'icon';

  if (accentColorEnabled) {
    document.title = tabName || 'New Tab';
    link.href = tabFavicon || originalFaviconHref;
  } else {
    document.title = 'New Tab';
    link.href = originalFaviconHref;
  }

  document.head.appendChild(link);

  if (tabFaviconUploadBtn) {
    const hasIcon = Boolean(tabFavicon);
    tabFaviconUploadBtn.innerHTML = hasIcon ? clearIconSVG : uploadIconSVG;
    tabFaviconUploadBtn.dataset.state = hasIcon ? 'clear' : 'upload';
  }
}

function syncFaviconState(value: string): void {
  tabFavicon = value;
  localStorage.setItem('tabFavicon', value);

  if (tabFaviconInput) {
    tabFaviconInput.value = value.startsWith('data:') ? '' : value;
  }

  applyTabCustomization();
}

function syncTabNameState(value: string): void {
  tabName = value;
  localStorage.setItem('tabName', value);

  if (tabNameInput) {
    tabNameInput.value = value;
  }

  applyTabCustomization();
}

function initTabCustomization(): void {
  if (document.body.dataset.tabCustomizationBound === 'true') {
    applyTabCustomization();
    return;
  }
  document.body.dataset.tabCustomizationBound = 'true';

  if (tabNameInput) tabNameInput.value = tabName;
  if (tabFaviconInput)
    tabFaviconInput.value = tabFavicon.startsWith('data:') ? '' : tabFavicon;

  applyTabCustomization();

  if (tabNameInput) {
    tabNameInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      syncTabNameState(target.value.trim());
    });
  }

  if (tabFaviconInput) {
    tabFaviconInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      const val = target.value.trim();
      if (!val && !tabFavicon.startsWith('data:')) {
        syncFaviconState('');
      }
    });

    tabFaviconInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      const val = target.value.trim();
      if (val) syncFaviconState(val);
    });
  }

  if (tabFaviconUploadBtn && tabFaviconFileInput) {
    tabFaviconUploadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (tabFaviconUploadBtn.dataset.state === 'clear') {
        syncFaviconState('');
      } else {
        tabFaviconFileInput.click();
      }
    });

    tabFaviconFileInput.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (!file) return;

      try {
        const base64 = await processFaviconImage(file);
        syncFaviconState(base64);
      } catch (err) {
        console.error(err);
      }

      tabFaviconFileInput.value = '';
    });
  }

  if (toggleAppearance) {
    toggleAppearance.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      accentColorEnabled = target.checked;

      if (!accentColorEnabled) {
        syncTabNameState('');
        syncFaviconState('');
      } else {
        applyTabCustomization();
      }
    });
  }
}

function applyInitialWallpaperState() {
  if (toggleWallpaper) {
    toggleWallpaper.checked = wallpaperEnabled;
  }

  if (wallpaperSourceSelect) {
    const validTypes = ['upload', 'bing', 'nasa', 'wikimedia'];
    if (!validTypes.includes(currentWallpaperType)) {
      currentWallpaperType = 'upload';
      currentWallpaperSource = 'local';
      saveWallpaperConfig();
    }
    wallpaperSourceSelect.value = currentWallpaperType;
  }

  updateWallpaperUIState(wallpaperEnabled, false);
  setOverlayOpacity(wallpaperOverlay, false);

  applyWallpaperLogic();
}

let brandIntervalStarted = false;
function applyBrandInterval() {
  initBrand();
  if (brandIntervalStarted) return;
  brandIntervalStarted = true;
  setInterval(initBrand, 60000);
}

const PERSISTENT_BACKUP_KEY = 'fluent_persistent_backup_v1';
const UPDATE_NOTICE_PENDING_KEY = 'update_notice_pending';
const UPDATE_NOTICE_VERSION_KEY = 'update_notice_version';
const SHORTCUTS_TREE_BACKUP_KEY = 'shortcutsTree';
let pendingUpdateNoticeVersion: string | null = null;

function getStorageLocalItems(
  key: string | string[],
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const localStorageApi = chrome.storage?.local;
    if (!localStorageApi) {
      resolve({});
      return;
    }

    localStorageApi.get(key, (items) => resolve(items || {}));
  });
}

function setStorageLocalItems(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    const localStorageApi = chrome.storage?.local;
    if (!localStorageApi) {
      resolve();
      return;
    }

    localStorageApi.set(items, () => resolve());
  });
}

function getLocalPreferencesSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  APP_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) snapshot[key] = value;
  });
  return snapshot;
}

async function processFaviconImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error());
        ctx.drawImage(img, 0, 0, 128, 128);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = String((e.target as FileReader).result || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function persistPreferencesBackup(): Promise<void> {
  const snapshot = getLocalPreferencesSnapshot();
  await setStorageLocalItems({ [PERSISTENT_BACKUP_KEY]: snapshot });
}

async function restorePreferencesBackupIfNeeded(): Promise<boolean> {
  const items = await getStorageLocalItems(PERSISTENT_BACKUP_KEY);
  const backupRaw = items[PERSISTENT_BACKUP_KEY];
  if (!backupRaw || typeof backupRaw !== 'object') return false;

  const backup = backupRaw as Record<string, unknown>;
  let restoredAny = false;

  Object.entries(backup).forEach(([key, value]) => {
    if (typeof value !== 'string') return;
    const currentValue = localStorage.getItem(key);
    if (currentValue === null || currentValue === '') {
      localStorage.setItem(key, value);
      restoredAny = true;
    }
  });

  return restoredAny;
}

async function getUpdateNoticeState(): Promise<{
  pending: boolean;
  version: string;
}> {
  const items = await getStorageLocalItems([
    UPDATE_NOTICE_PENDING_KEY,
    UPDATE_NOTICE_VERSION_KEY,
  ]);
  const pending = items[UPDATE_NOTICE_PENDING_KEY] === true;
  const manifestVersion = chrome.runtime.getManifest().version;
  const storedVersion =
    typeof items[UPDATE_NOTICE_VERSION_KEY] === 'string'
      ? String(items[UPDATE_NOTICE_VERSION_KEY])
      : '';
  const version = manifestVersion || storedVersion;
  return { pending, version };
}

async function clearUpdateNoticeState(): Promise<void> {
  const version = chrome.runtime.getManifest().version;
  localStorage.setItem('settings_dot_seen', 'true');
  localStorage.setItem('settings_dot_seen_version', version);
  await setStorageLocalItems({
    [UPDATE_NOTICE_PENDING_KEY]: false,
    [UPDATE_NOTICE_VERSION_KEY]: version,
  });
}

function getLocalizedUpdateMessage(
  messageKey: string,
  substitutions: string[] = [],
): string {
  const translated = (window as any).getTranslation(messageKey);
  if (translated && translated !== messageKey) {
    let resolved = translated;
    substitutions.forEach((value, index) => {
      resolved = resolved.replace(new RegExp(`\\$${index + 1}\\$`, 'g'), value);
    });

    if (substitutions[0]) {
      resolved = resolved.replace(/\$VERSION\$/g, substitutions[0]);
    }

    return resolved;
  }

  if (messageKey === 'updateNoticePrefix') {
    return `Fluent New Tab has been updated to version ${substitutions[0] || ''}, `;
  }

  if (messageKey === 'updateNoticeChangelog') {
    return 'see changelog';
  }

  return messageKey;
}

function getLocalizedNasaApodNoticeMessage(): string {
  const messageKey = 'nasaApodVideoNotice';
  const translated = (window as any).getTranslation(messageKey);
  if (translated && translated !== messageKey) return translated;
  return "Fetching today's NASA image...";
}

let fetchingNoticeInstance: HTMLElement | null = null;

function showFetchingNotice(source: string): void {
  if (fetchingNoticeInstance) fetchingNoticeInstance.remove();

  const notice = document.createElement('div');
  notice.className = 'update-release-notice fetching-notice';

  const icon = document.createElement('img');
  icon.className = 'update-release-notice-icon';
  icon.src = 'assets/icons/fetching.svg';
  icon.alt = '';

  const message = document.createElement('span');
  message.className = 'update-release-notice-prefix';

  const sourceName = toTitleCase(source);
  message.textContent = getLocalizedWarningText(
    'fetchingImagePlaceholder',
    'Fetching $SOURCE$ image...',
    { SOURCE: sourceName },
  );

  notice.append(icon, message);
  document.body.appendChild(notice);
  fetchingNoticeInstance = notice;

  requestAnimationFrame(() => notice.classList.add('visible'));
}

function hideFetchingNotice(): void {
  if (!fetchingNoticeInstance) return;
  const notice = fetchingNoticeInstance;
  notice.classList.remove('visible');
  setTimeout(() => {
    notice.remove();
    if (fetchingNoticeInstance === notice) fetchingNoticeInstance = null;
  }, 250);
}

function showPendingUpdateNoticeIfAny(): void {
  if (!pendingUpdateNoticeVersion) return;
  showUpdateReleaseNotice(pendingUpdateNoticeVersion);
  pendingUpdateNoticeVersion = null;
  void clearUpdateNoticeState();
}

function showUpdateReleaseNotice(version: string): void {
  const notice = document.createElement('div');
  notice.className = 'update-release-notice';

  const icon = document.createElement('img');
  icon.className = 'update-release-notice-icon';
  icon.src = 'assets/icons/update.svg';
  icon.alt = '';

  const prefix = document.createElement('span');
  prefix.className = 'update-release-notice-prefix';
  prefix.textContent = getLocalizedUpdateMessage('updateNoticePrefix', [
    `v${version}`,
  ]);

  const changelogLink = document.createElement('a');
  changelogLink.className = 'update-release-notice-link';
  changelogLink.href = 'https://github.com/snw-mint/fluent-new-tab/releases';
  changelogLink.target = '_blank';
  changelogLink.rel = 'noopener noreferrer';
  changelogLink.textContent = getLocalizedUpdateMessage(
    'updateNoticeChangelog',
  );

  notice.append(icon, prefix, changelogLink);
  document.body.appendChild(notice);

  requestAnimationFrame(() => {
    notice.classList.add('visible');
  });

  const hideNotice = (): void => {
    notice.classList.remove('visible');
    window.setTimeout(() => {
      notice.remove();
    }, 220);
  };

  window.setTimeout(hideNotice, 10000);
}

function updateAskAiBtnVisibility(): void {
  if (!askAiBtn) return;
  const canShow = askAiEnabled && searchBarVisible;
  askAiBtn.style.display = canShow ? 'flex' : 'none';
}

export function getSfx(type: 'mic' | 'ai'): HTMLAudioElement | null {
  if (type === 'mic' && !voiceSearchEnabled) return null;
  if (type === 'ai' && !askAiEnabled) return null;

  if (type === 'mic') {
    if (!sfxMicInstance) {
      sfxMicInstance = new Audio(
        chrome.runtime.getURL('assets/sfx/mic-ready.webm'),
      );
      sfxMicInstance.volume = 0.45;
    }
    return sfxMicInstance;
  } else {
    if (!sfxAskAiInstance) {
      sfxAskAiInstance = new Audio(
        chrome.runtime.getURL('assets/sfx/ai-sfx.webm'),
      );
      sfxAskAiInstance.volume = 0.5;
    }
    return sfxAskAiInstance;
  }
}

function setAskAiMode(active: boolean): void {
  askAiMode = active;
  if (!searchWrapper || !searchInput || !askAiBtn) return;

  const inactiveIcon = askAiBtn.querySelector(
    '.ask-ai-icon-inactive',
  ) as HTMLElement | null;
  const activeIcon = askAiBtn.querySelector(
    '.ask-ai-icon-active',
  ) as HTMLElement | null;

  if (active) {
    const sfx = getSfx('ai');
    if (sfx) {
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
    }

    searchWrapper.classList.add('ask-ai-active');
    searchWrapper.classList.add('ask-ai-animating');

    const onAnimationEnd = (e: AnimationEvent) => {
      if (e.animationName === 'ask-ai-fade-spin') {
        searchWrapper.classList.remove('ask-ai-animating');
        searchWrapper.removeEventListener('animationend', onAnimationEnd);
      }
    };
    searchWrapper.addEventListener('animationend', onAnimationEnd);

    searchInput.placeholder = getLocalizedWarningText(
      'askAiOption',
      'Ask to AI',
    );

    if (inactiveIcon) inactiveIcon.style.display = 'none';
    if (activeIcon) activeIcon.style.display = 'block';
  } else {
    searchWrapper.classList.remove('ask-ai-active');
    searchWrapper.classList.remove('ask-ai-animating');

    searchInput.placeholder = getLocalizedWarningText(
      'searchPlaceholder',
      'Search the web',
    );

    if (inactiveIcon) inactiveIcon.style.display = 'block';
    if (activeIcon) activeIcon.style.display = 'none';
  }
}

function handleAskAiSubmit(query: string): void {
  if (!query.trim()) return;
  const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(query.trim())}`;
  window.open(url, '_blank');
}

async function initCritical() {
  const updateState = await getUpdateNoticeState();
  if (updateState.pending) {
    pendingUpdateNoticeVersion =
      updateState.version || chrome.runtime.getManifest().version;
    showPendingUpdateNoticeIfAny();
  }

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
    applyWallpaperLogic,
  });

  applyBrandInterval();
  applyInitialWallpaperState();
}

function initCustomSelectSystem(): void {
  const popup = document.getElementById('fluent-select-popup');
  const listContainer = popup?.querySelector<HTMLUListElement>(
    '.fluent-select-options-list',
  );
  const triggers = document.querySelectorAll<HTMLButtonElement>(
    '.fluent-select-trigger',
  );

  if (!popup || !listContainer) return;

  function closeSelectPopup(): void {
    popup!.classList.remove('active');
    if (activeSelectTrigger) {
      activeSelectTrigger.classList.remove('popup-open');
      activeSelectTrigger = null;
    }
  }

  function positionPopup(trigger: HTMLElement): void {
    const rect = trigger.getBoundingClientRect();
    popup!.style.width = `${rect.width}px`;
    popup!.style.left = `${rect.left}px`;

    const popupHeight = Math.min(260, listContainer!.scrollHeight);
    const checkOverflowBottom = rect.bottom + popupHeight > window.innerHeight;
    const checkOverflowTop = rect.top - popupHeight > 0;

    if (checkOverflowBottom && checkOverflowTop) {
      popup!.style.top = `${rect.top - popupHeight - 2}px`;
    } else {
      popup!.style.top = `${rect.bottom + 2}px`;
    }
  }

  function openPopup(trigger: HTMLButtonElement): void {
    if (activeSelectTrigger === trigger) {
      closeSelectPopup();
      return;
    }

    closeSelectPopup();
    activeSelectTrigger = trigger;
    trigger.classList.add('popup-open');

    const nativeSelectId = trigger.getAttribute('data-target');
    if (!nativeSelectId) return;

    const nativeSelect = document.getElementById(
      nativeSelectId,
    ) as HTMLSelectElement | null;
    if (!nativeSelect || nativeSelect.disabled) {
      closeSelectPopup();
      return;
    }

    listContainer!.innerHTML = '';

    Array.from(nativeSelect.options).forEach((option) => {
      const li = document.createElement('li');
      li.className = 'fluent-select-option';
      li.textContent = option.textContent;
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', option.value);

      if (option.selected || nativeSelect.value === option.value) {
        li.classList.add('selected');
        li.setAttribute('aria-selected', 'true');
      }

      li.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        nativeSelect.value = option.value;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

        const triggerValue = trigger.querySelector('.fluent-select-value');
        if (triggerValue) {
          triggerValue.textContent = option.textContent;
          const i18nKey = option.getAttribute('data-i18n');
          if (i18nKey) triggerValue.setAttribute('data-i18n', i18nKey);
        }

        closeSelectPopup();
      });

      listContainer!.appendChild(li);
    });

    popup!.classList.add('active');
    positionPopup(trigger);

    const currentSelected = listContainer!.querySelector<HTMLElement>(
      '.fluent-select-option.selected',
    );
    if (currentSelected) {
      listContainer!.scrollTop =
        currentSelected.offsetTop - listContainer!.offsetTop;
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      openPopup(trigger);
    });
  });

  popup.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => closeSelectPopup());

  window.addEventListener('resize', () => {
    if (activeSelectTrigger) positionPopup(activeSelectTrigger);
  });

  document.querySelectorAll('.settings-popup').forEach((container) => {
    container.addEventListener('scroll', () => {
      if (activeSelectTrigger) {
        closeSelectPopup();
      }
    });
  });

  function syncAllTriggersText(): void {
    triggers.forEach((trigger) => {
      const targetId = trigger.getAttribute('data-target');
      if (!targetId) return;
      const select = document.getElementById(
        targetId,
      ) as HTMLSelectElement | null;

      if (select) {
        const triggerValue = trigger.querySelector('.fluent-select-value');

        let selectedOption = select.options[select.selectedIndex];
        if (!selectedOption) {
          selectedOption =
            select.querySelector('option[selected]') || select.options[0];
        }

        if (triggerValue && selectedOption) {
          triggerValue.textContent = selectedOption.textContent;
          const i18nKey = selectedOption.getAttribute('data-i18n');
          if (i18nKey) {
            triggerValue.setAttribute('data-i18n', i18nKey);
          } else {
            triggerValue.removeAttribute('data-i18n');
          }
        }
      }
    });
  }

  syncAllTriggersText();

  triggers.forEach((trigger) => {
    const targetId = trigger.getAttribute('data-target');
    if (!targetId) return;
    const select = document.getElementById(targetId);
    if (select) {
      select.addEventListener('change', () => {
        syncAllTriggersText();
        if (
          activeSelectTrigger === trigger &&
          popup.classList.contains('active')
        ) {
          const currentTrigger = activeSelectTrigger;
          activeSelectTrigger = null;
          openPopup(currentTrigger);
        }
      });
    }
  });
  document.addEventListener('i18nReady', () => {
    syncAllTriggersText();
  });
}

function initVisual() {
  if (toggleDisplay) {
    toggleDisplay.checked = localStorage.getItem('displayEnabled') !== 'false';
    updateDisplaySettingsVisibility(toggleDisplay.checked, false);
  }

  applyInitialAnimationsDisabled();
  applyInitialBlurDisabled();
  applyInitialReducedEffectsState();

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
          if (folder.children.length < MAX_FOLDER_CAPACITY) {
            targetArray.splice(itemIndex, 1);
            folder.children.push(item);
            saveAndRender();
          } else {
            showGridLimitWarning(MAX_FOLDER_CAPACITY, true);
          }
        }
      },
      onMoveOutFolder: (itemIndex) => {
        if (!currentFolderId) return;

        const targetArray = getActiveShortcutsList();
        const item = targetArray.splice(itemIndex, 1)[0];

        if (item) {
          const maxMain = Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);
          if (shortcuts.length >= maxMain) {
            targetArray.splice(itemIndex, 0, item);
            showGridLimitWarning(maxMain, false);
          } else {
            shortcuts.push(item);
            saveAndRender();
          }
        }
      },
    });
  }
  bindExternalShortcutDrop();
  applyInitialShortcutsVisibility();
  applyInitialFoldersSetting();
  const currentEngine = (localStorage.getItem('searchEngine') ||
    'system') as keyof typeof engines;
  setSearchEngine(currentEngine);
  updateSearchSettings(false);
  if (toggleSearchBar) toggleSearchBar.checked = searchBarVisible;
  if (toggleSuggestions) toggleSuggestions.checked = suggestionsActive;
  if (toggleClearSearch) toggleClearSearch.checked = clearSearchEnabled;
  if (toggleVoiceSearch) toggleVoiceSearch.checked = voiceSearchEnabled;
  updateGoogleParams();
  updateVoiceSearchAvailability();
  updateCompactBarStyle();
  updateAskAiBtnVisibility();
  initTabCustomization();
  const languageSelect = document.getElementById(
    'languageProvider',
  ) as HTMLSelectElement | null;
  if (languageSelect) {
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang) languageSelect.value = savedLang;
  }
  initCustomSelectSystem();
}



function initAllEventBindings() {
  if (toggleDisplay) {
    toggleDisplay.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      const checked = target.checked;
      localStorage.setItem('displayEnabled', String(checked));
      updateDisplaySettingsVisibility(checked);
      initBrand();
    });
  }

  if (shortcutForm) {
    shortcutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputName = getInputById('inputName') as HTMLInputElement | null;
      const inputUrl = getInputById('inputUrl') as HTMLInputElement | null;
      const inputIcon = getInputById('inputIcon') as HTMLInputElement | null;

      if (!inputName || !inputUrl) return;

      let finalUrl = inputUrl.value.trim();
      if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }

      const targetArray = getActiveShortcutsList();

      if (
        editingIndex !== null &&
        editingIndex >= 0 &&
        targetArray[editingIndex]
      ) {
        targetArray[editingIndex] = {
          ...targetArray[editingIndex],
          name: inputName.value.trim() || deriveShortcutNameFromUrl(finalUrl),
          url: finalUrl,
          customIcon: inputIcon?.value.trim() || null,
        };
      } else {
        const limit = currentFolderId
          ? MAX_FOLDER_CAPACITY
          : Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);

        if (targetArray.length >= limit) {
          showGridLimitWarning(limit, Boolean(currentFolderId));
          return;
        }

        targetArray.push({
          id: 'shortcut_' + Date.now().toString(),
          type: 'link',
          name: inputName.value.trim() || deriveShortcutNameFromUrl(finalUrl),
          url: finalUrl,
          customIcon: inputIcon?.value.trim() || null,
        });
      }

      saveAndRender();
      editingIndex = null;
      closeModal();
    });
  }

  const inputUrlNode = getInputById('inputUrl') as HTMLInputElement | null;
  const inputNameNode = getInputById('inputName') as HTMLInputElement | null;

  if (inputUrlNode && inputNameNode) {
    inputUrlNode.addEventListener('blur', () => {
      const currentUrl = inputUrlNode.value.trim();
      const currentName = inputNameNode.value.trim();

      if (currentUrl && !currentName) {
        let processUrl = currentUrl;
        if (!/^https?:\/\//i.test(processUrl)) {
          processUrl = 'https://' + processUrl;
        }

        const derived = deriveShortcutNameFromUrl(processUrl);
        if (derived && derived !== 'New Shortcut') {
          inputNameNode.value = derived;
        }
      }
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
      displayScale = scale;
    },
  });

  bindShortcutRadiusFeature({
    shortcutRadiusSlider,
    shortcutRadiusRow,
    getShortcutRadius: () => shortcutRadius,
    setShortcutRadius: (radius: string) => {
      shortcutRadius = radius;
    },
    toggleHideShortcutNames,
    getHideShortcutNames: () => hideShortcutNames,
    setHideShortcutNames: (enabled: boolean) => {
      hideShortcutNames = enabled;
    },
  });

  const weatherMoreBtn = document.getElementById('weather-more-btn');
  const weatherMoreContainer = document.getElementById(
    'weather-more-container',
  );
  if (weatherMoreBtn && weatherMoreContainer) {
    weatherMoreBtn.addEventListener('click', () => {
      const isCollapsed = weatherMoreContainer.classList.contains('collapsed');
      if (isCollapsed) {
        weatherMoreContainer.classList.remove('collapsed');
        weatherMoreBtn.classList.add('expanded');
        weatherMoreContainer.style.maxHeight = '500px';
      } else {
        weatherMoreContainer.classList.add('collapsed');
        weatherMoreBtn.classList.remove('expanded');
        weatherMoreContainer.style.maxHeight = '';
      }
    });
  }

  if (displayTypeSelect) {
    const savedPreset = localStorage.getItem('displayPreset') || 'greeting';
    displayTypeSelect.value = savedPreset;

    const updateAdvancedUI = (preset: string) => {
      if (subGreeting) subGreeting.style.display = 'none';
      if (subTime) subTime.style.display = 'none';
      if (subDate) subDate.style.display = 'none';

      const hasAdvanced = ['greeting', 'time', 'date', 'advanced'].includes(
        preset,
      );

      if (displayAdvancedSetting) {
        displayAdvancedSetting.style.display = hasAdvanced ? 'flex' : 'none';
      }

      if (hasAdvanced && displaySliderContainer && displayToggleBtn) {
        displaySliderContainer.classList.add('collapsed');
        displayToggleBtn.classList.remove('expanded');
        displaySliderContainer.style.maxHeight = '';
      }

      if (preset === 'greeting' && subGreeting)
        subGreeting.style.display = 'flex';
      if (preset === 'time' && subTime) subTime.style.display = 'flex';
      if (preset === 'date' && subDate) subDate.style.display = 'flex';
      if (preset === 'advanced') {
        if (subTime) subTime.style.display = 'flex';
        if (subDate) subDate.style.display = 'flex';
      }
    };

    updateAdvancedUI(savedPreset);

    displayTypeSelect.addEventListener('change', (e) => {
      const target = getSelectTarget(e);
      if (!target) return;
      const preset = target.value;
      localStorage.setItem('displayPreset', preset);

      if (preset === 'greeting') {
        localStorage.setItem('displayType', 'greeting');
      } else if (preset === 'time') {
        localStorage.setItem('displayType', 'time');
      } else if (preset === 'date') {
        localStorage.setItem('displayType', 'date');
      } else if (preset === 'weekday') {
        localStorage.setItem('displayType', 'weekday');
      } else if (preset === 'advanced') {
        localStorage.setItem('displayType', 'timedate');
      }

      if (toggleSeconds)
        toggleSeconds.checked = localStorage.getItem('showSeconds') === 'true';
      if (toggle12Hour)
        toggle12Hour.checked = localStorage.getItem('use12Hour') === 'true';
      if (dateFormatSelect)
        dateFormatSelect.value = localStorage.getItem('dateFormat') || 'text';

      updateAdvancedUI(preset);
      initBrand();
    });
  }

  if (toggleSeconds) {
    toggleSeconds.checked = localStorage.getItem('showSeconds') === 'true';
    toggleSeconds.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('showSeconds', String(target.checked));
      initBrand();
    });
  }

  if (toggle12Hour) {
    toggle12Hour.checked = localStorage.getItem('use12Hour') === 'true';
    toggle12Hour.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('use12Hour', String(target.checked));
      initBrand();
    });
  }

  if (dateFormatSelect) {
    dateFormatSelect.value = localStorage.getItem('dateFormat') || 'text';
    dateFormatSelect.addEventListener('change', (e) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('dateFormat', target.value);
      initBrand();
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput?.value || '';

      if (askAiMode) {
        handleAskAiSubmit(query);
        setAskAiMode(false);
        if (searchInput) searchInput.value = '';
        clearSuggestions();
      } else {
        const currentEngine = localStorage.getItem('searchEngine') || 'system';
        performSearch(query, currentEngine);
      }
    });
  }

  if (greetingNameInput) {
    greetingNameInput.value = localStorage.getItem('greetingName') || '';
    greetingNameInput.addEventListener('input', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('greetingName', target.value);
      if (greetingWrapper) greetingWrapper.dataset.lastMinute = '';
      initBrand();
    });
  }

  if (greetingTypeSelect) {
    greetingTypeSelect.value = localStorage.getItem('greetingType') || 'static';
    greetingTypeSelect.addEventListener('change', (e) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('greetingType', target.value);
      if (greetingWrapper) greetingWrapper.dataset.lastMinute = '';
      initBrand();
    });
  }

  if (configBtn && configPopup) {
    configBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closePopups(configPopup);
      configPopup.classList.toggle('active');

      if (!configPopup.classList.contains('active')) {
        resetSettingsAccordions();
      }
    });

    document.addEventListener('click', (e) => {
      const targetNode = e.target as Node | null;
      if (!targetNode) return;
      if (configPopup.classList.contains('active')) {
        if (
          !configPopup.contains(targetNode) &&
          !configBtn.contains(targetNode)
        ) {
          configPopup.classList.remove('active');
          resetSettingsAccordions();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && configPopup.classList.contains('active')) {
        configPopup.classList.remove('active');
        resetSettingsAccordions();
      }
    });
  }

  if (toggleDisableAnimations) {
    toggleDisableAnimations.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      animationsDisabled = target.checked;
      localStorage.setItem('animationsDisabled', String(target.checked));
      localStorage.removeItem('performanceModeEnabled');
      updateAnimationsDisabled(target.checked);
    });
  }

  if (toggleDisableBlur) {
    toggleDisableBlur.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      blurDisabled = target.checked;
      localStorage.setItem('blurDisabled', String(target.checked));
      updateBlurDisabled(target.checked);
    });
  }

  if (toggleReducedEffects) {
    toggleReducedEffects.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      reducedEffectsEnabled = target.checked;
      localStorage.setItem(
        'reducedEffectsEnabled',
        String(reducedEffectsEnabled),
      );
      if (!reducedEffectsEnabled) {
        if (toggleDisableAnimations) toggleDisableAnimations.checked = false;
        animationsDisabled = false;
        localStorage.setItem('animationsDisabled', 'false');
        updateAnimationsDisabled(false);
        if (toggleDisableBlur) toggleDisableBlur.checked = false;
        blurDisabled = false;
        localStorage.setItem('blurDisabled', 'false');
        updateBlurDisabled(false);
      }
      updateReducedEffectsVisibility(reducedEffectsEnabled);
    });
  }

  document.addEventListener('click', (e) => {
    const targetNode = e.target as Node | null;
    if (!targetNode) return;
    document
      .querySelectorAll('.shortcut-dropdown.active')
      .forEach((dropdown) => {
        if (!dropdown.closest('.menu-wrapper')?.contains(targetNode)) {
          dropdown.classList.remove('active');
        }
      });
    syncShortcutDropdownState();
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  initCustomIconToggle();
  initFolderCustomIconToggle();

  const btnChooseLink = document.getElementById('btnChooseLink');
  const btnChooseFolder = document.getElementById('btnChooseFolder');
  const closeChooseTypeBtn = document.getElementById('closeChooseTypeBtn');
  const closeFolderModalBtn = document.getElementById('closeFolderModalBtn');
  const formFolderNode = document.getElementById('folderForm');

  if (closeChooseTypeBtn)
    closeChooseTypeBtn.addEventListener('click', closeModal);
  if (closeFolderModalBtn)
    closeFolderModalBtn.addEventListener('click', closeModal);

  if (btnChooseLink) {
    btnChooseLink.addEventListener('click', (e) => {
      e.preventDefault();
      openShortcutModal(null);
    });
  }

  if (btnChooseFolder) {
    btnChooseFolder.addEventListener('click', (e) => {
      e.preventDefault();
      editingIndex = null;
      openFolderModal('', false);
    });
  }

  if (formFolderNode) {
    formFolderNode.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!inputFolderName) return;

      const targetArray = shortcuts;

      if (
        editingIndex !== null &&
        editingIndex >= 0 &&
        targetArray[editingIndex]
      ) {
        targetArray[editingIndex] = {
          ...targetArray[editingIndex],
          name: inputFolderName.value,
          customIcon: inputFolderIcon?.value || null,
        };
      } else {
        const limit = Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);

        if (targetArray.length >= limit) {
          showGridLimitWarning(limit, false);
          return;
        }

        targetArray.push({
          id: 'folder_' + Date.now().toString(),
          type: 'folder',
          name:
            inputFolderName.value ||
            (window as any).getTranslation('addFolderTitle') ||
            'New Folder',
          customIcon: inputFolderIcon?.value || null,
          children: [],
        });
      }

      foldersEnabled = true;
      if (toggleFolders) toggleFolders.checked = true;
      localStorage.setItem('foldersEnabled', 'true');
      updateLauncherFooterVariant();
      saveAndRender();
      editingIndex = null;
      closeModal();
    });
  }

  if (rowsSelect) {
    rowsSelect.value = String(allowedRows);
    rowsSelect.addEventListener('change', (e) => {
      const target = getSelectTarget(e);
      if (!target) return;
      allowedRows = parseInt(target.value);
      localStorage.setItem('shortcutsRows', String(allowedRows));
      renderShortcuts();
    });
  }

  if (toggleShortcuts) {
    toggleShortcuts.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      const isVisible = target.checked;
      updateShortcutsVisibility(isVisible);
      localStorage.setItem('shortcutsVisible', String(isVisible));
    });
  }

  if (toggleFolders) {
    toggleFolders.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      const wantsEnable = target.checked;

      if (!wantsEnable) {
        warningModal.show({
          title: getLocalizedWarningText(
            'warningDeleteFoldersTitle',
            'Disable Folders?',
          ),
          message: getLocalizedWarningText(
            'warningDeleteFoldersMessage',
            'All folders and their shortcuts will be deleted. This cannot be undone unless you have a backup.',
          ),
          confirmText: getLocalizedWarningText(
            'warningDeleteFoldersConfirm',
            'Delete Folders',
          ),
          cancelText: getLocalizedWarningText(
            'warningKeepEnabled',
            'Keep Enabled',
          ),
          confirmVariant: 'danger',
          onConfirm: () => {
            shortcuts = shortcuts.filter(
              (item) => item.type !== 'folder' && !Array.isArray(item.children),
            );
            foldersEnabled = false;
            currentFolderId = null;
            localStorage.setItem('foldersEnabled', 'false');
            updateLauncherFooterVariant();
            saveAndRender();
          },
          onCancel: () => {
            target.checked = true;
          },
        });
        return;
      }

      foldersEnabled = true;
      localStorage.setItem('foldersEnabled', 'true');
      updateLauncherFooterVariant();
    });
  }

  bindSearchFeature({
    engineBtn,
    dropdown,
    closePopups,
    items,
    hasEngine: (engine) => engine in engines,
    setSearchEngine,
    toggleSearchBar,
    setSearchBarVisible: (visible) => {
      searchBarVisible = visible;
    },
    updateSearchSettings,
    toggleSuggestions,
    getSuggestionsActive: () => suggestionsActive,
    setSuggestionsActive: (enabled) => {
      suggestionsActive = enabled;
    },
    clearSuggestions,
    toggleClearSearch,
    setClearSearchEnabled: (enabled) => {
      clearSearchEnabled = enabled;
    },
    updateGoogleParams,
    searchBarStyleSelect,
    searchMoreBtn,
    searchMoreContainer,
    getCompactBarEnabled: () => compactBarEnabled,
    setCompactBarEnabled: (enabled) => {
      compactBarEnabled = enabled;
    },
    updateCompactBarStyle,
    toggleVoiceSearch,
    setVoiceSearchEnabled: (enabled) => {
      voiceSearchEnabled = enabled;
    },
    updateVoiceSearchAvailability,
    searchInput,
    debounce,
    suggestionsCache,
    renderSuggestions,
    fetchSuggestions,
    updateSelection,
  });

  if (voiceSearchBtn) {
    voiceSearchBtn.addEventListener('click', () => {
      startVoiceSearch();
    });
  }

  if (askAiBtn) {
    askAiBtn.addEventListener('click', () => {
      setAskAiMode(!askAiMode);
      if (searchInput) searchInput.focus();
    });
  }

  if (toggleAskAi) {
    toggleAskAi.checked = askAiEnabled;
    toggleAskAi.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      if (!target) return;
      askAiEnabled = target.checked;
      localStorage.setItem('askAiEnabled', String(target.checked));
      updateAskAiBtnVisibility();
      if (!target.checked && askAiMode) setAskAiMode(false);
    });
  }

  bindWeatherFeature({
    applyInitialWeatherState,
    toggleWeather,
    getWeatherEnabled: () => weatherEnabled,
    setWeatherEnabled: (enabled) => {
      weatherEnabled = enabled;
    },
    updateWeatherVisibility,
    initWeather,
    setWeatherUnit: (unit) => {
      weatherUnit = unit;
    },
    saveCityBtn,
    cityInput,
    searchCity,
    toggleFahrenheit,
    getWeatherUnit: () => weatherUnit,
    toggleWeatherAlerts,
    getWeatherAlertsEnabled: () => weatherAlertsEnabled,
    setWeatherAlertsEnabled: (enabled) => {
      weatherAlertsEnabled = enabled;
    },
  });

  bindLauncherFeature({
    applyInitialLauncherState,
    toggleLauncher,
    getLauncherEnabled: () => launcherEnabled,
    setLauncherEnabled: (enabled) => {
      launcherEnabled = enabled;
    },
    updateLauncherVisibility,
    renderLauncher,
    getCurrentProvider: () => currentProvider,
    setCurrentProvider: (provider) => {
      currentProvider = provider;
    },
    launcherProvider,
    appLauncherBtn,
    launcherPopup,
    closePopups,
  });

  bindMainUiScaleFeature({
    mainUiScaleSlider,
    getMainUiScale: () => mainUiScale,
    setMainUiScale: (val: number) => {
      mainUiScale = val;
    },
  });

  bindLauncherFolderButton();

  bindWallpaperFeature({
    applyInitialWallpaperState,
    toggleWallpaper,
    setWallpaperEnabled: (enabled) => {
      wallpaperEnabled = enabled;
    },
    getWallpaperEnabled: () => wallpaperEnabled,
    updateWallpaperUIState,
    applyWallpaperLogic,
    wallpaperSourceSelect,
    overlayToggleBtn,
    overlaySliderContainer,
    overlaySlider,
    updateOverlaySliderProgress,
    setOverlayOpacity,
    setWallpaperSource: (source) => {
      currentWallpaperSource = source;
    },
    setWallpaperType: (type) => {
      currentWallpaperType = type;
    },
    setWallpaperValue: (value) => {
      currentWallpaperValue = value;
    },
    saveWallpaperConfig,
    uploadInput,
    processWallpaperImage,
    saveWallpaperToDB,
    getCurrentWallpaperSource: () => currentWallpaperSource,
    getCurrentWallpaperType: () => currentWallpaperType,
  });

  if (languageSelect) {
    const savedLang = localStorage.getItem('userLanguage');
    const defaultLang = 'en';

    if (savedLang) {
      languageSelect.value = savedLang;
    } else {
      const optionExists = Array.from(languageSelect.options).some(
        (o) => o.value === defaultLang,
      );
      languageSelect.value = optionExists
        ? defaultLang
        : languageSelect.options[0]?.value || 'en_US';
    }

    languageSelect.addEventListener('change', (e) => {
      const target = getSelectTarget(e);
      if (!target) return;

      const novoIdioma = target.value;
      localStorage.setItem('userLanguage', novoIdioma);

      // Limpa o cache antigo para forçar o carregamento do novo arquivo json de tradução
      const cacheKey = `i18n_cache_${novoIdioma}`;
      localStorage.removeItem(cacheKey);

      // CORREÇÃO: Em vez de recarregar a página, chamamos o motor de i18n do projeto
      // Se a sua função global de carregar traduções for assíncrona (como no setup.js)
      if (typeof (window as any).loadTranslations === 'function') {
        (window as any).loadTranslations();
      } else if (typeof (window as any).applyTranslations === 'function') {
        (window as any).applyTranslations();
      } else {
        document.dispatchEvent(new Event('i18nReady'));
      }
    });
  }

  if (versionDisplay) {
    try {
      versionDisplay.textContent = `v${chrome.runtime.getManifest().version}`;
    } catch (e) {
      versionDisplay.textContent = 'v1.0';
    }
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const backupData: Record<string, string> = {};
      const keysToExclude = [
        'weatherEnabled',
        'weatherAlertsEnabled',
        'suggestionsEnabled',
        'wallpaperSource',
        'wallpaperType',
        'wallpaperValue',
      ];

      APP_KEYS.forEach((key) => {
        if (keysToExclude.includes(key)) return;
        const value = localStorage.getItem(key);
        if (value !== null) backupData[key] = value;
      });
      backupData[SHORTCUTS_TREE_BACKUP_KEY] =
        localStorage.getItem('shortcuts') || '[]';
      backupData._backupDate = new Date().toISOString();

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluent-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const successMsg = getLocalizedWarningText(
        'backupExportSuccess',
        'Settings saved in the file',
      );
      showToast(successMsg, 'assets/icons/check.svg');
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const target = getInputTarget(e);
      const file = target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = JSON.parse(
            String((event.target as FileReader).result || '{}'),
          );
          if (!isValidBackupPayload(parsedData)) {
            throw new Error('Invalid backup data format');
          }
          const data = parsedData;
          warningModal.show({
            title: getLocalizedWarningText(
              'warningRestoreBackupTitle',
              'Restore Backup?',
            ),
            message: getLocalizedWarningText(
              'warningRestoreBackupMessage',
              'This will replace your current settings and shortcuts with the backup file data.',
            ),
            confirmText: getLocalizedWarningText(
              'warningRestoreBackupConfirm',
              'Restore',
            ),
            cancelText: getLocalizedWarningText('btnCancel', 'Cancel'),
            confirmVariant: 'danger',
            onConfirm: () => {
              const keysToExclude = [
                'weatherEnabled',
                'weatherAlertsEnabled',
                'suggestionsEnabled',
                'wallpaperSource',
                'wallpaperType',
                'wallpaperValue',
              ];

              APP_KEYS.forEach((key) => {
                if (keysToExclude.includes(key)) return;
                const value = data[key];
                if (typeof value === 'string') localStorage.setItem(key, value);
              });
              const treeBackup = data[SHORTCUTS_TREE_BACKUP_KEY];
              if (typeof treeBackup === 'string') {
                localStorage.setItem('shortcuts', treeBackup);
              }
              location.reload();
            },
          });
        } catch (error) {
          const errorMsg = getLocalizedWarningText(
            'warningInvalidBackupMessage',
            'The selected file is not a valid backup.',
          );
          showToast(errorMsg, 'assets/icons/dimiss.svg');
        }
        importInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  if (shortcutsMoreBtn && shortcutsMoreContainer) {
    shortcutsMoreBtn.addEventListener('click', () => {
      const isCollapsed =
        shortcutsMoreContainer.classList.contains('collapsed');
      if (isCollapsed) {
        shortcutsMoreContainer.classList.remove('collapsed');
        shortcutsMoreBtn.classList.add('expanded');
        shortcutsMoreContainer.style.maxHeight = '500px';
      } else {
        shortcutsMoreContainer.classList.add('collapsed');
        shortcutsMoreBtn.classList.remove('expanded');
        shortcutsMoreContainer.style.maxHeight = '';
      }
    });
  }
  applyMagneticSnap('displayScaleSlider', 100, 5);
  applyMagneticSnap('shortcutRadiusSlider', 0, 5);
  applyMagneticSnap('mainUiScaleSlider', 1, 0.05);
  applyMagneticSnap('wallpaper-overlay-slider', 0.2, 0.05);
}

async function initDeferred() {
  window.addEventListener('beforeunload', () => {
    void persistPreferencesBackup();
  });

  await persistPreferencesBackup();

  const updateState = await getUpdateNoticeState();
  if (updateState.pending) {
    pendingUpdateNoticeVersion =
      updateState.version || chrome.runtime.getManifest().version;
    showPendingUpdateNoticeIfAny();
  }

  const fadeEl = document.getElementById('wallpaper-fade');
  if (fadeEl) {
    fadeEl.addEventListener('transitionend', () => fadeEl.remove(), {
      once: true,
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await restorePreferencesBackupIfNeeded();

  initCritical();
  initVisual();

  const runDeferred = () => {
    initAllEventBindings();
    void initDeferred();
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runDeferred, { timeout: 600 });
  } else {
    setTimeout(runDeferred, 0);
  }
});

document.addEventListener('i18nReady', () => {
  console.log('Translations loaded. Starting interface...');
  showPendingUpdateNoticeIfAny();
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
