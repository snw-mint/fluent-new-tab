/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file manages the display, rendering, and interaction of the application launcher.
 */

import { LauncherProviderData } from './types.js';
import {
  launcherPopup,
} from './dom-references.js';
import { foldersEnabled } from './state.js';

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
  refs: LauncherVisibilityRefs,
  setCollapsibleFn: (
    element: HTMLElement | null,
    shouldExpand: boolean,
    animate?: boolean,
  ) => void,
): void {
  if (refs.appLauncherWrapper) {
    refs.appLauncherWrapper.style.display = enabled ? 'block' : 'none';
  }
  if (refs.launcherSelectGroup) {
    setCollapsibleFn(refs.launcherSelectGroup, enabled, animate);
  }
}

export function renderLauncherApps(
  data: LauncherProviderData | undefined,
  refs: LauncherRenderRefs,
): void {
  if (!data || !refs.launcherGrid) return;

  refs.launcherGrid.innerHTML = '';
  data.apps.forEach((app) => {
    const link = document.createElement('a');
    link.href = app.url;
    link.className = 'launcher-item';
    link.title = app.name;
    link.setAttribute('aria-label', app.name);

    const img = document.createElement('img');
    img.src = app.icon;
    img.className = 'launcher-icon';
    img.alt = app.name;

    link.appendChild(img);

    refs.launcherGrid?.appendChild(link);
  });

  if (refs.launcherAllAppsLink) {
    refs.launcherAllAppsLink.href = data.allAppsLink;
  }
}

export function updateLauncherFooterVariant(): void {
  if (!launcherPopup) return;
  launcherPopup.classList.toggle('folders-enabled', foldersEnabled);
}
