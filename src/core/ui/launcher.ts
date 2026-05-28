/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import * as refs from '@/core/shared/dom-refs';
import { foldersEnabled } from '@/core/shared/state';
import { LauncherProviderData } from '@/core/shared/types';
import { launcherData } from '@/core/ui/launcher-data';

interface LauncherVisibilityRefs {
  appLauncherWrapper: HTMLElement | null;
  launcherSelectGroup: HTMLElement | null;
}

interface LauncherRenderRefs {
  launcherGrid: HTMLElement | null;
  launcherAllAppsLink: HTMLAnchorElement | null;
}

export function updateLauncherVisibilityUI(
  enabled: boolean,
  animate: boolean,
  visibilityRefs: LauncherVisibilityRefs,
  setCollapsibleFn: (
    element: HTMLElement | null,
    shouldExpand: boolean,
    animate?: boolean,
  ) => void,
): void {
  if (visibilityRefs.appLauncherWrapper) {
    visibilityRefs.appLauncherWrapper.style.display = enabled
      ? 'block'
      : 'none';
  }
  if (visibilityRefs.launcherSelectGroup) {
    setCollapsibleFn(visibilityRefs.launcherSelectGroup, enabled, animate);
  }
}

export function renderLauncherApps(
  data: LauncherProviderData | undefined,
  renderRefs: LauncherRenderRefs,
): void {
  if (!data || !renderRefs.launcherGrid) return;

  const orderString = localStorage.getItem('launcherOrder');
  let orderedApps = [...data.apps];

  if (orderString) {
    try {
      const orderIds = JSON.parse(orderString) as string[];
      if (Array.isArray(orderIds)) {
        const ordered = [];
        const remaining = [...orderedApps];
        for (const id of orderIds) {
          const index = remaining.findIndex((a) => a.name === id);
          if (index !== -1) {
            ordered.push(remaining.splice(index, 1)[0]);
          }
        }
        orderedApps = [...ordered, ...remaining];
      }
    } catch {}
  }

  renderRefs.launcherGrid.innerHTML = '';
  orderedApps.forEach((app, index) => {
    const link = document.createElement('a');
    link.href = app.url;
    link.className = 'launcher-item';
    link.title = app.name;
    link.setAttribute('aria-label', app.name);
    link.setAttribute('data-id', app.name);
    link.setAttribute('data-index', index.toString());
    link.draggable = true;

    const img = document.createElement('img');
    img.src = app.icon;
    img.className = 'launcher-icon';
    img.alt = app.name;

    link.appendChild(img);
    renderRefs.launcherGrid?.appendChild(link);
  });

  if (renderRefs.launcherAllAppsLink) {
    renderRefs.launcherAllAppsLink.href = data.allAppsLink;
  }
}

export function updateLauncherFooterVariant(): void {
  if (!refs.launcherPopup) return;
  refs.launcherPopup.classList.toggle('folders-enabled', foldersEnabled);
}
