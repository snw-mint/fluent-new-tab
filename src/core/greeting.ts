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

    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

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

    let translationKey = '';
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday

    if (isWeekday) {
        if (hour >= 5 && hour < 12) {
            translationKey = 'greetWeekMorning';
        } else if (hour >= 12 && hour < 19) {
            translationKey = 'greetWeekAfternoon';
        } else if (hour >= 19 || hour < 5) {
            translationKey = 'greetWeekNight';
        }
    }
    
    if (!translationKey) {
        const seed = now.getMinutes();
        const randomIndex = (seed % 5) + 1;
        translationKey = `${timeKeyPrefix}${randomIndex}`;
    }
    
    const dayOfWeekKey = `weekday_${dayOfWeek}`;
    let currentDayName = '';
    const dayMessage = window.getTranslation(dayOfWeekKey);
    if (dayMessage && dayMessage !== dayOfWeekKey) {
        currentDayName = dayMessage;
    } else {
        try {
            currentDayName = chrome.i18n.getMessage(dayOfWeekKey);
        } catch (error) {
            // fallback to English if translation not found
            const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            currentDayName = weekdays[dayOfWeek];
        }
    }

    let rawGreeting = '';
    const message = window.getTranslation(translationKey);
    if (message && message !== translationKey) {
        rawGreeting = message
            .replace(/\$WEEK\$/g, currentDayName)
            .replace(/\$NAME\$/g, userName);
    } else {
        try {
            if (translationKey.startsWith('greetWeek')) {
                 rawGreeting = chrome.i18n.getMessage(translationKey, [currentDayName, userName]);
            } else {
                 rawGreeting = chrome.i18n.getMessage(translationKey, [userName]);
            }
        } catch (error) {
            rawGreeting = translationKey;
        }
    }

    if (!userName) {
        rawGreeting = rawGreeting
            .replace(/,\s*([!?.,;:])/g, '$1')
            .replace(/\s+([!?.,;:])/g, '$1')
            .replace(/\s{2,}/g, ' ')
            .trim();
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

    const heading = document.createElement('h1');
    heading.className = 'greeting-text';
    heading.style.fontSize = fontSize;
    heading.style.whiteSpace = 'nowrap';
    heading.textContent = finalGreetingText;

    if (greetingStyle === 'none') {
        greetingWrapper.replaceChildren(heading);
    } else {
        const icon = document.createElement('img');
        icon.src = greetingStyle === '3d'
            ? `assets/emojis/${iconName}.png`
            : `assets/greetings/${iconName}.svg`;
        icon.alt = timeOfDayLabel;
        icon.className = greetingStyle === '3d' ? 'greeting-icon' : 'greeting-icon outline';
        icon.addEventListener('error', () => { icon.style.display = 'none'; });

        greetingWrapper.replaceChildren(icon, heading);
    }
}
