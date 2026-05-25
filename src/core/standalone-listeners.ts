/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import {
  languageSelect,
  tabNameInput,
  tabFaviconInput,
  tabFaviconUploadBtn,
  tabFaviconFileInput,
  weatherMoreBtn,
  shortcutsMoreBtn,
  displayTypeSelect,
  displayAdvancedSetting,
  subGreeting,
  subTime,
  subDate,
  toggleSeconds,
  toggle12Hour,
  dateFormatSelect,
  greetingNameInput,
  greetingTypeSelect,
  displayToggleBtn,
  displaySliderContainer,
  askAiBtn,
  toggleAskAi,
  voiceSearchBtn,
  searchForm,
  searchInput,
  weatherMoreContainer,
  shortcutsMoreContainer,
  greetingWrapper,
} from './dom-references.js';
import { setCollapsible } from './ui-components.js';
import { setAskAiMode, setAskAiEnabled, askAiMode } from './state.js';
import { getSelectTarget, getInputTarget } from './dom-utils.js';
import { initDisplayWidget } from './display.js';

declare const window: any;
declare const document: any;
declare const localStorage: any;
declare const FileReader: any;

export function initStandaloneListeners(): void {
  if (languageSelect) {
    languageSelect.addEventListener('change', (e: Event) => {
      const target = getSelectTarget(e);
      if (!target) return;
      const novoIdioma = target.value;
      localStorage.setItem('userLanguage', novoIdioma);
      const cacheKey = `i18n_cache_${novoIdioma}`;
      localStorage.removeItem(cacheKey);

      if (typeof window.loadTranslations === 'function') {
        window.loadTranslations();
      } else if (typeof (window as any).applyTranslations === 'function') {
        (window as any).applyTranslations();
      } else {
        window.location.reload();
      }
    });
  }

  if (tabNameInput) {
    tabNameInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      localStorage.setItem('tabName', target.value);
      if (target.value.trim() === '') {
        document.title = 'Fluent New Tab';
      } else {
        document.title = target.value;
      }
    });
  }

  if (tabFaviconInput) {
    tabFaviconInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      localStorage.setItem('tabIcon', target.value);
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = target.value;
    });

    tabFaviconInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      localStorage.setItem('tabIcon', target.value);
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = target.value;
      }
    });
  }

  if (tabFaviconUploadBtn && tabFaviconFileInput) {
    tabFaviconUploadBtn.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      tabFaviconFileInput.click();
    });

    tabFaviconFileInput.addEventListener('change', async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            if (tabFaviconInput) tabFaviconInput.value = result;
            localStorage.setItem('tabIcon', result);
            let link = document.querySelector(
              "link[rel~='icon']",
            ) as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = result;
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error uploading favicon:', error);
        }
      }
    });
  }

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
        weatherMoreContainer.style.maxHeight = '0px';
      }
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
        shortcutsMoreContainer.style.maxHeight = '0px';
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      const query = searchInput?.value || '';
      if (query.trim() === '') return;
      if (askAiMode) {
        window.location.href = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      } else {
        searchForm.submit();
      }
    });
  }

  if (voiceSearchBtn) {
    voiceSearchBtn.addEventListener('click', () => {
      if (typeof (window as any).startVoiceSearch === 'function') {
        (window as any).startVoiceSearch();
      }
    });
  }

  if (askAiBtn) {
    askAiBtn.addEventListener('click', () => {
      setAskAiMode(!askAiMode);
      if (searchInput) searchInput.focus();
    });
  }

  if (toggleAskAi) {
    toggleAskAi.addEventListener('change', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      setAskAiEnabled(target.checked);
      localStorage.setItem('askAiEnabled', String(target.checked));
      if (askAiBtn) askAiBtn.style.display = target.checked ? 'flex' : 'none';
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
        if (!displaySliderContainer.classList.contains('collapsed')) {
          displaySliderContainer.classList.add('collapsed');
          displayToggleBtn.classList.remove('expanded');
          displaySliderContainer.style.maxHeight = '';
        }
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

    displayTypeSelect.addEventListener('change', (e: Event) => {
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

      if (greetingWrapper) {
        greetingWrapper.dataset.lastCache = '';
        initDisplayWidget(greetingWrapper);
      }
    });
  }

  if (toggleSeconds) {
    toggleSeconds.addEventListener('change', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('showSeconds', String(target.checked));
      if (greetingWrapper) initDisplayWidget(greetingWrapper);
    });
  }

  if (toggle12Hour) {
    toggle12Hour.addEventListener('change', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('use12Hour', String(target.checked));
      if (greetingWrapper) initDisplayWidget(greetingWrapper);
    });
  }

  if (dateFormatSelect) {
    dateFormatSelect.addEventListener('change', (e: Event) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('dateFormat', target.value);
      if (greetingWrapper) initDisplayWidget(greetingWrapper);
    });
  }

  if (greetingNameInput) {
    greetingNameInput.addEventListener('input', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('greetingName', target.value);
      if (greetingWrapper) {
        greetingWrapper.dataset.lastCache = '';
        initDisplayWidget(greetingWrapper);
      }
    });
  }

  if (greetingTypeSelect) {
    greetingTypeSelect.addEventListener('change', (e: Event) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('greetingType', target.value);
      if (greetingWrapper) {
        greetingWrapper.dataset.lastCache = '';
        initDisplayWidget(greetingWrapper);
      }
    });
  }
}

function updateDisplaySubControlsUI(
  type: string,
  animateCollapse = true,
): void {
  const getRow = (el: HTMLElement | null) =>
    el?.closest('.switch-row, .child-setting') as HTMLElement | null;

  const isGreeting = type === 'greeting';
  const isTime = type === 'time';
  const isDate = type === 'date';
  const isTimeDate = type === 'time-date' || type === 'timedate';

  if (greetingNameInput)
    getRow(greetingNameInput)?.classList.toggle('hidden', !isGreeting);
  if (greetingTypeSelect)
    getRow(greetingTypeSelect)?.classList.toggle('hidden', !isGreeting);

  if (toggleSeconds)
    getRow(toggleSeconds)?.classList.toggle('hidden', !(isTime || isTimeDate));
  if (toggle12Hour)
    getRow(toggle12Hour)?.classList.toggle('hidden', !(isTime || isTimeDate));

  if (dateFormatSelect)
    getRow(dateFormatSelect)?.classList.toggle(
      'hidden',
      !(isDate || isTimeDate),
    );
  if (
    displaySliderContainer &&
    !displaySliderContainer.classList.contains('collapsed')
  ) {
    if (displayToggleBtn) displayToggleBtn.classList.remove('expanded');
    setCollapsible(displaySliderContainer, false, animateCollapse);
  }
}
