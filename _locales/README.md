# String Map — Fluent New Tab

This document maps every key in `messages.json` to a plain-English description of where it appears and what it means. Use it as a reference when translating a new locale or reviewing an existing one.

Keys are grouped by feature area. Any key that contains a placeholder (e.g. `$NAME$`) is marked with a **⚠ placeholder** note — those tokens must be kept **exactly as-is** in your translation.

> For full translation guidelines, see [TRANSLATING.md](../.github/TRANSLATING.md).

---

## General / Shared UI

| Key | English value | Description |
|-----|---------------|-------------|
| `backLabel` | Back | Generic "Back" button label |
| `backLabel` *(duplicate of `btnBack`)* | — | — |
| `btnBack` | Back | Wizard back button |
| `btnNext` | Continue | Wizard next / continue button |
| `btnCancel` | Cancel | Generic cancel button |
| `btnSave` | Save | Generic save button |
| `editLabel` | Edit | Context menu edit action |
| `removeLabel` | Remove | Context menu remove action |
| `addShortcutLabel` | Add | Label for the add-shortcut button |
| `moreOptionsLabel` | More options | Context menu overflow label |
| `learnMoreLabel` | Learn more | "Learn more" link label |
| `warningUnderstood` | Understood | Dismiss button on warning dialogs |
| `styleNone` | None | Option meaning "no style / no effect" |

---

## Navigation & Tab

| Key | English value | Description |
|-----|---------------|-------------|
| `newTabTitle` | New Tab | Browser tab title shown on the new-tab page when no custom name is set |

---

## Settings Panel

| Key | English value | Description |
|-----|---------------|-------------|
| `settingsTitle` | Settings | Main settings panel heading |
| `appearanceTitle` | Appearance | Appearance section heading |
| `mainUiScaleLabel` | Main UI Scale | Slider label for overall UI scale |
| `displayTitle` | Display | Display/widgets section heading |
| `displayScaleLabel` | Display Scale | Slider label for clock/date widget scale |
| `AccessibilityTitle` | Accessibility | Accessibility section heading |
| `reduceMotionTitle` | Reduce motion | Toggle label for reduced motion |
| `languageTitle` | Language | Language picker section heading |
| `backupTitle` | Data Backup | Data backup section heading |
| `exportOption` | Export | Export settings button |
| `importOption` | Import | Import settings button |

---

## Wallpaper

| Key | English value | Description |
|-----|---------------|-------------|
| `wallpaperTitle` | Wallpaper | Wallpaper section heading |
| `uploadOption` | Upload Image | Option to upload a custom wallpaper |
| `uploadBtnText` | Upload | Upload button text |
| `overlayLabel` | Image Overlay | Slider label for wallpaper overlay opacity |
| `surfaceTintLabel` | Surface Tint | Slider label for surface color tint strength |
| `fetchingImagePlaceholder` | Fetching $SOURCE$ image… | Status message while a wallpaper is loading. **⚠ placeholder:** `$SOURCE$` is replaced with the image source name (e.g. "Bing"). Do not translate or remove `$SOURCE$`. |

---

## Tab Customization

| Key | English value | Description |
|-----|---------------|-------------|
| `tabNameLabel` | Tab Name | Label for the custom browser-tab title input |
| `tabFaviconLabel` | Tab Icon | Label for the custom favicon/icon picker |

---

## Display Widgets

| Key | English value | Description |
|-----|---------------|-------------|
| `displayGreeting` | Greeting | Toggle label for the greeting widget |
| `greetingNameLabel` | Your Name | Input label for the user's display name |
| `highlightNameLabel` | Highlight Name | Checkbox to highlight the user's name |
| `displayTime` | Time | Toggle label for the clock widget |
| `displayDate` | Date | Toggle label for the date widget |
| `displayAdvanced` | Time & Date | Heading for advanced time/date options |
| `showSecondsLabel` | Show seconds | Toggle to show seconds on the clock |
| `use12HourLabel` | Use 12-hour format | Toggle for 12 h vs 24 h clock |
| `dateFormatLabel` | Format | Label for the date-format picker |
| `dateText` | Written | Date format option: spelled-out text (e.g. "June 6") |
| `dateNumeric` | Numeric | Date format option: numeric (e.g. 06/06) |
| `dateWeekday` | Weekday | Date format option: shows weekday name |
| `emojiTypeLabel` | Emoji Type | Label for the emoji style picker |
| `TypeStatic` | Static | Emoji type option: non-animated |
| `TypeAnimated` | Animated | Emoji type option: animated |

---

## Greeting Messages

All greeting keys use the **⚠ placeholder** `$NAME$` (the user's name). Keys that also include `$WEEK$` substitute the current day of the week. Both must remain unchanged.

| Key | English value | Description |
|-----|---------------|-------------|
| `greetWeekMorning` | Have a great $WEEK$, $NAME$! | Morning greeting referencing the weekday |
| `greetWeekAfternoon` | How is your $WEEK$ going, $NAME$? | Afternoon greeting referencing the weekday |
| `greetWeekNight` | $NAME$, how was your $WEEK$? | Night greeting referencing the weekday |
| `greetMorning1` | $NAME$, it is a beautiful morning! | Morning greeting variant 1 |
| `greetMorning2` | Ready to conquer the day, $NAME$? | Morning greeting variant 2 |
| `greetMorning3` | Let us make this morning count, $NAME$. | Morning greeting variant 3 |
| `greetMorning4` | Good morning! I hope you slept well, $NAME$. | Morning greeting variant 4 |
| `greetMorning5` | Wakey wakey, $NAME$, let's get started! | Morning greeting variant 5 |
| `greetAfternoon1` | Hope your afternoon is going well, $NAME$. | Afternoon greeting variant 1 |
| `greetAfternoon2` | $NAME$, keep up the great momentum! | Afternoon greeting variant 2 |
| `greetAfternoon3` | Halfway through the day, $NAME$! | Afternoon greeting variant 3 |
| `greetAfternoon4` | Good afternoon! Staying productive, $NAME$? | Afternoon greeting variant 4 |
| `greetAfternoon5` | Do not forget to take a quick break, $NAME$. | Afternoon greeting variant 5 |
| `greetEvening1` | Good evening! Time to start winding down, $NAME$. | Evening greeting variant 1 |
| `greetEvening2` | $NAME$, I hope you had a fantastic day. | Evening greeting variant 2 |
| `greetEvening3` | Enjoy a relaxing evening, $NAME$. | Evening greeting variant 3 |
| `greetEvening4` | The day is almost over, $NAME$. Great job! | Evening greeting variant 4 |
| `greetEvening5` | Grab a comfortable seat and relax, $NAME$. | Evening greeting variant 5 |
| `greetNight1` | It is getting late, $NAME$. Time to rest. | Night greeting variant 1 |
| `greetNight2` | $NAME$, the night is quiet and peaceful. | Night greeting variant 2 |
| `greetNight3` | Burning the midnight oil, $NAME$? | Night greeting variant 3 |
| `greetNight4` | Have a good night of sleep, $NAME$! | Night greeting variant 4 |
| `greetNight5` | Sweet dreams, $NAME$. See you tomorrow. | Night greeting variant 5 |

---

## Weekday Names

Used internally to fill the `$WEEK$` placeholder in greeting messages.

| Key | English value |
|-----|---------------|
| `weekday_0` | Sunday |
| `weekday_1` | Monday |
| `weekday_2` | Tuesday |
| `weekday_3` | Wednesday |
| `weekday_4` | Thursday |
| `weekday_5` | Friday |
| `weekday_6` | Saturday |

---

## Weather

| Key | English value | Description |
|-----|---------------|-------------|
| `weatherTitle` | Weather | Weather widget section heading |
| `locationLabel` | Location | City input label |
| `useFahrenheitLabel` | Use Fahrenheit | Toggle for °F / °C |
| `weatherAlertsLabel` | Weather alerts | Toggle to show weather alert banners |
| `alertTempDrop` | Expected temperature drop: $VALUE$° | Alert banner for a significant temperature drop. **⚠ placeholder:** `$VALUE$` is the degree amount. |
| `alertTempRise` | Expected temperature rise: $VALUE$° | Alert banner for a significant temperature rise. **⚠ placeholder:** `$VALUE$` is the degree amount. |
| `alertStorm` | Storms expected in the next few hours. | Alert banner for incoming storms |
| `alertWindHigh` | Strong winds expected: $VALUE$ km/h | Alert banner for high winds. **⚠ placeholder:** `$VALUE$` is the wind speed. Note: "km/h" is a unit — adjust only if your locale conventionally uses a different unit abbreviation. |
| `alertUvHigh` | UV rays at critical levels: $VALUE$ | Alert banner for high UV index. **⚠ placeholder:** `$VALUE$` is the UV index number. |
| `alertPollenHigh` | High pollen levels ($POLLEN$) expected. | Alert banner for high pollen. **⚠ placeholder:** `$POLLEN$` is the pollen type (e.g. "grass"). |

---

## Search Bar

| Key | English value | Description |
|-----|---------------|-------------|
| `searchTitle` | Search | Search settings section heading |
| `searchStyleFull` | Full width | Search bar style option |
| `searchStyleCompact` | Compact | Search bar style option |
| `suggestionsOption` | Suggestions | Toggle for search suggestions |
| `clearSearchOption` | Clean search (Google) | Toggle to open Google without tracking parameters |
| `voiceSearchOption` | Voice search | Toggle to enable voice search button |
| `visualSearchOption` | Visual search | Toggle to enable visual/image search button |
| `askAiOption` | Ask to AI | Toggle to enable the AI search button |
| `searchPlaceholder` | Search the web | Placeholder text inside the search input |

---

## Visual Search Dialog

| Key | English value | Description |
|-----|---------------|-------------|
| `visualSearchTitle` | Visual Search | Dialog heading |
| `visualSearchDragText` | Drag an image here or | Text before the upload link in the drop zone |
| `visualSearchUploadLink` | upload a file | Clickable text to open the file picker |
| `visualSearchDivider` | or | Divider between drag-drop zone and URL input |
| `visualSearchPasteUrl` | Paste image link | Placeholder text for the image URL input |
| `visualSearchSearchBtn` | Search | Submit button in the visual search dialog |

---

## Shortcuts

| Key | English value | Description |
|-----|---------------|-------------|
| `shortcutsTitle` | Shortcuts | Shortcuts settings section heading |
| `enableFoldersLabel` | Enable Folders | Toggle to enable folder shortcuts |
| `hideShortcutNamesLabel` | Hide Names | Toggle to hide shortcut name labels |
| `folderIconHelp` | Find custom folder icons at | Helper text with a link to an icon resource |
| `shortcutRadiusLabel` | Corner Radius | Slider label for shortcut icon corner radius |
| `rows1` | 1 Row | Shortcut row count option |
| `rows2` | 2 Rows | Shortcut row count option |
| `rows3` | 3 Rows | Shortcut row count option |
| `rows4` | 4 Rows | Shortcut row count option |

---

## Add / Edit Dialogs

| Key | English value | Description |
|-----|---------------|-------------|
| `chooseTypeTitle` | Create New | Heading of the "create new item" picker |
| `addFolderTitle` | Add Folder | Heading of the add-folder dialog |
| `editFolderTitle` | Edit Folder | Heading of the edit-folder dialog |
| `folderNameLabel` | Name | Input label for folder name |
| `addShortcutTitle` | Add Shortcut | Heading of the add-shortcut dialog |
| `editShortcutTitle` | Edit Shortcut | Heading of the edit-shortcut dialog |
| `shortcutNameLabel` | Name | Input label for shortcut name |
| `shortcutUrlLabel` | URL | Input label for shortcut URL |
| `addFaviconLabel` | Custom Icon | Toggle label for custom shortcut icon |
| `faviconUrlLabel` | Icon URL | Input label for the custom icon URL |
| `namePlaceholder` | e.g., John (optional) | Placeholder for the greeting name input |
| `cityPlaceholder` | e.g., New York | Placeholder for the city/location input |
| `gridFullTitle` | Grid is Full | Title for the warning dialog when main grid shortcuts limit is reached |
| `gridFullMessage` | You have reached the maximum limit of $LIMIT$ shortcuts... | Message for the grid full warning dialog. **⚠ placeholder:** `$LIMIT$` is the maximum items limit. |
| `folderFullTitle` | Folder is Full | Title for the warning dialog when folder items limit is reached |
| `folderFullMessage` | This folder has reached the absolute limit of $LIMIT$ items... | Message for the folder full warning dialog. **⚠ placeholder:** `$LIMIT$` is the maximum items limit. |

---

## App Launcher

| Key | English value | Description |
|-----|---------------|-------------|
| `appsTitle` | Apps | Apps section heading on the new-tab page |
| `moreApps` | More Apps | Link/button to open the full app list |
| `appLauncherTitle` | App Launcher | Settings section heading for the app launcher |

---

## Color Picker

| Key | English value | Description |
|-----|---------------|-------------|
| `customColorTitle` | Custom Color | Heading for the custom accent-color picker |
| `wizardAccentLabel` | Accent Color | Label for the accent color option in the wizard |

---

## Permission Dialog

| Key | English value | Description |
|-----|---------------|-------------|
| `permissionRequiredTitle` | Permission Required | Dialog heading |
| `permissionRequiredMessage` | To use this feature, Fluent New Tab needs permission to access "$API_NAME$". This ensures your privacy and security. | Body text of the permission dialog. **⚠ placeholder:** `$API_NAME$` is the name of the external API (e.g. "Open-Meteo API"). Do not translate or remove `$API_NAME$`. |
| `grantPermissionLabel` | Grant Permission | Button to accept the permission request |

---

## Update Notice

| Key | English value | Description |
|-----|---------------|-------------|
| `updateNoticePrefix` | Fluent New Tab has been updated to version $VERSION$, | First part of the update banner. **⚠ placeholder:** `$VERSION$` is the version string (e.g. "v3.1"). Do not translate or remove `$VERSION$`. |
| `updateNoticeChangelog` | see changelog | Clickable link text appended after `updateNoticePrefix` |

---

## Setup Wizard

| Key | English value | Description |
|-----|---------------|-------------|
| `wizardWelcomeTitle` | Welcome home | Wizard welcome screen heading |
| `wizardWelcomeSubtitle` | Your new fluent workspace is ready. Choose your next step below. | Wizard welcome screen subtitle |
| `wizardRestoreTitle` | Restore settings | Wizard option to restore from backup |
| `wizardRestoreDesc` | Do you have a backup file? | Description under the restore option |
| `wizardStartTitle` | Start the setup | Wizard option to begin guided setup |
| `wizardStartDesc` | Start with a few steps. | Description under the start option |
| `wizardSkipTitle` | Skip setup | Wizard option to skip setup |
| `wizardSkipDesc` | Start with a clean setup. | Description under the skip option |
| `wizardThemeAuto` | System | Theme option: follow system preference |
| `wizardThemeLight` | Light | Theme option: always light |
| `wizardThemeDark` | Dark | Theme option: always dark |
| `wizardAppearanceTitle` | Style & Appearance | Wizard appearance step heading |
| `wizardAppearanceDesc` | Set your theme, accent color, name, and language. | Wizard appearance step description |
| `wizardWidgetsTitle` | Widgets & Utilities | Wizard widgets step heading |
| `wizardWidgetsDesc` | Choose what shows up on your page. | Wizard widgets step description |
| `wizardFinalTitle` | You're all set | Wizard final screen heading |
| `wizardFinalSubtitle` | Thank you for using Fluent New Tab! | Wizard final screen subtitle |
| `wizardFinalStartTitle` | Get started | Wizard final action: open new-tab page |
| `wizardFinalStartDesc` | Open your new tab page. | Description under "Get started" |
| `wizardFinalSupportTitle` | Support the project | Wizard final action: support link |
| `wizardFinalSupportDesc` | Help keep the project updated. | Description under "Support the project" |
| `wizardFinalGithubTitle` | Source code | Wizard final action: GitHub link |
| `wizardFinalGithubDesc` | View project on GitHub. | Description under "Source code" |
