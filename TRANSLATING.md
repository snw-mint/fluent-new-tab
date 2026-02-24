# 🌍 Help Translate Fluent New Tab

Fluent New Tab is designed to be accessible to everyone, and we want it to feel native in every language.

To make contributing easier, faster, and more accessible, we manage our localization workflow through **Crowdin**. You don't need to know how to code or use Git to help us! Many of our existing strings are pre-translated using DeepL, so your help reviewing and correcting them is highly appreciated.

## 🚀 How to Contribute

Crowdin provides a visual interface where you can translate text, vote on the best translations, and see changes sync automatically with the project.

### 👉 [Join the Fluent New Tab project on Crowdin](https://crowdin.com/project/fluent-new-tab)

**Why use Crowdin?**
* **No Coding Required:** You don't need to touch JSON files or worry about syntax errors.
* **Visual Context:** See exactly what you are translating.
* **Automatic Sync:** Your translations are automatically merged into the project and will appear in the next release.

---

## 📝 Translation Guidelines

To ensure the extension works perfectly and looks consistent, please follow these simple rules:

### 1. ⚠️ Do NOT Touch Placeholders
Some strings contain variables like `$NAME$`. These are replaced by code (e.g., the user's name).
* **Correct:** `Good morning, $NAME$`
* **Incorrect:** `Good morning, John` or `Good morning,`

**Never translate or remove the `$NAME$` tag.** If you do, the greeting feature will break.

### 2. 🧠 Keep the Context in Mind
When translating manually, always consider where the text will appear in the extension. 
* Avoid literal translations if they don't fit the context of a user interface.
* Please do not use slang or overly informal terms. Keep the language clear and universally understood in your region.
* Specific design terms that refer to visual themes (such as **"3D Fluent"** or **"Outline"**) should remain in English to maintain brand consistency.

### 3. Punctuation & Tone
* If the original text ends with `...` or `!`, please keep it in your translation.
* Try to keep the tone **friendly, minimal, and professional**.

---

## 🙋‍♂️ Missing Your Language?

If you don't see your language listed on our Crowdin page, we would love to add it!

1.  Go to the [Crowdin Project Page](https://crowdin.com/project/fluent-new-tab).
2.  Click **"Request New Language"** or leave a comment on the discussion board.
3.  Alternatively, open a GitHub Issue requesting the new language.

We will approve it as soon as possible so you can start translating.

---

### 🛠️ For Developers (Important Notice)

**Please DO NOT open Pull Requests directly on GitHub to edit existing translation files (`messages.json`).**

Because Crowdin is perfectly synced with this repository and acts as the source of truth, any manual changes made via PR to existing locales might be overwritten during the next automatic sync. Please submit all text corrections and new translations exclusively through the Crowdin platform.

Thank you for helping us make Fluent New Tab global! 🌍
