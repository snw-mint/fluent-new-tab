/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import * as refs from '@/core/shared/dom-refs';

export function initLocalization(): void {
  if (refs.languageSelect) {
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang) refs.languageSelect.value = savedLang;
    else
      refs.languageSelect.value =
        refs.languageSelect.options[0]?.value || 'en_US';

    refs.languageSelect.dispatchEvent(new Event('change'));

    refs.languageSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement | null;
      if (!target) return;
      const nextLang = target.value;
      localStorage.setItem('userLanguage', nextLang);
      localStorage.removeItem(`i18n_cache_${nextLang}`);

      const win = window as any;
      if (typeof win.loadTranslations === 'function') win.loadTranslations();
      else if (typeof win.applyTranslations === 'function')
        win.applyTranslations();
      else document.dispatchEvent(new Event('i18nReady'));
    });
  }
}
