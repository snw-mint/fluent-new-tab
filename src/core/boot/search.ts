/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

export const SEARCH_URLS: Record<string, string> = {
  engine1: 'https://www.google.com/search?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
  duck: 'https://duckduckgo.com/?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
  startpage: 'https://www.startpage.com/sp/search?query=',
  kagi: 'https://kagi.com/search?q=',
};

export function applyGoogleSearchParams(
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

export function performSearch(query: string, engine: string): void {
  if (!query.trim()) return;
  if (engine === 'engine0' || engine === 'system') {
    try {
      const win = window as any;

      if (win.browser?.search?.search) {
        win.browser.search.search({ query: query });
      } else if (win.chrome?.search?.query) {
        win.chrome.search.query({ text: query });
      } else if (win.browser?.search?.query) {
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

export function initBasicSearchUI(
  searchWrapper: HTMLElement | null,
  voiceSearchBtn: HTMLElement | null,
  askAiBtn: HTMLElement | null,
  visualSearchBtn: HTMLElement | null,
  searchBarVisible: boolean,
  compactBarEnabled: boolean,
  voiceSearchEnabled: boolean,
  askAiEnabled: boolean,
  visualSearchEnabled: boolean,
): void {
  if (searchWrapper) {
    searchWrapper.style.display = searchBarVisible ? '' : 'none';
    if (compactBarEnabled) {
      searchWrapper.classList.add('compact');
    } else {
      searchWrapper.classList.remove('compact');
    }
  }

  if (voiceSearchBtn) {
    const hasSpeechSupport =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    voiceSearchBtn.style.display =
      voiceSearchEnabled && hasSpeechSupport ? 'flex' : 'none';
  }

  if (askAiBtn) {
    askAiBtn.style.display = askAiEnabled ? 'flex' : 'none';
  }

  if (visualSearchBtn) {
    visualSearchBtn.style.display = visualSearchEnabled ? 'flex' : 'none';
  }
}
