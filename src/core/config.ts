const ICON_ADD = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13V3.754a.75.75 0 0 0-1.5 0V13H3.754a.75.75 0 0 0 0 1.5H13v9.252a.75.75 0 0 0 1.5 0V14.5l9.25.003a.75.75 0 0 0 0-1.5z" fill="currentColor"/></svg>`;
const ICON_REMOVE = `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="m3.525 3.718.091-.102a1.25 1.25 0 0 1 1.666-.091l.102.091L14 12.233l8.616-8.617a1.25 1.25 0 0 1 1.768 1.768L15.767 14l8.617 8.616a1.25 1.25 0 0 1 .091 1.666l-.091.102a1.25 1.25 0 0 1-1.666.091l-.102-.091L14 15.767l-8.616 8.617a1.25 1.25 0 0 1-1.768-1.768L12.233 14 3.616 5.384a1.25 1.25 0 0 1-.091-1.666l.091-.102z" fill="currentColor"/></svg>`;
const ICON_EDIT = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.03 2.97a3.58 3.58 0 0 1 0 5.06L9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L15.97 2.97a3.58 3.58 0 0 1 5.06 0M15 6.06 5.062 16a.75.75 0 0 0-.193.333l-1.05 3.85 3.85-1.05A.75.75 0 0 0 8 18.937L17.94 9zm2.03-2.03-.97.97L19 7.94l.97-.97a2.078 2.078 0 1 0-2.94-2.94" fill="currentColor"/></svg>`;
const ICON_GLOBE_FALLBACK = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.999c5.524 0 10.002 4.478 10.002 10.002 0 5.523-4.478 10.001-10.002 10.001S1.998 17.524 1.998 12.001C1.998 6.477 6.476 1.999 12 1.999M14.939 16.5H9.06c.652 2.414 1.786 4.002 2.939 4.002s2.287-1.588 2.939-4.002Zm-7.43 0H4.785a8.53 8.53 0 0 0 4.094 3.411c-.522-.82-.953-1.846-1.27-3.015l-.102-.395Zm11.705 0h-2.722c-.324 1.335-.792 2.5-1.373 3.411a8.53 8.53 0 0 0 3.91-3.127l.185-.283ZM7.094 10H3.735l-.005.017a8.5 8.5 0 0 0-.233 1.984c0 1.056.193 2.067.545 3h3.173a21 21 0 0 1-.123-5Zm8.303 0H8.603a19 19 0 0 0 .135 5h6.524a19 19 0 0 0 .135-5m4.868 0h-3.358c.062.647.095 1.317.095 2a20 20 0 0 1-.218 3h3.173a8.5 8.5 0 0 0 .544-3c0-.689-.082-1.36-.236-2M8.88 4.09l-.023.008A8.53 8.53 0 0 0 4.25 8.5h3.048c.314-1.752.86-3.278 1.583-4.41ZM12 3.499l-.116.005C10.62 3.62 9.396 5.622 8.83 8.5h6.342c-.566-2.87-1.783-4.869-3.045-4.995zm3.12.59.107.175c.669 1.112 1.177 2.572 1.475 4.237h3.048a8.53 8.53 0 0 0-4.339-4.29l-.291-.121Z" fill="currentColor"/></svg>`;
const ICON_MENU_DOTS = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.75 12a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0m6 0a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0M18 13.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5" fill="currentColor"/></svg>`;

const engines: Record<string, EngineConfig> = {
    bing: { url: 'https://www.bing.com/search', icon: 'assets/search-engines/bing.svg' },
    google: { url: 'https://www.google.com/search', icon: 'assets/search-engines/google.svg' },
    brave: { url: 'https://search.brave.com/search', icon: 'assets/search-engines/brave.svg' },
    duck: { url: 'https://duckduckgo.com/', icon: 'assets/search-engines/ddg.svg' },
    ecosia: { url: 'https://www.ecosia.org/search', icon: 'assets/search-engines/ecosia.svg' },
    startpage: { url: 'https://www.startpage.com/sp/search', icon: 'assets/search-engines/startpg.svg' }
};

const launcherData: Record<string, LauncherProviderData> = {
    proton: { apps: [
        { name: 'Proton Mail', url: 'https://mail.proton.me', icon: 'assets/apps/proton/mail.svg' },
        { name: 'Proton Calendar', url: 'https://calendar.proton.me', icon: 'assets/apps/proton/calendar.svg' },
        { name: 'Proton Drive', url: 'https://drive.proton.me', icon: 'assets/apps/proton/drive.svg' },
        { name: 'Proton Pass', url: 'https://pass.proton.me', icon: 'assets/apps/proton/pass.svg' },
        { name: 'Proton VPN', url: 'https://account.protonvpn.com', icon: 'assets/apps/proton/vpn.svg' },
        { name: 'Proton Wallet', url: 'https://wallet.proton.me', icon: 'assets/apps/proton/wallet.svg' },
        { name: 'LumoAI', url: 'https://lumo.proton.me', icon: 'assets/apps/proton/lumo.svg' },
        { name: 'Proton Docs', url: 'https://docs.proton.me', icon: 'assets/apps/proton/docs.svg' },
        { name: 'Proton Sheets', url: 'https://sheets.proton.me', icon: 'assets/apps/proton/sheets.svg' }
    ], allAppsLink: 'https://account.proton.me/apps' },
    microsoft: { apps: [
        { name: 'Copilot', url: 'https://copilot.microsoft.com', icon: 'assets/apps/microsoft/copilot.svg' },
        { name: 'Outlook', url: 'https://outlook.live.com', icon: 'assets/apps/microsoft/outlook.svg' },
        { name: 'OneDrive', url: 'https://onedrive.live.com', icon: 'assets/apps/microsoft/onedrive.svg' },
        { name: 'Word', url: 'https://www.office.com/launch/word', icon: 'assets/apps/microsoft/word.svg' },
        { name: 'Excel', url: 'https://www.office.com/launch/excel', icon: 'assets/apps/microsoft/excel.svg' },
        { name: 'PowerPoint', url: 'https://www.office.com/launch/powerpoint', icon: 'assets/apps/microsoft/ppt.svg' },
        { name: 'OneNote', url: 'https://www.onenote.com', icon: 'assets/apps/microsoft/onenote.svg' },
        { name: 'Teams', url: 'https://teams.live.com', icon: 'assets/apps/microsoft/teams.svg' },
        { name: 'ClipChamp', url: 'https://app.clipchamp.com/', icon: 'assets/apps/microsoft/clip.svg' }
    ], allAppsLink: 'https://www.microsoft365.com/apps' },
    google: { apps: [
        { name: 'Gemini', url: 'https://gemini.google.com', icon: 'assets/apps/google/gemini.svg' },
        { name: 'Gmail', url: 'https://mail.google.com', icon: 'assets/apps/google/mail.svg' },
        { name: 'YouTube', url: 'https://youtube.com', icon: 'assets/apps/google/youtube.svg' },
        { name: 'Drive', url: 'https://drive.google.com', icon: 'assets/apps/google/drive.svg' },
        { name: 'Docs', url: 'https://docs.google.com', icon: 'assets/apps/google/docs.svg' },
        { name: 'Calendar', url: 'https://calendar.google.com', icon: 'assets/apps/google/calendar.svg' },
        { name: 'Meet', url: 'https://meet.google.com', icon: 'assets/apps/google/meet.svg' },
        { name: 'Music', url: 'https://music.youtube.com', icon: 'assets/apps/google/music.svg' },
        { name: 'Web Store', url: 'https://chromewebstore.google.com', icon: 'assets/apps/google/store.svg' }
    ], allAppsLink: 'https://about.google/products/' }
};

const APP_KEYS: string[] = [
    'shortcuts', 'theme', 'weatherEnabled', 'weatherCity', 'shortcutsVisible', 'shortcutsRows',
    'launcherEnabled', 'launcherProvider', 'showGreeting', 'greetingName', 'greetingStyle',
    'userLanguage', 'clearSearchEnabled', 'compactBarEnabled', 'wallpaperEnabled',
    'wallpaperSource', 'wallpaperType', 'wallpaperValue'
];
