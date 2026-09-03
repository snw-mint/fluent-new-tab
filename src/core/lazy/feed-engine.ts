/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { getById } from '@/core/shared/dom-utils';
import { FeedData, FeedItem } from '@/core/shared/types';
import { fetchAndValidateFeed, getFeedUrls } from '@/core/lazy/feed-manager';

const CACHE_TTL = 30 * 60 * 1000;
let loadedFeeds: FeedData[] = [];
let activeFeedId = 'all';

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const time = Date.parse(dateStr);
  if (isNaN(time)) return '';

  const diffSec = Math.floor((Date.now() - time) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

function getDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return '';
  }
}

function getFaviconUrl(urlStr: string): string {
  const domain = getDomain(urlStr);
  return domain ? `https://favicon.vemetric.com/${domain}?size=32` : '';
}

function renderGridItems(items: FeedItem[]): void {
  const grid = getById<HTMLDivElement>('feedGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="feed-empty-state">
        <svg class="feed-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.75 20H5.25a3.25 3.25 0 0 1-3.245-3.066L2 16.75V6.25a2.25 2.25 0 0 1 2.096-2.245L4.25 4h12.5a2.25 2.25 0 0 1 2.245 2.096L19 6.25V7h.75a2.25 2.25 0 0 1 2.245 2.096L22 9.25v7.5a3.25 3.25 0 0 1-3.066 3.245zH5.25zm-13.5-1.5h13.5a1.75 1.75 0 0 0 1.744-1.607l.006-.143v-7.5a.75.75 0 0 0-.648-.743L19.75 8.5H19v7.75a.75.75 0 0 1-.648.743L18.25 17a.75.75 0 0 1-.743-.648l-.007-.102v-10a.75.75 0 0 0-.648-.743L16.75 5.5H4.25a.75.75 0 0 0-.743.648L3.5 6.25v10.5a1.75 1.75 0 0 0 1.606 1.744zh13.5zm6.996-4h3.006a.75.75 0 0 1 .102 1.493l-.102.007h-3.006a.75.75 0 0 1-.102-1.493zh3.006zm-3.003-3.495a.75.75 0 0 1 .75.75v3.495a.75.75 0 0 1-.75.75H5.748a.75.75 0 0 1-.75-.75v-3.495a.75.75 0 0 1 .75-.75zm-.75 1.5H6.498V14.5h1.995zm3.753-1.5h3.006a.75.75 0 0 1 .102 1.493l-.102.007h-3.006a.75.75 0 0 1-.102-1.494zh3.006zM5.748 7.502h9.504a.75.75 0 0 1 .102 1.494l-.102.006H5.748a.75.75 0 0 1-.102-1.493zh9.504z" fill="currentColor"/>
        </svg>
        <h4 class="feed-empty-title">${(window as any).getTranslation?.('feedEmptyTitle') || 'No feed items available'}</h4>
        <p class="feed-empty-desc">${(window as any).getTranslation?.('feedEmptyDesc') || 'Open Settings &gt; Feed &gt; Edit RSS to configure your sources.'}</p>
      </div>
    `;
    return;
  }

  const displayItems = items.slice(0, 25);
  const frag = document.createDocumentFragment();

  displayItems.forEach((it) => {
    const card = document.createElement('a');
    card.className = 'feed-post-card';
    card.href = it.link;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'feed-post-thumb-wrapper';

    const makePlaceholder = () => {
      const ph = document.createElement('div');
      ph.className = 'feed-post-thumb placeholder';
      ph.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.75 3A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3zm.58 16.401-5.805-5.686a.75.75 0 0 0-.966-.071l-.084.07-5.807 5.687q.274.097.582.099h11.5c.203 0 .399-.035.58-.099l-5.805-5.686zM17.75 4.5H6.25A1.75 1.75 0 0 0 4.5 6.25v11.5q.001.313.103.594l5.823-5.701a2.25 2.25 0 0 1 3.02-.116l.128.116 5.822 5.702q.102-.28.104-.595V6.25a1.75 1.75 0 0 0-1.75-1.75m-2.498 2a2.252 2.252 0 1 1 0 4.504 2.252 2.252 0 0 1 0-4.504m0 1.5a.752.752 0 1 0 0 1.504.752.752 0 0 0 0-1.504" fill="currentColor"/></svg>`;
      return ph;
    };

    if (it.imageUrl) {
      const img = document.createElement('img');
      img.className = 'feed-post-thumb';
      img.src = it.imageUrl;
      img.alt = it.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.setAttribute('fetchpriority', 'low');
      img.onerror = () => {
        img.remove();
        thumbWrap.appendChild(makePlaceholder());
      };
      thumbWrap.appendChild(img);
    } else {
      thumbWrap.appendChild(makePlaceholder());
    }

    const meta = document.createElement('div');
    meta.className = 'feed-post-meta';

    const faviconUrl = getFaviconUrl(it.link);
    if (faviconUrl) {
      const fav = document.createElement('img');
      fav.className = 'feed-post-favicon';
      fav.src = faviconUrl;
      fav.alt = '';
      fav.width = 16;
      fav.height = 16;
      fav.loading = 'lazy';
      fav.decoding = 'async';
      fav.setAttribute('fetchpriority', 'low');
      fav.onerror = () => fav.remove();
      meta.appendChild(fav);
    }

    const source = document.createElement('span');
    source.className = 'feed-post-source';
    source.textContent = it.feedTitle || getDomain(it.link);
    meta.appendChild(source);

    const relTime = formatRelativeTime(it.pubDate);
    if (relTime) {
      const dot = document.createElement('span');
      dot.className = 'feed-post-dot';
      dot.innerHTML = '&bull;';
      meta.appendChild(dot);

      const timeSpan = document.createElement('span');
      timeSpan.className = 'feed-post-time';
      timeSpan.textContent = relTime;
      meta.appendChild(timeSpan);
    }

    const title = document.createElement('h4');
    title.className = 'feed-post-title';
    title.textContent = it.title;

    card.appendChild(thumbWrap);
    card.appendChild(meta);
    card.appendChild(title);

    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

function interleaveFeeds(feeds: FeedData[]): FeedItem[] {
  const queues = feeds
    .filter((f) => Array.isArray(f.items) && f.items.length > 0)
    .map((f) => {
      const copy = f.items.map((it) => ({
        ...it,
        feedTitle: it.feedTitle || f.title,
      }));
      copy.sort((a, b) => {
        const ta = Date.parse(a.pubDate) || 0;
        const tb = Date.parse(b.pubDate) || 0;
        return tb - ta;
      });
      return copy;
    });

  if (queues.length === 0) return [];

  const mixed: FeedItem[] = [];
  let idx = 0;
  let remaining = true;

  while (remaining && mixed.length < 50) {
    remaining = false;
    for (let i = 0; i < queues.length; i++) {
      const q = queues[i];
      if (idx < q.length) {
        mixed.push(q[idx]);
        remaining = true;
      }
    }
    idx++;
  }

  return mixed;
}

function updateGridDisplay(): void {
  if (activeFeedId === 'all') {
    const mixed = interleaveFeeds(loadedFeeds);
    renderGridItems(mixed);
  } else {
    const idx = parseInt(activeFeedId, 10);
    const targetFeed = loadedFeeds[idx];
    renderGridItems(targetFeed ? targetFeed.items : []);
  }
}

function renderNavTabs(): void {
  const nav = getById<HTMLElement>('feedNav');
  if (!nav) return;

  nav.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = `feed-nav-item ${activeFeedId === 'all' ? 'active' : ''}`;
  allBtn.setAttribute('data-feed-id', 'all');

  const allSpan = document.createElement('span');
  allSpan.textContent = (window as any).getTranslation?.('feedAll') || 'All';
  allBtn.appendChild(allSpan);

  allBtn.addEventListener('click', () => {
    activeFeedId = 'all';
    nav.querySelectorAll('.feed-nav-item').forEach((b) => b.classList.remove('active'));
    allBtn.classList.add('active');
    updateGridDisplay();
  });

  nav.appendChild(allBtn);

  loadedFeeds.forEach((feed, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `feed-nav-item ${activeFeedId === String(idx) ? 'active' : ''}`;
    btn.setAttribute('data-feed-id', String(idx));

    const span = document.createElement('span');
    span.textContent = feed.title;
    btn.appendChild(span);

    btn.addEventListener('click', () => {
      activeFeedId = String(idx);
      nav.querySelectorAll('.feed-nav-item').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      updateGridDisplay();
    });

    nav.appendChild(btn);
  });
}

export async function loadAndRenderFeeds(): Promise<void> {
  const urls = getFeedUrls();

  if (!Array.isArray(urls) || urls.length === 0) {
    loadedFeeds = [];
    renderNavTabs();
    renderGridItems([]);
    return;
  }

  const cachedList: FeedData[] = [];
  const urlsToFetch: string[] = [];

  urls.forEach((u) => {
    const key = `feedCache_${u}`;
    try {
      const s = localStorage.getItem(key);
      if (s) {
        const d = JSON.parse(s) as FeedData;
        if (d && Array.isArray(d.items)) {
          cachedList.push(d);
          if (Date.now() - (d.updatedAt || 0) >= CACHE_TTL) {
            urlsToFetch.push(u);
          }
          return;
        }
      }
    } catch {}
    urlsToFetch.push(u);
  });

  if (cachedList.length > 0) {
    loadedFeeds = cachedList;
    renderNavTabs();
    updateGridDisplay();
  }

  if (urlsToFetch.length === 0) return;

  const results = await Promise.allSettled(
    urlsToFetch.map(async (u) => {
      const fresh = await fetchAndValidateFeed(u);
      try {
        localStorage.setItem(`feedCache_${u}`, JSON.stringify(fresh));
      } catch {}
      return fresh;
    })
  );

  const freshMap = new Map<string, FeedData>();
  results.forEach((r) => {
    if (r.status === 'fulfilled' && r.value) {
      freshMap.set(r.value.url, r.value);
    }
  });

  const updated: FeedData[] = [];
  urls.forEach((u) => {
    const item = freshMap.get(u) || cachedList.find((c) => c.url === u);
    if (item) {
      updated.push(item);
    }
  });

  if (updated.length > 0) {
    loadedFeeds = updated;
    if (activeFeedId !== 'all' && parseInt(activeFeedId, 10) >= loadedFeeds.length) {
      activeFeedId = 'all';
    }
    renderNavTabs();
    updateGridDisplay();
  }
}
