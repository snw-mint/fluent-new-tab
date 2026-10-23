/*
 * Fluent New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

let displayInterval: number | null = null;

export function getDisplayScaleBounds(displayType: string): {
  min: number;
  max: number;
} {
  const hasSearch = localStorage.getItem('searchBarVisible') !== 'false';
  const hasShortcuts = localStorage.getItem('shortcutsVisible') !== 'false';

  if (displayType === 'greeting') {
    return { min: 50, max: 140 };
  }
  if (displayType === 'date' || displayType === 'weekday') {
    if (!hasSearch && !hasShortcuts) {
      return { min: 50, max: 220 };
    }
    if (!hasSearch || !hasShortcuts) {
      return { min: 50, max: 180 };
    }
    return { min: 50, max: 150 };
  }
  if (displayType === 'timedate') {
    if (!hasSearch && !hasShortcuts) {
      return { min: 50, max: 270 };
    }
    if (!hasSearch || !hasShortcuts) {
      return { min: 50, max: 230 };
    }
    return { min: 50, max: 190 };
  }
  if (!hasSearch && !hasShortcuts) {
    return { min: 50, max: 300 };
  }
  if (!hasSearch || !hasShortcuts) {
    return { min: 50, max: 250 };
  }
  return { min: 50, max: 200 };
}

export function getDisplayScaleForType(displayType: string): number {
  const bounds = getDisplayScaleBounds(displayType);
  const saved =
    localStorage.getItem(`displayScale_${displayType}`) ||
    localStorage.getItem('displayScale');
  const parsed = saved ? parseInt(saved, 10) : 85;
  return Math.min(bounds.max, Math.max(bounds.min, parsed));
}

export function applyDisplayScale(
  displayType: string,
  customScale?: number,
): number {
  const scale =
    customScale !== undefined
      ? customScale
      : getDisplayScaleForType(displayType);
  document.documentElement.style.setProperty(
    '--display-scale',
    `${scale / 100}`,
  );
  return scale;
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
  const currentMode = localStorage.getItem('displayType') || 'greeting';
  applyDisplayScale(currentMode);
  updateDisplayContent(wrapper);
  displayInterval = window.setInterval(() => {
    updateDisplayContent(wrapper);
  }, 1000);
}

function updateDisplayContent(wrapper: HTMLElement): void {
  let displayType = localStorage.getItem('displayType') || 'greeting';
  if (displayType === 'time-date') {
    displayType = 'timedate';
  }
  if (wrapper.dataset.currentMode !== displayType) {
    wrapper.textContent = '';
    wrapper.dataset.currentMode = displayType;
    wrapper.dataset.lastCache = '';
  }
  if (displayType === 'greeting') {
    renderGreeting(wrapper);
  } else {
    renderTimeDate(wrapper, displayType);
  }
}

export function getValidTimezone(tz?: string | null): string | undefined {
  if (!tz || tz === 'auto') return undefined;
  const trimmed = tz.trim();
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return trimmed;
  } catch {
    const match = trimmed.match(/^(?:UTC|GMT)?\s*([+-]\d{1,2})(?::?(\d{2}))?$/i);
    if (match) {
      const hours = parseInt(match[1], 10);
      const invertedSign =
        hours <= 0 ? `+${Math.abs(hours)}` : `-${Math.abs(hours)}`;
      const etcTz = `Etc/GMT${invertedSign}`;
      try {
        Intl.DateTimeFormat(undefined, { timeZone: etcTz });
        return etcTz;
      } catch {}
    }
    return undefined;
  }
}

export function formatCustomDateTime(
  now: Date,
  pattern: string,
  timeZone?: string,
): string {
  const validTz = getValidTimezone(timeZone);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: validTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  let year = '';
  let month = '';
  let day = '';
  let hour = '';
  let minute = '';
  let second = '';

  for (const part of parts) {
    if (part.type === 'year') year = part.value;
    else if (part.type === 'month') month = part.value;
    else if (part.type === 'day') day = part.value;
    else if (part.type === 'hour') hour = part.value;
    else if (part.type === 'minute') minute = part.value;
    else if (part.type === 'second') second = part.value;
  }

  const h24 = parseInt(hour, 10) || 0;
  const h12 = h24 % 12 || 12;

  const tokens: Record<string, string> = {
    '%YYYY': year,
    '%YY': year.slice(-2),
    '%MM': month,
    '%M': String(parseInt(month, 10) || 0),
    '%DD': day,
    '%D': String(parseInt(day, 10) || 0),
    '%HH': hour.padStart(2, '0'),
    '%H': String(h24),
    '%hh': String(h12).padStart(2, '0'),
    '%h': String(h12),
    '%mm': minute.padStart(2, '0'),
    '%m': String(parseInt(minute, 10) || 0),
    '%ss': second.padStart(2, '0'),
    '%s': String(parseInt(second, 10) || 0),
    '%A': h24 >= 12 ? 'PM' : 'AM',
    '%a': h24 >= 12 ? 'pm' : 'am',
  };

  return pattern.replace(
    /%(YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a)/g,
    (match) => tokens[match] ?? match,
  );
}

function getZonedDateInfo(
  now: Date,
  timeZone?: string,
): {
  hour: number;
  minute: number;
  dayOfWeek: number;
} {
  if (!timeZone) {
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      dayOfWeek: now.getDay(),
    };
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(now);

  let hour = now.getHours();
  let minute = now.getMinutes();
  let dayOfWeek = now.getDay();

  for (const part of parts) {
    if (part.type === 'hour') {
      hour = parseInt(part.value, 10) || 0;
    } else if (part.type === 'minute') {
      minute = parseInt(part.value, 10) || 0;
    } else if (part.type === 'weekday') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const idx = days.indexOf(part.value);
      if (idx !== -1) dayOfWeek = idx;
    }
  }

  return { hour, minute, dayOfWeek };
}

function renderTimeDate(wrapper: HTMLElement, type: string): void {
  const rawLang = localStorage.getItem('userLanguage') || 'en_US';
  const locale = rawLang.replace('_', '-');
  const timezone = getValidTimezone(localStorage.getItem('clockTimezone'));
  const timeFormat = localStorage.getItem('timeFormat') || '24h';
  let dateFormat = localStorage.getItem('dateFormat');
  if (!dateFormat) {
    dateFormat = 'weekday';
  }

  const now = new Date();
  const timeNodes: Node[] = [];
  let dateString = '';

  if (type === 'time' || type === 'timedate') {
    if (timeFormat === 'custom') {
      const pattern =
        (localStorage.getItem('customTimeFormat') || '').trim() || '%HH:%mm';
      const formatted = formatCustomDateTime(now, pattern, timezone);
      timeNodes.push(document.createTextNode(formatted));
    } else {
      const showSeconds =
        timeFormat === '24h-seconds' || timeFormat === '12h-seconds';
      const use12Hour = timeFormat === '12h' || timeFormat === '12h-seconds';

      const parts = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: use12Hour,
        timeZone: timezone,
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

    dateString = new Intl.DateTimeFormat(locale, {
      ...dateOptions,
      timeZone: timezone,
    }).format(now);
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
  const timezone = getValidTimezone(localStorage.getItem('clockTimezone'));

  const now = new Date();
  const { hour, minute, dayOfWeek } = getZonedDateInfo(now, timezone);
  const currentMinute = minute.toString();
  const cacheKey = `${currentMinute}-${rawLang}-${userName}-${timezone || 'local'}`;

  if (wrapper.dataset.lastCache === cacheKey) return;

  let timeKeyPrefix: string;
  if (hour >= 5 && hour < 12) {
    timeKeyPrefix = 'greetMorning';
  } else if (hour >= 12 && hour < 18) {
    timeKeyPrefix = 'greetAfternoon';
  } else if (hour >= 18) {
    timeKeyPrefix = 'greetEvening';
  } else {
    timeKeyPrefix = 'greetNight';
  }

  let translationKey = '';
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const seed = hour * 2 + Math.floor(minute / 30);

  if (isWeekday && seed % 3 === 0) {
    if (hour >= 5 && hour < 12) translationKey = 'greetWeekMorning';
    else if (hour >= 12 && hour < 18) translationKey = 'greetWeekAfternoon';
    else if (hour >= 18) translationKey = 'greetWeekNight';
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
    rawGreeting = message;
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

  if (translationKey.startsWith('greetWeek')) {
    rawGreeting = rawGreeting
      .replace(/\$(?:WEEK|SEMANA|DAY|DIA)\$/gi, currentDayName)
      .replace(/\$(?:NAME|NOMBRE|USER|USUARIO)\$/gi, userName);
    if (rawGreeting.includes(currentDayName)) {
      rawGreeting = rawGreeting.replace(/\$[A-Z0-9_]+\$/gi, userName);
    } else {
      rawGreeting = rawGreeting
        .replace(/\$[A-Z0-9_]+\$/i, currentDayName)
        .replace(/\$[A-Z0-9_]+\$/gi, userName);
    }
  } else {
    rawGreeting = rawGreeting
      .replace(/\$(?:NAME|NOMBRE|USER|USUARIO)\$/gi, userName)
      .replace(/\$[A-Z0-9_]+\$/gi, userName);
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

  const heading = document.createElement('h1');
  heading.className = 'greeting-text';
  const highlightEnabled = localStorage.getItem('highlightName') === 'true';
  if (highlightEnabled && userName) {
    const escapedName = userName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedName})`, 'gi');
    const parts = finalGreetingText.split(regex);

    heading.textContent = '';
    parts.forEach((part) => {
      if (part.toLowerCase() === userName.toLowerCase()) {
        const nameSpan = document.createElement('span');
        nameSpan.className = 'highlighted-name';
        nameSpan.textContent = part;
        heading.appendChild(nameSpan);
      } else if (part) {
        heading.appendChild(document.createTextNode(part));
      }
    });
  } else {
    heading.textContent = finalGreetingText;
  }

  wrapper.replaceChildren(heading);

  wrapper.dataset.lastCache = usingFallback ? '' : cacheKey;
}
