import { mountTemplate } from '@/core/shared/dom-utils';

let isInitialized = false;

interface DropzoneElements {
  dropzone: HTMLElement | null;
  fileInput: HTMLInputElement | null;
  emptyState: HTMLElement | null;
  previewState: HTMLElement | null;
  previewThumb: HTMLImageElement | null;
  editThumbBtn: HTMLElement | null;
  deleteThumbBtn: HTMLElement | null;
}

function setupDropzone(elements: DropzoneElements): void {
  const { dropzone, fileInput, emptyState, previewState, previewThumb, editThumbBtn, deleteThumbBtn } = elements;
  if (!dropzone || !fileInput) return;

  let previewUrl: string | null = null;

  const cleanup = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  };

  const setPreview = (file: File) => {
    cleanup();
    previewUrl = URL.createObjectURL(file);
    if (previewThumb) {
      previewThumb.src = previewUrl;
    }
    emptyState?.classList.add('hidden');
    previewState?.classList.remove('hidden');
    dropzone.classList.add('has-image');
  };

  const clearPreview = () => {
    cleanup();
    if (previewThumb) {
      previewThumb.src = '';
    }
    fileInput.value = '';
    previewState?.classList.add('hidden');
    emptyState?.classList.remove('hidden');
    dropzone.classList.remove('has-image');
  };

  dropzone.addEventListener('click', () => {
    if (dropzone.classList.contains('has-image')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      setPreview(file);
    }
  });

  editThumbBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  deleteThumbBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearPreview();
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
      setPreview(file);
    }
  });
}

export function openWallpaperEditModal(): void {
  mountTemplate('tpl-wallpaper-edit-modal');

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
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  };

  if (!isInitialized) {
    isInitialized = true;

    closeBtn?.addEventListener('click', closeModal);
    saveBtn?.addEventListener('click', closeModal);

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

    setupDropzone({
      dropzone: document.getElementById('wallpaperDropzone'),
      fileInput: document.getElementById('wallpaperEditFileInput') as HTMLInputElement | null,
      emptyState: document.getElementById('wallpaperDropzoneEmpty'),
      previewState: document.getElementById('wallpaperDropzonePreview'),
      previewThumb: document.getElementById('wallpaperPreviewThumb') as HTMLImageElement | null,
      editThumbBtn: document.getElementById('editWallpaperThumbBtn'),
      deleteThumbBtn: document.getElementById('deleteWallpaperThumbBtn'),
    });

    setupDropzone({
      dropzone: document.getElementById('wallpaperDropzoneLight'),
      fileInput: document.getElementById('wallpaperEditFileInputLight') as HTMLInputElement | null,
      emptyState: document.getElementById('wallpaperDropzoneEmptyLight'),
      previewState: document.getElementById('wallpaperDropzonePreviewLight'),
      previewThumb: document.getElementById('wallpaperPreviewThumbLight') as HTMLImageElement | null,
      editThumbBtn: document.getElementById('editWallpaperThumbBtnLight'),
      deleteThumbBtn: document.getElementById('deleteWallpaperThumbBtnLight'),
    });

    setupDropzone({
      dropzone: document.getElementById('wallpaperDropzoneDark'),
      fileInput: document.getElementById('wallpaperEditFileInputDark') as HTMLInputElement | null,
      emptyState: document.getElementById('wallpaperDropzoneEmptyDark'),
      previewState: document.getElementById('wallpaperDropzonePreviewDark'),
      previewThumb: document.getElementById('wallpaperPreviewThumbDark') as HTMLImageElement | null,
      editThumbBtn: document.getElementById('editWallpaperThumbBtnDark'),
      deleteThumbBtn: document.getElementById('deleteWallpaperThumbBtnDark'),
    });
  }

  document.addEventListener('keydown', handleKeyDown);
  modal.classList.add('active');
}
