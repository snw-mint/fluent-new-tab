const UPDATE_NOTICE_PENDING_KEY = 'update_notice_pending';
const UPDATE_NOTICE_VERSION_KEY = 'update_notice_version';
const PERSISTENT_BACKUP_KEY = 'fluent_persistent_backup_v1';

const DEFAULT_INSTALL_PREFERENCES = {
  shortcuts: '[{"name":"Wikipedia","url":"https://wikipedia.com","customIcon":"https://upload.wikimedia.org/wikipedia/en/8/80/Wikipedia-logo-v2.svg"},{"name":"YouTube","url":"https://youtube.com","customIcon":null},{"name":"Github","url":"https://github.com/snw-mint/fluent-new-tab","customIcon":"https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"},{"name":"Notion","url":"https://notion.com","customIcon":null},{"name":"Kofi","url":"https://ko-fi.com/snwmint","customIcon":"https://upload.wikimedia.org/wikipedia/commons/4/4a/Ko-Fi_favicon.webp"},{"name":"Fluent New Tab","url":"https://snw-mint.github.io/fluent-new-tab/","customIcon":"https://github.com/snw-mint/fluent-new-tab/blob/leading/android-chrome-512x512.png?raw=true"},{"name":"Reddit","url":"https://reddit.com","customIcon":null},{"name":"Spotify","url":"https://spotify.com","customIcon":null},{"name":"BlueSky","url":"https://bsky.app","customIcon":null},{"name":"Crowdin","url":"https://crowdin.com/project/fluent-new-tab","customIcon":"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/crowdin.svg"}]',
  theme: 'auto',
  weatherEnabled: 'true',
  fluent_city_data: '{"name":"New York","lat":40.71427,"lon":-74.00597,"country":"United States"}',
  shortcutsVisible: 'true',
  shortcutsRows: '1',
  launcherEnabled: 'true',
  launcherProvider: 'microsoft',
  showGreeting: 'true',
  greetingName: '',
  greetingStyle: '3d',
  userLanguage: 'en_US',
  clearSearchEnabled: 'false',
  compactBarEnabled: 'false',
  voiceSearchEnabled: 'true',
  wallpaperEnabled: 'true',
  wallpaperSource: 'api',
  wallpaperType: 'bing',
  wallpaperValue: 'preset_1',
  animationsDisabled: 'false',
  blurDisabled: 'false',
  reducedEffectsEnabled: 'false'
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.runtime.setUninstallURL("https://forms.office.com/r/6RaRiAgxD2");

  if (details.reason === 'install') {
    chrome.storage.local.set({
      [PERSISTENT_BACKUP_KEY]: DEFAULT_INSTALL_PREFERENCES
    });

    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }

  if (details.reason === 'update') {
    const version = chrome.runtime.getManifest().version;
    chrome.storage.local.set({
      [UPDATE_NOTICE_PENDING_KEY]: true,
      [UPDATE_NOTICE_VERSION_KEY]: version
    });
  }
});