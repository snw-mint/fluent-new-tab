const UPDATE_NOTICE_PENDING_KEY = 'update_notice_pending';
const UPDATE_NOTICE_VERSION_KEY = 'update_notice_version';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    return;
  }

  if (details.reason === 'update') {
    const version = chrome.runtime.getManifest().version;
    chrome.storage.local.set({
      [UPDATE_NOTICE_PENDING_KEY]: true,
      [UPDATE_NOTICE_VERSION_KEY]: version
    });
  }
});
