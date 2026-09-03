/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { getById } from '@/core/shared/dom-utils';
import { FeedData, FeedItem } from '@/core/shared/types';

const PLUS_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75" fill="currentColor"/></svg>`;
const DELETE_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 5h4a2 2 0 1 0-4 0M8.5 5a3.5 3.5 0 1 1 7 0h5.75a.75.75 0 0 1 0 1.5h-1.32l-1.17 12.111A3.75 3.75 0 0 1 15.026 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5zm2 4.75a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0zM14.25 9a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75m-7.516 9.467a2.25 2.25 0 0 0 2.24 2.033h6.052a2.25 2.25 0 0 0 2.24-2.033L18.424 6.5H5.576z" fill="currentColor"/></svg>`;
const MAX_FEEDS = 5;

export function getFeedUrls(): string[] {
  try {
    const urls = JSON.parse(localStorage.getItem('feedRssUrls') || '[]');
    return Array.isArray(urls) ? urls : [];
  } catch {
    return [];
  }
}

let isInitialized = false;

function isValidHttpsUrl(val: string): boolean {
  try {
    const u = new URL(val.trim());
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

function getHostOriginPattern(val: string): string | null {
  try {
    const u = new URL(val.trim());
    if (u.protocol !== 'https:') return null;
    return `${u.origin}/*`;
  } catch {
    return null;
  }
}

function sanitizeText(raw: string): string {
  if (!raw) return '';
  const d = document.createElement('div');
  d.innerHTML = raw;
  return (d.textContent || d.innerText || '').trim();
}

function sanitizeHttpsUrl(urlStr: string): string | undefined {
  if (!urlStr) return undefined;
  try {
    const u = new URL(urlStr.trim());
    if (u.protocol === 'https:') return u.href;
  } catch {}
  return undefined;
}

function parseFeedXml(xmlStr: string, feedUrl: string): FeedData {
  const p = new DOMParser();
  const doc = p.parseFromString(xmlStr, 'text/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('Invalid XML document');
  }

  const chan = doc.querySelector('rss > channel, channel');
  const atom = doc.querySelector('feed');

  if (!chan && !atom) {
    throw new Error('No valid RSS or Atom feed found');
  }

  let title = '';
  const items: FeedItem[] = [];

  if (chan) {
    title = sanitizeText(chan.querySelector(':scope > title')?.textContent || '');
    const nodes = chan.querySelectorAll(':scope > item');

    nodes.forEach((n) => {
      const itTitle = sanitizeText(n.querySelector('title')?.textContent || '');
      const rawLnk = n.querySelector('link')?.textContent || '';
      const lnk = sanitizeHttpsUrl(rawLnk);
      const pubDate = n.querySelector('pubDate, date, dc\\:date')?.textContent || '';
      const rawDesc = n.querySelector('description, encoded')?.textContent || '';

      let imgUrl: string | undefined;
      const enc = n.querySelector('enclosure');
      if (enc) {
        const encType = enc.getAttribute('type') || '';
        const encUrl = enc.getAttribute('url') || '';
        if (encType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(encUrl)) {
          imgUrl = sanitizeHttpsUrl(encUrl);
        }
      }

      if (!imgUrl) {
        const media = n.querySelector('content[url], thumbnail[url], media\\:content, media\\:thumbnail');
        if (media) {
          imgUrl = sanitizeHttpsUrl(media.getAttribute('url') || '');
        }
      }

      if (!imgUrl && rawDesc) {
        const match = rawDesc.match(/<img[^>]+src=["'](https:\/\/[^"']+)["']/i);
        if (match && match[1]) {
          imgUrl = sanitizeHttpsUrl(match[1]);
        }
      }

      if (itTitle && lnk) {
        items.push({
          title: itTitle,
          link: lnk,
          pubDate,
          imageUrl: imgUrl,
          feedTitle: title,
        });
      }
    });
  } else if (atom) {
    title = sanitizeText(atom.querySelector(':scope > title')?.textContent || '');
    const nodes = atom.querySelectorAll(':scope > entry');

    nodes.forEach((n) => {
      const itTitle = sanitizeText(n.querySelector('title')?.textContent || '');
      const lnkNode = n.querySelector('link[rel="alternate"]') || n.querySelector('link:not([rel])') || n.querySelector('link');
      const rawLnk = lnkNode?.getAttribute('href') || lnkNode?.textContent || '';
      const lnk = sanitizeHttpsUrl(rawLnk);
      const pubDate = n.querySelector('updated, published, pubDate, date')?.textContent || '';
      const rawSummary = n.querySelector('summary, content')?.textContent || '';

      let imgUrl: string | undefined;
      const media = n.querySelector('thumbnail, content[type^="image"], media\\:content, media\\:thumbnail');
      if (media) {
        imgUrl = sanitizeHttpsUrl(media.getAttribute('url') || '');
      }

      if (!imgUrl && rawSummary) {
        const match = rawSummary.match(/<img[^>]+src=["'](https:\/\/[^"']+)["']/i);
        if (match && match[1]) {
          imgUrl = sanitizeHttpsUrl(match[1]);
        }
      }

      if (itTitle && lnk) {
        items.push({
          title: itTitle,
          link: lnk,
          pubDate,
          imageUrl: imgUrl,
          feedTitle: title,
        });
      }
    });
  }

  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const validItems = items.filter((it) => {
    if (!it.pubDate) return true;
    const t = Date.parse(it.pubDate);
    if (isNaN(t)) return false;
    const age = now - t;
    return age >= -3600000 && age <= maxAge;
  });

  const finalItems = validItems.length > 0 ? validItems : items;

  finalItems.sort((a, b) => {
    const ta = Date.parse(a.pubDate) || 0;
    const tb = Date.parse(b.pubDate) || 0;
    return tb - ta;
  });

  if (finalItems.length === 0) {
    throw new Error('No items found in feed');
  }

  return {
    url: feedUrl,
    title: title || new URL(feedUrl).hostname,
    items: finalItems.slice(0, 50),
    updatedAt: Date.now(),
  };
}

export async function fetchAndValidateFeed(url: string): Promise<FeedData> {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }

  const txt = await res.text();
  return parseFeedXml(txt, url);
}

async function requestHostPermission(origin: string): Promise<boolean> {
  const { checkPermission, requestPermission } = await import('@/core/shared/permissions');
  const hasPerm = await checkPermission([origin]);
  if (hasPerm) return true;
  return requestPermission([origin]);
}

function updateCompleteButtonState(): void {
  const saveBtn = getById<HTMLButtonElement>('saveFeedModalBtn');
  if (!saveBtn) return;
  saveBtn.disabled = false;
}

function updateAddFieldButtonState(): void {
  const addBtn = getById<HTMLButtonElement>('feedAddFieldBtn');
  const container = getById<HTMLDivElement>('feedInputsContainer');
  if (!addBtn || !container) return;
  const count = container.querySelectorAll('.feed-input-row').length;
  addBtn.style.display = count >= MAX_FEEDS ? 'none' : 'inline-flex';
}

function createFeedRow(initialVal = '', isValidated = false): HTMLElement {
  const row = document.createElement('div');
  row.className = 'feed-input-row';

  const grp = document.createElement('div');
  grp.className = 'input-group';

  const lbl = document.createElement('label');
  lbl.textContent = 'RSS URL';

  const wrap = document.createElement('div');
  wrap.className = 'feed-input-wrapper';

  const inp = document.createElement('input');
  inp.type = 'url';
  inp.className = 'feed-url-input';
  inp.placeholder = 'https://example.com/feed.xml';
  inp.value = initialVal;
  if (isValidated) {
    inp.setAttribute('data-validated', 'true');
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'feed-add-btn';

  const setButtonState = (validated: boolean) => {
    if (validated) {
      btn.innerHTML = DELETE_ICON;
      btn.title = 'Remove';
      btn.classList.add('delete-btn');
      btn.disabled = false;
    } else {
      btn.innerHTML = PLUS_ICON;
      btn.title = 'Validate & Add';
      btn.classList.remove('delete-btn');
      btn.disabled = !isValidHttpsUrl(inp.value);
    }
  };

  setButtonState(isValidated);

  inp.addEventListener('input', () => {
    const valid = isValidHttpsUrl(inp.value);
    inp.removeAttribute('data-validated');
    setButtonState(false);
    btn.disabled = !valid;
    updateCompleteButtonState();
  });

  btn.addEventListener('click', async () => {
    if (inp.hasAttribute('data-validated')) {
      const container = getById<HTMLDivElement>('feedInputsContainer');
      const rows = container?.querySelectorAll('.feed-input-row') || [];
      if (rows.length > 1) {
        row.remove();
      } else {
        inp.value = '';
        inp.removeAttribute('data-validated');
        setButtonState(false);
      }
      updateAddFieldButtonState();
      updateCompleteButtonState();
      return;
    }

    const rawVal = inp.value.trim();
    if (!isValidHttpsUrl(rawVal)) {
      inp.classList.add('is-invalid');
      setTimeout(() => inp.classList.remove('is-invalid'), 2500);
      return;
    }

    const origin = getHostOriginPattern(rawVal);
    if (!origin) return;

    btn.disabled = true;

    try {
      const granted = await requestHostPermission(origin);
      if (!granted) {
        btn.disabled = false;
        return;
      }

      const feedData = await fetchAndValidateFeed(rawVal);
      try {
        localStorage.setItem(`feedCache_${rawVal}`, JSON.stringify(feedData));
      } catch {}

      inp.setAttribute('data-validated', 'true');
      inp.classList.remove('is-invalid');
      inp.classList.add('is-valid');
      setButtonState(true);
      updateCompleteButtonState();
      updateAddFieldButtonState();
      setTimeout(() => {
        inp.classList.remove('is-valid');
      }, 3000);
    } catch (err: any) {
      inp.removeAttribute('data-validated');
      inp.classList.add('is-invalid');
      setButtonState(false);
      updateCompleteButtonState();
      setTimeout(() => inp.classList.remove('is-invalid'), 3000);

      const { warningModal } = await import('@/core/ui/ui-components');
      warningModal.show({
        title: 'Feed Error',
        message: err?.message || 'Failed to fetch or parse the RSS feed. Please check the URL.',
        confirmText: 'OK',
        confirmVariant: 'accent',
        onConfirm: () => {},
      });
    } finally {
      if (!inp.hasAttribute('data-validated')) {
        btn.disabled = !isValidHttpsUrl(inp.value);
      }
    }
  });

  wrap.appendChild(inp);
  wrap.appendChild(btn);
  grp.appendChild(lbl);
  grp.appendChild(wrap);
  row.appendChild(grp);

  return row;
}

export function closeFeedModal(): void {
  const modal = getById<HTMLDivElement>('feedModal');
  if (modal) modal.classList.remove('active');
}

export function openFeedModal(): void {
  const modal = getById<HTMLDivElement>('feedModal');
  const container = getById<HTMLDivElement>('feedInputsContainer');
  if (!modal || !container) return;

  if (!isInitialized) {
    isInitialized = true;
    const addBtn = getById<HTMLButtonElement>('feedAddFieldBtn');
    const closeBtn = getById<HTMLButtonElement>('closeFeedModalBtn');
    const form = getById<HTMLFormElement>('feedForm');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const count = container.querySelectorAll('.feed-input-row').length;
        if (count < MAX_FEEDS) {
          container.appendChild(createFeedRow());
          updateAddFieldButtonState();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeFeedModal);
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = container.querySelectorAll<HTMLInputElement>('.feed-url-input[data-validated="true"]');
        const urls: string[] = [];
        inputs.forEach((input) => {
          const val = input.value.trim();
          if (val && isValidHttpsUrl(val)) urls.push(val);
        });

        getFeedUrls()
          .filter((u) => !urls.includes(u))
          .forEach((u) => localStorage.removeItem(`feedCache_${u}`));

        localStorage.setItem('feedRssUrls', JSON.stringify(urls.slice(0, MAX_FEEDS)));
        closeFeedModal();

        const isFeedEnabled = localStorage.getItem('feedEnabled') === 'true';
        const hasFeeds = urls.length > 0;
        const active = isFeedEnabled && hasFeeds;
        document.documentElement.setAttribute('data-feed-active', String(active));
        document.body.dataset.feedActive = String(active);

        const drawer = document.getElementById('feedDrawer');
        if (drawer) {
          drawer.style.display = active ? '' : 'none';
          if (!active) {
            drawer.classList.remove('open');
            document.getElementById('early-feed-style')?.remove();
          }
        }

        if (active) {
          import('@/core/lazy/feed-engine').then(({ loadAndRenderFeeds }) => {
            loadAndRenderFeeds();
          });
          import('@/core/lazy/feed-scroll').then(({ initFeedScroll }) => {
            initFeedScroll();
          });
        }

        import('@/core/lazy/providers/weather-api').then(
          ({ renderWeatherAlertWidget }) => {
            renderWeatherAlertWidget();
          },
        );
      });
    }
  }

  container.innerHTML = '';
  const savedUrls = getFeedUrls();

  if (savedUrls.length > 0) {
    savedUrls.slice(0, MAX_FEEDS).forEach((url) => {
      container.appendChild(createFeedRow(url, true));
    });
  } else {
    container.appendChild(createFeedRow('', false));
  }

  updateAddFieldButtonState();
  updateCompleteButtonState();
  modal.classList.add('active');
}
