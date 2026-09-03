const DEFAULT_LOCALE = 'en_US';
window.translationsCache = {};

async function fetchLocale(loc) {
  const u = chrome.runtime.getURL(`_locales/${loc}/messages.json`);
  const res = await fetch(u);
  if (!res.ok) throw new Error('File not found');
  return await res.json();
}

async function getFullLocaleMessages(lang) {
  let defMsg = {};
  try {
    defMsg = await fetchLocale(DEFAULT_LOCALE);
  } catch (e) {}

  if (!lang || lang === DEFAULT_LOCALE) {
    return defMsg;
  }

  let langMsg = {};
  try {
    langMsg = await fetchLocale(lang);
  } catch (e) {}

  return Object.assign({}, defMsg, langMsg);
}

async function loadTranslations() {
  let lang = localStorage.getItem('userLanguage') || DEFAULT_LOCALE;
  const cacheKey = `i18n_cache_${lang}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      let msg = JSON.parse(cached);
      if (lang !== DEFAULT_LOCALE && !msg.feedTitle) {
        msg = await getFullLocaleMessages(lang);
        localStorage.setItem(cacheKey, JSON.stringify(msg));
      }
      window.translationsCache = msg;
      applyToDOM(msg);
      document.body.classList.add('loaded');
      document.dispatchEvent(new Event('i18nReady'));
      getFullLocaleMessages(lang)
        .then((fresh) => {
          window.translationsCache = fresh;
          localStorage.setItem(cacheKey, JSON.stringify(fresh));
          applyToDOM(fresh);
        })
        .catch(() => {});
      return;
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const msg = await getFullLocaleMessages(lang);
  window.translationsCache = msg;
  localStorage.setItem(cacheKey, JSON.stringify(msg));
  applyToDOM(msg);
  document.body.classList.add('loaded');
  document.dispatchEvent(new Event('i18nReady'));
}

function applyToDOM(messages) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const k = el.getAttribute('data-i18n');
    if (messages[k]) {
      const v = messages[k].message;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = v;
      } else if (el.tagName === 'OPTION') {
        el.textContent = v;
      } else if (el.tagName === 'TITLE') {
        if (!localStorage.getItem('tabName')) {
          document.title = v;
        }
      } else {
        el.innerHTML = v;
      }
    }
  });
}

window.getTranslation = function (k, fb) {
  if (window.translationsCache && window.translationsCache[k]) {
    return window.translationsCache[k].message;
  }
  return fb !== undefined ? fb : k;
};

window.loadTranslations = loadTranslations;

document.addEventListener('DOMContentLoaded', loadTranslations);

