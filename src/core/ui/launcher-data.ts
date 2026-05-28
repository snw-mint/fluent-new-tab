import { LauncherProviderData } from '@/core/shared/types';

export const launcherData: Record<string, LauncherProviderData> = {
  proton: {
    apps: [
      {
        name: 'Proton Mail',
        url: 'https://mail.proton.me',
        icon: 'assets/apps/proton/mail.svg',
      },
      {
        name: 'Proton Calendar',
        url: 'https://calendar.proton.me',
        icon: 'assets/apps/proton/calendar.svg',
      },
      {
        name: 'Proton Drive',
        url: 'https://drive.proton.me',
        icon: 'assets/apps/proton/drive.svg',
      },
      {
        name: 'Proton Pass',
        url: 'https://pass.proton.me',
        icon: 'assets/apps/proton/pass.svg',
      },
      {
        name: 'Proton VPN',
        url: 'https://account.protonvpn.com',
        icon: 'assets/apps/proton/vpn.svg',
      },
      {
        name: 'Proton Wallet',
        url: 'https://wallet.proton.me',
        icon: 'assets/apps/proton/wallet.svg',
      },
      {
        name: 'LumoAI',
        url: 'https://lumo.proton.me',
        icon: 'assets/apps/proton/lumo.svg',
      },
      {
        name: 'Proton Docs',
        url: 'https://docs.proton.me',
        icon: 'assets/apps/proton/docs.svg',
      },
      {
        name: 'Proton Sheets',
        url: 'https://sheets.proton.me',
        icon: 'assets/apps/proton/sheets.svg',
      },
    ],
    allAppsLink: 'https://account.proton.me/apps',
  },
  microsoft: {
    apps: [
      {
        name: 'Copilot',
        url: 'https://copilot.microsoft.com',
        icon: 'assets/apps/microsoft/copilot.svg',
      },
      {
        name: 'Outlook',
        url: 'https://outlook.live.com',
        icon: 'assets/apps/microsoft/outlook.svg',
      },
      {
        name: 'OneDrive',
        url: 'https://onedrive.live.com',
        icon: 'assets/apps/microsoft/onedrive.svg',
      },
      {
        name: 'Word',
        url: 'https://www.office.com/launch/word',
        icon: 'assets/apps/microsoft/word.svg',
      },
      {
        name: 'Excel',
        url: 'https://www.office.com/launch/excel',
        icon: 'assets/apps/microsoft/excel.svg',
      },
      {
        name: 'PowerPoint',
        url: 'https://www.office.com/launch/powerpoint',
        icon: 'assets/apps/microsoft/ppt.svg',
      },
      {
        name: 'OneNote',
        url: 'https://www.onenote.com',
        icon: 'assets/apps/microsoft/onenote.svg',
      },
      {
        name: 'Teams',
        url: 'https://teams.live.com',
        icon: 'assets/apps/microsoft/teams.svg',
      },
      {
        name: 'ClipChamp',
        url: 'https://app.clipchamp.com/',
        icon: 'assets/apps/microsoft/clip.svg',
      },
    ],
    allAppsLink: 'https://www.microsoft365.com/apps',
  },
  google: {
    apps: [
      {
        name: 'Gemini',
        url: 'https://gemini.google.com',
        icon: 'assets/apps/google/gemini.svg',
      },
      {
        name: 'Gmail',
        url: 'https://mail.google.com',
        icon: 'assets/apps/google/mail.svg',
      },
      {
        name: 'YouTube',
        url: 'https://youtube.com',
        icon: 'assets/apps/google/youtube.svg',
      },
      {
        name: 'Drive',
        url: 'https://drive.google.com',
        icon: 'assets/apps/google/drive.svg',
      },
      {
        name: 'Docs',
        url: 'https://docs.google.com/document/',
        icon: 'assets/apps/google/docs.svg',
      },
      {
        name: 'Sheets',
        url: 'https://docs.google.com/spreadsheets/',
        icon: 'assets/apps/google/sheet.svg',
      },
      {
        name: 'Calendar',
        url: 'https://calendar.google.com',
        icon: 'assets/apps/google/calendar.svg',
      },
      {
        name: 'Keep',
        url: 'https://keep.google.com',
        icon: 'assets/apps/google/keep.svg',
      },
      {
        name: 'Music',
        url: 'https://music.youtube.com',
        icon: 'assets/apps/google/music.svg',
      },
    ],
    allAppsLink: 'https://about.google/products/#:~:text=google%20products',
  },
};
