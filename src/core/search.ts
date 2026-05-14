/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file manages search functionality, including rendering and updating search suggestions,
 * and applying specific search engine parameters.
 */

const SEARCH_URLS: Record<string, string> = {
  engine1: 'https://www.google.com/search?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
  duck: 'https://duckduckgo.com/?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
  startpage: 'https://www.startpage.com/sp/search?query=',
  kagi: 'https://kagi.com/search?q=',
};

interface SearchSuggestionRefs {
  suggestionsContainer: HTMLDivElement | null;
  searchInput: HTMLInputElement | null;
  searchForm: HTMLFormElement | null;
  searchWrapper?: HTMLElement | null;
}

function clearSuggestionsUI(
  suggestionsContainer: HTMLDivElement | null,
  searchWrapper?: HTMLElement | null,
): void {
  if (searchWrapper) searchWrapper.classList.remove('suggestions-open');
  if (!suggestionsContainer) return;
  suggestionsContainer.innerHTML = '';
  suggestionsContainer.classList.remove('active');
}

function renderSuggestionsUI(
  suggestions: string[],
  refs: SearchSuggestionRefs,
  onClear: () => void,
): void {
  const { suggestionsContainer, searchInput, searchForm, searchWrapper } = refs;
  if (!suggestionsContainer) return;

  suggestionsContainer.innerHTML = '';
  if (suggestions.length === 0) {
    suggestionsContainer.classList.remove('active');
    if (searchWrapper) searchWrapper.classList.remove('suggestions-open');
    return;
  }

  const iconSvg = `<svg class="suggestion-icon" viewBox="0 0 24 24"><path d="M11.5 2.75a8.75 8.75 0 0 1 6.695 14.384l6.835 6.836a.75.75 0 0 1-.976 1.133l-.084-.073-6.836-6.835A8.75 8.75 0 1 1 11.5 2.75m0 1.5a7.25 7.25 0 1 0 0 14.5 7.25 7.25 0 0 0 0-14.5" fill="#5f6368"/></svg>`;

  suggestions.forEach((text) => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.dataset.value = text;
    div.insertAdjacentHTML('afterbegin', iconSvg);
    const span = document.createElement('span');
    span.textContent = text;
    div.appendChild(span);
    div.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = text;
      }
      const currentEngine = localStorage.getItem('searchEngine') || 'system';
      performSearch(text, currentEngine);
      onClear();
    });

    suggestionsContainer.appendChild(div);
  });

  suggestionsContainer.classList.add('active');
  if (searchWrapper) searchWrapper.classList.add('suggestions-open');
}

function updateSuggestionSelectionUI(
  items: HTMLElement[],
  index: number,
  searchInput: HTMLInputElement | null,
): void {
  items.forEach((item) => item.classList.remove('selected'));
  if (index > -1 && items[index]) {
    items[index].classList.add('selected');
    if (searchInput) {
      searchInput.value = items[index].dataset.value || '';
    }
  }
}

function applyGoogleSearchParams(
  searchForm: HTMLFormElement | null,
  currentEngine: string,
  clearSearchEnabled: boolean,
): void {
  if (!searchForm) return;

  const udmInput = searchForm.querySelector('input[name="udm"]');
  if (currentEngine === 'google' && clearSearchEnabled) {
    if (!udmInput) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'udm';
      input.value = '14';
      searchForm.appendChild(input);
    }
  } else if (udmInput) {
    udmInput.remove();
  }
}

function performSearch(query: string, engine: string): void {
  if (!query.trim()) return;
  if (engine === 'engine0' || engine === 'system') {
    try {
      const win = window as any;

      if (win.browser && win.browser.search && win.browser.search.search) {
        win.browser.search.search({ query: query });
      } else if (win.chrome && win.chrome.search && win.chrome.search.query) {
        win.chrome.search.query({ text: query });
      } else if (
        win.browser &&
        win.browser.search &&
        win.browser.search.query
      ) {
        win.browser.search.query({ text: query });
      } else {
        throw new Error('Native search API not supported in this browser.');
      }
      return;
    } catch (error) {
      console.warn('Native search failed, triggering fallback:', error);
      let fallbackUrl = SEARCH_URLS['google'] + encodeURIComponent(query);
      const clearSearch = localStorage.getItem('clearSearchEnabled') === 'true';
      if (clearSearch) fallbackUrl += '&udm=14';

      window.location.href = fallbackUrl;
      return;
    }
  }

  let url = SEARCH_URLS[engine] || SEARCH_URLS.engine1;

  if (engine === 'engine1' || engine === 'google') {
    const clearSearch = localStorage.getItem('clearSearchEnabled') === 'true';
    if (clearSearch) url += `${encodeURIComponent(query)}&udm=14`;
    else url += encodeURIComponent(query);
  } else {
    url += encodeURIComponent(query);
  }

  window.location.href = url;
}
