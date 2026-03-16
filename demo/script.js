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
        ], allAppsLink: 'https://about.google/products/#:~:text=google%20products' }
};
const APP_KEYS = [
    'shortcuts', 'theme', 'weatherEnabled', 'fluent_city_data', 'shortcutsVisible', 'shortcutsRows', 'foldersEnabled',
    'launcherEnabled', 'launcherProvider', 'showGreeting', 'greetingName', 'greetingStyle',
    'userLanguage', 'searchEngine', 'searchBarVisible', 'suggestionsEnabled', 'clearSearchEnabled',
    'compactBarEnabled', 'voiceSearchEnabled', 'weatherUnit', 'wallpaperEnabled',
    'wallpaperSource', 'wallpaperType', 'wallpaperValue', 'animationsDisabled', 'blurDisabled', 'reducedEffectsEnabled'
];
function getById(id) {
    return document.getElementById(id);
}
function getInputTarget(event) {
    return event.target instanceof HTMLInputElement ? event.target : null;
}
function getSelectTarget(event) {
    return event.target instanceof HTMLSelectElement ? event.target : null;
}
function getInputById(id) {
    return getById(id);
}
const DEMO_DEFAULT_SHORTCUTS = [{"name":"Wikipedia","url":"https://wikipedia.com","customIcon":null},{"name":"YouTube","url":"https://youtube.com","customIcon":null},{"name":"Github","url":"https://github.com","customIcon":null},{"name":"Notion","url":"https://notion.com","customIcon":null},{"name":"Vercel","url":"https://vercel.com","customIcon":null},{"name":"Figma","url":"https://figma.com","customIcon":null},{"name":"Reddit","url":"https://reddit.com","customIcon":null},{"name":"Spotify","url":"https://spotify.com","customIcon":null},{"name":"BlueSky","url":"https://bsky.app","customIcon":null},{"id":"folder_1773326324189","type":"folder","name":"Work","children":[]}];
let shortcuts = [];
let editingIndex = null;
shortcuts = DEMO_DEFAULT_SHORTCUTS.map(s => Object.assign({}, s, s.children ? { children: [...s.children] } : {}));
let allowedRows = parseInt(localStorage.getItem('shortcutsRows') || '2');
let shortcutsVisible = localStorage.getItem('shortcutsVisible') !== 'false';
let currentFolderId = null;
let foldersEnabled = localStorage.getItem('foldersEnabled') !== null ? localStorage.getItem('foldersEnabled') === 'true' : true;
const savedTheme = (localStorage.getItem('theme') || 'auto');
const savedEngine = (localStorage.getItem('searchEngine') || 'bing');
let searchBarVisible = localStorage.getItem('searchBarVisible') !== 'false';
let suggestionsActive = localStorage.getItem('suggestionsEnabled') === 'true';
const suggestionsCache = new Map();
let clearSearchEnabled = localStorage.getItem('clearSearchEnabled') === 'true';
let compactBarEnabled = localStorage.getItem('compactBarEnabled') === 'true';
let voiceSearchEnabled = localStorage.getItem('voiceSearchEnabled') === 'true';
const savedAnimationsDisabled = localStorage.getItem('animationsDisabled');
let animationsDisabled = savedAnimationsDisabled !== null
    ? savedAnimationsDisabled === 'true'
    : localStorage.getItem('performanceModeEnabled') === 'true';
const savedBlurDisabled = localStorage.getItem('blurDisabled');
let blurDisabled = savedBlurDisabled === 'true';
let reducedEffectsEnabled = localStorage.getItem('reducedEffectsEnabled') !== 'false';
const savedReducedEffectsEnabled = localStorage.getItem('reduceEffectsEnabled');
let reduceEffectsEnabled = savedReducedEffectsEnabled !== 'false';
const CACHE_KEY = 'fluent_weather_cache';
const CITY_KEY = 'fluent_city_data';
const CACHE_DURATION = 3600000;
let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true';
let weatherUnit = (localStorage.getItem('weatherUnit') || 'c');
let currentCityData = { name: 'New York', lat: 40.71, lon: -74.01 };
try {
    const saved = localStorage.getItem(CITY_KEY);
    if (saved)
        currentCityData = JSON.parse(saved);
}
catch (e) {
    console.error('Error reading saved city');
}
let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true';
let currentProvider = (localStorage.getItem('launcherProvider') || 'microsoft');
let wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';
let currentWallpaperSource = (localStorage.getItem('wallpaperSource') || 'local');
let currentWallpaperType = (localStorage.getItem('wallpaperType') || 'preset');
let currentWallpaperValue = localStorage.getItem('wallpaperValue') || 'preset_1';
let wallpaperOverlay = localStorage.getItem('wallpaperOverlay') || '0.2';
const themeBtns = document.querySelectorAll('.theme-btn');
const shortcutsGrid = getById('shortcutsGrid');
const addModal = getById('addModal');
const shortcutForm = getById('shortcutForm');
const closeModalBtn = getById('closeModalBtn');
const toggleCustomIcon = getById('toggleCustomIcon');
const customIconGroup = getById('customIconGroup');
const toggleShortcuts = getById('toggleShortcuts');
const rowsSelect = getById('rowsSelect');
const rowsInputGroup = getById('rowsInputGroup');
const configBtn = getById('settingsBtn');
const configPopup = getById('settingsPopup');
const greetingWrapper = document.querySelector('.logo-wrapper');
const greetingOptionsDiv = getById('greetingOptions');
const toggleGreeting = getById('toggleGreeting');
const greetingNameInput = getById('greetingNameInput');
const greetingStyleSelect = getById('greetingStyleSelect');
const engineBtn = getById('engineBtn');
const dropdown = getById('engineDropdown');
const currentIcon = getById('currentEngineIcon');
const searchForm = getById('searchForm');
const items = document.querySelectorAll('.dropdown-item');
const searchWrapper = (document.querySelector('.search-wrapper') || document.querySelector('.search-bar') || getById('searchForm'));
const toggleSearchBar = getById('toggleSearchBar');
const suggestionsRow = getById('suggestionsRow');
const toggleSuggestions = getById('toggleSuggestions');
const toggleClearSearch = getById('toggleClearSearch');
const clearSearchRow = getById('clearSearchRow');
const toggleVoiceSearch = getById('toggleVoiceSearch');
const toggleDisableAnimations = getById('toggleDisableAnimations');
const toggleDisableBlur = getById('toggleDisableBlur');
const toggleReducedEffects = getById('toggleReducedEffects');
const reducedEffectsOptions = getById('reducedEffectsOptions');
const suggestionsContainer = getById('suggestionsContainer');
const searchInput = getById('searchInput');
const voiceSearchBtn = getById('voiceSearchBtn');
const weatherWidget = getById('weatherWidget');
const toggleWeather = getById('toggleWeather');
const cityInputGroup = getById('cityInputGroup');
const weatherUnitGroup = getById('weatherUnitGroup');
const cityInput = getById('cityInput');
const saveCityBtn = getById('saveCityBtn');
const weatherCity = getById('weatherCity');
const weatherIcon = getById('weatherIcon');
const weatherTemp = getById('weatherTemp');
const unitBtns = document.querySelectorAll('.unit-btn');
const appLauncherWrapper = getById('appLauncherWrapper');
const appLauncherBtn = getById('appLauncherBtn');
const launcherPopup = getById('launcherPopup');
const launcherGrid = getById('launcherGrid');
const launcherAllAppsLink = getById('launcherAllAppsLink');
const btnLauncherToFolder = getById('btn-launcher-to-folder');
const toggleLauncher = getById('toggleLauncher');
const launcherProvider = getById('launcherProvider');
const launcherSelectGroup = getById('launcherSelectGroup');
const versionDisplay = getById('versionDisplay');
const exportBtn = getById('exportBtn');
const importBtn = getById('importBtn');
const importInput = getById('importInput');
const languageSelect = getById('languageProvider');
const toggleWallpaper = getById('toggleWallpaper');
const wallpaperGrid = getById('wallpaperGrid');
const wallpaperOptions = document.querySelectorAll('.wallpaper-option:not(.upload-option)');
const uploadOption = document.querySelector('.upload-option');
const uploadInput = getById('wallpaperUploadInput');
const wallpaperSourceSelect = getById('wallpaperSource');
const wallpaperSourceContainer = getById('wallpaperSourceContainer');
const wallpaperOverlaySetting = getById('wallpaperOverlaySetting');
const overlayToggleBtn = getById('overlay-toggle-btn');
const overlaySliderContainer = getById('overlay-slider-container');
const overlaySlider = getById('wallpaper-overlay-slider');
const foldersRow = getById('foldersRow');
const toggleFolders = getById('toggleFolders');
const chooseTypeModal = getById('chooseTypeModal');
const addFolderModal = getById('addFolderModal');
const folderModalTitle = getById('folderModalTitle');
const inputFolderName = getById('inputFolderName');
async function fetchDailyWallpaper(source) {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `wallpaper_cache_${source}`;
    const now = Date.now();
    const CACHE_DURATION_MS = 10 * 60 * 60 * 1000;
    try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        const timestamp = cached?.timestamp || 0;
        if (cached && cached.url && timestamp > 0 && (now - timestamp) < CACHE_DURATION_MS) {
            console.log(`Loading ${source} from 10h cache.`);
            return cached.url;
        }
    }
    catch (e) {
        console.error('Error reading cache', e);
    }
    console.log(`Fetching new image from: ${source}...`);
    let imageUrl = '';
    let creditText = '';
    const notifyWallpaperApiWarning = (reason) => {
        window.dispatchEvent(new CustomEvent('wallpaper-api-warning', {
            detail: { source, reason }
        }));
    };
    try {
        if (source === 'bing') {
            const res = await fetch('https://peapix.com/bing/feed?country=us');
            if (!res.ok)
                throw new Error(`Bing Error: ${res.status}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const img = data[0];
                imageUrl = img.fullUrl || img.imageUrl || img.url || '';
                creditText = `Bing: ${img.copyright || 'Daily Image'}`;
            }
        }
        else if (source === 'nasa') {
            const fetchNasaApod = async (date) => {
                const url = date
                    ? `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${encodeURIComponent(date)}`
                    : 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
                const response = await fetch(url);
                if (response.status === 429)
                    throw new Error('NASA API limit reached.');
                if (!response.ok)
                    throw new Error(`NASA Error: ${response.status}`);
                return await response.json();
            };
            const todayData = await fetchNasaApod();
            if (todayData.media_type === 'image') {
                imageUrl = todayData.hdurl || todayData.url || '';
                creditText = `NASA: ${todayData.title || 'APOD'}`;
            }
            else {
                notifyWallpaperApiWarning(todayData.media_type === 'video' ? 'video' : 'unavailable');
                return null;
            }
        }
        else if (source === 'wikimedia') {
            const fetchWiki = async (date) => {
                const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=Template:Potd/${date}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
                const response = await fetch(url);
                return await response.json();
            };
            let data = await fetchWiki(today);
            let pages = data.query?.pages;
            if (!pages) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                data = await fetchWiki(yesterday);
                pages = data.query?.pages;
            }
            if (pages) {
                for (const page of Object.values(pages)) {
                    if (page?.imageinfo?.[0]) {
                        imageUrl = page.imageinfo[0].url;
                        const meta = page.imageinfo[0].extmetadata;
                        creditText = meta?.Artist?.value || 'Wikimedia Commons';
                        creditText = creditText.replace(/<[^>]*>?/gm, '');
                        // Limitar o tamanho do texto de crédito para evitar quebra de layout
                        const MAX_CREDIT_LENGTH = 120;
                        if (creditText.length > MAX_CREDIT_LENGTH) {
                            creditText = creditText.substring(0, MAX_CREDIT_LENGTH).trim() + '...';
                        }
                        break;
                    }
                }
            }
        }
        if (imageUrl) {
            localStorage.setItem(cacheKey, JSON.stringify({
                url: imageUrl,
                timestamp: now,
                credit: creditText
            }));
            return imageUrl;
        }
        throw new Error('No image URL found in the API response.');
    }
    catch (error) {
        if (source === 'nasa')
            notifyWallpaperApiWarning('error');
        console.error(`Error while searching ${source}:`, error);
        return null;
    }
}
function fetchSuggestionsFromService(query) {
    const target = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const url = `https://corsproxy.io/?${encodeURIComponent(target)}`;
    return fetch(url)
        .then(response => response.json())
        .then((data) => {
        if (Array.isArray(data?.[1])) {
            return data[1].slice(0, 5);
        }
        return [];
    })
        .catch(error => {
        console.error('Error retrieving suggestions:', error);
        return [];
    });
}
async function fetchCityData(query) {
    const language = 'en';
    const normalizeText = (value) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    const queryParts = query.split(',').map((part) => normalizeText(part)).filter(Boolean);
    const primaryTerm = queryParts[0] || normalizeText(query);
    const qualifiers = queryParts.slice(1);
    const scoreResult = (result) => {
        const name = normalizeText(result.name || '');
        const country = normalizeText(result.country || '');
        const countryCode = normalizeText(result.country_code || '');
        const admin1 = normalizeText(result.admin1 || '');
        const admin2 = normalizeText(result.admin2 || '');
        const admin3 = normalizeText(result.admin3 || '');
        const context = [country, countryCode, admin1, admin2, admin3].filter(Boolean);
        let score = 0;
        if (name === primaryTerm)
            score += 200;
        else if (name.startsWith(primaryTerm))
            score += 120;
        else if (name.includes(primaryTerm))
            score += 70;
        qualifiers.forEach((qualifier) => {
            if (context.some((part) => part === qualifier)) {
                score += 90;
            }
            else if (context.some((part) => part.includes(qualifier))) {
                score += 45;
            }
        });
        if (qualifiers.length > 0 && score > 0) {
            const matchesAllQualifiers = qualifiers.every((qualifier) => context.some((part) => part.includes(qualifier)));
            if (matchesAllQualifiers)
                score += 40;
        }
        return score;
    };
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=${encodeURIComponent(language)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        const sorted = [...data.results].sort((a, b) => scoreResult(b) - scoreResult(a));
        const result = sorted[0];
        return { name: result.name, lat: result.latitude, lon: result.longitude, country: result.country };
    }
    return null;
}
async function fetchWeatherData(cityData) {
    const { lat, lon } = cityData;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    return await response.json();
}
function getFluentIconFilename(code, isDay) {
    switch (code) {
        case 0: return isDay ? 'sunny.svg' : 'clear_night.svg';
        case 1: return isDay ? 'sunny.svg' : 'clear_night.svg';
        case 2: return isDay ? 'partly_cloudy_day.svg' : 'partly_cloudy_night.svg';
        case 3: return 'cloudy.svg';
        case 45:
        case 48: return 'fog.svg';
        case 51:
        case 53:
        case 55: return 'drizzle.svg';
        case 56:
        case 57:
        case 66:
        case 67: return 'rain_snow.svg';
        case 61:
        case 63:
        case 65: return 'rain.svg';
        case 71:
        case 73:
        case 75:
        case 77: return 'snow.svg';
        case 80:
        case 81:
        case 82: return isDay ? 'rain_showers_day.svg' : 'rain_showers_night.svg';
        case 85:
        case 86: return isDay ? 'snow_showers_day.svg' : 'snow_showers_night.svg';
        case 95: return 'thunderstorm.svg';
        case 96:
        case 99: return isDay ? 'hail_day.svg' : 'hail_night.svg';
        default: return 'cloudy.svg';
    }
}
function renderWeatherWidget(data, weatherUnit, cityData, refs) {
    if (!data?.current_weather)
        return;
    if (!refs.weatherCity || !refs.weatherTemp || !refs.weatherIcon || !refs.weatherWidget)
        return;
    const { temperature, weathercode, is_day } = data.current_weather;
    const isCelsius = weatherUnit === 'c';
    const tempValue = isCelsius ? temperature : (temperature * 9 / 5) + 32;
    const unitSymbol = isCelsius ? '°C' : '°F';
    const filename = getFluentIconFilename(weathercode, is_day);
    refs.weatherCity.textContent = cityData.name;
    refs.weatherTemp.textContent = `${Math.round(tempValue)}${unitSymbol}`;
    refs.weatherIcon.innerHTML = `<img src="assets/weather/${filename}" alt="Weather Icon" class="fluent-icon">`;
    const degreeType = isCelsius ? 'C' : 'F';
    refs.weatherWidget.href = `https://www.msn.com/en-ph/weather/forecast/?weadegreetype=${degreeType}&uxmode=ruby`;
}
const FOLDER_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.207 4c.46 0 .908.141 1.284.402l.156.12L12.022 6.5h7.728a2.25 2.25 0 0 1 2.229 1.938l.016.158.005.154v9a2.25 2.25 0 0 1-2.096 2.245L19.75 20H4.25a2.25 2.25 0 0 1-2.245-2.096L2 17.75V6.25a2.25 2.25 0 0 1 2.096-2.245L4.25 4zm1.44 5.979a2.25 2.25 0 0 1-1.244.512l-.196.009-4.707-.001v7.251c0 .38.282.694.648.743l.102.007h15.5a.75.75 0 0 0 .743-.648l.007-.102v-9a.75.75 0 0 0-.648-.743L19.75 8h-7.729zM8.207 5.5H4.25a.75.75 0 0 0-.743.648L3.5 6.25v2.749L8.207 9a.75.75 0 0 0 .395-.113l.085-.06 1.891-1.578-1.89-1.575a.75.75 0 0 0-.377-.167z" fill="currentColor"/></svg>`;
const BACK_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.733 19.79a.75.75 0 0 0 1.034-1.086L5.516 12.75H20.25a.75.75 0 0 0 0-1.5H5.516l6.251-5.955a.75.75 0 0 0-1.034-1.086l-7.42 7.067a1 1 0 0 0-.3.58.8.8 0 0 0 .001.289 1 1 0 0 0 .3.579l7.419 7.067Z" fill="currentColor"/></svg>`;
const FOLDER_FIXED_ROWS = 4;
function renderShortcutsGrid(options) {
    const { shortcutsGrid, rowsSelect, shortcuts, currentFolderId, onOpenModal, onDeleteShortcut, onClosePopups, onOpenFolder, onGoBack } = options;
    if (!shortcutsGrid)
        return;
    shortcutsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const COLUMNS = 10;
    const currentRows = rowsSelect ? parseInt(rowsSelect.value) : (parseInt(localStorage.getItem('shortcutsRows') || '2') || 2);
    const maxSlots = currentRows * COLUMNS;
    let activeArray = shortcuts;
    let isInsideFolder = false;
    if (currentFolderId) {
        const currentFolder = shortcuts.find(s => s.id === currentFolderId && s.type === 'folder');
        if (currentFolder) {
            activeArray = currentFolder.children || [];
            isInsideFolder = true;
        }
    }
    const folderMaxSlots = FOLDER_FIXED_ROWS * COLUMNS;
    const availableSlots = isInsideFolder ? folderMaxSlots - 1 : maxSlots;
    const visibleShortcuts = activeArray.slice(0, availableSlots);
    if (isInsideFolder) {
        const backBtn = document.createElement('div');
        backBtn.className = 'shortcut-item folder-back-btn';
        backBtn.dataset.action = 'go-back';
        const backText = window.getTranslation('backLabel');
        const finalBackText = (backText && backText !== 'backLabel') ? backText : 'Back';
        backBtn.innerHTML = `
            <a class="shortcut-card" href="#" draggable="false" style="display: flex; align-items: center; justify-content: center; color: inherit; text-decoration: none;">
                <div class="shortcut-icon" style="display: flex; align-items: center; justify-content: center;">
                    ${BACK_ICON_SVG}
                </div>
            </a>
            <span class="shortcut-title">${finalBackText}</span>
        `;
        backBtn.setAttribute('draggable', 'false');
        fragment.appendChild(backBtn);
    }
    visibleShortcuts.forEach((itemData, index) => {
        const isFolder = itemData.type === 'folder';
        const item = document.createElement('div');
        item.className = 'shortcut-item';
        item.dataset.index = index.toString();
        item.dataset.type = isFolder ? 'folder' : 'shortcut';
        if (itemData.id)
            item.dataset.id = itemData.id;
        const card = document.createElement('a');
        card.className = 'shortcut-card';
        card.href = isFolder ? '#' : (itemData.url || '#');
        card.draggable = true;
        card.style.color = 'inherit';
        card.style.textDecoration = 'none';
        card.dataset.action = 'open-shortcut';
        if (isFolder) {
            card.style.display = 'flex';
        }
        const cardContent = isFolder ? FOLDER_ICON_SVG : '';
        card.innerHTML = `
            ${cardContent}
            <div class="menu-wrapper">
                <button class="menu-btn" title="${window.getTranslation('moreOptionsLabel')}">${typeof ICON_MENU_DOTS !== 'undefined' ? ICON_MENU_DOTS : '...'}</button>
                <div class="shortcut-dropdown">
                    <div class="menu-option edit-option">
                        ${typeof ICON_EDIT !== 'undefined' ? ICON_EDIT : 'E'} <span>${window.getTranslation('editLabel')}</span>
                    </div>
                    <div class="menu-option remove-option">
                        ${typeof ICON_REMOVE !== 'undefined' ? ICON_REMOVE : 'R'} <span>${window.getTranslation('removeLabel')}</span>
                    </div>
                </div>
            </div>
        `;
        if (!isFolder) {
            const img = document.createElement('img');
            img.decoding = 'async';
            img.className = 'shortcut-icon';
            img.alt = itemData.name;
            let targetIconSrc = itemData.customIcon;
            if (!targetIconSrc) {
                try {
                    const parsedUrl = new URL(itemData.url);
                    targetIconSrc = `https://icons.duckduckgo.com/ip3/${parsedUrl.hostname}.ico`;
                }
                catch (error) {
                    targetIconSrc = 'invalid-url';
                }
            }
            img.src = targetIconSrc;
            img.onerror = function () {
                img.onerror = null;
                img.src = 'data:image/svg+xml;utf8,<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.999c5.524 0 10.002 4.478 10.002 10.002 0 5.523-4.478 10.001-10.002 10.001-5.524 0-10.002-4.478-10.002-10.001C1.998 6.477 6.476 1.999 12 1.999ZM14.939 16.5H9.06c.652 2.414 1.786 4.002 2.939 4.002s2.287-1.588 2.939-4.002Zm-7.43 0H4.785a8.532 8.532 0 0 0 4.094 3.411c-.522-.82-.953-1.846-1.27-3.015l-.102-.395Zm11.705 0h-2.722c-.324 1.335-.792 2.5-1.373 3.411a8.528 8.528 0 0 0 3.91-3.127l.185-.283ZM7.094 10H3.735l-.005.017a8.525 8.525 0 0 0-.233 1.984c0 1.056.193 2.067.545 3h3.173a20.847 20.847 0 0 1-.123-5Zm8.303 0H8.603a18.966 18.966 0 0 0 .135 5h6.524a18.974 18.974 0 0 0 .135-5Zm4.868 0h-3.358c.062.647.095 1.317.095 2a20.3 20.3 0 0 1-.218 3h3.173a8.482 8.482 0 0 0 .544-3c0-.689-.082-1.36-.236-2ZM8.88 4.09l-.023.008A8.531 8.531 0 0 0 4.25 8.5h3.048c.314-1.752.86-3.278 1.583-4.41ZM12 3.499l-.116.005C10.62 3.62 9.396 5.622 8.83 8.5h6.342c-.566-2.87-1.783-4.869-3.045-4.995L12 3.5Zm3.12.59.107.175c.669 1.112 1.177 2.572 1.475 4.237h3.048a8.533 8.533 0 0 0-4.339-4.29l-.291-.121Z" fill="%23212121"/></svg>';
            };
            card.prepend(img);
        }
        const editOpt = card.querySelector('.edit-option');
        const removeOpt = card.querySelector('.remove-option');
        editOpt?.setAttribute('data-index', index.toString());
        removeOpt?.setAttribute('data-index', index.toString());
        item.appendChild(card);
        // 3. Título abaixo do atalho
        const titleLink = document.createElement('a');
        titleLink.className = 'shortcut-title';
        titleLink.href = isFolder ? '#' : (itemData.url || '#');
        titleLink.textContent = itemData.name;
        titleLink.dataset.action = isFolder ? 'open-folder-title' : 'open-shortcut-title';
        titleLink.dataset.index = index.toString();
        item.appendChild(titleLink);
        fragment.appendChild(item);
    });
    // Adiciona o botão de "+" no final, se houver espaço
    if (visibleShortcuts.length < availableSlots) {
        const addBtn = document.createElement('div');
        addBtn.className = 'shortcut-item add-card-wrapper';
        addBtn.dataset.action = 'add-shortcut';
        addBtn.innerHTML = `
            <div class="shortcut-card">${typeof ICON_ADD !== 'undefined' ? ICON_ADD : '+'}</div>
            <span class="shortcut-title">${window.getTranslation('addShortcutLabel')}</span>
        `;
        fragment.appendChild(addBtn);
    }
    shortcutsGrid.appendChild(fragment);
    const handleGridClick = (event) => {
        const target = event.target;
        const backBtn = target.closest('.folder-back-btn');
        if (backBtn) {
            event.preventDefault();
            onGoBack();
            return;
        }
        const addBtn = target.closest('.add-card-wrapper');
        if (addBtn) {
            event.preventDefault();
            onOpenModal(null);
            return;
        }
        const editOpt = target.closest('.edit-option');
        if (editOpt) {
            event.preventDefault();
            event.stopPropagation();
            onClosePopups();
            const editIndex = parseInt(editOpt.dataset.index || '-1', 10);
            if (editIndex > -1)
                onOpenModal(editIndex);
            return;
        }
        const removeOpt = target.closest('.remove-option');
        if (removeOpt) {
            event.preventDefault();
            event.stopPropagation();
            onClosePopups();
            const removeIndex = parseInt(removeOpt.dataset.index || '-1', 10);
            if (removeIndex > -1)
                onDeleteShortcut(removeIndex);
            return;
        }
        const menuBtn = target.closest('.menu-btn');
        if (menuBtn) {
            event.preventDefault();
            event.stopPropagation();
            const dropdown = menuBtn.closest('.menu-wrapper')?.querySelector('.shortcut-dropdown');
            onClosePopups(dropdown);
            dropdown?.classList.toggle('active');
            syncShortcutDropdownState();
            return;
        }
        const dropdownContent = target.closest('.shortcut-dropdown');
        if (dropdownContent) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        const card = target.closest('.shortcut-card');
        if (card) {
            const item = card.closest('.shortcut-item');
            const isFolder = item?.dataset.type === 'folder';
            const folderId = item?.dataset.id;
            if (card.querySelector('.menu-wrapper')?.contains(target)) {
                event.preventDefault();
                return;
            }
            if (isFolder && folderId) {
                event.preventDefault();
                onOpenFolder(folderId);
                return;
            }
            onClosePopups();
            return;
        }
        const titleLink = target.closest('.shortcut-title');
        if (titleLink) {
            const item = titleLink.closest('.shortcut-item');
            const isFolder = item?.dataset.type === 'folder';
            const folderId = item?.dataset.id;
            if (isFolder && folderId) {
                event.preventDefault();
                onOpenFolder(folderId);
                return;
            }
            return;
        }
    };
    const handleGridContext = (event) => {
        const target = event.target;
        const card = target.closest('.shortcut-card');
        if (!card)
            return;
        event.preventDefault();
        const dropdown = card.querySelector('.shortcut-dropdown');
        onClosePopups(dropdown);
        dropdown?.classList.add('active');
        syncShortcutDropdownState();
    };
    shortcutsGrid.onclick = handleGridClick;
    shortcutsGrid.oncontextmenu = handleGridContext;
}
const WALLPAPER_DB_NAME = 'FluentNewTabDB';
const WALLPAPER_DB_VERSION = 1;
const WALLPAPER_STORE_NAME = 'wallpapers';
function openWallpaperDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(WALLPAPER_DB_NAME, WALLPAPER_DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(WALLPAPER_STORE_NAME)) {
                db.createObjectStore(WALLPAPER_STORE_NAME);
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('Erro ao abrir banco de dados: ' + event.target.error);
    });
}
async function saveWallpaperToDB(blob, keyName = 'custom_wallpaper') {
    const db = await openWallpaperDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(WALLPAPER_STORE_NAME);
        const request = store.put(blob, keyName);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject('Erro ao salvar no DB');
    });
}
async function getWallpaperFromDB(keyName = 'custom_wallpaper') {
    const db = await openWallpaperDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readonly');
        const store = transaction.objectStore(WALLPAPER_STORE_NAME);
        const request = store.get(keyName);
        request.onsuccess = (event) => resolve(event.target.result ?? null);
        request.onerror = () => reject('Erro ao ler do DB');
    });
}
function convertImageToWebp(imageSource, maxWidth = 1920, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageSource;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob)
                    resolve(blob);
                else
                    reject('Erro na conversão para WebP');
            }, 'image/webp', quality);
        };
        img.onerror = (error) => reject(error);
    });
}
function processWallpaperImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            convertImageToWebp(String(event.target.result || ''), 1920, 0.8)
                .then(resolve)
                .catch(reject);
        };
        reader.onerror = (error) => reject(error);
    });
}
function updateLauncherVisibilityUI(enabled, animate, refs, setCollapsibleFn) {
    if (refs.appLauncherWrapper) {
        refs.appLauncherWrapper.style.display = enabled ? 'block' : 'none';
    }
    if (refs.launcherSelectGroup) {
        setCollapsibleFn(refs.launcherSelectGroup, enabled, animate);
    }
}
function renderLauncherApps(data, refs) {
    if (!data || !refs.launcherGrid)
        return;
    refs.launcherGrid.innerHTML = '';
    data.apps.forEach((app) => {
        const link = document.createElement('a');
        link.href = app.url;
        link.className = 'launcher-item';
        link.title = app.name;
        link.setAttribute('aria-label', app.name);
        link.innerHTML = `
            <img src="${app.icon}" class="launcher-icon" alt="${app.name}">
        `;
        refs.launcherGrid?.appendChild(link);
    });
    if (refs.launcherAllAppsLink) {
        refs.launcherAllAppsLink.href = data.allAppsLink;
    }
}
function clearSuggestionsUI(suggestionsContainer, searchWrapper) {
    if (searchWrapper)
        searchWrapper.classList.remove('suggestions-open');
    if (!suggestionsContainer)
        return;
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.classList.remove('active');
}
function renderSuggestionsUI(suggestions, refs, onClear) {
    const { suggestionsContainer, searchInput, searchForm, searchWrapper } = refs;
    if (!suggestionsContainer)
        return;
    suggestionsContainer.innerHTML = '';
    if (suggestions.length === 0) {
        suggestionsContainer.classList.remove('active');
        if (searchWrapper)
            searchWrapper.classList.remove('suggestions-open');
        return;
    }
    const iconSvg = `<svg class="suggestion-icon" viewBox="0 0 24 24"><path d="M11.5 2.75a8.75 8.75 0 0 1 6.695 14.384l6.835 6.836a.75.75 0 0 1-.976 1.133l-.084-.073-6.836-6.835A8.75 8.75 0 1 1 11.5 2.75m0 1.5a7.25 7.25 0 1 0 0 14.5 7.25 7.25 0 0 0 0-14.5" fill="#5f6368"/></svg>`;
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
            }
            else {
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
            }
            onClear();
        });
        suggestionsContainer.appendChild(div);
    });
    suggestionsContainer.classList.add('active');
    if (searchWrapper)
        searchWrapper.classList.add('suggestions-open');
}
function updateSuggestionSelectionUI(items, index, searchInput) {
    items.forEach((item) => item.classList.remove('selected'));
    if (index > -1 && items[index]) {
        items[index].classList.add('selected');
        if (searchInput) {
            searchInput.value = items[index].dataset.value || '';
        }
    }
}
function applyGoogleSearchParams(searchForm, currentEngine, clearSearchEnabled) {
    if (!searchForm)
        return;
    const udmInput = searchForm.querySelector('input[name="udm"]');
    if (currentEngine === 'google' && clearSearchEnabled) {
        if (!udmInput) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'udm';
            input.value = '14';
            searchForm.appendChild(input);
        }
    }
    else if (udmInput) {
        udmInput.remove();
    }
}
function initGreetingBrand(greetingWrapper) {
    if (!greetingWrapper)
        return;
    const showGreeting = localStorage.getItem('showGreeting') !== 'false';
    const userName = (localStorage.getItem('greetingName') || '').trim();
    const greetingStyle = localStorage.getItem('greetingStyle') || '3d';
    if (!showGreeting) {
        greetingWrapper.style.display = 'none';
        return;
    }
    greetingWrapper.style.display = 'flex';
    const hour = new Date().getHours();
    let timeKeyPrefix = 'greetMorning';
    let iconName = 'sun';
    let timeOfDayLabel = 'morning';
    if (hour >= 5 && hour < 12) {
        timeKeyPrefix = 'greetMorning';
        iconName = 'sun';
        timeOfDayLabel = 'morning';
    }
    else if (hour >= 12 && hour < 19) {
        timeKeyPrefix = 'greetAfternoon';
        iconName = 'cloud-sun';
        timeOfDayLabel = 'afternoon';
    }
    else if (hour >= 19 && hour < 24) {
        timeKeyPrefix = 'greetEvening';
        iconName = 'moon';
        timeOfDayLabel = 'evening';
    }
    else {
        timeKeyPrefix = 'greetNight';
        iconName = 'stars';
        timeOfDayLabel = 'night';
    }
    const seed = new Date().getMinutes();
    const randomIndex = (seed % 5) + 1;
    const translationKey = `${timeKeyPrefix}${randomIndex}`;
    let rawGreeting = '';
    const message = window.getTranslation(translationKey);
    if (message && message !== translationKey) {
        rawGreeting = message.replace(/\$NAME\$/g, userName);
    }
    else {
        try {
            rawGreeting = chrome.i18n.getMessage(translationKey, [userName]);
        }
        catch (error) {
            rawGreeting = translationKey;
        }
    }
    if (!userName) {
        rawGreeting = rawGreeting
            .replace(/,\s*([!?.,;:])/g, '$1')
            .replace(/\s+([!?.,;:])/g, '$1')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }
    const finalGreetingText = rawGreeting
        .replace(/,\s*$/, '')
        .replace(/,\s*!$/, '!')
        .replace(/,\s*\?$/, '?')
        .trim();
    let fontSize = '40px';
    const textLength = finalGreetingText.length;
    if (textLength > 50)
        fontSize = '22px';
    else if (textLength > 40)
        fontSize = '26px';
    else if (textLength > 30)
        fontSize = '32px';
    const icon = document.createElement('img');
    icon.src = greetingStyle === '3d'
        ? `assets/emojis/${iconName}.png`
        : `assets/greetings/${iconName}.svg`;
    icon.alt = timeOfDayLabel;
    icon.className = greetingStyle === '3d' ? 'greeting-icon' : 'greeting-icon outline';
    icon.addEventListener('error', () => { icon.style.display = 'none'; });
    const heading = document.createElement('h1');
    heading.className = 'greeting-text';
    heading.style.fontSize = fontSize;
    heading.style.whiteSpace = 'nowrap';
    heading.textContent = finalGreetingText;
    greetingWrapper.replaceChildren(icon, heading);
}
function bindWeatherFeature(options) {
    options.applyInitialWeatherState();
    if (options.toggleWeather) {
        options.toggleWeather.checked = options.getWeatherEnabled();
        options.toggleWeather.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setWeatherEnabled(target.checked);
            localStorage.setItem('weatherEnabled', String(target.checked));
            options.updateWeatherVisibility();
            if (target.checked)
                options.initWeather();
        });
    }
    options.unitBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const unit = btn.dataset.unit;
            if (!unit)
                return;
            options.setWeatherUnit(unit);
            localStorage.setItem('weatherUnit', unit);
            options.updateUnitButtons();
            options.initWeather();
        });
    });
    if (options.saveCityBtn)
        options.saveCityBtn.addEventListener('click', options.searchCity);
    if (options.cityInput) {
        options.cityInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter')
                options.searchCity();
        });
    }
}
function bindLauncherFeature(options) {
    options.applyInitialLauncherState();
    if (options.toggleLauncher) {
        options.toggleLauncher.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setLauncherEnabled(target.checked);
            localStorage.setItem('launcherEnabled', String(target.checked));
            options.updateLauncherVisibility();
            if (target.checked)
                options.renderLauncher(options.getCurrentProvider());
        });
    }
    if (options.launcherProvider) {
        options.launcherProvider.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            const provider = target.value;
            options.setCurrentProvider(provider);
            localStorage.setItem('launcherProvider', provider);
            options.renderLauncher(provider);
        });
    }
    if (options.appLauncherBtn) {
        options.appLauncherBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            options.closePopups(options.launcherPopup);
            options.launcherPopup?.classList.toggle('active');
            options.appLauncherBtn?.classList.toggle('active');
        });
    }
    document.addEventListener('click', (event) => {
        const targetNode = event.target;
        if (!targetNode || !options.launcherPopup || !options.appLauncherBtn)
            return;
        if (!options.launcherPopup.classList.contains('active'))
            return;
        if (!options.launcherPopup.contains(targetNode) && !options.appLauncherBtn.contains(targetNode)) {
            options.launcherPopup.classList.remove('active');
            options.appLauncherBtn.classList.remove('active');
        }
    });
}
function bindSearchFeature(options) {
    options.applyInitialSearchEngine();
    if (options.engineBtn) {
        options.engineBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            options.closePopups(options.dropdown);
            options.dropdown?.classList.toggle('active');
        });
    }
    // Close search dropdown when clicking outside the selector
    document.addEventListener('click', (event) => {
        const targetNode = event.target;
        if (!targetNode)
            return;
        const dropdown = options.dropdown;
        const engineBtn = options.engineBtn;
        if (!dropdown || !dropdown.classList.contains('active'))
            return;
        if (dropdown.contains(targetNode) || engineBtn?.contains(targetNode))
            return;
        dropdown.classList.remove('active');
    });
    options.items.forEach((item) => {
        item.addEventListener('click', () => {
            const selectedEngine = item.getAttribute('data-engine');
            if (!selectedEngine || !options.hasEngine(selectedEngine))
                return;
            options.setSearchEngine(selectedEngine);
            localStorage.setItem('searchEngine', selectedEngine);
            options.dropdown?.classList.remove('active');
        });
    });
    options.applyInitialSearchBarVisibility();
    if (options.toggleSearchBar) {
        options.toggleSearchBar.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setSearchBarVisible(target.checked);
            localStorage.setItem('searchBarVisible', String(target.checked));
            options.updateSearchSettings();
        });
    }
    options.applyInitialSuggestionsActive();
    if (options.toggleSuggestions) {
        options.toggleSuggestions.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setSuggestionsActive(target.checked);
            localStorage.setItem('suggestionsEnabled', String(target.checked));
            if (!target.checked)
                options.clearSuggestions();
        });
    }
    options.applyInitialClearSearch();
    if (options.toggleClearSearch) {
        options.toggleClearSearch.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setClearSearchEnabled(target.checked);
            localStorage.setItem('clearSearchEnabled', String(target.checked));
            options.updateGoogleParams();
        });
    }
    if (options.toggleCompact) {
        options.toggleCompact.checked = options.getCompactBarEnabled();
        options.toggleCompact.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setCompactBarEnabled(target.checked);
            localStorage.setItem('compactBarEnabled', String(target.checked));
            options.updateCompactBarStyle();
        });
    }
    options.updateCompactBarStyle();
    options.applyInitialVoiceSearch();
    if (options.toggleVoiceSearch) {
        options.toggleVoiceSearch.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setVoiceSearchEnabled(target.checked);
            localStorage.setItem('voiceSearchEnabled', String(target.checked));
            options.updateVoiceSearchAvailability();
        });
    }
    if (options.searchInput) {
        options.searchInput.addEventListener('input', options.debounce((event) => {
            if (!options.getSuggestionsActive())
                return;
            const target = event.target;
            if (!target)
                return;
            const query = target.value.trim();
            if (query.length < 2) {
                options.clearSuggestions();
                return;
            }
            const cacheKey = query.toLowerCase();
            if (options.suggestionsCache.has(cacheKey)) {
                options.renderSuggestions(options.suggestionsCache.get(cacheKey) || []);
                return;
            }
            options.fetchSuggestions(query);
        }, 100));
        options.searchInput.addEventListener('keydown', (event) => {
            if (!options.getSuggestionsActive())
                return;
            const suggestionItems = Array.from(document.querySelectorAll('.suggestion-item'));
            if (suggestionItems.length === 0)
                return;
            let index = suggestionItems.findIndex((item) => item.classList.contains('selected'));
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                index = (index + 1) % suggestionItems.length;
                options.updateSelection(suggestionItems, index);
            }
            else if (event.key === 'ArrowUp') {
                event.preventDefault();
                index = (index - 1 + suggestionItems.length) % suggestionItems.length;
                options.updateSelection(suggestionItems, index);
            }
            else if (event.key === 'Enter') {
                if (index > -1) {
                    event.preventDefault();
                    suggestionItems[index].click();
                }
            }
            else if (event.key === 'Escape') {
                options.clearSuggestions();
            }
        });
    }
}
function bindWallpaperFeature(options) {
    options.applyInitialWallpaperState();
    if (options.overlayToggleBtn) {
        options.overlayToggleBtn.addEventListener('click', () => {
            options.overlayToggleBtn?.classList.toggle('expanded');
            options.overlaySliderContainer?.classList.toggle('collapsed');
        });
    }
    if (options.overlaySlider) {
        options.overlaySlider.addEventListener('input', (event) => {
            const antiFlickerBlock = document.getElementById('anti-flicker-overlay');
            if (antiFlickerBlock)
                antiFlickerBlock.remove();
            const target = event.target;
            if (!target)
                return;
            options.updateOverlaySliderProgress(target);
            options.setOverlayOpacity(target.value);
        });
        options.overlaySlider.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setOverlayOpacity(target.value, true);
        });
    }
    if (options.toggleWallpaper) {
        options.toggleWallpaper.addEventListener('change', (event) => {
            const target = event.target;
            if (!target)
                return;
            options.setWallpaperEnabled(target.checked);
            localStorage.setItem('wallpaperEnabled', String(target.checked));
            options.updateWallpaperUIState(target.checked);
            options.applyWallpaperLogic();
        });
    }
    options.wallpaperOptions.forEach((option) => {
        option.addEventListener('click', () => {
            if (!options.getWallpaperEnabled())
                return;
            const value = option.dataset.value || 'preset_1';
            options.setWallpaperSource('local');
            options.setWallpaperType('preset');
            options.setWallpaperValue(value);
            options.saveWallpaperConfig();
            if (options.wallpaperSourceSelect)
                options.wallpaperSourceSelect.value = 'noSource';
            options.highlightSelectedWallpaper(value);
            options.applyWallpaperLogic();
        });
    });
    if (options.uploadOption && options.uploadInput) {
        options.uploadOption.addEventListener('click', () => {
            options.uploadInput?.click();
        });
        options.uploadInput.addEventListener('change', async (event) => {
            const target = event.target;
            const file = target?.files?.[0];
            if (!file)
                return;
            options.uploadOption.style.opacity = '0.5';
            try {
                console.log('Processing image...');
                const processedBlob = await options.processWallpaperImage(file);
                console.log('Saving to database...');
                await options.saveWallpaperToDB(processedBlob);
                options.setWallpaperSource('local');
                options.setWallpaperType('upload');
                options.setWallpaperValue('custom');
                options.saveWallpaperConfig();
                if (!options.getWallpaperEnabled()) {
                    options.setWallpaperEnabled(true);
                    localStorage.setItem('wallpaperEnabled', 'true');
                    if (options.toggleWallpaper)
                        options.toggleWallpaper.checked = true;
                    options.updateWallpaperUIState(true);
                }
                if (options.wallpaperSourceSelect)
                    options.wallpaperSourceSelect.value = 'noSource';
                options.highlightSelectedWallpaper('upload');
                await options.applyWallpaperLogic();
                console.log('Success!');
            }
            catch (error) {
                console.error('Upload error:', error);
                alert('Error processing image. Try a smaller image.');
            }
            finally {
                options.uploadOption.style.opacity = '1';
                if (options.uploadInput)
                    options.uploadInput.value = '';
            }
        });
    }
    if (options.wallpaperSourceSelect) {
        options.wallpaperSourceSelect.addEventListener('change', async (event) => {
            const target = event.target;
            if (!target)
                return;
            const selectedApi = target.value;
            if (selectedApi === 'noSource')
                return;
            options.setWallpaperSource('api');
            options.setWallpaperType(selectedApi);
            options.saveWallpaperConfig();
            options.clearPresetSelection();
            await options.applyWallpaperLogic();
        });
    }
}
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
}
function closeModal() {
    hideAllModals();
    editingIndex = null;
}
function hideAllModals() {
    if (addModal)
        addModal.classList.remove('active');
    if (chooseTypeModal)
        chooseTypeModal.classList.remove('active');
    if (addFolderModal)
        addFolderModal.classList.remove('active');
}
function closePopups(except = null) {
    if (configPopup && configPopup !== except)
        configPopup.classList.remove('active');
    if (launcherPopup && launcherPopup !== except) {
        launcherPopup.classList.remove('active');
        if (appLauncherBtn)
            appLauncherBtn.classList.remove('active');
    }
    document.querySelectorAll('.shortcut-dropdown.active').forEach(menu => {
        if (menu !== except)
            menu.classList.remove('active');
    });
    if (dropdown && dropdown !== except)
        dropdown.classList.remove('active');
    syncShortcutDropdownState();
}
function syncShortcutDropdownState() {
    const hasActiveDropdown = Boolean(shortcutsGrid?.querySelector('.shortcut-dropdown.active'));
    if (shortcutsGrid)
        shortcutsGrid.classList.toggle('dropdown-open', hasActiveDropdown);
    document.querySelectorAll('.menu-wrapper').forEach((wrapper) => {
        const isOpen = Boolean(wrapper.querySelector('.shortcut-dropdown.active'));
        wrapper.classList.toggle('dropdown-open', isOpen);
    });
}
function openModal(index = null) {
    editingIndex = index;
    const currentArray = getActiveShortcutsList();
    const existingItem = index !== null ? currentArray[index] : null;
    if (existingItem?.type === 'folder') {
        openFolderModal(existingItem.name, true);
        return;
    }
    if (index === null && foldersEnabled && !currentFolderId) {
        openChooseTypeModal();
        return;
    }
    openShortcutModal(existingItem);
}
function openChooseTypeModal() {
    hideAllModals();
    if (chooseTypeModal)
        chooseTypeModal.classList.add('active');
}
function openFolderModal(name = '', isEditing = false) {
    hideAllModals();
    if (!addFolderModal || !inputFolderName)
        return;
    addFolderModal.classList.add('active');
    if (folderModalTitle) {
        const tKey = isEditing ? 'editFolderTitle' : 'addFolderTitle';
        const fallback = isEditing ? 'Edit Folder' : 'Add Folder';
        const translated = window.getTranslation(tKey);
        const safeText = translated && translated !== tKey && translated.toLowerCase() !== 'edit' ? translated : fallback;
        folderModalTitle.textContent = safeText;
    }
    inputFolderName.value = name;
    setTimeout(() => inputFolderName.focus(), 100);
}
function openShortcutModal(existingItem) {
    hideAllModals();
    if (!addModal)
        return;
    addModal.classList.add('active');
    const modalTitle = addModal.querySelector('.modal-content h3');
    const inputName = getInputById('inputName');
    const inputUrl = getInputById('inputUrl');
    const inputIcon = getInputById('inputIcon');
    if (existingItem) {
        if (inputName)
            inputName.value = existingItem.name;
        if (inputUrl)
            inputUrl.value = existingItem.url || '';
        if (inputIcon)
            inputIcon.value = existingItem.customIcon || '';
        if (modalTitle)
            modalTitle.textContent = window.getTranslation('editShortcutTitle');
        setCustomIconVisibility(Boolean(existingItem.customIcon));
    }
    else {
        if (inputName)
            inputName.value = '';
        if (inputUrl)
            inputUrl.value = '';
        if (inputIcon)
            inputIcon.value = '';
        if (modalTitle)
            modalTitle.textContent = window.getTranslation('addShortcutTitle');
        setCustomIconVisibility(false);
    }
    setTimeout(() => inputName?.focus(), 100);
}
function setCustomIconVisibility(show) {
    if (!customIconGroup || !toggleCustomIcon)
        return;
    const inputIcon = document.getElementById('inputIcon');
    customIconGroup.classList.toggle('hidden', !show);
    toggleCustomIcon.classList.toggle('expanded', show);
    toggleCustomIcon.setAttribute('aria-expanded', show ? 'true' : 'false');
    if (!show && inputIcon) {
        inputIcon.value = '';
    }
}
function initCustomIconToggle() {
    if (!toggleCustomIcon || !customIconGroup)
        return;
    const inputIcon = getInputById('inputIcon');
    toggleCustomIcon.addEventListener('click', () => {
        const isHidden = customIconGroup.classList.contains('hidden');
        if (isHidden) {
            setCustomIconVisibility(true);
            if (inputIcon) {
                setTimeout(() => inputIcon.focus(), 50);
            }
        }
        else {
            setCustomIconVisibility(false);
        }
    });
}
function getActiveShortcutsList() {
    if (currentFolderId) {
        const folder = shortcuts.find(s => s.id === currentFolderId);
        if (folder && folder.children)
            return folder.children;
    }
    return shortcuts;
}
class WarningModalManager {
    constructor() {
        this.overlay = document.getElementById('warningModal');
        this.titleEl = document.getElementById('warning-modal-title');
        this.messageEl = document.getElementById('warning-modal-message');
        this.btnConfirm = document.getElementById('warning-btn-confirm');
        this.btnCancel = document.getElementById('warning-btn-cancel');
        this.handleKeydownBound = this.handleKeydown.bind(this);
    }
    show(options) {
        const confirmVariant = options.confirmVariant || 'accent';
        this.titleEl.textContent = options.title;
        this.messageEl.textContent = options.message;
        this.btnConfirm.textContent = options.confirmText || 'Confirm';
        this.btnCancel.textContent = options.cancelText || 'Cancel';
        this.btnConfirm.classList.toggle('btn-danger', confirmVariant === 'danger');
        this.btnConfirm.classList.toggle('btn-save', confirmVariant !== 'danger');
        this.overlay.classList.add('active');
        document.addEventListener('keydown', this.handleKeydownBound);
        this.btnConfirm.onclick = () => {
            this.close();
            options.onConfirm();
        };
        this.btnCancel.onclick = () => {
            this.close();
            if (options.onCancel)
                options.onCancel();
        };
    }
    close() {
        this.overlay.classList.remove('active');
        document.removeEventListener('keydown', this.handleKeydownBound);
        this.btnConfirm.onclick = null;
        this.btnCancel.onclick = null;
    }
    handleKeydown(event) {
        if (!this.overlay.classList.contains('active'))
            return;
        if (event.key !== 'Enter')
            return;
        event.preventDefault();
        this.btnConfirm.click();
    }
}
const warningModal = new WarningModalManager();
function saveAndRender() {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
}
function deleteShortcut(index) {
    const targetArray = getActiveShortcutsList();
    const item = targetArray[index];
    if (item && item.type === 'folder') {
        const folderName = item.name || getLocalizedWarningText('warningDeleteFolderTitle', 'Folder');
        warningModal.show({
            title: getLocalizedWarningText('warningDeleteFolderTitle', 'Delete Folder'),
            message: getLocalizedWarningText('warningDeleteFolderMessage', 'Are you sure you want to delete the folder "$FOLDER$"? All shortcuts inside it will be removed.', { FOLDER: folderName }),
            confirmText: getLocalizedWarningText('removeLabel', 'Remove'),
            cancelText: getLocalizedWarningText('btnCancel', 'Cancel'),
            confirmVariant: 'danger',
            onConfirm: () => {
                if (currentFolderId === item.id)
                    currentFolderId = null;
                targetArray.splice(index, 1);
                saveAndRender();
            }
        });
        return;
    }
    targetArray.splice(index, 1);
    saveAndRender();
}
function updateShortcutsVisibility(visible, animate = true) {
    if (shortcutsGrid)
        shortcutsGrid.style.display = visible ? 'grid' : 'none';
    if (rowsInputGroup)
        setCollapsible(rowsInputGroup, visible, animate);
    if (foldersRow)
        setCollapsible(foldersRow, visible, animate);
}
function renderShortcuts() {
    const performRender = () => {
        renderShortcutsGrid({
            shortcutsGrid,
            rowsSelect,
            shortcuts,
            currentFolderId: currentFolderId,
            onOpenModal: openModal,
            onDeleteShortcut: deleteShortcut,
            onClosePopups: closePopups,
            onOpenFolder: handleOpenFolder,
            onGoBack: handleGoBack
        });
    };
    const animateAndRender = (nextFolderId) => {
        currentFolderId = nextFolderId;
        performRender();
    };
    const handleOpenFolder = (id) => {
        animateAndRender(id);
    };
    const handleGoBack = () => {
        animateAndRender(null);
    };
    performRender();
}
function setSearchEngine(engineKey) {
    const config = engines[engineKey];
    if (config) {
        if (currentIcon) {
            currentIcon.src = config.icon;
            currentIcon.onerror = () => { currentIcon.style.display = 'none'; };
            currentIcon.onload = () => { currentIcon.style.display = 'block'; };
        }
        if (searchForm)
            searchForm.action = config.url;
        updateGoogleParams();
    }
}
function updateSearchSettings(animate = true) {
    if (searchWrapper)
        searchWrapper.style.display = searchBarVisible ? '' : 'none';
    if (toggleSearchBar)
        toggleSearchBar.checked = searchBarVisible;
    const showChildren = searchBarVisible;
    if (suggestionsRow)
        setCollapsible(suggestionsRow, showChildren, animate);
    if (clearSearchRow)
        setCollapsible(clearSearchRow, showChildren, animate);
    const compactBarRow = getById('compactBarRow');
    if (compactBarRow)
        setCollapsible(compactBarRow, showChildren, animate);
    const voiceSearchRow = getById('voiceSearchRow');
    if (voiceSearchRow)
        setCollapsible(voiceSearchRow, showChildren, animate);
    updateVoiceSearchAvailability();
}
function updateCompactBarStyle() {
    if (searchWrapper) {
        if (compactBarEnabled)
            searchWrapper.classList.add('compact');
        else
            searchWrapper.classList.remove('compact');
    }
}
const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
const voiceSearchSupported = typeof SpeechRecognitionCtor === 'function';
let voiceRecognition = null;
let voiceRecording = false;
let voiceShouldSubmitOnEnd = false;
let voiceFinalTranscript = '';
let voiceSilenceTimeout = null;
const VOICE_SILENCE_MS = 8000;
function stopVoiceRingAnimation() {
    if (!searchWrapper)
        return;
    searchWrapper.classList.remove('voice-active');
}
function startVoiceRingAnimation() {
    if (!searchWrapper)
        return;
    searchWrapper.classList.add('voice-active');
}
function playVoiceStartSound() {
    const audio = new Audio('assets/mic-recording.mp3');
    audio.volume = 0.45;
    audio.play().catch((error) => {
        const message = error instanceof Error ? error.message : String(error || '');
        const isExpectedPolicyBlock = message.toLowerCase().includes('notallowederror') ||
            message.toLowerCase().includes('interact') ||
            message.toLowerCase().includes('play() request was interrupted');
        if (isExpectedPolicyBlock)
            return;
        console.debug('Voice start sound could not play.', error);
    });
}
function updateVoiceButtonRecordingState() {
    if (!voiceSearchBtn)
        return;
    voiceSearchBtn.classList.toggle('recording', voiceRecording);
    voiceSearchBtn.setAttribute('aria-pressed', voiceRecording ? 'true' : 'false');
}
function normalizeVoiceLanguage(code) {
    if (!code)
        return '';
    const normalized = code.replace('_', '-').trim();
    if (!normalized)
        return '';
    try {
        const canonical = Intl.getCanonicalLocales([normalized])[0];
        return canonical || '';
    }
    catch {
        return '';
    }
}
function getVoiceRecognitionLanguage() {
    const fromBrowser = normalizeVoiceLanguage(navigator.language);
    if (fromBrowser)
        return fromBrowser;
    return 'en-US';
}
function clearVoiceSilenceTimer() {
    if (voiceSilenceTimeout === null)
        return;
    window.clearTimeout(voiceSilenceTimeout);
    voiceSilenceTimeout = null;
}
function scheduleVoiceSilenceStop() {
    clearVoiceSilenceTimer();
    voiceSilenceTimeout = window.setTimeout(() => {
        if (!voiceRecording)
            return;
        stopVoiceSearch(true);
    }, VOICE_SILENCE_MS);
}
function stopVoiceSearch(submitAfterStop = false) {
    voiceShouldSubmitOnEnd = submitAfterStop;
    if (!voiceRecording || !voiceRecognition)
        return;
    voiceRecognition.stop();
}
function ensureVoiceRecognition() {
    if (!voiceSearchSupported || !SpeechRecognitionCtor)
        return null;
    if (voiceRecognition)
        return voiceRecognition;
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
    voiceRecognition.onresult = (event) => {
        if (!searchInput)
            return;
        let finalTranscript = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const transcript = result[0]?.transcript?.trim() || '';
            if (!transcript)
                continue;
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
            }
            else {
                searchForm.submit();
            }
        }
    };
    return voiceRecognition;
}
function startVoiceSearch() {
    if (!voiceSearchEnabled || !voiceSearchSupported || !searchBarVisible)
        return;
    if (voiceRecording) {
        stopVoiceSearch(false);
        return;
    }
    const recognition = ensureVoiceRecognition();
    if (!recognition)
        return;
    voiceFinalTranscript = '';
    voiceShouldSubmitOnEnd = true;
    recognition.lang = getVoiceRecognitionLanguage();
    playVoiceStartSound();
    startVoiceRingAnimation();
    scheduleVoiceSilenceStop();
    try {
        recognition.start();
    }
    catch (error) {
        console.warn('Unable to start voice recognition.', error);
        voiceShouldSubmitOnEnd = false;
        stopVoiceRingAnimation();
    }
}
function updateVoiceSearchAvailability() {
    const canUseVoice = voiceSearchEnabled && searchBarVisible && voiceSearchSupported;
    if (voiceSearchBtn) {
        voiceSearchBtn.style.display = canUseVoice ? 'flex' : 'none';
        voiceSearchBtn.disabled = !canUseVoice;
    }
    if (toggleVoiceSearch) {
        toggleVoiceSearch.disabled = !voiceSearchSupported;
        toggleVoiceSearch.title = voiceSearchSupported ? '' : 'Voice recognition is not supported in this browser.';
    }
    if (!canUseVoice) {
        if (voiceRecording)
            stopVoiceSearch(false);
        stopVoiceRingAnimation();
    }
}
function renderSuggestions(suggestions) {
    renderSuggestionsUI(suggestions, {
        suggestionsContainer,
        searchInput,
        searchForm,
        searchWrapper
    }, clearSuggestions);
}
function clearSuggestions() {
    clearSuggestionsUI(suggestionsContainer, searchWrapper);
}
function updateSelection(items, index) {
    updateSuggestionSelectionUI(items, index, searchInput);
}
function updateUnitButtons() {
    if (!unitBtns)
        return;
    unitBtns.forEach(btn => {
        if (btn.dataset.unit === weatherUnit)
            btn.classList.add('active');
        else
            btn.classList.remove('active');
    });
}
function updateWeatherVisibility(animate = true) {
    if (!weatherWidget || !cityInputGroup)
        return;
    const displayStyle = weatherEnabled ? 'flex' : 'none';
    weatherWidget.style.display = displayStyle;
    setCollapsible(cityInputGroup, weatherEnabled, animate);
    if (weatherUnitGroup)
        setCollapsible(weatherUnitGroup, weatherEnabled, animate);
}
function renderWeather(data) {
    renderWeatherWidget(data, weatherUnit, currentCityData, {
        weatherCity,
        weatherTemp,
        weatherIcon,
        weatherWidget
    });
}
function updateLauncherVisibility(animate = true) {
    updateLauncherVisibilityUI(launcherEnabled, animate, {
        appLauncherWrapper,
        launcherSelectGroup
    }, setCollapsible);
}
function updateReducedEffectsVisibility(enabled, animate = true) {
    if (reducedEffectsOptions)
        setCollapsible(reducedEffectsOptions, enabled, animate);
    if (toggleReducedEffects)
        toggleReducedEffects.checked = enabled;
    [toggleDisableAnimations, toggleDisableBlur].forEach((input) => {
        if (!input)
            return;
        input.disabled = !enabled;
    });
}
function updateWallpaperUIState(enabled, animate = true) {
    if (wallpaperGrid) {
        wallpaperGrid.dataset.collapsibleDisplay = 'grid';
        setCollapsible(wallpaperGrid, enabled, animate);
    }
    const container = wallpaperSourceContainer || (wallpaperSourceSelect ? wallpaperSourceSelect.closest('.wallpaper-source-options') : null);
    if (container) {
        setCollapsible(container, enabled, animate);
    }
    else if (wallpaperSourceSelect) {
        wallpaperSourceSelect.dataset.collapsibleDisplay = 'block';
        setCollapsible(wallpaperSourceSelect, enabled, animate);
        const label = (document.querySelector(`label[for="${wallpaperSourceSelect.id}"]`) ||
            (wallpaperSourceSelect.previousElementSibling && wallpaperSourceSelect.previousElementSibling.tagName === 'LABEL' ? wallpaperSourceSelect.previousElementSibling : null));
        if (label)
            setCollapsible(label, enabled, animate);
    }
    const overlaySetting = wallpaperOverlaySetting || overlaySliderContainer?.closest('.collapsible-setting');
    if (overlaySetting) {
        overlaySetting.dataset.collapsibleDisplay = 'block';
        setCollapsible(overlaySetting, enabled, animate);
    }
    if (overlaySlider)
        updateOverlaySliderProgress(overlaySlider);
    setOverlayOpacity(wallpaperOverlay, false);
    if (toggleWallpaper) {
        const row = toggleWallpaper.closest('.switch-row');
        if (row)
            row.style.marginBottom = enabled ? '' : '0';
    }
}
function updateGreetingSettingsVisibility(show, animate = true) {
    if (greetingOptionsDiv)
        setCollapsible(greetingOptionsDiv, show, animate);
}
function updateAnimationsDisabled(enabled) {
    document.body.classList.toggle('animations-disabled', enabled);
}
function updateBlurDisabled(enabled) {
    document.body.classList.toggle('blur-reduced', enabled);
}
function clearPresetSelection() {
    document.querySelectorAll('.wallpaper-option').forEach(opt => opt.classList.remove('selected'));
}
function highlightSelectedWallpaper(value) {
    clearPresetSelection();
    if (value === 'custom' || value === 'upload') {
        const uploadBtn = document.querySelector('.upload-option');
        if (uploadBtn)
            uploadBtn.classList.add('selected');
    }
    else {
        const target = document.querySelector(`.wallpaper-option[data-value="${value}"]`);
        if (target)
            target.classList.add('selected');
    }
}
function prepareCollapsible(element) {
    if (!element || element.dataset.collapsibleReady === 'true')
        return;
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
function setCollapsible(element, shouldExpand, animate = true) {
    if (!element)
        return;
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
        }
        else {
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
        if (currentState === 'open')
            return;
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
        const onExpandEnd = (event) => {
            if (event.propertyName !== 'height')
                return;
            element.style.height = 'auto';
            element.style.overflow = '';
            element.style.pointerEvents = 'auto';
            element.dataset.state = 'open';
            element.style.transition = '';
            element.removeEventListener('transitionend', onExpandEnd);
        };
        element.addEventListener('transitionend', onExpandEnd);
    }
    else {
        if (currentState === 'closed')
            return;
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
        const onCollapseEnd = (event) => {
            if (event.propertyName !== 'height')
                return;
            element.dataset.state = 'closed';
            element.style.transition = '';
            element.style.overflow = 'hidden';
            element.removeEventListener('transitionend', onCollapseEnd);
        };
        element.addEventListener('transitionend', onCollapseEnd);
    }
}
function updateOverlaySliderProgress(slider) {
    const value = parseFloat(slider.value);
    const min = parseFloat(slider.min || '0');
    const max = parseFloat(slider.max || '1');
    const range = (max - min) || 1;
    const percentage = ((value - min) / range) * 100;
    slider.style.setProperty('--slider-progress', `${percentage}%`);
}
const MAX_OVERLAY_OPACITY = 0.7;
function setOverlayOpacity(value, persist = false) {
    const parsed = Math.min(Math.max(parseFloat(value) || 0, 0), MAX_OVERLAY_OPACITY);
    const normalized = parsed.toString();
    wallpaperOverlay = normalized;
    if (persist)
        localStorage.setItem('wallpaperOverlay', normalized);
    const targetValue = wallpaperEnabled ? normalized : '0';
    document.documentElement.style.setProperty('--overlay-opacity', targetValue);
    if (overlaySlider && overlaySlider.value !== normalized) {
        overlaySlider.value = normalized;
        updateOverlaySliderProgress(overlaySlider);
    }
}
function saveWallpaperConfig() {
    localStorage.setItem('wallpaperSource', currentWallpaperSource);
    localStorage.setItem('wallpaperType', currentWallpaperType);
    localStorage.setItem('wallpaperValue', currentWallpaperValue);
}
let currentWallpaperObjectUrl = null;
function clearEarlyWallpaperBootstrap() {
    const earlyStyle = document.getElementById('early-wallpaper-style');
    if (earlyStyle)
        earlyStyle.remove();
    document.documentElement.removeAttribute('data-early-wallpaper');
}
function preloadWallpaperImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to preload wallpaper image.'));
        img.src = url;
    });
}
async function applyWallpaperImage(url) {
    if (currentWallpaperObjectUrl && currentWallpaperObjectUrl.startsWith('blob:') && currentWallpaperObjectUrl !== url) {
        URL.revokeObjectURL(currentWallpaperObjectUrl);
    }
    try {
        await preloadWallpaperImage(url);
    }
    catch (error) {
        console.warn('Could not preload wallpaper, applying directly.', error);
    }
    currentWallpaperObjectUrl = url.startsWith('blob:') ? url : null;
    document.body.style.backgroundImage = `url('${url}')`;
}
async function getOptimizedApiWallpaper(remoteUrl, source) {
    const cacheKey = `api_wallpaper_${source}`;
    const lastProcessedUrl = localStorage.getItem(`${cacheKey}_url`);
    if (lastProcessedUrl === remoteUrl) {
        const cachedBlob = await getWallpaperFromDB(cacheKey);
        if (cachedBlob) {
            return URL.createObjectURL(cachedBlob);
        }
    }
    try {
        const response = await fetch(remoteUrl);
        const blob = await response.blob();
        const tempUrl = URL.createObjectURL(blob);
        const webpBlob = await convertImageToWebp(tempUrl, 1920, 0.82);
        URL.revokeObjectURL(tempUrl);
        await saveWallpaperToDB(webpBlob, cacheKey);
        localStorage.setItem(`${cacheKey}_url`, remoteUrl);
        return URL.createObjectURL(webpBlob);
    }
    catch (error) {
        console.warn(`Compression failed for ${source}, using original URL.`, error);
        return remoteUrl;
    }
}
async function applyWallpaperLogic() {
    try {
        setOverlayOpacity(wallpaperOverlay, false);
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
                const optimizedUrl = await getOptimizedApiWallpaper(url, currentWallpaperType);
                await applyWallpaperImage(optimizedUrl);
                const cacheKey = `wallpaper_cache_${currentWallpaperType}`;
                try {
                    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
                    let credit = cached ? cached.credit : '';
                    if (!credit) {
                        if (currentWallpaperType === 'bing')
                            credit = 'Microsoft Bing';
                        else if (currentWallpaperType === 'nasa')
                            credit = 'NASA APOD';
                        else if (currentWallpaperType === 'wikimedia')
                            credit = 'Wikimedia Commons';
                    }
                    updateCreditsUI('api', credit);
                }
                catch (e) {
                    updateCreditsUI('api', 'Daily Wallpaper');
                }
            }
        }
    }
    finally {
        clearEarlyWallpaperBootstrap();
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
        }
        else {
            console.warn("No custom wallpaper found.");
        }
    }
    catch (e) {
        console.error("Failed to load wallpaper:", e);
    }
}
function applyTheme(theme) {
    if (themeBtns) {
        themeBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.theme === theme));
    }
    document.documentElement.removeAttribute("data-theme");
    if (theme === "auto") {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }
    else {
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
function fetchSuggestions(query) {
    fetchSuggestionsFromService(query).then((suggestions) => {
        if (!searchInput || searchInput.value.trim().toLowerCase() !== query.toLowerCase())
            return;
        suggestionsCache.set(query.toLowerCase(), suggestions);
        renderSuggestions(suggestions);
    });
}
function updateGoogleParams() {
    const currentEngine = localStorage.getItem('searchEngine') || 'bing';
    applyGoogleSearchParams(searchForm, currentEngine, clearSearchEnabled);
}
async function searchCity() {
    if (!cityInput || !saveCityBtn)
        return;
    const query = cityInput.value.trim();
    if (!query)
        return;
    saveCityBtn.innerHTML = '...';
    try {
        const cityData = await fetchCityData(query);
        if (cityData) {
            currentCityData = cityData;
            localStorage.setItem(CITY_KEY, JSON.stringify(currentCityData));
            cityInput.value = cityData.name;
            fetchWeatherFromAPI(true);
        }
        else {
            alert('City not found.');
        }
    }
    catch (error) {
        alert('Error searching city.');
    }
    finally {
        saveCityBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    }
}
const MAX_MAIN_GRID_ITEMS = 40;
const MAX_FOLDER_GRID_ROWS = 4;
const MAX_FOLDER_CAPACITY = (MAX_FOLDER_GRID_ROWS * 10) - 1;
function deriveShortcutNameFromUrl(rawUrl) {
    try {
        const host = new URL(rawUrl).hostname.replace(/^www\./i, '');
        if (!host)
            return 'New Shortcut';
        return host.charAt(0).toUpperCase() + host.slice(1);
    }
    catch {
        return 'New Shortcut';
    }
}
function showGridLimitWarning(currentLimit, isFolderGrid) {
    const title = isFolderGrid
        ? getLocalizedWarningText('warningFolderFullTitle', 'Folder is Full')
        : getLocalizedWarningText('warningGridFullTitle', 'Grid is Full');
    const message = isFolderGrid
        ? getLocalizedWarningText('warningFolderFullMessage', 'This folder has reached the absolute limit of $LIMIT$ items. Please remove some shortcuts before adding new ones.', { LIMIT: String(currentLimit) })
        : getLocalizedWarningText('warningGridFullMessage', 'You have reached the maximum limit of $LIMIT$ shortcuts on the main screen. Delete some items or group them into a folder to free up space.', { LIMIT: String(currentLimit) });
    warningModal.show({
        title,
        message,
        confirmText: getLocalizedWarningText('warningUnderstood', 'Understood'),
        cancelText: getLocalizedWarningText('warningClose', 'Close'),
        confirmVariant: 'accent',
        onConfirm: () => { }
    });
}
function bindExternalShortcutDrop() {
    if (!shortcutsGrid)
        return;
    shortcutsGrid.addEventListener('dragover', (event) => {
        if (!event.dataTransfer)
            return;
        const hasUrl = Array.from(event.dataTransfer.types).some((type) => type === 'text/uri-list' || type === 'text/plain' || type === 'text/html');
        if (!hasUrl)
            return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });
    shortcutsGrid.addEventListener('drop', (event) => {
        event.preventDefault();
        // Ignore internal Sortable drops to avoid creating duplicate shortcuts.
        if (shortcutsGrid.classList.contains('sorting'))
            return;
        if (!event.dataTransfer)
            return;
        const targetArray = getActiveShortcutsList();
        const isFolderGrid = Boolean(currentFolderId);
        const effectiveLimit = isFolderGrid ? MAX_FOLDER_CAPACITY : Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);
        if (targetArray.length >= effectiveLimit) {
            showGridLimitWarning(effectiveLimit, isFolderGrid);
            return;
        }
        let droppedUrl = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
        let droppedName = '';
        const htmlData = event.dataTransfer.getData('text/html');
        if (htmlData) {
            const parser = new DOMParser();
            const parsedDoc = parser.parseFromString(htmlData, 'text/html');
            const anchor = parsedDoc.querySelector('a');
            if (anchor) {
                droppedUrl = anchor.href || droppedUrl;
                droppedName = anchor.textContent?.trim() || '';
            }
        }
        if (!droppedUrl || !/^https?:\/\//i.test(droppedUrl))
            return;
        if (!droppedName)
            droppedName = deriveShortcutNameFromUrl(droppedUrl);
        targetArray.push({
            type: 'link',
            name: droppedName,
            url: droppedUrl,
            customIcon: null
        });
        saveAndRender();
    });
}
function initSortable() {
    if (!shortcutsGrid)
        return;
    let hoveredFolderEl = null;
    const BODY_DRAG_CLASS = 'dragging-out-of-folder';
    let globalDragOverHandler = null;
    const clearFolderHover = () => {
        if (hoveredFolderEl)
            hoveredFolderEl.classList.remove('folder-drag-hover');
        hoveredFolderEl = null;
    };
    const getClientPoint = (event) => {
        if (!event)
            return null;
        if ('clientX' in event && 'clientY' in event) {
            const mouseEvt = event;
            return { x: mouseEvt.clientX, y: mouseEvt.clientY };
        }
        const touchEvt = event;
        const touch = touchEvt.touches?.[0] || touchEvt.changedTouches?.[0];
        if (touch)
            return { x: touch.clientX, y: touch.clientY };
        return null;
    };
    const setBodyDragOverlay = (enabled) => {
        document.body.classList.toggle(BODY_DRAG_CLASS, enabled);
    };
    const detachGlobalDragOver = () => {
        if (globalDragOverHandler) {
            document.removeEventListener('dragover', globalDragOverHandler, true);
            globalDragOverHandler = null;
        }
    };
    const isPointOutsideGrid = (event) => {
        const point = getClientPoint(event);
        if (!point || !shortcutsGrid)
            return false;
        const rect = shortcutsGrid.getBoundingClientRect();
        return point.x < rect.left || point.x > rect.right || point.y < rect.top || point.y > rect.bottom;
    };
    const sortableOptions = {
        animation: 200,
        dragClass: "sortable-dragging",
        ghostClass: "sortable-placeholder",
        draggable: ".shortcut-item:not(.add-card-wrapper):not(.folder-back-btn)",
        filter: ".add-card-wrapper, .menu-wrapper, .folder-back-btn",
        handle: ".shortcut-card",
        delay: 120,
        delayOnTouchOnly: true,
        touchStartThreshold: 4,
        setData: function (dataTransfer, dragEl) {
            const link = dragEl.matches('.shortcut-card') ? dragEl : dragEl.querySelector('.shortcut-card');
            const url = link?.getAttribute('href');
            if (url) {
                dataTransfer.setData('text/uri-list', url);
                dataTransfer.setData('text/plain', url);
            }
        },
        onStart: (evt) => {
            shortcutsGrid.classList.add('sorting');
            const draggedEl = (evt?.item || evt?.dragged);
            const isDraggingFolder = draggedEl?.dataset?.type === 'folder';
            const insideFolder = Boolean(currentFolderId);
            if (insideFolder && !isDraggingFolder) {
                globalDragOverHandler = (event) => {
                    const outsideGrid = isPointOutsideGrid(event);
                    setBodyDragOverlay(outsideGrid);
                    event.preventDefault();
                    if (event.dataTransfer)
                        event.dataTransfer.dropEffect = 'move';
                };
                document.addEventListener('dragover', globalDragOverHandler, true);
            }
        },
        onMove: (evt, originalEvent) => {
            document.querySelectorAll('.folder-drag-hover').forEach(el => el.classList.remove('folder-drag-hover'));
            const relatedEl = evt.related;
            if (relatedEl?.classList.contains('add-card-wrapper'))
                return false;
            if (relatedEl?.classList.contains('folder-back-btn'))
                return false;
            const draggedEl = (evt?.dragged || evt?.item);
            const isDraggingFolder = draggedEl?.dataset?.type === 'folder';
            const insideFolder = Boolean(currentFolderId);
            const outsideGrid = insideFolder && isPointOutsideGrid(originalEvent);
            setBodyDragOverlay(outsideGrid);
            if (outsideGrid && originalEvent && 'dataTransfer' in originalEvent && originalEvent.dataTransfer) {
                originalEvent.preventDefault();
                originalEvent.dataTransfer.dropEffect = 'move';
            }
            if (!currentFolderId && !isDraggingFolder && relatedEl?.dataset?.type === 'folder') {
                hoveredFolderEl = relatedEl;
                relatedEl.classList.add('folder-drag-hover');
                return false; // Prevent Sortable from swapping with folder; signals drop target
            }
            hoveredFolderEl = null;
            return true;
        },
        onEnd: function (evt) {
            shortcutsGrid.classList.remove('sorting');
            setBodyDragOverlay(false);
            detachGlobalDragOver();
            const draggedEl = evt?.item;
            const targetArray = getActiveShortcutsList();
            const isInsideFolder = targetArray !== shortcuts;
            const indexOffset = isInsideFolder ? 1 : 0;
            const adjustedOldIndex = (evt.oldIndex ?? -1) - indexOffset;
            const adjustedNewIndex = (evt.newIndex ?? -1) - indexOffset;
            const originalEvent = evt?.originalEvent;
            const folderDropTarget = (!isInsideFolder && hoveredFolderEl && hoveredFolderEl.dataset.type === 'folder') ? hoveredFolderEl : null;
            const droppingOutsideGrid = isInsideFolder && isPointOutsideGrid(originalEvent);
            clearFolderHover();
            if (adjustedOldIndex < 0)
                return;
            const movedItem = targetArray[adjustedOldIndex];
            if (!movedItem)
                return;
            if (!isInsideFolder && folderDropTarget) {
                const folderId = folderDropTarget.dataset.id;
                const folderShortcut = shortcuts.find((s) => s.id === folderId && s.type === 'folder');
                if (!folderShortcut) {
                    saveAndRender();
                    return;
                }
                if (movedItem.type === 'folder') {
                    saveAndRender();
                    return;
                }
                const folderChildren = folderShortcut.children || [];
                if (folderChildren.length >= MAX_FOLDER_CAPACITY) {
                    showGridLimitWarning(MAX_FOLDER_CAPACITY, true);
                    saveAndRender();
                    return;
                }
                targetArray.splice(adjustedOldIndex, 1);
                folderShortcut.children = folderChildren;
                folderChildren.push(movedItem);
                saveAndRender();
                return;
            }
            if (droppingOutsideGrid) {
                const maxMain = Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);
                if (shortcuts.length >= maxMain) {
                    showGridLimitWarning(maxMain, false);
                    saveAndRender();
                    return;
                }
                targetArray.splice(adjustedOldIndex, 1);
                shortcuts.push(movedItem);
                saveAndRender();
                return;
            }
            if (evt.oldIndex === evt.newIndex)
                return;
            if (adjustedNewIndex < 0)
                return;
            const reorderedItem = targetArray.splice(adjustedOldIndex, 1)[0];
            if (!reorderedItem)
                return;
            targetArray.splice(adjustedNewIndex, 0, reorderedItem);
            saveAndRender();
        }
    };
    Sortable.create(shortcutsGrid, sortableOptions);
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
    if (!weatherEnabled)
        return;
    try {
        const data = await fetchWeatherData(currentCityData);
        if (!data)
            return;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), city: currentCityData.name, data: data }));
        renderWeather(data);
    }
    catch (error) {
        weatherTemp.textContent = '--';
    }
}
function renderLauncher(providerKey) {
    renderLauncherApps(launcherData[providerKey], {
        launcherGrid,
        launcherAllAppsLink
    });
}
function toTitleCase(value) {
    if (!value)
        return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
}
function getLocalizedWarningText(key, fallback, replacements) {
    let text = window.getTranslation(key);
    if (!text || text === key)
        text = fallback;
    if (replacements) {
        Object.entries(replacements).forEach(([token, value]) => {
            text = text.replace(new RegExp(`\\$${token}\\$`, 'g'), value);
        });
    }
    return text;
}
function getLauncherProviderKey() {
    const rawProvider = launcherProvider?.value;
    if (rawProvider && launcherData[rawProvider])
        return rawProvider;
    return currentProvider;
}
function getLauncherFolderName(providerKey) {
    const label = launcherProvider?.selectedOptions?.[0]?.textContent?.trim();
    if (label)
        return label;
    return toTitleCase(String(providerKey));
}
function createFolderFromLauncher(providerKey) {
    const providerData = launcherData[providerKey];
    if (!providerData?.apps?.length)
        return false;
    const folderName = getLauncherFolderName(providerKey);
    const newFolder = {
        id: `folder_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        type: 'folder',
        name: folderName,
        children: providerData.apps.slice(0, 9).map((app) => ({
            type: 'link',
            name: app.name,
            url: app.url,
            customIcon: app.icon
        }))
    };
    const limit = Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);
    if (shortcuts.length >= limit) {
        warningModal.show({
            title: getLocalizedWarningText('warningGridFullTitle', 'Grid is Full'),
            message: getLocalizedWarningText('warningGridFullMessage', 'You have reached the maximum limit of $LIMIT$ shortcuts on the main screen. Delete some items or group them into a folder to free up space.', { LIMIT: String(limit) }),
            confirmText: getLocalizedWarningText('warningUnderstood', 'Understood'),
            cancelText: getLocalizedWarningText('warningClose', 'Close'),
            onConfirm: () => { }
        });
        return false;
    }
    shortcuts.push(newFolder);
    foldersEnabled = true;
    if (toggleFolders)
        toggleFolders.checked = true;
    localStorage.setItem('foldersEnabled', 'true');
    updateLauncherFooterVariant();
    saveAndRender();
    closePopups();
    return true;
}
function bindLauncherFolderButton() {
    if (!btnLauncherToFolder)
        return;
    btnLauncherToFolder.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const providerKey = getLauncherProviderKey();
        const providerData = launcherData[providerKey];
        const ecosystemName = getLauncherFolderName(providerKey);
        if (!providerData?.apps?.length) {
            warningModal.show({
                title: getLocalizedWarningText('launcherNoAppsTitle', 'No Apps Available'),
                message: getLocalizedWarningText('launcherNoAppsAvailable', 'No apps available for this ecosystem.'),
                confirmText: getLocalizedWarningText('warningUnderstood', 'Understood'),
                cancelText: getLocalizedWarningText('warningClose', 'Close'),
                confirmVariant: 'accent',
                onConfirm: () => { }
            });
            return;
        }
        warningModal.show({
            title: getLocalizedWarningText('warningAddEcosystemAppsTitle', `Add ${ecosystemName} Apps?`, { ECOSYSTEM: ecosystemName }),
            message: getLocalizedWarningText('warningAddEcosystemAppsMessage', `This will create a folder with 9 ${ecosystemName} apps in your shortcuts. Continue?`, { ECOSYSTEM: ecosystemName }),
            confirmText: getLocalizedWarningText('warningAddFolderConfirm', 'Add Folder'),
            cancelText: getLocalizedWarningText('btnCancel', 'Cancel'),
            confirmVariant: 'accent',
            onConfirm: () => {
                createFolderFromLauncher(providerKey);
            }
        });
    });
}
function updateLauncherFooterVariant() {
    if (!launcherPopup)
        return;
    launcherPopup.classList.toggle('folders-enabled', foldersEnabled);
}
function updateCreditsUI(source, creditText) {
    const creditsContainer = getById('wallpaperCredits');
    const creditsSpan = getById('wallpaperCreditText');
    if (!creditsContainer || !creditsSpan)
        return;
    if (source === 'local' || source === 'preset' || source === 'upload') {
        creditsContainer.classList.add('hidden');
    }
    else {
        creditsSpan.textContent = creditText || 'Daily Wallpaper';
        creditsContainer.classList.remove('hidden');
    }
}
function applyInitialTheme() {
    applyTheme(savedTheme);
}
function applyInitialSearchEngine() {
    setSearchEngine(savedEngine);
}
function applyInitialShortcutsVisibility() {
    if (toggleShortcuts) {
        toggleShortcuts.checked = shortcutsVisible;
        updateShortcutsVisibility(shortcutsVisible, false);
    }
}
function applyInitialFoldersSetting() {
    if (toggleFolders)
        toggleFolders.checked = foldersEnabled;
    updateLauncherFooterVariant();
}
function applyInitialSearchBarVisibility() {
    updateSearchSettings(false);
    if (toggleSearchBar) {
        toggleSearchBar.checked = searchBarVisible;
    }
}
function applyInitialSuggestionsActive() {
    if (toggleSuggestions) {
        toggleSuggestions.checked = suggestionsActive;
    }
}
function applyInitialClearSearch() {
    if (toggleClearSearch) {
        toggleClearSearch.checked = clearSearchEnabled;
    }
    updateGoogleParams();
}
function applyInitialReducedEffectsState() {
    updateReducedEffectsVisibility(reducedEffectsEnabled, false);
    if (!reducedEffectsEnabled) {
        if (animationsDisabled) {
            animationsDisabled = false;
            localStorage.setItem('animationsDisabled', 'false');
            updateAnimationsDisabled(false);
            if (toggleDisableAnimations)
                toggleDisableAnimations.checked = false;
        }
        if (blurDisabled) {
            blurDisabled = false;
            localStorage.setItem('blurDisabled', 'false');
            updateBlurDisabled(false);
            if (toggleDisableBlur)
                toggleDisableBlur.checked = false;
        }
    }
}
function applyInitialVoiceSearch() {
    if (toggleVoiceSearch) {
        toggleVoiceSearch.checked = voiceSearchEnabled;
    }
    updateVoiceSearchAvailability();
}
function applyInitialAnimationsDisabled() {
    if (toggleDisableAnimations) {
        toggleDisableAnimations.checked = animationsDisabled;
    }
    updateAnimationsDisabled(animationsDisabled);
}
function applyInitialBlurDisabled() {
    if (toggleDisableBlur) {
        toggleDisableBlur.checked = blurDisabled;
    }
    updateBlurDisabled(blurDisabled);
}
function applyInitialWeatherState() {
    if (cityInput)
        cityInput.value = currentCityData.name;
    updateWeatherVisibility(false);
    updateUnitButtons();
    if (weatherEnabled)
        initWeather();
}
function applyInitialLauncherState() {
    if (toggleLauncher)
        toggleLauncher.checked = launcherEnabled;
    if (launcherProvider)
        launcherProvider.value = currentProvider;
    updateLauncherVisibility(false);
    if (launcherEnabled)
        renderLauncher(currentProvider);
}
function applyInitialWallpaperState() {
    if (toggleWallpaper) {
        toggleWallpaper.checked = wallpaperEnabled;
        updateWallpaperUIState(wallpaperEnabled, false);
    }
    if (currentWallpaperSource === 'api' && wallpaperSourceSelect) {
        wallpaperSourceSelect.value = currentWallpaperType;
        clearPresetSelection();
    }
    else {
        if (wallpaperSourceSelect)
            wallpaperSourceSelect.value = 'noSource';
        highlightSelectedWallpaper(currentWallpaperValue);
    }
    setOverlayOpacity(wallpaperOverlay, false);
    applyWallpaperLogic();
}
let brandIntervalStarted = false;
function applyBrandInterval() {
    initBrand();
    if (brandIntervalStarted)
        return;
    brandIntervalStarted = true;
    setInterval(initBrand, 60000);
}
const PERSISTENT_BACKUP_KEY = 'fluent_persistent_backup_v1';
const UPDATE_NOTICE_PENDING_KEY = 'update_notice_pending';
const UPDATE_NOTICE_VERSION_KEY = 'update_notice_version';
const SHORTCUTS_TREE_BACKUP_KEY = 'shortcutsTree';
let pendingUpdateNoticeVersion = null;
function getStorageLocalItems(key) {
    return new Promise((resolve) => {
        const localStorageApi = (typeof chrome !== 'undefined') ? chrome?.storage?.local : undefined;
        if (!localStorageApi) {
            resolve({});
            return;
        }
        localStorageApi.get(key, (items) => resolve(items || {}));
    });
}
function setStorageLocalItems(items) {
    return new Promise((resolve) => {
        const localStorageApi = (typeof chrome !== 'undefined') ? chrome?.storage?.local : undefined;
        if (!localStorageApi) {
            resolve();
            return;
        }
        localStorageApi.set(items, () => resolve());
    });
}
function getLocalPreferencesSnapshot() {
    const snapshot = {};
    APP_KEYS.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null)
            snapshot[key] = value;
    });
    return snapshot;
}
async function persistPreferencesBackup() {
    const snapshot = getLocalPreferencesSnapshot();
    await setStorageLocalItems({ [PERSISTENT_BACKUP_KEY]: snapshot });
}
async function restorePreferencesBackupIfNeeded() {
    const items = await getStorageLocalItems(PERSISTENT_BACKUP_KEY);
    const backupRaw = items[PERSISTENT_BACKUP_KEY];
    if (!backupRaw || typeof backupRaw !== 'object')
        return false;
    const backup = backupRaw;
    let restoredAny = false;
    Object.entries(backup).forEach(([key, value]) => {
        if (typeof value !== 'string')
            return;
        if (localStorage.getItem(key) !== null)
            return;
        localStorage.setItem(key, value);
        restoredAny = true;
    });
    return restoredAny;
}
async function getUpdateNoticeState() {
    const items = await getStorageLocalItems([UPDATE_NOTICE_PENDING_KEY, UPDATE_NOTICE_VERSION_KEY]);
    const pending = items[UPDATE_NOTICE_PENDING_KEY] === true;
    let manifestVersion = '';
    try { manifestVersion = chrome.runtime.getManifest().version; } catch (e) { /* not an extension */ }
    const storedVersion = typeof items[UPDATE_NOTICE_VERSION_KEY] === 'string'
        ? String(items[UPDATE_NOTICE_VERSION_KEY])
        : '';
    const version = manifestVersion || storedVersion;
    return { pending, version };
}
async function clearUpdateNoticeState() {
    let version = '';
    try { version = chrome.runtime.getManifest().version; } catch (e) { /* not an extension */ }
    localStorage.setItem('settings_dot_seen', 'true');
    localStorage.setItem('settings_dot_seen_version', version);
    await setStorageLocalItems({
        [UPDATE_NOTICE_PENDING_KEY]: false,
        [UPDATE_NOTICE_VERSION_KEY]: version
    });
}
function getLocalizedUpdateMessage(messageKey, substitutions = []) {
    const translated = window.getTranslation(messageKey);
    if (translated && translated !== messageKey) {
        let resolved = translated;
        substitutions.forEach((value, index) => {
            resolved = resolved.replace(new RegExp(`\\$${index + 1}\\$`, 'g'), value);
        });
        if (substitutions[0]) {
            resolved = resolved.replace(/\$VERSION\$/g, substitutions[0]);
        }
        return resolved;
    }
    if (messageKey === 'updateNoticePrefix') {
        return `Fluent New Tab has been updated to version ${substitutions[0] || ''}, `;
    }
    if (messageKey === 'updateNoticeChangelog') {
        return 'see changelog';
    }
    return messageKey;
}
function getLocalizedNasaApodNoticeMessage() {
    const messageKey = 'nasaApodVideoNotice';
    const translated = window.getTranslation(messageKey);
    if (translated && translated !== messageKey)
        return translated;
    return "Today's APOD is a video or unavailable. Keeping your current wallpaper instead.";
}
function showNasaApodWarningNotice() {
    if (document.querySelector('.update-release-notice.nasa-apod-warning'))
        return;
    const notice = document.createElement('div');
    notice.className = 'update-release-notice nasa-apod-warning';
    const icon = document.createElement('span');
    icon.className = 'update-release-notice-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.91 2.782a2.25 2.25 0 0 1 2.975.74l.083.138 7.759 14.009a2.25 2.25 0 0 1-1.814 3.334l-.154.006H4.243a2.25 2.25 0 0 1-2.041-3.197l.072-.143L10.031 3.66a2.25 2.25 0 0 1 .878-.878Zm9.505 15.613-7.76-14.008a.75.75 0 0 0-1.254-.088l-.057.088-7.757 14.008a.75.75 0 0 0 .561 1.108l.095.006h15.516a.75.75 0 0 0 .696-1.028l-.04-.086-7.76-14.008 7.76 14.008ZM12 16.002a.999.999 0 1 1 0 1.997.999.999 0 0 1 0-1.997ZM11.995 8.5a.75.75 0 0 1 .744.647l.007.102.004 4.502a.75.75 0 0 1-1.494.103l-.006-.102-.004-4.502a.75.75 0 0 1 .75-.75Z" fill="currentColor"/></svg>';
    const message = document.createElement('span');
    message.className = 'update-release-notice-prefix';
    message.textContent = getLocalizedNasaApodNoticeMessage();
    notice.append(icon, message);
    document.body.appendChild(notice);
    requestAnimationFrame(() => {
        notice.classList.add('visible');
    });
    const hideNotice = () => {
        notice.classList.remove('visible');
        window.setTimeout(() => {
            notice.remove();
        }, 220);
    };
    window.setTimeout(hideNotice, 9000);
}
function showPendingUpdateNoticeIfAny() {
    if (!pendingUpdateNoticeVersion)
        return;
    showUpdateReleaseNotice(pendingUpdateNoticeVersion);
    pendingUpdateNoticeVersion = null;
    void clearUpdateNoticeState();
}
function showUpdateReleaseNotice(version) {
    const notice = document.createElement('div');
    notice.className = 'update-release-notice';
    const icon = document.createElement('span');
    icon.className = 'update-release-notice-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.443 1.443 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.571a1.444 1.444 0 0 0 .017 2.734l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.528.527.7Zm-.374-4.25a4.054 4.054 0 0 0-.363-.413h.003a4.394 4.394 0 0 0-1.72-1.063l-1.6-.508 1.611-.524a4.4 4.4 0 0 0 1.69-1.065 4.448 4.448 0 0 0 1.041-1.708l.515-1.582.516 1.587a4.374 4.374 0 0 0 2.781 2.773l1.62.522-1.59.515a4.379 4.379 0 0 0-2.774 2.775l-.515 1.582-.515-1.585a4.368 4.368 0 0 0-.7-1.306Zm8.041 9.297a1.123 1.123 0 0 1-.41-.549l-.328-1.007a1.293 1.293 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.819l.324-.992a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005Zm-1.03-3.783A2.789 2.789 0 0 1 17 18.708a2.794 2.794 0 0 1 1.7-1.7 2.813 2.813 0 0 1-1.718-1.708A2.806 2.806 0 0 1 15.3 17Z" fill="currentColor"/></svg>';
    const prefix = document.createElement('span');
    prefix.className = 'update-release-notice-prefix';
    prefix.textContent = getLocalizedUpdateMessage('updateNoticePrefix', [`v${version}`]);
    const changelogLink = document.createElement('a');
    changelogLink.className = 'update-release-notice-link';
    changelogLink.href = 'https://github.com/snw-mint/fluent-new-tab/releases';
    changelogLink.target = '_blank';
    changelogLink.rel = 'noopener noreferrer';
    changelogLink.textContent = getLocalizedUpdateMessage('updateNoticeChangelog');
    notice.append(icon, prefix, changelogLink);
    document.body.appendChild(notice);
    requestAnimationFrame(() => {
        notice.classList.add('visible');
    });
    const hideNotice = () => {
        notice.classList.remove('visible');
        window.setTimeout(() => {
            notice.remove();
        }, 220);
    };
    window.setTimeout(hideNotice, 10000);
}
document.addEventListener("DOMContentLoaded", async () => {
    const restoredFromBackup = await restorePreferencesBackupIfNeeded();
    if (restoredFromBackup) {
        await persistPreferencesBackup();
        location.reload();
        return;
    }
    await persistPreferencesBackup();
    window.addEventListener('wallpaper-api-warning', (event) => {
        const wallpaperWarning = event;
        if (wallpaperWarning.detail?.source !== 'nasa')
            return;
        showNasaApodWarningNotice();
    });
    window.addEventListener('beforeunload', () => {
        void persistPreferencesBackup();
    });
    applyInitialTheme();
    if (themeBtns) {
        themeBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const theme = btn.dataset.theme;
                if (!theme)
                    return;
                applyTheme(theme);
                localStorage.setItem("theme", theme);
            });
        });
    }
    applyBrandInterval();
    if (toggleGreeting) {
        toggleGreeting.checked = localStorage.getItem('showGreeting') !== 'false';
        updateGreetingSettingsVisibility(toggleGreeting.checked, false);
        toggleGreeting.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target)
                return;
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
            if (!target)
                return;
            localStorage.setItem('greetingName', target.value);
            initBrand();
        });
    }
    if (greetingStyleSelect) {
        greetingStyleSelect.value = localStorage.getItem('greetingStyle') || '3d';
        greetingStyleSelect.addEventListener('change', (e) => {
            const target = getSelectTarget(e);
            if (!target)
                return;
            localStorage.setItem('greetingStyle', target.value);
            initBrand();
        });
    }
    if (configBtn && configPopup) {
        const updateState = await getUpdateNoticeState();
        if (updateState.pending) {
            pendingUpdateNoticeVersion = updateState.version || chrome.runtime.getManifest().version;
            if (document.body.classList.contains('loaded')) {
                showPendingUpdateNoticeIfAny();
            }
        }
        configBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopups(configPopup);
            configPopup.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            const targetNode = e.target;
            if (!targetNode)
                return;
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
    applyInitialBlurDisabled();
    applyInitialReducedEffectsState();
    if (toggleDisableAnimations) {
        toggleDisableAnimations.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target)
                return;
            animationsDisabled = target.checked;
            localStorage.setItem('animationsDisabled', String(target.checked));
            localStorage.removeItem('performanceModeEnabled');
            updateAnimationsDisabled(target.checked);
        });
    }
    if (toggleDisableBlur) {
        toggleDisableBlur.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target)
                return;
            blurDisabled = target.checked;
            localStorage.setItem('blurDisabled', String(target.checked));
            updateBlurDisabled(target.checked);
        });
    }
    if (toggleReducedEffects) {
        toggleReducedEffects.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target)
                return;
            reducedEffectsEnabled = target.checked;
            localStorage.setItem('reducedEffectsEnabled', String(reducedEffectsEnabled));
            if (!reducedEffectsEnabled) {
                if (toggleDisableAnimations)
                    toggleDisableAnimations.checked = false;
                animationsDisabled = false;
                localStorage.setItem('animationsDisabled', 'false');
                updateAnimationsDisabled(false);
                if (toggleDisableBlur)
                    toggleDisableBlur.checked = false;
                blurDisabled = false;
                localStorage.setItem('blurDisabled', 'false');
                updateBlurDisabled(false);
            }
            updateReducedEffectsVisibility(reducedEffectsEnabled);
        });
    }
    document.addEventListener('click', (e) => {
        const targetNode = e.target;
        if (!targetNode)
            return;
        document.querySelectorAll('.shortcut-dropdown.active').forEach(dropdown => {
            if (!dropdown.closest('.menu-wrapper')?.contains(targetNode)) {
                dropdown.classList.remove('active');
            }
        });
        syncShortcutDropdownState();
    });
    if (closeModalBtn)
        closeModalBtn.addEventListener('click', closeModal);
    [addModal, chooseTypeModal, addFolderModal].forEach((modal) => {
        modal?.addEventListener('click', (e) => {
            if (e.target === modal)
                closeModal();
        });
    });
    initCustomIconToggle();
    if (shortcutForm) {
        shortcutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputName = getInputById('inputName');
            const inputUrl = getInputById('inputUrl');
            const inputIcon = getInputById('inputIcon');
            if (!inputName || !inputUrl)
                return;
            let url = inputUrl.value || '';
            if (url && !/^https?:\/\//i.test(url))
                url = 'https://' + url;
            const newShortcut = {
                type: 'link',
                name: inputName.value,
                url: url,
                customIcon: inputIcon?.value || null
            };
            const targetArray = getActiveShortcutsList();
            if (editingIndex !== null && editingIndex >= 0) {
                targetArray[editingIndex] = { ...targetArray[editingIndex], ...newShortcut };
            }
            else {
                const limit = currentFolderId ? MAX_FOLDER_CAPACITY : Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);
                if (targetArray.length >= limit) {
                    showGridLimitWarning(limit, Boolean(currentFolderId));
                    return;
                }
                targetArray.push(newShortcut);
            }
            saveAndRender();
            editingIndex = null;
            closeModal();
        });
    }
    const btnChooseLink = document.getElementById('btnChooseLink');
    const btnChooseFolder = document.getElementById('btnChooseFolder');
    const closeChooseTypeBtn = document.getElementById('closeChooseTypeBtn');
    const closeFolderModalBtn = document.getElementById('closeFolderModalBtn');
    const folderForm = document.getElementById('folderForm');
    if (closeChooseTypeBtn)
        closeChooseTypeBtn.addEventListener('click', closeModal);
    if (closeFolderModalBtn)
        closeFolderModalBtn.addEventListener('click', closeModal);
    if (btnChooseLink) {
        btnChooseLink.addEventListener('click', () => {
            openShortcutModal(null);
        });
    }
    if (btnChooseFolder) {
        btnChooseFolder.addEventListener('click', () => {
            editingIndex = null;
            openFolderModal('', false);
        });
    }
    if (folderForm) {
        folderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const folderNameInput = inputFolderName;
            if (!folderNameInput)
                return;
            const targetArray = shortcuts;
            if (editingIndex !== null && editingIndex >= 0 && targetArray[editingIndex]) {
                targetArray[editingIndex] = { ...targetArray[editingIndex], name: folderNameInput.value };
            }
            else {
                const limit = allowedRows * 10;
                if (targetArray.length >= limit) {
                    showGridLimitWarning(limit, false);
                    return;
                }
                targetArray.push({
                    id: 'folder_' + Date.now().toString(),
                    type: 'folder',
                    name: folderNameInput.value,
                    children: []
                });
            }
            foldersEnabled = true;
            if (toggleFolders)
                toggleFolders.checked = true;
            localStorage.setItem('foldersEnabled', 'true');
            updateLauncherFooterVariant();
            saveAndRender();
            editingIndex = null;
            closeModal();
        });
    }
    if (rowsSelect) {
        rowsSelect.value = String(allowedRows);
        rowsSelect.addEventListener('change', (e) => {
            const target = getSelectTarget(e);
            if (!target)
                return;
            allowedRows = parseInt(target.value);
            localStorage.setItem('shortcutsRows', String(allowedRows));
            renderShortcuts();
        });
    }
    renderShortcuts();
    initSortable();
    bindExternalShortcutDrop();
    applyInitialShortcutsVisibility();
    applyInitialFoldersSetting();
    if (toggleShortcuts) {
        toggleShortcuts.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target)
                return;
            const isVisible = target.checked;
            updateShortcutsVisibility(isVisible);
            localStorage.setItem('shortcutsVisible', String(isVisible));
        });
    }
    if (toggleFolders) {
        toggleFolders.addEventListener('change', (e) => {
            const target = getInputTarget(e);
            if (!target)
                return;
            const wantsEnable = target.checked;
            if (!wantsEnable) {
                warningModal.show({
                    title: getLocalizedWarningText('warningDeleteFoldersTitle', 'Disable Folders?'),
                    message: getLocalizedWarningText('warningDeleteFoldersMessage', 'All folders and their shortcuts will be deleted. This cannot be undone unless you have a backup.'),
                    confirmText: getLocalizedWarningText('warningDeleteFoldersConfirm', 'Delete Folders'),
                    cancelText: getLocalizedWarningText('warningKeepEnabled', 'Keep Enabled'),
                    confirmVariant: 'danger',
                    onConfirm: () => {
                        shortcuts = shortcuts.filter((item) => item.type !== 'folder' && !Array.isArray(item.children));
                        foldersEnabled = false;
                        currentFolderId = null;
                        localStorage.setItem('foldersEnabled', 'false');
                        updateLauncherFooterVariant();
                        saveAndRender();
                    },
                    onCancel: () => {
                        target.checked = true;
                    }
                });
                return;
            }
            foldersEnabled = true;
            localStorage.setItem('foldersEnabled', 'true');
            updateLauncherFooterVariant();
        });
    }
    const toggleCompact = getById('toggleCompactBar');
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
    bindLauncherFolderButton();
    bindWallpaperFeature({
        applyInitialWallpaperState,
        toggleWallpaper,
        setWallpaperEnabled: (enabled) => { wallpaperEnabled = enabled; },
        getWallpaperEnabled: () => wallpaperEnabled,
        updateWallpaperUIState,
        applyWallpaperLogic,
        wallpaperOptions,
        wallpaperSourceSelect,
        overlayToggleBtn,
        overlaySliderContainer,
        overlaySlider,
        updateOverlaySliderProgress,
        setOverlayOpacity,
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
    if (languageSelect) {
        const savedLang = localStorage.getItem('userLanguage');
        const defaultLang = 'en_US';
        if (savedLang) {
            languageSelect.value = savedLang;
        }
        else {
            const optionExists = Array.from(languageSelect.options).some(o => o.value === defaultLang);
            languageSelect.value = optionExists ? defaultLang : (languageSelect.options[0]?.value || 'en');
        }
        languageSelect.addEventListener('change', (e) => {
            const target = getSelectTarget(e);
            if (!target)
                return;
            localStorage.setItem('userLanguage', target.value);
            location.reload();
        });
    }
    if (versionDisplay) {
        try {
            versionDisplay.textContent = `v${chrome.runtime.getManifest().version}`;
        }
        catch (e) {
            versionDisplay.textContent = 'Demo';
        }
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const backupData = {};
            APP_KEYS.forEach(key => {
                const value = localStorage.getItem(key);
                if (value !== null)
                    backupData[key] = value;
            });
            // Dedicated key with the complete shortcuts tree (folders + children shortcuts).
            backupData[SHORTCUTS_TREE_BACKUP_KEY] = localStorage.getItem('shortcuts') || '[]';
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
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(String(event.target.result || '{}'));
                    warningModal.show({
                        title: getLocalizedWarningText('warningRestoreBackupTitle', 'Restore Backup?'),
                        message: getLocalizedWarningText('warningRestoreBackupMessage', 'This will replace your current settings and shortcuts with the backup file data.'),
                        confirmText: getLocalizedWarningText('warningRestoreBackupConfirm', 'Restore'),
                        cancelText: getLocalizedWarningText('btnCancel', 'Cancel'),
                        confirmVariant: 'danger',
                        onConfirm: () => {
                            APP_KEYS.forEach(key => {
                                const value = data[key];
                                if (typeof value === 'string')
                                    localStorage.setItem(key, value);
                            });
                            const treeBackup = data[SHORTCUTS_TREE_BACKUP_KEY];
                            if (typeof treeBackup === 'string') {
                                localStorage.setItem('shortcuts', treeBackup);
                            }
                            location.reload();
                        }
                    });
                }
                catch (error) {
                    warningModal.show({
                        title: getLocalizedWarningText('warningInvalidBackupTitle', 'Invalid Backup File'),
                        message: getLocalizedWarningText('warningInvalidBackupMessage', 'The selected file is not a valid backup.'),
                        confirmText: getLocalizedWarningText('warningUnderstood', 'Understood'),
                        cancelText: getLocalizedWarningText('warningClose', 'Close'),
                        confirmVariant: 'accent',
                        onConfirm: () => { }
                    });
                }
                importInput.value = '';
            };
            reader.readAsText(file);
        });
    }
});
document.addEventListener('i18nReady', () => {
    console.log("Translations loaded. Starting interface...");
    showPendingUpdateNoticeIfAny();
    applyBrandInterval();
    renderShortcuts();
});
