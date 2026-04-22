/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const UPDATE_NOTICE_PENDING_KEY = 'update_notice_pending';
const UPDATE_NOTICE_VERSION_KEY = 'update_notice_version';
const PERSISTENT_BACKUP_KEY = 'fluent_persistent_backup_v1';

const DEFAULT_INSTALL_PREFERENCES = {
  shortcuts:
    '[{"name":"Wikipedia","url":"https://wikipedia.com","customIcon":"https://upload.wikimedia.org/wikipedia/en/8/80/Wikipedia-logo-v2.svg"},{"name":"YouTube","url":"https://youtube.com","customIcon":null},{"name":"Github","url":"https://github.com/snw-mint/fluent-new-tab","customIcon":"https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"},{"name":"BMC","url":"https://buymeacoffee.com/snw.mint"},{"name":"Help","url":"https://snw-mint.github.io/fluent-new-tab/help","customIcon":"https://github.com/snw-mint/fluent-new-tab/blob/leading/android-chrome-512x512.png?raw=true","type":"link"},{"name":"Spotify","url":"https://spotify.com","customIcon":null},{"name":"Crowdin","url":"https://crowdin.com/project/fluent-new-tab","customIcon":"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/crowdin.svg"}]',
  theme: 'auto',
  weatherEnabled: 'false',
  shortcutsVisible: 'true',
  shortcutsRows: '1',
  launcherEnabled: 'true',
  launcherProvider: 'microsoft',
  showGreeting: 'true',
  greetingName: '',
  greetingStyle: 'none',
  userLanguage: 'en_US',
  searchEngine: 'bing',
  searchBarVisible: 'true',
  suggestionsEnabled: 'false',
  clearSearchEnabled: 'false',
  compactBarEnabled: 'false',
  voiceSearchEnabled: 'false',
  wallpaperEnabled: 'false',
  wallpaperSource: 'local',
  wallpaperType: 'preset',
  wallpaperValue: 'preset_1',
  animationsDisabled: 'false',
  blurDisabled: 'false',
  reducedEffectsEnabled: 'false',
  accentColorEnabled: 'false',
  accentColorMode: 'manual',
  accentColorValue: '#107C41',
  displayType: 'greeting',
  showSeconds: 'false',
  use12Hour: 'true',
  dateFormat: 'numeric',
  askAiEnabled: 'false',
  shortcutsTree:
    '[{"name":"Wikipedia","url":"https://wikipedia.com","customIcon":"https://upload.wikimedia.org/wikipedia/en/8/80/Wikipedia-logo-v2.svg"},{"name":"YouTube","url":"https://youtube.com","customIcon":null},{"name":"Github","url":"https://github.com/snw-mint/fluent-new-tab","customIcon":"https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"},{"name":"BMC","url":"https://buymeacoffee.com/snow.mint"},{"name":"Help","url":"https://snw-mint.github.io/fluent-new-tab/help","customIcon":"https://github.com/snw-mint/fluent-new-tab/blob/leading/android-chrome-512x512.png?raw=true","type":"link"},{"name":"Spotify","url":"https://spotify.com","customIcon":null},{"name":"Crowdin","url":"https://crowdin.com/project/fluent-new-tab","customIcon":"https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/crowdin.svg"}]',
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.runtime.setUninstallURL(
    'https://snw-mint.github.io/fluent-new-tab/uninstall.html',
  );

  if (details.reason === 'install') {
    chrome.storage.local.set({
      [PERSISTENT_BACKUP_KEY]: DEFAULT_INSTALL_PREFERENCES,
    });

    chrome.tabs.create({
      url: 'https://snw-mint.github.io/fluent-new-tab/welcome.html',
    });
  }

  if (details.reason === 'update') {
    const version = chrome.runtime.getManifest().version;

    const FEATURE_PERMISSIONS = {
      weatherEnabled: [
        'https://geocoding-api.open-meteo.com/*',
        'https://api.open-meteo.com/*',
      ],
      suggestionsEnabled: ['https://suggestqueries.google.com/*'],
      wallpaperBing: ['https://peapix.com/*', 'https://img.peapix.com/*'],
      wallpaperNasa: ['https://api.nasa.gov/*', 'https://apod.nasa.gov/*'],
      wallpaperWikimedia: [
        'https://commons.wikimedia.org/*',
        'https://upload.wikimedia.org/*',
      ],
    };

    chrome.storage.local.get(
      [
        'wallpaperSource',
        'wallpaperType',
        'weatherEnabled',
        'suggestionsEnabled',
      ],
      (stored) => {
        const brokenFeatures = [];

        const checkFeature = (key, origins) => {
          chrome.permissions.contains({ origins }, (has) => {
            if (!has) brokenFeatures.push(key);
          });
        };

        if (stored.weatherEnabled === 'true')
          checkFeature('weather', FEATURE_PERMISSIONS.weatherEnabled);
        if (stored.suggestionsEnabled === 'true')
          checkFeature('suggestions', FEATURE_PERMISSIONS.suggestionsEnabled);
        if (stored.wallpaperSource === 'api') {
          if (stored.wallpaperType === 'bing')
            checkFeature('bing', FEATURE_PERMISSIONS.wallpaperBing);
          if (stored.wallpaperType === 'nasa')
            checkFeature('nasa', FEATURE_PERMISSIONS.wallpaperNasa);
          if (stored.wallpaperType === 'wikimedia')
            checkFeature('wikimedia', FEATURE_PERMISSIONS.wallpaperWikimedia);
        }

        setTimeout(() => {
          if (brokenFeatures.length > 0) {
            chrome.storage.local.set({ reauth_needed: brokenFeatures });
            chrome.action.setBadgeText({ text: '!' });
            chrome.action.setBadgeBackgroundColor({ color: '#FF4444' });
          }
          chrome.storage.local.set({
            [UPDATE_NOTICE_PENDING_KEY]: true,
            [UPDATE_NOTICE_VERSION_KEY]: version,
          });
        }, 300);
      },
    );
  }
});
