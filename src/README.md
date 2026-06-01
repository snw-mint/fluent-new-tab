# Source Code Architecture

Welcome to the `src/` directory! This is the heart of **Fluent New Tab**. We recently migrated to a modern **ES Modules (ESM)** architecture using **Vite**, optimizing for performance through **lazy loading** and strict module scoping.

This document explains our folder structure, how files interact, and how the final build is generated.

---

## 📂 Folder Structure

Here is a high-level view of how our code is organized:

```text
└── src/
    ├── README.md
    ├── style.scss
    ├── styles/
    │   ├── _animations.scss
    │   ├── _color.scss
    │   ├── _header-controls.scss
    │   ├── _launcher.scss
    │   ├── _layout.scss
    │   ├── _mixins.scss
    │   ├── _modals.scss
    │   ├── _reset-base.scss
    │   ├── _search.scss
    │   ├── _settings.scss
    │   ├── _shortcuts.scss
    │   ├── _variables.scss
    │   ├── _wallpaper-credits.scss
    │   ├── _widgets.scss
    │   └── _surface-tint.scss
    └── core/
        ├── ui/
        │   ├── drag-drop.ts
        │   ├── fluent-select.ts
        │   ├── launcher-data.ts
        │   ├── launcher.ts
        │   ├── localization.ts
        │   ├── search-manager.ts
        │   ├── settings.ts
        │   ├── shortcuts-manager.ts
        │   ├── tab-customization.ts
        │   └── ui-components.ts
        ├── shared/
        │   ├── dom-refs.ts
        │   ├── dom-utils.ts
        │   ├── icons.ts
        │   ├── permissions.ts
        │   ├── state.ts
        │   └── types.ts
        ├── lazy/
        │   ├── backup.ts
        │   ├── color-extractor.ts
        │   ├── color-picker.ts
        │   ├── search-features.ts
        │   ├── wallpaper-engine.ts
        │   ├── visual-search.ts
        │   ├── wallpaper-storage.ts
        │   └── providers/
        │       ├── wallpaper-apis.ts
        │       └── weather-api.ts
        └── boot/
            ├── display.ts
            ├── main.ts
            ├── search-engines.ts
            ├── search.ts
            ├── shortcuts-render.ts
            ├── theme.ts
            ├── wallpaper-render.ts
            └── weather-render.ts
```

---

## 🧩 What Does Each File/Folder Do?

### 1. `styles/` & `style.scss`

- **`style.scss`**: The main entry point for all stylesheets. It imports all the partials.
- **`styles/_*.scss`**: SCSS partials broken down by component. We use variables extensively for our Fluent Design system and Dark Mode. Everything strictly uses `rem` units for consistency and proper scaling.

### 2. `core/boot/`

These are the **entry point** scripts. They run immediately when the extension loads.

- **`main.ts`**: The root bootstrapper that initializes the app.
- **`*_render.ts`** & **`theme.ts`**: Handles the immediate rendering of UI elements (wallpapers, weather, shortcuts, theme) to ensure the New Tab loads instantly without layout shifts.
- **`search.ts` / `search-engines.ts`**: Initializes core search functionality and engines right away.

### 3. `core/shared/`

These files contain global constants, types, and utilities shared across the entire app.

- **`state.ts`**: The single source of truth for global state.
- **`dom-refs.ts` & `dom-utils.ts`**: Cached DOM element queries and safe DOM manipulation utilities to prevent reflows and ensure CSP compliance.
- **`icons.ts`**: Exports our SVGs and icon-related utilities.
- **`types.ts`**: Global TypeScript interfaces.
- **`permissions.ts`**: Centralized logic for browser API permissions.

### 4. `core/ui/`

Handles the interactive user interface and components.

- **`launcher.ts` & `launcher-data.ts`**: Manages the app launcher grid and its default data.
- **`settings.ts`**: The main settings modal logic.
- **`drag-drop.ts`**: Logic for reordering elements (like shortcuts) safely.
- **`fluent-select.ts`**: Custom styled dropdowns matching the Fluent Design language.
- **`localization.ts`**: Multi-language support and string replacements.

### 5. `core/lazy/`

Modules placed here are **NOT** loaded when the extension starts. They are dynamically imported only when the user interacts with a specific feature.

- **`wallpaper-engine.ts` & `wallpaper-storage.ts`**: Heavy logic for processing images and IndexedDB, loaded only when changing or processing wallpapers.
- **`color-extractor.ts` & `color-picker.ts`**: Loaded only when customizing theme colors.
- **`search-features.ts`**: Extended search capabilities loaded on demand.
- **`providers/`**: External API fetching logic for wallpapers (`wallpaper-apis.ts`) and weather (`weather-api.ts`).

---

## 🔄 Imports and Exports (ES Modules)

With our new ESM structure, everything is strictly scoped.

- **Static Imports:** Use standard `import { functionName } from '../shared/utils'` for core features needed at boot.
- **State Management:** Never use global `window.state` variables. Always import shared state directly from `core/shared/state.ts` so all modules reference the same memory context.
- **Dynamic Imports (Lazy Loading):** When calling heavy logic (e.g., opening the settings modal or processing an image), use dynamic imports to keep the initial load time as low as possible. This is crucial for a New Tab extension.

  ```typescript
  document
    .getElementById('settings-btn')
    .addEventListener('click', async () => {
      const { initSettings } = await import('../lazy/settings.js');
      initSettings();
    });
  ```

---

## 🚀 Production Build (`dist/` Output)

When you run `npm run build`, Vite takes everything in `src/` and optimizes it into the `dist/` folder:

1. **Tree Shaking:** Any unused exports or dead code are stripped out entirely.
2. **Minification:** TypeScript is compiled to pure JavaScript and minified to save space. SCSS is compiled to a single, minified `style.css`.
3. **Code Splitting (Chunks):**
   - Files in `core/boot/`, `core/shared/`, and `core/ui/` are bundled into a fast, highly optimized main chunk.
   - Files in `core/lazy/` are split into **separate chunk files** (e.g., `chunk-xyz.js`). These chunks sit in the `dist/` folder and are only requested by the browser when the user triggers that specific feature. This prevents blocking the main thread during the critical initial render.
4. **Manifest Ready:** The final output is fully compliant with Manifest V3 and Content Security Policies, ready to be loaded as a browser extension.
