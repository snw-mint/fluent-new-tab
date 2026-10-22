/*
 * Fluent New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const DEFAULT_LOCALE = 'en_US';
const SHORTCUTS_TREE_KEY = 'shortcutsTree';
let translations = {};

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
  'shortcutRadius',
  'hideShortcutNames',
  'wallpaperOverlay',
  'displayScale',
  'displayScale_greeting',
  'displayScale_time',
  'displayScale_timedate',
  'displayScale_date',
  'displayScale_weekday',
  'tabName',
  'tabFavicon',
];

const SUPPORTED_LOCALES = [
  'cs_CZ', 'da_DK', 'de_DE', 'el_GR', 'en_US', 'es_ES',
  'fil_PH', 'fi_FI', 'fr_FR', 'hu_HU', 'id_ID', 'it_IT',
  'ja_JP', 'ko_KR', 'nl_NL', 'pl_PL', 'pt_BR', 'ro_RO',
  'ru_RU', 'sv_SE', 'tr_TR', 'uk_UA', 'vi_VN', 'zh_CN', 'zh_TW',
];

const STEPS_ORDER = ['welcome', 'appearance', 'widgets', 'final'];

const WIDGET_PAIRS = [
  { toggle: 'toggle-display', select: 'select-display', storage: 'displayEnabled', defaultVal: 'displayType', fallback: 'greeting' },
  { toggle: 'toggle-search', select: 'select-search', storage: 'searchBarVisible', defaultVal: 'searchEngine', fallback: 'system' },
  { toggle: 'toggle-shortcuts', select: 'select-shortcuts', storage: 'shortcutsVisible', defaultVal: 'shortcutsRows', fallback: '2' },
  { toggle: 'toggle-launcher', select: 'select-launcher', storage: 'launcherEnabled', defaultVal: 'launcherProvider', fallback: 'microsoft' },
];

function detectUserLanguage() {
  const saved = localStorage.getItem('userLanguage');
  if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;

  let browserLang = '';
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n && typeof chrome.i18n.getUILanguage === 'function') {
      browserLang = chrome.i18n.getUILanguage();
    }
  } catch { }

  if (!browserLang && typeof navigator !== 'undefined') {
    browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
  }

  if (!browserLang) return DEFAULT_LOCALE;

  const normalized = browserLang.replace('-', '_');
  const exact = SUPPORTED_LOCALES.find((loc) => loc.toLowerCase() === normalized.toLowerCase());
  if (exact) {
    localStorage.setItem('userLanguage', exact);
    return exact;
  }

  const prefix = browserLang.split(/[-_]/)[0].toLowerCase();
  if (prefix === 'zh') {
    const chosen = /tw|hk|mo|hant/i.test(browserLang) ? 'zh_TW' : 'zh_CN';
    localStorage.setItem('userLanguage', chosen);
    return chosen;
  }
  if (prefix === 'tl' || prefix === 'fil') {
    localStorage.setItem('userLanguage', 'fil_PH');
    return 'fil_PH';
  }

  const prefixMatch = SUPPORTED_LOCALES.find((loc) => loc.toLowerCase().startsWith(prefix + '_'));
  const match = prefixMatch || DEFAULT_LOCALE;
  localStorage.setItem('userLanguage', match);
  return match;
}

async function fetchLocale(loc) {
  const res = await fetch(chrome.runtime.getURL(`_locales/${loc}/messages.json`));
  if (!res.ok) throw new Error('File not found');
  return res.json();
}

async function loadTranslations() {
  const lang = detectUserLanguage();
  const cacheKey = `i18n_cache_${lang}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const msg = JSON.parse(cached);
      if (lang === 'en_US' || msg.wizardRestoreTitle) {
        translations = msg;
        applyTranslations();
        return;
      }
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  let defMsg = {};
  try {
    defMsg = await fetchLocale('en_US');
  } catch { }

  let langMsg = {};
  if (lang !== 'en_US') {
    try {
      langMsg = await fetchLocale(lang);
    } catch { }
  }

  translations = Object.assign({}, defMsg, langMsg);
  localStorage.setItem(cacheKey, JSON.stringify(translations));
  applyTranslations();
}

function t(key, fallback) {
  return translations[key]?.message ?? (fallback !== undefined ? fallback : key);
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
    } else if (key === 'wizardWelcomeTitle' || key === 'wizardFinalTitle') {
      const parts = value.split(' ');
      if (parts.length > 1) {
        const last = parts.pop();
        const capitalizedLast = last.charAt(0).toUpperCase() + last.slice(1);
        const rest = parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        el.innerHTML = `${rest} <span class="welcome-title-home">${capitalizedLast}</span>`;
      } else {
        el.innerHTML = `<span class="welcome-title-home">${value}</span>`;
      }
    } else {
      el.textContent = value;
    }
  });
}

function applyTheme(theme) {
  const html = document.documentElement;
  html.removeAttribute('data-theme');
  if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.setAttribute('data-theme', 'dark');
  }
}

function applyAccentColor(color) {
  document.documentElement.style.setProperty('--accent-color', color);
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  document.documentElement.style.setProperty('--accent-contrast', yiq >= 128 ? '#202020' : '#ffffff');
}

function getCurrentTheme() {
  return localStorage.getItem('theme') || 'auto';
}

function getCurrentAccent() {
  return localStorage.getItem('accentColorValue') || '#0078D4';
}

function showStep(stepId) {
  const current = document.querySelector('.step.active');
  const next = document.getElementById(`step-${stepId}`);
  if (!next) return;

  if (current) {
    const currentId = current.id.replace('step-', '');
    const currentIndex = STEPS_ORDER.indexOf(currentId);
    const nextIndex = STEPS_ORDER.indexOf(stepId);

    if (currentIndex !== -1 && nextIndex !== -1) {
      const directionClass = nextIndex > currentIndex ? 'slide-next' : 'slide-prev';
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

function saveAppearance() {
  const theme = document.querySelector('.theme-circle-big.active')?.dataset.theme || 'auto';
  const accent = document.querySelector('.accent-option.active')?.dataset.color || '#0078D4';
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
  const getChecked = (id) => {
    const el = document.getElementById(id);
    return el ? el.checked : true;
  };
  const getValue = (id, fallback) => {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
  };

  const displayEnabled = getChecked('toggle-display');
  const displayType = getValue('select-display', 'greeting');
  const searchEnabled = getChecked('toggle-search');
  const searchEngine = getValue('select-search', 'system');
  const shortcutsEnabled = getChecked('toggle-shortcuts');
  const shortcutsRows = getValue('select-shortcuts', '2');
  const launcherEnabled = getChecked('toggle-launcher');
  const launcherProvider = getValue('select-launcher', 'microsoft');

  localStorage.setItem('displayEnabled', String(displayEnabled));
  localStorage.setItem('displayType', displayType);
  localStorage.setItem('showGreeting', String(displayEnabled && displayType === 'greeting'));
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
  select.value = detectUserLanguage();
  select.addEventListener('change', () => {
    localStorage.setItem('userLanguage', select.value);
    localStorage.removeItem(`i18n_cache_${select.value}`);
    loadTranslations();
  });
}

function initWidgetToggles() {
  WIDGET_PAIRS.forEach(({ toggle, select, storage, defaultVal, fallback }) => {
    const toggleEl = document.getElementById(toggle);
    const selectEl = document.getElementById(select);
    if (!toggleEl || !selectEl) return;

    const isEnabled = localStorage.getItem(storage) !== 'false';
    toggleEl.checked = isEnabled;
    selectEl.disabled = !isEnabled;

    const block = toggleEl.closest('.setting-block');
    if (block) block.classList.toggle('is-disabled', !isEnabled);

    const savedVal = localStorage.getItem(defaultVal) || fallback;
    selectEl.value = savedVal;

    toggleEl.addEventListener('change', () => {
      selectEl.disabled = !toggleEl.checked;
      if (block) block.classList.toggle('is-disabled', !toggleEl.checked);
    });
  });
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

function syncSelectTriggers() {
  document.querySelectorAll('.fluent-select-trigger').forEach((trigger) => {
    const targetId = trigger.getAttribute('data-target');
    const select = document.getElementById(targetId);
    if (!select) return;
    const triggerValue = trigger.querySelector('.fluent-select-value');
    const selectedOption = select.options[select.selectedIndex];
    if (triggerValue && selectedOption) {
      triggerValue.textContent = selectedOption.textContent;
      if (selectedOption.hasAttribute('data-i18n')) {
        triggerValue.setAttribute('data-i18n', selectedOption.getAttribute('data-i18n'));
      } else {
        triggerValue.removeAttribute('data-i18n');
      }
    }
  });
}

function initCustomSelectSystem() {
  const popup = document.getElementById('fluent-select-popup');
  const listContainer = popup?.querySelector('.fluent-select-options-list');
  const triggers = document.querySelectorAll('.fluent-select-trigger');
  if (!popup || !listContainer) return;

  let activeTrigger = null;

  const closePopup = () => {
    popup.classList.remove('active');
    triggers.forEach((t) => t.classList.remove('popup-open'));
    activeTrigger = null;
  };

  const positionPopup = (trigger) => {
    const rect = trigger.getBoundingClientRect();
    popup.style.width = `${rect.width}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;
    const popupHeight = Math.min(260, listContainer.scrollHeight);
    const placeAbove = rect.bottom + popupHeight > window.innerHeight && rect.top - popupHeight > 0;
    popup.style.top = placeAbove
      ? `${rect.top + window.scrollY - popupHeight - 2}px`
      : `${rect.bottom + window.scrollY + 2}px`;
  };

  const openPopup = (trigger) => {
    if (activeTrigger === trigger) {
      closePopup();
      return;
    }

    closePopup();
    const nativeSelect = document.getElementById(trigger.getAttribute('data-target'));
    if (!nativeSelect || nativeSelect.disabled) return;

    activeTrigger = trigger;
    trigger.classList.add('popup-open');
    listContainer.innerHTML = '';

    Array.from(nativeSelect.options).forEach((option) => {
      const li = document.createElement('li');
      li.className = `fluent-select-option${option.selected ? ' selected' : ''}`;
      li.textContent = option.textContent;
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', option.value);
      if (option.selected) li.setAttribute('aria-selected', 'true');

      li.addEventListener('click', (e) => {
        e.stopPropagation();
        nativeSelect.value = option.value;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        syncSelectTriggers();
        closePopup();
      });

      listContainer.appendChild(li);
    });

    popup.classList.add('active');
    positionPopup(trigger);

    const currentSelected = listContainer.querySelector('.fluent-select-option.selected');
    if (currentSelected) {
      listContainer.scrollTop = currentSelected.offsetTop - listContainer.offsetTop;
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openPopup(trigger);
    });
  });

  document.addEventListener('click', closePopup);
  window.addEventListener('resize', () => {
    if (activeTrigger) positionPopup(activeTrigger);
  });
  document.querySelectorAll('.split-main').forEach((container) => {
    container.addEventListener('scroll', () => {
      if (activeTrigger) positionPopup(activeTrigger);
    });
  });
}

function initBookmarkImport() {
  const btn = document.getElementById('importBookmarksBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    chrome.permissions.request({ permissions: ['bookmarks'] }, (granted) => {
      if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
      if (!granted) return;

      chrome.bookmarks.getTree((nodes) => {
        const result = [];
        const processNode = (node, currentList, depth) => {
          if (node.url) {
            currentList.push({
              id: `bm_${node.id}_${Date.now()}`,
              name: node.title ? node.title.substring(0, 40) : 'Bookmark',
              url: node.url,
            });
          } else if (node.children) {
            if (depth === 2) {
              const folder = {
                id: `folder_${node.id}_${Date.now()}`,
                type: 'folder',
                name: node.title ? node.title.substring(0, 40) : 'Folder',
                children: [],
              };
              node.children.forEach((child) => processNode(child, folder.children, depth + 1));
              if (folder.children.length > 40) folder.children = folder.children.slice(0, 40);
              if (folder.children.length > 0) currentList.push(folder);
            } else {
              node.children.forEach((child) => processNode(child, currentList, depth + 1));
            }
          }
        };

        nodes.forEach((node) => processNode(node, result, 0));

        let finalResult = result;
        if (result.length > 40) {
          const mainItems = result.slice(0, 39);
          const othersFolder = {
            id: `folder_others_${Date.now()}`,
            type: 'folder',
            name: 'Others',
            children: [],
          };
          result.slice(39).forEach((item) => {
            if (item.type !== 'folder') othersFolder.children.push(item);
            else if (item.children) othersFolder.children.push(...item.children.filter((c) => c.type !== 'folder'));
          });
          if (othersFolder.children.length > 40) othersFolder.children = othersFolder.children.slice(0, 40);
          if (othersFolder.children.length > 0) mainItems.push(othersFolder);
          finalResult = mainItems;
        }

        const count = finalResult.length;
        const rows = count > 30 ? 4 : count > 20 ? 3 : count > 10 ? 2 : 1;

        localStorage.setItem('shortcuts', JSON.stringify(finalResult));
        localStorage.setItem('shortcutsRows', String(rows));

        const shortcutsSelect = document.getElementById('select-shortcuts');
        if (shortcutsSelect) {
          shortcutsSelect.value = String(rows);
          shortcutsSelect.dispatchEvent(new Event('change', { bubbles: true }));
          syncSelectTriggers();
        }

        const originalText = btn.textContent;
        btn.textContent = 'Imported!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      });
    });
  });
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
      if (localStorage.getItem(SHORTCUTS_TREE_KEY) === null && backup[SHORTCUTS_TREE_KEY] !== undefined) {
        localStorage.setItem(SHORTCUTS_TREE_KEY, backup[SHORTCUTS_TREE_KEY]);
      }
    }
  });

  applyTheme(getCurrentTheme());
  applyAccentColor(getCurrentAccent());

  const savedStep = localStorage.getItem('setup_current_step') || 'welcome';
  const splashScreen = document.getElementById('splash-screen');
  const stepWelcome = document.getElementById('step-welcome');

  if (splashScreen) {
    if (savedStep !== 'welcome') {
      splashScreen.style.display = 'none';
      if (stepWelcome) stepWelcome.classList.add('ready');
    } else {
      setTimeout(() => {
        if (stepWelcome) stepWelcome.classList.add('ready');
      }, 3200);
      setTimeout(() => {
        splashScreen.style.display = 'none';
      }, 3700);
    }
  } else if (stepWelcome) {
    stepWelcome.classList.add('ready');
  }

  showStep(savedStep !== 'final' ? savedStep : 'welcome');

  initThemePicker();
  initAccentPicker();
  initNameInput();
  initLanguageSelect();
  initWidgetToggles();
  initBookmarkImport();
  initCustomSelectSystem();
  syncSelectTriggers();

  document.getElementById('btn-skip')?.addEventListener('click', () => showStep('final'));
  document.getElementById('btn-start')?.addEventListener('click', () => showStep('appearance'));
  document.getElementById('btnBack')?.addEventListener('click', () => showStep('welcome'));
  document.getElementById('btnNext')?.addEventListener('click', () => {
    saveAppearance();
    showStep('widgets');
  });
  document.getElementById('btn-widgets-back')?.addEventListener('click', () => showStep('appearance'));
  document.getElementById('btn-widgets-next')?.addEventListener('click', () => {
    saveWidgets();
    showStep('final');
  });
  document.getElementById('btn-final-start')?.addEventListener('click', () => {
    chrome.tabs.update({ url: chrome.runtime.getURL('index.html') });
  });

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

  document.getElementById('warning-btn-cancel')?.addEventListener('click', hidePopup);
  const warningOverlay = document.getElementById('warningModal');
  if (warningOverlay) {
    warningOverlay.addEventListener('click', (e) => {
      if (e.target === warningOverlay) hidePopup();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
