interface LauncherVisibilityRefs {
    appLauncherWrapper: HTMLElement | null;
    launcherSelectGroup: HTMLElement | null;
}

interface LauncherRenderRefs {
    launcherGrid: HTMLElement | null;
    launcherAllAppsLink: HTMLAnchorElement | null;
}

function updateLauncherVisibilityUI(
    enabled: boolean,
    animate: boolean,
    refs: LauncherVisibilityRefs,
    setCollapsibleFn: (element: HTMLElement | null, shouldExpand: boolean, animate?: boolean) => void
): void {
    if (refs.appLauncherWrapper) {
        refs.appLauncherWrapper.style.display = enabled ? 'block' : 'none';
    }
    if (refs.launcherSelectGroup) {
        setCollapsibleFn(refs.launcherSelectGroup, enabled, animate);
    }
}

function renderLauncherApps(data: LauncherProviderData | undefined, refs: LauncherRenderRefs): void {
    if (!data || !refs.launcherGrid) return;

    refs.launcherGrid.innerHTML = '';
    data.apps.forEach((app) => {
        const link = document.createElement('a');
        link.href = app.url;
        link.className = 'launcher-item';
        link.innerHTML = `
            <img src="${app.icon}" class="launcher-icon" alt="${app.name}">
            <span class="launcher-label">${app.name}</span>
        `;
        refs.launcherGrid?.appendChild(link);
    });

    if (refs.launcherAllAppsLink) {
        refs.launcherAllAppsLink.href = data.allAppsLink;
    }
}
