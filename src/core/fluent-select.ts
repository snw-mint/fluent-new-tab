/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

let activeSelectTrigger: HTMLButtonElement | null = null;
let _popup: HTMLElement | null = null;

export function closeSelectPopup(): void {
  if (_popup) _popup.classList.remove('active');
  if (activeSelectTrigger) {
    activeSelectTrigger.classList.remove('popup-open');
    activeSelectTrigger = null;
  }
}

export function initCustomSelectSystem(): void {
  const popup = document.getElementById('fluent-select-popup');
  const listContainer = popup?.querySelector<HTMLUListElement>(
    '.fluent-select-options-list',
  );
  const triggers = document.querySelectorAll<HTMLButtonElement>(
    '.fluent-select-trigger',
  );

  if (!popup || !listContainer) return;

  _popup = popup;

  function positionPopup(trigger: HTMLElement): void {
    const rect = trigger.getBoundingClientRect();
    popup!.style.width = `${rect.width}px`;
    popup!.style.left = `${rect.left}px`;

    const popupHeight = Math.min(260, listContainer!.scrollHeight);
    const checkOverflowBottom = rect.bottom + popupHeight > window.innerHeight;
    const checkOverflowTop = rect.top - popupHeight > 0;

    if (checkOverflowBottom && checkOverflowTop) {
      popup!.style.top = `${rect.top - popupHeight - 2}px`;
    } else {
      popup!.style.top = `${rect.bottom + 2}px`;
    }
  }

  function openPopup(trigger: HTMLButtonElement): void {
    if (activeSelectTrigger === trigger) {
      closeSelectPopup();
      return;
    }

    closeSelectPopup();
    activeSelectTrigger = trigger;
    trigger.classList.add('popup-open');

    const nativeSelectId = trigger.getAttribute('data-target');
    if (!nativeSelectId) return;

    const nativeSelect = document.getElementById(
      nativeSelectId,
    ) as HTMLSelectElement | null;
    if (!nativeSelect || nativeSelect.disabled) {
      closeSelectPopup();
      return;
    }

    listContainer!.innerHTML = '';

    Array.from(nativeSelect.options).forEach((option) => {
      const li = document.createElement('li');
      li.className = 'fluent-select-option';
      li.textContent = option.textContent;
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', option.value);

      if (option.selected || nativeSelect.value === option.value) {
        li.classList.add('selected');
        li.setAttribute('aria-selected', 'true');
      }

      li.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        nativeSelect.value = option.value;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));

        const triggerValue = trigger.querySelector('.fluent-select-value');
        if (triggerValue) {
          triggerValue.textContent = option.textContent;
          const i18nKey = option.getAttribute('data-i18n');
          if (i18nKey) triggerValue.setAttribute('data-i18n', i18nKey);
        }

        closeSelectPopup();
      });

      listContainer!.appendChild(li);
    });

    popup!.classList.add('active');
    positionPopup(trigger);

    const currentSelected = listContainer!.querySelector<HTMLElement>(
      '.fluent-select-option.selected',
    );
    if (currentSelected) {
      listContainer!.scrollTop =
        currentSelected.offsetTop - listContainer!.offsetTop;
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      openPopup(trigger);
    });
  });

  popup.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => closeSelectPopup());

  window.addEventListener('resize', () => {
    if (activeSelectTrigger) positionPopup(activeSelectTrigger);
  });

  document.querySelectorAll('.settings-popup').forEach((container) => {
    container.addEventListener('scroll', () => {
      if (activeSelectTrigger) {
        closeSelectPopup();
      }
    });
  });

  function syncAllTriggersText(): void {
    triggers.forEach((trigger) => {
      const targetId = trigger.getAttribute('data-target');
      if (!targetId) return;
      const select = document.getElementById(
        targetId,
      ) as HTMLSelectElement | null;

      if (select) {
        const triggerValue = trigger.querySelector('.fluent-select-value');

        let selectedOption = select.options[select.selectedIndex];
        if (!selectedOption) {
          selectedOption =
            select.querySelector('option[selected]') || select.options[0];
        }

        if (triggerValue && selectedOption) {
          triggerValue.textContent = selectedOption.textContent;
          const i18nKey = selectedOption.getAttribute('data-i18n');
          if (i18nKey) {
            triggerValue.setAttribute('data-i18n', i18nKey);
          } else {
            triggerValue.removeAttribute('data-i18n');
          }
        }
      }
    });
  }

  syncAllTriggersText();

  triggers.forEach((trigger) => {
    const targetId = trigger.getAttribute('data-target');
    if (!targetId) return;
    const select = document.getElementById(targetId);
    if (select) {
      select.addEventListener('change', () => {
        syncAllTriggersText();
        if (
          activeSelectTrigger === trigger &&
          popup.classList.contains('active')
        ) {
          const currentTrigger = activeSelectTrigger;
          activeSelectTrigger = null;
          openPopup(currentTrigger);
        }
      });
    }
  });

  document.addEventListener('i18nReady', () => {
    syncAllTriggersText();
  });
}
