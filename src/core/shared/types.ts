/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

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
  country_code?: string;
  admin1?: string;
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

export interface WallpaperCacheEntry {
  url?: string;
  date?: string;
  credit?: string;
  creditUrl?: string;
  creditHtml?: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type WeatherUnit = 'c' | 'f';
export type WallpaperSource = 'local' | 'api';
export type WallpaperType = 'upload' | 'bing' | 'wikimedia' | 'unsplash' | 'pexels';

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  imageUrl?: string;
  feedTitle?: string;
}

export interface FeedData {
  url: string;
  title: string;
  items: FeedItem[];
  updatedAt: number;
}

