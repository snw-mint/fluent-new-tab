# Fluent New Tab

## Project Overview

Fluent New Tab is a modern browser extension built to enhance the default new tab experience. It leverages Vite, TypeScript, and Sass to deliver a robust and highly customizable interface.

## AI Agent Instructions

This file defines the strict rules, constraints, and operational boundaries for AI coding agents (such as Google Jules from Google Labs) working on this repository.
**You MUST follow these rules and constraints precisely.**

### Restricted Edit Scope

To ensure project stability, the AI agent is ONLY permitted to edit files that contain the core logic of the application. **You are strictly limited to editing files within the following directories:**

1. `src/` - Contains the primary TypeScript background logic, core application utilities, and foundational Sass styles.
2. `public/scripts/` - Contains essential plain JavaScript logic, including `i18n.js` and `theme-loader.js`.
3. `public/setup/` - Contains the HTML, CSS, and JavaScript logic specifically for the initial setup flow of the extension.

**DO NOT edit any configuration files, root-level files, or files outside of these three specific paths unless explicitly authorized by the user.**

### Technology Stack & Dependencies

The project relies on a specific set of tools defined in `package.json`. You must respect these when writing or analyzing code:

- **Core Framework & Bundler:** Vite (`vite`, `@crxjs/vite-plugin`), `esbuild`, `terser`
- **Languages:** TypeScript (`typescript`), JavaScript, Sass (`sass`)
- **AST/Compilation Utilities:** `ts-morph`
- **Type Definitions:** `@types/chrome`, `@types/node`

### Coding Rules & Best Practices

- **Language Separation:**
  - Use **TypeScript** (`.ts`) for all new background scripts or core logic introduced within the `src/` directory. Maintain strict type safety.
  - Files located in `public/scripts/` and `public/setup/` are written in **Vanilla JavaScript** (`.js`). Do not attempt to use TypeScript syntax in these files.
- **Styling Standards:** Use Sass (`.scss`) for styles generated from the `src/` directory. Standard CSS (`.css`) is used for the `public/setup/` flow.
- **Browser APIs:** Ensure strict adherence to Manifest V3 standards when utilizing `chrome.*` extension APIs.
- **Internationalization (i18n):** Any modifications or additions involving user-facing text must respect and integrate with the existing logic in `public/scripts/i18n.js`.
- **Build Operations:** The standard development server is run via `npm run dev`, and production builds use `npm run build`. Do not alter the Vite configuration or build scripts to accommodate code changes.
