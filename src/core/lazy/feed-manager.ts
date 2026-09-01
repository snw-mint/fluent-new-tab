import { getById } from '@/core/shared/dom-utils';
import { FeedData, FeedItem } from '@/core/shared/types';

const PLUS_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75" fill="currentColor"/></svg>`;
const MAX_FEEDS = 5;

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
      const pubDate = n.querySelector('pubDate')?.textContent || '';
      const rawDesc = n.querySelector('description')?.textContent || n.querySelector('encoded')?.textContent || '';
      const desc = sanitizeText(rawDesc);

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
        const media = n.querySelector('content[url], thumbnail[url]');
        if (media) {
          imgUrl = sanitizeHttpsUrl(media.getAttribute('url') || '');
        }
      }

      if (itTitle && lnk) {
        items.push({
          title: itTitle,
          link: lnk,
          pubDate,
          description: desc,
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
      const pubDate = n.querySelector('updated, published')?.textContent || '';
      const rawSummary = n.querySelector('summary, content')?.textContent || '';
      const desc = sanitizeText(rawSummary);

      let imgUrl: string | undefined;
      const media = n.querySelector('thumbnail, content[type^="image"]');
      if (media) {
        imgUrl = sanitizeHttpsUrl(media.getAttribute('url') || '');
      }

      if (itTitle && lnk) {
        items.push({
          title: itTitle,
          link: lnk,
          pubDate,
          description: desc,
          imageUrl: imgUrl,
          feedTitle: title,
        });
      }
    });
  }

  if (items.length === 0) {
    throw new Error('No items found in feed');
  }

  return {
    url: feedUrl,
    title: title || new URL(feedUrl).hostname,
    items,
    updatedAt: Date.now(),
  };
}

async function fetchAndValidateFeed(url: string): Promise<FeedData> {
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
  const { warningModal } = await import('@/core/ui/ui-components');

  const hasPerm = await checkPermission([origin]);
  if (hasPerm) return true;

  return new Promise((resolve) => {
    let domain = origin;
    try {
      domain = new URL(origin.replace('/*', '')).hostname;
    } catch {}

    warningModal.show({
      title: 'Permission Required',
      message: `Fluent New Tab needs permission to access "${domain}" to load the RSS feed.`,
      confirmText: 'Grant Permission',
      cancelText: 'Cancel',
      confirmVariant: 'accent',
      showPrivacyPolicy: false,
      onConfirm: () => {
        requestPermission([origin]).then((granted) => {
          resolve(granted);
        });
      },
      onCancel: () => {
        resolve(false);
      },
    });
  });
}

function updateCompleteButtonState(): void {
  const saveBtn = getById<HTMLButtonElement>('saveFeedModalBtn');
  if (!saveBtn) return;
  const validInputs = document.querySelectorAll('.feed-url-input[data-validated="true"]');
  saveBtn.disabled = validInputs.length === 0;
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
  btn.innerHTML = PLUS_ICON;
  btn.title = 'Validate & Add';
  btn.disabled = !isValidHttpsUrl(initialVal);

  inp.addEventListener('input', () => {
    const valid = isValidHttpsUrl(inp.value);
    btn.disabled = !valid;
    if (!valid) {
      inp.removeAttribute('data-validated');
      updateCompleteButtonState();
    }
  });

  btn.addEventListener('click', async () => {
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
      updateCompleteButtonState();
      setTimeout(() => {
        inp.classList.remove('is-valid');
      }, 3000);
    } catch (err: any) {
      inp.removeAttribute('data-validated');
      inp.classList.add('is-invalid');
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
      btn.disabled = !isValidHttpsUrl(inp.value);
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
        localStorage.setItem('feedRssUrls', JSON.stringify(urls.slice(0, MAX_FEEDS)));
        closeFeedModal();
      });
    }
  }

  container.innerHTML = '';
  let savedUrls: string[] = [];
  try {
    savedUrls = JSON.parse(localStorage.getItem('feedRssUrls') || '[]');
  } catch {
    savedUrls = [];
  }

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
