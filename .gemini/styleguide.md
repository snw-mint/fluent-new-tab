# Gemini Code Assist Review Guidelines

## 1. Project Context & Constraints

- **Stack:** Pure Vanilla HTML, TypeScript, SCSS, and Vite.
- **Rule:** Strictly forbid the introduction of frameworks or heavy libraries (e.g., React, Vue, jQuery).
- **Architecture:** ES Modules (ESM) with Lazy Loading. Browser Extension (Manifest V3) for Chromium and Firefox. Ensure compliance with strict Content Security Policies (CSP).
- **Units:** Strictly enforce the use of `rem` instead of `px` for all spacing, sizing, and typography.
- **Design System:** Microsoft Fluent Design. Enforce the use of opaque designs, `0.5rem` or `0.75rem` `border-radius`, subtle `box-shadow` for depth, and smooth hover states (`transition: all 0.2s`).
- **Assets:** Enforce the use of SVGs for UI elements and icons to ensure crisp rendering.

## 2. Severity Categorization Rules

When reviewing code and generating comments, strictly assign severity based on these project-specific criteria:

### LOW

- Code organization, structural cleanup, and refactoring that do not alter existing business logic.
- Typo fixes, comment updates, and dead code removal.
- Usage of `innerHTML`/`outerHTML` strictly to inject completely static, hardcoded SVG strings (which has no XSS risk but still deserves attention to ensure no external input is interpolated).


### MEDIUM

- Design changes, SCSS styling adjustments, and Fluent Design conformance fixes.
- General logic fixes, non-breaking bug resolutions, and DOM manipulation corrections in `src/core/ui/` or `src/core/boot/`.

### HIGH

- Implementation of new features, complex refactoring of shared state (`src/core/shared/state.ts`), or modifying dynamic imports (`src/core/lazy/`).
- Modifications to IndexedDB logic, external API fetching (`src/core/lazy/providers/`), or drag-and-drop mechanics.

### CRITICAL

- Any modification to `manifest.json`, `manifest-firefox.json`, or the Vite build configuration (`vite.config.ts`, `package.json`).
- Changes involving extension permissions, host permissions, or early boot scripts (`public/scripts/`).
- Introduction of completely new files that bypass the lazy loading architecture or introduce global variables.
- Direct assignment to `innerHTML` or `outerHTML` with dynamic or unsanitized content (any usage of `innerHTML` must be treated as CRITICAL unless it is a completely static, hardcoded SVG).


## 3. Feedback Tone

Provide direct, highly technical feedback. Point out exactly where the code violates the Vanilla TS/SCSS constraint or the Fluent Design principles. If the logic is correct but does not align with the project's minimalist and lazy-loaded philosophy, suggest a lighter approach.

## 4. Architecture & ESM Compliance

- **State Management:** Reject any use of global variables (e.g., `window.state`). All shared state MUST be imported from `src/core/shared/state.ts`.
- **Lazy Loading:** Ensure heavy operations or secondary UI features are placed in `src/core/lazy/` and loaded dynamically via `import()`.
- **Content Security Policy (CSP):** The extension runs in an isolated environment. Flag any usage of `eval()`, `new Function()`, or inline scripts as CRITICAL.
- **DOM Sanitization:** Strongly prohibit direct assignment to `innerHTML` or `outerHTML` without strict sanitization, treating such instances as **CRITICAL**. An exception is made only for completely static, hardcoded SVG strings, which is treated as **LOW** (no XSS risk but still deserves review to ensure it is static). Force the use of `textContent`, `setAttribute`, or safe DOM manipulation methods.

## 5. Performance & DOM Optimization

- **Reflows & Repaints:** Identify and flag code that causes forced synchronous layouts. Suggest using `src/core/shared/dom-refs.ts` and `dom-utils.ts` for DOM access.
- **Event Listeners:** Ensure global event listeners are debounced or throttled. Ensure event listeners inside lazy modules are attached only when the module is loaded.
- **Memory Leaks:** Warn about missing cleanup logic when DOM elements are removed, particularly for intervals or observers.

## 6. Anti-Patterns (Few-Shot Examples)

### ❌ BAD: Global State & Synchronous Heavy Imports

```typescript
import { initHeavyFeature } from '../lazy/heavy-feature';

window.appState.theme = 'dark';
initHeavyFeature();
```

### ✅ GOOD: Shared State & Lazy Loading

```typescript
import { state } from '../shared/state';

state.theme = 'dark';

document.getElementById('btn').addEventListener('click', async () => {
  const { initHeavyFeature } = await import('../lazy/heavy-feature');
  initHeavyFeature();
});
```

### ❌ BAD: Unsafe DOM Injection

```typescript
const updateWeatherUI = (data: any) => {
  document.getElementById('weather').innerHTML =
    `<div class="temp">${data.temp}</div>`;
};
```

### ✅ GOOD: Vanilla typed DOM manipulation

```typescript
import { domRefs } from '../shared/dom-refs';

const updateWeatherUI = (data: WeatherApiResponse): void => {
  const weatherContainer = domRefs.weather;
  if (!weatherContainer) return;

  const tempElement = document.createElement('div');
  tempElement.className = 'temp';
  tempElement.textContent = String(data.temp);

  weatherContainer.replaceChildren(tempElement);
};
```
