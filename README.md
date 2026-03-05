# Fluent New Tab &nbsp; [ ![lastest version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsnw-mint%2Ffluent-new-tab%2Frefs%2Fheads%2Fmain%2Fmanifest.json&query=version&style=flat&label=latest%20version&color=%230078D4) ](https://github.com/snw-mint/fluent-new-tab/releases) [ ![last commit](https://img.shields.io/github/last-commit/snw-mint/fluent-new-tab?color=%230078D4) ](https://github.com/snw-mint/fluent-new-tab/activity) [ ![license](https://img.shields.io/badge/GPLv3-message?style=flat&label=license&color=%230078D4) ](https://github.com/snw-mint/fluent-new-tab?tab=GPL-3.0-1-ov-file)

![Fluent New Tab Mockup](repo-assets/mockup.png)

<p align="center">
  <strong>A modern new tab inspired by Microsoft's Fluent Design.</strong>
</p>

<p align="center">
  <a href="https://microsoftedge.microsoft.com/addons/detail/fluent-new-tab/hcohjkajcimobdddlnfnfhdfnbapondc">Add to Browser</a> •
  <a href="https://github.com/snw-mint/fluent-new-tab/releases">Installation</a> •
  <a href="https://snw-mint.github.io/fluent-new-tab/privacy.html">Privacy</a> •
  <a href="CONTRIBUTING.md">Contributing</a> •
  <a href="TRANSLATING.md">Help translate</a>
</p>


## Why choose Fluent New Tab?

- Minimal, lightweight layout focused on productivity.
- Built-in launcher for Microsoft 365, Google Workspace, and Proton.
- Fast search with voice input and optional suggestions.
- Unlimited shortcuts with automatic high-quality favicons.
- Adaptive theme: Light, Dark, or System.
- Privacy-first: no tracking or telemetry.

More details on the [official website.](https://snw-mint.github.io/fluent-new-tab/)


## Installation

The easiest option is the official store, with automatic updates.

<a href="https://microsoftedge.microsoft.com/addons/detail/fluent-new-tab/hcohjkajcimobdddlnfnfhdfnbapondc" style="display:inline-block;margin:0 0px;">
  <img src="repo-assets/download-edge.svg" width="200"/>
</a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/fluent-new-tab" style="display:inline-block;margin:0 0px;">
  <img src="repo-assets/download-firefox.svg" width="200"/>
</a>
<a href="https://github.com/snw-mint/fluent-new-tab/releases" style="display:inline-block;margin:0 0px;">
  <img src="repo-assets/download-github.svg" width="200"/>
</a>

### Manual installation
For the latest version:
1. Download the latest `.zip` from the Releases Page.
2. Unzip the file.
3. Open `edge://extensions` in your browser.
4. Enable **Developer Mode**.
5. Click **Load Unpacked** and select the unzipped folder.

## Local development (TypeScript + SCSS)
This project uses a build step.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build extension files:
   ```bash
   npm run build
   ```
3. In `edge://extensions`, click **Load unpacked** and select the `dist/` folder.

Source files are in `src/`:
- `src/script.ts` → `dist/script.js`
- `src/style.scss` → `dist/style.css`

Runtime files (`script.js` and `style.css`) are generated only in `dist/`.

## Support the project
- GitHub Sponsors: https://github.com/sponsors/snw-mint
- Ko-fi: https://ko-fi.com/snwmint


## Privacy

Fluent New Tab follows a local-first approach.

- No analytics or tracking.
- Settings stored locally (`localStorage`) with optional backup in `chrome.storage.local`.
- Uploaded wallpapers saved in IndexedDB.
- External requests only for required features (weather, wallpapers, favicons, optional suggestions).

See the Privacy Policy for details.

## Contributing

Contributions are welcome.

- Translators: read the [Translation Guide](TRANSLATING.md).
- Developers: read the [Developer Guide](CONTRIBUTING.md).


## License and legal notice

GPL-3.0 license (effective 18/02/2026).

Forks/distributions must use a different name and logo, and be clearly marked as forks.

All trademarks belong to their respective owners. No affiliation or endorsement by Microsoft, Google, or Proton AG.