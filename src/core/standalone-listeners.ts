import {
  languageSelect,
  tabNameInput,
  tabFaviconInput,
  tabFaviconUploadBtn,
  tabFaviconFileInput,
  weatherMoreBtn,
  shortcutsMoreBtn,
  displayTypeSelect,
  toggleSeconds,
  toggle12Hour,
  dateFormatSelect,
  greetingNameInput,
  greetingTypeSelect,
  askAiBtn,
  toggleAskAi,
  voiceSearchBtn,
  searchForm,
  searchInput,
  weatherMoreContainer,
  shortcutsMoreContainer,
  greetingWrapper,
} from './dom-references.js';

import {
  setAskAiMode,
  setAskAiEnabled,
  askAiMode,
} from './state.js';

import { getSelectTarget, getInputTarget } from './dom-utils.js';
import { initDisplayWidget } from './display.js';

declare const window: any;
declare const document: any;
declare const localStorage: any;
declare const FileReader: any;

export function initStandaloneListeners(): void {
  // 1. Language Select
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

  // 2. Tab Customization
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
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
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

  // 3. Weather & Shortcuts More Settings
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
      const isCollapsed = shortcutsMoreContainer.classList.contains('collapsed');
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

  // 4. Search and AI
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

  // 5. Display Configs
  if (displayTypeSelect) {
    displayTypeSelect.addEventListener('change', (e: Event) => {
      const target = getSelectTarget(e);
      if (!target) return;
      localStorage.setItem('displayType', target.value);
      // Clear the cached mode so initDisplayWidget rebuilds from scratch
      if (greetingWrapper) {
        greetingWrapper.dataset.currentMode = '';
        greetingWrapper.dataset.lastCache = '';
        if (target.value === 'none') {
          greetingWrapper.innerHTML = '';
          greetingWrapper.style.display = 'none';
        } else {
          initDisplayWidget(greetingWrapper);
        }
      }
    });
  }

  if (toggleSeconds) {
    toggleSeconds.addEventListener('change', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      // display.ts reads 'showSeconds'
      localStorage.setItem('showSeconds', String(target.checked));
      if (greetingWrapper) initDisplayWidget(greetingWrapper);
    });
  }

  if (toggle12Hour) {
    toggle12Hour.addEventListener('change', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      // display.ts reads 'use12Hour'
      localStorage.setItem('use12Hour', String(target.checked));
      if (greetingWrapper) initDisplayWidget(greetingWrapper);
    });
  }

  if (dateFormatSelect) {
    dateFormatSelect.addEventListener('change', (e: Event) => {
      const target = getSelectTarget(e);
      if (!target) return;
      // display.ts reads 'dateFormat'
      localStorage.setItem('dateFormat', target.value);
      if (greetingWrapper) initDisplayWidget(greetingWrapper);
    });
  }
  
  if (greetingNameInput) {
    greetingNameInput.addEventListener('input', (e: Event) => {
      const target = getInputTarget(e);
      if (!target) return;
      localStorage.setItem('greetingName', target.value);
      // Clear greeting cache so it re-renders with new name
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
      // Clear greeting cache to apply new animation/static mode
      if (greetingWrapper) {
        greetingWrapper.dataset.lastCache = '';
        initDisplayWidget(greetingWrapper);
      }
    });
  }
}
