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

  renderRefs.launcherGrid.innerHTML = '';
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
