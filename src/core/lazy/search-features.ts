import { performSearch } from '@/core/boot/search';
import { HOST_PERMISSIONS, checkPermission } from '@/core/shared/permissions';

interface SearchSuggestionRefs {
  suggestionsContainer: HTMLDivElement | null;
  searchInput: HTMLInputElement | null;
  searchForm: HTMLFormElement | null;
  searchWrapper?: HTMLElement | null;
}

let voiceRecognitionInstance: any = null;
let isVoiceListening = false;
let lastVoiceClickTimestamp = 0;

export function clearSuggestionsUI(
  suggestionsContainer: HTMLDivElement | null,
  searchWrapper?: HTMLElement | null,
): void {
  if (searchWrapper) searchWrapper.classList.remove('suggestions-open');
  if (!suggestionsContainer) return;
  suggestionsContainer.textContent = '';
  suggestionsContainer.classList.remove('active');
}

export function renderSuggestionsUI(
  suggestions: string[],
  refs: SearchSuggestionRefs,
  onClear: () => void,
): void {
  const { suggestionsContainer, searchInput, searchWrapper } = refs;
  if (!suggestionsContainer) return;

  suggestionsContainer.textContent = '';
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

export function updateSuggestionSelectionUI(
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

import { aiEngines, engines } from '@/core/boot/search-engines';

export function handleAskAiRedirect(query: string): void {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;
  const rawProvider = localStorage.getItem('askAiProvider') || 'google-ai';
  const provider = aiEngines[rawProvider] ? rawProvider : 'google-ai';
  const config = aiEngines[provider] || aiEngines['google-ai'];
  window.location.href = config.url.replace(
    '%s',
    encodeURIComponent(trimmedQuery),
  );
}

export function renderAiEnginesDropdown(
  dropdown: HTMLElement | null,
  currentIcon: HTMLImageElement | null,
): void {
  if (!dropdown) return;
  const rawProvider = localStorage.getItem('askAiProvider') || 'google-ai';
  const currentProvider = aiEngines[rawProvider] ? rawProvider : 'google-ai';

  const list = [
    { key: 'google-ai', name: 'Google AI Mode', icon: 'assets/search-ai/google-ai.svg' },
    { key: 'chatgpt', name: 'ChatGPT', icon: 'assets/search-ai/chatgpt.svg' },
    { key: 'grok', name: 'Grok', icon: 'assets/search-ai/grok.svg' },
    { key: 'claude', name: 'Claude', icon: 'assets/search-ai/claude.svg' },
    { key: 'perplexity', name: 'Perplexity', icon: 'assets/search-ai/perplexity.svg' },
    { key: 'duckduckgo-ai', name: 'Duck.AI', icon: 'assets/search-ai/duck-ai.svg' },
  ];

  dropdown.innerHTML = list
    .map(
      (item) => `
    <div class="dropdown-item${item.key === currentProvider ? ' selected' : ''}" data-ai-engine="${item.key}">
      <img src="${item.icon}" alt="${item.name}" />
      <span>${item.name}</span>
    </div>
  `,
    )
    .join('');

  if (currentIcon) {
    const activeConfig = aiEngines[currentProvider] || aiEngines['google-ai'];
    currentIcon.src = activeConfig.icon;
  }
}

export function restoreStandardEnginesDropdown(
  dropdown: HTMLElement | null,
  currentIcon: HTMLImageElement | null,
): void {
  if (!dropdown) return;
  dropdown.innerHTML = `
    <div class="dropdown-item" data-engine="system">
      <img src="assets/search-engines/system.svg" alt="System Default" />
      <span data-i18n="systemDefault">System Default</span>
    </div>
    <div class="dropdown-item" data-engine="bing">
      <img src="assets/search-engines/bing.svg" alt="Bing" />
      <span>Bing</span>
    </div>
    <div class="dropdown-item" data-engine="google">
      <img src="assets/search-engines/google.svg" alt="Google" />
      <span>Google</span>
    </div>
    <div class="dropdown-item" data-engine="brave">
      <img src="assets/search-engines/brave.svg" alt="Brave" />
      <span>Brave Search</span>
    </div>
    <div class="dropdown-item" data-engine="duck">
      <img src="assets/search-engines/ddg.svg" alt="DuckDuckGo" />
      <span>DuckDuckGo</span>
    </div>
    <div class="dropdown-item" data-engine="ecosia">
      <img src="assets/search-engines/ecosia.svg" alt="Ecosia Search" />
      <span>Ecosia Search</span>
    </div>
    <div class="dropdown-item" data-engine="startpage">
      <img src="assets/search-engines/startpg.svg" alt="Start Page" />
      <span>Start Page</span>
    </div>
    <div class="dropdown-item" data-engine="kagi">
      <img src="assets/search-engines/kagi.svg" alt="Kagi" />
      <span>Kagi</span>
    </div>
  `;

  if (currentIcon) {
    const savedEngineKey = localStorage.getItem('searchEngine') || 'bing';
    const activeConfig = engines[savedEngineKey] || engines['bing'];
    currentIcon.src = activeConfig.icon;
  }
}

export function updateAskAiUiState(
  active: boolean,
  elements: {
    searchWrapper: HTMLElement | null;
    searchInput: HTMLInputElement | null;
    askAiBtn: HTMLButtonElement | null;
  },
): void {
  const { searchWrapper, searchInput, askAiBtn } = elements;
  if (!searchWrapper || !searchInput || !askAiBtn) return;

  askAiBtn.classList.toggle('active', active);
  searchWrapper.classList.toggle('ask-ai-active', active);
  searchWrapper.classList.toggle('ai-active', active);

  const inactiveIcon = askAiBtn.querySelector('.ask-ai-icon-inactive') as HTMLElement | null;
  const activeIcon = askAiBtn.querySelector('.ask-ai-icon-active') as HTMLElement | null;
  if (inactiveIcon) inactiveIcon.style.display = active ? 'none' : 'block';
  if (activeIcon) activeIcon.style.display = active ? 'block' : 'none';

  const dropdown = document.getElementById('engineDropdown');
  const currentIcon = document.getElementById('currentEngineIcon') as HTMLImageElement | null;
  const searchEngineTip = document.getElementById('searchEngineTip');

  if (active) {
    renderAiEnginesDropdown(dropdown, currentIcon);

    if (searchEngineTip && !localStorage.getItem('hasSeenAskAiEngineTip')) {
      localStorage.setItem('hasSeenAskAiEngineTip', 'true');
      const tipSpan = searchEngineTip.querySelector('span');
      if (tipSpan) {
        const translatedTip = (window as any).getTranslation?.('askAiEngineTip');
        if (translatedTip && translatedTip !== 'askAiEngineTip') {
          tipSpan.textContent = translatedTip;
        } else {
          tipSpan.textContent = 'Change the AI provider here';
        }
      }
      searchEngineTip.classList.remove('is-hidden');
      setTimeout(() => {
        searchEngineTip.classList.add('is-hidden');
      }, 10000);
    }

    try {
      const audio = new Audio(
        (chrome.runtime as any).getURL('assets/sfx/ai-sfx.webm'),
      );
      audio.volume = 0.4;
      audio.play().catch((err) => console.log('SFX play blocked:', err));
    } catch (e) {
      console.warn('Audio system unavailable:', e);
    }

    const translated = (window as any).getTranslation?.('askAiOption');
    if (translated && translated !== 'askAiOption') {
      searchInput.placeholder = translated;
    } else {
      searchInput.placeholder = 'Ask to AI.';
    }

    searchInput.focus();
  } else {
    restoreStandardEnginesDropdown(dropdown, currentIcon);

    if (searchEngineTip && !searchEngineTip.classList.contains('is-hidden')) {
      searchEngineTip.classList.add('is-hidden');
    }

    const translatedSearch = (window as any).getTranslation?.(
      'searchPlaceholder',
    );
    if (translatedSearch && translatedSearch !== 'searchPlaceholder') {
      searchInput.placeholder = translatedSearch;
    } else {
      searchInput.placeholder = 'Pesquise na web...';
    }
  }
}

export function registerVoiceSearchEngine(options: {
  voiceSearchBtn: HTMLButtonElement | null;
  searchInput: HTMLInputElement | null;
  searchForm: HTMLFormElement | null;
  getVoiceEnabled: () => boolean;
}): void {
  const { voiceSearchBtn, searchInput, searchForm, getVoiceEnabled } = options;
  if (!voiceSearchBtn || !searchInput) return;

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  voiceSearchBtn.addEventListener('click', () => {
    const currentTime = Date.now();
    if (currentTime - lastVoiceClickTimestamp < 400) return;
    lastVoiceClickTimestamp = currentTime;

    if (!getVoiceEnabled()) return;

    if (isVoiceListening) {
      safelyTerminateVoice();
      return;
    }

    try {
      if (!voiceRecognitionInstance) {
        voiceRecognitionInstance = new SpeechRecognition();
        voiceRecognitionInstance.continuous = false;
        voiceRecognitionInstance.interimResults = false;

        voiceRecognitionInstance.onstart = () => {
          isVoiceListening = true;
          voiceSearchBtn.classList.add('recording');
          voiceSearchBtn.setAttribute('aria-pressed', 'true');

          try {
            const audio = new Audio(
              (chrome.runtime as any).getURL('assets/sfx/mic-ready.webm'),
            );
            audio.volume = 0.4;
            audio.play().catch((err) => console.log('SFX play blocked:', err));
          } catch (e) {
            console.warn('Audio system unavailable:', e);
          }
        };

        voiceRecognitionInstance.onresult = (event: any) => {
          const transcriptResult = event.results[0][0].transcript;
          if (transcriptResult && searchInput) {
            searchInput.value = transcriptResult;
            if (searchForm) {
              searchForm.dispatchEvent(new Event('submit', { bubbles: true }));
            }
          }
        };

        voiceRecognitionInstance.onerror = () => {
          safelyTerminateVoice();
        };
        voiceRecognitionInstance.onend = () => {
          safelyTerminateVoice();
        };
      }

      const currentLang = localStorage.getItem('userLanguage') || 'en_US';
      voiceRecognitionInstance.lang = currentLang.replace('_', '-');
      voiceRecognitionInstance.start();
    } catch (error) {
      console.error('Failed to wake up SpeechRecognition stream:', error);
      safelyTerminateVoice();
    }
  });

  function safelyTerminateVoice() {
    isVoiceListening = false;
    if (voiceSearchBtn) {
      voiceSearchBtn.classList.remove('recording');
      voiceSearchBtn.setAttribute('aria-pressed', 'false');
    }
    if (voiceRecognitionInstance) {
      try {
        voiceRecognitionInstance.abort();
      } catch {}
    }
  }
}

export async function fetchSuggestionsFromService(
  query: string,
): Promise<string[]> {
  const hasPerm = await checkPermission(HOST_PERMISSIONS.suggestions);
  if (!hasPerm) return [];

  const url = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && Array.isArray(data[1])) {
      return data[1].slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving suggestions:', error);
    return [];
  }
}
