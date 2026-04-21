/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file manages the rendering, interaction, and state of shortcuts and folders on the new tab page.
 */

interface ShortcutsRenderOptions {
  shortcutsGrid: HTMLDivElement | null;
  rowsSelect: HTMLSelectElement | null;
  shortcuts: Shortcut[];
  currentFolderId: string | null;
  onOpenModal: (index: number | null) => void;
  onDeleteShortcut: (index: number) => void;
  onClosePopups: (except?: Element | null) => void;
  onOpenFolder: (id: string) => void;
  onGoBack: () => void;
}

const FOLDER_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.207 4c.46 0 .908.141 1.284.402l.156.12L12.022 6.5h7.728a2.25 2.25 0 0 1 2.229 1.938l.016.158.005.154v9a2.25 2.25 0 0 1-2.096 2.245L19.75 20H4.25a2.25 2.25 0 0 1-2.245-2.096L2 17.75V6.25a2.25 2.25 0 0 1 2.096-2.245L4.25 4zm1.44 5.979a2.25 2.25 0 0 1-1.244.512l-.196.009-4.707-.001v7.251c0 .38.282.694.648.743l.102.007h15.5a.75.75 0 0 0 .743-.648l.007-.102v-9a.75.75 0 0 0-.648-.743L19.75 8h-7.729zM8.207 5.5H4.25a.75.75 0 0 0-.743.648L3.5 6.25v2.749L8.207 9a.75.75 0 0 0 .395-.113l.085-.06 1.891-1.578-1.89-1.575a.75.75 0 0 0-.377-.167z" fill="currentColor"/></svg>`;
const BACK_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.733 19.79a.75.75 0 0 0 1.034-1.086L5.516 12.75H20.25a.75.75 0 0 0 0-1.5H5.516l6.251-5.955a.75.75 0 0 0-1.034-1.086l-7.42 7.067a1 1 0 0 0-.3.58.8.8 0 0 0 .001.289 1 1 0 0 0 .3.579l7.419 7.067Z" fill="currentColor"/></svg>`;
const FOLDER_FIXED_ROWS = 4;

let shortcutTemplate: HTMLDivElement | null = null;

function getShortcutTemplate(): HTMLDivElement {
  if (!shortcutTemplate) {
    shortcutTemplate = document.createElement('div');
    shortcutTemplate.className = 'shortcut-item';
    shortcutTemplate.draggable = true;

    // We can use innerHTML here to ensure translations and SVGs work
    // when they might be updated dynamically, or just the fact that
    // SVGs need to be parsed from strings.
    // If the translations change dynamically, we might need to recreate the template,
    // but the original code was recreating these elements every single loop iteration.
    // Actually, to handle translations that change dynamically without reload,
    // we should let innerHTML handle the translation variables properly each time?
    // Wait, the original code used window.getTranslation inside the loop.
    // Since we are using a template, the translations are captured ONCE per page load.
    // This extension uses a full reload for language change.

    // But importantly, the icons are SVGs and must be parsed as HTML!

    const menuDots =
      typeof ICON_MENU_DOTS !== 'undefined' ? ICON_MENU_DOTS : '...';
    const editIcon = typeof ICON_EDIT !== 'undefined' ? ICON_EDIT : 'E';
    const removeIcon = typeof ICON_REMOVE !== 'undefined' ? ICON_REMOVE : 'R';
    const moreOptionsLabel = window.getTranslation('moreOptionsLabel');
    const editLabel = window.getTranslation('editLabel');
    const removeLabel = window.getTranslation('removeLabel');

    shortcutTemplate.innerHTML = `
      <a class="shortcut-card" draggable="false" style="color: inherit; text-decoration: none;" data-action="open-shortcut">
          <div class="menu-wrapper">
              <button class="menu-btn" title="${moreOptionsLabel}">${menuDots}</button>
              <div class="shortcut-dropdown">
                  <div class="menu-option edit-option">
                      ${editIcon} <span>${editLabel}</span>
                  </div>
                  <div class="menu-option remove-option">
                      ${removeIcon} <span>${removeLabel}</span>
                  </div>
              </div>
          </div>
      </a>
      <a class="shortcut-title" draggable="false"></a>
    `;
  }
  return shortcutTemplate;
}

function renderShortcutsGrid(options: ShortcutsRenderOptions): void {
  const {
    shortcutsGrid,
    rowsSelect,
    shortcuts,
    currentFolderId,
    onOpenModal,
    onDeleteShortcut,
    onClosePopups,
    onOpenFolder,
    onGoBack,
  } = options;
  if (!shortcutsGrid) return;

  const isHideNamesActive =
    localStorage.getItem('hideShortcutNames') === 'true';
  shortcutsGrid.setAttribute('data-hide-names', String(isHideNamesActive));

  shortcutsGrid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const COLUMNS = 10;
  const currentRows = rowsSelect
    ? parseInt(rowsSelect.value)
    : parseInt(localStorage.getItem('shortcutsRows') || '2') || 2;
  const maxSlots = currentRows * COLUMNS;
  let activeArray: Shortcut[] = shortcuts;
  let isInsideFolder = false;

  if (currentFolderId) {
    const currentFolder = shortcuts.find(
      (s) => s.id === currentFolderId && s.type === 'folder',
    );
    if (currentFolder) {
      activeArray = currentFolder.children || [];
      isInsideFolder = true;
    }
  }

  const folderMaxSlots = FOLDER_FIXED_ROWS * COLUMNS;
  const availableSlots = isInsideFolder ? folderMaxSlots - 1 : maxSlots;
  const visibleShortcuts = activeArray.slice(0, availableSlots);

  if (isInsideFolder) {
    const backBtn = document.createElement('div');
    backBtn.className = 'shortcut-item folder-back-btn';
    backBtn.dataset.action = 'go-back';

    const backText = window.getTranslation('backLabel');
    const finalBackText =
      backText && backText !== 'backLabel' ? backText : 'Back';

    backBtn.innerHTML = `
            <a class="shortcut-card" href="#" draggable="false" style="display: flex; align-items: center; justify-content: center; color: inherit; text-decoration: none;">
                <div class="shortcut-icon" style="display: flex; align-items: center; justify-content: center;">
                    ${BACK_ICON_SVG}
                </div>
            </a>
            <span class="shortcut-title">${finalBackText}</span>
        `;
    backBtn.setAttribute('draggable', 'false');
    fragment.appendChild(backBtn);
  }

  const template = getShortcutTemplate();

  for (let index = 0; index < visibleShortcuts.length; index++) {
    const itemData = visibleShortcuts[index];
    const isFolder = itemData.type === 'folder';
    const item = template.cloneNode(true) as HTMLDivElement;

    item.dataset.index = index.toString();
    item.dataset.type = isFolder ? 'folder' : 'shortcut';
    if (itemData.id) item.dataset.id = itemData.id;

    const card = item.querySelector('.shortcut-card') as HTMLAnchorElement;
    card.href = isFolder ? '#' : itemData.url || '#';

    if (isFolder) {
      card.style.display = 'flex';
    }

    const menuWrapper = card.firstElementChild as HTMLDivElement;

    if (isFolder) {
      if (itemData.customIcon) {
        const img = document.createElement('img');
        img.className = 'shortcut-icon loaded';
        img.src = itemData.customIcon;
        img.alt = itemData.name;
        img.style.width = '1.75rem';
        img.style.height = '1.75rem';
        img.style.objectFit = 'contain';
        card.insertBefore(img, menuWrapper);
      } else {
        card.insertAdjacentHTML('afterbegin', FOLDER_ICON_SVG);
      }
    } else {
      const img = document.createElement('img');
      img.decoding = 'async';
      img.className = 'shortcut-icon';
      img.alt = itemData.name;

      let targetIconSrc = itemData.customIcon;

      if (!targetIconSrc) {
        try {
          const parsedUrl = new URL(itemData.url);
          const hostname = parsedUrl.hostname;
          targetIconSrc = `https://favicon.vemetric.com/${hostname}?size=64`;
        } catch (error) {
          targetIconSrc = 'invalid-url';
        }
      }

      img.src = targetIconSrc;

      img.onload = function () {
        img.classList.add('loaded');
      };

      img.onerror = function () {
        img.onerror = null;
        img.src =
          'data:image/svg+xml;utf8,<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.999c5.524 0 10.002 4.478 10.002 10.002 0 5.523-4.478 10.001-10.002 10.001-5.524 0-10.002-4.478-10.002-10.001C1.998 6.477 6.476 1.999 12 1.999ZM14.939 16.5H9.06c.652 2.414 1.786 4.002 2.939 4.002s2.287-1.588 2.939-4.002Zm-7.43 0H4.785a8.532 8.532 0 0 0 4.094 3.411c-.522-.82-.953-1.846-1.27-3.015l-.102-.395Zm11.705 0h-2.722c-.324 1.335-.792 2.5-1.373 3.411a8.528 8.528 0 0 0 3.91-3.127l.185-.283ZM7.094 10H3.735l-.005.017a8.525 8.525 0 0 0-.233 1.984c0 1.056.193 2.067.545 3h3.173a20.847 20.847 0 0 1-.123-5Zm8.303 0H8.603a18.966 18.966 0 0 0 .135 5h6.524a18.974 18.974 0 0 0 .135-5Zm4.868 0h-3.358c.062.647.095 1.317.095 2a20.3 20.3 0 0 1-.218 3h3.173a8.482 8.482 0 0 0 .544-3c0-.689-.082-1.36-.236-2ZM8.88 4.09l-.023.008A8.531 8.531 0 0 0 4.25 8.5h3.048c.314-1.752.86-3.278 1.583-4.41ZM12 3.499l-.116.005C10.62 3.62 9.396 5.622 8.83 8.5h6.342c-.566-2.87-1.783-4.869-3.045-4.995L12 3.5Zm3.12.59.107.175c.669 1.112 1.177 2.572 1.475 4.237h3.048a8.533 8.533 0 0 0-4.339-4.29l-.291-.121Z" fill="%23212121"/></svg>';
      };

      card.insertBefore(img, menuWrapper);
    }

    const dropdown = menuWrapper.lastElementChild as HTMLDivElement;
    if (dropdown) {
      const editOpt = dropdown.firstElementChild as HTMLDivElement;
      const removeOpt = dropdown.lastElementChild as HTMLDivElement;
      if (editOpt) editOpt.dataset.index = index.toString();
      if (removeOpt) removeOpt.dataset.index = index.toString();
    }

    const titleLink = item.lastElementChild as HTMLAnchorElement;
    titleLink.href = isFolder ? '#' : itemData.url || '#';
    titleLink.textContent = itemData.name;
    titleLink.dataset.action = isFolder
      ? 'open-folder-title'
      : 'open-shortcut-title';
    titleLink.dataset.index = index.toString();

    fragment.appendChild(item);
  }

  if (visibleShortcuts.length < availableSlots) {
    const addBtn = document.createElement('div');
    addBtn.className = 'shortcut-item add-card-wrapper';
    addBtn.dataset.action = 'add-shortcut';
    addBtn.innerHTML = `
            <div class="shortcut-card">${typeof ICON_ADD !== 'undefined' ? ICON_ADD : '+'}</div>
            <span class="shortcut-title">${window.getTranslation('addShortcutLabel')}</span>
        `;
    fragment.appendChild(addBtn);
  }

  shortcutsGrid.appendChild(fragment);

  const handleGridClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const backBtn = target.closest('.folder-back-btn');
    if (backBtn) {
      event.preventDefault();
      onGoBack();
      return;
    }

    const addBtn = target.closest('.add-card-wrapper');
    if (addBtn) {
      event.preventDefault();
      onOpenModal(null);
      return;
    }

    const editOpt = target.closest('.edit-option') as HTMLElement | null;
    if (editOpt) {
      event.preventDefault();
      event.stopPropagation();
      onClosePopups();
      const editIndex = parseInt(editOpt.dataset.index || '-1', 10);
      if (editIndex > -1) onOpenModal(editIndex);
      return;
    }

    const removeOpt = target.closest('.remove-option') as HTMLElement | null;
    if (removeOpt) {
      event.preventDefault();
      event.stopPropagation();
      onClosePopups();
      const removeIndex = parseInt(removeOpt.dataset.index || '-1', 10);
      if (removeIndex > -1) onDeleteShortcut(removeIndex);
      return;
    }

    const menuBtn = target.closest('.menu-btn');
    if (menuBtn) {
      event.preventDefault();
      event.stopPropagation();
      const dropdown = menuBtn
        .closest('.menu-wrapper')
        ?.querySelector('.shortcut-dropdown');
      onClosePopups(dropdown);
      dropdown?.classList.toggle('active');
      syncShortcutDropdownState();
      return;
    }

    const dropdownContent = target.closest('.shortcut-dropdown');
    if (dropdownContent) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const card = target.closest('.shortcut-card');
    if (card) {
      const item = card.closest('.shortcut-item') as HTMLElement | null;
      const isFolder = item?.dataset.type === 'folder';
      const folderId = item?.dataset.id;

      if (card.querySelector('.menu-wrapper')?.contains(target)) {
        event.preventDefault();
        return;
      }

      if (isFolder && folderId) {
        event.preventDefault();
        onOpenFolder(folderId);
        return;
      }

      onClosePopups();
      return;
    }

    const titleLink = target.closest('.shortcut-title');
    if (titleLink) {
      const item = titleLink.closest('.shortcut-item') as HTMLElement | null;
      const isFolder = item?.dataset.type === 'folder';
      const folderId = item?.dataset.id;
      if (isFolder && folderId) {
        event.preventDefault();
        onOpenFolder(folderId);
        return;
      }
      return;
    }
  };

  const handleGridContext = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const card = target.closest('.shortcut-card');
    if (!card) return;

    event.preventDefault();
    const dropdown = card.querySelector('.shortcut-dropdown');
    onClosePopups(dropdown);
    dropdown?.classList.add('active');
    syncShortcutDropdownState();
  };

  shortcutsGrid.onclick = handleGridClick;
  shortcutsGrid.oncontextmenu = handleGridContext;
}
