/*
 * Fluent New Tab
 * Copyright (c) 2025-2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

(() => {
  const themeToggle = document.getElementById("theme-switcher");
  if (!themeToggle) return;

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsViewTransitions =
    typeof document.startViewTransition === "function" && CSS.supports("view-transition-name", "root");
  const getStoredTheme = () => localStorage.getItem("theme-preference");

  const applyTheme = (mode, persist = true) => {
    const theme = mode === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.classList.toggle("is-dark", theme === "dark");
    themeToggle.setAttribute("aria-pressed", theme === "dark");
    themeToggle.setAttribute("aria-label", theme === "dark" ? "Alternar para modo claro" : "Alternar para modo escuro");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "dark" ? "#0b0c0f" : "#0f6cbd");
    }
    if (persist) {
      localStorage.setItem("theme-preference", theme);
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
            { clipPath: `circle(${endRadius}px at ${originX}px ${originY}px)` },
          ],
          {
            duration: 520,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            fill: "both",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => applyTheme(targetTheme));
  };

  const storedTheme = getStoredTheme();
  const initialTheme = storedTheme || (prefersDark.matches ? "dark" : "light");
  applyTheme(initialTheme, Boolean(storedTheme));

  prefersDark.addEventListener("change", (event) => {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? "dark" : "light", false);
    }
  });

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    revealTheme(isDark ? "light" : "dark");
  });
})();

document.addEventListener("DOMContentLoaded", () => {


  const modal = document.getElementById("install-modal");
  const openButtons = document.querySelectorAll("[data-install-trigger]");
  const liveDemoButtons = document.querySelectorAll("[data-live-demo-trigger]");
  const closeElements = document.querySelectorAll("[data-modal-close]");
  const mobileWarningModal = document.getElementById("mobile-warning-modal");
  const mobileWarningTitle = document.getElementById("mobile-warning-title");
  const mobileWarningMessage = document.getElementById("mobile-warning-message");
  const mobileWarningCloseElements = document.querySelectorAll("[data-mobile-warning-close]");

  const warningContent = {
    install: {
      title: "Not available on mobile",
      message: "Sorry, Fluent New Tab is not available for mobile devices.",
    },
    demo: {
      title: "Desktop recommended",
      message: "For the best demo experience, please open it on a computer.",
    },
  };

  const isMobileBlockedDevice = () => {
    const hasTouchPointer = window.matchMedia("(pointer: coarse)").matches;
    const mobileViewport = window.matchMedia("(max-width: 900px)").matches;
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return (hasTouchPointer && mobileViewport) || mobileUserAgent;
  };

  const openModal = () => {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  };

  const openMobileWarning = (type) => {
    if (!mobileWarningModal || !mobileWarningTitle || !mobileWarningMessage) return;
    const content = warningContent[type] || warningContent.install;
    mobileWarningTitle.textContent = content.title;
    mobileWarningMessage.textContent = content.message;
    mobileWarningModal.classList.add("active");
    mobileWarningModal.setAttribute("aria-hidden", "false");
  };

  const closeMobileWarning = () => {
    if (!mobileWarningModal) return;
    mobileWarningModal.classList.remove("active");
    mobileWarningModal.setAttribute("aria-hidden", "true");
  };

  const applyMobileBlockedStyles = () => {
    const shouldBlock = isMobileBlockedDevice();
    [...openButtons, ...liveDemoButtons].forEach((element) => {
      element.classList.toggle("mobile-blocked-action", shouldBlock);
      element.setAttribute("aria-disabled", shouldBlock ? "true" : "false");
    });
  };

  if (modal) {
    openButtons.forEach((btn) =>
      btn.addEventListener("click", (event) => {
        if (isMobileBlockedDevice()) {
          event.preventDefault();
          closeModal();
          openMobileWarning("install");
          return;
        }
        openModal();
      }),
    );

    liveDemoButtons.forEach((btn) =>
      btn.addEventListener("click", (event) => {
        if (isMobileBlockedDevice()) {
          event.preventDefault();
          openMobileWarning("demo");
        }
      }),
    );

    closeElements.forEach((el) => el.addEventListener("click", closeModal));
    mobileWarningCloseElements.forEach((el) => el.addEventListener("click", closeMobileWarning));

    applyMobileBlockedStyles();
    window.addEventListener("resize", applyMobileBlockedStyles);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeModal();
      }
      if (e.key === "Escape" && mobileWarningModal?.classList.contains("active")) {
        closeMobileWarning();
      }
    });
  }

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    let currentBrowser = "other";

    if (userAgent.includes("Firefox")) {
      currentBrowser = "firefox";
    } else if (userAgent.includes("Edg/")) {
      currentBrowser = "edge";
    } else if (userAgent.includes("Chrome")) {
      currentBrowser = "chrome";
    }

    const cards = document.querySelectorAll(".browser-card");

    cards.forEach((card) => {
      const dynamicBadge = card.querySelector(".dynamic-badge");

      if (card.dataset.browser === currentBrowser) {
        card.classList.add("highlighted");
        if (dynamicBadge) {
          dynamicBadge.textContent = "Recommended";
        }
      } else {
        card.classList.remove("highlighted");
        if (dynamicBadge) {
          dynamicBadge.textContent = "";
        }
      }
    });
  };

  detectBrowser();
});

document.querySelectorAll(".feature-card, .minor-card, .support-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
});

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.15,
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
    }
  });
}, observerOptions);

document.querySelectorAll(".showcase-image-wrapper, .showcase-card").forEach((el) => {
  observer.observe(el);
});
