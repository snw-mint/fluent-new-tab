/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

export const STORE_RATE_URLS: Record<string, string> = {
  chrome:
    'https://chromewebstore.google.com/detail/fluent-new-tab/pbbiecccbghiolgifmlichmgpoclijfa/reviews?hl=en-US#:~:text=write%20a%20review',
  edge:
    'https://microsoftedge.microsoft.com/addons/detail/fluent-new-tab/hcohjkajcimobdddlnfnfhdfnbapondc#:~:text=add%20a%20review',
  firefox:
    'https://addons.mozilla.org/en-US/firefox/addon/fluent-new-tab/#:~:text=rated',
};

export function getStoreRateUrl(): string {
  const targetStore = (import.meta.env.VITE_STORE || 'chrome').toLowerCase();
  return STORE_RATE_URLS[targetStore] || STORE_RATE_URLS.chrome;
}
