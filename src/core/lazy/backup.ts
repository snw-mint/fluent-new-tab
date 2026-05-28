/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import * as refs from '@/core/shared/dom-refs';
import { showToast, warningModal } from '@/core/ui/ui-components';

export const APP_KEYS: string[] = [
  'shortcuts',
  'theme',
  'weatherEnabled',
  'weatherAlertsEnabled',
  'fluent_city_data',
  'shortcutsVisible',
  'shortcutsRows',
  'foldersEnabled',
  'launcherEnabled',
  'launcherProvider',
  'showGreeting',
  'greetingName',
  'greetingType',
  'userLanguage',
  'searchEngine',
  'searchBarVisible',
  'suggestionsEnabled',
  'clearSearchEnabled',
  'compactBarEnabled',
  'voiceSearchEnabled',
  'weatherUnit',
  'wallpaperEnabled',
  'wallpaperSource',
  'wallpaperType',
  'wallpaperValue',
  'animationsDisabled',
  'reducedEffectsEnabled',
  'accentColorEnabled',
  'accentColorMode',
  'accentColorValue',
  'displayEnabled',
  'displayType',
  'showSeconds',
  'use12Hour',
  'dateFormat',
  'askAiEnabled',
  'displayPreset',
  'shortcutRadius',
  'hideShortcutNames',
  'wallpaperOverlay',
  'displayScale',
  'tabName',
  'tabFavicon',
];

function isValidBackupPayload(data: unknown): boolean {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value !== 'string') {
        return false;
      }
    }
  }
  return true;
}

export function initBackupSystem(): void {
  if (refs.exportBtn) {
    refs.exportBtn.addEventListener('click', () => {
      const backupData: Record<string, string> = {};
      const keysToExclude = [
        'weatherEnabled',
        'weatherAlertsEnabled',
        'suggestionsEnabled',
        'wallpaperSource',
        'wallpaperType',
        'wallpaperValue',
      ];

      APP_KEYS.forEach((key) => {
        if (keysToExclude.includes(key)) return;
        const value = localStorage.getItem(key);
        if (value !== null) backupData[key] = value;
      });
      backupData['shortcuts'] = localStorage.getItem('shortcuts') || '[]';
      backupData._backupDate = new Date().toISOString();

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluent-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Settings saved in the file', 'assets/icons/check.svg');
    });
  }

  if (refs.importBtn && refs.importInput) {
    refs.importBtn.addEventListener('click', () => refs.importInput.click());
    refs.importInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = JSON.parse(
            String((event.target as FileReader).result || '{}'),
          );
          if (!isValidBackupPayload(parsedData)) {
            throw new Error('Invalid backup data format');
          }
          const data = parsedData;
          warningModal.show({
            title: 'Restore Backup?',
            message:
              'This will replace your current settings and shortcuts with the backup file data.',
            confirmText: 'Restore',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
            onConfirm: () => {
              const keysToExclude = [
                'weatherEnabled',
                'weatherAlertsEnabled',
                'suggestionsEnabled',
                'wallpaperSource',
                'wallpaperType',
                'wallpaperValue',
              ];

              const keysToWrite = APP_KEYS.filter(
                (key) => !keysToExclude.includes(key),
              );

              const processChunk = (startIndex: number) => {
                const endIndex = Math.min(startIndex + 10, keysToWrite.length);
                for (let i = startIndex; i < endIndex; i++) {
                  const key = keysToWrite[i];
                  const value = data[key];
                  if (typeof value === 'string')
                    localStorage.setItem(key, value);
                }

                if (endIndex < keysToWrite.length) {
                  requestAnimationFrame(() => processChunk(endIndex));
                } else {
                  const treeBackup = data['shortcuts'];
                  if (typeof treeBackup === 'string') {
                    localStorage.setItem('shortcuts', treeBackup);
                  }
                  location.reload();
                }
              };

              processChunk(0);
            },
          });
        } catch (error) {
          showToast(
            'The selected file is not a valid backup.',
            'assets/icons/dimiss.svg',
          );
        }
        refs.importInput.value = '';
      };
      reader.readAsText(file);
    });
  }
}
