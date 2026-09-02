/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { getById } from '@/core/shared/dom-utils';

let isScrollInitialized = false;
let isAnimating = false;

function setDrawerOpen(open: boolean): void {
  const drawer = getById<HTMLDivElement>('feedDrawer');
  if (!drawer || isAnimating) return;
  const isOpen = drawer.classList.contains('open');
  if (isOpen === open) return;

  isAnimating = true;
  drawer.classList.toggle('open', open);
  setTimeout(() => {
    isAnimating = false;
  }, 380);
}

export function openFeedDrawer(): void {
  setDrawerOpen(true);
}

export function closeFeedDrawer(): void {
  setDrawerOpen(false);
}

export function isFeedDrawerOpen(): boolean {
  const drawer = getById<HTMLDivElement>('feedDrawer');
  return Boolean(drawer?.classList.contains('open'));
}

export function initFeedScroll(): void {
  if (isScrollInitialized) return;
  isScrollInitialized = true;

  const drawer = getById<HTMLDivElement>('feedDrawer');
  const card = getById<HTMLDivElement>('feedCard');
  const content = getById<HTMLDivElement>('feedContent');
  const header = card?.querySelector('.feed-header');

  if (!drawer || !card) return;

  const hasActiveModal = (): boolean => {
    return Boolean(
      document.querySelector('.modal-overlay.active') ||
      document.querySelector('.settings-popup.active') ||
      document.querySelector('.launcher-popup.active')
    );
  };

  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (hasActiveModal() || isAnimating || drawer.style.display === 'none') return;

      const target = e.target as HTMLElement | null;
      if (target?.closest('.shortcuts-grid, .launcher-grid, .settings-popup')) {
        return;
      }

      const isOpen = drawer.classList.contains('open');

      if (!isOpen) {
        if (e.deltaY > 20) {
          e.preventDefault();
          setDrawerOpen(true);
        }
      } else {
        const isOverContent = Boolean(target?.closest('#feedContent'));
        if (isOverContent && content) {
          if (content.scrollTop <= 0 && e.deltaY < -20) {
            e.preventDefault();
            setDrawerOpen(false);
          }
        } else if (e.deltaY < -20) {
          e.preventDefault();
          setDrawerOpen(false);
        }
      }
    },
    { passive: false }
  );

  header?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.feed-nav, .feed-header-actions, button')) return;
    if (!drawer.classList.contains('open')) {
      setDrawerOpen(true);
    }
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && drawer.classList.contains('open') && !hasActiveModal()) {
      setDrawerOpen(false);
    }
  });
}
