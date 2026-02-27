(() => {
    const themeToggle = document.getElementById('theme-switcher');
    if (!themeToggle) return;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const supportsViewTransitions = typeof document.startViewTransition === 'function' && CSS.supports('view-transition-name', 'root');
    const getStoredTheme = () => localStorage.getItem('theme-preference');

    const applyTheme = (mode, persist = true) => {
        const theme = mode === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        themeToggle.classList.toggle('is-dark', theme === 'dark');
        themeToggle.setAttribute('aria-pressed', theme === 'dark');
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0b0c0f' : '#0f6cbd');
        }
        if (persist) {
            localStorage.setItem('theme-preference', theme);
        }
    };

    const revealTheme = (targetTheme) => {
        if (!supportsViewTransitions || prefersReducedMotion.matches) {
            applyTheme(targetTheme);
            return;
        }

        const rect = themeToggle.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        const maxX = Math.max(originX, window.innerWidth - originX);
        const maxY = Math.max(originY, window.innerHeight - originY);
        const endRadius = Math.hypot(maxX, maxY);

        const transition = document.startViewTransition(() => {
            applyTheme(targetTheme);
        });

        transition.ready
            .then(() => {
                document.documentElement.animate(
                    [
                        { clipPath: `circle(0px at ${originX}px ${originY}px)` },
                        { clipPath: `circle(${endRadius}px at ${originX}px ${originY}px)` }
                    ],
                    {
                        duration: 520,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        fill: 'both',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            })
            .catch(() => applyTheme(targetTheme));
    };

    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme || (prefersDark.matches ? 'dark' : 'light');
    applyTheme(initialTheme, Boolean(storedTheme));

    prefersDark.addEventListener('change', (event) => {
        if (!getStoredTheme()) {
            applyTheme(event.matches ? 'dark' : 'light', false);
        }
    });

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        revealTheme(isDark ? 'light' : 'dark');
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    
    // Modal Toggle Logic
    const modal = document.getElementById('install-modal');
    const openButtons = document.querySelectorAll('[data-install-trigger]');
    const closeElements = document.querySelectorAll('[data-modal-close]');

    const openModal = () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    };

    openButtons.forEach(btn => btn.addEventListener('click', openModal));
    closeElements.forEach(el => el.addEventListener('click', closeModal));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Browser Detection Logic
    const detectBrowser = () => {
        const userAgent = navigator.userAgent;
        let currentBrowser = 'other';

        if (userAgent.includes('Firefox')) {
            currentBrowser = 'firefox';
        } else if (userAgent.includes('Edg/')) {
            currentBrowser = 'edge';
        } else if (userAgent.includes('Chrome')) {
            currentBrowser = 'chrome';
        }

        const cards = document.querySelectorAll('.browser-card');
        
        cards.forEach(card => {
            const dynamicBadge = card.querySelector('.dynamic-badge');
            
            if (card.dataset.browser === currentBrowser) {
                card.classList.add('highlighted');
                if (dynamicBadge) {
                    dynamicBadge.textContent = 'Recommended';
                }
            } else {
                card.classList.remove('highlighted');
                if (dynamicBadge) {
                    dynamicBadge.textContent = '';
                }
            }
        });
    };

    detectBrowser();
});