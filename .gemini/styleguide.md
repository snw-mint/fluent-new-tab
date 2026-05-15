# Gemini Code Assist Review Guidelines

## 1. Project Context & Constraints

- **Stack:** Pure Vanilla HTML, TypeScript, and SCSS.
- **Rule:** Strictly forbid the introduction of frameworks or heavy libraries (e.g., React, Vue, jQuery).
- **Design System:** Microsoft Fluent Design. Enforce the use of Mica effects, 8px or 12px `border-radius`, subtle `box-shadow` for depth, and smooth hover states (`transition: all 0.2s`).
- **Architecture:** Browser Extension (Manifest V3) for Chromium and Firefox. Ensure compliance with strict Content Security Policies (CSP) and correct usage of `chrome.storage` APIs.
- **Assets:** Enforce the use of SVGs for UI elements and icons to ensure crisp rendering.

## 2. Severity Categorization Rules

When reviewing code and generating comments, strictly assign severity based on these project-specific criteria:

### LOW

- Code organization, structural cleanup, and refactoring that do not alter existing business logic.
- Typo fixes, comment updates, and dead code removal.

### MEDIUM

- Design changes, SCSS styling adjustments, and Fluent Design conformance fixes.
- General logic fixes, non-breaking bug resolutions, and DOM manipulation corrections in `src/core/` or `src/script.ts`.

### HIGH

- Implementation of new features, complete feature rewrites, or complex refactoring of shared state and services.
- Modifications to IndexedDB logic (`wallpaper-storage.ts`), remote data fetching (`services.ts`), or drag-and-drop mechanics (`sortable`).

### CRITICAL

- Any modification to `manifest.json` or `manifest-firefox.json`.
- Changes involving extension permissions, host permissions, or background service workers (`scripts/background.js`).
- Introduction of completely new files or drastic architectural shifts.

## 3. Feedback Tone

Provide direct, highly technical feedback. Point out exactly where the code violates the Vanilla TS/SCSS constraint or the Fluent Design principles. If the logic is correct but does not align with the project's minimalist philosophy, suggest a lighter approach.

## 4. Security & Extension Compliance (Manifest V3)

- **Content Security Policy (CSP):** The extension runs in an isolated environment. Flag any usage of `eval()`, `new Function()`, or inline scripts as CRITICAL.
- **DOM Sanitization:** Strongly prohibit direct assignment to `innerHTML` or `outerHTML` without strict sanitization. Force the use of `textContent`, `setAttribute`, or safe DOM manipulation methods (e.g., `document.createElement`).
- **Storage API:** Ensure that sensitive user preferences are properly handled. Flag any excessive or synchronous writes to `chrome.storage.local` that could be batched.

## 5. Performance & DOM Optimization

- **Reflows & Repaints:** Identify and flag code that causes forced synchronous layouts (e.g., reading `offsetHeight` immediately after modifying a style).
- **Event Listeners:** Ensure that global event listeners (like on `window` or `document`) are debounced or throttled, especially for `resize`, `scroll`, or drag-and-drop (`SortableJS`) events.
- **Memory Leaks:** Warn about missing cleanup logic when DOM elements are removed, particularly for `SpeechRecognition` instances or intervals (e.g., the `setInterval(initBrand, 60000)` logic).

## 6. Anti-Patterns (Few-Shot Examples)

### ❌ BAD: Framework-like overhead or unsafe injection

```typescript
// Do not do this
const updateWeatherUI = (data: any) => {
  document.getElementById('weather').innerHTML =
    `<div class="temp">${data.temp}</div>`;
};
```

### ✅ GOOD: Vanilla typed DOM manipulation

```typescript
// Do this instead
const updateWeatherUI = (data: WeatherApiResponse): void => {
  const weatherContainer = document.getElementById('weather');
  if (!weatherContainer) return;

  const tempElement = document.createElement('div');
  tempElement.className = 'temp';
  tempElement.textContent = String(data.temp);

  weatherContainer.replaceChildren(tempElement);
};
```
