const DEFAULT_LOCALE = 'en';
window.translationsCache = {};

function getLocalesBaseUrls() {
    const scriptEl = document.currentScript ||
        Array.from(document.scripts).find(script => script.src && script.src.includes('scripts/i18n.js'));

    if (scriptEl && scriptEl.src) {
        const demoRoot = new URL('../', scriptEl.src);
        return [
            new URL('_locales/', demoRoot).toString(),
            new URL('locales/', demoRoot).toString()
        ];
    }

    return [
        new URL('_locales/', window.location.href).toString(),
        new URL('locales/', window.location.href).toString()
    ];
}

const LOCALES_BASE_URLS = getLocalesBaseUrls();

async function loadTranslations() {
    let lang = localStorage.getItem('userLanguage');
    if (!lang) {
        lang = DEFAULT_LOCALE;
    }
    let messages = null;
    try {
        messages = await fetchLocale(lang);
    } catch (e) {
        console.warn(`Language ${lang} not found. Trying fallback.`);
    }
    if (!messages) {
        try {
            messages = await fetchLocale(DEFAULT_LOCALE);
        } catch (e) {
            console.error("Critical error: default language file (en) not found!");
            document.body.classList.add('loaded');
            return;
        }
    }
    window.translationsCache = messages;
    applyToDOM(messages);
    document.dispatchEvent(new Event('i18nReady'));
    document.body.classList.add('loaded');
}
async function fetchLocale(localeCode) {
    const attemptedUrls = [];

    for (const baseUrl of LOCALES_BASE_URLS) {
        const url = `${baseUrl}${localeCode}/messages.json`;
        attemptedUrls.push(url);

        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
            return await response.json();
        }
    }

    throw new Error(`Locale file not found. Tried: ${attemptedUrls.join(', ')}`);
}
function applyToDOM(messages) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
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
window.getTranslation = function(key) {
    if (window.translationsCache && window.translationsCache[key]) {
        return window.translationsCache[key].message;
    }
    return key;
};
document.addEventListener('DOMContentLoaded', loadTranslations);