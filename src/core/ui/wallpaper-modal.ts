import { mountTemplate } from '@/core/shared/dom-utils';
import { getWallpaperFromDB } from '@/core/boot/wallpaper-render';
import * as state from '@/core/shared/state';
import * as refs from '@/core/shared/dom-refs';

interface DropzoneElements {
  dropzone: HTMLElement | null;
  fileInput: HTMLInputElement | null;
  emptyState: HTMLElement | null;
  previewState: HTMLElement | null;
  previewThumb: HTMLImageElement | null;
  editThumbBtn: HTMLElement | null;
  deleteThumbBtn: HTMLElement | null;
}

interface Slot {
  key: string;
  elements: DropzoneElements;
  pendingFile: File | null;
  pendingDelete: boolean;
  tempUrl: string | null;
}

let isInitialized = false;
let slots: Slot[] = [];

function setupDropzoneEvents(slot: Slot): void {
  const { dropzone, fileInput, editThumbBtn, deleteThumbBtn } = slot.elements;
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => {
    if (dropzone.classList.contains('has-image')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      setSlotFile(slot, file);
    }
  });

  editThumbBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  deleteThumbBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearSlot(slot);
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (dropzone.classList.contains('has-image')) return;
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', (e) => {
    if (!dropzone.contains(e.relatedTarget as Node)) {
      dropzone.classList.remove('drag-over');
    }
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (dropzone.classList.contains('has-image')) return;
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSlotFile(slot, file);
    }
  });
}

function setSlotFile(slot: Slot, file: File): void {
  slot.pendingFile = file;
  slot.pendingDelete = false;
  if (slot.tempUrl) {
    URL.revokeObjectURL(slot.tempUrl);
  }
  slot.tempUrl = URL.createObjectURL(file);
  if (slot.elements.previewThumb) {
    slot.elements.previewThumb.src = slot.tempUrl;
  }
  slot.elements.emptyState?.classList.add('hidden');
  slot.elements.previewState?.classList.remove('hidden');
  slot.elements.dropzone?.classList.add('has-image');
}

function clearSlot(slot: Slot): void {
  slot.pendingFile = null;
  slot.pendingDelete = true;
  if (slot.tempUrl) {
    URL.revokeObjectURL(slot.tempUrl);
    slot.tempUrl = null;
  }
  if (slot.elements.previewThumb) {
    slot.elements.previewThumb.src = '';
  }
  if (slot.elements.fileInput) {
    slot.elements.fileInput.value = '';
  }
  slot.elements.previewState?.classList.add('hidden');
  slot.elements.emptyState?.classList.remove('hidden');
  slot.elements.dropzone?.classList.remove('has-image');
}

async function loadSlot(slot: Slot): Promise<void> {
  if (slot.tempUrl) {
    URL.revokeObjectURL(slot.tempUrl);
    slot.tempUrl = null;
  }
  slot.pendingFile = null;
  slot.pendingDelete = false;

  const blob = await getWallpaperFromDB(slot.key);
  if (blob) {
    slot.tempUrl = URL.createObjectURL(blob);
    if (slot.elements.previewThumb) {
      slot.elements.previewThumb.src = slot.tempUrl;
    }
    slot.elements.emptyState?.classList.add('hidden');
    slot.elements.previewState?.classList.remove('hidden');
    slot.elements.dropzone?.classList.add('has-image');
  } else {
    if (slot.elements.previewThumb) {
      slot.elements.previewThumb.src = '';
    }
    slot.elements.previewState?.classList.add('hidden');
    slot.elements.emptyState?.classList.remove('hidden');
    slot.elements.dropzone?.classList.remove('has-image');
  }
  if (slot.elements.fileInput) {
    slot.elements.fileInput.value = '';
  }
}

let handleKeyDown: (e: KeyboardEvent) => void;

function initModal(): void {
  if (isInitialized) return;
  isInitialized = true;

  const modal = document.getElementById('wallpaperEditModal');
  if (!modal) return;

  const closeBtn = document.getElementById('closeWallpaperEditModalBtn');
  const saveBtn = document.getElementById('saveWallpaperEditModalBtn');
  const themeToggle = document.getElementById('toggleThemeWallpaper') as HTMLInputElement | null;
  const singleWrapper = document.getElementById('wallpaperSingleDropzoneWrapper');
  const dualWrapper = document.getElementById('wallpaperDualDropzonesWrapper');

  const closeModal = () => {
    modal.classList.remove('active');
    document.removeEventListener('keydown', handleKeyDown);
    for (const slot of slots) {
      if (slot.tempUrl) {
        URL.revokeObjectURL(slot.tempUrl);
        slot.tempUrl = null;
      }
      slot.pendingFile = null;
      slot.pendingDelete = false;
    }
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  };

  closeBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  themeToggle?.addEventListener('change', () => {
    const isDual = themeToggle.checked;
    if (isDual) {
      singleWrapper?.classList.add('hidden');
      dualWrapper?.classList.remove('hidden');
    } else {
      dualWrapper?.classList.add('hidden');
      singleWrapper?.classList.remove('hidden');
    }
  });

  slots = [
    {
      key: 'custom_wallpaper',
      elements: {
        dropzone: document.getElementById('wallpaperDropzone'),
        fileInput: document.getElementById('wallpaperEditFileInput') as HTMLInputElement | null,
        emptyState: document.getElementById('wallpaperDropzoneEmpty'),
        previewState: document.getElementById('wallpaperDropzonePreview'),
        previewThumb: document.getElementById('wallpaperPreviewThumb') as HTMLImageElement | null,
        editThumbBtn: document.getElementById('editWallpaperThumbBtn'),
        deleteThumbBtn: document.getElementById('deleteWallpaperThumbBtn'),
      },
      pendingFile: null,
      pendingDelete: false,
      tempUrl: null,
    },
    {
      key: 'custom_wallpaper_light',
      elements: {
        dropzone: document.getElementById('wallpaperDropzoneLight'),
        fileInput: document.getElementById('wallpaperEditFileInputLight') as HTMLInputElement | null,
        emptyState: document.getElementById('wallpaperDropzoneEmptyLight'),
        previewState: document.getElementById('wallpaperDropzonePreviewLight'),
        previewThumb: document.getElementById('wallpaperPreviewThumbLight') as HTMLImageElement | null,
        editThumbBtn: document.getElementById('editWallpaperThumbBtnLight'),
        deleteThumbBtn: document.getElementById('deleteWallpaperThumbBtnLight'),
      },
      pendingFile: null,
      pendingDelete: false,
      tempUrl: null,
    },
    {
      key: 'custom_wallpaper_dark',
      elements: {
        dropzone: document.getElementById('wallpaperDropzoneDark'),
        fileInput: document.getElementById('wallpaperEditFileInputDark') as HTMLInputElement | null,
        emptyState: document.getElementById('wallpaperDropzoneEmptyDark'),
        previewState: document.getElementById('wallpaperDropzonePreviewDark'),
        previewThumb: document.getElementById('wallpaperPreviewThumbDark') as HTMLImageElement | null,
        editThumbBtn: document.getElementById('editWallpaperThumbBtnDark'),
        deleteThumbBtn: document.getElementById('deleteWallpaperThumbBtnDark'),
      },
      pendingFile: null,
      pendingDelete: false,
      tempUrl: null,
    },
  ];

  for (const slot of slots) {
    setupDropzoneEvents(slot);
  }

  saveBtn?.addEventListener('click', async () => {
    const isDual = themeToggle ? themeToggle.checked : false;
    localStorage.setItem('dualWallpaperEnabled', String(isDual));

    try {
      const { saveWallpaperToDB, deleteWallpaperFromDB } = await import('@/core/lazy/wallpaper-storage');

      for (const slot of slots) {
        if (slot.pendingFile) {
          await saveWallpaperToDB(slot.pendingFile, slot.key);
        } else if (slot.pendingDelete) {
          await deleteWallpaperFromDB(slot.key);
        }
      }

      state.setWallpaperEnabled(true);
      state.setCurrentWallpaperSource('local');
      state.setCurrentWallpaperType('upload');
      localStorage.setItem('wallpaperEnabled', 'true');
      localStorage.setItem('wallpaperSource', 'local');
      localStorage.setItem('wallpaperType', 'upload');

      if (refs.toggleWallpaper) {
        refs.toggleWallpaper.checked = true;
      }

      const autoColorBtn = document.querySelector('.color-preset-btn.auto-preset') as HTMLButtonElement | null;
      if (autoColorBtn) {
        autoColorBtn.disabled = false;
      }

      import('@/core/ui/ui-components').then(({ setCollapsible }) => {
        if (refs.wallpaperSourceContainer) setCollapsible(refs.wallpaperSourceContainer, true, false);
        if (refs.wallpaperOverlaySetting) setCollapsible(refs.wallpaperOverlaySetting, true, false);
      });

      if (refs.wallpaperSourceSelect) {
        refs.wallpaperSourceSelect.value = 'upload';
        const trigger = refs.wallpaperSourceContainer?.querySelector('.fluent-select-value');
        if (trigger) {
          trigger.textContent = (window as any).getTranslation?.('uploadOption') || 'Upload Image';
          trigger.setAttribute('data-i18n', 'uploadOption');
        }
      }

      const uploadContainer = document.getElementById('uploadWallpaperContainer');
      if (uploadContainer) {
        uploadContainer.style.display = 'flex';
      }

      const { WallpaperEngine } = await import('@/core/lazy/wallpaper-engine');
      await WallpaperEngine.render();

      closeModal();
    } catch (error) {
      console.error('Failed to save image to IndexedDB:', error);
      const { warningModal } = await import('@/core/ui/ui-components');
      warningModal.show({
        title: (window as any).getTranslation?.('wallpaperDbErrorTitle') || 'Storage Error',
        message:
          (window as any).getTranslation?.('wallpaperDbErrorDesc') ||
          'Failed to save the wallpaper in IndexedDB. Your browser storage might be full or restricted.',
        confirmText: (window as any).getTranslation?.('warningUnderstood') || 'Understood',
        confirmVariant: 'danger',
        onConfirm: () => {},
      });
    }
  });
}

export async function openWallpaperEditModal(): Promise<void> {
  mountTemplate('tpl-wallpaper-edit-modal');

  const modal = document.getElementById('wallpaperEditModal');
  if (!modal) return;

  initModal();

  const themeToggle = document.getElementById('toggleThemeWallpaper') as HTMLInputElement | null;
  const singleWrapper = document.getElementById('wallpaperSingleDropzoneWrapper');
  const dualWrapper = document.getElementById('wallpaperDualDropzonesWrapper');

  const isDual = localStorage.getItem('dualWallpaperEnabled') === 'true';
  if (themeToggle) {
    themeToggle.checked = isDual;
  }
  if (isDual) {
    singleWrapper?.classList.add('hidden');
    dualWrapper?.classList.remove('hidden');
  } else {
    dualWrapper?.classList.add('hidden');
    singleWrapper?.classList.remove('hidden');
  }

  await Promise.all(slots.map((slot) => loadSlot(slot)));

  document.addEventListener('keydown', handleKeyDown);
  modal.classList.add('active');
}
