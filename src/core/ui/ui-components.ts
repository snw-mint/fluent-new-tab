import { getLocalizedWarningText } from '@/core/shared/dom-utils';
import { shortcutsGrid } from '@/core/shared/dom-refs';

export interface WarningModalOptions {
  title: string;
  message: string;
  learnMoreUrl?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'accent' | 'danger';
  showPrivacyPolicy?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export class WarningModalManager {
  private overlay: HTMLElement;
  private titleEl: HTMLElement;
  private messageEl: HTMLElement;
  private btnConfirm: HTMLButtonElement;
  private btnCancel: HTMLButtonElement;
  private handleKeydownBound: (event: KeyboardEvent) => void;

  constructor() {
    this.overlay = document.getElementById('warningModal') as HTMLElement;
    this.titleEl = document.getElementById(
      'warning-modal-title',
    ) as HTMLElement;
    this.messageEl = document.getElementById(
      'warning-modal-message',
    ) as HTMLElement;
    this.btnConfirm = document.getElementById(
      'warning-btn-confirm',
    ) as HTMLButtonElement;
    this.btnCancel = document.getElementById(
      'warning-btn-cancel',
    ) as HTMLButtonElement;
    this.handleKeydownBound = this.handleKeydown.bind(this);
  }

  public show(options: WarningModalOptions): void {
    const confirmVariant = options.confirmVariant || 'accent';
    this.titleEl.textContent = options.title;
    this.messageEl.textContent = '';
    this.messageEl.textContent = options.message;

    if (options.showPrivacyPolicy) {
      const privacyUrl = 'https://snw-mint.github.io/fluent-new-tab/privacy.html';
      const link = document.createElement('a');
      link.href = privacyUrl;
      link.target = '_blank';
      link.textContent = getLocalizedWarningText(
        'privacyPolicyLabel',
        'Read privacy policy',
      );
      link.style.display = 'inline-block';
      link.style.marginTop = '8px';
      link.style.color = 'var(--text-color)';
      link.style.textDecoration = 'underline';
      this.messageEl.appendChild(document.createElement('br'));
      this.messageEl.appendChild(link);
    }

    this.btnConfirm.textContent = options.confirmText || 'Confirm';
    this.btnCancel.textContent = options.cancelText || 'Cancel';
    this.btnConfirm.classList.toggle('btn-danger', confirmVariant === 'danger');
    this.btnConfirm.classList.toggle('btn-save', confirmVariant !== 'danger');

    document.removeEventListener('keydown', this.handleKeydownBound);
    this.overlay.classList.add('active');
    document.addEventListener('keydown', this.handleKeydownBound);

    this.btnConfirm.onclick = () => {
      this.close();
      options.onConfirm();
    };

    this.btnCancel.onclick = () => {
      this.close();
      options.onCancel?.();
    };
  }

  public close(): void {
    this.overlay.classList.remove('active');
    document.removeEventListener('keydown', this.handleKeydownBound);
    this.btnConfirm.onclick = null;
    this.btnCancel.onclick = null;
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.overlay.classList.contains('active')) return;
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.btnConfirm.click();
  }
}

export const warningModal = new WarningModalManager();

export let activeToastInstance: HTMLElement | null = null;

export function hideToast(): void {
  if (activeToastInstance) {
    const notice = activeToastInstance;
    notice.classList.remove('visible');
    window.setTimeout(() => {
      if (notice.parentNode) notice.remove();
    }, 250);
    activeToastInstance = null;
  }
}

export function showToast(
  message: string | Node | (string | Node)[],
  iconPath: string,
  duration = 3500,
): void {
  if (activeToastInstance) {
    activeToastInstance.remove();
  }

  const notice = document.createElement('div');
  notice.className = 'update-release-notice';

  const icon = document.createElement('img');
  icon.className = 'update-release-notice-icon';
  icon.src = iconPath;
  icon.alt = '';

  const text = document.createElement('span');
  text.className = 'update-release-notice-prefix';
  if (Array.isArray(message)) {
    text.replaceChildren(...message);
  } else if (typeof message === 'string') {
    text.textContent = message;
  } else {
    text.replaceChildren(message);
  }

  notice.append(icon, text);
  document.body.appendChild(notice);
  activeToastInstance = notice;

  requestAnimationFrame(() => notice.classList.add('visible'));

  if (duration > 0) {
    window.setTimeout(() => {
      if (activeToastInstance === notice) {
        hideToast();
      }
    }, duration);
  }
}

export function applyMagneticSnap(
  sliderId: string,
  defaultValue: number,
  snapThreshold = 5,
): void {
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  if (!slider) return;

  slider.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    const currentValue = parseFloat(target.value);

    if (Math.abs(currentValue - defaultValue) <= snapThreshold) {
      target.value = defaultValue.toString();
    }
    const min = parseFloat(target.min || '0');
    const max = parseFloat(target.max || '100');
    const progress = (parseFloat(target.value) - min) / (max - min || 1);
    target.style.setProperty('--slider-progress', progress.toString());
  });

  slider.addEventListener('dblclick', (event) => {
    const target = event.target as HTMLInputElement;
    target.value = defaultValue.toString();

    const min = parseFloat(target.min || '0');
    const max = parseFloat(target.max || '100');
    const progress = (parseFloat(target.value) - min) / (max - min || 1);
    target.style.setProperty('--slider-progress', progress.toString());
    target.dispatchEvent(new Event('input'));
    target.dispatchEvent(new Event('change'));
  });
}

export function prepareCollapsible(element: HTMLElement | null): void {
  if (!element || element.dataset.collapsibleReady === 'true') return;
  const previousDisplay = element.style.display;
  if (previousDisplay === 'none') {
    element.style.display = '';
  }
  let computedDisplay = window.getComputedStyle(element).display;
  if (computedDisplay === 'none') {
    computedDisplay = element.dataset.collapsibleDisplay || 'block';
  }
  if (previousDisplay === 'none') {
    element.style.display = previousDisplay;
  }
  const computedStyles = window.getComputedStyle(element);
  element.dataset.originalDisplay = computedDisplay;
  element.dataset.originalMarginTop = computedStyles.marginTop;
  element.dataset.originalMarginBottom = computedStyles.marginBottom;
  element.dataset.originalPaddingTop = computedStyles.paddingTop;
  element.dataset.originalPaddingBottom = computedStyles.paddingBottom;
  element.classList.add('collapsible-section');
  element.dataset.collapsibleReady = 'true';
}

export function setCollapsible(
  element: HTMLElement | null,
  shouldExpand: boolean,
  animate = true,
): void {
  if (!element) return;
  if (document.body.classList.contains('animations-disabled')) {
    animate = false;
  }
  prepareCollapsible(element);

  const restoreSpacing = () => {
    element.style.marginTop = element.dataset.originalMarginTop || '';
    element.style.marginBottom = element.dataset.originalMarginBottom || '';
    element.style.paddingTop = element.dataset.originalPaddingTop || '';
    element.style.paddingBottom = element.dataset.originalPaddingBottom || '';
  };

  const transitionValue =
    'height 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), margin 0.28s ease, padding 0.28s ease';
  const currentState = element.dataset.state || 'open';

  if (!animate) {
    element.style.transition = 'none';
    if (shouldExpand) {
      element.style.display = element.dataset.originalDisplay || 'block';
      restoreSpacing();
      element.style.height = 'auto';
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.style.pointerEvents = 'auto';
      element.style.overflow = '';
      element.dataset.state = 'open';
    } else {
      element.style.height = '0px';
      element.style.opacity = '0';
      element.style.transform = 'scaleY(0.98) translateY(-6px)';
      element.style.pointerEvents = 'none';
      element.style.overflow = 'hidden';
      element.style.marginTop = '0px';
      element.style.marginBottom = '0px';
      element.style.paddingTop = '0px';
      element.style.paddingBottom = '0px';
      element.style.display = 'none';
      element.dataset.state = 'closed';
    }
    requestAnimationFrame(() => {
      element.style.transition = '';
    });
    return;
  }

  element.style.transition = transitionValue;

  if (shouldExpand) {
    if (currentState === 'open') return;
    element.dataset.state = 'animating';
    element.style.display = element.dataset.originalDisplay || 'block';
    element.style.pointerEvents = 'none';
    element.style.overflow = 'hidden';

    restoreSpacing();
    const targetHeight = element.scrollHeight;

    element.style.height = '0px';
    element.style.opacity = '0';
    element.style.transform = 'scaleY(0.98) translateY(-6px)';
    element.style.marginTop = '0px';
    element.style.marginBottom = '0px';
    element.style.paddingTop = '0px';
    element.style.paddingBottom = '0px';

    requestAnimationFrame(() => {
      element.style.height = `${targetHeight}px`;
      element.style.opacity = '1';
      element.style.transform = 'scaleY(1) translateY(0)';
      restoreSpacing();
    });

    let expandedTriggered = false;
    const onExpandEnd = (event?: TransitionEvent) => {
      if (event && event.propertyName !== 'height') return;
      if (expandedTriggered) return;
      expandedTriggered = true;

      element.style.height = 'auto';
      element.style.overflow = '';
      element.style.pointerEvents = 'auto';
      element.dataset.state = 'open';
      element.style.transition = '';
      element.removeEventListener('transitionend', onExpandEnd);
    };

    element.addEventListener('transitionend', onExpandEnd);
    setTimeout(onExpandEnd, 450);
  } else {
    if (currentState === 'closed') return;
    element.dataset.state = 'animating';
    element.style.overflow = 'hidden';
    element.style.pointerEvents = 'none';

    restoreSpacing();
    const startHeight = element.scrollHeight;
    element.style.height = `${startHeight}px`;
    element.style.opacity = '1';
    element.style.transform = 'scaleY(1) translateY(0)';

    requestAnimationFrame(() => {
      element.style.height = '0px';
      element.style.opacity = '0';
      element.style.transform = 'scaleY(0.98) translateY(-6px)';
      element.style.marginTop = '0px';
      element.style.marginBottom = '0px';
      element.style.paddingTop = '0px';
      element.style.paddingBottom = '0px';
    });

    let collapsedTriggered = false;
    const onCollapseEnd = (event?: TransitionEvent) => {
      if (event && event.propertyName !== 'height') return;
      if (collapsedTriggered) return;
      collapsedTriggered = true;

      element.style.display = 'none';
      element.dataset.state = 'closed';
      element.style.transition = '';
      element.style.overflow = 'hidden';
      element.removeEventListener('transitionend', onCollapseEnd);
    };

    element.addEventListener('transitionend', onCollapseEnd);
    setTimeout(onCollapseEnd, 450);
  }
}

export function syncShortcutDropdownState(): void {
  const hasActiveDropdown = Boolean(
    shortcutsGrid?.querySelector('.shortcut-dropdown.active'),
  );
  if (shortcutsGrid)
    shortcutsGrid.classList.toggle('dropdown-open', hasActiveDropdown);

  document.querySelectorAll('.menu-wrapper').forEach((wrapper) => {
    const isOpen = Boolean(wrapper.querySelector('.shortcut-dropdown.active'));
    wrapper.classList.toggle('dropdown-open', isOpen);
  });
}

export async function requestFeaturePermissionUI(
  feature: string,
  apiName: string,
  onGranted: () => void,
  onDenied: () => void,
): Promise<void> {
  const { HOST_PERMISSIONS, checkPermission, requestPermission } = await import('@/core/shared/permissions');
  
  const origins = HOST_PERMISSIONS[feature as keyof typeof HOST_PERMISSIONS];
  if (!origins) {
    onGranted();
    return;
  }

  const hasPerm = await checkPermission(origins);
  if (hasPerm) {
    onGranted();
    return;
  }

  warningModal.show({
    title: getLocalizedWarningText(
      'permissionRequiredTitle',
      'Permission Required',
    ),
    message: getLocalizedWarningText(
      'permissionRequiredMessage',
      'To use this feature, Fluent New Tab needs permission to access "$API_NAME$". This ensures your privacy and security.',
      { API_NAME: apiName },
    ),
    confirmText: getLocalizedWarningText(
      'grantPermissionLabel',
      'Grant Permission',
    ),
    cancelText: getLocalizedWarningText('btnCancel', 'Cancel'),
    confirmVariant: 'accent',
    showPrivacyPolicy: true,
    onConfirm: () => {
      const chromeApi = (window as any).chrome;
      if (chromeApi?.permissions?.request) {
        chromeApi.permissions.request({ origins }, (granted: boolean) => {
          if (chromeApi.runtime?.lastError) {
            console.error(chromeApi.runtime.lastError);
            onDenied();
          } else if (granted) {
            onGranted();
          } else {
            onDenied();
          }
        });
      } else {
        requestPermission(origins).then((granted) => {
          if (granted) onGranted();
          else onDenied();
        });
      }
    },
    onCancel: onDenied,
  });
}
