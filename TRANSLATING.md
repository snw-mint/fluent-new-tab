# 🌍 Help Translate Fluent New Tab

Fluent New Tab is designed to be accessible to everyone. We need your help to translate the extension into more languages!

Whether you are a developer or just a fan of the project, you can contribute.

## 🚀 How to Contribute

### Method 1: GitHub Issues (Easy)
If you're not comfortable with Git or coding, you can simply submit translations via an Issue.

1.  Download or copy the code from the json file [on this page](https://github.com/snw-mint/fluent-new-tab/blob/main/_locales/en/messages.json).
2.  Translate the text inside the `“message”` quotes (for example, `‘Apps’` -> `“Applications”`).
3.  Go to the [New Issues page](https://github.com/snw-mint/fluent-new-tab/issues/new/choose).
4.  Select **Translation**.
5.  Paste your translated JSON code.

### Method 2: Pull Request (Recommended)
If you know how to use Git, this is the fastest way to get your translation merged.

1.  **Fork** the repository.
2.  Navigate to the `_locales/` folder.
3.  Create a new folder with your language code (e.g., `fr` for French, `de` for German).
    * *Note: Use underscores for regions, e.g., `pt_BR`, `es_MX`.*
4.  Create a file named `messages.json` inside that folder.
5.  Copy the **JSON Template** below into your file.
6.  Translate the values and submit a **Pull Request**.

## 🧪 How to Test Your Translation

To see your translation in action before submitting:

1.  Open Microsoft Edge (or Chrome).
2.  Go to `edge://extensions` (or `chrome://extensions`).
3.  Enable **Developer Mode** (toggle in the corner).
4.  Click **Load Unpacked**.
5.  Select the root folder of the project.
6.  Change your browser's language to the one you added (or use the Language selector in the extension settings).

## ⚠️ Translation Rules

1.  **Do NOT change the "Keys":** The text on the left side (e.g., `"appsTitle"`) must remain exactly the same.
2.  **Do NOT translate "Description":** This field is for developers only.
3.  **Keep Punctuation:** If the original text ends with `...` or `!`, please keep it.
4.  **Greetings Logic:** Greetings must make sense both **standing alone** AND when a **username is appended**.
    * *Example:* "Good morning" works alone. "Good morning, John" also works.
    * *Bad Example:* "It is morning" works alone, but "It is morning, John" sounds weird.

---

## 📖 Reference Table (Glossary)

> 📂 **Source File:** If you prefer to check the original code or download the file, access the [English messages.json here](_locales/en/messages.json).

Use this table if you need context on where the text appears or strictly follow the keys below.

| Key | Description | Original Text (English) |
| :--- | :--- | :--- |
| `appsTitle` | Title of the apps popup | Apps |
| `moreApps` | Footer link in the apps popup | More Apps |
| `settingsTitle` | Title of the settings modal | Settings |
| `greetingTitle` | Greeting section header | Greeting |
| `iconsStyleLabel` | Label for greeting icon style selection | Icon Style |
| `styleEmoji` | Option for 3D emoji style | 3D Fluent (Color) |
| `styleOutline` | Option for outline icon style | Outline (Minimal) |
| `weatherTitle` | Weather section header | Weather |
| `shortcutsTitle` | Shortcuts section header | Shortcuts |
| `rows1` | Option for 1 row of shortcuts | 1 Row |
| `rows2` | Option for 2 rows of shortcuts | 2 Rows |
| `rows3` | Option for 3 rows of shortcuts | 3 Rows |
| `rows4` | Option for 4 rows of shortcuts | 4 Rows |
| `appLauncherTitle` | App Launcher section header | App Launcher |
| `ecosystemLabel` | Label for ecosystem selection | Ecosystem |
| `searchTitle` | Search section header | Search |
| `suggestionsOption` | Toggle for search suggestions | Suggestions |
| `languageTitle` | Language section header | Language |
| `interfaceLanguageLabel` | Label for language dropdown | Interface Language |
| `backupTitle` | Backup section header | Data Backup |
| `exportOption` | Button to export settings | Export |
| `importOption` | Button to import settings | Import |
| `addShortcutTitle` | Title of the add shortcut modal | Add Shortcut |
| `shortcutNameLabel` | Label for shortcut name input | Name |
| `shortcutUrlLabel` | Label for shortcut URL input | URL |
| `addFaviconLabel` | Link/Toggle to show custom icon input | Custom Icon |
| `faviconUrlLabel` | Label for custom favicon URL input | Icon URL |
| `btnCancel` | Cancel button text | Cancel |
| `btnSave` | Save button text | Save |
| `searchPlaceholder` | Placeholder text for search input | Search the web... |