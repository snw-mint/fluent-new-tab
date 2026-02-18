let shortcuts: Shortcut[] = [];
let editingIndex = -1;
try { shortcuts = (JSON.parse(localStorage.getItem('shortcuts') || '[]') as Shortcut[]) || []; }
catch (e) { shortcuts = []; }

let allowedRows = parseInt(localStorage.getItem('shortcutsRows') || '2');
let shortcutsVisible = localStorage.getItem('shortcutsVisible') !== 'false';

const savedTheme = (localStorage.getItem('theme') || 'auto') as ThemeMode;
const savedEngine = (localStorage.getItem('searchEngine') || 'bing') as keyof typeof engines;
let searchBarVisible = localStorage.getItem('searchBarVisible') !== 'false';
let suggestionsActive = localStorage.getItem('suggestionsEnabled') === 'true';
const suggestionsCache = new Map<string, string[]>();
let clearSearchEnabled = localStorage.getItem('clearSearchEnabled') === 'true';
let compactBarEnabled = localStorage.getItem('compactBarEnabled') === 'true';
let voiceSearchEnabled = localStorage.getItem('voiceSearchEnabled') === 'true';

const CACHE_KEY = 'fluent_weather_cache';
const CITY_KEY = 'fluent_city_data';
const CACHE_DURATION = 3600000;

let weatherEnabled = localStorage.getItem('weatherEnabled') === 'true';
let weatherUnit = (localStorage.getItem('weatherUnit') || 'c') as WeatherUnit;
let currentCityData: CityData = { name: 'New York', lat: 40.71, lon: -74.01 };
try {
    const saved = localStorage.getItem(CITY_KEY);
    if (saved) currentCityData = JSON.parse(saved) as CityData;
} catch (e) { console.error('Error reading saved city'); }

let launcherEnabled = localStorage.getItem('launcherEnabled') === 'true';
let currentProvider = (localStorage.getItem('launcherProvider') || 'microsoft') as keyof typeof launcherData;

let wallpaperEnabled = localStorage.getItem('wallpaperEnabled') === 'true';
let currentWallpaperSource = (localStorage.getItem('wallpaperSource') || 'local') as WallpaperSource;
let currentWallpaperType = (localStorage.getItem('wallpaperType') || 'preset') as WallpaperType;
let currentWallpaperValue = localStorage.getItem('wallpaperValue') || 'preset_1';
