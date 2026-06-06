import * as refs from '@/core/shared/dom-refs';
import * as state from '@/core/shared/state';
import { warningModal } from '@/core/ui/ui-components';
import { deriveShortcutNameFromUrl, getById } from '@/core/shared/dom-utils';

export const MAX_MAIN_GRID_ITEMS = 40;
export const MAX_FOLDER_CAPACITY = 39;

let isShortcutFormLocked = false;
let isFolderFormLocked = false;

export function setFolderCustomIconVisibility(show: boolean): void {
  if (!refs.folderCustomIconGroup || !refs.toggleFolderCustomIcon) return;
  refs.folderCustomIconGroup.classList.toggle('hidden', !show);
  refs.toggleFolderCustomIcon.classList.toggle('expanded', show);
  refs.toggleFolderCustomIcon.setAttribute(
    'aria-expanded',
    show ? 'true' : 'false',
  );
  if (!show && refs.inputFolderIcon) refs.inputFolderIcon.value = '';
}

export function setCustomIconVisibility(show: boolean): void {
  if (!refs.customIconGroup || !refs.toggleCustomIcon) return;
  const inputIcon = getById<HTMLInputElement>('inputIcon');
  refs.customIconGroup.classList.toggle('hidden', !show);
  refs.toggleCustomIcon.classList.toggle('expanded', show);
  refs.toggleCustomIcon.setAttribute('aria-expanded', show ? 'true' : 'false');
  if (!show && inputIcon) inputIcon.value = '';
}

export function hideAllModals(): void {
  if (refs.addModal) refs.addModal.classList.remove('active');
  if (refs.chooseTypeModal) refs.chooseTypeModal.classList.remove('active');
  if (refs.addFolderModal) refs.addFolderModal.classList.remove('active');
}

export function closeModal(): void {
  hideAllModals();
  state.setEditingIndex(null);
}

export function openChooseTypeModal(): void {
  hideAllModals();
  if (refs.chooseTypeModal) refs.chooseTypeModal.classList.add('active');
}

export function openFolderModal(name = '', isEditing = false): void {
  isFolderFormLocked = false;
  hideAllModals();
  if (!refs.addFolderModal || !refs.inputFolderName || !refs.inputFolderIcon)
    return;
  refs.addFolderModal.classList.add('active');

  if (refs.folderModalTitle) {
    const tKey = isEditing ? 'editFolderTitle' : 'addFolderTitle';
    refs.folderModalTitle.textContent =
      (window as any).getTranslation?.(tKey) ||
      (isEditing ? 'Edit Folder' : 'New Folder');
  }

  refs.inputFolderName.value = name;
  if (!isEditing) {
    refs.inputFolderIcon.value = '';
    setFolderCustomIconVisibility(false);
  }
  setTimeout(() => refs.inputFolderName.focus(), 100);
}

export function openShortcutModal(existingItem: any | null): void {
  isShortcutFormLocked = false;
  hideAllModals();
  if (!refs.addModal) return;

  refs.addModal.classList.add('active');
  const modalTitle = refs.addModal.querySelector('.modal-content h3');
  const inputName = getById<HTMLInputElement>('inputName');
  const inputUrl = getById<HTMLInputElement>('inputUrl');
  const inputIcon = getById<HTMLInputElement>('inputIcon');

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
  state.setEditingIndex(index);
  const currentArray = getActiveShortcutsList();
  const existingItem = index !== null ? currentArray[index] : null;

  if (existingItem?.type === 'folder') {
    openFolderModal(existingItem.name, true);
    if (refs.inputFolderIcon)
      refs.inputFolderIcon.value = existingItem.customIcon || '';
    setFolderCustomIconVisibility(Boolean(existingItem.customIcon));
    return;
  }
  if (index === null && state.foldersEnabled && !state.currentFolderId) {
    openChooseTypeModal();
    return;
  }
  openShortcutModal(existingItem);
}

export function showGridLimitWarning(
  currentLimit: number,
  isFolderGrid: boolean,
): void {
  const getTrans = (window as any).getTranslation;
  const titleKey = isFolderGrid ? 'folderFullTitle' : 'gridFullTitle';
  const msgKey = isFolderGrid ? 'folderFullMessage' : 'gridFullMessage';
  const defaultTitle = isFolderGrid ? 'Folder is Full' : 'Limit Reached';
  const defaultMsg = isFolderGrid
    ? `This folder has reached the absolute limit of ${currentLimit} items.`
    : `You have reached the maximum limit of ${currentLimit} shortcuts on the main grid. To free up space, please remove some shortcuts or folders.`;

  let title = getTrans?.(titleKey) || defaultTitle;
  let message = getTrans?.(msgKey) || defaultMsg;
  message = message.replace('$LIMIT$', currentLimit.toString());

  warningModal.show({
    title,
    message,
    confirmText: getTrans?.('warningUnderstood') || 'Understood',
    confirmVariant: 'accent',
    onConfirm: () => {},
  });
}

export function initShortcutsFormSystem(
  getActiveShortcutsList: () => any[],
  saveAndRender: () => void,
  updateLauncherFooter: () => void,
): void {
  if (refs.closeModalBtn)
    refs.closeModalBtn.addEventListener('click', closeModal);
  const closeChooseTypeBtn = document.getElementById('closeChooseTypeBtn');
  const closeFolderModalBtn = document.getElementById('closeFolderModalBtn');
  const btnChooseLink = document.getElementById('btnChooseLink');
  const btnChooseFolder = document.getElementById('btnChooseFolder');
  const formFolderNode = document.getElementById('folderForm');
  const inputUrlNode = getById<HTMLInputElement>('inputUrl');
  const inputNameNode = getById<HTMLInputElement>('inputName');

  if (closeChooseTypeBtn)
    closeChooseTypeBtn.addEventListener('click', closeModal);
  if (closeFolderModalBtn)
    closeFolderModalBtn.addEventListener('click', closeModal);
  if (btnChooseLink)
    btnChooseLink.addEventListener('click', () => openShortcutModal(null));
  if (btnChooseFolder)
    btnChooseFolder.addEventListener('click', () => {
      state.setEditingIndex(null);
      openFolderModal('', false);
    });

  if (refs.toggleCustomIcon && refs.customIconGroup) {
    const inputIcon = getById<HTMLInputElement>('inputIcon');
    refs.toggleCustomIcon.addEventListener('click', () => {
      const isHidden = refs.customIconGroup.classList.contains('hidden');
      setCustomIconVisibility(isHidden);
      if (isHidden && inputIcon) setTimeout(() => inputIcon.focus(), 50);
    });
  }

  if (refs.toggleFolderCustomIcon && refs.folderCustomIconGroup) {
    refs.toggleFolderCustomIcon.addEventListener('click', () => {
      setFolderCustomIconVisibility(
        refs.folderCustomIconGroup.classList.contains('hidden'),
      );
    });
  }

  if (inputUrlNode && inputNameNode) {
    inputUrlNode.addEventListener('blur', () => {
      if (inputUrlNode.value.trim() && !inputNameNode.value.trim()) {
        let processUrl = inputUrlNode.value.trim();
        if (!/^https?:\/\//i.test(processUrl))
          processUrl = 'https://' + processUrl;
        const derived = deriveShortcutNameFromUrl(processUrl);
        if (derived && derived !== 'New Shortcut')
          inputNameNode.value = derived;
      }
    });
  }

  if (refs.shortcutForm) {
    const form = refs.shortcutForm as HTMLFormElement;
    form.onsubmit = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (isShortcutFormLocked) return;
      isShortcutFormLocked = true;

      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();

      const inputName = getById<HTMLInputElement>('inputName');
      const inputUrl = getById<HTMLInputElement>('inputUrl');
      const inputIcon = getById<HTMLInputElement>('inputIcon');

      if (!inputName || !inputUrl) {
        isShortcutFormLocked = false;
        return;
      }

      let finalUrl = inputUrl.value.trim();
      if (finalUrl && !/^https?:\/\//i.test(finalUrl))
        finalUrl = 'https://' + finalUrl;
      const targetArray = getActiveShortcutsList();

      if (
        state.editingIndex !== null &&
        state.editingIndex >= 0 &&
        targetArray[state.editingIndex]
      ) {
        targetArray[state.editingIndex] = {
          ...targetArray[state.editingIndex],
          name: inputName.value.trim() || deriveShortcutNameFromUrl(finalUrl),
          url: finalUrl,
          customIcon: inputIcon?.value.trim() || null,
        };
      } else {
        const limit = state.currentFolderId
          ? MAX_FOLDER_CAPACITY
          : Math.min(state.allowedRows * 10, MAX_MAIN_GRID_ITEMS);
        if (targetArray.length >= limit) {
          showGridLimitWarning(limit, Boolean(state.currentFolderId));
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
      state.setEditingIndex(null);
      closeModal();
      setTimeout(() => {
        isShortcutFormLocked = false;
      }, 500);
    };
  }

  if (formFolderNode) {
    formFolderNode.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (isFolderFormLocked) return;
      isFolderFormLocked = true;

      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      if (!refs.inputFolderName) {
        isFolderFormLocked = false;
        return;
      }
      const targetArray = state.shortcuts;

      if (
        state.editingIndex !== null &&
        state.editingIndex >= 0 &&
        targetArray[state.editingIndex]
      ) {
        targetArray[state.editingIndex] = {
          ...targetArray[state.editingIndex],
          name: refs.inputFolderName.value,
          customIcon: refs.inputFolderIcon?.value || null,
        };
      } else {
        const limit = Math.min(state.allowedRows * 10, MAX_MAIN_GRID_ITEMS);
        if (targetArray.length >= limit) {
          showGridLimitWarning(limit, false);
          isFolderFormLocked = false;
          return;
        }
        targetArray.push({
          id: 'folder_' + Date.now().toString(),
          type: 'folder',
          name: refs.inputFolderName.value || 'New Folder',
          customIcon: refs.inputFolderIcon?.value || null,
          children: [],
        });
      }
      state.setFoldersEnabled(true);
      if (refs.toggleFolders) refs.toggleFolders.checked = true;
      localStorage.setItem('foldersEnabled', 'true');
      updateLauncherFooter();
      saveAndRender();
      state.setEditingIndex(null);
      closeModal();
    });
  }
}
