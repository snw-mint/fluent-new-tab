/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

export let displayInterval: number | null = null;

export const CDN_BASE_URL =
  'https://cdn.jsdelivr.net/gh/snw-mint/fluent-new-tab@cdn-greeting-assets/assets';

export const emojiMap: Record<string, string> = {
  greetWeekMorning: 'e1',
  greetMorning1: 'e2',
  greetMorning2: 'e3',
  greetMorning3: 'e4',
  greetMorning4: 'e5',
  greetMorning5: 'e6',
  greetWeekAfternoon: 'e7',
  greetAfternoon1: 'e1',
  greetAfternoon2: 'e8',
  greetAfternoon3: 'e9',
  greetAfternoon4: 'e4',
  greetAfternoon5: 'e10',
  greetWeekNight: 'e15',
  greetEvening1: 'e11',
  greetEvening2: 'e8',
  greetEvening3: 'e12',
  greetEvening4: 'e13',
  greetEvening5: 'e14',
  greetNight1: 'e16',
  greetNight2: 'e17',
  greetNight3: 'e18',
  greetNight4: 'e19',
  greetNight5: 'e20',
};

export function getEmojiUrl(emojiId: string, isAnimated: boolean): string {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const finalAnimated = isAnimated && !prefersReducedMotion;
  const folder = finalAnimated ? 'animated' : 'static';
  const suffix = finalAnimated ? 'a' : 's';
  return `${CDN_BASE_URL}/${folder}/${emojiId}${suffix}.webp`;
}

export function initDisplayWidget(wrapper: HTMLElement | null): void {
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

export function updateDisplayContent(wrapper: HTMLElement): void {
  let displayType = localStorage.getItem('displayType') || 'greeting';
  if (displayType === 'time-date') {
    displayType = 'timedate';
  }
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

export function renderTimeDate(wrapper: HTMLElement, type: string): void {
  const rawLang = localStorage.getItem('userLanguage') || 'en_US';
  const locale = rawLang.replace('_', '-');
  const showSeconds = localStorage.getItem('showSeconds') === 'true';
  const use12Hour = localStorage.getItem('use12Hour') === 'true';
  let dateFormat = localStorage.getItem('dateFormat');
  if (!dateFormat) {
    dateFormat = type === 'timedate' ? 'weekday' : 'text';
  }

  const now = new Date();
  const timeNodes: Node[] = [];
  let dateString = '';

  if (type === 'time' || type === 'timedate') {
    const parts = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: use12Hour,
    }).formatToParts(now);

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
        span.style.position = 'absolute';
        if (index === 0) {
          span.style.transform = 'translateX(calc(-100% - 0.5rem))';
        }
        span.textContent = part.value;
        timeNodes.push(span);
      } else if (
        part.type === 'literal' &&
        (parts[index + 1]?.type === 'dayPeriod' ||
          parts[index - 1]?.type === 'dayPeriod')
      ) {
        const trimmed = part.value.trim();
        if (trimmed.length > 0) {
          timeNodes.push(document.createTextNode(trimmed));
        }
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

    dateString = new Intl.DateTimeFormat(locale, dateOptions).format(now);
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

export function renderGreeting(wrapper: HTMLElement): void {
  const rawLang = localStorage.getItem('userLanguage') || 'en_US';
  const userName = (localStorage.getItem('greetingName') || '').trim();
  const greetingType = localStorage.getItem('greetingType') || 'static';

  const now = new Date();
  const currentMinute = now.getMinutes().toString();
  const cacheKey = `${currentMinute}-${rawLang}-${userName}-${greetingType}`;

  if (wrapper.dataset.lastCache === cacheKey) return;

  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  let timeKeyPrefix = 'greetMorning';

  if (hour >= 5 && hour < 12) {
    timeKeyPrefix = 'greetMorning';
  } else if (hour >= 12 && hour < 18) {
    timeKeyPrefix = 'greetAfternoon';
  } else if (hour >= 18 && hour < 24) {
    timeKeyPrefix = 'greetEvening';
  } else {
    timeKeyPrefix = 'greetNight';
  }

  let translationKey = '';
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const seed = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);

  if (isWeekday && seed % 3 === 0) {
    if (hour >= 5 && hour < 12) {
      translationKey = 'greetWeekMorning';
    } else if (hour >= 12 && hour < 18) {
      translationKey = 'greetWeekAfternoon';
    } else if (hour >= 18 && hour < 24) {
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
  const dayMessage = (window as any).getTranslation?.(dayOfWeekKey);

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
  const message = (window as any).getTranslation?.(translationKey);

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

  const fontSize = '2.25rem';
  const heading = document.createElement('h1');
  heading.className = 'greeting-text';
  heading.style.fontSize = fontSize;
  heading.style.whiteSpace = 'nowrap';
  heading.textContent = finalGreetingText;

  if (greetingType === 'none') {
    wrapper.replaceChildren(heading);
  } else {
    const emojiId = emojiMap[translationKey] || 'e1';
    const isAnimated = greetingType === 'animated';
    const iconUrl = getEmojiUrl(emojiId, isAnimated);

    const icon = document.createElement('img');
    icon.src = iconUrl;
    icon.alt = 'Greeting Emoji';
    icon.className = 'greeting-icon';
    icon.style.opacity = '0';
    icon.style.transition = 'opacity 0.35s ease-out';

    icon.onload = () => {
      icon.style.opacity = '1';
    };

    icon.onerror = () => {
      icon.style.display = 'none';
    };

    wrapper.replaceChildren(icon, heading);
  }

  if (!usingFallback) {
    wrapper.dataset.lastCache = cacheKey;
  } else {
    wrapper.dataset.lastCache = '';
  }
}
