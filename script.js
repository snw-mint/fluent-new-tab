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
    const formatCount = (value) => new Intl.NumberFormat('en-US').format(value);

    const starSvg = (type) => {
        const common = 'width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="star-icon star-' + type + '"';

        if (type === 'full') {
            return `<svg ${common} fill="currentColor"><path d="M10.788 3.103c.495-1.004 1.926-1.004 2.421 0l2.358 4.777 5.273.766c1.107.161 1.549 1.522.748 2.303l-3.816 3.72.901 5.25c.19 1.103-.968 1.944-1.959 1.424l-4.716-2.48-4.715 2.48c-.99.52-2.148-.32-1.96-1.424l.901-5.25-3.815-3.72c-.801-.78-.359-2.142.748-2.303L8.43 7.88l2.358-4.777Z" fill="currentColor"/></svg>`;
        }

        if (type === 'half') {
            return `<svg ${common} fill="currentColor"><path d="M12 2.35c-.482 0-.964.25-1.212.753L8.43 7.88l-5.273.766c-1.107.161-1.55 1.522-.748 2.303l3.815 3.72-.9 5.25c-.15.873.544 1.582 1.331 1.582.208 0 .422-.05.63-.159l4.714-2.478 4.715 2.479c.99.52 2.148-.32 1.96-1.424l-.902-5.25 3.816-3.72c.8-.78.359-2.142-.748-2.303l-5.273-.766-2.358-4.777a1.335 1.335 0 0 0-1.21-.753Zm0 14.994V4.042l2.257 4.573a1.35 1.35 0 0 0 1.016.738l5.05.734-3.654 3.562a1.35 1.35 0 0 0-.388 1.195l.862 5.03-4.516-2.375a1.35 1.35 0 0 0-.627-.155Z" fill="currentColor"/></svg>`;
        }

        return `<svg ${common} fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.788 3.103c.495-1.004 1.926-1.004 2.421 0l2.358 4.777 5.273.766c1.107.161 1.549 1.522.748 2.303l-3.816 3.72.901 5.25c.19 1.103-.968 1.944-1.959 1.424l-4.716-2.48-4.715 2.48c-.99.52-2.148-.32-1.96-1.424l.901-5.25-3.815-3.72c-.801-.78-.359-2.142.748-2.303L8.43 7.88l2.358-4.777Z"/></svg>`;
    };

    const renderStars = (rating) => {
        const roundedHalf = Math.round(rating * 2) / 2;
        const fullStars = Math.floor(roundedHalf);
        const hasHalf = roundedHalf % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

        const stars = [
            ...Array.from({ length: fullStars }, () => starSvg('full')),
            ...(hasHalf ? [starSvg('half')] : []),
            ...Array.from({ length: emptyStars }, () => starSvg('empty'))
        ];

        return stars.join('');
    };

    const syncStructuredData = (ratings) => {
        const schemaNode = document.getElementById('software-schema');
        if (!schemaNode) return;

        try {
            const schema = JSON.parse(schemaNode.textContent);

            schema.aggregateRating = {
                '@type': 'AggregateRating',
                ratingValue: ratings.rating,
                bestRating: 5,
                ratingCount: ratings.reviewCount
            };

            schema.interactionStatistic = {
                '@type': 'InteractionCounter',
                interactionType: {
                    '@type': 'UseAction'
                },
                userInteractionCount: ratings.userCount
            };

            schemaNode.textContent = JSON.stringify(schema, null, 2);
        } catch {
            // no-op
        }
    };

    const loadRatings = async () => {
        const ratingSection = document.querySelector('[data-rating-section]');
        if (!ratingSection) return;

        try {
            const response = await fetch('data/ratings.json', { cache: 'no-cache' });
            if (!response.ok) return;

            const ratings = await response.json();

            const userCount = Number(ratings.userCount) || 0;
            const ratingValue = Number(ratings.rating) || 0;
            const reviewCount = Number(ratings.reviewCount) || 0;
            const sourceName = ratings.sourceName || 'Microsoft Edge Add-ons';
            const sourceUrl = ratings.sourceUrl || 'https://microsoftedge.microsoft.com/addons/detail/fluent-new-tab/hcohjkajcimobdddlnfnfhdfnbapondc';
            const lastUpdated = ratings.lastUpdated || '';

            const usersNode = document.getElementById('edge-users');
            const ratingNode = document.getElementById('edge-rating');
            const reviewsNode = document.getElementById('edge-review-count');
            const starsNode = document.getElementById('edge-stars');
            const sourceNode = document.getElementById('edge-source-link');
            const lastUpdatedNode = document.getElementById('edge-last-updated');

            if (usersNode) usersNode.textContent = formatCount(userCount);
            if (ratingNode) ratingNode.textContent = ratingValue.toFixed(1);
            if (reviewsNode) reviewsNode.textContent = formatCount(reviewCount);
            if (starsNode) {
                starsNode.innerHTML = renderStars(ratingValue);
                starsNode.setAttribute('aria-label', `${ratingValue.toFixed(1)} out of 5 stars`);
            }
            if (sourceNode) {
                sourceNode.textContent = sourceName;
                sourceNode.setAttribute('href', sourceUrl);
            }
            if (lastUpdatedNode && lastUpdated) {
                lastUpdatedNode.textContent = lastUpdated;
            }

            syncStructuredData({
                userCount,
                rating: ratingValue,
                reviewCount
            });
        } catch {
            // no-op
        }
    };

    loadRatings();

    
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

    if (modal) {
        openButtons.forEach(btn => btn.addEventListener('click', openModal));
        closeElements.forEach(el => el.addEventListener('click', closeModal));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

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