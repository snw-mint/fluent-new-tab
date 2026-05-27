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
