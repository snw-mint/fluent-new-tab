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
function closeModal(): void {
  hideAllModals();
  editingIndex = null;
}
function hideAllModals(): void {
  if (addModal) addModal.classList.remove('active');
  if (chooseTypeModal) chooseTypeModal.classList.remove('active');
  if (addFolderModal) addFolderModal.classList.remove('active');
}

function resetSettingsAccordions(): void {
  try {
    const accordions = [
      { container: displaySliderContainer, btn: displayToggleBtn },
      { container: shortcutsMoreContainer, btn: shortcutsMoreBtn },
      { container: overlaySliderContainer, btn: overlayToggleBtn },
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

function closePopups(except: Element | null = null): void {
  if (configPopup && configPopup !== except)
    configPopup.classList.remove('active');
  if (launcherPopup && launcherPopup !== except) {
    launcherPopup.classList.remove('active');
    if (appLauncherBtn) appLauncherBtn.classList.remove('active');
  }
  document.querySelectorAll('.shortcut-dropdown.active').forEach((menu) => {
    if (menu !== except) menu.classList.remove('active');
  });
  if (dropdown && dropdown !== except) dropdown.classList.remove('active');

  syncShortcutDropdownState();
}

function syncShortcutDropdownState(): void {
  const hasActiveDropdown = Boolean(
    shortcutsGrid?.querySelector('.shortcut-dropdown.active'),
  );
  if (shortcutsGrid)
    shortcutsGrid.classList.toggle('dropdown-open', hasActiveDropdown);

  document.querySelectorAll('.menu-wrapper').forEach((wrapper) => {
    const isOpen = Boolean(wrapper.querySelector('.shortcut-dropdown.active'));
    wrapper.classList.toggle('dropdown-open', isOpen);
  });
}

function openModal(index: number | null = null): void {
  editingIndex = index;

  const currentArray = getActiveShortcutsList();
  const existingItem = index !== null ? currentArray[index] : null;

  if (existingItem?.type === 'folder') {
    openFolderModal(existingItem.name, true);
    return;
  }
  if (index === null && foldersEnabled && !currentFolderId) {
    openChooseTypeModal();
    return;
  }
  openShortcutModal(existingItem);
}
function openChooseTypeModal(): void {
  hideAllModals();
  if (chooseTypeModal) chooseTypeModal.classList.add('active');
}
function openFolderModal(name = '', isEditing = false): void {
  hideAllModals();
  if (!addFolderModal || !inputFolderName) return;
  addFolderModal.classList.add('active');
  if (folderModalTitle) {
    const tKey = isEditing ? 'editFolderTitle' : 'addFolderTitle';
    const fallback = isEditing ? 'Edit Folder' : 'Add Folder';
    const translated = window.getTranslation(tKey);
    const safeText =
      translated && translated !== tKey && translated.toLowerCase() !== 'edit'
        ? translated
        : fallback;
    folderModalTitle.textContent = safeText;
  }
  inputFolderName.value = name;
  setTimeout(() => inputFolderName.focus(), 100);
}
function openShortcutModal(existingItem: Shortcut | null): void {
  hideAllModals();
  if (!addModal) return;

  addModal.classList.add('active');
  const modalTitle = addModal.querySelector('.modal-content h3');
  const inputName = getInputById('inputName');
  const inputUrl = getInputById('inputUrl');
  const inputIcon = getInputById('inputIcon');

  if (existingItem) {
    if (inputName) inputName.value = existingItem.name;
    if (inputUrl) inputUrl.value = existingItem.url || '';
    if (inputIcon) inputIcon.value = existingItem.customIcon || '';
    if (modalTitle)
      modalTitle.textContent = window.getTranslation('editShortcutTitle');
    setCustomIconVisibility(Boolean(existingItem.customIcon));
  } else {
    if (inputName) inputName.value = '';
    if (inputUrl) inputUrl.value = '';
    if (inputIcon) inputIcon.value = '';
    if (modalTitle)
      modalTitle.textContent = window.getTranslation('addShortcutTitle');
    setCustomIconVisibility(false);
  }
  setTimeout(() => inputName?.focus(), 100);
}

function setCustomIconVisibility(show: boolean): void {
  if (!customIconGroup || !toggleCustomIcon) return;
  const inputIcon = document.getElementById(
    'inputIcon',
  ) as HTMLInputElement | null;
  customIconGroup.classList.toggle('hidden', !show);
  toggleCustomIcon.classList.toggle('expanded', show);
  toggleCustomIcon.setAttribute('aria-expanded', show ? 'true' : 'false');
  if (!show && inputIcon) {
    inputIcon.value = '';
  }
}

function initCustomIconToggle(): void {
  if (!toggleCustomIcon || !customIconGroup) return;
  const inputIcon = getInputById('inputIcon');

  toggleCustomIcon.addEventListener('click', () => {
    const isHidden = customIconGroup.classList.contains('hidden');

    if (isHidden) {
      setCustomIconVisibility(true);
      if (inputIcon) {
        setTimeout(() => inputIcon.focus(), 50);
      }
    } else {
      setCustomIconVisibility(false);
    }
  });
}
function getActiveShortcutsList(): Shortcut[] {
  if (currentFolderId) {
    const folder = shortcuts.find((s) => s.id === currentFolderId);
    if (folder && folder.children) return folder.children;
  }
  return shortcuts;
}

interface WarningModalOptions {
  title: string;
  message: string;
  learnMoreUrl?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'accent' | 'danger';
  onConfirm: () => void;
  onCancel?: () => void;
}

class WarningModalManager {
  private overlay: HTMLElement;
  private titleEl: HTMLElement;
  private messageEl: HTMLElement;
  private btnConfirm: HTMLButtonElement;
  private btnCancel: HTMLButtonElement;
  private handleKeydownBound: (event: KeyboardEvent) => void;

  constructor() {
    this.overlay = document.getElementById('warningModal') as HTMLElement;
    this.titleEl = document.getElementById(
      'warning-modal-title',
    ) as HTMLElement;
    this.messageEl = document.getElementById(
      'warning-modal-message',
    ) as HTMLElement;
    this.btnConfirm = document.getElementById(
      'warning-btn-confirm',
    ) as HTMLButtonElement;
    this.btnCancel = document.getElementById(
      'warning-btn-cancel',
    ) as HTMLButtonElement;
    this.handleKeydownBound = this.handleKeydown.bind(this);
  }

  public show(options: WarningModalOptions): void {
    const confirmVariant = options.confirmVariant || 'accent';
    this.titleEl.textContent = options.title;
    this.messageEl.textContent = options.message;

    if (options.learnMoreUrl) {
      const link = document.createElement('a');
      link.href = options.learnMoreUrl;
      link.target = '_blank';
      link.textContent = getLocalizedWarningText(
        'learnMoreLabel',
        'Learn more',
      );
      link.style.display = 'inline-block';
      link.style.marginTop = '8px';
      link.style.color = 'var(--text-color)';
      link.style.textDecoration = 'underline';
      this.messageEl.appendChild(document.createElement('br'));
      this.messageEl.appendChild(link);
    }

    this.btnConfirm.textContent = options.confirmText || 'Confirm';
    this.btnCancel.textContent = options.cancelText || 'Cancel';
    this.btnConfirm.classList.toggle('btn-danger', confirmVariant === 'danger');
    this.btnConfirm.classList.toggle('btn-save', confirmVariant !== 'danger');

    this.overlay.classList.add('active');
    document.addEventListener('keydown', this.handleKeydownBound);

    this.btnConfirm.onclick = () => {
      this.close();
      options.onConfirm();
    };

    this.btnCancel.onclick = () => {
      this.close();
      if (options.onCancel) options.onCancel();
    };
  }

  private close(): void {
    this.overlay.classList.remove('active');
    document.removeEventListener('keydown', this.handleKeydownBound);
    this.btnConfirm.onclick = null;
    this.btnCancel.onclick = null;
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.overlay.classList.contains('active')) return;
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.btnConfirm.click();
  }
}

const warningModal = new WarningModalManager();

async function requestFeaturePermissionUI(
  feature: keyof typeof HOST_PERMISSIONS,
  apiName: string,
  learnMoreUrl: string,
  onGranted: () => void,
  onDenied: () => void,
): Promise<void> {
  const origins = HOST_PERMISSIONS[feature];
  if (!origins) {
    onGranted();
    return;
  }

  const hasPerm = await checkPermission(origins);
  if (hasPerm) {
    onGranted();
    return;
  }

  warningModal.show({
    title: getLocalizedWarningText(
      'permissionRequiredTitle',
      'Permission Required',
    ),
    message: getLocalizedWarningText(
      'permissionRequiredMessage',
      'To use this feature, Fluent New Tab needs permission to access "$API_NAME$". This ensures your privacy and security.',
      { API_NAME: apiName },
    ),
    learnMoreUrl: learnMoreUrl,
    confirmText: getLocalizedWarningText(
      'grantPermissionLabel',
      'Grant Permission',
    ),
    cancelText: getLocalizedWarningText('btnCancel', 'Cancel'),
    confirmVariant: 'accent',
    onConfirm: async () => {
      const granted = await requestPermission(origins);
      if (granted) onGranted();
      else onDenied();
    },
    onCancel: onDenied,
  });
}

function saveAndRender(): void {
  localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
  renderShortcuts();
}
function deleteShortcut(index: number): void {
  const targetArray = getActiveShortcutsList();
  const item = targetArray[index];

  if (item && item.type === 'folder') {
    const folderName =
      item.name ||
      getLocalizedWarningText('warningDeleteFolderTitle', 'Folder');
    warningModal.show({
      title: getLocalizedWarningText(
        'warningDeleteFolderTitle',
        'Delete Folder',
      ),
      message: getLocalizedWarningText(
        'warningDeleteFolderMessage',
        'Are you sure you want to delete the folder "$FOLDER$"? All shortcuts inside it will be removed.',
        { FOLDER: folderName },
      ),
      confirmText: getLocalizedWarningText('removeLabel', 'Remove'),
      cancelText: getLocalizedWarningText('btnCancel', 'Cancel'),
      confirmVariant: 'danger',
      onConfirm: () => {
        if (currentFolderId === item.id) currentFolderId = null;
        targetArray.splice(index, 1);
        saveAndRender();
      },
    });
    return;
  }

  targetArray.splice(index, 1);
  saveAndRender();
}
function updateShortcutsVisibility(visible: boolean, animate = true): void {
  if (shortcutsGrid) shortcutsGrid.style.display = visible ? 'grid' : 'none';
  if (rowsInputGroup) setCollapsible(rowsInputGroup, visible, animate);
  if (shortcutsMoreSetting)
    setCollapsible(shortcutsMoreSetting, visible, animate);
}
function renderShortcuts(): void {
  const performRender = (): void => {
    renderShortcutsGrid({
      shortcutsGrid,
      rowsSelect,
      shortcuts,
      currentFolderId: currentFolderId,
      onOpenModal: openModal,
      onDeleteShortcut: deleteShortcut,
      onClosePopups: closePopups,
      onOpenFolder: handleOpenFolder,
      onGoBack: handleGoBack,
    });
    updateSingleRowClass();
  };

  const animateAndRender = (nextFolderId: string | null): void => {
    currentFolderId = nextFolderId;
    performRender();
  };

  const handleOpenFolder = (id: string): void => {
    animateAndRender(id);
  };

  const handleGoBack = (): void => {
    animateAndRender(null);
  };

  performRender();
}

function updateSingleRowClass(): void {
  if (!shortcutsGrid) return;

  const COLUMNS = 10;

  const activeArray = currentFolderId
    ? shortcuts.find((s) => s.id === currentFolderId)?.children || []
    : shortcuts;

  const itemCount = activeArray.length;
  const backSlot = currentFolderId ? 1 : 0;
  const totalSlots = itemCount + 1 + backSlot;
  const isSingleRow = totalSlots < COLUMNS;

  shortcutsGrid.classList.toggle('single-row', isSingleRow);

  if (isSingleRow) {
    shortcutsGrid.style.setProperty('--shortcut-count', String(totalSlots));
  } else {
    shortcutsGrid.style.removeProperty('--shortcut-count');
  }
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
  if (searchWrapper)
    searchWrapper.style.display = searchBarVisible ? '' : 'none';
  if (toggleSearchBar) toggleSearchBar.checked = searchBarVisible;
  const showChildren = searchBarVisible;
  if (suggestionsRow) setCollapsible(suggestionsRow, showChildren, animate);
  if (clearSearchRow) setCollapsible(clearSearchRow, showChildren, animate);
  const compactBarRow = getById<HTMLDivElement>('compactBarRow');
  if (compactBarRow) setCollapsible(compactBarRow, showChildren, animate);
  const voiceSearchRow = getById<HTMLDivElement>('voiceSearchRow');
  if (voiceSearchRow) setCollapsible(voiceSearchRow, showChildren, animate);
  if (askAiRow) setCollapsible(askAiRow, showChildren, animate);
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
  voiceRecognition.stop();
}

function ensureVoiceRecognition(): any {
  if (!voiceSearchSupported || !SpeechRecognitionCtor) return null;
  if (voiceRecognition) return voiceRecognition;

  voiceRecognition = new SpeechRecognitionCtor();
  voiceRecognition.interimResults = false;
  voiceRecognition.continuous = false;
  voiceRecognition.maxAlternatives = 1;

  voiceRecognition.onstart = () => {
    voiceRecording = true;
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
  };

  voiceRecognition.onend = () => {
    const shouldSubmit = voiceShouldSubmitOnEnd;
    voiceRecording = false;
    voiceShouldSubmitOnEnd = false;
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
  if (!voiceSearchEnabled || !voiceSearchSupported || !searchBarVisible) return;

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
    recognition.start();
  } catch (error) {
    console.warn('Unable to start voice recognition.', error);
    voiceShouldSubmitOnEnd = false;
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
function updateUnitButtons(): void {
  if (!unitBtns) return;
  unitBtns.forEach((btn) => {
    if (btn.dataset.unit === weatherUnit) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}
function updateWeatherVisibility(animate = true): void {
  if (!weatherWidget || !cityInputGroup) return;
  const displayStyle = weatherEnabled ? 'flex' : 'none';
  weatherWidget.style.display = displayStyle;
  setCollapsible(cityInputGroup, weatherEnabled, animate);
  if (weatherUnitGroup)
    setCollapsible(weatherUnitGroup, weatherEnabled, animate);
}
function renderWeather(data: WeatherApiResponse | null): void {
  renderWeatherWidget(data, weatherUnit, currentCityData, {
    weatherCity,
    weatherTemp,
    weatherIcon,
    weatherWidget,
  });
}
function updateLauncherVisibility(animate = true): void {
  updateLauncherVisibilityUI(
    launcherEnabled,
    animate,
    {
      appLauncherWrapper,
      launcherSelectGroup,
    },
    setCollapsible,
  );
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
  if (wallpaperGrid) {
    wallpaperGrid.dataset.collapsibleDisplay = 'grid';
    setCollapsible(wallpaperGrid, enabled, animate);
  }

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
    overlaySetting.dataset.collapsibleDisplay = 'block';
    setCollapsible(overlaySetting, enabled, animate);
  }

  if (overlaySlider) updateOverlaySliderProgress(overlaySlider);
  setOverlayOpacity(wallpaperOverlay, false);
  if (toggleWallpaper) {
    const row = toggleWallpaper.closest('.switch-row');
    if (row) (row as HTMLElement).style.marginBottom = enabled ? '' : '0';
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
    subGreeting.style.display = 'block';
  } else if (preset === 'timedate') {
    if (subTime) subTime.style.display = 'block';
    if (subDate) subDate.style.display = 'block';
  }
}
function updateAnimationsDisabled(enabled: boolean): void {
  document.body.classList.toggle('animations-disabled', enabled);
}
function updateBlurDisabled(enabled: boolean): void {
  document.body.classList.toggle('blur-reduced', enabled);
}
function clearPresetSelection(): void {
  document
    .querySelectorAll('.wallpaper-option')
    .forEach((opt) => opt.classList.remove('selected'));
}
function highlightSelectedWallpaper(value: string): void {
  clearPresetSelection();
  if (value === 'custom' || value === 'upload') {
    const uploadBtn = document.querySelector('.upload-option');
    if (uploadBtn) uploadBtn.classList.add('selected');
  } else {
    const target = document.querySelector(
      `.wallpaper-option[data-value="${value}"]`,
    );
    if (target) target.classList.add('selected');
  }
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
  const max = parseFloat(slider.max || '1');
  const range = max - min || 1;
  const percentage = ((value - min) / range) * 100;
  slider.style.setProperty('--slider-progress', `${percentage}%`);
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
        console.log(`[Wallpaper] Serving ${source} from IndexedDB cache.`);
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
      return;
    }

    document.body.setAttribute('data-wallpaper-active', 'true');
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';

    if (currentWallpaperSource === 'local') {
      updateCreditsUI('local');
      if (currentWallpaperType === 'preset') {
        const presetMap: Record<string, string> = {
          preset_1: 'assets/wallpapers/fluent1.webp',
          preset_2: 'assets/wallpapers/fluent2.webp',
          preset_3: 'assets/wallpapers/fluent3.webp',
        };
        const imageUrl =
          presetMap[currentWallpaperValue] || presetMap['preset_1'];
        await applyWallpaperImage(imageUrl);
        void handleAutoAccentColor(imageUrl, `preset_${currentWallpaperValue}`);
      } else if (currentWallpaperType === 'upload') {
        await loadCustomWallpaper();
      }
    } else if (currentWallpaperSource === 'api') {
      console.log('[Debug] currentWallpaperType:', currentWallpaperType);
      console.log('[Debug] currentWallpaperSource:', currentWallpaperSource);
      const url = await fetchDailyWallpaper(currentWallpaperType);
      console.log('[Debug] url retornada:', url);
      if (url) {
        console.log(
          '[Debug] chamando getOptimizedApiWallpaper com source:',
          currentWallpaperType,
        );
        const optimizedUrl = await getOptimizedApiWallpaper(
          url,
          currentWallpaperType,
        );
        console.log('[Debug] optimizedUrl:', optimizedUrl);
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
            console.log('Using cached wallpaper as fallback.');
          } else {
            document.body.style.backgroundImage = 'none';
            document.body.removeAttribute('data-wallpaper-active');
          }
        } catch (e) {
          document.body.style.backgroundImage = 'none';
          document.body.removeAttribute('data-wallpaper-active');
        }
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
    }
  } catch (e) {
    console.error('Failed to load wallpaper:', e);
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
async function searchCity(): Promise<void> {
  if (!cityInput || !saveCityBtn) return;
  const query = cityInput.value.trim();
  if (!query) return;
  saveCityBtn.innerHTML = '...';
  try {
    const cityData = await fetchCityData(query);
    if (cityData) {
      currentCityData = cityData;
      localStorage.setItem(CITY_KEY, JSON.stringify(currentCityData));
      cityInput.value = cityData.name;
      fetchWeatherFromAPI(true);
    } else {
      alert('City not found.');
    }
  } catch (error) {
    alert('Error searching city.');
  } finally {
    saveCityBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  }
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

function initSortable() {
  if (!shortcutsGrid) return;

  let hoveredFolderEl: HTMLElement | null = null;
  const BODY_DRAG_CLASS = 'dragging-out-of-folder';
  let globalDragOverHandler: ((event: DragEvent) => void) | null = null;

  const clearFolderHover = (): void => {
    if (hoveredFolderEl) hoveredFolderEl.classList.remove('folder-drag-hover');
    hoveredFolderEl = null;
  };

  const getClientPoint = (
    event: Event | null | undefined,
  ): { x: number; y: number } | null => {
    if (!event) return null;
    if ('clientX' in event && 'clientY' in event) {
      const mouseEvt = event as MouseEvent;
      return { x: mouseEvt.clientX, y: mouseEvt.clientY };
    }
    const touchEvt = event as TouchEvent;
    const touch = touchEvt.touches?.[0] || touchEvt.changedTouches?.[0];
    if (touch) return { x: touch.clientX, y: touch.clientY };
    return null;
  };

  const setBodyDragOverlay = (enabled: boolean): void => {
    document.body.classList.toggle(BODY_DRAG_CLASS, enabled);
  };

  const detachGlobalDragOver = (): void => {
    if (globalDragOverHandler) {
      document.removeEventListener('dragover', globalDragOverHandler, true);
      globalDragOverHandler = null;
    }
  };

  const isPointOutsideGrid = (event: Event | null | undefined): boolean => {
    const point = getClientPoint(event);
    if (!point || !shortcutsGrid) return false;
    const rect = shortcutsGrid.getBoundingClientRect();
    return (
      point.x < rect.left ||
      point.x > rect.right ||
      point.y < rect.top ||
      point.y > rect.bottom
    );
  };

  const sortableOptions = {
    animation: 200,
    dragClass: 'sortable-dragging',
    ghostClass: 'sortable-placeholder',
    draggable: '.shortcut-item:not(.add-card-wrapper):not(.folder-back-btn)',
    filter: '.add-card-wrapper, .menu-wrapper, .folder-back-btn',
    handle: '.shortcut-card',
    delay: 120,
    delayOnTouchOnly: true,
    touchStartThreshold: 4,
    setData: function (dataTransfer, dragEl) {
      const link = dragEl.matches('.shortcut-card')
        ? dragEl
        : dragEl.querySelector('.shortcut-card');
      const url = link?.getAttribute('href');
      if (url) {
        dataTransfer.setData('text/uri-list', url);
        dataTransfer.setData('text/plain', url);
      }
    },

    onStart: (evt: any) => {
      shortcutsGrid.classList.add('sorting');
      document.body.classList.add('is-sorting-shortcuts');

      const draggedEl = (evt?.item || evt?.dragged) as HTMLElement | null;
      const isDraggingFolder = draggedEl?.dataset?.type === 'folder';
      const insideFolder = Boolean(currentFolderId);

      if (insideFolder && !isDraggingFolder) {
        globalDragOverHandler = (event: DragEvent) => {
          const outsideGrid = isPointOutsideGrid(event);
          setBodyDragOverlay(outsideGrid);
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        };
        document.addEventListener('dragover', globalDragOverHandler, true);
      }
    },

    onMove: (evt: any, originalEvent: DragEvent | TouchEvent | MouseEvent) => {
      document
        .querySelectorAll('.folder-drag-hover')
        .forEach((el) => el.classList.remove('folder-drag-hover'));

      const relatedEl = evt.related as HTMLElement | null;
      if (relatedEl?.classList.contains('add-card-wrapper')) return false;
      if (relatedEl?.classList.contains('folder-back-btn')) return false;

      const draggedEl = (evt?.dragged || evt?.item) as HTMLElement | null;
      const isDraggingFolder = draggedEl?.dataset?.type === 'folder';
      const insideFolder = Boolean(currentFolderId);

      const outsideGrid = insideFolder && isPointOutsideGrid(originalEvent);
      setBodyDragOverlay(outsideGrid);
      if (
        outsideGrid &&
        originalEvent &&
        'dataTransfer' in originalEvent &&
        originalEvent.dataTransfer
      ) {
        originalEvent.preventDefault();
        originalEvent.dataTransfer.dropEffect = 'move';
      }

      if (
        !currentFolderId &&
        !isDraggingFolder &&
        relatedEl?.dataset?.type === 'folder'
      ) {
        hoveredFolderEl = relatedEl;
        relatedEl.classList.add('folder-drag-hover');
        return false;
      }

      hoveredFolderEl = null;
      return true;
    },

    onEnd: function (evt: any) {
      shortcutsGrid.classList.remove('sorting');
      document.body.classList.remove('is-sorting-shortcuts');
      setBodyDragOverlay(false);
      detachGlobalDragOver();

      const draggedEl = evt?.item as HTMLElement | null;
      const targetArray = getActiveShortcutsList();
      const isInsideFolder = targetArray !== shortcuts;
      const indexOffset = isInsideFolder ? 1 : 0;
      const adjustedOldIndex = (evt.oldIndex ?? -1) - indexOffset;
      const adjustedNewIndex = (evt.newIndex ?? -1) - indexOffset;

      const originalEvent = evt?.originalEvent as Event | null;
      const folderDropTarget =
        !isInsideFolder &&
        hoveredFolderEl &&
        hoveredFolderEl.dataset.type === 'folder'
          ? hoveredFolderEl
          : null;
      const droppingOutsideGrid =
        isInsideFolder && isPointOutsideGrid(originalEvent);

      clearFolderHover();

      if (adjustedOldIndex < 0) return;

      const movedItem = targetArray[adjustedOldIndex];
      if (!movedItem) return;

      let queueRender = false;

      if (!isInsideFolder && folderDropTarget) {
        const folderId = folderDropTarget.dataset.id;
        const folderShortcut = shortcuts.find(
          (s) => s.id === folderId && s.type === 'folder',
        );

        if (!folderShortcut || movedItem.type === 'folder') {
          queueRender = true;
        } else {
          const folderChildren = folderShortcut.children || [];
          if (folderChildren.length >= MAX_FOLDER_CAPACITY) {
            showGridLimitWarning(MAX_FOLDER_CAPACITY, true);
            queueRender = true;
          } else {
            targetArray.splice(adjustedOldIndex, 1);
            folderShortcut.children = folderChildren;
            folderChildren.push(movedItem);
            queueRender = true;
          }
        }
      } else if (droppingOutsideGrid) {
        const maxMain = Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);
        if (shortcuts.length >= maxMain) {
          showGridLimitWarning(maxMain, false);
          queueRender = true;
        } else {
          targetArray.splice(adjustedOldIndex, 1);
          shortcuts.push(movedItem);
          queueRender = true;
        }
      } else if (evt.oldIndex !== evt.newIndex && adjustedNewIndex >= 0) {
        const reorderedItem = targetArray.splice(adjustedOldIndex, 1)[0];
        if (reorderedItem) {
          targetArray.splice(adjustedNewIndex, 0, reorderedItem);
          queueRender = true;
        }
      }

      if (queueRender) {
        requestAnimationFrame(() => {
          saveAndRender();
        });
      }
    },
  } as { setData: (dataTransfer: DataTransfer, dragEl: HTMLElement) => void };

  Sortable.create(shortcutsGrid, sortableOptions as any);
}
async function initWeather() {
  const cachedString = localStorage.getItem(CACHE_KEY);
  if (cachedString) {
    const cached = JSON.parse(cachedString) as WeatherCache;
    const now = Date.now();
    if (
      now - cached.timestamp < CACHE_DURATION &&
      cached.city === currentCityData.name
    ) {
      renderWeather(cached.data);
      return;
    }
  }
  fetchWeatherFromAPI();
}
async function fetchWeatherFromAPI(forceUpdate = false): Promise<void> {
  if (!weatherEnabled) return;
  try {
    const data = await fetchWeatherData(currentCityData);
    if (!data) return;
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        city: currentCityData.name,
        data: data,
      }),
    );
    renderWeather(data);
  } catch (error) {
    weatherTemp.textContent = '--';
  }
}
function renderLauncher(providerKey: keyof typeof launcherData): void {
  renderLauncherApps(launcherData[providerKey], {
    launcherGrid,
    launcherAllAppsLink,
  });
}

function toTitleCase(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getLocalizedWarningText(
  key: string,
  fallback: string,
  replacements?: Record<string, string>,
): string {
  let text = window.getTranslation(key);
  if (!text || text === key) text = fallback;

  if (replacements) {
    Object.entries(replacements).forEach(([token, value]) => {
      text = text.replace(new RegExp(`\\$${token}\\$`, 'g'), value);
    });
  }

  return text;
}

function getLauncherProviderKey(): keyof typeof launcherData {
  const rawProvider = launcherProvider?.value as
    | keyof typeof launcherData
    | undefined;
  if (rawProvider && launcherData[rawProvider]) return rawProvider;
  return currentProvider;
}

function getLauncherFolderName(providerKey: keyof typeof launcherData): string {
  const label = launcherProvider?.selectedOptions?.[0]?.textContent?.trim();
  if (label) return label;
  return toTitleCase(String(providerKey));
}

function createFolderFromLauncher(
  providerKey: keyof typeof launcherData,
): boolean {
  const providerData = launcherData[providerKey];
  if (!providerData?.apps?.length) return false;

  const folderName = getLauncherFolderName(providerKey);
  const newFolder: Shortcut = {
    id: `folder_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'folder',
    name: folderName,
    children: providerData.apps.slice(0, 9).map((app) => ({
      type: 'link',
      name: app.name,
      url: app.url,
      customIcon: app.icon,
    })),
  };

  const limit = Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);
  if (shortcuts.length >= limit) {
    warningModal.show({
      title: getLocalizedWarningText('warningGridFullTitle', 'Grid is Full'),
      message: getLocalizedWarningText(
        'warningGridFullMessage',
        'You have reached the maximum limit of $LIMIT$ shortcuts on the main screen. Delete some items or group them into a folder to free up space.',
        { LIMIT: String(limit) },
      ),
      confirmText: getLocalizedWarningText('warningUnderstood', 'Understood'),
      cancelText: getLocalizedWarningText('warningClose', 'Close'),
      onConfirm: () => {},
    });
    return false;
  }

  shortcuts.push(newFolder);
  foldersEnabled = true;
  if (toggleFolders) toggleFolders.checked = true;
  localStorage.setItem('foldersEnabled', 'true');
  updateLauncherFooterVariant();
  saveAndRender();
  closePopups();
  return true;
}

function bindLauncherFolderButton(): void {
  if (!btnLauncherToFolder) return;

  btnLauncherToFolder.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const providerKey = getLauncherProviderKey();
    const providerData = launcherData[providerKey];
    const ecosystemName = getLauncherFolderName(providerKey);

    if (!providerData?.apps?.length) {
      warningModal.show({
        title: getLocalizedWarningText(
          'launcherNoAppsTitle',
          'No Apps Available',
        ),
        message: getLocalizedWarningText(
          'launcherNoAppsAvailable',
          'No apps available for this ecosystem.',
        ),
        confirmText: getLocalizedWarningText('warningUnderstood', 'Understood'),
        cancelText: getLocalizedWarningText('warningClose', 'Close'),
        confirmVariant: 'accent',
        onConfirm: () => {},
      });
      return;
    }

    warningModal.show({
      title: getLocalizedWarningText(
        'warningAddEcosystemAppsTitle',
        `Add ${ecosystemName} Apps?`,
        {
          ECOSYSTEM: ecosystemName,
        },
      ),
      message: getLocalizedWarningText(
        'warningAddEcosystemAppsMessage',
        `This will create a folder with 9 ${ecosystemName} apps in your shortcuts. Continue?`,
        { ECOSYSTEM: ecosystemName },
      ),
      confirmText: getLocalizedWarningText(
        'warningAddFolderConfirm',
        'Add Folder',
      ),
      cancelText: getLocalizedWarningText('btnCancel', 'Cancel'),
      confirmVariant: 'accent',
      onConfirm: () => {
        createFolderFromLauncher(providerKey);
      },
    });
  });
}

function updateLauncherFooterVariant(): void {
  if (!launcherPopup) return;
  launcherPopup.classList.toggle('folders-enabled', foldersEnabled);
}

function updateCreditsUI(
  source: string,
  creditText?: string,
  creditUrl?: string,
) {
  const creditsContainer = getById<HTMLDivElement>('wallpaperCredits');
  const creditsSpan = getById<HTMLSpanElement>('wallpaperCreditText');

  if (!creditsContainer || !creditsSpan) return;

  if (source === 'local' || source === 'preset' || source === 'upload') {
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
function applyInitialSearchBarVisibility() {
  updateSearchSettings(false);
  if (toggleSearchBar) {
    toggleSearchBar.checked = searchBarVisible;
  }
}
function applyInitialSuggestionsActive() {
  if (toggleSuggestions) {
    toggleSuggestions.checked = suggestionsActive;
  }
}
function applyInitialClearSearch() {
  if (toggleClearSearch) {
    toggleClearSearch.checked = clearSearchEnabled;
  }
  updateGoogleParams();
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
function applyInitialVoiceSearch() {
  if (toggleVoiceSearch) {
    toggleVoiceSearch.checked = voiceSearchEnabled;
  }
  updateVoiceSearchAvailability();
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
  updateWeatherVisibility(false);
  updateUnitButtons();
  if (weatherEnabled) initWeather();
}
function applyInitialLauncherState() {
  if (toggleLauncher) toggleLauncher.checked = launcherEnabled;
  if (launcherProvider) launcherProvider.value = currentProvider;
  updateLauncherVisibility(false);
  if (launcherEnabled) renderLauncher(currentProvider);
}
function applyInitialWallpaperState() {
  if (toggleWallpaper) {
    toggleWallpaper.checked = wallpaperEnabled;
    updateWallpaperUIState(wallpaperEnabled, false);
  }

  if (currentWallpaperSource === 'api' && wallpaperSourceSelect) {
    wallpaperSourceSelect.value = currentWallpaperType;
    clearPresetSelection();
  } else {
    if (wallpaperSourceSelect) wallpaperSourceSelect.value = 'noSource';
    highlightSelectedWallpaper(currentWallpaperValue);
  }
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
    if (localStorage.getItem(key) !== null) return;
    localStorage.setItem(key, value);
    restoredAny = true;
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
  const translated = window.getTranslation(messageKey);
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
  const translated = window.getTranslation(messageKey);
  if (translated && translated !== messageKey) return translated;
  return "Today's APOD is a video or unavailable. Keeping your current wallpaper instead.";
}

function showNasaApodWarningNotice(): void {
  if (document.querySelector('.update-release-notice.nasa-apod-warning'))
    return;

  const notice = document.createElement('div');
  notice.className = 'update-release-notice nasa-apod-warning';

  const icon = document.createElement('span');
  icon.className = 'update-release-notice-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML =
    '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.91 2.782a2.25 2.25 0 0 1 2.975.74l.083.138 7.759 14.009a2.25 2.25 0 0 1-1.814 3.334l-.154.006H4.243a2.25 2.25 0 0 1-2.041-3.197l.072-.143L10.031 3.66a2.25 2.25 0 0 1 .878-.878Zm9.505 15.613-7.76-14.008a.75.75 0 0 0-1.254-.088l-.057.088-7.757 14.008a.75.75 0 0 0 .561 1.108l.095.006h15.516a.75.75 0 0 0 .696-1.028l-.04-.086-7.76-14.008 7.76 14.008ZM12 16.002a.999.999 0 1 1 0 1.997.999.999 0 0 1 0-1.997ZM11.995 8.5a.75.75 0 0 1 .744.647l.007.102.004 4.502a.75.75 0 0 1-1.494.103l-.006-.102-.004-4.502a.75.75 0 0 1 .75-.75Z" fill="currentColor"/></svg>';

  const message = document.createElement('span');
  message.className = 'update-release-notice-prefix';
  message.textContent = getLocalizedNasaApodNoticeMessage();

  notice.append(icon, message);
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

  window.setTimeout(hideNotice, 9000);
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

  const icon = document.createElement('span');
  icon.className = 'update-release-notice-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML =
    '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.443 1.443 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.571a1.444 1.444 0 0 0 .017 2.734l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.528.527.7Zm-.374-4.25a4.054 4.054 0 0 0-.363-.413h.003a4.394 4.394 0 0 0-1.72-1.063l-1.6-.508 1.611-.524a4.4 4.4 0 0 0 1.69-1.065 4.448 4.448 0 0 0 1.041-1.708l.515-1.582.516 1.587a4.374 4.374 0 0 0 2.781 2.773l1.62.522-1.59.515a4.379 4.379 0 0 0-2.774 2.775l-.515 1.582-.515-1.585a4.368 4.368 0 0 0-.7-1.306Zm8.041 9.297a1.123 1.123 0 0 1-.41-.549l-.328-1.007a1.293 1.293 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.819l.324-.992a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005Zm-1.03-3.783A2.789 2.789 0 0 1 17 18.708a2.794 2.794 0 0 1 1.7-1.7 2.813 2.813 0 0 1-1.718-1.708A2.806 2.806 0 0 1 15.3 17Z" fill="currentColor"/></svg>';

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

function getSfx(type: 'mic' | 'ai'): HTMLAudioElement | null {
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
    searchInput.placeholder = 'Ask to AI';
    if (inactiveIcon) inactiveIcon.style.display = 'none';
    if (activeIcon) activeIcon.style.display = 'block';
  } else {
    searchWrapper.classList.remove('ask-ai-active');
    searchInput.placeholder = 'Search the web';
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
    toggleAccentColor,
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

function initVisual() {
  if (toggleDisplay) {
    toggleDisplay.checked = localStorage.getItem('displayEnabled') !== 'false';
    updateDisplaySettingsVisibility(toggleDisplay.checked, false);
  }

  applyInitialAnimationsDisabled();
  applyInitialBlurDisabled();
  applyInitialReducedEffectsState();

  renderShortcuts();
  initSortable();
  bindExternalShortcutDrop();
  applyInitialShortcutsVisibility();
  applyInitialFoldersSetting();
  applyInitialSearchBarVisibility();
  updateAskAiBtnVisibility();
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

  bindDisplayFeature({
    displayTypeSelect,
    displayAdvancedSetting,
    displayToggleBtn,
    displaySliderContainer,
    subGreeting,
    subTime,
    subDate,
  });

  bindShortcutRadiusFeature({
    shortcutRadiusSlider,
    shortcutRadiusRow,
    getShortcutRadius: () => shortcutRadius,
    setShortcutRadius: (radius: string) => {
      shortcutRadius = radius;
    },
  });

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
        displayAdvancedSetting.style.display = hasAdvanced ? 'block' : 'none';
      }

      if (hasAdvanced && displaySliderContainer && displayToggleBtn) {
        displaySliderContainer.classList.add('collapsed');
        displayToggleBtn.classList.remove('expanded');
        displaySliderContainer.style.maxHeight = '';
      }

      if (preset === 'greeting' && subGreeting)
        subGreeting.style.display = 'block';
      if (preset === 'time' && subTime) subTime.style.display = 'block';
      if (preset === 'date' && subDate) subDate.style.display = 'block';
      if (preset === 'advanced') {
        if (subTime) subTime.style.display = 'block';
        if (subDate) subDate.style.display = 'block';
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
      if (!askAiMode) return;
      e.preventDefault();
      const query = searchInput?.value || '';
      handleAskAiSubmit(query);
      setAskAiMode(false);
      if (searchInput) searchInput.value = '';
      clearSuggestions();
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

  if (greetingStyleSelect) {
    greetingStyleSelect.value = localStorage.getItem('greetingStyle') || '3d';
    greetingStyleSelect.addEventListener('change', (e) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('greetingStyle', target.value);
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

  [addModal, chooseTypeModal, addFolderModal].forEach((modal) => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  });

  initCustomIconToggle();

  if (shortcutForm) {
    shortcutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputName = getInputById('inputName');
      const inputUrl = getInputById('inputUrl');
      const inputIcon = getInputById('inputIcon');
      if (!inputName || !inputUrl) return;

      let url = inputUrl.value || '';
      if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
      const newShortcut: Shortcut = {
        type: 'link',
        name: inputName.value,
        url: url,
        customIcon: inputIcon?.value || null,
      };
      const targetArray = getActiveShortcutsList();

      if (editingIndex !== null && editingIndex >= 0) {
        targetArray[editingIndex] = {
          ...targetArray[editingIndex],
          ...newShortcut,
        };
      } else {
        const limit = currentFolderId
          ? MAX_FOLDER_CAPACITY
          : Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);
        if (targetArray.length >= limit) {
          showGridLimitWarning(limit, Boolean(currentFolderId));
          return;
        }
        targetArray.push(newShortcut);
      }

      saveAndRender();
      editingIndex = null;
      closeModal();
    });
  }

  const btnChooseLink = document.getElementById('btnChooseLink');
  const btnChooseFolder = document.getElementById('btnChooseFolder');
  const closeChooseTypeBtn = document.getElementById('closeChooseTypeBtn');
  const closeFolderModalBtn = document.getElementById('closeFolderModalBtn');
  const folderForm = document.getElementById('folderForm');

  if (closeChooseTypeBtn)
    closeChooseTypeBtn.addEventListener('click', closeModal);
  if (closeFolderModalBtn)
    closeFolderModalBtn.addEventListener('click', closeModal);

  if (btnChooseLink) {
    btnChooseLink.addEventListener('click', () => {
      openShortcutModal(null);
    });
  }

  if (btnChooseFolder) {
    btnChooseFolder.addEventListener('click', () => {
      editingIndex = null;
      openFolderModal('', false);
    });
  }

  if (folderForm) {
    folderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const folderNameInput = inputFolderName;
      if (!folderNameInput) return;

      const targetArray = shortcuts;
      if (
        editingIndex !== null &&
        editingIndex >= 0 &&
        targetArray[editingIndex]
      ) {
        targetArray[editingIndex] = {
          ...targetArray[editingIndex],
          name: folderNameInput.value,
        };
      } else {
        const limit = allowedRows * 10;
        if (targetArray.length >= limit) {
          showGridLimitWarning(limit, false);
          return;
        }
        targetArray.push({
          id: 'folder_' + Date.now().toString(),
          type: 'folder',
          name: folderNameInput.value,
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

  const toggleCompact = getById<HTMLInputElement>('toggleCompactBar');

  bindSearchFeature({
    applyInitialSearchEngine,
    engineBtn,
    dropdown,
    closePopups,
    items,
    hasEngine: (engine) => engine in engines,
    setSearchEngine,
    applyInitialSearchBarVisibility,
    toggleSearchBar,
    setSearchBarVisible: (visible) => {
      searchBarVisible = visible;
    },
    updateSearchSettings,
    applyInitialSuggestionsActive,
    toggleSuggestions,
    getSuggestionsActive: () => suggestionsActive,
    setSuggestionsActive: (enabled) => {
      suggestionsActive = enabled;
    },
    clearSuggestions,
    applyInitialClearSearch,
    toggleClearSearch,
    setClearSearchEnabled: (enabled) => {
      clearSearchEnabled = enabled;
    },
    updateGoogleParams,
    toggleCompact,
    getCompactBarEnabled: () => compactBarEnabled,
    setCompactBarEnabled: (enabled) => {
      compactBarEnabled = enabled;
    },
    updateCompactBarStyle,
    applyInitialVoiceSearch,
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
    unitBtns,
    setWeatherUnit: (unit) => {
      weatherUnit = unit;
    },
    updateUnitButtons,
    saveCityBtn,
    cityInput,
    searchCity,
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
    wallpaperOptions,
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
    highlightSelectedWallpaper,
    uploadOption,
    uploadInput,
    processWallpaperImage,
    saveWallpaperToDB,
    clearPresetSelection,
    getCurrentWallpaperSource: () => currentWallpaperSource,
    getCurrentWallpaperType: () => currentWallpaperType,
  });

  if (languageSelect) {
    const savedLang = localStorage.getItem('userLanguage');
    const defaultLang = 'en_US';

    if (savedLang) {
      languageSelect.value = savedLang;
    } else {
      const optionExists = Array.from(languageSelect.options).some(
        (o) => o.value === defaultLang,
      );
      languageSelect.value = optionExists
        ? defaultLang
        : languageSelect.options[0]?.value || 'en';
    }

    languageSelect.addEventListener('change', (e) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('userLanguage', target.value);
      location.reload();
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
      APP_KEYS.forEach((key) => {
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
          const data = JSON.parse(
            String((event.target as FileReader).result || '{}'),
          ) as BackupPayload;
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
              APP_KEYS.forEach((key) => {
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
          warningModal.show({
            title: getLocalizedWarningText(
              'warningInvalidBackupTitle',
              'Invalid Backup File',
            ),
            message: getLocalizedWarningText(
              'warningInvalidBackupMessage',
              'The selected file is not a valid backup.',
            ),
            confirmText: getLocalizedWarningText(
              'warningUnderstood',
              'Understood',
            ),
            cancelText: getLocalizedWarningText('warningClose', 'Close'),
            confirmVariant: 'accent',
            onConfirm: () => {},
          });
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
}

async function initDeferred() {
  window.addEventListener('wallpaper-api-warning', (event: Event) => {
    const wallpaperWarning = event as CustomEvent<{ source?: string }>;
    if (wallpaperWarning.detail?.source !== 'nasa') return;
    showNasaApodWarningNotice();
  });

  window.addEventListener('beforeunload', () => {
    void persistPreferencesBackup();
  });

  await persistPreferencesBackup();

  const updateState = await getUpdateNoticeState();
  if (updateState.pending) {
    pendingUpdateNoticeVersion =
      updateState.version || chrome.runtime.getManifest().version;
    if (document.body.classList.contains('loaded')) {
      showPendingUpdateNoticeIfAny();
    }
  }
  const fadeEl = document.getElementById('wallpaper-fade');
  if (fadeEl) {
    fadeEl.addEventListener('transitionend', () => fadeEl.remove(), {
      once: true,
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const restoredFromBackup = await restorePreferencesBackupIfNeeded();
  if (restoredFromBackup) {
    await persistPreferencesBackup();
    location.reload();
    return;
  }

  initCritical();

  requestAnimationFrame(() => {
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
