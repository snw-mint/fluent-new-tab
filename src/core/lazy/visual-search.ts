/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Contributions by @welaxxx (Base code)
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { warningModal } from '@/core/ui/ui-components';
import { getLocalizedWarningText } from '@/core/shared/dom-utils';

function getSafeText(key: string, fallback: string): string {
  const text = getLocalizedWarningText(key, fallback);
  if (!text || text === key) return fallback;
  return text;
}

export function doImageUrlSearch(url: string): void {
  if (!url || !url.trim()) return;

  const trimmed = url.trim();
  window.open(
    'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(trimmed),
    '_blank',
  );
}

export function doImageFileSearch(file: File, useCurrentTab = false): void {
  if (!file) return;

  const form = document.createElement('form');

  form.method = 'POST';
  form.action = 'https://www.google.com/searchbyimage/upload';
  form.enctype = 'multipart/form-data';
  form.target = useCurrentTab ? '_self' : '_blank';
  form.style.cssText =
    'position:fixed;top:-9999px;opacity:0;pointer-events:none';

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

  document.body.appendChild(form);
  form.submit();

  setTimeout(() => {
    if (form.parentNode) {
      form.parentNode.removeChild(form);
    }
  }, 3000);
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

  messageEl.textContent = '';

  if (modalActions) {
    modalActions.style.display = 'none';
  }

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
        setTimeout(() => {
          messageEl.textContent = '';
        }, 220);
        observer.disconnect();
      }
    }
  });

  observer.observe(overlay, { attributes: true });

  warningModal.show({
    title: getSafeText('visualSearchTitle', 'Visual Search'),
    message: '',
    onConfirm: () => {},
  });

  const existingCloseBtn = overlay.querySelector('.visual-search-close-btn');
  if (!existingCloseBtn && modalContent) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'visual-search-close-btn';

    const svgClose = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    svgClose.setAttribute('width', '24');
    svgClose.setAttribute('height', '24');
    svgClose.setAttribute('viewBox', '0 0 24 24');
    svgClose.setAttribute('fill', 'none');
    const pathClose = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path',
    );
    pathClose.setAttribute(
      'd',
      'm4.397 4.554.073-.084a.75.75 0 0 1 .976-.073l.084.073L12 10.939l6.47-6.47a.75.75 0 1 1 1.06 1.061L13.061 12l6.47 6.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L12 13.061l-6.47 6.47a.75.75 0 0 1-1.06-1.061L10.939 12l-6.47-6.47a.75.75 0 0 1-.072-.976l.073-.084z',
    );
    pathClose.setAttribute('fill', 'currentColor');
    svgClose.appendChild(pathClose);
    closeBtn.appendChild(svgClose);

    closeBtn.addEventListener('click', closeVisualSearchInterface);
    modalContent.appendChild(closeBtn);
  }

  overlay.classList.add('is-visual-search-active');

  const dropZone = document.createElement('div');
  dropZone.id = 'imageDropZone';
  dropZone.className = 'image-drop-zone';

  const svgDrag = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgDrag.setAttribute('width', '48');
  svgDrag.setAttribute('height', '48');
  svgDrag.setAttribute('viewBox', '0 0 24 24');
  svgDrag.setAttribute('fill', 'none');
  svgDrag.setAttribute('class', 'visual-search-drag-icon');
  const pathDrag = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  );
  pathDrag.setAttribute(
    'd',
    'M21.25 17a.75.75 0 0 1 .102 1.493l-.102.007H18.5v2.75a.75.75 0 0 1-1.493.102L17 21.25V18.5H8.75a3.25 3.25 0 0 1-3.245-3.066L5.5 15.25 5.499 7H2.75a.75.75 0 0 1-.102-1.493L2.75 5.5h2.749L5.5 2.75a.75.75 0 0 1 1.493-.102L7 2.75 6.999 5.5H7V7h-.001L7 15.25a1.75 1.75 0 0 0 1.606 1.744L8.75 17zM8 5.5h7.25a3.25 3.25 0 0 1 3.245 3.066l.005.184V16H17V8.75a1.75 1.75 0 0 0-1.607-1.744L15.25 7H8z',
  );
  pathDrag.setAttribute('fill', 'currentColor');
  svgDrag.appendChild(pathDrag);

  const spanEl = document.createElement('span');
  const spanText = document.createElement('span');
  spanText.setAttribute('data-i18n', 'visualSearchDragText');
  spanText.textContent = getSafeText(
    'visualSearchDragText',
    'Drag an image here or',
  );

  const uploadLink = document.createElement('a');
  uploadLink.href = '#';
  uploadLink.id = 'imageSearchUploadLink';
  uploadLink.setAttribute('data-i18n', 'visualSearchUploadLink');
  uploadLink.textContent = getSafeText(
    'visualSearchUploadLink',
    'upload a file',
  );

  spanEl.appendChild(spanText);
  spanEl.appendChild(document.createTextNode(' '));
  spanEl.appendChild(uploadLink);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'imageSearchFileInput';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';

  dropZone.appendChild(svgDrag);
  dropZone.appendChild(spanEl);
  dropZone.appendChild(fileInput);

  const divider = document.createElement('div');
  divider.className = 'visual-search-divider';
  divider.setAttribute('data-i18n', 'visualSearchDivider');
  divider.textContent = getSafeText('visualSearchDivider', 'or');

  const wrapper = document.createElement('div');
  wrapper.className = 'image-url-input-wrapper';

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.id = 'imageSearchUrlInput';
  urlInput.setAttribute('data-i18n-placeholder', 'visualSearchPasteUrl');
  urlInput.placeholder = getSafeText(
    'visualSearchPasteUrl',
    'Paste image link',
  );

  const urlBtn = document.createElement('button');
  urlBtn.type = 'button';
  urlBtn.id = 'imageSearchUrlBtn';
  urlBtn.setAttribute('data-i18n', 'visualSearchSearchBtn');
  urlBtn.textContent = getSafeText('visualSearchSearchBtn', 'Search');

  wrapper.appendChild(urlInput);
  wrapper.appendChild(urlBtn);

  messageEl.appendChild(dropZone);
  messageEl.appendChild(divider);
  messageEl.appendChild(wrapper);

  uploadLink.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    const fileToUpload = file
      ? new File([file], file.name, { type: file.type })
      : null;
    target.value = '';
    if (fileToUpload) {
      closeVisualSearchInterface();
      setTimeout(() => doImageFileSearch(fileToUpload, false), 100);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    if (!dropZone.contains(e.relatedTarget as Node)) {
      dropZone.classList.remove('drag-over');
    }
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      closeVisualSearchInterface();
      doImageFileSearch(file, false);
    } else if (
      e.dataTransfer?.getData('text/uri-list') ||
      e.dataTransfer?.getData('text/plain')
    ) {
      const url =
        e.dataTransfer.getData('text/uri-list') ||
        e.dataTransfer.getData('text/plain');
      closeVisualSearchInterface();
      doImageUrlSearch(url);
    }
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = urlInput.value.trim();
      if (val) {
        closeVisualSearchInterface();
        doImageUrlSearch(val);
      }
    }
  });

  urlBtn.addEventListener('click', () => {
    const val = urlInput.value.trim();
    if (val) {
      closeVisualSearchInterface();
      doImageUrlSearch(val);
    }
  });
}
