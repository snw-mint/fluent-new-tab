# 👋 Welcome to Fluent New Tab Contributing Guide

Thank you for your interest in contributing to **Fluent New Tab**! We are thrilled to have you here.

This project is built with **Vanilla HTML, CSS, and JavaScript** to ensure maximum performance and privacy without the overhead of heavy frameworks. We value clean, readable code and a strict adherence to **Microsoft's Fluent Design** principles (Mica effects, rounded corners, and smooth animations).

---

## 🛠️ Development Setup

Since this is a browser extension, you don't need a build server or complex `npm` setup. You can run it directly in your browser.

1.  **Fork and Clone** the repository to your local machine.
2.  Open **Microsoft Edge**.
3.  Navigate to `edge://extensions`.
4.  Enable **"Developer Mode"** (usually a toggle in the bottom-left or top-right corner).
5.  Click **"Load Unpacked"** and select the folder where you cloned this repository.
6.  Open a **New Tab** to see your changes in action!

> **Tip:** Every time you make changes to `script.js` or `manifest.json`, you may need to click the **Reload** icon on the extension card in `edge://extensions` and refresh your New Tab page. Changes to `style.css` or `index.html` usually update on a simple page refresh.

---

## 📂 Project Structure

Here is an overview of the project's file organization:

```text
fluent-new-tab/
├── assets/                  # Core assets (Favicons, UI icons)
│   └── apps/                # Ecosystem icons organized by provider
│       ├── google/
│       ├── microsoft/
│       └── proton/
├── index.html               # Main entry point (Structure)
├── style.css                # Visuals (Fluent Design, Dark/Light mode variables)
├── script.js                # Core logic (Settings, Shortcuts, Weather)
└── manifest.json            # Extension configuration
```

---

## 📐 Coding Guidelines

### JavaScript
*   **Syntax:** Use modern **ES6+** syntax (Arrow functions, `const`/`let`, Async/Await).
*   **Modularity:** Keep functions small and focused.
*   **No Frameworks:** Do not introduce libraries like jQuery, React, or Vue. We want to keep the extension lightweight.

### CSS & Design
*   **Variables:** Always use CSS Variables (defined in `:root` and `[data-theme="dark"]`) for colors. This ensures **Dark Mode** works automatically.
*   **Fluent Design:**
    *   Use `border-radius: 8px` or `12px` for cards.
    *   Use subtle shadows (`box-shadow`) for depth.
    *   Ensure hover states are smooth (`transition: all 0.2s`).

### Icons
*   We use **SVGs** for almost all UI elements to ensure crisp rendering on high-DPI screens.
*   If adding a new app to the launcher, place the SVG in `assets/apps/{provider}/`.

---

## 🚀 Submitting a Pull Request

Ready to contribute? Follow these standard steps:

1.  Create a new **Branch** for your feature or fix:
    ```bash
    git checkout -b feature/my-awesome-feature
    ```
2.  **Commit** your changes with clear messages.
3.  **Push** your branch to your fork.
4.  Open a **Pull Request (PR)** against the `main` branch.

**Pre-submission Checklist:**
- [ ] Did you test your changes in **Light Mode**?
- [ ] Did you test your changes in **Dark Mode**?

We look forward to your code! Happy coding! 🚀