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

    const folderMaxSlots = FOLDER_FIXED_ROWS * COLUMNS;
    const availableSlots = isInsideFolder ? folderMaxSlots - 1 : maxSlots;
    const visibleShortcuts = activeArray.slice(0, availableSlots);

        if (isInsideFolder) {
        const backBtn = document.createElement('div');
        backBtn.className = 'shortcut-item folder-back-btn';
        
        const backText = window.getTranslation('backLabel');
        const finalBackText = (backText && backText !== 'backLabel') ? backText : 'Back';

        backBtn.innerHTML = `
            <a class="shortcut-card" href="#" draggable="false" style="display: flex; align-items: center; justify-content: center; color: inherit; text-decoration: none;">
                <div class="shortcut-icon" style="display: flex; align-items: center; justify-content: center;">
                    ${BACK_ICON_SVG}
                </div>
            </a>
            <span class="shortcut-title">${finalBackText}</span>
        `;
        backBtn.setAttribute('draggable', 'false');
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            onGoBack();
        });
        shortcutsGrid.appendChild(backBtn);
    }

    visibleShortcuts.forEach((itemData, index) => {
        const isFolder = itemData.type === 'folder';
        const item = document.createElement('div');
        item.className = 'shortcut-item';
        const card = document.createElement('a');
        card.className = 'shortcut-card';
        card.href = isFolder ? '#' : (itemData.url || '#');
        card.draggable = true;
        card.style.color = 'inherit'; 
        card.style.textDecoration = 'none';

        if (isFolder) {
            card.style.display = 'flex';
        }

        const cardContent = isFolder ? FOLDER_ICON_SVG : '';

        card.innerHTML = `
            ${cardContent}
            <div class="menu-wrapper">
                <button class="menu-btn" title="${window.getTranslation('moreOptionsLabel')}">${typeof ICON_MENU_DOTS !== 'undefined' ? ICON_MENU_DOTS : '...'}</button>
                <div class="shortcut-dropdown">
                    <div class="menu-option edit-option">
                        ${typeof ICON_EDIT !== 'undefined' ? ICON_EDIT : 'E'} <span>${window.getTranslation('editLabel')}</span>
                    </div>
                    <div class="menu-option remove-option">
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

        /* =========================================
           BLINDAGEM DE EVENTOS (EVENT BUBBLING FIX)
           ========================================= */

        // 1. O clique principal do Card
        card.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            
            // Se o clique foi em qualquer lugar DENTRO do menu, nós abortamos a ação do card!
            if (target.closest('.menu-wrapper')) {
                e.preventDefault(); // Evita que o href="#" jogue a tela pro topo
                return;
            }

            // Se for pasta, abre a pasta
            if (isFolder) {
                e.preventDefault();
                onOpenFolder(itemData.id!);
            }
        });

        // 2. Os cliques isolados do Menu
        const menuBtn = card.querySelector('.menu-btn');
        const editOpt = card.querySelector('.edit-option');
        const removeOpt = card.querySelector('.remove-option');
        const dropdown = card.querySelector('.shortcut-dropdown');

        menuBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Impede que o clique suba para o card
            onClosePopups(dropdown);
            dropdown?.classList.toggle('active');
        });

        editOpt?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown?.classList.remove('active');
            onOpenModal(index); // O índice está seguro aqui via closure!
        });

        removeOpt?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown?.classList.remove('active');
            onDeleteShortcut(index); // O índice está seguro aqui via closure!
        });

        item.appendChild(card);

        // 3. Título abaixo do atalho
        const titleLink = document.createElement('a');
        titleLink.className = 'shortcut-title';
        titleLink.href = isFolder ? '#' : (itemData.url || '#');
        titleLink.textContent = itemData.name;
        
        if (isFolder) {
            titleLink.addEventListener('click', (e) => {
                e.preventDefault();
                onOpenFolder(itemData.id!);
            });
        }
        
        item.appendChild(titleLink);
        shortcutsGrid.appendChild(item);
    });

    // Adiciona o botão de "+" no final, se houver espaço
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

    // AVISO IMPORTANTE: Remova todos os shortcutsGrid.querySelectorAll(...) 
    // que ficavam aqui no final da função! Eles não são mais necessários 
    // e causarão eventos duplicados se você mantê-los.
}