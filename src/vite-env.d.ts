/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORE?: 'chrome' | 'edge' | 'firefox';
  readonly VITE_STORE_RATE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
