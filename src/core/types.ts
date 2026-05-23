/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file defines various TypeScript interfaces and type aliases used throughout the application
 * to ensure type safety and consistency.
 */

interface ChromeLike {
  i18n: {
    getMessage: (messageName: string, substitutions?: string[]) => string;
  };
  runtime: {
    getManifest: () => { version: string };
    getURL: (path: string) => string;
  };
  storage?: {
    local?: {
      get: (
        keys: string | string[] | Record<string, unknown> | null,
        callback: (items: Record<string, unknown>) => void,
      ) => void;
      set: (items: Record<string, unknown>, callback?: () => void) => void;
    };
  };
  action?: {
    setBadgeText: (details: { text: string; tabId?: number }) => void;
    setBadgeBackgroundColor: (details: {
      color: string;
      tabId?: number;
    }) => void;
  };
  search: {
    query: (options: { text: string }, callback?: () => void) => void;
  };
  permissions: {
    contains: (
      permissions: { permissions: string[] },
      callback: (result: boolean) => void,
    ) => void;
    request: (
      permissions: { permissions: string[] },
      callback?: (granted: boolean) => void,
    ) => void;
  };
}

interface SortableLike {
  create: (
    element: HTMLElement,
    options: {
      animation?: number;
      forceFallback?: boolean;
      dragClass?: string;
      ghostClass?: string;
      filter?: string;
      handle?: string;
      delay?: number;
      delayOnTouchOnly?: boolean;
      touchStartThreshold?: number;
      onStart?: () => void;
      onEnd?: (evt: { oldIndex: number; newIndex: number }) => void;
    },
  ) => unknown;
}

export declare const chrome: ChromeLike;
export declare const Sortable: SortableLike;

interface Window {
  getTranslation: (key: string) => string;
}

type ShortcutItemType = 'link' | 'folder';

export interface Shortcut {
  id?: string;
  type?: ShortcutItemType;
  name: string;
  url?: string;
  customIcon?: string | null;
  children?: Shortcut[];
}

export interface EngineConfig {
  url: string;
  icon: string;
}

interface Window {
  loadTranslations?: () => void | Promise<void>;
  applyTranslations?: () => void;
  getTranslation: (key: string) => string;
}

interface LauncherApp {
  name: string;
  url: string;
  icon: string;
}

export interface LauncherProviderData {
  apps: LauncherApp[];
  allAppsLink: string;
}

export interface CityData {
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

export interface WeatherApiResponse {
  current_weather?: WeatherCurrent;
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface BingWallpaperItem {
  fullUrl?: string;
  imageUrl?: string;
  url?: string;
  copyright?: string;
}

export interface NasaApodResponse {
  media_type?: string;
  hdurl?: string;
  url?: string;
  title?: string;
  thumbnail_url?: string;
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

export type SuggestionApiResponse = [string, string[]];

interface WeatherCache {
  timestamp: number;
  city: string;
  data: WeatherApiResponse;
}

type BackupPayload = Record<string, string | undefined>;

export interface WallpaperCacheEntry {
  url?: string;
  date?: string;
  credit?: string;
  creditUrl?: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type WeatherUnit = 'c' | 'f';
export type WallpaperSource = 'local' | 'api';
export type WallpaperType = 'upload' | 'bing' | 'nasa' | 'wikimedia';
