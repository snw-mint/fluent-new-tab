/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file contains functions to bind event listeners for various UI components and features,
 * managing user interactions and updating application state accordingly.
 */

interface DragDropOptions {
  gridContainer: HTMLElement;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onMoveToFolder: (itemIndex: number, folderId: string) => void;
  onMoveOutFolder: (itemIndex: number) => void;
}

let activeDragOptions: DragDropOptions | null = null;
let draggedElement: HTMLElement | null = null;
let ghostNode: HTMLElement | null = null;
let placeholder: HTMLElement | null = null;
let currentDropTarget: HTMLElement | null = null;
let dropAction: 'reorder' | 'folder' | 'out-of-folder' = 'reorder';
let rAF_ID: number = 0;

let mouseX = 0;
let mouseY = 0;
let offsetX = 0;
let offsetY = 0;

function initVanillaDragAndDrop(options: DragDropOptions): void {
  activeDragOptions = options;
  const grid = options.gridContainer;
  grid.addEventListener('dragstart', handleDragStart);
}

function handleDragStart(event: DragEvent): void {
  const target = event.target as HTMLElement;
  const item = target.closest('.shortcut-item') as HTMLElement | null;

  if (
    !item ||
    item.dataset.action === 'go-back' ||
    item.dataset.action === 'add-shortcut'
  ) {
    event.preventDefault();
    return;
  }

  draggedElement = item;
  if (activeDragOptions)
    activeDragOptions.gridContainer.classList.add('sorting');

  const rect = item.getBoundingClientRect();

  mouseX = event.clientX;
  mouseY = event.clientY;
  offsetX = mouseX - rect.left;
  offsetY = mouseY - rect.top;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', '');
    const emptyCanvas = document.createElement('canvas');
    emptyCanvas.width = 1;
    emptyCanvas.height = 1;
    event.dataTransfer.setDragImage(emptyCanvas, 0, 0);
  }

  createGhostNode(item, rect);

  document.addEventListener('dragover', handleGlobalDragOver);
  document.addEventListener('dragenter', handleGlobalDragEnter);
  document.addEventListener('drop', handleGlobalDrop);
  document.addEventListener('dragend', handleGlobalDragEnd);

  setTimeout(() => {
    if (!draggedElement) return;
    draggedElement.style.display = 'none';

    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'shortcut-item sortable-placeholder';
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
    }

    draggedElement.parentNode?.insertBefore(
      placeholder,
      draggedElement.nextSibling,
    );
  }, 0);
}

function createGhostNode(sourceItem: HTMLElement, rect: DOMRect): void {
  ghostNode = sourceItem.cloneNode(true) as HTMLElement;

  ghostNode.removeAttribute('id');
  ghostNode.style.position = 'fixed';
  ghostNode.style.pointerEvents = 'none';
  ghostNode.style.zIndex = '9999';
  ghostNode.style.top = '0';
  ghostNode.style.left = '0';
  ghostNode.style.width = `${rect.width}px`;
  ghostNode.style.height = `${rect.height}px`;
  ghostNode.style.margin = '0';
  ghostNode.style.opacity = '1';
  ghostNode.style.transform = `translate(${mouseX - offsetX}px, ${mouseY - offsetY}px)`;

  if (activeDragOptions) {
    activeDragOptions.gridContainer.appendChild(ghostNode);
  }

  function updateGhostPosition() {
    if (!ghostNode) return;
    ghostNode.style.transform = `translate(${mouseX - offsetX}px, ${mouseY - offsetY}px)`;
    rAF_ID = requestAnimationFrame(updateGhostPosition);
  }

  rAF_ID = requestAnimationFrame(updateGhostPosition);
}

function handleGlobalDragEnter(event: DragEvent): void {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleGlobalDragOver(event: DragEvent): void {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  mouseX = event.clientX;
  mouseY = event.clientY;

  if (activeDragOptions) {
    const gridRect = activeDragOptions.gridContainer.getBoundingClientRect();
    const isOutside =
      mouseX < gridRect.left ||
      mouseX > gridRect.right ||
      mouseY < gridRect.top ||
      mouseY > gridRect.bottom;

    if (isOutside) {
      dropAction = 'out-of-folder';
      currentDropTarget = null;
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      document
        .querySelectorAll('.folder-drag-hover')
        .forEach((el) => el.classList.remove('folder-drag-hover'));
      return;
    }
  }

  const target = event.target as HTMLElement;
  const item = target.closest('.shortcut-item') as HTMLElement | null;

  if (
    !item ||
    item === draggedElement ||
    item === placeholder ||
    item.dataset.action === 'go-back' ||
    item.dataset.action === 'add-shortcut'
  ) {
    return;
  }

  const rect = item.getBoundingClientRect();
  const isFolder = item.dataset.type === 'folder';
  const relX = mouseX - rect.left;
  const relY = mouseY - rect.top;

  if (isFolder) {
    const xPercentage = relX / rect.width;
    const yPercentage = relY / rect.height;
    if (
      xPercentage > 0.25 &&
      xPercentage < 0.75 &&
      yPercentage > 0.25 &&
      yPercentage < 0.75
    ) {
      dropAction = 'folder';
      currentDropTarget = item;
      item.classList.add('folder-drag-hover');
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      return;
    }
  }

  dropAction = 'reorder';
  currentDropTarget = item;
  document
    .querySelectorAll('.folder-drag-hover')
    .forEach((el) => el.classList.remove('folder-drag-hover'));

  const isAfter = relX > rect.width / 2;
  const parent = item.parentNode;
  const referenceNode = isAfter ? item.nextSibling : item;

  if (parent && placeholder && placeholder.nextSibling !== referenceNode) {
    movePlaceholderWithAnimation(parent, referenceNode);
  }
}

function movePlaceholderWithAnimation(
  parent: Node,
  referenceNode: Node | null,
): void {
  if (!activeDragOptions || !placeholder) return;
  const grid = activeDragOptions.gridContainer;
  const siblings = Array.from(grid.children) as HTMLElement[];
  const rects = new Map<HTMLElement, DOMRect>();

  siblings.forEach((el) => rects.set(el, el.getBoundingClientRect()));

  parent.insertBefore(placeholder, referenceNode);

  siblings.forEach((el) => {
    const oldRect = rects.get(el);
    if (
      !oldRect ||
      el === ghostNode ||
      el === draggedElement ||
      el === placeholder
    )
      return;

    const newRect = el.getBoundingClientRect();
    const dx = oldRect.left - newRect.left;
    const dy = oldRect.top - newRect.top;

    if (dx !== 0 || dy !== 0) {
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = 'none';

      requestAnimationFrame(() => {
        el.style.transform = '';
        el.style.transition = 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)';

        el.addEventListener('transitionend', function handler(e) {
          if (e.propertyName === 'transform') {
            el.style.transition = '';
            el.removeEventListener('transitionend', handler);
          }
        });
      });
    }
  });
}

function handleGlobalDrop(event: DragEvent): void {
  event.preventDefault();

  if (draggedElement && activeDragOptions) {
    const oldIndex = parseInt(draggedElement.dataset.index || '-1', 10);

    if (dropAction === 'out-of-folder' && oldIndex > -1) {
      activeDragOptions.onMoveOutFolder(oldIndex);
    } else if (dropAction === 'folder' && currentDropTarget) {
      const folderId = currentDropTarget.dataset.id;
      if (folderId && oldIndex > -1) {
        activeDragOptions.onMoveToFolder(oldIndex, folderId);
      }
    } else if (
      dropAction === 'reorder' &&
      placeholder &&
      placeholder.parentNode
    ) {
      const grid = activeDragOptions.gridContainer;

      const pureItems = Array.from(grid.children).filter(
        (el) =>
          el.classList.contains('shortcut-item') &&
          !el.classList.contains('add-card-wrapper') &&
          !el.classList.contains('folder-back-btn') &&
          el !== ghostNode &&
          el !== draggedElement,
      );

      const placeholderIndex = pureItems.indexOf(placeholder as HTMLElement);

      if (placeholderIndex > -1 && oldIndex > -1) {
        let newIndex = placeholderIndex;
        if (oldIndex !== newIndex) {
          activeDragOptions.onReorder(oldIndex, newIndex);
        }
      }
    }
  }

  cleanupDrag();
}

function handleGlobalDragEnd(event: DragEvent): void {
  cleanupDrag();
}

function cleanupDrag(): void {
  if (activeDragOptions)
    activeDragOptions.gridContainer.classList.remove('sorting');
  if (rAF_ID) cancelAnimationFrame(rAF_ID);

  document.removeEventListener('dragover', handleGlobalDragOver);
  document.removeEventListener('dragenter', handleGlobalDragEnter);
  document.removeEventListener('drop', handleGlobalDrop);
  document.removeEventListener('dragend', handleGlobalDragEnd);

  if (ghostNode && ghostNode.parentNode) {
    ghostNode.parentNode.removeChild(ghostNode);
  }
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.removeChild(placeholder);
  }
  if (draggedElement) {
    draggedElement.style.display = '';
  }

  document
    .querySelectorAll('.folder-drag-hover')
    .forEach((el) => el.classList.remove('folder-drag-hover'));

  ghostNode = null;
  draggedElement = null;
  placeholder = null;
  currentDropTarget = null;
}
