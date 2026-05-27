interface DragDropOptions {
  gridContainer: HTMLElement;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onMoveToFolder: (itemIndex: number, folderId: string) => void;
  onMoveOutFolder: (itemIndex: number) => void;
}

export let activeDragOptions: DragDropOptions | null = null;
export let draggedElement: HTMLElement | null = null;
export let ghostNode: HTMLElement | null = null;
export let placeholder: HTMLElement | null = null;
export let currentDropTarget: HTMLElement | null = null;
export let dropAction: 'reorder' | 'folder' | 'out-of-folder' = 'reorder';
export let rAF_ID: number = 0;

export let mouseX = 0;
export let mouseY = 0;
export let offsetX = 0;
export let offsetY = 0;
export let dragStartRect: DOMRect | null = null;
export let ghostBaseX = 0;
export let ghostBaseY = 0;
export let ghostScale = 1;

export function initVanillaDragAndDrop(options: DragDropOptions) {
  if (!options || !options.gridContainer) return;
  activeDragOptions = options;
  const grid = options.gridContainer;
  grid.addEventListener('dragstart', handleDragStart);
}

export function handleDragStart(event: DragEvent): void {
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
  dragStartRect = rect;

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

export function createGhostNode(sourceItem: HTMLElement, rect: DOMRect): void {
  ghostNode = sourceItem.cloneNode(true) as HTMLElement;

  ghostNode.removeAttribute('id');
  ghostNode.classList.add('fluent-drag-ghost');
  ghostNode.style.position = 'fixed';
  ghostNode.style.pointerEvents = 'none';
  ghostNode.style.zIndex = '9999';
  ghostNode.style.top = '0';
  ghostNode.style.left = '0';
  ghostNode.style.width = `${rect.width}px`;
  ghostNode.style.height = `${rect.height}px`;
  ghostNode.style.margin = '0';
  ghostNode.style.opacity = '1';

  if (activeDragOptions) {
    activeDragOptions.gridContainer.appendChild(ghostNode);
  }

  ghostNode.style.transform = 'translate(0px, 0px)';
  const zeroRect = ghostNode.getBoundingClientRect();
  ghostBaseX = zeroRect.left;
  ghostBaseY = zeroRect.top;
  ghostScale = zeroRect.width / (ghostNode.offsetWidth || 1);

  function updateGhostPosition() {
    if (!ghostNode || !dragStartRect || !activeDragOptions) return;

    const gridRect = activeDragOptions.gridContainer.getBoundingClientRect();
    const isSingleRow =
      activeDragOptions.gridContainer.classList.contains('single-row');
    const isInsideFolder =
      !!activeDragOptions.gridContainer.querySelector('.folder-back-btn');

    const isOutside =
      isInsideFolder &&
      (mouseX < gridRect.left - 50 ||
        mouseX > gridRect.right + 50 ||
        mouseY < gridRect.top - 50 ||
        mouseY > gridRect.bottom + 50);

    let screenTargetX = mouseX - offsetX;
    let screenTargetY = mouseY - offsetY;

    if (!isOutside) {
      screenTargetX = Math.max(
        gridRect.left,
        Math.min(screenTargetX, gridRect.right - dragStartRect.width),
      );
      if (isSingleRow) {
        screenTargetY = dragStartRect.top;
      } else {
        screenTargetY = Math.max(
          gridRect.top,
          Math.min(screenTargetY, gridRect.bottom - dragStartRect.height),
        );
      }
    }

    const tx = (screenTargetX - ghostBaseX) / ghostScale;
    const ty = (screenTargetY - ghostBaseY) / ghostScale;

    ghostNode.style.transform = `translate(${tx}px, ${ty}px)`;
    rAF_ID = requestAnimationFrame(updateGhostPosition);
  }

  rAF_ID = requestAnimationFrame(updateGhostPosition);
}

export function handleGlobalDragEnter(event: DragEvent): void {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

export function handleGlobalDragOver(event: DragEvent): void {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  mouseX = event.clientX;
  mouseY = event.clientY;

  if (!activeDragOptions || !dragStartRect) return;

  const gridRect = activeDragOptions.gridContainer.getBoundingClientRect();
  const isSingleRow =
    activeDragOptions.gridContainer.classList.contains('single-row');
  const isInsideFolder =
    !!activeDragOptions.gridContainer.querySelector('.folder-back-btn');

  const isOutside =
    isInsideFolder &&
    (mouseX < gridRect.left - 50 ||
      mouseX > gridRect.right + 50 ||
      mouseY < gridRect.top - 50 ||
      mouseY > gridRect.bottom + 50);

  let targetX = mouseX - offsetX;
  let targetY = mouseY - offsetY;

  if (!isOutside) {
    targetX = Math.max(
      gridRect.left,
      Math.min(targetX, gridRect.right - dragStartRect.width),
    );
    if (isSingleRow) {
      targetY = dragStartRect.top;
    } else {
      targetY = Math.max(
        gridRect.top,
        Math.min(targetY, gridRect.bottom - dragStartRect.height),
      );
    }
  }

  const centerX = targetX + dragStartRect.width / 2;
  const centerY = targetY + dragStartRect.height / 2;

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

  const items = Array.from(activeDragOptions.gridContainer.children).filter(
    (el) =>
      el.classList.contains('shortcut-item') &&
      !el.classList.contains('add-card-wrapper') &&
      !el.classList.contains('folder-back-btn') &&
      el !== draggedElement &&
      el !== ghostNode &&
      el !== placeholder,
  ) as HTMLElement[];

  let closestItem: HTMLElement | null = null;
  let minDistance = Infinity;

  items.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const elCenterX = rect.left + rect.width / 2;
    const elCenterY = rect.top + rect.height / 2;
    const dist = Math.hypot(centerX - elCenterX, centerY - elCenterY);
    if (dist < minDistance) {
      minDistance = dist;
      closestItem = el;
    }
  });

  if (!closestItem) return;

  const item = closestItem;
  const rect = item.getBoundingClientRect();
  const isFolder = item.dataset.type === 'folder';

  const relX = centerX - rect.left;
  const relY = centerY - rect.top;

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

  const parent = item.parentNode;
  if (!parent) return;

  const allSortable = Array.from(parent.children).filter(
    (el) =>
      el.classList.contains('shortcut-item') &&
      !el.classList.contains('add-card-wrapper') &&
      !el.classList.contains('folder-back-btn') &&
      el !== ghostNode &&
      el !== placeholder,
  );

  const draggedIdx = allSortable.indexOf(draggedElement as HTMLElement);
  const targetIdx = allSortable.indexOf(item);

  let isAfter = false;
  if (draggedIdx > -1 && targetIdx > -1) {
    isAfter = draggedIdx < targetIdx;
  } else {
    isAfter = centerX > rect.left + rect.width / 2;
  }

  const referenceNode = isAfter ? item.nextSibling : item;

  if (
    placeholder &&
    placeholder.nextSibling !== referenceNode &&
    placeholder !== referenceNode
  ) {
    movePlaceholderWithAnimation(parent, referenceNode);
  }
}

export function movePlaceholderWithAnimation(
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

export function handleGlobalDrop(event: DragEvent): void {
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

      const allItems = Array.from(grid.children).filter(
        (el) =>
          el.classList.contains('shortcut-item') &&
          !el.classList.contains('add-card-wrapper') &&
          !el.classList.contains('folder-back-btn') &&
          el !== ghostNode,
      );

      const pureIndex = allItems.indexOf(placeholder as HTMLElement);
      let newIndex = pureIndex;

      if (oldIndex > -1 && newIndex > -1) {
        if (newIndex > oldIndex) {
          newIndex--;
        }
      }

      if (newIndex > -1 && oldIndex > -1) {
        if (oldIndex !== newIndex) {
          activeDragOptions.onReorder(oldIndex, newIndex);
        }
      }
    }
  }

  cleanupDrag();
}

export function handleGlobalDragEnd(event: DragEvent): void {
  cleanupDrag();
}

export function cleanupDrag(): void {
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
