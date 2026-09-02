# Translating Fluent New Tab

Translations live in `_locales/<locale>/messages.json`. No external platform needed - just edit the JSON.

> [!NOTE]
> Newly added languages will not be translated automatically. After new strings are added, they will be released with a fallback until the missing translations are submitted.

---

## How to Contribute

**Quick way - open an Issue:**

1. Go to [Issues > Translation Request](https://github.com/snw-mint/fluent-new-tab/issues/new/choose).
2. Copy the contents of [`en_US/messages.json`](en_US/messages.json) into the issue body.
3. Translate only the values inside `"message": "..."`.
4. Submit - a maintainer will apply it for you.

**If you're comfortable with Git - open a Pull Request:**
Edit `_locales/<locale>/messages.json` directly and submit a PR. Use this for fixing existing strings or adding a new language (see [Adding a New Language](#adding-a-new-language)).

---

## Translation Rules

- Translate only the `"message"` value.
- Never touch JSON keys or `"placeholders"` blocks.
- Do not edit `en_US/` - it's the source of truth.
- Keep `$VARIABLES$` intact (e.g. `$SOURCE$`, `$API_NAME$`).
- Use natural, UI-appropriate language - not word-for-word.
- Style names like **"3D Fluent"** or **"Outline"** stay in English.

---

## Adding a New Language

1. Look up the correct locale code in the [Chrome i18n locale list](https://developer.chrome.com/docs/extensions/reference/api/i18n#locales) (e.g. `pl_PL`, `ko_KR`).
2. Create `_locales/<locale_code>/messages.json`.
3. Copy `en_US/messages.json` as the base.
4. Translate every `"message"` value. Leave `"placeholders"` blocks as-is.
5. Submit via Pull Request or Issue.

---

## For Developers

When adding a new string:

1. Add the key to `_locales/en_US/messages.json`.
2. Add the same key to all other locale files (use the English string as a temporary fallback).

The i18n system falls back to `en_US` at runtime if a key is missing.

