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
const BACK_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.733 19.79a.75.75 0 0 0 1.034-1.086L5.516 12.75H20.25a.75.75 0 0 0 0-1.5H5.516l6.251-5.955a.75.75 0 0 0-1.034-1.086l-7.42 7.067a1 1 0 0 0-.3.58.8.8 0 0 0 .001.289 1 1 0 0 0 .3.579l7.419 7.067Z" fill="#currentColor"/></svg>`;

function renderShortcutsGrid(options: ShortcutsRenderOptions): void {
    const { shortcutsGrid, rowsSelect, shortcuts, currentFolderId, onOpenModal, onDeleteShortcut, onClosePopups, onOpenFolder, onGoBack } = options;
    if (!shortcutsGrid) return;

    shortcutsGrid.innerHTML = '';
    const COLUMNS = 10;
    const currentRows = rowsSelect ? parseInt(rowsSelect.value) : (parseInt(localStorage.getItem('shortcutsRows') || '2') || 2);
    const maxSlots = currentRows * COLUMNS;
    let activeArray: Shortcut[] = shortcuts;
    let isInsideFolder = false;

    if (currentFolderId) {
        const currentFolder = shortcuts.find(s => s.id === currentFolderId && s.type === 'folder');
        if (currentFolder) {
            activeArray = currentFolder.children || [];
            isInsideFolder = true;
        }
    }

    const availableSlots = isInsideFolder ? maxSlots - 1 : maxSlots;
    const visibleShortcuts = activeArray.slice(0, availableSlots);

    if (isInsideFolder) {
        const backBtn = document.createElement('div');
        backBtn.className = 'shortcut-item folder-back-btn';
        backBtn.innerHTML = `
            <div class="shortcut-card" style="display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(150,150,150,0.1);">
                ${BACK_ICON_SVG}
            </div>
            <span class="shortcut-title">${window.getTranslation('backLabel') || 'Back'}</span>
        `;
        backBtn.addEventListener('click', onGoBack);
        shortcutsGrid.appendChild(backBtn);
    }

    visibleShortcuts.forEach((itemData, index) => {
        const isFolder = itemData.type === 'folder';
        const item = document.createElement('div');
        item.className = 'shortcut-item';
        const card = document.createElement(isFolder ? 'div' : 'a'); 
        card.className = 'shortcut-card';
        card.draggable = true;

        if (isFolder) {
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (!(e.target as HTMLElement).closest('.menu-btn')) {
                    onOpenFolder(itemData.id!);
                }
            });
        } else {
            (card as HTMLAnchorElement).href = itemData.url || '#';
        }

        let cardContent = '';
        if (isFolder) {
            cardContent = FOLDER_ICON_SVG;
        }

        card.innerHTML = `
            ${cardContent}
            <div class="menu-wrapper">
                <button class="menu-btn" title="${window.getTranslation('moreOptionsLabel')}">${typeof ICON_MENU_DOTS !== 'undefined' ? ICON_MENU_DOTS : '...'}</button>
                <div class="shortcut-dropdown">
                    <div class="menu-option edit-option" data-index="${index}">
                        ${typeof ICON_EDIT !== 'undefined' ? ICON_EDIT : 'E'} <span>${window.getTranslation('editLabel')}</span>
                    </div>
                    <div class="menu-option remove-option" data-index="${index}">
                        ${typeof ICON_REMOVE !== 'undefined' ? ICON_REMOVE : 'R'} <span>${window.getTranslation('removeLabel')}</span>
                    </div>
                </div>
            </div>
        `;

        if (!isFolder) {
            const img = document.createElement('img');
            img.src = itemData.customIcon || `https://www.google.com/s2/favicons?sz=64&domain_url=${itemData.url}`;
            img.className = 'shortcut-icon';
            img.alt = itemData.name;
            img.onerror = () => { img.src = typeof ICON_GLOBE_FALLBACK !== 'undefined' ? ICON_GLOBE_FALLBACK : ''; };
            card.prepend(img);
        }

        item.appendChild(card);

        const titleLink = document.createElement(isFolder ? 'div' : 'a');
        titleLink.className = 'shortcut-title';
        if (!isFolder) (titleLink as HTMLAnchorElement).href = itemData.url || '#';
        titleLink.textContent = itemData.name;
        item.appendChild(titleLink);

        shortcutsGrid.appendChild(item);
    });

    if (visibleShortcuts.length < availableSlots) {
        const addBtn = document.createElement('div');
        addBtn.className = 'shortcut-item add-card-wrapper';
        addBtn.addEventListener('click', () => onOpenModal(null));
        addBtn.innerHTML = `
            <div class="shortcut-card">${typeof ICON_ADD !== 'undefined' ? ICON_ADD : '+'}</div>
            <span class="shortcut-title">${window.getTranslation('addShortcutLabel')}</span>
        `;
        shortcutsGrid.appendChild(addBtn);
    }

    shortcutsGrid.querySelectorAll('.menu-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const dropdown = btn.nextElementSibling;
            onClosePopups(dropdown);
            dropdown?.classList.toggle('active');
        });
    });

    shortcutsGrid.querySelectorAll('.edit-option').forEach((opt) => {
        opt.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenModal(parseInt((opt as HTMLElement).dataset.index || '-1'));
            opt.closest('.shortcut-dropdown')?.classList.remove('active');
        });
    });

    shortcutsGrid.querySelectorAll('.remove-option').forEach((opt) => {
        opt.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            onDeleteShortcut(parseInt((opt as HTMLElement).dataset.index || '-1'));
        });
    });
}