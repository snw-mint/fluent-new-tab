const DEFAULT_LOCALE = 'en';
window.translationsCache = {};
async function loadTranslations() {
    let lang = localStorage.getItem('userLanguage');
    if (!lang) {
        lang = DEFAULT_LOCALE;
    }
    let messages = null;
    try {
        messages = await fetchLocale(lang);
    } catch (e) {
        console.warn(`Idioma ${lang} não encontrado. Tentando fallback.`);
    }
    if (!messages) {
        try {
            messages = await fetchLocale(DEFAULT_LOCALE);
        } catch (e) {
            console.error("Erro crítico: Arquivo de idioma padrão (en) não encontrado!");
            return;
        }
    }
    window.translationsCache = messages;
    applyToDOM(messages);
    document.dispatchEvent(new Event('i18nReady'));
    document.body.classList.add('loaded');
}
async function fetchLocale(localeCode) {
    const url = chrome.runtime.getURL(`_locales/${localeCode}/messages.json`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Arquivo não encontrado');
    return await response.json();
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