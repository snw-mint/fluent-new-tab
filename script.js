document.addEventListener("DOMContentLoaded", () => {
    // --- Theme Logic ---
    const themeBtns = document.querySelectorAll(".theme-btn");
    const savedTheme = localStorage.getItem("theme") || "auto";
    function applyTheme(theme) {
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
    applyTheme(savedTheme);
    if (themeBtns) {
        themeBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const theme = btn.dataset.theme;
                applyTheme(theme);
                localStorage.setItem("theme", theme);
            });
        });
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (localStorage.getItem("theme") === "auto") {
            document.documentElement.removeAttribute("data-theme");
            if (e.matches) {
                document.documentElement.setAttribute("data-theme", "dark");
            }
        }
    });

    // --- DOM Elements ---
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPopup = document.getElementById('settingsPopup');
    const toggleShortcuts = document.getElementById('toggleShortcuts');
    const rowsSelect = document.getElementById('rowsSelect');
    const shortcutsGrid = document.getElementById('shortcutsGrid');
    const rowsInputGroup = document.getElementById('rowsInputGroup');
    const searchInput = document.getElementById('searchInput');
    const searchBar = document.querySelector('.search-bar');
    const addModal = document.getElementById('addModal');
    const shortcutForm = document.getElementById('shortcutForm');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toggleCustomIcon = document.getElementById('toggleCustomIcon');
    const customIconGroup = document.getElementById('customIconGroup');

    // --- Icons ---
    const ICON_ADD = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13V3.754a.75.75 0 0 0-1.5 0V13H3.754a.75.75 0 0 0 0 1.5H13v9.252a.75.75 0 0 0 1.5 0V14.5l9.25.003a.75.75 0 0 0 0-1.5z" fill="currentColor"/></svg>`;
    const ICON_REMOVE = `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="m3.525 3.718.091-.102a1.25 1.25 0 0 1 1.666-.091l.102.091L14 12.233l8.616-8.617a1.25 1.25 0 0 1 1.768 1.768L15.767 14l8.617 8.616a1.25 1.25 0 0 1 .091 1.666l-.091.102a1.25 1.25 0 0 1-1.666.091l-.102-.091L14 15.767l-8.616 8.617a1.25 1.25 0 0 1-1.768-1.768L12.233 14 3.616 5.384a1.25 1.25 0 0 1-.091-1.666l.091-.102z" fill="currentColor"/></svg>`;
    const ICON_EDIT = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.03 2.97a3.58 3.58 0 0 1 0 5.06L9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L15.97 2.97a3.58 3.58 0 0 1 5.06 0M15 6.06 5.062 16a.75.75 0 0 0-.193.333l-1.05 3.85 3.85-1.05A.75.75 0 0 0 8 18.937L17.94 9zm2.03-2.03-.97.97L19 7.94l.97-.97a2.078 2.078 0 1 0-2.94-2.94" fill="currentColor"/></svg>`;
    const ICON_GLOBE_FALLBACK = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.999c5.524 0 10.002 4.478 10.002 10.002 0 5.523-4.478 10.001-10.002 10.001S1.998 17.524 1.998 12.001C1.998 6.477 6.476 1.999 12 1.999M14.939 16.5H9.06c.652 2.414 1.786 4.002 2.939 4.002s2.287-1.588 2.939-4.002Zm-7.43 0H4.785a8.53 8.53 0 0 0 4.094 3.411c-.522-.82-.953-1.846-1.27-3.015l-.102-.395Zm11.705 0h-2.722c-.324 1.335-.792 2.5-1.373 3.411a8.53 8.53 0 0 0 3.91-3.127l.185-.283ZM7.094 10H3.735l-.005.017a8.5 8.5 0 0 0-.233 1.984c0 1.056.193 2.067.545 3h3.173a21 21 0 0 1-.123-5Zm8.303 0H8.603a19 19 0 0 0 .135 5h6.524a19 19 0 0 0 .135-5m4.868 0h-3.358c.062.647.095 1.317.095 2a20 20 0 0 1-.218 3h3.173a8.5 8.5 0 0 0 .544-3c0-.689-.082-1.36-.236-2M8.88 4.09l-.023.008A8.53 8.53 0 0 0 4.25 8.5h3.048c.314-1.752.86-3.278 1.583-4.41ZM12 3.499l-.116.005C10.62 3.62 9.396 5.622 8.83 8.5h6.342c-.566-2.87-1.783-4.869-3.045-4.995zm3.12.59.107.175c.669 1.112 1.177 2.572 1.475 4.237h3.048a8.53 8.53 0 0 0-4.339-4.29l-.291-.121Z" fill="currentColor"/></svg>`;
    const ICON_MENU_DOTS = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.75 12a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0m6 0a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0M18 13.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5" fill="currentColor"/></svg>`;

    // --- Shortcuts Data Management ---
    let shortcuts = [];
    let editingIndex = -1; 

    try {
        shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    } catch (e) {
        console.error('Erro ao ler atalhos:', e);
        shortcuts = [];
    }

    // --- Modal Functions ---
    function closeModal() {
        if (addModal) addModal.classList.remove('active');
    }

    function openModal(index = null) {
        editingIndex = index;

        if (addModal) {
            addModal.classList.add('active');
            const modalTitle = document.querySelector('.modal-content h3');
            if (index !== null && shortcuts[index]) {
                const item = shortcuts[index];
                document.getElementById('inputName').value = item.name;
                document.getElementById('inputUrl').value = item.url;
                document.getElementById('inputIcon').value = item.customIcon || '';
                
                if (modalTitle) modalTitle.textContent = 'Edit Shortcut';
                if (item.customIcon && customIconGroup) customIconGroup.classList.remove('hidden');
            } 

            else {
                document.getElementById('inputName').value = '';
                document.getElementById('inputUrl').value = '';
                document.getElementById('inputIcon').value = '';
                
                if (modalTitle) modalTitle.textContent = 'Add Shortcut';
                if (customIconGroup) customIconGroup.classList.add('hidden');
            }
            
            setTimeout(() => document.getElementById('inputName').focus(), 100);
        }
    }

    // --- Shortcuts Rendering ---
    function renderShortcuts() {
        if (!shortcutsGrid) return;
        shortcutsGrid.innerHTML = '';
        const COLUMNS = 10; 
        let currentRows = rowsSelect ? parseInt(rowsSelect.value) : (parseInt(localStorage.getItem('shortcutsRows')) || 2);
        const maxSlots = currentRows * COLUMNS;
        const visibleShortcuts = shortcuts.slice(0, maxSlots);
        
        visibleShortcuts.forEach((site, index) => {
            const iconSrc = site.customIcon || `https://www.google.com/s2/favicons?sz=64&domain_url=${site.url}`;
            const link = document.createElement('div');
            link.className = 'shortcut-item';
            
            link.onclick = (e) => {
                if(e.target.closest('.menu-wrapper')) return;
                window.location.href = site.url;
            };

            const img = document.createElement('img');
            img.src = iconSrc;
            img.className = 'shortcut-icon';
            img.alt = site.name;
            img.onerror = () => { img.src = ICON_GLOBE_FALLBACK; };

            link.innerHTML = `
                <div class="shortcut-card">
                    <div class="menu-wrapper">
                        <button class="menu-btn" title="More options">${ICON_MENU_DOTS}</button>
                        <div class="shortcut-dropdown">
                            <div class="menu-option edit-option" data-index="${index}">
                                ${ICON_EDIT} <span>Edit</span>
                            </div>
                            <div class="menu-option remove-option" data-index="${index}">
                                ${ICON_REMOVE} <span>Remove</span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="shortcut-title">${site.name}</span>
            `;
            link.querySelector('.shortcut-card').appendChild(img);
            shortcutsGrid.appendChild(link);
        });

        if (visibleShortcuts.length < maxSlots) {
            const addBtn = document.createElement('div');
            addBtn.className = 'shortcut-item add-card-wrapper';
            addBtn.onclick = () => openModal(null);
            addBtn.innerHTML = `
                <div class="shortcut-card">${ICON_ADD}</div>
                <span class="shortcut-title">Add</span>
            `;
            shortcutsGrid.appendChild(addBtn);
        }

        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                document.querySelectorAll('.shortcut-dropdown.active').forEach(menu => {
                    if (menu !== btn.nextElementSibling) menu.classList.remove('active');
                });
                const dropdown = btn.nextElementSibling;
                dropdown.classList.toggle('active');
            });
        });

        document.querySelectorAll('.edit-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(parseInt(opt.dataset.index));
                opt.closest('.shortcut-dropdown').classList.remove('active');
            });
        });

        document.querySelectorAll('.remove-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteShortcut(parseInt(opt.dataset.index));
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-wrapper')) {
            document.querySelectorAll('.shortcut-dropdown.active').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
    function saveAndRender() {
        localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
        renderShortcuts();
    }
    function deleteShortcut(index) {
        shortcuts.splice(index, 1);
        saveAndRender();
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

    // --- Form Submit  ---
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

            if (editingIndex !== null && editingIndex >= 0) {
                shortcuts[editingIndex] = newShortcut; 
            } else {
                shortcuts.push(newShortcut); 
            }

            saveAndRender();
            closeModal();
        });
    }

    // --- Search Engine Logic ---
    const engineBtn = document.getElementById('engineBtn');
    const dropdown = document.getElementById('engineDropdown');
    const currentIcon = document.getElementById('currentEngineIcon');
    const searchForm = document.getElementById('searchForm');
    const items = document.querySelectorAll('.dropdown-item');
    const engines = {
        bing: { url: 'https://www.bing.com/search', icon: 'assets/search-engines/bing.svg' },
        google: { url: 'https://www.google.com/search', icon: 'assets/search-engines/google.svg' },
        brave: { url: 'https://search.brave.com/search', icon: 'assets/search-engines/brave.svg' },
        duck: { url: 'https://duckduckgo.com/', icon: 'assets/search-engines/ddg.svg' },
        ecosia: { url: 'https://www.ecosia.org/search', icon: 'assets/search-engines/ecosia.svg' },
        startpage: { url: 'https://www.startpage.com/sp/search', icon: 'assets/search-engines/startpg.svg' }
    };
    const savedEngine = localStorage.getItem('searchEngine') || 'bing';
    
    function setSearchEngine(engineKey) {
        const config = engines[engineKey];
        if (config) {
            if (currentIcon) {
                currentIcon.src = config.icon;
                currentIcon.onerror = () => { currentIcon.style.display = 'none'; };
                currentIcon.onload = () => { currentIcon.style.display = 'block'; };
            }
            if (searchForm) searchForm.action = config.url;
        }
    }
    setSearchEngine(savedEngine);

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
            setSearchEngine(selectedEngine);
            localStorage.setItem('searchEngine', selectedEngine);
            dropdown.classList.remove('active');
        });
    });

    // --- Brand Logic (Greetings) ---
    const ICON_MORNING = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 60px; margin-right: 16px;"><path d="M23.992 38.465c.647 0 1.18.492 1.244 1.122l.006.128v3.038a1.25 1.25 0 0 1-2.493.127l-.007-.127v-3.038c0-.69.56-1.25 1.25-1.25m11.903-4.367.101.09 2.148 2.149a1.25 1.25 0 0 1-1.666 1.859l-.102-.091-2.148-2.148a1.25 1.25 0 0 1 1.667-1.86m-22.14.09a1.25 1.25 0 0 1 .091 1.667l-.091.102-2.148 2.148a1.25 1.25 0 0 1-1.859-1.667l.091-.101 2.148-2.148a1.25 1.25 0 0 1 1.768 0M24 13.082c6.03 0 10.92 4.888 10.92 10.919 0 6.03-4.89 10.92-10.92 10.92S13.08 30.03 13.08 24 17.97 13.08 24 13.08m0 2.5a8.42 8.42 0 1 0 0 16.838 8.42 8.42 0 0 0 0-16.838m18.73 7.206a1.25 1.25 0 0 1 .129 2.494l-.128.006h-3.038a1.25 1.25 0 0 1-.127-2.493l.127-.007zm-34.423-.058a1.25 1.25 0 0 1 .127 2.493l-.127.007H5.269a1.25 1.25 0 0 1-.128-2.494l.128-.006zm3.199-12.925.101.091 2.148 2.148a1.25 1.25 0 0 1-1.666 1.86l-.102-.092-2.148-2.148a1.25 1.25 0 0 1 1.667-1.859m26.638.091a1.25 1.25 0 0 1 .091 1.667l-.09.101-2.149 2.148a1.25 1.25 0 0 1-1.859-1.666l.091-.102 2.148-2.148a1.25 1.25 0 0 1 1.768 0M24 3.997c.648 0 1.18.492 1.244 1.123l.006.127v3.038a1.25 1.25 0 0 1-2.493.128l-.007-.128V5.247c0-.69.56-1.25 1.25-1.25" fill="currentColor"/></path></svg>`;
    const ICON_AFTERNOON = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 60px; margin-right: 16px;"><path d="M24 13.08c6.03 0 10.92 4.89 10.92 10.92q-.002 1.026-.184 2h8.014a1.25 1.25 0 1 1 0 2.5H5.25a1.25 1.25 0 1 1 0-2.5h8.013a11 11 0 0 1-.183-2c0-6.03 4.89-10.92 10.92-10.92M15.82 26h16.36a8.42 8.42 0 1 0-16.36 0M11.506 9.804l.101.091 2.148 2.148a1.25 1.25 0 0 1-1.666 1.86l-.102-.092-2.148-2.148a1.25 1.25 0 0 1 1.666-1.859m26.639.091a1.25 1.25 0 0 1 .091 1.667l-.091.101-2.148 2.148a1.25 1.25 0 0 1-1.859-1.666l.091-.102 2.148-2.148a1.25 1.25 0 0 1 1.768 0M24 3.997c.648 0 1.18.492 1.244 1.123l.006.127v3.038a1.25 1.25 0 0 1-2.493.128l-.007-.128V5.247c0-.69.56-1.25 1.25-1.25M21.25 38a1.25 1.25 0 1 0 0 2.5h5.5a1.25 1.25 0 1 0 0-2.5zM12 33.25c0-.69.56-1.25 1.25-1.25h21.5a1.25 1.25 0 1 1 0 2.5h-21.5c-.69 0-1.25-.56-1.25-1.25" fill="currentColor"/></path></svg>`;
    const ICON_NIGHT = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 60px; margin-right: 16px;"><path d="M9.669 33.009c4.97 8.61 15.979 11.559 24.588 6.588a17.9 17.9 0 0 0 5.822-5.367 1.35 1.35 0 0 0-.657-2.037c-6.78-2.427-10.412-5.239-12.52-9.261-2.218-4.235-2.791-8.874-1.24-15.232a1.35 1.35 0 0 0-1.383-1.668c-2.802.15-5.54.955-8.022 2.389C7.647 13.39 4.698 24.4 9.67 33.009m15.02-8.917c2.302 4.396 6.111 7.43 12.426 9.907a15.5 15.5 0 0 1-4.108 3.433c-7.413 4.28-16.893 1.74-21.173-5.673s-1.74-16.893 5.673-21.173a15.5 15.5 0 0 1 4.907-1.819l.469-.08c-1.194 5.968-.592 10.83 1.805 15.405" fill="currentColor"/></path></svg>`;

    function initBrand() {
        const logoWrapper = document.querySelector('.logo-wrapper');
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
    }
    initBrand();

    // --- Settings Popup Toggle ---
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

    // --- Shortcuts Visibility ---
    const shortcutsVisible = localStorage.getItem('shortcutsVisible') !== 'false'; 
    if(toggleShortcuts) {
        toggleShortcuts.checked = shortcutsVisible;
        updateShortcutsVisibility(shortcutsVisible);
        toggleShortcuts.addEventListener('change', (e) => {
            const isVisible = e.target.checked;
            updateShortcutsVisibility(isVisible);
            localStorage.setItem('shortcutsVisible', isVisible);
        });
    }
    function updateShortcutsVisibility(visible) {
        if (shortcutsGrid) shortcutsGrid.style.display = visible ? 'grid' : 'none';
        if (rowsInputGroup) rowsInputGroup.style.display = visible ? 'block' : 'none';
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

    // --- Search  ---
    const searchWrapper = document.querySelector('.search-wrapper') || document.querySelector('.search-bar') || document.getElementById('searchForm');
    const toggleSearchBar = document.getElementById('toggleSearchBar'); 
    const suggestionsRow = document.getElementById('suggestionsRow');
    let searchBarVisible = localStorage.getItem('searchBarVisible') !== 'false';

    function updateSearchSettings() {
        if (searchWrapper) searchWrapper.style.display = searchBarVisible ? '' : 'none';
        
        if (toggleSearchBar) toggleSearchBar.checked = searchBarVisible;
        const displayStyle = searchBarVisible ? 'flex' : 'none';
        if (suggestionsRow) suggestionsRow.style.display = displayStyle;
    }
    updateSearchSettings();
    if (toggleSearchBar) {
        toggleSearchBar.addEventListener('change', (e) => {
            searchBarVisible = e.target.checked;
            localStorage.setItem('searchBarVisible', searchBarVisible);
            updateSearchSettings();
        });
    }

// --- Weather Logic ---
    const API_KEY = 'f4dfa0b32bd44ce7af2175310260702'; 
    const weatherWidget = document.getElementById('weatherWidget');
    const toggleWeather = document.getElementById('toggleWeather');
    const cityInputGroup = document.getElementById('cityInputGroup');
    const weatherUnitGroup = document.getElementById('weatherUnitGroup'); 
    const cityInput = document.getElementById('cityInput');
    const saveCityBtn = document.getElementById('saveCityBtn');
    const weatherCity = document.getElementById('weatherCity');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherTemp = document.getElementById('weatherTemp');
    const unitBtns = document.querySelectorAll('.unit-btn'); 
    let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true'; 
    let weatherUnit = localStorage.getItem('weatherUnit') || 'c'; 
    let storedCity = localStorage.getItem('weatherCity');
    let currentCity = 'New York';
    if (storedCity) {
        if (storedCity.startsWith('{')) {
            try {
                const parsed = JSON.parse(storedCity);
                currentCity = parsed.name || 'New York';
                localStorage.setItem('weatherCity', currentCity); 
            } catch (e) { currentCity = 'New York'; }
        } else { currentCity = storedCity; }
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
    function updateUnitButtons() {
        if(!unitBtns) return;
        unitBtns.forEach(btn => {
            if(btn.dataset.unit === weatherUnit) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    updateUnitButtons(); 

    unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            weatherUnit = btn.dataset.unit; 
            localStorage.setItem('weatherUnit', weatherUnit);
            updateUnitButtons();
            fetchWeather(); 
        });
    });

    if (cityInput) cityInput.value = currentCity;
    updateWeatherVisibility();
    if(weatherEnabled) fetchWeather();

    function updateWeatherVisibility() {
        if(!weatherWidget || !cityInputGroup) return;
        const displayStyle = weatherEnabled ? 'flex' : 'none';
        
        weatherWidget.style.display = displayStyle;
        cityInputGroup.style.display = displayStyle;
        if(weatherUnitGroup) weatherUnitGroup.style.display = displayStyle;
    }

    if(saveCityBtn) saveCityBtn.addEventListener('click', searchCity);
    if(cityInput) cityInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') searchCity(); });
    
    async function searchCity() {
        if (!API_KEY) { alert('API Key missing'); return; }
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
            } else { alert('City not found.'); }
        } catch (error) {
            console.error('Error searching for city:', error);
        } finally {
            saveCityBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        }
    }

    async function fetchWeather() {
        if(!weatherEnabled || !API_KEY) return;
        try {
            const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${currentCity}&lang=pt`);
            const data = await res.json();
            if (data.error) return;
            const isCelsius = weatherUnit === 'c';
            const tempValue = isCelsius ? data.current.temp_c : data.current.temp_f;
            const unitSymbol = isCelsius ? '°C' : '°F';
            const temp = Math.round(tempValue);

            let iconUrl = data.current.condition.icon;
            if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
            
            weatherCity.textContent = data.location.name;
            weatherTemp.textContent = `${temp}${unitSymbol}`; 
            weatherIcon.innerHTML = `<img src="${iconUrl}" alt="${data.current.condition.text}">`;
            weatherWidget.href = `https://www.bing.com/weather/forecast?q=${data.location.name}`;
        } catch (error) { weatherTemp.textContent = '--'; }
    }

    // --- App Launcher ---
    const launcherData = {
        proton: { apps: [
            { name: 'Proton Mail', url: 'https://mail.proton.me', icon: 'assets/apps/proton/mail.svg' },
            { name: 'Proton Calendar', url: 'https://calendar.proton.me', icon: 'assets/apps/proton/calendar.svg' },
            { name: 'Proton Drive', url: 'https://drive.proton.me', icon: 'assets/apps/proton/drive.svg' },
            { name: 'Proton Pass', url: 'https://pass.proton.me', icon: 'assets/apps/proton/pass.svg' },
            { name: 'Proton VPN', url: 'https://account.protonvpn.com', icon: 'assets/apps/proton/vpn.svg' },
            { name: 'Proton Wallet', url: 'https://wallet.proton.me', icon: 'assets/apps/proton/wallet.svg' },
            { name: 'LumoAI', url: 'https://lumo.proton.me', icon: 'assets/apps/proton/lumo.svg' },
            { name: 'Proton Docs', url: 'https://docs.proton.me', icon: 'assets/apps/proton/docs.svg' },
            { name: 'Proton Sheets', url: 'https://sheets.proton.me', icon: 'assets/apps/proton/sheets.svg' }
        ], allAppsLink: 'https://account.proton.me/apps' },
        microsoft: { apps: [
            { name: 'Copilot', url: 'https://copilot.microsoft.com', icon: 'assets/apps/microsoft/copilot.svg' },
            { name: 'Outlook', url: 'https://outlook.live.com', icon: 'assets/apps/microsoft/outlook.svg' },
            { name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'assets/apps/microsoft/onedrive.svg' },
            { name: 'Word', url: 'https://www.office.com/launch/word', icon: 'assets/apps/microsoft/word.svg' },
            { name: 'Excel', url: 'https://www.office.com/launch/excel', icon: 'assets/apps/microsoft/excel.svg' },
            { name: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', icon: 'assets/apps/microsoft/ppt.svg' },
            { name: 'OneNote', url: 'https://www.onenote.com', icon: 'assets/apps/microsoft/onenote.svg' },
            { name: 'Teams', url: 'https://teams.live.com', icon: 'assets/apps/microsoft/teams.svg' },
            { name: 'ClipChamp', url: 'https://app.clipchamp.com/', icon: 'assets/apps/microsoft/clip.svg' }
        ], allAppsLink: 'https://www.microsoft365.com/apps' },
        google: { apps: [
            { name: 'Gemini', url: 'https://gemini.google.com', icon: 'assets/apps/google/gemini.svg' },
            { name: 'Gmail', url: 'https://mail.google.com', icon: 'assets/apps/google/mail.svg' },
            { name: 'YouTube', url: 'https://youtube.com', icon: 'assets/apps/google/youtube.svg' },
            { name: 'Drive', url: 'https://drive.google.com', icon: 'assets/apps/google/drive.svg' },
            { name: 'Docs', url: 'https://docs.google.com', icon: 'assets/apps/google/docs.svg' },
            { name: 'Meet', url: 'https://meet.google.com', icon: 'assets/apps/google/meet.svg' },
            { name: 'Music', url: 'https://music.google.com', icon: 'assets/apps/google/music.svg' },
            { name: 'Web Store', url: 'https://chromewebstore.google.com', icon: 'assets/apps/google/store.svg' }
        ], allAppsLink: 'https://about.google/products/' }
    };
    const appLauncherWrapper = document.getElementById('appLauncherWrapper');
    const appLauncherBtn = document.getElementById('appLauncherBtn');
    const launcherPopup = document.getElementById('launcherPopup');
    const launcherGrid = document.getElementById('launcherGrid');
    const launcherAllAppsLink = document.getElementById('launcherAllAppsLink');
    const toggleLauncher = document.getElementById('toggleLauncher');
    const launcherProvider = document.getElementById('launcherProvider');
    const launcherSelectGroup = document.getElementById('launcherSelectGroup');
    let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true'; 
    let currentProvider = localStorage.getItem('launcherProvider') || 'microsoft'; 
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
        if(!data || !launcherGrid) return;
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
        if(launcherAllAppsLink) launcherAllAppsLink.href = data.allAppsLink;
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

    // --- Search Suggestions ---
    const toggleSuggestions = document.getElementById('toggleSuggestions');
    const suggestionsContainer = document.getElementById('suggestionsContainer');
    let suggestionsActive = localStorage.getItem('suggestionsEnabled') === 'true';
    if(toggleSuggestions) {
        toggleSuggestions.checked = suggestionsActive;
        toggleSuggestions.addEventListener('change', (e) => {
            suggestionsActive = e.target.checked;
            localStorage.setItem('suggestionsEnabled', suggestionsActive);
            if(!suggestionsActive) clearSuggestions();
        });
    }
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            if (!suggestionsActive) return;
            const query = e.target.value.trim();
            if (query.length < 3) { clearSuggestions(); return; }
            fetchSuggestions(query);
        }, 300)); 
        searchInput.addEventListener('keydown', (e) => {
            if (!suggestionsActive) return;
            const items = document.querySelectorAll('.suggestion-item');
            if (items.length === 0) return;
            let index = -1;
            items.forEach((item, i) => { if (item.classList.contains('selected')) index = i; });
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                index = (index + 1) % items.length;
                updateSelection(items, index);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                index = (index - 1 + items.length) % items.length; 
                updateSelection(items, index);
            } else if (e.key === 'Enter') {
                if (index > -1) { e.preventDefault(); items[index].click(); }
            } else if (e.key === 'Escape') { clearSuggestions(); }
        });
        document.addEventListener('click', (e) => {
            if (searchBar && !searchBar.contains(e.target)) clearSuggestions();
        });
    }
    function updateSelection(items, index) {
        items.forEach(item => item.classList.remove('selected'));
        if (index > -1 && items[index]) {
            items[index].classList.add('selected');
            searchInput.value = items[index].dataset.value; 
        }
    }
async function fetchSuggestions(query) {
        const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data[1]) {
                const suggestions = data[1].slice(0, 5); 
                renderSuggestions(suggestions);
            }
        } catch (error) { 
            console.error('Error retrieving suggestions:', error); 
        }
    }
    function renderSuggestions(suggestions) {
        if (!suggestionsContainer) return;
        suggestionsContainer.innerHTML = '';
        if (suggestions.length === 0) { suggestionsContainer.classList.remove('active'); return; }
        const iconSvg = `<svg class="suggestion-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
        suggestions.forEach(text => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.dataset.value = text;
            div.innerHTML = `${iconSvg} <span>${text}</span>`;   
            div.addEventListener('click', () => {
                searchInput.value = text;
                if(searchForm) searchForm.submit(); 
            });
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.classList.add('active');
    }
    function clearSuggestions() {
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('active');
        }
    }

    // --- Version & Backup ---
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) {
        try { versionDisplay.textContent = `v${chrome.runtime.getManifest().version}`; } 
        catch (e) { versionDisplay.textContent = 'v1.0'; }
    }
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importInput = document.getElementById('importInput');
    const APP_KEYS = ['shortcuts','theme','weatherEnabled','weatherCity','shortcutsVisible','shortcutsRows','launcherEnabled','launcherProvider'];
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const backupData = {};
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
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('Restore backup? This will replace current settings.')) {
                        APP_KEYS.forEach(key => { if (data[key] !== undefined) localStorage.setItem(key, data[key]); });
                        location.reload();
                    }   
                } catch (error) { alert('Invalid backup file.'); }
                importInput.value = '';
            };
            reader.readAsText(file);
        });
    }
    renderShortcuts();
});