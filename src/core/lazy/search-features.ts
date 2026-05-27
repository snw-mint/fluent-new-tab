import { performSearch } from '@/core/boot/search';
import { HOST_PERMISSIONS, checkPermission } from '@/core/shared/permissions'; // <-- ADICIONE ESTA LINHA

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
  suggestionsContainer.innerHTML = '';
  suggestionsContainer.classList.remove('active');
}

export function renderSuggestionsUI(
  suggestions: string[],
  refs: SearchSuggestionRefs,
  onClear: () => void,
): void {
  const { suggestionsContainer, searchInput, searchWrapper } = refs;
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

export function handleAskAiRedirect(query: string): void {
  if (!query.trim()) return;
  window.location.href = `https://www.perplexity.ai/search?q=${encodeURIComponent(query.trim())}`;
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

  if (active) {
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
