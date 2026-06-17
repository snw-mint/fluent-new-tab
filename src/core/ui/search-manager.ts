/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import * as refs from '@/core/shared/dom-refs';
import { requestFeaturePermissionUI } from '@/core/ui/ui-components';
import { performSearch } from '@/core/boot/search';
import {
  handleAskAiRedirect,
  updateAskAiUiState,
  registerVoiceSearchEngine,
} from '@/core/lazy/search-features';

export function bindSearchFeature(options: any): void {
  const localSuggestionsCache = new Map<string, string[]>();
  if (refs.toggleSearchBar) {
    refs.toggleSearchBar.checked =
      localStorage.getItem('searchBarVisible') !== 'false';
    refs.toggleSearchBar.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setSearchBarVisible(target.checked);
      localStorage.setItem('searchBarVisible', String(target.checked));
      options.updateSearchSettings();
    });
  }

  if (refs.searchMoreBtn && refs.searchMoreContainer) {
    refs.searchMoreBtn.addEventListener('click', () => {
      const isCollapsed =
        refs.searchMoreContainer.classList.contains('collapsed');
      if (isCollapsed) {
        import('@/core/ui/settings').then((m) =>
          m.resetSettingsAccordions(refs.searchMoreContainer),
        );
        refs.searchMoreContainer.classList.remove('collapsed');
        refs.searchMoreBtn.classList.add('expanded');
        refs.searchMoreContainer.style.maxHeight = '500px';
      } else {
        refs.searchMoreContainer.classList.add('collapsed');
        refs.searchMoreBtn.classList.remove('expanded');
        refs.searchMoreContainer.style.maxHeight = '';
      }
    });
  }

  if (refs.searchBarStyleSelect) {
    refs.searchBarStyleSelect.value = options.getCompactBarEnabled()
      ? 'compact'
      : 'full';
    // Dispatch change so fluent-select updates its UI
    refs.searchBarStyleSelect.dispatchEvent(
      new Event('change', { bubbles: true }),
    );
    refs.searchBarStyleSelect.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      const isCompact = target.value === 'compact';
      options.setCompactBarEnabled(isCompact);
      localStorage.setItem('compactBarEnabled', String(isCompact));
      if (isCompact)
        document.documentElement.setAttribute('data-compact-bar', 'true');
      else document.documentElement.removeAttribute('data-compact-bar');
      options.updateCompactBarStyle();
    });
  }

  if (refs.toggleVoiceSearch) {
    refs.toggleVoiceSearch.checked =
      localStorage.getItem('voiceSearchEnabled') === 'true';
    refs.toggleVoiceSearch.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setVoiceSearchEnabled(target.checked);
      localStorage.setItem('voiceSearchEnabled', String(target.checked));
      options.updateVoiceSearchAvailability();
    });
  }

  if (refs.toggleClearSearch) {
    refs.toggleClearSearch.checked =
      localStorage.getItem('clearSearchEnabled') === 'true';
    refs.toggleClearSearch.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      options.setClearSearchEnabled(target.checked);
      localStorage.setItem('clearSearchEnabled', String(target.checked));
      options.updateGoogleParams();
    });
  }

  if (refs.engineBtn && refs.dropdown) {
    refs.engineBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (options.closePopups) {
        options.closePopups(refs.dropdown);
      } else {
        import('@/core/ui/settings').then((m) => m.closePopups(refs.dropdown));
      }
      refs.dropdown?.classList.toggle('active');
    });

    refs.items.forEach((item) => {
      item.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const engine = target.dataset.engine || 'bing';
        if (options.hasEngine(engine)) {
          localStorage.setItem('searchEngine', engine);
          options.setSearchEngine(engine);
        }
        refs.dropdown?.classList.remove('active');
      });
    });

    document.addEventListener('click', (event) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;
      if (refs.dropdown?.classList.contains('active')) {
        if (
          !refs.dropdown.contains(targetNode) &&
          !refs.engineBtn?.contains(targetNode)
        ) {
          refs.dropdown.classList.remove('active');
        }
      }
    });
  }

  if (refs.searchInput) {
    const handleInput = options.debounce((event: Event) => {
      const target = event.target as HTMLInputElement;
      const query = target.value.trim();
      if (!query || !options.getSuggestionsActive()) {
        options.clearSuggestions();
        return;
      }

      const cacheKey = query.toLowerCase();
      const currentCache = options.suggestionsCache || localSuggestionsCache;

      if (currentCache.has(cacheKey)) {
        options.renderSuggestions(currentCache.get(cacheKey)!);
      } else {
        options.fetchSuggestions(query);
      }
    }, 150);

    refs.searchInput.addEventListener('input', handleInput);
    refs.searchInput.addEventListener('focus', handleInput);
    refs.searchInput.addEventListener('keydown', (event) => {
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
    if (!targetNode || !refs.searchInput) return;
    const container = document.getElementById('suggestionsContainer');
    if (container && container.classList.contains('active')) {
      if (
        !container.contains(targetNode) &&
        !refs.searchInput.contains(targetNode)
      ) {
        options.clearSuggestions();
      }
    }
  });

  if (refs.toggleSuggestions) {
    refs.toggleSuggestions.checked =
      localStorage.getItem('suggestionsEnabled') === 'true';
    refs.toggleSuggestions.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      if (target.checked) {
        requestFeaturePermissionUI(
          'suggestions',
          'DuckDuckGo Search Suggestions',
          'https://duckduckgo.com',
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

  let askAiActiveMode = false;
  if (refs.askAiBtn) {
    refs.askAiBtn.addEventListener('click', () => {
      askAiActiveMode = !askAiActiveMode;
      updateAskAiUiState(askAiActiveMode, {
        searchWrapper: refs.searchWrapper,
        searchInput: refs.searchInput,
        askAiBtn: refs.askAiBtn,
      });
    });
  }

  if (refs.searchForm) {
    refs.searchForm.addEventListener('submit', (event) => {
      const currentEngine = localStorage.getItem('searchEngine') || 'bing';

      if (askAiActiveMode) {
        event.preventDefault();
        handleAskAiRedirect(refs.searchInput?.value || '');
        askAiActiveMode = false;
        if (refs.searchInput) refs.searchInput.value = '';
        updateAskAiUiState(false, {
          searchWrapper: refs.searchWrapper,
          searchInput: refs.searchInput,
          askAiBtn: refs.askAiBtn,
        });
        options.clearSuggestions();
      } else if (currentEngine === 'system') {
        event.preventDefault();
        const query = refs.searchInput?.value || '';
        options.clearSuggestions();
        performSearch(query, 'system');
      } else {
        options.clearSuggestions();
      }
    });
  }

  if (refs.voiceSearchBtn) {
    registerVoiceSearchEngine({
      voiceSearchBtn: refs.voiceSearchBtn,
      searchInput: refs.searchInput,
      searchForm: refs.searchForm,
      getVoiceEnabled: () =>
        localStorage.getItem('voiceSearchEnabled') === 'true',
    });
  }

  if (refs.toggleAskAi) {
    refs.toggleAskAi.checked = localStorage.getItem('askAiEnabled') !== 'false';
    refs.toggleAskAi.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      localStorage.setItem('askAiEnabled', String(target.checked));
      if (refs.askAiBtn)
        refs.askAiBtn.style.display = target.checked ? 'flex' : 'none';
    });
  }

  if (refs.toggleVisualSearch) {
    const isVisualSearchEnabled =
      localStorage.getItem('visualSearchEnabled') === 'true';
    refs.toggleVisualSearch.checked = isVisualSearchEnabled;
    if (refs.visualSearchBtn) {
      refs.visualSearchBtn.style.display = isVisualSearchEnabled
        ? 'flex'
        : 'none';
    }
    refs.toggleVisualSearch.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      if (target.checked) {
        requestFeaturePermissionUI(
          'visualSearch',
          'Google Lens',
          'https://lens.google.com',
          () => {
            localStorage.setItem('visualSearchEnabled', 'true');
            if (refs.visualSearchBtn)
              refs.visualSearchBtn.style.display = 'flex';
          },
          () => {
            target.checked = false;
          },
        );
      } else {
        localStorage.setItem('visualSearchEnabled', 'false');
        if (refs.visualSearchBtn) refs.visualSearchBtn.style.display = 'none';
      }
    });
  }

  if (refs.visualSearchBtn) {
    refs.visualSearchBtn.addEventListener(
      'pointerenter',
      () => {
        import('@/core/lazy/visual-search').catch(() => {});
      },
      { once: true },
    );

    refs.visualSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      import('@/core/lazy/visual-search')
        .then((m) => m.openVisualSearchInterface())
        .catch((err) => console.error('Error opening Visual Search:', err));
    });
  }

  if (refs.searchWrapper) {
    refs.searchWrapper.addEventListener('dragover', (e) => {
      const types = Array.from(e.dataTransfer?.types || []);
      const hasImg = types.includes('Files') || types.includes('text/uri-list');
      if (!hasImg) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      refs.searchWrapper?.classList.add('image-drag-over');
    });

    refs.searchWrapper.addEventListener('dragleave', (e) => {
      if (!refs.searchWrapper?.contains(e.relatedTarget as Node)) {
        refs.searchWrapper?.classList.remove('image-drag-over');
      }
    });

    refs.searchWrapper.addEventListener('drop', async (e) => {
      refs.searchWrapper?.classList.remove('image-drag-over');

      const file = Array.from(e.dataTransfer?.files || []).find((f) =>
        f.type.startsWith('image/'),
      );

      if (file) {
        e.preventDefault();
        import('@/core/lazy/visual-search').then((m) => {
          m.doImageFileSearch(file, false);
        });
        return;
      }

      const url =
        e.dataTransfer?.getData('text/uri-list') ||
        e.dataTransfer?.getData('text/plain') ||
        '';

      if (url && /^https?:\/\//i.test(url)) {
        e.preventDefault();
        import('@/core/lazy/visual-search').then((m) => {
          m.doImageUrlSearch(url);
        });
      }
    });
  }
}
