/* Utility Functions */
function debounce<T extends unknown[]>(func: (...args: T) => void, wait: number): (...args: T) => void {
    let timeout: number;
    return function (...args: T): void {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
}
function closeModal(): void {
    if (addModal) addModal.classList.remove('active');
}
function closePopups(except: Element | null = null): void {
    if (configPopup && configPopup !== except) configPopup.classList.remove('active');
    if (launcherPopup && launcherPopup !== except) {
        launcherPopup.classList.remove('active');
        if (appLauncherBtn) appLauncherBtn.classList.remove('active');
    }
    document.querySelectorAll('.shortcut-dropdown.active').forEach(menu => {
        if (menu !== except) menu.classList.remove('active');
    });
    if (dropdown && dropdown !== except) dropdown.classList.remove('active');
}

function openModal(index: number | null = null): void {
    editingIndex = index;
    if (addModal) {
        addModal.classList.add('active');
        const modalTitle = document.querySelector('.modal-content h3');
        const inputName = getInputById('inputName');
        const inputUrl = getInputById('inputUrl');
        const inputIcon = getInputById('inputIcon');
        if (index !== null && shortcuts[index]) {
            const item = shortcuts[index];
            if (inputName) inputName.value = item.name;
            if (inputUrl) inputUrl.value = item.url;
            if (inputIcon) inputIcon.value = item.customIcon || '';
            if (modalTitle) modalTitle.textContent = window.getTranslation('editShortcutTitle');
            if (item.customIcon && customIconGroup) customIconGroup.classList.remove('hidden');
        } else {
            if (inputName) inputName.value = '';
            if (inputUrl) inputUrl.value = '';
            if (inputIcon) inputIcon.value = '';
            if (modalTitle) modalTitle.textContent = window.getTranslation('addShortcutTitle');
            if (customIconGroup) customIconGroup.classList.add('hidden');
        }
        setTimeout(() => inputName?.focus(), 100);
    }
}
function saveAndRender(): void {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
}
function deleteShortcut(index: number): void {
    shortcuts.splice(index, 1);
    saveAndRender();
}
function updateShortcutsVisibility(visible: boolean, animate = true): void {
    if (shortcutsGrid) shortcutsGrid.style.display = visible ? 'grid' : 'none';
    if (rowsInputGroup) setCollapsible(rowsInputGroup, visible, animate);
}
function renderShortcuts(): void {
    renderShortcutsGrid({
        shortcutsGrid,
        rowsSelect,
        shortcuts,
        onOpenModal: openModal,
        onDeleteShortcut: deleteShortcut,
        onClosePopups: closePopups
    });
}
function setSearchEngine(engineKey: keyof typeof engines): void {
    const config = engines[engineKey];
    if (config) {
        if (currentIcon) {
            currentIcon.src = config.icon;
            currentIcon.onerror = () => { currentIcon.style.display = 'none'; };
            currentIcon.onload = () => { currentIcon.style.display = 'block'; };
        }
        if (searchForm) searchForm.action = config.url;
        updateGoogleParams();
    }
}
function updateSearchSettings(animate = true): void {
    if (searchWrapper) searchWrapper.style.display = searchBarVisible ? '' : 'none';
    if (toggleSearchBar) toggleSearchBar.checked = searchBarVisible;
    const showChildren = searchBarVisible;
    if (suggestionsRow) setCollapsible(suggestionsRow, showChildren, animate);
    if (clearSearchRow) setCollapsible(clearSearchRow, showChildren, animate);
    const compactBarRow = getById<HTMLDivElement>('compactBarRow');
    if (compactBarRow) setCollapsible(compactBarRow, showChildren, animate);
    const voiceSearchRow = getById<HTMLDivElement>('voiceSearchRow');
    if (voiceSearchRow) setCollapsible(voiceSearchRow, showChildren, animate);
    const voiceLanguageRow = getById<HTMLDivElement>('voiceLanguageRow');
    if (voiceLanguageRow) setCollapsible(voiceLanguageRow, showChildren, animate);
    updateVoiceSearchAvailability();
}
function updateCompactBarStyle(): void {
    if (searchWrapper) {
        if (compactBarEnabled) searchWrapper.classList.add('compact');
        else searchWrapper.classList.remove('compact');
    }
}
const SpeechRecognitionCtor = (window as Window & {
    SpeechRecognition?: new () => any;
    webkitSpeechRecognition?: new () => any;
}).SpeechRecognition || (window as Window & {
    webkitSpeechRecognition?: new () => any;
}).webkitSpeechRecognition;
const voiceSearchSupported = typeof SpeechRecognitionCtor === 'function';
let voiceRecognition: any = null;
let voiceRecording = false;
let voiceShouldSubmitOnEnd = false;
let voiceFinalTranscript = '';
let voiceSilenceTimeout: number | null = null;
const VOICE_SILENCE_MS = 8000;

function stopVoiceRingAnimation(): void {
    if (!searchWrapper) return;
    searchWrapper.classList.remove('voice-active');
}

function startVoiceRingAnimation(): void {
    if (!searchWrapper) return;
    searchWrapper.classList.add('voice-active');
}

function playVoiceStartSound(): void {
    const audio = new Audio('assets/mic-recording.mp3');
    audio.volume = 0.45;
    audio.play().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error || '');
        const isExpectedPolicyBlock =
            message.toLowerCase().includes('notallowederror') ||
            message.toLowerCase().includes('interact') ||
            message.toLowerCase().includes('play() request was interrupted');

        if (isExpectedPolicyBlock) return;
        console.debug('Voice start sound could not play.', error);
    });
}

function updateVoiceButtonRecordingState(): void {
    if (!voiceSearchBtn) return;
    voiceSearchBtn.classList.toggle('recording', voiceRecording);
    voiceSearchBtn.setAttribute('aria-pressed', voiceRecording ? 'true' : 'false');
}

function normalizeVoiceLanguage(code: string | null | undefined): string {
    if (!code) return '';
    const normalized = code.replace('_', '-').trim();
    if (!normalized) return '';
    try {
        const canonical = Intl.getCanonicalLocales([normalized])[0];
        return canonical || '';
    } catch {
        return '';
    }
}

function getVoiceRecognitionLanguage(): string {
    const fromSetting = normalizeVoiceLanguage(voiceSearchLanguage);
    if (fromSetting) return fromSetting;

    const fromBrowser = normalizeVoiceLanguage(navigator.language);
    if (fromBrowser) return fromBrowser;

    return 'en-US';
}

function clearVoiceSilenceTimer(): void {
    if (voiceSilenceTimeout === null) return;
    window.clearTimeout(voiceSilenceTimeout);
    voiceSilenceTimeout = null;
}

function scheduleVoiceSilenceStop(): void {
    clearVoiceSilenceTimer();
    voiceSilenceTimeout = window.setTimeout(() => {
        if (!voiceRecording) return;
        stopVoiceSearch(true);
    }, VOICE_SILENCE_MS);
}

function stopVoiceSearch(submitAfterStop = false): void {
    voiceShouldSubmitOnEnd = submitAfterStop;
    if (!voiceRecording || !voiceRecognition) return;
    voiceRecognition.stop();
}

function ensureVoiceRecognition(): any {
    if (!voiceSearchSupported || !SpeechRecognitionCtor) return null;
    if (voiceRecognition) return voiceRecognition;

    voiceRecognition = new SpeechRecognitionCtor();
    voiceRecognition.interimResults = false;
    voiceRecognition.continuous = false;
    voiceRecognition.maxAlternatives = 1;

    voiceRecognition.onstart = () => {
        voiceRecording = true;
        updateVoiceButtonRecordingState();
        startVoiceRingAnimation();
        scheduleVoiceSilenceStop();
    };

    voiceRecognition.onresult = (event: any) => {
        if (!searchInput) return;
        let finalTranscript = '';

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const transcript = result[0]?.transcript?.trim() || '';
            if (!transcript) continue;

            if (result.isFinal) {
                finalTranscript = `${finalTranscript} ${transcript}`.trim();
            }
        }

        if (finalTranscript) {
            voiceFinalTranscript = finalTranscript;
            searchInput.value = finalTranscript;
        }
        scheduleVoiceSilenceStop();
    };

    voiceRecognition.onerror = () => {
        voiceShouldSubmitOnEnd = false;
        clearVoiceSilenceTimer();
    };

    voiceRecognition.onend = () => {
        const shouldSubmit = voiceShouldSubmitOnEnd;
        voiceRecording = false;
        voiceShouldSubmitOnEnd = false;
        clearVoiceSilenceTimer();
        updateVoiceButtonRecordingState();
        stopVoiceRingAnimation();

        const finalQuery = searchInput?.value.trim() || voiceFinalTranscript.trim();
        voiceFinalTranscript = '';

        if (shouldSubmit && finalQuery && searchForm) {
            clearSuggestions();
            if (typeof searchForm.requestSubmit === 'function') {
                searchForm.requestSubmit();
            } else {
                searchForm.submit();
            }
        }
    };

    return voiceRecognition;
}

function startVoiceSearch(): void {
    if (!voiceSearchEnabled || !voiceSearchSupported || !searchBarVisible) return;

    if (voiceRecording) {
        stopVoiceSearch(false);
        return;
    }

    const recognition = ensureVoiceRecognition();
    if (!recognition) return;

    voiceFinalTranscript = '';
    voiceShouldSubmitOnEnd = true;
    recognition.lang = getVoiceRecognitionLanguage();

    playVoiceStartSound();
    startVoiceRingAnimation();
    scheduleVoiceSilenceStop();

    try {
        recognition.start();
    } catch (error) {
        console.warn('Unable to start voice recognition.', error);
        voiceShouldSubmitOnEnd = false;
        stopVoiceRingAnimation();
    }
}

function updateVoiceSearchAvailability(): void {
    const canUseVoice = voiceSearchEnabled && searchBarVisible && voiceSearchSupported;
    if (voiceSearchBtn) {
        voiceSearchBtn.style.display = canUseVoice ? 'flex' : 'none';
        voiceSearchBtn.disabled = !canUseVoice;
    }

    if (toggleVoiceSearch) {
        toggleVoiceSearch.disabled = !voiceSearchSupported;
        toggleVoiceSearch.title = voiceSearchSupported ? '' : 'Voice recognition is not supported in this browser.';
    }

    if (voiceLanguageSelect) {
        voiceLanguageSelect.disabled = !voiceSearchSupported;
        voiceLanguageSelect.title = voiceSearchSupported ? '' : 'Voice recognition is not supported in this browser.';
    }

    if (!canUseVoice) {
        if (voiceRecording) stopVoiceSearch(false);
        stopVoiceRingAnimation();
    }
}
function renderSuggestions(suggestions: string[]): void {
    renderSuggestionsUI(suggestions, {
        suggestionsContainer,
        searchInput,
        searchForm
    }, clearSuggestions);
}
function clearSuggestions(): void {
    clearSuggestionsUI(suggestionsContainer);
}
function updateSelection(items: HTMLElement[], index: number): void {
    updateSuggestionSelectionUI(items, index, searchInput);
}
function updateUnitButtons(): void {
    if(!unitBtns) return;
    unitBtns.forEach(btn => {
        if(btn.dataset.unit === weatherUnit) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}
function updateWeatherVisibility(animate = true): void {
    if(!weatherWidget || !cityInputGroup) return;
    const displayStyle = weatherEnabled ? 'flex' : 'none';
    weatherWidget.style.display = displayStyle;
    setCollapsible(cityInputGroup, weatherEnabled, animate);
    if(weatherUnitGroup) setCollapsible(weatherUnitGroup, weatherEnabled, animate);
}
function renderWeather(data: WeatherApiResponse | null): void {
    renderWeatherWidget(data, weatherUnit, currentCityData, {
        weatherCity,
        weatherTemp,
        weatherIcon,
        weatherWidget
    });
}
function updateLauncherVisibility(animate = true): void {
    updateLauncherVisibilityUI(launcherEnabled, animate, {
        appLauncherWrapper,
        launcherSelectGroup
    }, setCollapsible);
}
function updateWallpaperUIState(enabled: boolean, animate = true): void {
    if (wallpaperGrid) {
        wallpaperGrid.dataset.collapsibleDisplay = 'grid';
        setCollapsible(wallpaperGrid, enabled, animate);
    }

    const container = wallpaperSourceContainer || (wallpaperSourceSelect ? wallpaperSourceSelect.closest('.wallpaper-source-options') : null);
    if (container) {
        setCollapsible(container, enabled, animate);
    } else if (wallpaperSourceSelect) {
        wallpaperSourceSelect.dataset.collapsibleDisplay = 'block';
        setCollapsible(wallpaperSourceSelect, enabled, animate);
        const label = (document.querySelector(`label[for="${wallpaperSourceSelect.id}"]`) || 
                  (wallpaperSourceSelect.previousElementSibling && wallpaperSourceSelect.previousElementSibling.tagName === 'LABEL' ? wallpaperSourceSelect.previousElementSibling : null)) as HTMLElement | null;
        if (label) setCollapsible(label, enabled, animate);
    }
    if (toggleWallpaper) {
        const row = toggleWallpaper.closest('.switch-row');
        if (row) (row as HTMLElement).style.marginBottom = enabled ? '' : '0';
    }
}

function updateGreetingSettingsVisibility(show: boolean, animate = true): void {
    if (greetingOptionsDiv) setCollapsible(greetingOptionsDiv, show, animate);
}
function updateAnimationsDisabled(enabled: boolean): void {
    document.body.classList.toggle('animations-disabled', enabled);
    if (disableAnimationsNotice) {
        disableAnimationsNotice.style.display = enabled ? 'flex' : 'none';
    }
}
function clearPresetSelection(): void {
    document.querySelectorAll('.wallpaper-option').forEach(opt => opt.classList.remove('selected'));
}
function highlightSelectedWallpaper(value: string): void {
    clearPresetSelection();
    if (value === 'custom' || value === 'upload') {
        const uploadBtn = document.querySelector('.upload-option');
        if (uploadBtn) uploadBtn.classList.add('selected');
    } else {
        const target = document.querySelector(`.wallpaper-option[data-value="${value}"]`);
        if (target) target.classList.add('selected');
    }
}

function prepareCollapsible(element: HTMLElement | null): void {
    if (!element || element.dataset.collapsibleReady === 'true') return;
    const previousDisplay = element.style.display;
    if (previousDisplay === 'none') {
        element.style.display = '';
    }
    let computedDisplay = window.getComputedStyle(element).display;
    if (computedDisplay === 'none') {
        computedDisplay = element.dataset.collapsibleDisplay || 'block';
    }
    if (previousDisplay === 'none') {
        element.style.display = previousDisplay;
    }
    const computedStyles = window.getComputedStyle(element);
    element.dataset.originalDisplay = computedDisplay;
    element.dataset.originalMarginTop = computedStyles.marginTop;
    element.dataset.originalMarginBottom = computedStyles.marginBottom;
    element.dataset.originalPaddingTop = computedStyles.paddingTop;
    element.dataset.originalPaddingBottom = computedStyles.paddingBottom;
    element.classList.add('collapsible-section');
    element.dataset.collapsibleReady = 'true';
}

function setCollapsible(element: HTMLElement | null, shouldExpand: boolean, animate = true): void {
    if (!element) return;
    if (document.body.classList.contains('animations-disabled')) {
        animate = false;
    }
    prepareCollapsible(element);

    const restoreSpacing = () => {
        element.style.marginTop = element.dataset.originalMarginTop;
        element.style.marginBottom = element.dataset.originalMarginBottom;
        element.style.paddingTop = element.dataset.originalPaddingTop;
        element.style.paddingBottom = element.dataset.originalPaddingBottom;
    };

    const transitionValue = 'height 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), margin 0.28s ease, padding 0.28s ease';
    const currentState = element.dataset.state || 'open';

    if (!animate) {
        element.style.transition = 'none';
        if (shouldExpand) {
            element.style.display = element.dataset.originalDisplay;
            restoreSpacing();
            element.style.height = 'auto';
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.pointerEvents = 'auto';
            element.style.overflow = '';
            element.dataset.state = 'open';
        } else {
            element.style.display = element.dataset.originalDisplay;
            element.style.height = '0px';
            element.style.opacity = '0';
            element.style.transform = 'scaleY(0.98) translateY(-6px)';
            element.style.pointerEvents = 'none';
            element.style.overflow = 'hidden';
            element.style.marginTop = '0px';
            element.style.marginBottom = '0px';
            element.style.paddingTop = '0px';
            element.style.paddingBottom = '0px';
            element.dataset.state = 'closed';
        }
        requestAnimationFrame(() => { element.style.transition = ''; });
        return;
    }

    element.style.transition = transitionValue;

    if (shouldExpand) {
        if (currentState === 'open') return;
        element.dataset.state = 'animating';
        element.style.display = element.dataset.originalDisplay;
        element.style.pointerEvents = 'none';
        element.style.overflow = 'hidden';

        restoreSpacing();
        const targetHeight = element.scrollHeight;

        element.style.height = '0px';
        element.style.opacity = '0';
        element.style.transform = 'scaleY(0.98) translateY(-6px)';
        element.style.marginTop = '0px';
        element.style.marginBottom = '0px';
        element.style.paddingTop = '0px';
        element.style.paddingBottom = '0px';

        requestAnimationFrame(() => {
            element.style.height = `${targetHeight}px`;
            element.style.opacity = '1';
            element.style.transform = 'scaleY(1) translateY(0)';
            restoreSpacing();
        });

        const onExpandEnd = (event: TransitionEvent) => {
            if (event.propertyName !== 'height') return;
            element.style.height = 'auto';
            element.style.overflow = '';
            element.style.pointerEvents = 'auto';
            element.dataset.state = 'open';
            element.style.transition = '';
            element.removeEventListener('transitionend', onExpandEnd);
        };
        element.addEventListener('transitionend', onExpandEnd);
    } else {
        if (currentState === 'closed') return;
        element.dataset.state = 'animating';
        element.style.overflow = 'hidden';
        element.style.pointerEvents = 'none';

        restoreSpacing();
        const startHeight = element.scrollHeight;
        element.style.height = `${startHeight}px`;
        element.style.opacity = '1';
        element.style.transform = 'scaleY(1) translateY(0)';

        requestAnimationFrame(() => {
            element.style.height = '0px';
            element.style.opacity = '0';
            element.style.transform = 'scaleY(0.98) translateY(-6px)';
            element.style.marginTop = '0px';
            element.style.marginBottom = '0px';
            element.style.paddingTop = '0px';
            element.style.paddingBottom = '0px';
        });

        const onCollapseEnd = (event: TransitionEvent) => {
            if (event.propertyName !== 'height') return;
            element.dataset.state = 'closed';
            element.style.transition = '';
            element.style.overflow = 'hidden';
            element.removeEventListener('transitionend', onCollapseEnd);
        };
        element.addEventListener('transitionend', onCollapseEnd);
    }
}
function saveWallpaperConfig(): void {
    localStorage.setItem('wallpaperSource', currentWallpaperSource);
    localStorage.setItem('wallpaperType', currentWallpaperType);
    localStorage.setItem('wallpaperValue', currentWallpaperValue);
}
let currentWallpaperObjectUrl: string | null = null;

function preloadWallpaperImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to preload wallpaper image.'));
        img.src = url;
    });
}

async function applyWallpaperImage(url: string): Promise<void> {
    if (currentWallpaperObjectUrl && currentWallpaperObjectUrl.startsWith('blob:') && currentWallpaperObjectUrl !== url) {
        URL.revokeObjectURL(currentWallpaperObjectUrl);
    }

    try {
        await preloadWallpaperImage(url);
    } catch (error) {
        console.warn('Could not preload wallpaper, applying directly.', error);
    }

    currentWallpaperObjectUrl = url.startsWith('blob:') ? url : null;
    document.body.style.backgroundImage = `url('${url}')`;
}

async function applyWallpaperLogic() {
    if (!wallpaperEnabled) {
        document.body.style.backgroundImage = 'none';
        document.body.removeAttribute('data-wallpaper-active');
        return;
    }

    document.body.setAttribute('data-wallpaper-active', 'true');
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';

    if (currentWallpaperSource === 'local') {
        updateCreditsUI('local');
        if (currentWallpaperType === 'preset') {
            const presetMap = {
                'preset_1': 'assets/wallpapers/fluent1.webp',
                'preset_2': 'assets/wallpapers/fluent2.webp',
                'preset_3': 'assets/wallpapers/fluent3.webp'
            };
            const imageUrl = presetMap[currentWallpaperValue] || presetMap['preset_1'];
            await applyWallpaperImage(imageUrl);
        } 
        else if (currentWallpaperType === 'upload') {
            await loadCustomWallpaper();
        }
    } 
    else if (currentWallpaperSource === 'api') {
        const url = await fetchDailyWallpaper(currentWallpaperType);
        if (url) {
            await applyWallpaperImage(url);
            
            // Recupera o crédito salvo no cache
            const cacheKey = `wallpaper_cache_${currentWallpaperType}`;
            try {
                const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null') as WallpaperCacheEntry | null;
                let credit = cached ? cached.credit : '';
                
                // Fallbacks se não houver crédito salvo
                if (!credit) {
                    if (currentWallpaperType === 'bing') credit = 'Microsoft Bing';
                    else if (currentWallpaperType === 'nasa') credit = 'NASA APOD';
                    else if (currentWallpaperType === 'wikimedia') credit = 'Wikimedia Commons';
                }
                updateCreditsUI('api', credit);
            } catch (e) {
                updateCreditsUI('api', 'Daily Wallpaper');
            }
        }
    }
}
async function loadCustomWallpaper() {
    const body = document.body;
    try {
        const blob = await getWallpaperFromDB();
        if (blob) {
            const url = URL.createObjectURL(blob);
            await applyWallpaperImage(url);
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
            body.style.backgroundAttachment = 'fixed';
        } else {
            // Fallback se não houver imagem salva
            console.warn("Nenhum wallpaper customizado encontrado.");
        }
    } catch (e) {
        console.error("Erro ao carregar wallpaper:", e);
    }
}

/* Event Handlers */
function applyTheme(theme: ThemeMode): void {
    if (themeBtns) {
        themeBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.theme === theme));
    }
    document.documentElement.removeAttribute("data-theme");
    if (theme === "auto") {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    } else {
        document.documentElement.setAttribute("data-theme", theme);
    }
}
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (localStorage.getItem("theme") === "auto") {
        document.documentElement.removeAttribute("data-theme");
        if (e.matches) {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }
});

function initBrand() {
    initGreetingBrand(greetingWrapper);
}

/* --- 6. Core Features --- */
function fetchSuggestions(query: string): void {
    fetchSuggestionsFromService(query).then((suggestions) => {
        if (!searchInput || searchInput.value.trim().toLowerCase() !== query.toLowerCase()) return;
        suggestionsCache.set(query.toLowerCase(), suggestions);
        renderSuggestions(suggestions);
    });
}
function updateGoogleParams() {
    const currentEngine = localStorage.getItem('searchEngine') || 'bing';
    applyGoogleSearchParams(searchForm, currentEngine, clearSearchEnabled);
}
async function searchCity(): Promise<void> {
    if (!cityInput || !saveCityBtn) return;
    const query = cityInput.value.trim();
    if(!query) return;
    saveCityBtn.innerHTML = '...';
    try {
        const cityData = await fetchCityData(query);
        if (cityData) {
            currentCityData = cityData;
            localStorage.setItem(CITY_KEY, JSON.stringify(currentCityData));
            cityInput.value = cityData.name;
            fetchWeatherFromAPI(true);
        } else { alert('City not found / Cidade não encontrada.'); }
    } catch (error) { alert('Error searching city.'); }
    finally { saveCityBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'; }
}
function initSortable() {
    if (!shortcutsGrid) return;
    
    Sortable.create(shortcutsGrid, {
        animation: 200,
        forceFallback: true,
        dragClass: "sortable-dragging",
        ghostClass: "sortable-placeholder",
        filter: ".add-card-wrapper", 
        
        onEnd: function (evt) {
            if (evt.oldIndex === evt.newIndex) return;
            const movedItem = shortcuts.splice(evt.oldIndex, 1)[0];
            shortcuts.splice(evt.newIndex, 0, movedItem);
            saveAndRender();
        }
    });
}
async function initWeather() {
    const cachedString = localStorage.getItem(CACHE_KEY);
    if (cachedString) {
        const cached = JSON.parse(cachedString) as WeatherCache;
        const now = Date.now();
        if ((now - cached.timestamp < CACHE_DURATION) && (cached.city === currentCityData.name)) {
            renderWeather(cached.data);
            return;
        }
    }
    fetchWeatherFromAPI();
}
async function fetchWeatherFromAPI(forceUpdate = false): Promise<void> {
    if(!weatherEnabled) return;
    try {
        const data = await fetchWeatherData(currentCityData);
        if (!data) return;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), city: currentCityData.name, data: data }));
        renderWeather(data);
    } catch (error) { weatherTemp.textContent = '--'; }
}
function renderLauncher(providerKey: keyof typeof launcherData): void {
    renderLauncherApps(launcherData[providerKey], {
        launcherGrid,
        launcherAllAppsLink
    });
}

function updateCreditsUI(source: string, creditText?: string) {
    const creditsContainer = getById<HTMLDivElement>('wallpaperCredits');
    const creditsSpan = getById<HTMLSpanElement>('wallpaperCreditText');

    if (!creditsContainer || !creditsSpan) return;

    if (source === 'local' || source === 'preset' || source === 'upload') {
        creditsContainer.classList.add('hidden');
    } else {
        creditsSpan.textContent = creditText || 'Daily Wallpaper';
        creditsContainer.classList.remove('hidden');
    }
}

/* --- 7. UI Updates --- */
function applyInitialTheme() {
    applyTheme(savedTheme);
}
function applyInitialSearchEngine() {
    setSearchEngine(savedEngine);
}
function applyInitialShortcutsVisibility() {
    if(toggleShortcuts) {
        toggleShortcuts.checked = shortcutsVisible;
        updateShortcutsVisibility(shortcutsVisible, false);
    }
}
function applyInitialSearchBarVisibility() {
    updateSearchSettings(false);
    if (toggleSearchBar) {
        toggleSearchBar.checked = searchBarVisible;
    }
}
function applyInitialSuggestionsActive() {
    if(toggleSuggestions) {
        toggleSuggestions.checked = suggestionsActive;
    }
}
function applyInitialClearSearch() {
    if(toggleClearSearch) {
        toggleClearSearch.checked = clearSearchEnabled;
    }
    updateGoogleParams();
}
function applyInitialVoiceSearch() {
    if (toggleVoiceSearch) {
        toggleVoiceSearch.checked = voiceSearchEnabled;
    }
    updateVoiceSearchAvailability();
}

function syncVoiceLanguageOptions(): void {
    if (!voiceLanguageSelect) return;

    const preservedAutoOption = voiceLanguageSelect.querySelector('option[value=""]')?.cloneNode(true) as HTMLOptionElement | null;
    voiceLanguageSelect.innerHTML = '';

    if (preservedAutoOption) {
        voiceLanguageSelect.appendChild(preservedAutoOption);
    } else {
        const autoOption = document.createElement('option');
        autoOption.value = '';
        autoOption.textContent = 'Auto (Browser)';
        voiceLanguageSelect.appendChild(autoOption);
    }

    if (languageSelect) {
        Array.from(languageSelect.options).forEach((option) => {
            const normalized = normalizeVoiceLanguage(option.value);
            if (!normalized) return;
            if (Array.from(voiceLanguageSelect.options).some((existing) => existing.value === normalized)) return;

            const voiceOption = document.createElement('option');
            voiceOption.value = normalized;
            voiceOption.textContent = option.textContent || normalized;
            voiceLanguageSelect.appendChild(voiceOption);
        });
    }

    const normalizedSaved = normalizeVoiceLanguage(voiceSearchLanguage);
    const hasSaved = normalizedSaved && Array.from(voiceLanguageSelect.options).some((option) => option.value === normalizedSaved);
    voiceLanguageSelect.value = hasSaved ? normalizedSaved : '';
}
function applyInitialAnimationsDisabled() {
    if (toggleDisableAnimations) {
        toggleDisableAnimations.checked = animationsDisabled;
    }
    updateAnimationsDisabled(animationsDisabled);
}
function applyInitialWeatherState() {
    if (cityInput) cityInput.value = currentCityData.name;
    updateWeatherVisibility(false);
    updateUnitButtons();
    if (weatherEnabled) initWeather();
}
function applyInitialLauncherState() {
    if(toggleLauncher) toggleLauncher.checked = launcherEnabled;
    if(launcherProvider) launcherProvider.value = currentProvider;
    updateLauncherVisibility(false);
    if(launcherEnabled) renderLauncher(currentProvider);
}
function applyInitialWallpaperState() {
    if (toggleWallpaper) {
        toggleWallpaper.checked = wallpaperEnabled;
        updateWallpaperUIState(wallpaperEnabled, false);
    }

    // Se for API, seleciona no dropdown
    if (currentWallpaperSource === 'api' && wallpaperSourceSelect) {
        wallpaperSourceSelect.value = currentWallpaperType; 
        clearPresetSelection();
    } else {
        // Se for Local, seleciona no Grid e reseta dropdown
        if (wallpaperSourceSelect) wallpaperSourceSelect.value = 'noSource';
        highlightSelectedWallpaper(currentWallpaperValue);
    }
    
    applyWallpaperLogic();
}
let brandIntervalStarted = false;
function applyBrandInterval() {
    initBrand();
    if (brandIntervalStarted) return;
    brandIntervalStarted = true;
    setInterval(initBrand, 60000);
}

const PERSISTENT_BACKUP_KEY = 'fluent_persistent_backup_v1';
const UPDATE_NOTICE_PENDING_KEY = 'update_notice_pending';
const UPDATE_NOTICE_VERSION_KEY = 'update_notice_version';

function getStorageLocalItems(key: string | string[]): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
        const localStorageApi = chrome.storage?.local;
        if (!localStorageApi) {
            resolve({});
            return;
        }

        localStorageApi.get(key, (items) => resolve(items || {}));
    });
}

function setStorageLocalItems(items: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
        const localStorageApi = chrome.storage?.local;
        if (!localStorageApi) {
            resolve();
            return;
        }

        localStorageApi.set(items, () => resolve());
    });
}

function getLocalPreferencesSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    APP_KEYS.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) snapshot[key] = value;
    });
    return snapshot;
}

async function persistPreferencesBackup(): Promise<void> {
    const snapshot = getLocalPreferencesSnapshot();
    await setStorageLocalItems({ [PERSISTENT_BACKUP_KEY]: snapshot });
}

async function restorePreferencesBackupIfNeeded(): Promise<boolean> {
    const items = await getStorageLocalItems(PERSISTENT_BACKUP_KEY);
    const backupRaw = items[PERSISTENT_BACKUP_KEY];
    if (!backupRaw || typeof backupRaw !== 'object') return false;

    const backup = backupRaw as Record<string, unknown>;
    let restoredAny = false;

    Object.entries(backup).forEach(([key, value]) => {
        if (typeof value !== 'string') return;
        if (localStorage.getItem(key) !== null) return;
        localStorage.setItem(key, value);
        restoredAny = true;
    });

    return restoredAny;
}

async function getUpdateNoticeState(): Promise<{ pending: boolean; version: string }> {
    const items = await getStorageLocalItems([UPDATE_NOTICE_PENDING_KEY, UPDATE_NOTICE_VERSION_KEY]);
    const pending = items[UPDATE_NOTICE_PENDING_KEY] === true;
    const version = typeof items[UPDATE_NOTICE_VERSION_KEY] === 'string'
        ? String(items[UPDATE_NOTICE_VERSION_KEY])
        : '';
    return { pending, version };
}

async function clearUpdateNoticeState(): Promise<void> {
    const version = chrome.runtime.getManifest().version;
    localStorage.setItem('settings_dot_seen', 'true');
    localStorage.setItem('settings_dot_seen_version', version);
    await setStorageLocalItems({
        [UPDATE_NOTICE_PENDING_KEY]: false,
        [UPDATE_NOTICE_VERSION_KEY]: version
    });
}

function createSettingsUpdateTooltip(message: string): HTMLDivElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'settings-update-tooltip';
    tooltip.textContent = message;
    return tooltip;
}

/* --- 8. Modals & Settings --- */
document.addEventListener("DOMContentLoaded", async () => {
    const restoredFromBackup = await restorePreferencesBackupIfNeeded();
    if (restoredFromBackup) {
        await persistPreferencesBackup();
        location.reload();
        return;
    }

    await persistPreferencesBackup();
    window.addEventListener('beforeunload', () => {
        void persistPreferencesBackup();
    });

    /* Theme Logic */
    applyInitialTheme();
    if (themeBtns) {
        themeBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const theme = btn.dataset.theme as ThemeMode | undefined;
                if (!theme) return;
                applyTheme(theme);
                localStorage.setItem("theme", theme);
            });
        });
    }
    /* Greeting System */
    applyBrandInterval();
    if (toggleGreeting) {
        toggleGreeting.checked = localStorage.getItem('showGreeting') !== 'false';
        updateGreetingSettingsVisibility(toggleGreeting.checked, false);
        toggleGreeting.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target) return;
            const checked = target.checked;
            localStorage.setItem('showGreeting', String(checked));
            updateGreetingSettingsVisibility(checked);
            initBrand();
        });
    }
    if (greetingNameInput) {
        greetingNameInput.value = localStorage.getItem('greetingName') || '';
        greetingNameInput.addEventListener('input', (e) => {
            const target = getInputTarget(e);
            if (!target) return;
            localStorage.setItem('greetingName', target.value);
            initBrand();
        });
    }
    if (greetingStyleSelect) {
        greetingStyleSelect.value = localStorage.getItem('greetingStyle') || '3d';
        greetingStyleSelect.addEventListener('change', (e) => {
            const target = getSelectTarget(e);
            if (!target) return;
            localStorage.setItem('greetingStyle', target.value);
            initBrand();
        });
    }
    /* Settings Popup */
    if (configBtn && configPopup) {
        const settingsWrapper = configBtn.closest('.settings-wrapper') as HTMLElement | null;
        let updateTooltip: HTMLDivElement | null = null;

        const updateState = await getUpdateNoticeState();
        if (updateState.pending && settingsDot) {
            settingsDot.classList.add('active');
            if (settingsWrapper) {
                updateTooltip = createSettingsUpdateTooltip('New update');
                settingsWrapper.appendChild(updateTooltip);
            }
        }

        configBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopups(configPopup);
            configPopup.classList.toggle('active');
            if (settingsDot && settingsDot.classList.contains('active')) {
                settingsDot.classList.remove('active');
                void clearUpdateNoticeState();
            }
            if (updateTooltip) {
                updateTooltip.remove();
                updateTooltip = null;
            }
        });
        document.addEventListener('click', (e) => {
            const targetNode = e.target as Node | null;
            if (!targetNode) return;
            if (configPopup.classList.contains('active')) {
                if (!configPopup.contains(targetNode) && !configBtn.contains(targetNode)) {
                    configPopup.classList.remove('active');
                }
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && configPopup.classList.contains('active')) {
                configPopup.classList.remove('active');
            }
        });
    }
    applyInitialAnimationsDisabled();
    if (toggleDisableAnimations) {
        toggleDisableAnimations.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target) return;

            animationsDisabled = target.checked;
            localStorage.setItem('animationsDisabled', String(target.checked));
            localStorage.removeItem('performanceModeEnabled');
            updateAnimationsDisabled(target.checked);
        });
    }
    /* Shortcuts & Modals */
    document.addEventListener('click', (e) => {
        const targetNode = e.target as Node | null;
        if (!targetNode) return;
        document.querySelectorAll('.shortcut-dropdown.active').forEach(dropdown => {
            if (!dropdown.closest('.menu-wrapper')?.contains(targetNode)) {
                dropdown.classList.remove('active');
            }
        });
    });
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (addModal) {
        addModal.addEventListener('click', (e) => {
            if (e.target === addModal) closeModal();
        });
    }
    if (toggleCustomIcon) {
        toggleCustomIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if(customIconGroup) customIconGroup.classList.toggle('hidden');
        });
    }
    if (shortcutForm) {
        shortcutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputName = getInputById('inputName');
            const inputUrl = getInputById('inputUrl');
            const inputIcon = getInputById('inputIcon');
            if (!inputName || !inputUrl || !inputIcon) return;

            let url = inputUrl.value;
            if (!url.startsWith('http')) url = 'https://' + url;
            const newShortcut = {
                name: inputName.value,
                url: url,
                customIcon: inputIcon.value || null
            };
            if (editingIndex !== null && editingIndex >= 0) {
                shortcuts[editingIndex] = newShortcut;
            } else {
                shortcuts.push(newShortcut);
            }
            saveAndRender();
            closeModal();
        });
    }
    /* Shortcuts Rows */
    if (rowsSelect) {
        rowsSelect.value = String(allowedRows);
        rowsSelect.addEventListener('change', (e) => {
            const target = getSelectTarget(e);
            if (!target) return;
            allowedRows = parseInt(target.value);
            localStorage.setItem('shortcutsRows', String(allowedRows));
            renderShortcuts();
        });
    }
    renderShortcuts();
    initSortable();

    /* Shortcuts Visibility */
    applyInitialShortcutsVisibility();
    if(toggleShortcuts) {
        toggleShortcuts.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target) return;
            const isVisible = target.checked;
            updateShortcutsVisibility(isVisible);
            localStorage.setItem('shortcutsVisible', String(isVisible));
        });
    }
    const toggleCompact = getById<HTMLInputElement>('toggleCompactBar');
    bindSearchFeature({
        applyInitialSearchEngine,
        engineBtn,
        dropdown,
        closePopups,
        items,
        hasEngine: (engine) => engine in engines,
        setSearchEngine,
        applyInitialSearchBarVisibility,
        toggleSearchBar,
        setSearchBarVisible: (visible) => { searchBarVisible = visible; },
        updateSearchSettings,
        applyInitialSuggestionsActive,
        toggleSuggestions,
        getSuggestionsActive: () => suggestionsActive,
        setSuggestionsActive: (enabled) => { suggestionsActive = enabled; },
        clearSuggestions,
        applyInitialClearSearch,
        toggleClearSearch,
        setClearSearchEnabled: (enabled) => { clearSearchEnabled = enabled; },
        updateGoogleParams,
        toggleCompact,
        getCompactBarEnabled: () => compactBarEnabled,
        setCompactBarEnabled: (enabled) => { compactBarEnabled = enabled; },
        updateCompactBarStyle,
        applyInitialVoiceSearch,
        toggleVoiceSearch,
        setVoiceSearchEnabled: (enabled) => { voiceSearchEnabled = enabled; },
        updateVoiceSearchAvailability,
        searchInput,
        debounce,
        suggestionsCache,
        renderSuggestions,
        fetchSuggestions,
        updateSelection
    });

    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', () => {
            startVoiceSearch();
        });
    }
    /* Weather Widget */
    bindWeatherFeature({
        applyInitialWeatherState,
        toggleWeather,
        getWeatherEnabled: () => weatherEnabled,
        setWeatherEnabled: (enabled) => { weatherEnabled = enabled; },
        updateWeatherVisibility,
        initWeather,
        unitBtns,
        setWeatherUnit: (unit) => { weatherUnit = unit; },
        updateUnitButtons,
        saveCityBtn,
        cityInput,
        searchCity
    });

    /* App Launcher */
    bindLauncherFeature({
        applyInitialLauncherState,
        toggleLauncher,
        getLauncherEnabled: () => launcherEnabled,
        setLauncherEnabled: (enabled) => { launcherEnabled = enabled; },
        updateLauncherVisibility,
        renderLauncher,
        getCurrentProvider: () => currentProvider,
        setCurrentProvider: (provider) => { currentProvider = provider; },
        launcherProvider,
        appLauncherBtn,
        launcherPopup,
        closePopups
    });
    
    /* Wallpaper System */
    bindWallpaperFeature({
        applyInitialWallpaperState,
        toggleWallpaper,
        setWallpaperEnabled: (enabled) => { wallpaperEnabled = enabled; },
        getWallpaperEnabled: () => wallpaperEnabled,
        updateWallpaperUIState,
        applyWallpaperLogic,
        wallpaperOptions,
        wallpaperSourceSelect,
        setWallpaperSource: (source) => { currentWallpaperSource = source; },
        setWallpaperType: (type) => { currentWallpaperType = type; },
        setWallpaperValue: (value) => { currentWallpaperValue = value; },
        saveWallpaperConfig,
        highlightSelectedWallpaper,
        uploadOption,
        uploadInput,
        processWallpaperImage,
        saveWallpaperToDB,
        clearPresetSelection
    });

    /* --- Language Settings --- */
    if (languageSelect) {
        const savedLang = localStorage.getItem('userLanguage');
        if (savedLang) {
            languageSelect.value = savedLang;
        } else {
            try {
                const browserLang = navigator.language.replace('-', '_');
                const optionExists = Array.from(languageSelect.options).some(o => o.value === browserLang);
                if (optionExists) {
                    languageSelect.value = browserLang;
                    localStorage.setItem('userLanguage', browserLang); 
                } else {
                    languageSelect.value = 'en_US';
                }
            } catch (e) {
                console.log("Idioma auto-detect falhou, usando padrão.");
            }
        }
        languageSelect.addEventListener('change', (e) => {
            const target = getSelectTarget(e);
            if (!target) return;
            localStorage.setItem('userLanguage', target.value);
            location.reload(); 
        });
    }

    if (voiceLanguageSelect) {
        syncVoiceLanguageOptions();
        voiceLanguageSelect.addEventListener('change', (e) => {
            const target = getSelectTarget(e);
            if (!target) return;

            const normalized = normalizeVoiceLanguage(target.value);
            voiceSearchLanguage = normalized;

            if (normalized) {
                localStorage.setItem('voiceSearchLanguage', normalized);
            } else {
                localStorage.removeItem('voiceSearchLanguage');
            }
        });
    }
    /* Export & Import */
    if (versionDisplay) {
        try { versionDisplay.textContent = `v${chrome.runtime.getManifest().version}`; }
        catch (e) { versionDisplay.textContent = 'v1.0'; }
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const backupData: Record<string, string> = {};
            APP_KEYS.forEach(key => {
                const value = localStorage.getItem(key);
                if (value !== null) backupData[key] = value;
            });
            backupData._backupDate = new Date().toISOString();
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fluent-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            const file = target?.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(String((event.target as FileReader).result || '{}')) as BackupPayload;
                    if (confirm('Restore backup? This will replace current settings.')) {
                        APP_KEYS.forEach(key => {
                            const value = data[key];
                            if (typeof value === 'string') localStorage.setItem(key, value);
                        });
                        location.reload();
                    }
                } catch (error) { alert('Invalid backup file.'); }
                importInput.value = '';
            };
            reader.readAsText(file);
        });
    }
});

/* --- 9. Post-i18n Refresh --- */
document.addEventListener('i18nReady', () => {
    console.log("Traduções carregadas. Iniciando interface...");
    applyBrandInterval();
    renderShortcuts();
});