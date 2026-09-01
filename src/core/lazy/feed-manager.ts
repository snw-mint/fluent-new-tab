 import { getById } from '@/core/shared/dom-utils';

const PLUS_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.25a.75.75 0 0 1 .75.75v7.25H20a.75.75 0 0 1 0 1.5h-7.25V20a.75.75 0 0 1-1.5 0v-7.25H4a.75.75 0 0 1 0-1.5h7.25V4a.75.75 0 0 1 .75-.75" fill="currentColor"/></svg>`;
const MAX_FEEDS = 5;

let isInitialized = false;

function isValidUrl(val: string): boolean {
  try {
    const u = new URL(val.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function updateCompleteButtonState(): void {
  const saveBtn = getById<HTMLButtonElement>('saveFeedModalBtn');
  if (!saveBtn) return;
  const validInputs = document.querySelectorAll('.feed-url-input[data-validated="true"]');
  saveBtn.disabled = validInputs.length === 0;
}

function updateAddFieldButtonState(): void {
  const addBtn = getById<HTMLButtonElement>('feedAddFieldBtn');
  const container = getById<HTMLDivElement>('feedInputsContainer');
  if (!addBtn || !container) return;
  const count = container.querySelectorAll('.feed-input-row').length;
  addBtn.style.display = count >= MAX_FEEDS ? 'none' : 'inline-flex';
}

function createFeedRow(initialVal = '', isValidated = false): HTMLElement {
  const row = document.createElement('div');
  row.className = 'feed-input-row';

  const grp = document.createElement('div');
  grp.className = 'input-group';

  const lbl = document.createElement('label');
  lbl.textContent = 'RSS URL';

  const wrap = document.createElement('div');
  wrap.className = 'feed-input-wrapper';

  const inp = document.createElement('input');
  inp.type = 'url';
  inp.className = 'feed-url-input';
  inp.placeholder = 'https://example.com/feed.xml';
  inp.value = initialVal;
  if (isValidated) {
    inp.setAttribute('data-validated', 'true');
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'feed-add-btn';
  btn.innerHTML = PLUS_ICON;
  btn.title = 'Validate & Add';
  btn.disabled = !isValidUrl(initialVal);

  inp.addEventListener('input', () => {
    const valid = isValidUrl(inp.value);
    btn.disabled = !valid;
    if (!valid) {
      inp.removeAttribute('data-validated');
      updateCompleteButtonState();
    }
  });

  btn.addEventListener('click', () => {
    if (!isValidUrl(inp.value)) return;
    inp.classList.add('is-valid');
    inp.setAttribute('data-validated', 'true');
    updateCompleteButtonState();
    setTimeout(() => {
      inp.classList.remove('is-valid');
    }, 3000);
  });

  wrap.appendChild(inp);
  wrap.appendChild(btn);
  grp.appendChild(lbl);
  grp.appendChild(wrap);
  row.appendChild(grp);

  return row;
}

export function closeFeedModal(): void {
  const modal = getById<HTMLDivElement>('feedModal');
  if (modal) modal.classList.remove('active');
}

export function openFeedModal(): void {
  const modal = getById<HTMLDivElement>('feedModal');
  const container = getById<HTMLDivElement>('feedInputsContainer');
  if (!modal || !container) return;

  if (!isInitialized) {
    isInitialized = true;
    const addBtn = getById<HTMLButtonElement>('feedAddFieldBtn');
    const closeBtn = getById<HTMLButtonElement>('closeFeedModalBtn');
    const form = getById<HTMLFormElement>('feedForm');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const count = container.querySelectorAll('.feed-input-row').length;
        if (count < MAX_FEEDS) {
          container.appendChild(createFeedRow());
          updateAddFieldButtonState();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeFeedModal);
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = container.querySelectorAll<HTMLInputElement>('.feed-url-input[data-validated="true"]');
        const urls: string[] = [];
        inputs.forEach((input) => {
          const val = input.value.trim();
          if (val && isValidUrl(val)) urls.push(val);
        });
        localStorage.setItem('feedRssUrls', JSON.stringify(urls.slice(0, MAX_FEEDS)));
        closeFeedModal();
      });
    }
  }

  container.innerHTML = '';
  let savedUrls: string[] = [];
  try {
    savedUrls = JSON.parse(localStorage.getItem('feedRssUrls') || '[]');
  } catch {
    savedUrls = [];
  }

  if (savedUrls.length > 0) {
    savedUrls.slice(0, MAX_FEEDS).forEach((url) => {
      container.appendChild(createFeedRow(url, true));
    });
  } else {
    container.appendChild(createFeedRow('', false));
  }

  updateAddFieldButtonState();
  updateCompleteButtonState();
  modal.classList.add('active');
}
