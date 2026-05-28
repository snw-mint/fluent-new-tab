/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { EngineConfig } from '@/core/shared/types';

export const engines: Record<string, EngineConfig> = {
  system: {
    url: '',
    icon: 'assets/search-engines/system.svg',
  },
  bing: {
    url: 'https://www.bing.com/search',
    icon: 'assets/search-engines/bing.svg',
  },
  google: {
    url: 'https://www.google.com/search',
    icon: 'assets/search-engines/google.svg',
  },
  brave: {
    url: 'https://search.brave.com/search',
    icon: 'assets/search-engines/brave.svg',
  },
  duck: {
    url: 'https://duckduckgo.com/',
    icon: 'assets/search-engines/ddg.svg',
  },
  ecosia: {
    url: 'https://www.ecosia.org/search',
    icon: 'assets/search-engines/ecosia.svg',
  },
  startpage: {
    url: 'https://www.startpage.com/sp/search',
    icon: 'assets/search-engines/startpg.svg',
  },
  kagi: {
    url: 'https://kagi.com/search?q=',
    icon: 'assets/search-engines/kagi.svg',
  },
};
