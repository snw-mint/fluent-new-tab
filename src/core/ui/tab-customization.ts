import * as refs from '@/core/shared/dom-refs';

export function initTabCustomization(): void {
  const updateFavicon = (val: string) => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = val;
  };

  const savedTabName = localStorage.getItem('tabName');
  if (savedTabName) {
    document.title = savedTabName;
    if (refs.tabNameInput) {
      refs.tabNameInput.value = savedTabName;
    }
  }

  const savedTabIcon =
    localStorage.getItem('tabFavicon') || localStorage.getItem('tabIcon');
  if (savedTabIcon) {
    updateFavicon(savedTabIcon);
    if (refs.tabFaviconInput) {
      refs.tabFaviconInput.value = savedTabIcon;
    }
  }

  if (refs.tabNameInput) {
    refs.tabNameInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      localStorage.setItem('tabName', target.value);
      document.title =
        target.value.trim() === '' ? 'Fluent New Tab' : target.value;
    });
  }

  if (refs.tabFaviconInput) {
    refs.tabFaviconInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      localStorage.setItem('tabFavicon', target.value);
      updateFavicon(target.value);
    });

    refs.tabFaviconInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target) return;
      localStorage.setItem('tabFavicon', target.value);
      updateFavicon(target.value);
    });
  }

  if (refs.tabFaviconUploadBtn && refs.tabFaviconFileInput) {
    refs.tabFaviconUploadBtn.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      refs.tabFaviconFileInput.click();
    });

    refs.tabFaviconFileInput.addEventListener('change', async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            if (refs.tabFaviconInput) refs.tabFaviconInput.value = result;
            localStorage.setItem('tabFavicon', result);
            updateFavicon(result);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error uploading favicon:', error);
        }
      }
    });
  }
}
