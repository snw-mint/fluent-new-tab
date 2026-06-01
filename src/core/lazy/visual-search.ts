import { warningModal } from '@/core/ui/ui-components';
import { getLocalizedWarningText } from '@/core/shared/dom-utils';

export async function doImageUrlSearch(url: string, btnElement?: HTMLElement): Promise<void> {
  if (!url || !url.trim()) return;
  
  if (btnElement) btnElement.classList.add('is-loading');
  
  const trimmed = url.trim();
  window.open(
    'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(trimmed),
    '_blank',
  );
  
  if (btnElement) {
    setTimeout(() => btnElement.classList.remove('is-loading'), 1000);
  }
}

export async function doImageFileSearch(file: File, useCurrentTab = false, btnElement?: HTMLElement): Promise<void> {
  if (!file) return;
  
  if (btnElement) btnElement.classList.add('is-loading');

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.google.com/searchbyimage/upload';
  form.enctype = 'multipart/form-data';
  form.target = useCurrentTab ? '_self' : '_blank';
  form.style.cssText = 'position:fixed;top:-9999px;opacity:0;pointer-events:none';

  const ic = document.createElement('input');
  ic.type = 'hidden';
  ic.name = 'image_content';
  ic.value = '';

  const fi = document.createElement('input');
  fi.type = 'file';
  fi.name = 'encoded_image';

  const dt = new DataTransfer();
  dt.items.add(file);
  fi.files = dt.files;

  form.appendChild(ic);
  form.appendChild(fi);
  
  // Mandatory step for chromium browsers to allow form submission
  document.body.appendChild(form);
  
  try {
    form.submit();
  } finally {
    // Immediate removal of the dynamically created form
    if (form.parentNode) {
      form.parentNode.removeChild(form);
    }
    if (btnElement) {
      setTimeout(() => btnElement.classList.remove('is-loading'), 1000);
    }
  }
}

export function closeVisualSearchInterface(): void {
  warningModal.close();
}

export function openVisualSearchInterface(): void {
  const overlay = document.getElementById('warningModal');
  const titleEl = document.getElementById('warning-modal-title');
  const messageEl = document.getElementById('warning-modal-message');
  
  if (!overlay || !titleEl || !messageEl) return;

  const modalContent = overlay.querySelector('.modal-content') as HTMLElement;
  const modalActions = overlay.querySelector('.modal-actions') as HTMLElement;

  if (modalActions) {
    modalActions.style.display = 'none';
  }

  // Restore the normal warning modal state on close.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.attributeName === 'class' &&
        !overlay.classList.contains('active')
      ) {
        overlay.classList.remove('is-visual-search-active');
        if (modalActions) {
          modalActions.style.display = '';
        }
        const closeBtn = overlay.querySelector('.visual-search-close-btn');
        if (closeBtn) closeBtn.remove();
        observer.disconnect();
      }
    }
  });

  observer.observe(overlay, { attributes: true });

  // Call show first so it sets up everything and clears message
  warningModal.show({
    title: getLocalizedWarningText('visualSearchTitle', 'Visual Search'),
    message: '',
    onConfirm: () => {},
  });

  // Inject Close Button
  const existingCloseBtn = overlay.querySelector('.visual-search-close-btn');
  if (!existingCloseBtn && modalContent) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'visual-search-close-btn';
    closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m4.397 4.554.073-.084a.75.75 0 0 1 .976-.073l.084.073L12 10.939l6.47-6.47a.75.75 0 1 1 1.06 1.061L13.061 12l6.47 6.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L12 13.061l-6.47 6.47a.75.75 0 0 1-1.06-1.061L10.939 12l-6.47-6.47a.75.75 0 0 1-.072-.976l.073-.084z" fill="currentColor"/></svg>';
    closeBtn.addEventListener('click', closeVisualSearchInterface);
    modalContent.appendChild(closeBtn);
  }

  // Add temp class to hide buttons and indicate it's visual search
  overlay.classList.add('is-visual-search-active');

  // Inject Custom HTML
  messageEl.innerHTML = `
    <div id="imageDropZone" class="image-drop-zone">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="visual-search-drag-icon"><path d="M21.25 17a.75.75 0 0 1 .102 1.493l-.102.007H18.5v2.75a.75.75 0 0 1-1.493.102L17 21.25V18.5H8.75a3.25 3.25 0 0 1-3.245-3.066L5.5 15.25 5.499 7H2.75a.75.75 0 0 1-.102-1.493L2.75 5.5h2.749L5.5 2.75a.75.75 0 0 1 1.493-.102L7 2.75 6.999 5.5H7V7h-.001L7 15.25a1.75 1.75 0 0 0 1.606 1.744L8.75 17zM8 5.5h7.25a3.25 3.25 0 0 1 3.245 3.066l.005.184V16H17V8.75a1.75 1.75 0 0 0-1.607-1.744L15.25 7H8z" fill="currentColor"/></svg>
      <span><span data-i18n="visualSearchDragText">Drag an image here or</span> <a href="#" id="imageSearchUploadLink" data-i18n="visualSearchUploadLink">upload a file</a></span>
      <input type="file" id="imageSearchFileInput" accept="image/*" style="display: none" />
    </div>
    <div class="visual-search-divider" data-i18n="visualSearchDivider">or</div>
    <div class="image-url-input-wrapper">
      <input type="text" id="imageSearchUrlInput" data-i18n-placeholder="visualSearchPasteUrl" placeholder="Paste image link" />
      <button type="button" id="imageSearchUrlBtn" data-i18n="visualSearchSearchBtn">Search</button>
    </div>
  `;

  // Bind Events for Injected HTML
  const dropZone = document.getElementById('imageDropZone');
  const fileInput = document.getElementById('imageSearchFileInput') as HTMLInputElement;
  const uploadLink = document.getElementById('imageSearchUploadLink');
  const urlInput = document.getElementById('imageSearchUrlInput') as HTMLInputElement;
  const urlBtn = document.getElementById('imageSearchUrlBtn');
  const visualSearchBtn = document.getElementById('visualSearchBtn');

  if (uploadLink && fileInput) {
    uploadLink.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        closeVisualSearchInterface();
        doImageFileSearch(file, true, visualSearchBtn || undefined);
      }
      target.value = '';
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      if (!dropZone.contains(e.relatedTarget as Node)) {
        dropZone.classList.remove('drag-over');
      }
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        closeVisualSearchInterface();
        await doImageFileSearch(file, false, visualSearchBtn || undefined);
      } else if (
        e.dataTransfer?.getData('text/uri-list') ||
        e.dataTransfer?.getData('text/plain')
      ) {
        const url =
          e.dataTransfer.getData('text/uri-list') ||
          e.dataTransfer.getData('text/plain');
        closeVisualSearchInterface();
        await doImageUrlSearch(url, visualSearchBtn || undefined);
      }
    });
  }

  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = urlInput.value.trim();
        if (val) {
          closeVisualSearchInterface();
          doImageUrlSearch(val, visualSearchBtn || undefined);
        }
      }
    });
  }

  if (urlBtn) {
    urlBtn.addEventListener('click', () => {
      const val = urlInput?.value.trim();
      if (val) {
        closeVisualSearchInterface();
        doImageUrlSearch(val, visualSearchBtn || undefined);
      }
    });
  }
}
