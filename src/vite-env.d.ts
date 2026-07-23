/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORE?: 'chrome' | 'edge' | 'firefox';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
