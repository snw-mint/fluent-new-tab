/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file manages the rendering and updating of the time, date,
 * and greeting display on the new tab page.
 */

let displayInterval: number | null = null;
const timeFormatCache = new Map<string, Intl.DateTimeFormat>();
const dateFormatCache = new Map<string, Intl.DateTimeFormat>();

function initDisplayWidget(wrapper: HTMLElement | null): void {
  if (!wrapper) return;
  if (displayInterval) {
    window.clearInterval(displayInterval);
  }

  const isEnabled = localStorage.getItem('displayEnabled') !== 'false';

  if (!isEnabled) {
    wrapper.style.display = 'none';
    return;
  }

  wrapper.style.display = 'flex';
  updateDisplayContent(wrapper);
  displayInterval = window.setInterval(() => {
    updateDisplayContent(wrapper);
  }, 1000);
}

function updateDisplayContent(wrapper: HTMLElement): void {
  const displayType = localStorage.getItem('displayType') || 'greeting';

  if (wrapper.dataset.currentMode !== displayType) {
    wrapper.innerHTML = '';
    wrapper.dataset.currentMode = displayType;
    wrapper.dataset.lastCache = '';
  }

  if (displayType === 'greeting') {
    renderGreeting(wrapper);
  } else {
    renderTimeDate(wrapper, displayType);
  }
}

function renderTimeDate(wrapper: HTMLElement, type: string): void {
  const rawLang = localStorage.getItem('userLanguage') || 'en_US';
  const locale = rawLang.replace('_', '-');

  const showSeconds = localStorage.getItem('showSeconds') === 'true';
  const use12Hour = localStorage.getItem('use12Hour') === 'true';
  const dateFormat = localStorage.getItem('dateFormat') || 'text';

  const now = new Date();
  const timeNodes: Node[] = [];
  let dateString = '';

  if (type === 'time' || type === 'timedate') {
    const timeCacheKey = `${locale}-${showSeconds}-${use12Hour}`;
    let timeFormatter = timeFormatCache.get(timeCacheKey);

    if (!timeFormatter) {
      timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: use12Hour,
      });
      timeFormatCache.set(timeCacheKey, timeFormatter);
    }

    const parts = timeFormatter.formatToParts(now);

    parts.forEach((part, index) => {
      if (part.type === 'second') {
        const span = document.createElement('span');
        span.className = 'time-seconds';
        span.textContent = part.value;
        timeNodes.push(span);
      } else if (
        part.type === 'literal' &&
        parts[index + 1]?.type === 'second'
      ) {
        const span = document.createElement('span');
        span.className = 'time-seconds';
        span.textContent = part.value;
        timeNodes.push(span);
      } else if (part.type === 'dayPeriod') {
        const span = document.createElement('span');
        span.className = 'time-ampm';
        span.textContent = part.value;
        timeNodes.push(span);
      } else {
        timeNodes.push(document.createTextNode(part.value));
      }
    });
  }

  if (type === 'date' || type === 'timedate' || type === 'weekday') {
    let dateOptions: Intl.DateTimeFormatOptions;

    if (type === 'weekday' || dateFormat === 'weekday') {
      dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    } else if (dateFormat === 'numeric') {
      dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    } else {
      dateOptions = { dateStyle: 'long' };
    }

    const dateCacheKey = `${locale}-${type}-${dateFormat}`;
    let dateFormatter = dateFormatCache.get(dateCacheKey);

    if (!dateFormatter) {
      dateFormatter = new Intl.DateTimeFormat(locale, dateOptions);
      dateFormatCache.set(dateCacheKey, dateFormatter);
    }

    dateString = dateFormatter.format(now);

    if (
      dateString &&
      (type === 'weekday' || dateFormat === 'weekday' || dateFormat === 'text')
    ) {
      dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }
  }

  let textElement = wrapper.querySelector(
    '.dynamic-display-anchor',
  ) as HTMLElement;
  if (!textElement) {
    textElement = document.createElement('h1');
    textElement.style.textAlign = 'center';
    wrapper.appendChild(textElement);
  }

  if (type === 'time') {
    textElement.className = 'dynamic-display-anchor time-date-text';
    textElement.replaceChildren(...timeNodes);
  } else if (type === 'date' || type === 'weekday') {
    textElement.className = 'dynamic-display-anchor greeting-text';
    textElement.textContent = dateString;
  } else if (type === 'timedate') {
    textElement.className = 'dynamic-display-anchor time-date-text';
    const subSpan = document.createElement('span');
    subSpan.className = 'time-date-sub';
    subSpan.textContent = dateString;
    textElement.replaceChildren(...timeNodes, subSpan);
  }
}

function renderGreeting(wrapper: HTMLElement): void {
  const rawLang = localStorage.getItem('userLanguage') || 'en_US';
  const userName = (localStorage.getItem('greetingName') || '').trim();
  const greetingStyle = localStorage.getItem('greetingStyle') || '3d';

  const now = new Date();
  const currentMinute = now.getMinutes().toString();
  const cacheKey = `${currentMinute}-${rawLang}-${userName}-${greetingStyle}`;

  if (wrapper.dataset.lastCache === cacheKey) return;

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
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const seed = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);

  if (isWeekday && seed % 3 === 0) {
    if (hour >= 5 && hour < 12) {
      translationKey = 'greetWeekMorning';
    } else if (hour >= 12 && hour < 19) {
      translationKey = 'greetWeekAfternoon';
    } else if (hour >= 19 || hour < 5) {
      translationKey = 'greetWeekNight';
    }
  }

  if (!translationKey) {
    const randomIndex = (seed % 5) + 1;
    translationKey = `${timeKeyPrefix}${randomIndex}`;
  }

  let usingFallback = false;
  const dayOfWeekKey = `weekday_${dayOfWeek}`;
  let currentDayName = '';
  const dayMessage = window.getTranslation?.(dayOfWeekKey);

  if (dayMessage && dayMessage !== dayOfWeekKey) {
    currentDayName = dayMessage;
  } else {
    usingFallback = true;
    try {
      currentDayName = chrome.i18n.getMessage(dayOfWeekKey);
    } catch (error) {
      const weekdays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      currentDayName = weekdays[dayOfWeek];
    }
  }

  let rawGreeting = '';
  const message = window.getTranslation?.(translationKey);

  if (message && message !== translationKey) {
    rawGreeting = message
      .replace(/\$WEEK\$/g, currentDayName)
      .replace(/\$NAME\$/g, userName);
  } else {
    usingFallback = true;
    try {
      if (translationKey.startsWith('greetWeek')) {
        rawGreeting = chrome.i18n.getMessage(translationKey, [
          currentDayName,
          userName,
        ]);
      } else {
        rawGreeting = chrome.i18n.getMessage(translationKey, [userName]);
      }
    } catch (error) {
      rawGreeting = translationKey;
    }
  }

  if (!userName) {
    rawGreeting = rawGreeting
      .replace(/^[\s,]+/, '')
      .replace(/,\s*([!?.,;:])/g, '$1')
      .replace(/\s+([!?.,;:])/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (rawGreeting.length > 0) {
      rawGreeting = rawGreeting.charAt(0).toUpperCase() + rawGreeting.slice(1);
    }
  }

  const finalGreetingText = rawGreeting
    .replace(/,\s*$/, '')
    .replace(/,\s*!$/, '!')
    .replace(/,\s*\?$/, '?')
    .trim();

  let fontSize = '2.5rem';
  const textLength = finalGreetingText.length;
  if (textLength > 50) fontSize = '1.375rem';
  else if (textLength > 40) fontSize = '1.625rem';
  else if (textLength > 30) fontSize = '2rem';

  const heading = document.createElement('h1');
  heading.className = 'greeting-text';
  heading.style.fontSize = fontSize;
  heading.style.whiteSpace = 'nowrap';
  heading.textContent = finalGreetingText;

  if (greetingStyle === 'none') {
    wrapper.replaceChildren(heading);
  } else {
    const icon = document.createElement('img');
    icon.src =
      greetingStyle === '3d'
        ? `assets/emojis/${iconName}.webp`
        : `assets/icons/${iconName}.svg`;
    icon.alt = timeOfDayLabel;
    icon.className =
      greetingStyle === '3d' ? 'greeting-icon' : 'greeting-icon outline';
    icon.addEventListener('error', () => {
      icon.style.display = 'none';
    });

    wrapper.replaceChildren(icon, heading);
  }

  if (!usingFallback) {
    wrapper.dataset.lastCache = cacheKey;
  } else {
    wrapper.dataset.lastCache = '';
  }
}
