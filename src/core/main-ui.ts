/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import {
  configBtn,
  configPopup,
  closeModalBtn,
  addModal,
  chooseTypeModal,
  addFolderModal,
  displaySliderContainer,
  displayToggleBtn,
  shortcutsMoreContainer,
  shortcutsMoreBtn,
  overlaySliderContainer,
  overlayToggleBtn,
  accentMoreContainer,
  accentMoreBtn,
  searchMoreContainer,
  searchMoreBtn,
  weatherMoreContainer,
  launcherPopup,
  appLauncherBtn,
  dropdown,
  shortcutForm,
  inputFolderName,
  inputFolderIcon,
  folderCustomIconGroup,
  toggleFolderCustomIcon,
  folderModalTitle,
  languageSelect,
  exportBtn,
  importBtn,
  importInput,
  customIconGroup,
  toggleCustomIcon,
  toggleFolders,
  shortcutsGrid,
} from './dom-references.js';

import {
  editingIndex,
  currentFolderId,
  foldersEnabled,
  shortcuts,
  setEditingIndex,
  setFoldersEnabled,
  activeSelectTrigger,
  setActiveSelectTrigger,
  allowedRows,
} from './state.js';

import { syncShortcutDropdownState } from './shortcuts.js';
import { showToast, warningModal } from './ui-components.js';
import { APP_KEYS } from './config.js';
import {
  deriveShortcutNameFromUrl,
  getInputById,
  getInputTarget,
  getLocalizedWarningText,
} from './dom-utils.js';

export const MAX_MAIN_GRID_ITEMS = 40;
export const MAX_FOLDER_CAPACITY = 4 * 10 - 1;

let isShortcutFormLocked = false;
let isFolderFormLocked = false;

export interface MainUiOptions {
  getActiveShortcutsList: () => any[];
  saveAndRender: () => void;
  updateLauncherFooterVariant: () => void;
}

export function openChooseTypeModal(): void {
  hideAllModals();
  if (chooseTypeModal) chooseTypeModal.classList.add('active');
}

export function openFolderModal(name = '', isEditing = false): void {
  isFolderFormLocked = false;
  hideAllModals();
  if (!addFolderModal || !inputFolderName || !inputFolderIcon) return;
  addFolderModal.classList.add('active');

  if (folderModalTitle) {
    const tKey = isEditing ? 'editFolderTitle' : 'addFolderTitle';
    folderModalTitle.textContent =
      (window as any).getTranslation?.(tKey) ||
      (isEditing ? 'Edit Folder' : 'New Folder');
  }

  inputFolderName.value = name;

  if (!isEditing) {
    inputFolderIcon.value = '';
    setFolderCustomIconVisibility(false);
  } else {
    // If we wanted to preserve the custom icon, we'd do it here.
    // Since we're passing it from script.ts, let's keep it simple.
  }

  setTimeout(() => inputFolderName.focus(), 100);
}

export function openShortcutModal(existingItem: any | null): void {
  isShortcutFormLocked = false;
  hideAllModals();
  if (!addModal) return;

  addModal.classList.add('active');
  const modalTitle = addModal.querySelector('.modal-content h3');
  const inputName = getInputById('inputName') as HTMLInputElement | null;
  const inputUrl = getInputById('inputUrl') as HTMLInputElement | null;
  const inputIcon = getInputById('inputIcon') as HTMLInputElement | null;

  if (existingItem) {
    if (inputName) inputName.value = existingItem.name || '';
    if (inputUrl) inputUrl.value = existingItem.url || '';
    if (inputIcon) inputIcon.value = existingItem.customIcon || '';
    if (modalTitle)
      modalTitle.textContent =
        (window as any).getTranslation?.('editShortcutTitle') ||
        'Edit Shortcut';
    setCustomIconVisibility(Boolean(existingItem.customIcon));
  } else {
    if (inputName) inputName.value = '';
    if (inputUrl) inputUrl.value = '';
    if (inputIcon) inputIcon.value = '';
    if (modalTitle)
      modalTitle.textContent =
        (window as any).getTranslation?.('addShortcutTitle') || 'Add Shortcut';
    setCustomIconVisibility(false);
  }
  setTimeout(() => inputUrl?.focus(), 100);
}

export function openModal(
  index: number | null,
  getActiveShortcutsList: () => any[],
): void {
  setEditingIndex(index);

  const currentArray = getActiveShortcutsList();
  const existingItem = index !== null ? currentArray[index] : null;

  if (existingItem?.type === 'folder') {
    openFolderModal(existingItem.name, true);
    // Restore custom icon if editing folder
    if (inputFolderIcon) inputFolderIcon.value = existingItem.customIcon || '';
    setFolderCustomIconVisibility(Boolean(existingItem.customIcon));
    return;
  }
  if (index === null && foldersEnabled && !currentFolderId) {
    openChooseTypeModal();
    return;
  }
  openShortcutModal(existingItem);
}

export function resetSettingsAccordions(): void {
  try {
    const accordions = [
      { container: displaySliderContainer, btn: displayToggleBtn },
      { container: shortcutsMoreContainer, btn: shortcutsMoreBtn },
      { container: overlaySliderContainer, btn: overlayToggleBtn },
      { container: accentMoreContainer, btn: accentMoreBtn },
      { container: searchMoreContainer, btn: searchMoreBtn },
      {
        container: weatherMoreContainer,
        btn: document.getElementById('weather-more-btn'),
      },
    ];

    accordions.forEach((acc) => {
      if (acc.container) {
        acc.container.classList.add('collapsed');
        acc.container.style.maxHeight = '';
      }
      if (acc.btn) {
        acc.btn.classList.remove('expanded');
      }
    });
  } catch (error) {
    console.error('Erro ao resetar acordeões:', error);
  }
}

export function closePopups(except: Element | null = null): void {
  if (configPopup && configPopup !== except) {
    configPopup.classList.remove('active');
    resetSettingsAccordions();
  }
  if (launcherPopup && launcherPopup !== except) {
    launcherPopup.classList.remove('active');
    if (appLauncherBtn) appLauncherBtn.classList.remove('active');
  }
  document.querySelectorAll('.shortcut-dropdown.active').forEach((menu) => {
    if (menu !== except) menu.classList.remove('active');
  });
  if (dropdown && dropdown !== except) dropdown.classList.remove('active');

  if (activeSelectTrigger && activeSelectTrigger !== except) {
    const selectPopup = document.getElementById('fluent-select-popup');
    if (selectPopup && selectPopup !== except) {
      selectPopup.classList.remove('active');
      activeSelectTrigger.classList.remove('popup-open');
      setActiveSelectTrigger(null);
    }
  }

  syncShortcutDropdownState();
}

export function hideAllModals(): void {
  if (addModal) addModal.classList.remove('active');
  if (chooseTypeModal) chooseTypeModal.classList.remove('active');
  if (addFolderModal) addFolderModal.classList.remove('active');
}

export function closeModal(): void {
  hideAllModals();
  setEditingIndex(null);
}

export function setFolderCustomIconVisibility(show: boolean): void {
  if (!folderCustomIconGroup || !toggleFolderCustomIcon) return;
  folderCustomIconGroup.classList.toggle('hidden', !show);
  toggleFolderCustomIcon.classList.toggle('expanded', show);
  toggleFolderCustomIcon.setAttribute('aria-expanded', show ? 'true' : 'false');
  if (!show && inputFolderIcon) inputFolderIcon.value = '';
}

export function setCustomIconVisibility(show: boolean): void {
  if (!customIconGroup || !toggleCustomIcon) return;
  const inputIcon = document.getElementById(
    'inputIcon',
  ) as HTMLInputElement | null;
  customIconGroup.classList.toggle('hidden', !show);
  toggleCustomIcon.classList.toggle('expanded', show);
  toggleCustomIcon.setAttribute('aria-expanded', show ? 'true' : 'false');
  if (!show && inputIcon) {
    inputIcon.value = '';
  }
}

export function isValidBackupPayload(data: unknown): boolean {
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

export function showGridLimitWarning(
  currentLimit: number,
  isFolderGrid: boolean,
): void {
  const title = isFolderGrid
    ? getLocalizedWarningText('warningFolderFullTitle', 'Folder is Full')
    : getLocalizedWarningText('warningGridFullTitle', 'Grid is Full');
  const message = isFolderGrid
    ? getLocalizedWarningText(
        'warningFolderFullMessage',
        'This folder has reached the absolute limit of $LIMIT$ items. Please remove some shortcuts before adding new ones.',
        { LIMIT: String(currentLimit) },
      )
    : getLocalizedWarningText(
        'warningGridFullMessage',
        'You have reached the maximum limit of $LIMIT$ shortcuts on the main screen. Delete some items or group them into a folder to free up space.',
        { LIMIT: String(currentLimit) },
      );

  warningModal.show({
    title,
    message,
    confirmText: getLocalizedWarningText(
      'warningGridFullConfirm',
      'Understood',
    ),
    confirmVariant: 'accent',
    onConfirm: () => {},
  });
}

export function bindMainUiFeatures(options: MainUiOptions): void {
  const { getActiveShortcutsList, saveAndRender, updateLauncherFooterVariant } =
    options;

  if (configBtn && configPopup) {
    configBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closePopups(configPopup);
      configPopup.classList.toggle('active');

      if (!configPopup.classList.contains('active')) {
        resetSettingsAccordions();
      }
    });

    document.addEventListener('click', (e) => {
      const targetNode = e.target as Node | null;
      if (!targetNode) return;
      if (configPopup.classList.contains('active')) {
        if (
          !configPopup.contains(targetNode) &&
          !configBtn.contains(targetNode)
        ) {
          configPopup.classList.remove('active');
          resetSettingsAccordions();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && configPopup.classList.contains('active')) {
        configPopup.classList.remove('active');
        resetSettingsAccordions();
      }
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (toggleCustomIcon && customIconGroup) {
    const inputIcon = getInputById('inputIcon');
    toggleCustomIcon.addEventListener('click', () => {
      const isHidden = customIconGroup.classList.contains('hidden');
      if (isHidden) {
        setCustomIconVisibility(true);
        if (inputIcon) {
          setTimeout(() => inputIcon.focus(), 50);
        }
      } else {
        setCustomIconVisibility(false);
      }
    });
  }

  if (toggleFolderCustomIcon && folderCustomIconGroup) {
    toggleFolderCustomIcon.addEventListener('click', () => {
      const isHidden = folderCustomIconGroup.classList.contains('hidden');
      setFolderCustomIconVisibility(isHidden);
    });
  }

  const btnChooseLink = document.getElementById('btnChooseLink');
  const btnChooseFolder = document.getElementById('btnChooseFolder');
  const closeChooseTypeBtn = document.getElementById('closeChooseTypeBtn');
  const closeFolderModalBtn = document.getElementById('closeFolderModalBtn');
  const formFolderNode = document.getElementById('folderForm');

  if (closeChooseTypeBtn)
    closeChooseTypeBtn.addEventListener('click', closeModal);
  if (closeFolderModalBtn)
    closeFolderModalBtn.addEventListener('click', closeModal);

  if (btnChooseLink) {
    btnChooseLink.addEventListener('click', (e) => {
      e.preventDefault();
      openShortcutModal(null);
    });
  }

  if (btnChooseFolder) {
    btnChooseFolder.addEventListener('click', (e) => {
      e.preventDefault();
      setEditingIndex(null);
      openFolderModal('', false);
    });
  }

  if (shortcutForm) {
    shortcutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Stop other concurrent micro-tasks from processing this event sequence
      e.stopImmediatePropagation();

      if (isShortcutFormLocked) return;
      isShortcutFormLocked = true;

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      const inputName = getInputById('inputName') as HTMLInputElement | null;
      const inputUrl = getInputById('inputUrl') as HTMLInputElement | null;
      const inputIcon = getInputById('inputIcon') as HTMLInputElement | null;

      if (!inputName || !inputUrl) {
        isShortcutFormLocked = false;
        return;
      }

      let finalUrl = inputUrl.value.trim();
      if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }

      const targetArray = getActiveShortcutsList();

      if (
        editingIndex !== null &&
        editingIndex >= 0 &&
        targetArray[editingIndex]
      ) {
        targetArray[editingIndex] = {
          ...targetArray[editingIndex],
          name: inputName.value.trim() || deriveShortcutNameFromUrl(finalUrl),
          url: finalUrl,
          customIcon: inputIcon?.value.trim() || null,
        };
      } else {
        const limit = currentFolderId
          ? MAX_FOLDER_CAPACITY
          : Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);

        if (targetArray.length >= limit) {
          showGridLimitWarning(limit, Boolean(currentFolderId));
          isShortcutFormLocked = false;
          return;
        }

        targetArray.push({
          id: 'shortcut_' + Date.now().toString(),
          type: 'link',
          name: inputName.value.trim() || deriveShortcutNameFromUrl(finalUrl),
          url: finalUrl,
          customIcon: inputIcon?.value.trim() || null,
        });
      }

      saveAndRender();
      setEditingIndex(null);
      closeModal();
    });
  }

  const inputUrlNode = getInputById('inputUrl') as HTMLInputElement | null;
  const inputNameNode = getInputById('inputName') as HTMLInputElement | null;

  if (inputUrlNode && inputNameNode) {
    inputUrlNode.addEventListener('blur', () => {
      const currentUrl = inputUrlNode.value.trim();
      const currentName = inputNameNode.value.trim();

      if (currentUrl && !currentName) {
        let processUrl = currentUrl;
        if (!/^https?:\/\//i.test(processUrl)) {
          processUrl = 'https://' + processUrl;
        }

        const derived = deriveShortcutNameFromUrl(processUrl);
        if (derived && derived !== 'New Shortcut') {
          inputNameNode.value = derived;
        }
      }
    });
  }

  if (formFolderNode) {
    formFolderNode.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (isFolderFormLocked) return;
      isFolderFormLocked = true;

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      if (!inputFolderName) {
        isFolderFormLocked = false;
        return;
      }

      const targetArray = shortcuts;

      if (
        editingIndex !== null &&
        editingIndex >= 0 &&
        targetArray[editingIndex]
      ) {
        targetArray[editingIndex] = {
          ...targetArray[editingIndex],
          name: inputFolderName.value,
          customIcon: inputFolderIcon?.value || null,
        };
      } else {
        const limit = Math.min(allowedRows * 10, MAX_MAIN_GRID_ITEMS);

        if (targetArray.length >= limit) {
          showGridLimitWarning(limit, false);
          isFolderFormLocked = false;
          return;
        }

        targetArray.push({
          id: 'folder_' + Date.now().toString(),
          type: 'folder',
          name:
            inputFolderName.value ||
            (window as any).getTranslation?.('addFolderTitle') ||
            'New Folder',
          customIcon: inputFolderIcon?.value || null,
          children: [],
        });
      }

      setFoldersEnabled(true);
      if (toggleFolders) toggleFolders.checked = true;
      localStorage.setItem('foldersEnabled', 'true');
      updateLauncherFooterVariant();
      saveAndRender();
      setEditingIndex(null);
      closeModal();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
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

      const successMsg =
        (window as any).getLocalizedWarningText?.(
          'backupExportSuccess',
          'Settings saved in the file',
        ) || 'Settings saved in the file';
      showToast(successMsg, 'assets/icons/check.svg');
    });
  }

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const target = getInputTarget(e);
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
            title:
              (window as any).getLocalizedWarningText?.(
                'warningRestoreBackupTitle',
                'Restore Backup?',
              ) || 'Restore Backup?',
            message:
              (window as any).getLocalizedWarningText?.(
                'warningRestoreBackupMessage',
                'This will replace your current settings and shortcuts with the backup file data.',
              ) ||
              'This will replace your current settings and shortcuts with the backup file data.',
            confirmText:
              (window as any).getLocalizedWarningText?.(
                'warningRestoreBackupConfirm',
                'Restore',
              ) || 'Restore',
            cancelText:
              (window as any).getLocalizedWarningText?.(
                'btnCancel',
                'Cancel',
              ) || 'Cancel',
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

              APP_KEYS.forEach((key) => {
                if (keysToExclude.includes(key)) return;
                const value = data[key];
                if (typeof value === 'string') localStorage.setItem(key, value);
              });
              const treeBackup = data['shortcuts'];
              if (typeof treeBackup === 'string') {
                localStorage.setItem('shortcuts', treeBackup);
              }
              location.reload();
            },
          });
        } catch (error) {
          const errorMsg =
            (window as any).getLocalizedWarningText?.(
              'warningInvalidBackupMessage',
              'The selected file is not a valid backup.',
            ) || 'The selected file is not a valid backup.';
          showToast(errorMsg, 'assets/icons/dimiss.svg');
        }
        importInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  if (languageSelect) {
    const savedLang = localStorage.getItem('userLanguage');
    const defaultLang = 'en';

    if (savedLang) {
      languageSelect.value = savedLang;
    } else {
      const optionExists = Array.from(languageSelect.options).some(
        (o) => o.value === defaultLang,
      );
      languageSelect.value = optionExists
        ? defaultLang
        : languageSelect.options[0]?.value || 'en_US';
    }

    languageSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement | null;
      if (!target) return;

      const novoIdioma = target.value;
      localStorage.setItem('userLanguage', novoIdioma);

      const cacheKey = `i18n_cache_${novoIdioma}`;
      localStorage.removeItem(cacheKey);

      if (typeof (window as any).loadTranslations === 'function') {
        (window as any).loadTranslations();
      } else if (typeof (window as any).applyTranslations === 'function') {
        (window as any).applyTranslations();
      } else {
        document.dispatchEvent(new Event('i18nReady'));
      }
    });
  }

  if (toggleFolders) {
    toggleFolders.checked = foldersEnabled;

    toggleFolders.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const isEnabling = target.checked;

      if (!isEnabling) {
        const hasExistingFolders = shortcuts.some(
          (s: any) =>
            s.type === 'folder' ||
            (Array.isArray(s.children) && s.children.length > 0),
        );

        if (hasExistingFolders) {
          warningModal.show({
            title:
              (window as any).getLocalizedWarningText?.(
                'warningDeleteFoldersTitle',
                'Disable Folders?',
              ) || 'Disable Folders?',
            message:
              (window as any).getLocalizedWarningText?.(
                'warningDeleteFoldersMessage',
                'All folders and their shortcuts will be deleted. This cannot be undone unless you have a backup.',
              ) ||
              'All folders and their shortcuts will be deleted. This cannot be undone.',
            confirmText:
              (window as any).getLocalizedWarningText?.(
                'warningDeleteFoldersConfirm',
                'Delete Folders',
              ) || 'Delete Folders',
            cancelText:
              (window as any).getLocalizedWarningText?.(
                'warningKeepEnabled',
                'Keep Enabled',
              ) || 'Keep Enabled',
            confirmVariant: 'danger',
            onConfirm: () => {
              const prunedShortcuts = shortcuts.filter(
                (item: any) =>
                  item.type !== 'folder' && !Array.isArray(item.children),
              );

              shortcuts.length = 0;
              shortcuts.push(...prunedShortcuts);

              setFoldersEnabled(false);
              localStorage.setItem('foldersEnabled', 'false');
              updateLauncherFooterVariant();
              saveAndRender();
            },
            onCancel: () => {
              target.checked = true;
            },
          });
          return;
        }
      }

      setFoldersEnabled(isEnabling);
      localStorage.setItem('foldersEnabled', String(isEnabling));
      updateLauncherFooterVariant();
    });
  }
}
