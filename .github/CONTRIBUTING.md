# Contributing Guide

Welcome to **Fluent New Tab**! We're thrilled you're here. Whether you're fixing a bug, adding a new feature, or simply refining the design, we appreciate your help in making this extension better.

This project is built with **Vanilla HTML + TypeScript + SCSS** to guarantee maximum performance and privacy without the overhead of heavy frameworks. We focus on clean, readable code and strict adherence to **Microsoft's Fluent Design** principles (opaque designs, rounded corners, and smooth animations).

---

## Development Setup

We've recently migrated to a modern build system using Vite, with ES modules and lazy loading to keep things blazing fast.

1. **Fork and Clone** the repository to your local machine.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the dev server** (great for quick prototyping):
   ```bash
   npm run dev
   ```
4. **Build the extension** for the browser:
   ```bash
   npm run build
   ```
5. Open **Microsoft Edge** (or Chrome) and navigate to `edge://extensions` (or `chrome://extensions`).
6. Enable **"Developer Mode"**.
7. Click **"Load Unpacked"** and select the generated `dist/` folder.
8. Open a **New Tab** to see your changes in action!

> **Tip:** While `npm run dev` is great for immediate feedback, remember to run `npm run build` and click **Reload** on the extension page to test the final bundled extension.

---

## Recommended IDEs

For the best development experience, we recommend using:

- **[VS Code](https://code.visualstudio.com/)**: With the standard TypeScript and SCSS extensions.
- **[Antigravity IDE](https://antigravity.google/product/antigravity-ide)**: If you have access to it, this AI coding assistant works great with this repository.

---

## Project Structure

We've recently updated our architecture to utilize **ES Modules** and **Lazy Loading**. This ensures we only load what is needed, when it's needed.

For a detailed breakdown of how our modules are organized, please refer to our **[Source Architecture Guide (`src/README.md`)](../src/README.md)**.

---

## Coding Guidelines

We have a detailed set of rules in our [styleguide.md](../.gemini/styleguide.md), but here are the core principles to keep in mind:

### TypeScript & Logic

- **No Heavy Frameworks:** Please don't introduce React, Vue, jQuery, etc. Keep it Vanilla.
- **Modern ES Modules:** Use modern ES6+ syntax (`const`/`let`, arrow functions, async/await). Keep functions small, modular, and leverage lazy loading where appropriate.
- **Security First:** We run in an isolated extension environment. Never use `eval()`, inline scripts, or unsanitized `innerHTML`. Always use safe DOM manipulation (e.g., `document.createElement`, `textContent`).
- **Performance:** Avoid memory leaks by cleaning up event listeners and intervals. Be mindful of reflows and repaints.

### SCSS & Fluent Design

- **Variables:** Always use our predefined CSS Variables for colors to ensure **Dark Mode** support works seamlessly.
- **Units:** Always use `rem` instead of `px` for sizing and spacing to ensure proper scaling.
- **Fluent Styling:**
  - Cards should have `border-radius: 0.5rem` or `0.75rem`.
  - Use subtle `box-shadow` for depth.
  - Implement smooth hover transitions (`transition: all 0.2s`).

### Assets

- We exclusively use **SVGs** for UI elements and icons to guarantee crisp rendering on high-DPI screens.
- If you're adding a new app shortcut, place its SVG in `public/assets/apps/{provider}/`.

---

## Submitting a Pull Request

Ready to share your work? Follow these standard steps:

1. Create a new **branch** for your feature or fix:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```
2. **Commit** your changes with clear, descriptive messages.
3. **Push** your branch to your fork.
4. Open a **Pull Request (PR)** against our `main` branch.

**Pre-submission Checklist:**

- [ ] Did you test your changes in **Light Mode**?
- [ ] Did you test your changes in **Dark Mode**?
- [ ] Does the code pass without console errors or CSP violations?

We look forward to reviewing your code. Happy coding!
