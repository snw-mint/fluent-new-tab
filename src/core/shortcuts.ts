interface ShortcutsRenderOptions {
    shortcutsGrid: HTMLDivElement | null;
    rowsSelect: HTMLSelectElement | null;
    shortcuts: Shortcut[];
    onOpenModal: (index: number | null) => void;
    onDeleteShortcut: (index: number) => void;
    onClosePopups: (except?: Element | null) => void;
}

function renderShortcutsGrid(options: ShortcutsRenderOptions): void {
    const { shortcutsGrid, rowsSelect, shortcuts, onOpenModal, onDeleteShortcut, onClosePopups } = options;
    if (!shortcutsGrid) return;

    shortcutsGrid.innerHTML = '';
    const COLUMNS = 10;
    const currentRows = rowsSelect ? parseInt(rowsSelect.value) : (parseInt(localStorage.getItem('shortcutsRows') || '2') || 2);
    const maxSlots = currentRows * COLUMNS;
    const visibleShortcuts = shortcuts.slice(0, maxSlots);

    visibleShortcuts.forEach((site, index) => {
        const iconSrc = site.customIcon || `https://www.google.com/s2/favicons?sz=64&domain_url=${site.url}`;
        const link = document.createElement('div');
        link.className = 'shortcut-item';
        link.onclick = (event) => {
            if ((event.target as HTMLElement | null)?.closest('.menu-wrapper')) return;
            window.location.href = site.url;
        };

        const img = document.createElement('img');
        img.src = iconSrc;
        img.className = 'shortcut-icon';
        img.alt = site.name;
        img.onerror = () => { img.src = ICON_GLOBE_FALLBACK; };

        link.innerHTML = `
            <div class="shortcut-card">
                <div class="menu-wrapper">
                    <button class="menu-btn" title="${window.getTranslation('moreOptionsLabel')}">${ICON_MENU_DOTS}</button>
                    <div class="shortcut-dropdown">
                        <div class="menu-option edit-option" data-index="${index}">
                            ${ICON_EDIT} <span>${window.getTranslation('editLabel')}</span>
                        </div>
                        <div class="menu-option remove-option" data-index="${index}">
                            ${ICON_REMOVE} <span>${window.getTranslation('removeLabel')}</span>
                        </div>
                    </div>
                </div>
            </div>
            <span class="shortcut-title">${site.name}</span>
        `;

        const card = link.querySelector('.shortcut-card');
        if (card) card.appendChild(img);
        shortcutsGrid.appendChild(link);
    });

    if (visibleShortcuts.length < maxSlots) {
        const addBtn = document.createElement('div');
        addBtn.className = 'shortcut-item add-card-wrapper';
        addBtn.onclick = () => onOpenModal(null);
        addBtn.innerHTML = `
            <div class="shortcut-card">${ICON_ADD}</div>
            <span class="shortcut-title">${window.getTranslation('addShortcutLabel')}</span>
        `;
        shortcutsGrid.appendChild(addBtn);
    }

    shortcutsGrid.querySelectorAll('.menu-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const dropdown = btn.nextElementSibling;
            onClosePopups(dropdown);
            dropdown?.classList.toggle('active');
        });
    });

    shortcutsGrid.querySelectorAll('.edit-option').forEach((opt) => {
        opt.addEventListener('click', (event) => {
            event.stopPropagation();
            onOpenModal(parseInt((opt as HTMLElement).dataset.index || '-1'));
            opt.closest('.shortcut-dropdown')?.classList.remove('active');
        });
    });

    shortcutsGrid.querySelectorAll('.remove-option').forEach((opt) => {
        opt.addEventListener('click', (event) => {
            event.stopPropagation();
            onDeleteShortcut(parseInt((opt as HTMLElement).dataset.index || '-1'));
        });
    });
}
