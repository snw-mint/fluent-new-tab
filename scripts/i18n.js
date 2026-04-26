const DEFAULT_LOCALE = 'en';
window.translationsCache = {};

async function loadTranslations() {
  let lang = localStorage.getItem('userLanguage');
  if (!lang) lang = DEFAULT_LOCALE;

  const cacheKey = `i18n_cache_${lang}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const messages = JSON.parse(cached);
      window.translationsCache = messages;
      applyToDOM(messages);
      document.body.classList.add('loaded');
      document.dispatchEvent(new Event('i18nReady'));
      fetchLocale(lang)
        .then((fresh) => {
          localStorage.setItem(cacheKey, JSON.stringify(fresh));
        })
        .catch(() => {});
      return;
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  let messages = null;
  if (lang !== DEFAULT_LOCALE) {
    try {
      messages = await fetchLocale(lang);
    } catch (e) {}
  }
  if (!messages) {
    try {
      messages = await fetchLocale(DEFAULT_LOCALE);
    } catch (e) {}
  }
  if (messages) {
    window.translationsCache = messages;
    localStorage.setItem(cacheKey, JSON.stringify(messages));
    applyToDOM(messages);
  }
  document.body.classList.add('loaded');
  document.dispatchEvent(new Event('i18nReady'));
}

async function fetchLocale(localeCode) {
  const url = chrome.runtime.getURL(`_locales/${localeCode}/messages.json`);
  const response = await fetch(url);
  if (!response.ok) throw new Error('File not found');
  return await response.json();
}

function applyToDOM(messages) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (messages[key]) {
      const translation = messages[key].message;
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else if (element.tagName === 'OPTION') {
        element.textContent = translation;
      } else {
        element.innerHTML = translation;
      }
    }
  });
}

window.getTranslation = function (key) {
  if (window.translationsCache && window.translationsCache[key]) {
    return window.translationsCache[key].message;
  }
  return key;
};

document.addEventListener('DOMContentLoaded', loadTranslations);
