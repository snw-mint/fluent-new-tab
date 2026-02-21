# Fluent New Tab &nbsp; ![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsnw-mint%2Ffluent-new-tab%2Frefs%2Fheads%2Fmain%2Fmanifest.json&query=version&style=plastic&logo=github&label=latest%20version&color=red) ![GitHub last commit](https://img.shields.io/github/last-commit/snw-mint/fluent-new-tab?display_timestamp=author&style=plastic&logoColor=FFF&color=orange) ![Static Badge](https://img.shields.io/badge/GPLv3-message?style=plastic&label=license&color=yellow) ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/snw-mint/fluent-new-tab?style=plastic&color=green)

![Fluent New Tab Mockup](repo-assets/mockup.png)

<p align="center">
  <strong>A beautiful, modern new tab inspired by Microsoft's Fluent Design.</strong>
</p>

<p align="center">
  <a href="https://microsoftedge.microsoft.com/addons/detail/fluent-new-tab/hcohjkajcimobdddlnfnfhdfnbapondc">Add to Browser</a> •
  <a href="https://github.com/snw-mint/fluent-new-tab">View on GitHub</a> •
  <a href="https://github.com/snw-mint/fluent-new-tab/releases">Installation</a> •
  <a href="https://snw-mint.github.io/fluent-new-tab/privacy.html">Privacy</a> •
  <a href="CONTRIBUTING.md">Contributing</a> •
  <a href="TRANSLATING.md">Help translate</a>
</p>

---

## ✨ Why choose Fluent New Tab?

- Minimalist and lightweight layout that keeps focus on your work.
- Built-in launcher for Microsoft 365, Google Workspace, and Proton apps.
- Fast web search with voice input and optional suggestions.
- Unlimited shortcuts with automatic high-quality favicons.
- Adaptive theming: Light, Dark, or follow your system.
- Privacy first: no tracking, no telemetry, everything stored locally.

---

## 🧭 Core features

### Productivity Hub
- Launch your favorite apps and sites from one place.
- Fast search bar with multiple engines.
- Customizable shortcuts grid.

### Immersive and aesthetic
- Custom wallpapers (local or web) with Fluent-inspired polish.
- Light, Dark, or system theme modes with smooth transitions.
- Personalized greetings to make the tab feel yours.

### Everyday utilities
- Real-time weather widget (Open-Meteo).
- Voice search support.
- Search suggestions when you want them.

### More powerful details
- Backup and restore your settings with ease.
- Reduce motion mode for low-end devices.
- Multi-language interface via community translations.

---

## 📥 Installation

### Microsoft Add-ons
The easiest way to install is via the official store. Updates are automatic.

<a href="https://microsoftedge.microsoft.com/addons/detail/fluent-new-tab/hcohjkajcimobdddlnfnfhdfnbapondc">
  <img src="https://get.microsoft.com/images/en-us%20light.svg" width="200"/>
</a>

> ⚠️ Updates to Microsoft add-ons may take up to 7 business days to appear after a release.

### Manual installation
For the absolute latest version:
1. Download the latest `.zip` from the Releases Page.
2. Unzip the file.
3. Go to `edge://extensions` in your browser.
4. Enable **Developer Mode**.
5. Click **Load Unpacked** and select the unzipped folder.

---

## 🛠️ Local development (TypeScript + SCSS)
This project now uses a build step.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build extension files:
   ```bash
   npm run build
   ```
3. In `edge://extensions`, click **Load unpacked** and select the `dist/` folder.

Source files live in `src/`:
- `src/script.ts` → `dist/script.js`
- `src/style.scss` → `dist/style.css`

Runtime files (`script.js` and `style.css`) are generated in `dist/` only.

---

## ❤️ Support the project
- GitHub Sponsors: https://github.com/sponsors/snw-mint
- Ko-fi: https://ko-fi.com/snwmint

---

## 🛡️ Privacy

Your privacy is paramount. Fluent New Tab operates with a local-first philosophy.

- No analytics or tracking.
- Preferences stored locally (`localStorage`) with optional backups in `chrome.storage.local`.
- Uploaded wallpapers saved in IndexedDB.
- External requests only for required features (Open-Meteo weather, wallpaper providers, favicons, optional suggestions).

See the full Privacy Policy for details.

---

## 🤝 Contributing

Contributions are always welcome!

- Translators: read the [Translation Guide](TRANSLATING.md).
- Developers: read the [Developer Guide](CONTRIBUTING.md).

---

## ⚖️ License and legal notice

The source code of this project is licensed under the GPL-3.0 license effective 18/02/2026.

If you choose to fork or distribute this project, you must use a different name and logo. Please ensure your version is clearly marked as a fork to avoid confusion with the original project.

**Trademarks disclaimer:**
The trademarks, logos, and service marks (collectively the "Trademarks") displayed in this project (including but not limited to Microsoft Edge, Google, and Proton) are registered trademarks of their respective owners.

- Microsoft 365 icons: Microsoft, Outlook, Word, Excel, PowerPoint, OneDrive, OneNote, Teams, To Do, and Copilot are trademarks of Microsoft Corporation.
- Google Workspace icons: Google, Gmail, YouTube, Drive, Calendar, Maps, Photos, Meet, Docs, and Sheets are trademarks of Google LLC.
- Proton suite icons: Proton Mail, Calendar, Drive, VPN, Pass, Wallet, and Docs are trademarks of Proton AG.

This project is not affiliated with, endorsed by, or sponsored by Microsoft, Google, or Proton AG. These assets are used for identification purposes only under Fair Use.