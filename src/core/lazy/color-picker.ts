/*
 * Fluent New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { applyAccentColor } from '@/core/boot/theme';
import { getLocalizedWarningText } from '@/core/shared/dom-utils';

function getSafeText(key: string, fallback: string): string {
  const text = getLocalizedWarningText(key, fallback);
  if (!text || text === key) return fallback;
  return text;
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => v - v * s * Math.max(Math.min(k(n), 4 - k(n), 1), 0);
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`.toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16) || 0,
    g: parseInt(cleanHex.substring(2, 4), 16) || 0,
    b: parseInt(cleanHex.substring(4, 6), 16) || 0,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

let pickerAbortController: AbortController | null = null;

function sanitizeHexInput(raw: string): string {
  return raw.replace(/[^0-9a-f]/gi, '').slice(0, 6).toUpperCase();
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const clean = sanitizeHexInput(hex);
  let r = 0,
    g = 0,
    b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  } else {
    return { h: 206, s: 100, v: 83 };
  }
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return { h: 206, s: 100, v: 83 };
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function initCustomColorPicker(
  customBtn: HTMLElement,
  warningModal: any,
  clearPresetSelection: () => void,
): void {
  pickerAbortController?.abort();
  pickerAbortController = new AbortController();
  const { signal } = pickerAbortController;

  warningModal?.ensureMounted?.();
  const currentColor = localStorage.getItem('accentColorValue') || '#0078D4';
  let { h, s, v } = hexToHsv(currentColor);

  const pickerContainer = document.getElementById('customColorPickerContainer') as HTMLDivElement;
  const canvasWrapper = document.getElementById('matrixWrapper') as HTMLDivElement;
  const canvas = document.getElementById('colorMatrixCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const cursor = document.getElementById('matrixCursor') as HTMLDivElement;
  const hueSlider = document.getElementById('colorHueSlider') as HTMLInputElement;
  const hexInput = document.getElementById('customColorHex') as HTMLInputElement;
  const rInput = document.getElementById('customColorR') as HTMLInputElement;
  const gInput = document.getElementById('customColorG') as HTMLInputElement;
  const bInput = document.getElementById('customColorB') as HTMLInputElement;
  const moreBtn = document.getElementById('custom-color-more-btn') as HTMLDivElement | null;
  const moreContainer = document.getElementById('custom-color-more-container') as HTMLDivElement | null;

  if (moreBtn && moreContainer) {
    moreContainer.classList.add('collapsed');
    moreBtn.classList.remove('expanded');
    moreContainer.style.maxHeight = '';
    moreBtn.addEventListener(
      'click',
      () => {
        const isCollapsed = moreContainer.classList.contains('collapsed');
        moreContainer.classList.toggle('collapsed', !isCollapsed);
        moreBtn.classList.toggle('expanded', isCollapsed);
        moreContainer.style.maxHeight = isCollapsed ? '140px' : '';
      },
      { signal },
    );
  }

  pickerContainer.classList.remove('hidden');

  const drawMatrix = () => {
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `hsl(${h}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    const gradWhite = ctx.createLinearGradient(0, 0, width, 0);
    gradWhite.addColorStop(0, 'rgba(255,255,255,1)');
    gradWhite.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradWhite;
    ctx.fillRect(0, 0, width, height);

    const gradBlack = ctx.createLinearGradient(0, 0, 0, height);
    gradBlack.addColorStop(0, 'rgba(0,0,0,0)');
    gradBlack.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gradBlack;
    ctx.fillRect(0, 0, width, height);
  };

  const updateCursor = () => {
    cursor.style.left = `${s}%`;
    cursor.style.top = `${100 - v}%`;
  };

  const updateInputs = (updateHexAndRgb = true) => {
    const hex = hsvToHex(h, s, v);
    if (updateHexAndRgb) {
      hexInput.value = hex.replace('#', '');
      const rgb = hexToRgb(hex);
      rInput.value = rgb.r.toString();
      gInput.value = rgb.g.toString();
      bInput.value = rgb.b.toString();
    }
    customBtn.style.backgroundColor = hex;
    hueSlider.style.setProperty('--live-hue-color', `hsl(${h}, 100%, 50%)`);
    const confirmBtn = document.getElementById('warning-btn-confirm');
    if (confirmBtn) {
      confirmBtn.style.setProperty('--live-save-color', hex);
      const rgb = hexToRgb(hex);
      const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      confirmBtn.style.setProperty('--live-save-contrast', yiq >= 128 ? '#202020' : '#FFFFFF');
    }
  };

  const rect = canvasWrapper.getBoundingClientRect();
  if (rect.width > 0) {
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  hueSlider.value = h.toString();
  updateInputs();
  drawMatrix();
  updateCursor();

  let isDragging = false;

  const handleCanvasInteraction = (e: MouseEvent | TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    let y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    s = Math.round((x / rect.width) * 100);
    v = Math.round((1 - y / rect.height) * 100);
    updateCursor();
    updateInputs();
  };

  canvas.addEventListener(
    'mousedown',
    (e) => {
      isDragging = true;
      handleCanvasInteraction(e);
    },
    { signal },
  );
  document.addEventListener(
    'mousemove',
    (e) => {
      if (isDragging) handleCanvasInteraction(e);
    },
    { signal },
  );
  document.addEventListener(
    'mouseup',
    () => {
      isDragging = false;
    },
    { signal },
  );

  hueSlider.addEventListener(
    'input',
    (e) => {
      h = parseInt((e.target as HTMLInputElement).value, 10);
      drawMatrix();
      updateInputs();
    },
    { signal },
  );

  const applyFromHex = (hexVal: string) => {
    const clean = sanitizeHexInput(hexVal);
    if (clean.length === 6) {
      const newHsv = hexToHsv(`#${clean}`);
      h = newHsv.h;
      s = newHsv.s;
      v = newHsv.v;
      hueSlider.value = h.toString();
      drawMatrix();
      updateCursor();
      updateInputs(false);
      const rgb = hexToRgb(clean);
      rInput.value = rgb.r.toString();
      gInput.value = rgb.g.toString();
      bInput.value = rgb.b.toString();
    }
  };

  hexInput.addEventListener(
    'paste',
    (e) => {
      const pasted = e.clipboardData?.getData('text') || '';
      const clean = sanitizeHexInput(pasted);
      if (clean) {
        e.preventDefault();
        hexInput.value = clean;
        applyFromHex(clean);
      }
    },
    { signal },
  );

  hexInput.addEventListener(
    'input',
    () => {
      const clean = sanitizeHexInput(hexInput.value);
      if (hexInput.value !== clean) {
        hexInput.value = clean;
      }
      applyFromHex(clean);
    },
    { signal },
  );

  const handleRgbInput = () => {
    let r = Math.min(255, Math.max(0, parseInt(rInput.value) || 0));
    let g = Math.min(255, Math.max(0, parseInt(gInput.value) || 0));
    let b = Math.min(255, Math.max(0, parseInt(bInput.value) || 0));
    const newHex = rgbToHex(r, g, b).replace('#', '');
    hexInput.value = newHex;
    applyFromHex(newHex);
  };

  rInput.addEventListener('input', handleRgbInput, { signal });
  gInput.addEventListener('input', handleRgbInput, { signal });
  bInput.addEventListener('input', handleRgbInput, { signal });

  warningModal.show({
    title: getSafeText('customColorTitle', 'Custom Color'),
    message: '',
    confirmText: getSafeText('btnSave', 'Save'),
    cancelText: getSafeText('btnCancel', 'Cancel'),
    confirmVariant: 'accent',
    onConfirm: () => {
      pickerAbortController?.abort();
      pickerContainer.classList.add('hidden');
      const cleanHex = sanitizeHexInput(hexInput.value);
      const finalColor = cleanHex.length === 6 ? `#${cleanHex}` : hsvToHex(h, s, v);
      customBtn.style.backgroundColor = finalColor;
      clearPresetSelection();
      customBtn.classList.add('selected');
      applyAccentColor(finalColor);
      localStorage.setItem('accentColorValue', finalColor);
      localStorage.setItem('accentColorMode', 'manual');
      const toggleAuto = document.getElementById('toggleAccentWallpaper') as HTMLInputElement;
      if (toggleAuto) toggleAuto.checked = false;
    },
    onCancel: () => {
      pickerAbortController?.abort();
      pickerContainer.classList.add('hidden');
    },
  });
}
