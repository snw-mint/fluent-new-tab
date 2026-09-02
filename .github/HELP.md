# Help & Features Guide

Welcome to the Fluent New Tab documentation. This guide details all features, settings, widgets, and customization options available in the extension.

#### Table of Contents

- [Theme & Appearance](#theme--appearance)
- [Wallpaper](#wallpaper)
- [Display Widget](#display-widget)
- [Weather](#weather)
- [Shortcuts & Folders](#shortcuts--folders)
- [App Launcher](#app-launcher)
- [RSS Feed Reader](#rss-feed-reader)
- [Search](#search)
- [Accessibility & Performance](#accessibility--performance)
- [Utilities & Data Backup](#utilities--data-backup)

---

## Theme & Appearance

Located at the top of the settings panel, you can customize the general color palette and branding of your new tab page.

### Color Modes

- **Light Mode**: Clean, bright interface based on standard Fluent Design light tones.
- **Dark Mode**: High-contrast dark palette designed to reduce eye strain in low-light environments.
- **Auto (System)**: Automatically synchronizes the theme with your operating system light/dark settings.

### Accent Color

Customize the primary highlight color used across buttons, switches, active indicators, and focus rings:

- **Presets**: Quick access to signature colors (PowerPoint Red, PowerBI Yellow, Excel Green, and Windows Blue).
- **Auto (Extract from Wallpaper)**: Automatically analyzes your current wallpaper and extracts the dominant accent color for a harmonious look.
- **Custom Color Picker**: Opens an interactive color matrix with hue slider, hex codes, and RGB inputs to set any custom color.

### Surface Tint

When enabled under More Options, applies a soft accent-colored tint across backgrounds, menus, cards, and modal dialogs.

### Tab Customization

- **Tab Name**: Define a custom title for the browser tab instead of the default title.
- **Tab Icon (Favicon)**: Set a custom tab favicon using a web URL or by uploading a local image file (.png, .jpg, .webp, .ico). Note: Favicon customization is not displayed on Microsoft Edge due to browser restrictions.

---

## Wallpaper

Control the background appearance of your new tab page. When toggled off, a solid background matching your active theme is displayed.

### Built-in & Custom Upload

Upload personal image files (.png, .jpeg, .webp) directly from your device. Images are automatically processed and stored locally in your browser storage.

### Dynamic Online Sources

Automatically fetch high-resolution daily wallpapers from popular curated repositories:

- **Bing**: Bing Daily Image with daily updates.
- **NASA (APOD)**: NASA Astronomy Picture of the Day.
- **Wikimedia Commons**: Featured Picture of the Day.
- **Unsplash**: High-quality curated photography.
- **Pexels**: Curated landscape and aesthetic photography.

### Wallpaper Credits

When using dynamic online sources, a credit badge in the bottom-left corner displays the photographer or creator attribution and a direct link to the source.

### Image Overlay Opacity

Adjust background darkness and contrast using a dedicated slider (0% to 100%). This ensures shortcuts, text, and search widgets remain legible over bright or busy wallpapers.

---

## Display Widget

The central display widget supports multiple modes and layout arrangements.

### Widget Modes

- **Greeting**: Displays a welcoming message that adapts to the time of day (morning, afternoon, evening, night) or the day of the week.
- **Time**: Digital clock showing current time.
- **Date**: Shows current date formatted according to your selected locale.
- **Time & Date**: Combined compact view showing both current time and date together.

### Greeting Options

- **Your Name**: Personalize the greeting text with your name.
- **Highlight Name**: Emphasizes your name with the active accent color.
- **Emoji Type**: Choose between **None**, **Static** 3D Fluent emojis, or **Animated** Fluent emojis.

### Time & Date Options

- **12-Hour Format**: Toggle between standard 12-hour (AM/PM) and 24-hour military format.
- **Show Seconds**: Display live seconds in the clock widget.
- **Date Format**: Choose between Written format (e.g., Tuesday, September 2), Numeric format (e.g., 09/02/2026), or Weekday format.

### Display Scale

Use the scale slider (50% to 200%) in the settings panel to resize the central display widget independently from the rest of the interface.

---

## Weather

A dedicated weather widget in the top-right header that displays live local meteorological data powered by Open-Meteo.

### Location Setup

Enter your city name in the input field and search. An autocomplete dropdown powered by live geocoding allows you to select your exact location.

### Temperature Unit

Toggle between Celsius (°C) and Fahrenheit (°F). Conversions update immediately without needing to reload.

### Weather Alerts

Enable notifications and visual badges for severe weather warnings when alerts are issued for your location.

---

## Shortcuts & Folders

Manage your quick-access bookmarks grid located below the search bar.

### Grid Rows

Adjust the visible grid capacity from 1 to 4 rows (holding up to 40 items on the main page). If the shortcuts feature is toggled off, the entire shortcuts grid is hidden for a minimalist look.

### Folders Support

Group related links into folders. Each folder holds up to 39 shortcuts. You can name each folder and assign custom icons (including support for Icon11 Community icons).

### Drag & Drop Reordering

- Drag shortcuts across the grid to reorder them in real time.
- Drag any shortcut over a folder card to drop it inside.
- Drag shortcuts out of an open folder to move them back to the main grid.
- Drag bookmarks directly from your browser favorites bar and drop them onto the grid or into folders.

### Visual Styling

- **Hide Names**: Hide text labels under shortcut icons for an icon-only clean aesthetic.
- **Corner Radius**: Adjust the slider (-100% to +100%) to change shortcut tile corners from sharp squares to smooth pills or circles.
- **Import Bookmarks**: One-click option to import bookmarks directly from your browser into the shortcuts grid.

---

## App Launcher

A floating drawer on the left side of the screen providing rapid access to productivity ecosystems.

### Ecosystem Providers

Select your primary productivity ecosystem:

- **Microsoft 365**: Quick links for Word, Excel, PowerPoint, Outlook, OneDrive, Teams, OneNote, Copilot, and To Do.
- **Google Workspace**: Quick links for Gmail, Google Drive, Docs, Sheets, Slides, Calendar, Meet, Keep, and Gemini.
- **Proton AG**: Quick links for Proton Mail, Proton Calendar, Proton Drive, Proton VPN, and Proton Pass.

---

## RSS Feed Reader

A built-in news and content reader accessible via a slide-out drawer at the bottom of the page.

### How to Use

1. **Enable Feed**: Turn on the **Feed** toggle in the settings panel.
2. **Add Valid Feeds**: Click **Edit** under **Feeds RSS** to open the feed manager modal.
3. **Validate & Save**: Enter an HTTPS RSS or Atom feed URL and click the **+** button to validate the feed and grant host permissions.
4. **Access the Drawer**: The feed drawer will only appear once at least one validated feed is added and saved. Scroll down or click the feed bar at the bottom of the screen to open and browse your articles.

Need RSS feed ideas? Check out the curated list of public feeds at [Awesome RSS Feeds](https://github.com/plenaryapp/awesome-rss-feeds).

### Display Modes

- **Minimal**: Compact list view showing headlines, source tags, and timestamps.
- **Expanded**: Rich card view showing article thumbnails, full titles, summaries, and publication timestamps.

### Feed Management & Features

- **Multiple Feeds**: Add up to 5 custom RSS or Atom feeds.
- **Tabs Navigation**: Use the header navigation tabs to view all combined articles or filter by an individual feed.
- **Local Cache**: Feed items are cached locally in your browser storage for instant loading and offline availability.

---

## Search

Configure search providers, layout modes, and auxiliary capabilities for the central search bar.

### Search Engines

Switch between search providers instantly by clicking the engine icon inside the search bar or through the settings menu:

- System Default
- Bing
- Google
- Brave Search
- DuckDuckGo
- Ecosia Search
- Startpage
- Kagi

### Bar Layout Style

- **Full Width**: Standard spacious search bar.
- **Compact**: Refined bar with reduced height and tighter padding.

### Autocomplete Suggestions

Fetches live search suggestions as you type. Use keyboard arrow keys (Up / Down) and Enter to select suggestions.

### Clear Search (Google)

Appends `&udm=14` to Google searches to force clean, classic web results without AI snippets, shopping carousels, or sponsored content blocks.

### Voice Search

Enables speech recognition through the microphone icon inside the search bar (requires browser microphone permission).

### Ask AI

Adds an AI shortcut button inside the search bar. Clicking it redirects your query directly to your preferred AI assistant.

---

## Accessibility & Performance

Optimize rendering performance and visual scale to suit your hardware and preferences.

### Main UI Scale

Adjust the slider from 0.5x to 2.0x to proportionally scale all interface elements, ideal for 4K displays or high-DPI scaling.

### Reduce Motion

Disables all interface transitions, popup animations, and hover movement for an instantaneous, low-latency feel and accessibility compliance.

---

## Utilities & Data Backup

Maintain and migrate your settings across browsers and devices.

### Language Support

Choose from more than 20 supported languages. English (US) serves as the default fallback. Translations are managed directly by the community through the repository. To report translation corrections or contribute a new language, see [TRANSLATING.md](TRANSLATING.md).

### Data Backup (Export & Import)

- **Export**: Downloads a `.json` backup file containing your configured settings, color preferences, custom wallpapers, feeds, and shortcuts grid.
- **Import**: Restores your settings and shortcuts instantly from any previously exported backup file.
