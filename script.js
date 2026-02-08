document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements & Constants ---
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPopup = document.getElementById('settingsPopup');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const toggleShortcuts = document.getElementById('toggleShortcuts');
    const rowsSelect = document.getElementById('rowsSelect');
    const shortcutsGrid = document.getElementById('shortcutsGrid') || document.querySelector('.shortcuts-grid');
    const rowsInputGroup = document.getElementById('rowsInputGroup');
    const IS_STORE_VERSION = false;

    // --- Brand / Store Version Logic ---
    function initBrand() {
        const logoWrapper = document.querySelector('.logo-wrapper');
        const ICON_MORNING = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 60px; margin-right: 16px;"><g stroke-width="0"/><g stroke-linecap="round" stroke-linejoin="round"/><path d="M23.992 38.465c.647 0 1.18.492 1.244 1.122l.006.128v3.038a1.25 1.25 0 0 1-2.493.127l-.007-.127v-3.038c0-.69.56-1.25 1.25-1.25m11.903-4.367.101.09 2.148 2.149a1.25 1.25 0 0 1-1.666 1.859l-.102-.091-2.148-2.148a1.25 1.25 0 0 1 1.667-1.86m-22.14.09a1.25 1.25 0 0 1 .091 1.667l-.091.102-2.148 2.148a1.25 1.25 0 0 1-1.859-1.667l.091-.101 2.148-2.148a1.25 1.25 0 0 1 1.768 0M24 13.082c6.03 0 10.92 4.888 10.92 10.919 0 6.03-4.89 10.92-10.92 10.92S13.08 30.03 13.08 24 17.97 13.08 24 13.08m0 2.5a8.42 8.42 0 1 0 0 16.838 8.42 8.42 0 0 0 0-16.838m18.73 7.206a1.25 1.25 0 0 1 .129 2.494l-.128.006h-3.038a1.25 1.25 0 0 1-.127-2.493l.127-.007zm-34.423-.058a1.25 1.25 0 0 1 .127 2.493l-.127.007H5.269a1.25 1.25 0 0 1-.128-2.494l.128-.006zm3.199-12.925.101.091 2.148 2.148a1.25 1.25 0 0 1-1.666 1.86l-.102-.092-2.148-2.148a1.25 1.25 0 0 1 1.667-1.859m26.638.091a1.25 1.25 0 0 1 .091 1.667l-.09.101-2.149 2.148a1.25 1.25 0 0 1-1.859-1.666l.091-.102 2.148-2.148a1.25 1.25 0 0 1 1.768 0M24 3.997c.648 0 1.18.492 1.244 1.123l.006.127v3.038a1.25 1.25 0 0 1-2.493.128l-.007-.128V5.247c0-.69.56-1.25 1.25-1.25" fill="currentColor"/></svg>`;
        const ICON_AFTERNOON = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 60px; margin-right: 16px;"><g stroke-width="0"/><g stroke-linecap="round" stroke-linejoin="round"/><path d="M24 13.08c6.03 0 10.92 4.89 10.92 10.92q-.002 1.026-.184 2h8.014a1.25 1.25 0 1 1 0 2.5H5.25a1.25 1.25 0 1 1 0-2.5h8.013a11 11 0 0 1-.183-2c0-6.03 4.89-10.92 10.92-10.92M15.82 26h16.36a8.42 8.42 0 1 0-16.36 0M11.506 9.804l.101.091 2.148 2.148a1.25 1.25 0 0 1-1.666 1.86l-.102-.092-2.148-2.148a1.25 1.25 0 0 1 1.666-1.859m26.639.091a1.25 1.25 0 0 1 .091 1.667l-.091.101-2.148 2.148a1.25 1.25 0 0 1-1.859-1.666l.091-.102 2.148-2.148a1.25 1.25 0 0 1 1.768 0M24 3.997c.648 0 1.18.492 1.244 1.123l.006.127v3.038a1.25 1.25 0 0 1-2.493.128l-.007-.128V5.247c0-.69.56-1.25 1.25-1.25M21.25 38a1.25 1.25 0 1 0 0 2.5h5.5a1.25 1.25 0 1 0 0-2.5zM12 33.25c0-.69.56-1.25 1.25-1.25h21.5a1.25 1.25 0 1 1 0 2.5h-21.5c-.69 0-1.25-.56-1.25-1.25" fill="currentColor"/></svg>`;
        const ICON_NIGHT = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 60px; margin-right: 16px;"><g stroke-width="0"/><g stroke-linecap="round" stroke-linejoin="round"/><path d="M9.669 33.009c4.97 8.61 15.979 11.559 24.588 6.588a17.9 17.9 0 0 0 5.822-5.367 1.35 1.35 0 0 0-.657-2.037c-6.78-2.427-10.412-5.239-12.52-9.261-2.218-4.235-2.791-8.874-1.24-15.232a1.35 1.35 0 0 0-1.383-1.668c-2.802.15-5.54.955-8.022 2.389C7.647 13.39 4.698 24.4 9.67 33.009m15.02-8.917c2.302 4.396 6.111 7.43 12.426 9.907a15.5 15.5 0 0 1-4.108 3.433c-7.413 4.28-16.893 1.74-21.173-5.673s-1.74-16.893 5.673-21.173a15.5 15.5 0 0 1 4.907-1.819l.469-.08c-1.194 5.968-.592 10.83 1.805 15.405" fill="currentColor"/></svg>`;
        if (IS_STORE_VERSION) {
            if(logoWrapper) {
                logoWrapper.style.display = 'flex';
                logoWrapper.style.flexDirection = 'row';
                logoWrapper.style.alignItems = 'center';
                logoWrapper.style.gap = '0'; 
                const hour = new Date().getHours();
                let greetingText = "Good Afternoon!";
                let greetingIcon = ICON_AFTERNOON;
                if (hour < 12) {
                    greetingText = "Good Morning!";
                    greetingIcon = ICON_MORNING;
                } else if (hour >= 18) {
                    greetingText = "Goodnight!";
                    greetingIcon = ICON_NIGHT;
                }
                logoWrapper.innerHTML = `
                    ${greetingIcon}
                    <h1 style="font-size: 48px; font-weight: 600; color: var(--text-color); margin: 0;">${greetingText}</h1>
                `;
            }
        } else {
            if(logoWrapper) logoWrapper.style.display = 'flex';
        }
    }
    initBrand();

    // --- Settings Popup Logic ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsPopup.classList.toggle('active');
        });
    }
    document.addEventListener('click', (e) => {
        if (settingsPopup && !settingsPopup.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPopup.classList.remove('active');
        }
    });

    // --- Theme Logic ---
    const savedTheme = localStorage.getItem('theme') || 'auto';
    applyTheme(savedTheme);
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            localStorage.setItem('theme', theme);
        });
    });
    function applyTheme(theme) {
        themeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
        document.body.removeAttribute('data-theme');
        if (theme === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.setAttribute('data-theme', 'dark');
            }
        } else {
            document.body.setAttribute('data-theme', theme);
        }
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'auto') {
            document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });

    // --- Shortcuts Visibility & Rows ---
    const shortcutsVisible = localStorage.getItem('shortcutsVisible') !== 'false'; 
    toggleShortcuts.checked = shortcutsVisible;
    updateShortcutsVisibility(shortcutsVisible);
    toggleShortcuts.addEventListener('change', (e) => {
        const isVisible = e.target.checked;
        updateShortcutsVisibility(isVisible);
        localStorage.setItem('shortcutsVisible', isVisible);
    });
    function updateShortcutsVisibility(visible) {
        if (shortcutsGrid) {
            shortcutsGrid.style.display = visible ? 'grid' : 'none';
        }
        if (rowsInputGroup) {
            rowsInputGroup.style.display = visible ? 'block' : 'none';
        }
    }
    let allowedRows = parseInt(localStorage.getItem('shortcutsRows')) || 2; 
    if (rowsSelect) {
        rowsSelect.value = allowedRows;
        rowsSelect.addEventListener('change', (e) => {
            allowedRows = parseInt(e.target.value);
            localStorage.setItem('shortcutsRows', allowedRows);
            renderShortcuts();
        });
    }

    // --- Search Engine Logic ---
    const engineBtn = document.getElementById('engineBtn');
    const dropdown = document.getElementById('engineDropdown');
    const currentIcon = document.getElementById('currentEngineIcon');
    const searchForm = document.getElementById('searchForm');
    const items = document.querySelectorAll('.dropdown-item');
    const engines = {
        google: { url: 'https://www.google.com/search', icon: 'assets/google.svg' },
        bing: { url: 'https://www.bing.com/search', icon: 'assets/bing.svg' }
    };
    if (engineBtn) {
        engineBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }
    document.addEventListener('click', (e) => {
        if (engineBtn && dropdown && !engineBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    items.forEach(item => {
        item.addEventListener('click', () => {
            const selectedEngine = item.getAttribute('data-engine');
            const config = engines[selectedEngine];
            if (currentIcon) currentIcon.src = config.icon;
            if (searchForm) searchForm.action = config.url;
            dropdown.classList.remove('active');
        });
    });

    // --- Copilot mode ---
    const copilotToggle = document.getElementById('copilotToggle');
    const searchBar = document.getElementById('searchForm');
    const searchInput = searchBar.querySelector('input[name="q"]');
    
    let isCopilotMode = false;

    if (copilotToggle) {
        copilotToggle.addEventListener('click', () => {
            isCopilotMode = !isCopilotMode;
            updateCopilotState();
        });
    }

    function updateCopilotState() {
        if (isCopilotMode) {
            searchBar.classList.add('copilot-active');
            searchInput.placeholder = "Ask the Copilot";
            searchInput.focus();
        } else {
            searchBar.classList.remove('copilot-active');
            searchInput.placeholder = "Search the web";
        }
    }
    searchBar.addEventListener('submit', (e) => {
        if (isCopilotMode) {
            e.preventDefault(); 
            const query = searchInput.value;
        if (query.trim() !== "") {
                window.location.href = `https://www.bing.com/chat?q=${encodeURIComponent(query)}`;
            }
        }
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isCopilotMode) {
            isCopilotMode = false;
            updateCopilotState();
        }
    });

    // --- Icons & Modal Elements ---
    const ICON_ADD = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13V3.754a.75.75 0 0 0-1.5 0V13H3.754a.75.75 0 0 0 0 1.5H13v9.252a.75.75 0 0 0 1.5 0V14.5l9.25.003a.75.75 0 0 0 0-1.5z" fill="currentColor"/></svg>`;
    const ICON_REMOVE = `<svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 7.25a5.75 5.75 0 0 1 5.746 5.53l.004.22H37a1.25 1.25 0 0 1 .128 2.494L37 15.5h-1.091l-1.703 22.57A4.25 4.25 0 0 1 29.968 42H18.032a4.25 4.25 0 0 1-4.238-3.93L12.09 15.5H11a1.25 1.25 0 0 1-1.244-1.122l-.006-.128c0-.647.492-1.18 1.122-1.244L11 13h7.25A5.75 5.75 0 0 1 24 7.25m9.402 8.25H14.598l1.69 22.382a1.75 1.75 0 0 0 1.744 1.618h11.936a1.75 1.75 0 0 0 1.745-1.618zm-6.152 5.25c.647 0 1.18.492 1.244 1.122L28.5 22v11a1.25 1.25 0 0 1-2.494.128L26 33V22c0-.69.56-1.25 1.25-1.25m-6.5 0c.647 0 1.18.492 1.244 1.122L22 22v11a1.25 1.25 0 0 1-2.494.128L19.5 33V22c0-.69.56-1.25 1.25-1.25m3.25-11a3.25 3.25 0 0 0-3.245 3.066L20.75 13h6.5A3.25 3.25 0 0 0 24 9.75" fill="#e74c3c"/></svg>`;
    const ICON_GLOBE_FALLBACK = `data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDEuOTk5YzUuNTI0IDAgMTAuMDAyIDQuNDc4IDEwLjAwMiAxMC4wMDIgMCA1LjUyMy00LjQ3OCAxMC4wMDEtMTAuMDAyIDEwLjAwMVMxLjk5OCAxNy41MjQgMS45OTggMTIuMDAxQzEuOTk4IDYuNDc3IDYuNDc2IDEuOTk5IDEyIDEuOTk5TTE0LjkzOSAxNi41SDkuMDZjLjY1MiAyLjQxNCAxLjc4NSA0LjAwMiAyLjkzOSA0LjAwMnMyLjI4Ny0xLjU4OCAyLjkzOS00LjAwMm0tNy40MyAwSDQuNzg1YTguNTMgOC41MyAwIDAgMCA0LjA5NCAzLjQxMWMtLjUyMi0uODItLjk1My0xLjg0Ni0xLjI3LTMuMDE1em0xMS43MDUgMGgtMi43MjJjLS4zMjQgMS4zMzUtLjc5MiAyLjUtMS4zNzMgMy40MTFhOC41MyA4LjUzIDAgMCAwIDMuOTEtMy4xMjd6TTcuMDk0IDEwSDMuNzM1bC0uMDA1LjAxN2E4LjUgOC41IDAgMCAwLS4yMzMgMS45ODRjMCAxLjA1Ni4xOTMgMi4wNjcuNTQ1IDNoMy4xNzNhMjAgMjAgMCAwIDEtLjIxOC0zYzAtLjY4NC4wMzMtMS4zNTQuMDk1LTIuMDAxbTguMzAzIDBIOC42MDNhMTkgMTkgMCAwIDAgLjEzNSA1aDYuNTI0YTE5IDE5IDAgMCAwIC4xMzUtNW00Ljg2OC0uMDAxaC0zLjM1OHEuMDk0Ljk3NC4wOTUgMi4wMDJhMjAgMjAgMCAwIDEtLjIxOCAzaDMuMTczYTguNSA4LjUgMCAwIDAgLjU0NS0zYzAtLjY5LS4wODMtMS4zNi0uMjM3LTIuMDAyTTguODggNC4wODlsLS4wMjMuMDFBOC41MyA4LjUzIDAgMCAwIDQuMjUgOC41aDMuMDQ4Yy4zMTQtMS43NTIuODYtMy4yNzggMS41ODMtNC40MU0xMiAzLjVsLS4xMTYuMDA1QzEwLjYyIDMuNjIgOS4zOTYgNS42MjIgOC44MyA4LjVoNi4zNDJjLS41NjYtMi44Ny0xLjc4My00Ljg2OS0zLjA0NS00Ljk5NXptMy4xMi41OS4xMDcuMTc1Yy42NyAxLjExMiAxLjE3NyAyLjU3MiAxLjQ3NSA0LjIzN2gzLjA0OGE4LjUzIDguNTMgMCAwIDAtNC4zMzktNC4yOXoiIGZpbGw9IiMyMTIxMjEiLz48L3N2Zz4=`;
    const addModal = document.getElementById('addModal') || document.querySelector('.modal-overlay');
    const shortcutForm = document.getElementById('shortcutForm');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toggleCustomIcon = document.getElementById('toggleCustomIcon');
    const customIconGroup = document.getElementById('customIconGroup');

    // --- Shortcuts Data Management ---
    let shortcuts = [];
    try {
        shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    } catch (e) {
        console.error('Erro ao ler atalhos:', e);
        shortcuts = [];
    }

    // --- Render Shortcuts ---
    function renderShortcuts() {
        if (!shortcutsGrid) return;
        shortcutsGrid.innerHTML = '';
        const COLUMNS = 10; 
        let currentRows = rowsSelect ? parseInt(rowsSelect.value) : (parseInt(localStorage.getItem('shortcutsRows')) || 2);
        const maxSlots = currentRows * COLUMNS;
        const visibleShortcuts = shortcuts.slice(0, maxSlots);
        visibleShortcuts.forEach((site, index) => {
            const iconSrc = site.customIcon || `https://www.google.com/s2/favicons?sz=64&domain_url=${site.url}`;
            const link = document.createElement('a');
            link.href = site.url;
            link.className = 'shortcut-item';
            link.innerHTML = `
                <div class="shortcut-card">
                    <button class="remove-btn" data-index="${index}">${ICON_REMOVE}</button>
                    <img src="${iconSrc}" class="shortcut-icon" onerror="this.src='${ICON_GLOBE_FALLBACK}'" alt="${site.name}">
                </div>
                <span class="shortcut-title">${site.name}</span>
            `;
            shortcutsGrid.appendChild(link);
        });
        if (visibleShortcuts.length < maxSlots) {
            const addBtn = document.createElement('div');
            addBtn.className = 'shortcut-item add-card-wrapper';
            addBtn.onclick = openModal; 
            addBtn.innerHTML = `
                <div class="shortcut-card">
                    ${ICON_ADD}
                </div>
                <span class="shortcut-title">Adicionar</span>
            `;
            shortcutsGrid.appendChild(addBtn);
        }
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); 
                e.stopPropagation();
                deleteShortcut(btn.dataset.index);
            });
        });
    }

    // --- Shortcut Actions (Delete/Save) ---
    function deleteShortcut(index) {
        shortcuts.splice(index, 1);
        saveAndRender();
    }
    function saveAndRender() {
        localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
        renderShortcuts();
    }

    // --- Modal Logic ---
    function openModal() {
        if (addModal) {
            addModal.classList.add('active');
            document.getElementById('inputName').value = '';
            document.getElementById('inputUrl').value = '';
            document.getElementById('inputIcon').value = '';
            if(customIconGroup) customIconGroup.classList.add('hidden');
            setTimeout(() => document.getElementById('inputName').focus(), 100);
        }
    }
    function closeModal() {
        if (addModal) addModal.classList.remove('active');
    }
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

    // --- Add Shortcut Form ---
    if (shortcutForm) {
        shortcutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let url = document.getElementById('inputUrl').value;
            if (!url.startsWith('http')) url = 'https://' + url;
            const newShortcut = {
                name: document.getElementById('inputName').value,
                url: url,
                customIcon: document.getElementById('inputIcon').value || null
            };
            shortcuts.push(newShortcut);
            saveAndRender();
            closeModal();
        });
    }

    // --- Weather Logic ---
    const API_KEY = 'f4dfa0b32bd44ce7af2175310260702'; 
    const weatherWidget = document.getElementById('weatherWidget');
    const toggleWeather = document.getElementById('toggleWeather');
    const cityInputGroup = document.getElementById('cityInputGroup');
    const cityInput = document.getElementById('cityInput');
    const saveCityBtn = document.getElementById('saveCityBtn');
    const weatherCity = document.getElementById('weatherCity');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherTemp = document.getElementById('weatherTemp');
    let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true'; 
    let storedCity = localStorage.getItem('weatherCity');
    let currentCity = 'São Paulo';
    if (storedCity) {
        if (storedCity.startsWith('{')) {
            try {
                const parsed = JSON.parse(storedCity);
                currentCity = parsed.name || 'São Paulo';
                localStorage.setItem('weatherCity', currentCity); 
            } catch (e) {
                currentCity = 'São Paulo';
            }
        } else {
            currentCity = storedCity;
        }
    }
    if (toggleWeather) {
        toggleWeather.checked = weatherEnabled;
        toggleWeather.addEventListener('change', (e) => {
            weatherEnabled = e.target.checked;
            localStorage.setItem('weatherEnabled', weatherEnabled);
            updateWeatherVisibility();
            if(weatherEnabled) fetchWeather();
        });
    }
    if (cityInput) cityInput.value = currentCity;
    updateWeatherVisibility();
    if(weatherEnabled) fetchWeather();
    function updateWeatherVisibility() {
        if(!weatherWidget || !cityInputGroup) return;
        if(weatherEnabled) {
            weatherWidget.style.display = 'flex';
            cityInputGroup.style.display = 'flex';
        } else {
            weatherWidget.style.display = 'none';
            cityInputGroup.style.display = 'none';
        }
    }
    if(saveCityBtn) {
        saveCityBtn.addEventListener('click', searchCity);
    }
    if(cityInput) {
        cityInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') searchCity();
        });
    }
    async function searchCity() {
        if (!API_KEY) {
            alert('Por favor, adicione sua API Key no script.js');
            return;
        }
        const query = cityInput.value.trim();
        if(!query) return;
        saveCityBtn.innerHTML = '...'; 
        try {
            const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`);
            const data = await res.json();
            if(data && data.length > 0) {
                const bestMatch = data[0];
                currentCity = `${bestMatch.name}`; 
                localStorage.setItem('weatherCity', currentCity);
                cityInput.value = currentCity; 
                fetchWeather(); 
            } else {
                alert('Cidade não encontrada.');
            }
        } catch (error) {
            console.error('Erro ao buscar cidade:', error);
            alert('Erro de conexão ou API Key inválida.');
        } finally {
            saveCityBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        }
    }
    async function fetchWeather() {
        if(!weatherEnabled) return;
        if (!API_KEY) return;
        try {
            const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${currentCity}&lang=pt`);
            const data = await res.json();
            if (data.error) {
                console.error('Erro API:', data.error.message);
                return;
            }
            const temp = Math.round(data.current.temp_c);
            const conditionText = data.current.condition.text;
            let iconUrl = data.current.condition.icon;
            if (iconUrl.startsWith('//')) {
                iconUrl = 'https:' + iconUrl;
            }
            weatherCity.textContent = data.location.name;
            weatherTemp.textContent = `${temp}°C`;
            weatherIcon.innerHTML = `<img src="${iconUrl}" alt="${conditionText}" title="${conditionText}">`;
            weatherWidget.href = `https://www.bing.com/weather/forecast?q=${data.location.name}`;
        } catch (error) {
            console.error('Erro ao atualizar clima:', error);
            weatherTemp.textContent = '--';
        }
    }

    // --- App Launcher Data ---
    const launcherData = {
        proton: {
            apps: [
                { name: 'Proton Mail', url: 'https://mail.proton.me', icon: 'assets/apps/proton/mail.svg' },
                { name: 'Proton Calendar', url: 'https://calendar.proton.me', icon: 'assets/apps/proton/calendar.svg' },
                { name: 'Proton Drive', url: 'https://drive.proton.me', icon: 'assets/apps/proton/drive.svg' },
                { name: 'Proton Pass', url: 'https://pass.proton.me', icon: 'assets/apps/proton/pass.svg' },
                { name: 'Proton VPN', url: 'https://account.protonvpn.com', icon: 'assets/apps/proton/vpn.svg' },
                { name: 'Proton Wallet', url: 'https://wallet.proton.me', icon: 'assets/apps/proton/wallet.svg' },
                { name: 'LumoAI', url: 'https://app.simplelogin.io', icon: 'assets/apps/proton/lumo.svg' },
                { name: 'Proton Docs', url: 'https://docs.proton.me', icon: 'assets/apps/proton/docs.svg' },
                { name: 'Proton Sheets', url: 'https://sheets.proton.me', icon: 'assets/apps/proton/sheets.svg' }
            ],
            allAppsLink: 'https://account.proton.me/apps'
        },
        microsoft: {
            apps: [
                { name: 'Copilot', url: 'https://copilot.microsoft.com', icon: 'assets/apps/microsoft/copilot.svg' },
                { name: 'Outlook', url: 'https://outlook.live.com', icon: 'assets/apps/microsoft/outlook.svg' },
                { name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'assets/apps/microsoft/onedrive.svg' },
                { name: 'Word', url: 'https://www.office.com/launch/word', icon: 'assets/apps/microsoft/word.svg' },
                { name: 'Excel', url: 'https://www.office.com/launch/excel', icon: 'assets/apps/microsoft/excel.svg' },
                { name: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', icon: 'assets/apps/microsoft/ppt.svg' },
                { name: 'OneNote', url: 'https://www.onenote.com', icon: 'assets/apps/microsoft/onenote.svg' },
                { name: 'Teams', url: 'https://teams.live.com', icon: 'assets/apps/microsoft/teams.svg' },
                { name: 'ClipChamp', url: 'https://app.clipchamp.com/', icon: 'assets/apps/microsoft/clip.svg' }
            ],
            allAppsLink: 'https://www.microsoft365.com/apps'
        },
        google: {
            apps: [
                { name: 'Gemini', url: 'https://gemini.google.com', icon: 'assets/apps/google/gemini.svg' },
                { name: 'Gmail', url: 'https://mail.google.com', icon: 'assets/apps/google/mail.svg' },
                { name: 'YouTube', url: 'https://youtube.com', icon: 'assets/apps/google/youtube.svg' },
                { name: 'Drive', url: 'https://drive.google.com', icon: 'assets/apps/google/drive.svg' },
                { name: 'Docs', url: 'https://docs.google.com', icon: 'assets/apps/google/docs.svg' },
                { name: 'Meet', url: 'https://meet.google.com', icon: 'assets/apps/google/meet.svg' },
                { name: 'Music', url: 'https://music.google.com', icon: 'assets/apps/google/music.svg' },
                { name: 'Meet', url: 'https://meet.google.com', icon: 'assets/apps/google/meet.svg' },
                { name: 'Web Store', url: 'https://chromewebstore.google.com', icon: 'assets/apps/google/store.svg' }
            ],
            allAppsLink: 'https://about.google/products/'
        }
    };

    // --- App Launcher Logic ---
    const appLauncherWrapper = document.getElementById('appLauncherWrapper');
    const appLauncherBtn = document.getElementById('appLauncherBtn');
    const launcherPopup = document.getElementById('launcherPopup');
    const launcherGrid = document.getElementById('launcherGrid');
    const launcherAllAppsLink = document.getElementById('launcherAllAppsLink');
    const toggleLauncher = document.getElementById('toggleLauncher');
    const launcherProvider = document.getElementById('launcherProvider');
    const launcherSelectGroup = document.getElementById('launcherSelectGroup');
    let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true'; 
    let currentProvider = localStorage.getItem('launcherProvider') || 'proton'; 
    if(toggleLauncher) toggleLauncher.checked = launcherEnabled;
    if(launcherProvider) launcherProvider.value = currentProvider;
    updateLauncherVisibility();
    if(launcherEnabled) renderLauncher(currentProvider);
    if(toggleLauncher) {
        toggleLauncher.addEventListener('change', (e) => {
            launcherEnabled = e.target.checked;
            localStorage.setItem('launcherEnabled', launcherEnabled);
            updateLauncherVisibility();
            if(launcherEnabled) renderLauncher(currentProvider);
        });
    }
    if(launcherProvider) {
        launcherProvider.addEventListener('change', (e) => {
            currentProvider = e.target.value;
            localStorage.setItem('launcherProvider', currentProvider);
            renderLauncher(currentProvider);
        });
    }
    function updateLauncherVisibility() {
        if(launcherEnabled) {
            appLauncherWrapper.style.display = 'block';
            if(launcherSelectGroup) launcherSelectGroup.style.display = 'block';
        } else {
            appLauncherWrapper.style.display = 'none';
            if(launcherSelectGroup) launcherSelectGroup.style.display = 'none';
        }
    }
    function renderLauncher(providerKey) {
        const data = launcherData[providerKey];
        if(!data) return;
        launcherGrid.innerHTML = '';
        data.apps.forEach(app => {
            const link = document.createElement('a');
            link.href = app.url;
            link.className = 'launcher-item';
            link.innerHTML = `
                <img src="${app.icon}" class="launcher-icon" alt="${app.name}">
                <span class="launcher-label">${app.name}</span>
            `;
            launcherGrid.appendChild(link);
        });
        if(launcherAllAppsLink) {
            launcherAllAppsLink.href = data.allAppsLink;
        }
    }
    if(appLauncherBtn) {
        appLauncherBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            launcherPopup.classList.toggle('active');
            appLauncherBtn.classList.toggle('active');
        });
    }
    document.addEventListener('click', (e) => {
        if(launcherPopup && launcherPopup.classList.contains('active')) {
            if(!launcherPopup.contains(e.target) && !appLauncherBtn.contains(e.target)) {
                launcherPopup.classList.remove('active');
                appLauncherBtn.classList.remove('active');
            }
        }
    });

    // --- Version Display ---
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) {
        try {
            const manifest = chrome.runtime.getManifest();
            versionDisplay.textContent = `v${manifest.version}`;
        } catch (e) {
            console.log('Não foi possível ler a versão do manifesto (contexto local).');
            versionDisplay.textContent = 'v1.0'; 
        }
    }
    // --- Backup system ---
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importInput = document.getElementById('importInput');

    // --- Key List ---
    const APP_KEYS = [
        'shortcuts',
        'theme',
        'weatherEnabled',
        'weatherCity',
        'shortcutsVisible',
        'shortcutsRows',
        'launcherEnabled',
        'launcherProvider'
    ];

    // --- Export Logic ---
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const backupData = {};

            APP_KEYS.forEach(key => {
                const value = localStorage.getItem(key);
                if (value !== null) {
                    backupData[key] = value;
                }
            });

            backupData._backupDate = new Date().toISOString();
            backupData._appName = "FluentNewTab";

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fluent-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // --- Import Logic ---
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click())
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data._appName && !data.shortcuts && !data.theme) {
                        alert('Erro: Este arquivo não parece ser um backup válido da Fluent New Tab.');
                        return;
                    }
                    if (confirm('Isso irá substituir suas configurações atuais pelas do backup. Deseja continuar?')) {
                        APP_KEYS.forEach(key => {
                            if (data[key] !== undefined) {
                                localStorage.setItem(key, data[key]);
                            }
                        });
                        alert('Backup restaurado com sucesso!');
                        location.reload();
                    }   
                } catch (error) {
                    console.error('Erro no backup:', error);
                    alert('Erro ao ler o arquivo. Verifique se é um .json válido.');
                }
                importInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    // --- Initialization ---
    renderShortcuts();
});