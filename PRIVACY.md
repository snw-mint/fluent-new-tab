# Privacy Policy for Fluent New Tab

**Last Updated:** 08/02/2026

## Introduction

Your privacy is paramount. **Fluent New Tab** is designed with a "Local First" philosophy. We do not operate a backend server, we do not have a database, and we do not collect user accounts.

This document explains exactly what data is stored, where it lives, and the limited scenarios in which data interacts with third-party services.

## 1. Data Storage (Local Only)

**Fluent New Tab** does not transmit your personal data to the developers. All data generated or configured within the extension is stored locally on your device using the browser's `localStorage` API.

### What We Store Locally:
*   **User Preferences:** Settings regarding the visual theme, wallpaper selections, and layout configurations.
*   **Shortcuts:** The names and URLs of the shortcut links you manually add to the dashboard.
*   **Weather Settings:** The specific city name you enter if you choose to enable the weather widget.
*   **Backups:** If you use the export feature, a JSON file is generated locally on your machine. We do not receive a copy of this file.

### Data Access:
Because this data is stored in your browser's local storage, the developers of Fluent New Tab have **no access** to it. We cannot see your shortcuts, your location, or your preferences.

## 2. Third-Party Services

While the extension operates primarily offline, specific features require interaction with external APIs to function. These interactions occur directly between your browser and the third-party service.

### A. WeatherAPI.com (Optional)
*   **Usage:** This service is only contacted if you explicitly enable the Weather widget.
*   **Data Shared:** Your browser sends the **City Name** you provided to WeatherAPI.com to retrieve current temperature and forecast data.
*   **Privacy:** The handling of this data is subject to WeatherAPI.com's Privacy Policy.

### B. Google Favicon Service
*   **Usage:** Used to automatically generate icons for the shortcuts you add to your new tab.
*   **Data Shared:** When you add a shortcut, your browser sends the **Domain URL** (e.g., `github.com`) to `www.google.com/s2/favicons` to fetch the associated icon image.
*   **Privacy:** This request is handled according to Google's privacy standards.

### C. Search Engines (Bing, Google)
*   **Usage:** The search bar in Fluent New Tab acts strictly as a redirection tool.
*   **Data Shared:** We do not record, log, or analyze your search queries. When you press Enter, the query is sent directly to the search engine you selected.
*   **Privacy:** Once redirected, your interaction is governed by the privacy policy of the respective search engine provider.

## 3. No Tracking or Telemetry

To be explicitly clear about what we do **NOT** do:
*   **No Analytics:** We do not use Google Analytics, Firebase, or any other analytics software.
*   **No Cookies:** This extension does not use cookies.
*   **No Tracking Pixels:** We do not track your behavior or usage patterns.
*   **No User Identification:** We do not assign unique IDs to users.

## 4. Data Retention and Deletion

Since all data is stored on your device:

1.  **Retention:** Data is retained indefinitely on your local machine to preserve your settings between sessions.
2.  **Deletion:** You can permanently delete all data associated with Fluent New Tab by:
    *   Uninstalling the extension.
    *   Clearing your browser's "Local Storage" or "Site Data" for the extension.

## 5. Contact

If you have questions regarding this privacy policy or the open-source nature of this project, please open an issue on my GitHub repository.
