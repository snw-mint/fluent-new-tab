interface SearchSuggestionRefs {
    suggestionsContainer: HTMLDivElement | null;
    searchInput: HTMLInputElement | null;
    searchForm: HTMLFormElement | null;
}

function clearSuggestionsUI(suggestionsContainer: HTMLDivElement | null): void {
    if (!suggestionsContainer) return;
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.classList.remove('active');
}

function renderSuggestionsUI(suggestions: string[], refs: SearchSuggestionRefs, onClear: () => void): void {
    const { suggestionsContainer, searchInput, searchForm } = refs;
    if (!suggestionsContainer) return;

    suggestionsContainer.innerHTML = '';
    if (suggestions.length === 0) {
        suggestionsContainer.classList.remove('active');
        return;
    }

    const iconSvg = `<svg class="suggestion-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

    suggestions.forEach((text) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.dataset.value = text;
        div.innerHTML = `${iconSvg} <span>${text}</span>`;
        div.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = text;
            }
            if (searchForm) {
                searchForm.submit();
            } else {
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
            }
            onClear();
        });
        suggestionsContainer.appendChild(div);
    });

    suggestionsContainer.classList.add('active');
}

function updateSuggestionSelectionUI(items: HTMLElement[], index: number, searchInput: HTMLInputElement | null): void {
    items.forEach((item) => item.classList.remove('selected'));
    if (index > -1 && items[index]) {
        items[index].classList.add('selected');
        if (searchInput) {
            searchInput.value = items[index].dataset.value || '';
        }
    }
}

function applyGoogleSearchParams(searchForm: HTMLFormElement | null, currentEngine: string, clearSearchEnabled: boolean): void {
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
