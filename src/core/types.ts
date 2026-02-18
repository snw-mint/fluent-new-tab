interface ChromeLike {
    i18n: {
        getMessage: (messageName: string, substitutions?: string[]) => string;
    };
    runtime: {
        getManifest: () => { version: string };
    };
    storage?: {
        local?: {
            get: (
                keys: string | string[] | Record<string, unknown> | null,
                callback: (items: Record<string, unknown>) => void
            ) => void;
            set: (items: Record<string, unknown>, callback?: () => void) => void;
        };
    };
}

interface SortableLike {
    create: (element: HTMLElement, options: {
        animation?: number;
        forceFallback?: boolean;
        dragClass?: string;
        ghostClass?: string;
        filter?: string;
        onEnd?: (evt: { oldIndex: number; newIndex: number }) => void;
    }) => unknown;
}

declare const chrome: ChromeLike;
declare const Sortable: SortableLike;

interface Window {
    getTranslation: (key: string) => string;
}

interface Shortcut {
    name: string;
    url: string;
    customIcon: string | null;
}

interface EngineConfig {
    url: string;
    icon: string;
}

interface LauncherApp {
    name: string;
    url: string;
    icon: string;
}

interface LauncherProviderData {
    apps: LauncherApp[];
    allAppsLink: string;
}

interface CityData {
    name: string;
    lat: number;
    lon: number;
    country?: string;
}

interface WeatherCurrent {
    temperature: number;
    weathercode: number;
    is_day: number;
}

interface WeatherApiResponse {
    current_weather?: WeatherCurrent;
}

interface GeocodingResult {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
}

interface GeocodingResponse {
    results?: GeocodingResult[];
}

interface BingWallpaperItem {
    fullUrl?: string;
    imageUrl?: string;
    url?: string;
    copyright?: string;
}

interface NasaApodResponse {
    media_type?: string;
    hdurl?: string;
    url?: string;
    title?: string;
}

interface WikimediaImageInfo {
    url: string;
    extmetadata?: {
        Artist?: { value?: string };
    };
}

interface WikimediaPage {
    imageinfo?: WikimediaImageInfo[];
}

interface WikimediaQueryResponse {
    query?: {
        pages?: Record<string, WikimediaPage>;
    };
}

type SuggestionApiResponse = [string, string[]];

interface WeatherCache {
    timestamp: number;
    city: string;
    data: WeatherApiResponse;
}

type BackupPayload = Record<string, string | undefined>;

interface WallpaperCacheEntry {
    url?: string;
    date?: string;
    timestamp?: number;
    credit?: string;
}

type ThemeMode = 'light' | 'dark' | 'auto';
type WeatherUnit = 'c' | 'f';
type WallpaperSource = 'local' | 'api';
type WallpaperType = 'preset' | 'upload' | 'bing' | 'nasa' | 'wikimedia';
