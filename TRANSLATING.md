# Translate Fluent New Tab

Help make Fluent New Tab accessible globally! Translations are maintained directly in this repository, inside the [`_locales/`](_locales/) folder. No external platform is required.

---

## How to Contribute

There are two ways to contribute translations:

### 1. Pull Request (corrections & new translations)
Open a **Pull Request** editing the relevant `_locales/<locale>/messages.json` file directly. This is the preferred path for:
- Fixing an incorrect or mistranslated string in an existing language.
- Adding a missing string to a language that already exists.
- Adding a brand-new locale that isn't in the repository yet (see [Adding a New Language](#adding-a-new-language)).

### 2. Issue with the `feedback` label (suggestions & reports)
If you spotted a translation problem but don't want to edit files yourself, open a **GitHub Issue** and apply the **`feedback`** label. Describe:
- The locale code (e.g. `pt_BR`).
- The key name (e.g. `greetMorning1`).
- The current (wrong) text and your suggested fix.

A maintainer will apply the correction.

---

## File Format

Each language lives in its own folder under `_locales/`:

```
_locales/
  en_US/
    messages.json   ← source / reference (do not edit)
  pt_BR/
    messages.json   ← your translation goes here
  ...
```

Every entry in `messages.json` follows this structure:

```jsonc
"keyName": {
  "message": "Translated string here"
}
```

Keys that use dynamic values also include a `placeholders` block:

```jsonc
"permissionRequiredMessage": {
  "message": "… needs permission to access \"$API_NAME$\". …",
  "placeholders": {
    "api_name": {
      "content": "$1",
      "example": "Open-Meteo API"
    }
  }
}
```

**Copy the entire entry** (including the `placeholders` block) from `en_US/messages.json` into your locale file, then translate only the `message` value.

---

## Translation Guidelines

To keep translations consistent and functional:

1. **Keep Placeholders Intact:** Never translate, rename, or remove variables like `$NAME$` or `$API_NAME$`.
   - ✅ `Olá, $NAME$! Bom dia.`
   - ❌ `Olá, João! Bom dia.`
   - The `placeholders` block beneath the message must also be copied verbatim.

2. **Context over Literalism:** Avoid word-for-word translations. Aim for clear, natural language appropriate for a browser UI. Design style names such as **"3D Fluent"** or **"Outline"** should remain in English.

3. **Punctuation & Tone:** Match the original punctuation (`…`, `!`, `?`). Keep the tone friendly, minimal, and professional.

4. **Do not translate keys** — only the `message` value changes. The JSON key (e.g. `"greetMorning1"`) must stay exactly as it is.

5. **Do not edit `en_US/`** — it is the source of truth and is used as the fallback for any missing strings.

---

## String Reference

Not sure what a key does? The [`_locales/README.md`](_locales/README.md) contains a full map of every string key, its English value, and a description of where it appears in the UI.

---

## Adding a New Language

1. Check the [Chrome locale codes list](https://developer.chrome.com/docs/extensions/reference/api/i18n#locales) for the correct locale identifier (e.g. `pl_PL`, `ko_KR`).
2. Create the folder `_locales/<locale_code>/` and add a `messages.json` file inside it.
3. Copy the full contents of `_locales/en_US/messages.json` as your starting template.
4. Translate every `"message"` value. Leave `"placeholders"` blocks untouched.
5. Open a Pull Request with the new folder.

> If you are unsure about the correct locale code or whether a language is already partially translated, open an Issue with the `feedback` label before starting.

---

## Attention Developers

**When adding a new string to the codebase**, you must:

1. Add the key to `_locales/en_US/messages.json` (English source).
2. Add the same key to every other locale file in `_locales/`, using the English string as a temporary fallback (`// TODO: translate`).
3. Open an Issue with the `feedback` label to notify translators, or include translations in your PR if you have them.

The i18n system falls back to `en_US` at runtime if a key is missing, but keeping all files in sync avoids silent gaps.
