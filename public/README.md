# Public Directory

Welcome to the `public/` directory! Unlike the `src/` folder where files are processed and bundled by Vite, everything in this directory is **copied directly** to the root of the final build (`dist/`) exactly as it is.

These are static assets, standalone pages, and early-boot scripts that need to be immediately available to the browser.

---

## Folder Structure

Here is how our static assets and public files are organized:

```text
└── public/
    ├── README.md
    ├── setup/
    │   ├── setup.css
    │   ├── setup.html
    │   ├── setup.js
    │   └── icons/
    │       ├── apps.svg
    │       ├── code.svg
    │       ├── init.svg
    │       ├── restore.svg
    │       ├── skip.svg
    │       ├── start.svg
    │       ├── support.svg
    │       └── theme.svg
    ├── scripts/
    │   ├── i18n.js
    │   └── theme-loader.js
    └── assets/
        ├── icon-128.png
        ├── icon-16.png
        ├── icon-32.png
        ├── icon-48.png
        ├── sfx/
        │   ├── ai-sfx.webm
        │   └── mic-ready.webm
        ├── search-engines/
        │   ├── bing.svg
        │   ├── brave.svg
        │   ├── ddg.svg
        │   ├── ecosia.svg
        │   ├── google.svg
        │   ├── kagi.svg
        │   ├── startpg.svg
        │   └── system.svg
        ├── icons/
        │   ├── check.svg
        │   ├── dimiss.svg
        │   └── update.svg
        ├── weather/
        │   ├── standart/
        │   │   ├── clear_night.svg
        │   │   ├── cloudy.svg
        │   │   ├── drizzle.svg
        │   │   ├── fog.svg
        │   │   ├── hail_day.svg
        │   │   ├── hail_night.svg
        │   │   ├── partly_cloudy_day.svg
        │   │   ├── partly_cloudy_night.svg
        │   │   ├── rain.svg
        │   │   ├── rain_showers_day.svg
        │   │   ├── rain_showers_night.svg
        │   │   ├── rain_snow.svg
        │   │   ├── snow.svg
        │   │   ├── snow_showers_day.svg
        │   │   ├── snow_showers_night.svg
        │   │   ├── sunny.svg
        │   │   └── thunderstorm.svg
        │   └── alerts/
        │       ├── pollen_high.svg
        │       ├── storm.svg
        │       ├── temp_drop.svg
        │       ├── temp_rise.svg
        │       ├── uv_high.svg
        │       └── wind_high.svg
        └── apps/
            ├── proton/
            │   ├── calendar.svg
            │   ├── docs.svg
            │   ├── drive.svg
            │   ├── lumo.svg
            │   ├── mail.svg
            │   ├── pass.svg
            │   ├── sheets.svg
            │   ├── vpn.svg
            │   └── wallet.svg
            ├── microsoft/
            │   ├── clip.svg
            │   ├── copilot.svg
            │   ├── excel.svg
            │   ├── onedrive.svg
            │   ├── onenote.svg
            │   ├── outlook.svg
            │   ├── ppt.svg
            │   ├── teams.svg
            │   └── word.svg
            └── google/
                ├── calendar.svg
                ├── docs.svg
                ├── drive.svg
                ├── gemini.svg
                ├── keep.svg
                ├── mail.svg
                ├── music.svg
                ├── sheet.svg
                └── youtube.svg
```

---

## What Does Each File/Folder Do?

### 1. `setup/` (Out-of-Box Experience)

This folder contains the **First Time Setup** page. It runs completely independently of the main app.

- **`setup.html`**: The UI for the initial onboarding flow.
- **`setup.css` & `setup.js`**: Standalone styles and logic to configure initial user preferences (like theme, name, and favorite search engine) before they load the new tab page for the first time.
- **`icons/`**: Specific SVGs used only during this onboarding process.

### 2. `scripts/` (Early Boot Scripts)

These are vanilla JavaScript files loaded directly in the HTML `<head>` to prevent flickering or layout shifts.

- **`theme-loader.js`**: Executes immediately to check `localStorage` and apply the correct Dark/Light theme before the page renders, preventing a white flash.
- **`i18n.js`**: Handles immediate translation strings before the main UI components load.

### 3. `assets/` (Static Resources)

All static multimedia and icon resources used by the extension.

- **`icon-*.png`**: The core extension icons used by the browser for the toolbar and extension management pages (these are referenced directly in `manifest.json`).
- **`sfx/`**: Sound effects in lightweight `.webm` format for specific interactions (e.g., microphone ready, AI actions).
- **`search-engines/`**: Crisp SVG logos for all supported search engine providers in the search bar.
- **`icons/`**: General static SVGs used across the UI (like checkmarks or update badges).
- **`weather/`**: Comprehensive weather icons covering both standard conditions (sunny, rainy, snowy) and special alerts (pollen, UV, storms).
- **`apps/`**: The app launcher icons. Organized neatly by provider (`microsoft`, `google`, `proton`). Everything is stored as vector SVGs to ensure perfect scaling on high-DPI displays.

---

## How it Works in Production

When `npm run build` is executed, Vite simply **copies** the entire contents of the `public/` directory into the root of the output `dist/` folder.

For example, `public/assets/apps/google/mail.svg` becomes available to the extension at `chrome-extension://<id>/assets/apps/google/mail.svg` (or by the relative path `/assets/apps/google/mail.svg`). This allows the manifest file and raw HTML to reference these files predictably without worrying about bundler hashing or missing assets.
