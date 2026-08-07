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

export const aiEngines: Record<string, { name: string; url: string; icon: string }> = {
  'google-ai': {
    name: 'Google AI Mode',
    url: 'https://www.google.com/search?q=%s&udm=50',
    icon: 'assets/search-ai/google-ai.svg',
  },
  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chatgpt.com/?prompt=%s',
    icon: 'assets/search-ai/chatgpt.svg',
  },
  grok: {
    name: 'Grok',
    url: 'https://grok.com/?q=%s',
    icon: 'assets/search-ai/grok.svg',
  },
  claude: {
    name: 'Claude',
    url: 'https://claude.ai/new?q=%s',
    icon: 'assets/search-ai/claude.svg',
  },
  perplexity: {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai/search?q=%s',
    icon: 'assets/search-ai/perplexity.svg',
  },
  'duckduckgo-ai': {
    name: 'Duck.AI',
    url: 'https://duckduckgo.com/?q=%s&ia=chat',
    icon: 'assets/search-ai/duck-ai.svg',
  },
};
