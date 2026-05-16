/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const DEFAULT_LOCALE = 'en_US';

const APP_KEYS = [
  'shortcuts',
  'theme',
  'weatherEnabled',
  'weatherAlertsEnabled',
  'fluent_city_data',
  'shortcutsVisible',
  'shortcutsRows',
  'foldersEnabled',
  'launcherEnabled',
  'launcherProvider',
  'showGreeting',
  'greetingName',
  'greetingType',
  'userLanguage',
  'searchEngine',
  'searchBarVisible',
  'suggestionsEnabled',
  'clearSearchEnabled',
  'compactBarEnabled',
  'voiceSearchEnabled',
  'weatherUnit',
  'wallpaperEnabled',
  'wallpaperSource',
  'wallpaperType',
  'wallpaperValue',
  'animationsDisabled',
  'blurDisabled',
  'reducedEffectsEnabled',
  'accentColorEnabled',
  'accentColorMode',
  'accentColorValue',
  'displayEnabled',
  'displayType',
  'showSeconds',
  'use12Hour',
  'dateFormat',
  'askAiEnabled',
  'displayPreset',
  'shortcutRadius',
  'hideShortcutNames',
  'wallpaperOverlay',
  'displayScale',
  'tabName',
  'tabFavicon',
];

const SHORTCUTS_TREE_KEY = 'shortcutsTree';
let translations = {};

async function loadTranslations() {
  const lang = localStorage.getItem('userLanguage') || 'en_US';
  const cacheKey = `i18n_cache_${lang}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      translations = JSON.parse(cached);
      applyTranslations();
      return;
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  let messages = null;

  try {
    const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
    const res = await fetch(url);
    if (res.ok) messages = await res.json();
  } catch {}

  if (!messages) {
    try {
      const url = chrome.runtime.getURL('crowdin/messages.json');
      const res = await fetch(url);
      if (res.ok) messages = await res.json();
    } catch {}
  }

  if (messages) {
    translations = messages;
    localStorage.setItem(cacheKey, JSON.stringify(translations));
  }

  applyTranslations();
}

function t(key) {
  return translations[key] ? translations[key].message : key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (!value || value === key) return;

    if (el.tagName === 'INPUT') {
      el.placeholder = value;
    } else if (el.tagName === 'OPTION') {
      el.textContent = value;
    } else {
      el.textContent = value;
    }
  });
}

function saveBlankSheet() {
  localStorage.setItem('theme', 'auto');
  localStorage.setItem('accentColorEnabled', 'false');
  localStorage.setItem('displayEnabled', 'false');
  localStorage.setItem('searchBarVisible', 'false');
  localStorage.setItem('shortcutsVisible', 'false');
  localStorage.setItem('launcherEnabled', 'true');
  localStorage.setItem('wallpaperEnabled', 'false');
  localStorage.setItem('weatherEnabled', 'false');
  localStorage.setItem('reducedEffectsEnabled', 'true');
  localStorage.setItem('showGreeting', 'false');
}

const btnSkip = document.getElementById('btn-skip');
if (btnSkip) {
  btnSkip.addEventListener('click', () => {
    saveBlankSheet();
    showStep('final');
  });
}

function applyTheme(theme) {
  const html = document.documentElement;
  html.removeAttribute('data-theme');
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else if (theme === 'auto') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-theme', 'dark');
    }
  }
}

function applyAccentColor(color) {
  document.documentElement.style.setProperty('--accent-color', color);
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  document.documentElement.style.setProperty(
    '--accent-contrast',
    yiq >= 128 ? '#202020' : '#ffffff',
  );
}

function getCurrentTheme() {
  return localStorage.getItem('theme') || 'auto';
}

function getCurrentAccent() {
  return localStorage.getItem('accentColorValue') || '#0078D4';
}

function saveAppearance() {
  const theme =
    document.querySelector('.theme-circle-big.active')?.dataset.theme || 'auto';
  const accent =
    document.querySelector('.accent-option.active')?.dataset.color || '#0078D4';
  const name = document.getElementById('input-name')?.value.trim() || '';
  const lang = document.getElementById('select-language')?.value || 'en_US';

  const tabName = document.getElementById('input-tab-name')?.value.trim() || '';
  if (tabName) localStorage.setItem('tabName', tabName);

  localStorage.setItem('theme', theme);
  localStorage.setItem('accentColorEnabled', 'true');
  localStorage.setItem('accentColorMode', 'manual');
  localStorage.setItem('accentColorValue', accent);
  localStorage.setItem('greetingName', name);
  localStorage.setItem('userLanguage', lang);
}

function saveWidgets() {
  const toggleDisplay = document.getElementById('toggle-display');
  const selectDisplay = document.getElementById('select-display');
  const displayEnabled = toggleDisplay ? toggleDisplay.checked : true;
  const displayType = selectDisplay ? selectDisplay.value : 'greeting';
  const toggleSearch = document.getElementById('toggle-search');
  const selectSearch = document.getElementById('select-search');
  const searchEnabled = toggleSearch ? toggleSearch.checked : true;
  const searchEngine = selectSearch ? selectSearch.value : 'system';
  const toggleShortcuts = document.getElementById('toggle-shortcuts');
  const selectShortcuts = document.getElementById('select-shortcuts');
  const shortcutsEnabled = toggleShortcuts ? toggleShortcuts.checked : true;
  const shortcutsRows = selectShortcuts ? selectShortcuts.value : '2';
  const toggleLauncher = document.getElementById('toggle-launcher');
  const selectLauncher = document.getElementById('select-launcher');
  const launcherEnabled = toggleLauncher ? toggleLauncher.checked : true;
  const launcherProvider = selectLauncher ? selectLauncher.value : 'microsoft';

  localStorage.setItem('displayEnabled', String(displayEnabled));
  localStorage.setItem('displayType', displayType);
  localStorage.setItem('displayPreset', displayType);
  localStorage.setItem(
    'showGreeting',
    String(displayEnabled && displayType === 'greeting'),
  );

  localStorage.setItem('searchBarVisible', String(searchEnabled));
  localStorage.setItem('searchEngine', searchEngine);

  localStorage.setItem('shortcutsVisible', String(shortcutsEnabled));
  localStorage.setItem('shortcutsRows', shortcutsRows);

  localStorage.setItem('launcherEnabled', String(launcherEnabled));
  localStorage.setItem('launcherProvider', launcherProvider);

  localStorage.setItem('reducedEffectsEnabled', 'false');
  localStorage.setItem('wallpaperEnabled', 'false');
  localStorage.setItem('weatherEnabled', 'false');
}

const STEPS_ORDER = ['welcome', 'appearance', 'widgets', 'final'];

function showStep(stepId) {
  const current = document.querySelector('.step.active');
  const next = document.getElementById(`step-${stepId}`);
  if (!next) return;

  if (current) {
    const currentId = current.id.replace('step-', '');
    const currentIndex = STEPS_ORDER.indexOf(currentId);
    const nextIndex = STEPS_ORDER.indexOf(stepId);

    if (currentIndex !== -1 && nextIndex !== -1) {
      const directionClass =
        nextIndex > currentIndex ? 'slide-next' : 'slide-prev';

      document.body.classList.remove('slide-next', 'slide-prev');
      void document.body.offsetWidth;
      document.body.classList.add(directionClass);
    }
    current.classList.remove('active');
  } else {
    document.body.classList.add('slide-next');
  }

  next.classList.add('active');
  localStorage.setItem('setup_current_step', stepId);
}

function initThemePicker() {
  const saved = getCurrentTheme();
  const buttons = document.querySelectorAll('.theme-circle-big');
  buttons.forEach((btn) => {
    if (btn.dataset.theme === saved) btn.classList.add('active');
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.dataset.theme;
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    });
  });
}

function initAccentPicker() {
  const saved = getCurrentAccent();
  const buttons = document.querySelectorAll('.accent-option');
  buttons.forEach((btn) => {
    if (btn.dataset.color.toLowerCase() === saved.toLowerCase()) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const color = btn.dataset.color;
      localStorage.setItem('accentColorValue', color);
      localStorage.setItem('accentColorEnabled', 'true');
      localStorage.setItem('accentColorMode', 'manual');
      applyAccentColor(color);
    });
  });
}

function initNameInput() {
  const input = document.getElementById('input-name');
  if (!input) return;
  input.value = localStorage.getItem('greetingName') || '';
  input.addEventListener('input', () => {
    localStorage.setItem('greetingName', input.value.trim());
  });
}

function initLanguageSelect() {
  const select = document.getElementById('select-language');
  if (!select) return;
  const saved = localStorage.getItem('userLanguage') || 'en_US';
  select.value = saved;
  select.addEventListener('change', () => {
    localStorage.setItem('userLanguage', select.value);
    const cacheKey = `i18n_cache_${select.value}`;
    localStorage.removeItem(cacheKey);
    loadTranslations();
  });
}

function initWidgetToggles() {
  const pairs = [
    {
      toggle: 'toggle-display',
      select: 'select-display',
      storage: 'displayEnabled',
    },
    {
      toggle: 'toggle-search',
      select: 'select-search',
      storage: 'searchBarVisible',
    },
    {
      toggle: 'toggle-shortcuts',
      select: 'select-shortcuts',
      storage: 'shortcutsVisible',
    },
    {
      toggle: 'toggle-launcher',
      select: 'select-launcher',
      storage: 'launcherEnabled',
    },
  ];

  pairs.forEach(({ toggle, select, storage }) => {
    const toggleEl = document.getElementById(toggle);
    const selectEl = document.getElementById(select);
    if (!toggleEl || !selectEl) return;

    const isEnabled =
      localStorage.getItem(storage) !== 'false' &&
      (storage !== 'launcherEnabled' ||
        localStorage.getItem(storage) === 'true');

    toggleEl.checked = isEnabled;
    selectEl.disabled = !isEnabled;

    const block = toggleEl.closest('.setting-block');
    if (block) {
      if (!isEnabled) block.classList.add('is-disabled');
      else block.classList.remove('is-disabled');
    }

    toggleEl.addEventListener('change', () => {
      selectEl.disabled = !toggleEl.checked;
      if (block) {
        if (!toggleEl.checked) block.classList.add('is-disabled');
        else block.classList.remove('is-disabled');
      }
    });
  });

  const btnAppearanceBack = document.getElementById('btnBack');
  if (btnAppearanceBack) {
    btnAppearanceBack.addEventListener('click', () => showStep('welcome'));
  }

  const btnWidgetsBack = document.getElementById('btn-widgets-back');
  if (btnWidgetsBack) {
    btnWidgetsBack.addEventListener('click', () => showStep('appearance'));
  }

  const savedDisplayType = localStorage.getItem('displayPreset') || 'greeting';
  const displaySelect = document.getElementById('select-display');
  if (displaySelect) displaySelect.value = savedDisplayType;

  const savedEngine = localStorage.getItem('searchEngine') || 'system';
  const searchSelect = document.getElementById('select-search');
  if (searchSelect) searchSelect.value = savedEngine;

  const savedRows = localStorage.getItem('shortcutsRows') || '2';
  const shortcutsSelect = document.getElementById('select-shortcuts');
  if (shortcutsSelect) shortcutsSelect.value = savedRows;

  const savedLauncher = localStorage.getItem('launcherProvider') || 'microsoft';
  const launcherSelect = document.getElementById('select-launcher');
  if (launcherSelect) launcherSelect.value = savedLauncher;
}

function showPopupError(message) {
  const overlay = document.getElementById('warningModal');
  const msgEl = document.getElementById('warning-modal-message');
  if (!overlay || !msgEl) return;
  msgEl.textContent = message;
  overlay.classList.add('active');
}

function hidePopup() {
  const overlay = document.getElementById('warningModal');
  if (overlay) overlay.classList.remove('active');
}

function handleRestoreFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(String(e.target.result || '{}'));
      const hasValidKey = APP_KEYS.some((key) => typeof data[key] === 'string');

      if (!hasValidKey) {
        showPopupError(t('wizardRestoreError'));
        return;
      }

      APP_KEYS.forEach((key) => {
        if (typeof data[key] === 'string') localStorage.setItem(key, data[key]);
      });

      const treeBackup = data[SHORTCUTS_TREE_KEY];
      if (typeof treeBackup === 'string') {
        localStorage.setItem('shortcuts', treeBackup);
      }

      showStep('final');
    } catch {
      showPopupError(t('wizardRestoreError'));
    }
  };
  reader.readAsText(file);
}

function init() {
  loadTranslations();

  chrome.storage.local.get('fluent_persistent_backup_v1', (data) => {
    const backup = data.fluent_persistent_backup_v1;
    if (backup) {
      APP_KEYS.forEach((key) => {
        if (localStorage.getItem(key) === null && backup[key] !== undefined) {
          localStorage.setItem(key, backup[key]);
        }
      });
      if (
        localStorage.getItem(SHORTCUTS_TREE_KEY) === null &&
        backup[SHORTCUTS_TREE_KEY] !== undefined
      ) {
        localStorage.setItem(SHORTCUTS_TREE_KEY, backup[SHORTCUTS_TREE_KEY]);
      }
    }
  });

  const savedTheme = getCurrentTheme();
  applyTheme(savedTheme);

  const savedStep = localStorage.getItem('setup_current_step') || 'welcome';
  if (savedStep !== 'final') {
    showStep(savedStep);
  } else {
    showStep('welcome');
  }

  const savedAccent = getCurrentAccent();
  if (localStorage.getItem('accentColorEnabled') === 'true') {
    applyAccentColor(savedAccent);
  }

  initThemePicker();
  initAccentPicker();
  initNameInput();
  initLanguageSelect();
  initWidgetToggles();

  const btnSkip = document.getElementById('btn-skip');
  if (btnSkip) {
    btnSkip.addEventListener('click', () => {
      saveBlankSheet();
      showStep('final');
    });
  }

  const btnRestore = document.getElementById('btn-restore');
  const restoreInput = document.getElementById('restore-file-input');

  if (btnRestore && restoreInput) {
    btnRestore.addEventListener('click', () => restoreInput.click());
    restoreInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleRestoreFile(file);
      restoreInput.value = '';
    });
  }

  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => showStep('appearance'));
  }

  const btnAppearanceNext = document.getElementById('btnNext');
  if (btnAppearanceNext) {
    btnAppearanceNext.addEventListener('click', () => {
      saveAppearance();
      showStep('widgets');
    });
  }

  const btnWarningCancel = document.getElementById('warning-btn-cancel');
  if (btnWarningCancel) {
    btnWarningCancel.addEventListener('click', hidePopup);
  }

  const warningOverlay = document.getElementById('warningModal');
  if (warningOverlay) {
    warningOverlay.addEventListener('click', (e) => {
      if (e.target === warningOverlay) hidePopup();
    });
  }

  const btnWidgetsNext = document.getElementById('btn-widgets-next');
  if (btnWidgetsNext) {
    btnWidgetsNext.addEventListener('click', () => {
      saveWidgets();
      showStep('final');
    });
  }

  const btnFinalStart = document.getElementById('btn-final-start');
  if (btnFinalStart) {
    btnFinalStart.addEventListener('click', () => {
      chrome.tabs.update({ url: chrome.runtime.getURL('index.html') });
    });
  }

  const btnPopupClose = document.getElementById('btn-popup-close');
  if (btnPopupClose) {
    btnPopupClose.addEventListener('click', hidePopup);
  }

  const popupOverlay = document.getElementById('restore-popup');
  if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) hidePopup();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
