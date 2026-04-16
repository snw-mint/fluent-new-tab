/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/*
 * This file provides utility functions for common DOM manipulations and element retrieval.
 */

function getById<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function getInputTarget(event: Event): HTMLInputElement | null {
  return event.target instanceof HTMLInputElement ? event.target : null;
}

function getSelectTarget(event: Event): HTMLSelectElement | null {
  return event.target instanceof HTMLSelectElement ? event.target : null;
}

function getInputById(id: string): HTMLInputElement | null {
  return getById<HTMLInputElement>(id);
}
