/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
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

export function hsvToHex(h: number, s: number, v: number): string {
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

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16) || 0,
    g: parseInt(cleanHex.substring(2, 4), 16) || 0,
    b: parseInt(cleanHex.substring(4, 6), 16) || 0,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
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
  const currentColor = localStorage.getItem('accentColorValue') || '#0078D4';
  let { h, s, v } = hexToHsv(currentColor);

  const pickerContainer = document.getElementById(
    'customColorPickerContainer',
  ) as HTMLDivElement;
  const canvasWrapper = document.getElementById(
    'matrixWrapper',
  ) as HTMLDivElement;
  const canvas = document.getElementById(
    'colorMatrixCanvas',
  ) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const cursor = document.getElementById('matrixCursor') as HTMLDivElement;
  const hueSlider = document.getElementById(
    'colorHueSlider',
  ) as HTMLInputElement;
  const hexInput = document.getElementById(
    'customColorHex',
  ) as HTMLInputElement;
  const rInput = document.getElementById('customColorR') as HTMLInputElement;
  const gInput = document.getElementById('customColorG') as HTMLInputElement;
  const bInput = document.getElementById('customColorB') as HTMLInputElement;

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
      confirmBtn.style.setProperty(
        '--live-save-contrast',
        yiq >= 128 ? '#202020' : '#FFFFFF',
      );
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
    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    let y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    s = Math.round((x / rect.width) * 100);
    v = Math.round((1 - y / rect.height) * 100);
    updateCursor();
    updateInputs();
  };

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleCanvasInteraction(e);
  });
  document.addEventListener('mousemove', (e) => {
    if (isDragging) handleCanvasInteraction(e);
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  hueSlider.addEventListener('input', (e) => {
    h = parseInt((e.target as HTMLInputElement).value, 10);
    drawMatrix();
    updateInputs();
  });

  const applyFromHex = (hexVal: string) => {
    if (/^[0-9A-F]{6}$/i.test(hexVal)) {
      const newHsv = hexToHsv(`#${hexVal}`);
      h = newHsv.h;
      s = newHsv.s;
      v = newHsv.v;
      hueSlider.value = h.toString();
      drawMatrix();
      updateCursor();
      updateInputs(false);
      const rgb = hexToRgb(hexVal);
      rInput.value = rgb.r.toString();
      gInput.value = rgb.g.toString();
      bInput.value = rgb.b.toString();
    }
  };

  hexInput.addEventListener('input', (e) => {
    applyFromHex((e.target as HTMLInputElement).value.toUpperCase());
  });

  const handleRgbInput = () => {
    let r = Math.min(255, Math.max(0, parseInt(rInput.value) || 0));
    let g = Math.min(255, Math.max(0, parseInt(gInput.value) || 0));
    let b = Math.min(255, Math.max(0, parseInt(bInput.value) || 0));
    const newHex = rgbToHex(r, g, b).replace('#', '');
    hexInput.value = newHex;
    applyFromHex(newHex);
  };

  rInput.addEventListener('input', handleRgbInput);
  gInput.addEventListener('input', handleRgbInput);
  bInput.addEventListener('input', handleRgbInput);

  warningModal.show({
    title: getSafeText('customColorTitle', 'Custom Color'),
    message: '',
    confirmText: getSafeText('btnSave', 'Save'),
    cancelText: getSafeText('btnCancel', 'Cancel'),
    confirmVariant: 'accent',
    onConfirm: () => {
      pickerContainer.classList.add('hidden');
      const finalColor = `#${hexInput.value}`;
      customBtn.style.backgroundColor = finalColor;
      clearPresetSelection();
      customBtn.classList.add('selected');
      applyAccentColor(finalColor);
      localStorage.setItem('accentColorValue', finalColor);
      localStorage.setItem('accentColorMode', 'manual');
      const toggleAuto = document.getElementById(
        'toggleAccentWallpaper',
      ) as HTMLInputElement;
      if (toggleAuto) toggleAuto.checked = false;
    },
    onCancel: () => {
      pickerContainer.classList.add('hidden');
    },
  });
}
