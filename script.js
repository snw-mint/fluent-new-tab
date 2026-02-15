/* =========================
   INDEX
   1. Constants & Config
   2. State
   3. Utility Functions
   4. DOM References
   5. Event Handlers
   6. Core Features
   7. UI Updates
   8. Modals & Settings
   9. Initialization
========================= */

/* --- 1. Constants & Config --- */
const ICON_ADD = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13V3.754a.75.75 0 0 0-1.5 0V13H3.754a.75.75 0 0 0 0 1.5H13v9.252a.75.75 0 0 0 1.5 0V14.5l9.25.003a.75.75 0 0 0 0-1.5z" fill="currentColor"/></svg>`;
const ICON_REMOVE = `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="m3.525 3.718.091-.102a1.25 1.25 0 0 1 1.666-.091l.102.091L14 12.233l8.616-8.617a1.25 1.25 0 0 1 1.768 1.768L15.767 14l8.617 8.616a1.25 1.25 0 0 1 .091 1.666l-.091.102a1.25 1.25 0 0 1-1.666.091l-.102-.091L14 15.767l-8.616 8.617a1.25 1.25 0 0 1-1.768-1.768L12.233 14 3.616 5.384a1.25 1.25 0 0 1-.091-1.666l.091-.102z" fill="currentColor"/></svg>`;
const ICON_EDIT = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.03 2.97a3.58 3.58 0 0 1 0 5.06L9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L15.97 2.97a3.58 3.58 0 0 1 5.06 0M15 6.06 5.062 16a.75.75 0 0 0-.193.333l-1.05 3.85 3.85-1.05A.75.75 0 0 0 8 18.937L17.94 9zm2.03-2.03-.97.97L19 7.94l.97-.97a2.078 2.078 0 1 0-2.94-2.94" fill="currentColor"/></svg>`;
const ICON_GLOBE_FALLBACK = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.999c5.524 0 10.002 4.478 10.002 10.002 0 5.523-4.478 10.001-10.002 10.001S1.998 17.524 1.998 12.001C1.998 6.477 6.476 1.999 12 1.999M14.939 16.5H9.06c.652 2.414 1.786 4.002 2.939 4.002s2.287-1.588 2.939-4.002Zm-7.43 0H4.785a8.53 8.53 0 0 0 4.094 3.411c-.522-.82-.953-1.846-1.27-3.015l-.102-.395Zm11.705 0h-2.722c-.324 1.335-.792 2.5-1.373 3.411a8.53 8.53 0 0 0 3.91-3.127l.185-.283ZM7.094 10H3.735l-.005.017a8.5 8.5 0 0 0-.233 1.984c0 1.056.193 2.067.545 3h3.173a21 21 0 0 1-.123-5Zm8.303 0H8.603a19 19 0 0 0 .135 5h6.524a19 19 0 0 0 .135-5m4.868 0h-3.358c.062.647.095 1.317.095 2a20 20 0 0 1-.218 3h3.173a8.5 8.5 0 0 0 .544-3c0-.689-.082-1.36-.236-2M8.88 4.09l-.023.008A8.53 8.53 0 0 0 4.25 8.5h3.048c.314-1.752.86-3.278 1.583-4.41ZM12 3.499l-.116.005C10.62 3.62 9.396 5.622 8.83 8.5h6.342c-.566-2.87-1.783-4.869-3.045-4.995zm3.12.59.107.175c.669 1.112 1.177 2.572 1.475 4.237h3.048a8.53 8.53 0 0 0-4.339-4.29l-.291-.121Z" fill="currentColor"/></svg>`;
const ICON_MENU_DOTS = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.75 12a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0m6 0a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0M18 13.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5" fill="currentColor"/></svg>`;

const engines = {
    bing: { url: 'https://www.bing.com/search', icon: 'assets/search-engines/bing.svg' },
    google: { url: 'https://www.google.com/search', icon: 'assets/search-engines/google.svg' },
    brave: { url: 'https://search.brave.com/search', icon: 'assets/search-engines/brave.svg' },
    duck: { url: 'https://duckduckgo.com/', icon: 'assets/search-engines/ddg.svg' },
    ecosia: { url: 'https://www.ecosia.org/search', icon: 'assets/search-engines/ecosia.svg' },
    startpage: { url: 'https://www.startpage.com/sp/search', icon: 'assets/search-engines/startpg.svg' }
};

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
        { name: 'Calendar', url: 'https://calendar.google.com', icon: 'assets/apps/google/calendar.svg' },
        { name: 'Meet', url: 'https://meet.google.com', icon: 'assets/apps/google/meet.svg' },
        { name: 'Music', url: 'https://music.youtube.com', icon: 'assets/apps/google/music.svg' },
        { name: 'Web Store', url: 'https://chromewebstore.google.com', icon: 'assets/apps/google/store.svg' }
    ], allAppsLink: 'https://about.google/products/' }
};

const APP_KEYS = ['shortcuts','theme','weatherEnabled','weatherCity','shortcutsVisible','shortcutsRows','launcherEnabled','launcherProvider','showGreeting','greetingName','greetingStyle', 'userLanguage', 'wallpaperEnabled', 'wallpaperType', 'wallpaperValue'];

/* --- 2. State --- */
let shortcuts = [];
let editingIndex = -1;
try { shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || []; }
catch (e) { shortcuts = []; }

let allowedRows = parseInt(localStorage.getItem('shortcutsRows')) || 2; 
let shortcutsVisible = localStorage.getItem('shortcutsVisible') !== 'false';

const savedTheme = localStorage.getItem("theme") || "auto";
const savedEngine = localStorage.getItem('searchEngine') || 'bing';
let searchBarVisible = localStorage.getItem('searchBarVisible') !== 'false';
let suggestionsActive = localStorage.getItem('suggestionsEnabled') === 'true';
const suggestionsCache = new Map();

const CACHE_KEY = 'fluent_weather_cache';
const CITY_KEY = 'fluent_city_data';
const CACHE_DURATION = 3600000;

let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true';
let weatherUnit = localStorage.getItem('weatherUnit') || 'c';
let currentCityData = { name: 'New York', lat: 40.71, lon: -74.01 };
try {
    const saved = localStorage.getItem(CITY_KEY);
    if (saved) currentCityData = JSON.parse(saved);
} catch (e) { console.error("Erro ao ler cidade salva"); }

let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true';
let currentProvider = localStorage.getItem('launcherProvider') || 'microsoft';

let wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';
let currentWallpaperType = localStorage.getItem('wallpaperType') || 'preset'; // 'preset' or 'upload'
let currentWallpaperValue = localStorage.getItem('wallpaperValue') || 'preset_1';

/* --- 3. Utility Functions --- */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
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
            if (modalTitle) modalTitle.textContent = window.getTranslation('editShortcutTitle');
            if (item.customIcon && customIconGroup) customIconGroup.classList.remove('hidden');
        } else {
            document.getElementById('inputName').value = '';
            document.getElementById('inputUrl').value = '';
            document.getElementById('inputIcon').value = '';
            if (modalTitle) modalTitle.textContent = window.getTranslation('addShortcutTitle');
            if (customIconGroup) customIconGroup.classList.add('hidden');
        }
        setTimeout(() => document.getElementById('inputName').focus(), 100);
    }
}
function saveAndRender() {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
}
function deleteShortcut(index) {
    shortcuts.splice(index, 1);
    saveAndRender();
}
function updateShortcutsVisibility(visible) {
    if (shortcutsGrid) shortcutsGrid.style.display = visible ? 'grid' : 'none';
    if (rowsInputGroup) rowsInputGroup.style.display = visible ? 'block' : 'none';
}
function getFluentIconFilename(code, isDay) {
    switch (code) {
        case 0: return isDay ? "sunny.svg" : "clear_night.svg";
        case 1: return isDay ? "sunny.svg" : "clear_night.svg";
        case 2: return isDay ? "partly_cloudy_day.svg" : "partly_cloudy_night.svg";
        case 3: return "cloudy.svg";
        case 45: case 48: return "fog.svg";
        case 51: case 53: case 55: return "drizzle.svg";
        case 56: case 57: case 66: case 67: return "rain_snow.svg";
        case 61: case 63: case 65: return "rain.svg";
        case 71: case 73: case 75: case 77: return "snow.svg";
        case 80: case 81: case 82: return isDay ? "rain_showers_day.svg" : "rain_showers_night.svg";
        case 85: case 86: return isDay ? "snow_showers_day.svg" : "snow_showers_night.svg";
        case 95: return "thunderstorm.svg";
        case 96: case 99: return isDay ? "hail_day.svg" : "hail_night.svg";
        default: return "cloudy.svg";
    }
}
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
                    <button class="menu-btn" title="${window.getTranslation('moreOptionsLabel')}">${ICON_MENU_DOTS}</button>
                    <div class="shortcut-dropdown">
                        <div class="menu-option edit-option" data-index="${index}">
                            ${ICON_EDIT} <span>${window.getTranslation('editLabel')}</span>
                        </div>
                        <div class="menu-option remove-option" data-index="${index}">
                            ${ICON_REMOVE} <span>${window.getTranslation('removeLabel')}</span>
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
            <span class="shortcut-title">${window.getTranslation('addShortcutLabel')}</span>
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
function updateSearchSettings() {
    if (searchWrapper) searchWrapper.style.display = searchBarVisible ? '' : 'none';
    if (toggleSearchBar) toggleSearchBar.checked = searchBarVisible;
    const displayStyle = searchBarVisible ? 'flex' : 'none';
    if (suggestionsRow) suggestionsRow.style.display = displayStyle;
}
function renderSuggestions(suggestions) {
    if (!suggestionsContainer) return;
    suggestionsContainer.innerHTML = '';
    if (suggestions.length === 0) {
        suggestionsContainer.classList.remove('active');
        return;
    }
    const iconSvg = `<svg class="suggestion-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
    suggestions.forEach(text => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.dataset.value = text;
        div.innerHTML = `${iconSvg} <span>${text}</span>`;
        div.addEventListener('click', () => {
            searchInput.value = text;
            if(searchForm) { searchForm.submit(); }
            else { window.location.href = `https://www.google.com/search?q=${encodeURIComponent(text)}`; }
            clearSuggestions();
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
function updateSelection(items, index) {
    items.forEach(item => item.classList.remove('selected'));
    if (index > -1 && items[index]) {
        items[index].classList.add('selected');
        searchInput.value = items[index].dataset.value;
    }
}
function updateUnitButtons() {
    if(!unitBtns) return;
    unitBtns.forEach(btn => {
        if(btn.dataset.unit === weatherUnit) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}
function updateWeatherVisibility() {
    if(!weatherWidget || !cityInputGroup) return;
    const displayStyle = weatherEnabled ? 'flex' : 'none';
    weatherWidget.style.display = displayStyle;
    cityInputGroup.style.display = displayStyle;
    if(weatherUnitGroup) weatherUnitGroup.style.display = displayStyle;
}
function renderWeather(data) {
    if (!data || !data.current_weather) return;
    const { temperature, weathercode, is_day } = data.current_weather;
    const isCelsius = weatherUnit === 'c';
    const tempValue = isCelsius ? temperature : (temperature * 9/5) + 32;
    const unitSymbol = isCelsius ? '°C' : '°F';
    const filename = getFluentIconFilename(weathercode, is_day);
    const iconPath = `assets/weather/${filename}`;
    weatherCity.textContent = currentCityData.name;
    weatherTemp.textContent = `${Math.round(tempValue)}${unitSymbol}`;
    weatherIcon.innerHTML = `<img src="${iconPath}" alt="Weather Icon" class="fluent-icon">`;
    weatherWidget.href = `https://www.bing.com/weather/forecast?q=${currentCityData.name}`;
}
function updateLauncherVisibility() {
    if(appLauncherWrapper) {
        appLauncherWrapper.style.display = launcherEnabled ? 'block' : 'none';
    }
    if(launcherSelectGroup) {
        launcherSelectGroup.style.display = launcherEnabled ? 'block' : 'none';
    }
}
function updateWallpaperGridVisibility(enabled) {
    if (wallpaperGrid) {
        wallpaperGrid.style.display = enabled ? 'grid' : 'none';
    }
}
function highlightSelectedWallpaper(value) {
    document.querySelectorAll('.wallpaper-option').forEach(opt => opt.classList.remove('selected'));
    
    if (value === 'custom' || value === 'upload') {
        const uploadBtn = document.querySelector('.upload-option');
        if (uploadBtn) uploadBtn.classList.add('selected');
    } else {
        const target = document.querySelector(`.wallpaper-option[data-value="${value}"]`);
        if (target) target.classList.add('selected');
    }
}
async function applyWallpaper(enabled, type, value) {
    const body = document.body;
    if (!enabled) {
        body.style.backgroundImage = 'none';
        body.removeAttribute('data-wallpaper-active');
        return;
    }
    body.setAttribute('data-wallpaper-active', 'true');
    if (type === 'preset') {
        const presetMap = {
            'preset_1': 'assets/wallpapers/bg1.webp',
            'preset_2': 'assets/wallpapers/bg2.webp',
            'preset_3': 'assets/wallpapers/bg3.webp'
        };
        const imageUrl = presetMap[value] || presetMap['preset_1'];
        body.style.backgroundImage = `url('${imageUrl}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed';
    } else if (type === 'upload') {
        try {
            const blob = await getWallpaperFromDB();
            if (blob) {
                const url = URL.createObjectURL(blob);
                body.style.backgroundImage = `url('${url}')`;
                body.style.backgroundSize = 'cover';
                body.style.backgroundPosition = 'center';
                body.style.backgroundAttachment = 'fixed';
            }
        } catch (e) {
            console.error("Erro ao carregar wallpaper:", e);
        }
    }
}

/* --- 4. DOM References --- */
const themeBtns = document.querySelectorAll(".theme-btn");
const shortcutsGrid = document.getElementById('shortcutsGrid');
const addModal = document.getElementById('addModal');
const shortcutForm = document.getElementById('shortcutForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const toggleCustomIcon = document.getElementById('toggleCustomIcon');
const customIconGroup = document.getElementById('customIconGroup');
const toggleShortcuts = document.getElementById('toggleShortcuts');
const rowsSelect = document.getElementById('rowsSelect');
const rowsInputGroup = document.getElementById('rowsInputGroup');
const configBtn = document.getElementById('settingsBtn');
const configPopup = document.getElementById('settingsPopup');
const settingsDot = document.getElementById('settingsDot');
const greetingWrapper = document.querySelector('.logo-wrapper');
const greetingOptionsDiv = document.getElementById('greetingOptions');
const toggleGreeting = document.getElementById('toggleGreeting');
const greetingNameInput = document.getElementById('greetingNameInput');
const greetingStyleSelect = document.getElementById('greetingStyleSelect');
const engineBtn = document.getElementById('engineBtn');
const dropdown = document.getElementById('engineDropdown');
const currentIcon = document.getElementById('currentEngineIcon');
const searchForm = document.getElementById('searchForm');
const items = document.querySelectorAll('.dropdown-item');
const searchWrapper = document.querySelector('.search-wrapper') || document.querySelector('.search-bar') || document.getElementById('searchForm');
const toggleSearchBar = document.getElementById('toggleSearchBar');
const suggestionsRow = document.getElementById('suggestionsRow');
const toggleSuggestions = document.getElementById('toggleSuggestions');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const searchInput = document.getElementById('searchInput');
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
const appLauncherWrapper = document.getElementById('appLauncherWrapper');
const appLauncherBtn = document.getElementById('appLauncherBtn');
const launcherPopup = document.getElementById('launcherPopup');
const launcherGrid = document.getElementById('launcherGrid');
const launcherAllAppsLink = document.getElementById('launcherAllAppsLink');
const toggleLauncher = document.getElementById('toggleLauncher');
const launcherProvider = document.getElementById('launcherProvider');
const launcherSelectGroup = document.getElementById('launcherSelectGroup');
const versionDisplay = document.getElementById('versionDisplay');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');
const languageSelect = document.getElementById('languageProvider');
const toggleWallpaper = document.getElementById('toggleWallpaper');
const wallpaperGrid = document.getElementById('wallpaperGrid');
const wallpaperOptions = document.querySelectorAll('.wallpaper-option:not(.upload-option)');
const uploadOption = document.querySelector('.upload-option');
const uploadInput = document.getElementById('wallpaperUploadInput');

/* --- 5. Event Handlers --- */
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
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (localStorage.getItem("theme") === "auto") {
        document.documentElement.removeAttribute("data-theme");
        if (e.matches) {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }
});
function initBrand() {
    if (!greetingWrapper) return;
    
    // Recupera configurações
    const showGreeting = localStorage.getItem('showGreeting') !== 'false';
    const userName = localStorage.getItem('greetingName') || '';
    const greetingStyle = localStorage.getItem('greetingStyle') || '3d';
    
    // Controle de exibição
    if (!showGreeting) {
        greetingWrapper.style.display = 'none';
        if(greetingOptionsDiv) greetingOptionsDiv.style.display = 'none';
        return;
    } else {
        greetingWrapper.style.display = 'flex';
        if(greetingOptionsDiv) greetingOptionsDiv.style.display = 'block';
    }
    
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    let iconName = 'sun';
    let greetingPool = [];
    
    // Helper para garantir que o código não quebre se a função de tradução não existir ainda
    const t = window.getTranslation || ((k) => k); 

    // Lógica de horários com tradução
    if (hour >= 5 && hour < 12) {
        timeOfDay = 'morning';
        iconName = 'sun';
        greetingPool = [
            t("greetMorning1"), 
            t("greetMorning2"), 
            t("greetMorning3"), 
            t("greetMorning4"), 
            t("greetMorning5")
        ];
    } else if (hour >= 12 && hour < 18) {
        timeOfDay = 'afternoon';
        iconName = 'cloud-sun';
        greetingPool = [
            t("greetAfternoon1"), 
            t("greetAfternoon2"), 
            t("greetAfternoon3"), 
            t("greetAfternoon4"), 
            t("greetAfternoon5")
        ];
    } else if (hour >= 18 && hour < 24) {
        timeOfDay = 'evening';
        iconName = 'moon';
        greetingPool = [
            t("greetEvening1"), 
            t("greetEvening2"), 
            t("greetEvening3"), 
            t("greetEvening4"), 
            t("greetEvening5")
        ];
    } else {
        timeOfDay = 'night';
        iconName = 'stars';
        greetingPool = [
            t("greetNight1"), 
            t("greetNight2"), 
            t("greetNight3"), 
            t("greetNight4"), 
            t("greetNight5")
        ];
    }
    const seed = new Date().getMinutes();
    const randomGreeting = greetingPool.length > 0 ? greetingPool[seed % greetingPool.length] : "Hello";
    
    const finalGreetingText = userName.trim() ? `${randomGreeting}, ${userName}!` : `${randomGreeting}!`;
    
    let iconHTML = '';
    if (greetingStyle === '3d') {
        iconHTML = `<img src="assets/emojis/${iconName}.png" alt="${timeOfDay}" class="greeting-icon" onerror="this.style.display='none'">`;
    } else {
        iconHTML = `<img src="assets/greetings/${iconName}.svg" alt="${timeOfDay}" class="greeting-icon outline" onerror="this.style.display='none'">`;
    }
    
    greetingWrapper.innerHTML = `
        ${iconHTML}
        <h1 class="greeting-text">${finalGreetingText}</h1>
    `;
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrapper')) {
        document.querySelectorAll('.shortcut-dropdown.active').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});
document.addEventListener('click', (e) => {
    if (engineBtn && dropdown && !engineBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});
document.addEventListener('click', (e) => {
    if (searchInput && !searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        clearSuggestions();
    }
});
document.addEventListener('click', (e) => {
    if(launcherPopup && launcherPopup.classList.contains('active')) {
        if(!launcherPopup.contains(e.target) && !appLauncherBtn.contains(e.target)) {
            launcherPopup.classList.remove('active');
            appLauncherBtn.classList.remove('active');
        }
    }
});

/* --- 6. Core Features --- */
const DB_NAME = 'FluentNewTabDB';
const DB_VERSION = 1;
const STORE_NAME = 'wallpapers';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('Erro ao abrir banco de dados: ' + event.target.error);
    });
}

async function saveWallpaperToDB(blob) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(blob, 'custom_wallpaper');

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject('Erro ao salvar no DB');
    });
}

async function getWallpaperFromDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('custom_wallpaper');

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = () => reject('Erro ao ler do DB');
    });
}

function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1920;
                
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject('Erro na compressão');
                }, 'image/webp', 0.8);
            };
            
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

function fetchSuggestions(query) {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (searchInput.value.trim().toLowerCase() !== query.toLowerCase()) return;
            if (data && data[1]) {
                const suggestions = data[1].slice(0, 5);
                suggestionsCache.set(query.toLowerCase(), suggestions);
                renderSuggestions(suggestions);
            }
        })
        .catch(error => { console.error('Error retrieving suggestions:', error); });
}
async function searchCity() {
    const query = cityInput.value.trim();
    if(!query) return;
    saveCityBtn.innerHTML = '...';
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&format=json`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            currentCityData = { name: result.name, lat: result.latitude, lon: result.longitude, country: result.country };
            localStorage.setItem(CITY_KEY, JSON.stringify(currentCityData));
            cityInput.value = result.name;
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
        const cached = JSON.parse(cachedString);
        const now = Date.now();
        if ((now - cached.timestamp < CACHE_DURATION) && (cached.city === currentCityData.name)) {
            renderWeather(cached.data);
            return;
        }
    }
    fetchWeatherFromAPI();
}
async function fetchWeatherFromAPI(forceUpdate = false) {
    if(!weatherEnabled) return;
    try {
        const { lat, lon } = currentCityData;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(url);
        const data = await res.json();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), city: currentCityData.name, data: data }));
        renderWeather(data);
    } catch (error) { weatherTemp.textContent = '--'; }
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
        updateShortcutsVisibility(shortcutsVisible);
    }
}
function applyInitialSearchBarVisibility() {
    updateSearchSettings();
    if (toggleSearchBar) {
        toggleSearchBar.checked = searchBarVisible;
    }
}
function applyInitialSuggestionsActive() {
    if(toggleSuggestions) {
        toggleSuggestions.checked = suggestionsActive;
    }
}
function applyInitialWeatherState() {
    if (cityInput) cityInput.value = currentCityData.name;
    updateWeatherVisibility();
    updateUnitButtons();
    if (weatherEnabled) initWeather();
}
function applyInitialLauncherState() {
    if(toggleLauncher) toggleLauncher.checked = launcherEnabled;
    if(launcherProvider) launcherProvider.value = currentProvider;
    updateLauncherVisibility();
    if(launcherEnabled) renderLauncher(currentProvider);
}
function applyInitialWallpaperState() {
    if (toggleWallpaper) {
        toggleWallpaper.checked = wallpaperEnabled;
        updateWallpaperGridVisibility(wallpaperEnabled);
    }

    if (!wallpaperEnabled) {
        applyWallpaper(false);
        return;
    }

    if (currentWallpaperType === 'preset') {
        highlightSelectedWallpaper(currentWallpaperValue);
        applyWallpaper(true, 'preset', currentWallpaperValue);
    } else if (currentWallpaperType === 'upload') {
        getWallpaperFromDB().then(blob => {
            if (blob) {
                const objectURL = URL.createObjectURL(blob);
                document.body.style.backgroundImage = `url('${objectURL}')`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
                document.body.setAttribute('data-wallpaper-active', 'true');
                highlightSelectedWallpaper('upload');
            } else {
                applyWallpaper(true, 'preset', 'preset_1');
                highlightSelectedWallpaper('preset_1');
            }
        }).catch(err => {
            console.error("Erro ao carregar wallpaper custom:", err);
            applyWallpaper(true, 'preset', 'preset_1');
        });
    }
}
function applyBrandInterval() {
    initBrand();
    setInterval(initBrand, 60000);
}

/* --- 8. Modals & Settings --- */
document.addEventListener("DOMContentLoaded", () => {
    /* Theme Logic */
    applyInitialTheme();
    if (themeBtns) {
        themeBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const theme = btn.dataset.theme;
                applyTheme(theme);
                localStorage.setItem("theme", theme);
            });
        });
    }
    /* Greeting System */
    applyBrandInterval();
    if (toggleGreeting) {
        toggleGreeting.checked = localStorage.getItem('showGreeting') !== 'false';
        toggleGreeting.addEventListener('change', (e) => {
            localStorage.setItem('showGreeting', e.target.checked);
            initBrand();
        });
    }
    if (greetingNameInput) {
        greetingNameInput.value = localStorage.getItem('greetingName') || '';
        greetingNameInput.addEventListener('input', (e) => {
            localStorage.setItem('greetingName', e.target.value);
            initBrand();
        });
    }
    if (greetingStyleSelect) {
        greetingStyleSelect.value = localStorage.getItem('greetingStyle') || '3d';
        greetingStyleSelect.addEventListener('change', (e) => {
            localStorage.setItem('greetingStyle', e.target.value);
            initBrand();
        });
    }
    /* Settings Popup */
    if (configBtn && configPopup) {
        const dotSeen = localStorage.getItem('settings_dot_seen');
        if (!dotSeen && settingsDot) {
            settingsDot.classList.add('active');
        }
        configBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            configPopup.classList.toggle('active');
            if (settingsDot && settingsDot.classList.contains('active')) {
                settingsDot.classList.remove('active');
                localStorage.setItem('settings_dot_seen', 'true');
            }
        });
        document.addEventListener('click', (e) => {
            if (configPopup.classList.contains('active')) {
                if (!configPopup.contains(e.target) && !configBtn.contains(e.target)) {
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
    /* Shortcuts & Modals */
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
    /* Shortcuts Rows */
    if (rowsSelect) {
        rowsSelect.value = allowedRows;
        rowsSelect.addEventListener('change', (e) => {
            allowedRows = parseInt(e.target.value);
            localStorage.setItem('shortcutsRows', allowedRows);
            renderShortcuts();
        });
    }
    renderShortcuts();

    /* Shortcuts Visibility */
    applyInitialShortcutsVisibility();
    if(toggleShortcuts) {
        toggleShortcuts.addEventListener('change', (e) => {
            const isVisible = e.target.checked;
            updateShortcutsVisibility(isVisible);
            localStorage.setItem('shortcutsVisible', isVisible);
        });
    }
    /* Search Engine Selector */
    applyInitialSearchEngine();
    if (engineBtn) {
        engineBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }
    items.forEach(item => {
        item.addEventListener('click', () => {
            const selectedEngine = item.getAttribute('data-engine');
            setSearchEngine(selectedEngine);
            localStorage.setItem('searchEngine', selectedEngine);
            dropdown.classList.remove('active');
        });
    });
    /* Search Bar Visibility */
    applyInitialSearchBarVisibility();
    if (toggleSearchBar) {
        toggleSearchBar.addEventListener('change', (e) => {
            searchBarVisible = e.target.checked;
            localStorage.setItem('searchBarVisible', searchBarVisible);
            updateSearchSettings();
        });
    }
    /* Suggestions Visibility */
    applyInitialSuggestionsActive();
    if(toggleSuggestions) {
        toggleSuggestions.addEventListener('change', (e) => {
            suggestionsActive = e.target.checked;
            localStorage.setItem('suggestionsEnabled', suggestionsActive);
            if(!suggestionsActive) clearSuggestions();
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            if (!suggestionsActive) return;
            const query = e.target.value.trim();
            if (query.length < 2) { clearSuggestions(); return; }
            if (suggestionsCache.has(query.toLowerCase())) {
                renderSuggestions(suggestionsCache.get(query.toLowerCase()));
                return;
            }
            fetchSuggestions(query);
        }, 100));
        searchInput.addEventListener('keydown', (e) => {
            if (!suggestionsActive) return;
            const items = document.querySelectorAll('.suggestion-item');
            if (items.length === 0) return;
            let index = Array.from(items).findIndex(item => item.classList.contains('selected'));
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                index = (index + 1) % items.length;
                updateSelection(items, index);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                index = (index - 1 + items.length) % items.length;
                updateSelection(items, index);
            } else if (e.key === 'Enter') {
                if (index > -1) {
                    e.preventDefault();
                    items[index].click();
                }
            } else if (e.key === 'Escape') {
                clearSuggestions();
            }
        });
    }
    /* Weather Widget */
    applyInitialWeatherState();
    if (toggleWeather) {
        toggleWeather.checked = weatherEnabled;
        toggleWeather.addEventListener('change', (e) => {
            weatherEnabled = e.target.checked;
            localStorage.setItem('weatherEnabled', weatherEnabled);
            updateWeatherVisibility();
            if(weatherEnabled) initWeather();
        });
    }
    unitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            weatherUnit = btn.dataset.unit;
            localStorage.setItem('weatherUnit', weatherUnit);
            updateUnitButtons();
            initWeather();
        });
    });
    if(saveCityBtn) saveCityBtn.addEventListener('click', searchCity);
    if(cityInput) cityInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') searchCity(); });

    /* App Launcher */
    applyInitialLauncherState();
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
    if(appLauncherBtn) {
        appLauncherBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            launcherPopup.classList.toggle('active');
            appLauncherBtn.classList.toggle('active');
        });
    }
    
    /* Wallpaper System */
    applyInitialWallpaperState();
    if (toggleWallpaper) {
        toggleWallpaper.addEventListener('change', (e) => {
            wallpaperEnabled = e.target.checked;
            localStorage.setItem('wallpaperEnabled', wallpaperEnabled);
            updateWallpaperGridVisibility(wallpaperEnabled);
            applyWallpaper(wallpaperEnabled, currentWallpaperType, currentWallpaperValue);
        });
    }
    if (wallpaperOptions) {
        wallpaperOptions.forEach(option => {
            option.addEventListener('click', () => {
                if (!wallpaperEnabled) return;
                const value = option.dataset.value;
                currentWallpaperType = 'preset';
                currentWallpaperValue = value;
                localStorage.setItem('wallpaperType', 'preset');
                localStorage.setItem('wallpaperValue', value);
                highlightSelectedWallpaper(value);
                applyWallpaper(true, 'preset', value);
            });
        });
    }
    if (uploadOption && uploadInput) {
        uploadOption.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            uploadOption.style.opacity = '0.5'; 
            
            try {
                console.log("Processando imagem...");
                const processedBlob = await processImage(file);
                
                console.log("Salvando no DB...");
                await saveWallpaperToDB(processedBlob);
                localStorage.setItem('wallpaperType', 'upload');
                localStorage.setItem('wallpaperValue', 'custom');

                if (!wallpaperEnabled) {
                    wallpaperEnabled = true;
                    localStorage.setItem('wallpaperEnabled', 'true');
                    if(toggleWallpaper) toggleWallpaper.checked = true;
                    updateWallpaperGridVisibility(true);
                }

                const objectURL = URL.createObjectURL(processedBlob);
                document.body.style.backgroundImage = `url('${objectURL}')`;
                document.body.setAttribute('data-wallpaper-active', 'true');

                highlightSelectedWallpaper('upload');
                
                console.log("Sucesso!");
            } catch (error) {
                console.error("Erro no upload:", error);
                alert("Erro ao processar imagem. Tente uma imagem menor.");
            } finally {
                uploadOption.style.opacity = '1';
                uploadInput.value = ''; 
            }
        });
    }

    /* --- Language Settings --- */
    if (languageSelect) {
        const savedLang = localStorage.getItem('userLanguage');
        if (savedLang) {
            languageSelect.value = savedLang;
        } else {
            try {
                const browserLang = navigator.language.replace('-', '_');
                const optionExists = [...languageSelect.options].some(o => o.value === browserLang);
                if (optionExists) {
                    languageSelect.value = browserLang;
                    localStorage.setItem('userLanguage', browserLang); 
                } else {
                    languageSelect.value = 'en';
                }
            } catch (e) {
                console.log("Idioma auto-detect falhou, usando padrão.");
            }
        }
        languageSelect.addEventListener('change', (e) => {
            localStorage.setItem('userLanguage', e.target.value);
            location.reload(); 
        });
    }
    /* Export & Import */
    if (versionDisplay) {
        try { versionDisplay.textContent = `v${chrome.runtime.getManifest().version}`; }
        catch (e) { versionDisplay.textContent = 'v1.0'; }
    }
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
});

/* --- 9. Initialization --- */
applyInitialTheme();
applyInitialShortcutsVisibility();
applyInitialSearchEngine();
applyInitialSearchBarVisibility();
applyInitialSuggestionsActive();
applyInitialWeatherState();
applyInitialLauncherState();
applyInitialWallpaperState();
initSortable();
document.addEventListener('i18nReady', () => {
    console.log("Traduções carregadas. Iniciando interface...");
    applyBrandInterval();
    renderShortcuts();
});