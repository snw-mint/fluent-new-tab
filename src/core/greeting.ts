function initGreetingBrand(greetingWrapper: HTMLElement | null): void {
    if (!greetingWrapper) return;

    const showGreeting = localStorage.getItem('showGreeting') !== 'false';
    const userName = (localStorage.getItem('greetingName') || '').trim();
    const greetingStyle = localStorage.getItem('greetingStyle') || '3d';

    if (!showGreeting) {
        greetingWrapper.style.display = 'none';
        return;
    }
    greetingWrapper.style.display = 'flex';

    const hour = new Date().getHours();
    let timeKeyPrefix = 'greetMorning';
    let iconName = 'sun';
    let timeOfDayLabel = 'morning';

    if (hour >= 5 && hour < 12) {
        timeKeyPrefix = 'greetMorning';
        iconName = 'sun';
        timeOfDayLabel = 'morning';
    } else if (hour >= 12 && hour < 19) {
        timeKeyPrefix = 'greetAfternoon';
        iconName = 'cloud-sun';
        timeOfDayLabel = 'afternoon';
    } else if (hour >= 19 && hour < 24) {
        timeKeyPrefix = 'greetEvening';
        iconName = 'moon';
        timeOfDayLabel = 'evening';
    } else {
        timeKeyPrefix = 'greetNight';
        iconName = 'stars';
        timeOfDayLabel = 'night';
    }

    const seed = new Date().getMinutes();
    const randomIndex = (seed % 5) + 1;
    const translationKey = `${timeKeyPrefix}${randomIndex}`;

    let rawGreeting = '';
    const message = window.getTranslation(translationKey);
    if (message && message !== translationKey) {
        rawGreeting = message.replace(/\$NAME\$/g, userName);
    } else {
        try {
            rawGreeting = chrome.i18n.getMessage(translationKey, [userName]);
        } catch (error) {
            rawGreeting = translationKey;
        }
    }

    const finalGreetingText = rawGreeting
        .replace(/,\s*$/, '')
        .replace(/,\s*!$/, '!')
        .replace(/,\s*\?$/, '?')
        .trim();

    let fontSize = '40px';
    const textLength = finalGreetingText.length;
    if (textLength > 50) fontSize = '22px';
    else if (textLength > 40) fontSize = '26px';
    else if (textLength > 30) fontSize = '32px';

    let iconHTML = '';
    if (greetingStyle === '3d') {
        iconHTML = `<img src="assets/emojis/${iconName}.png" alt="${timeOfDayLabel}" class="greeting-icon" onerror="this.style.display='none'">`;
    } else {
        iconHTML = `<img src="assets/greetings/${iconName}.svg" alt="${timeOfDayLabel}" class="greeting-icon outline" onerror="this.style.display='none'">`;
    }

    greetingWrapper.innerHTML = `
        ${iconHTML}
        <h1 class="greeting-text" style="font-size: ${fontSize}; white-space: nowrap;">${finalGreetingText}</h1>
    `;
}
