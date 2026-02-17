# 🌍 Help Translate Fluent New Tab

Fluent New Tab is designed to be accessible to everyone, and we want it to feel native in every language.

We have moved our translation workflow to **Crowdin** to make contributing easier, faster, and more accessible. You don't need to know how to code or use Git to help us!

## 🚀 How to Contribute

We use Crowdin to manage localization. It provides a visual interface where you can translate text, vote on the best translations, and see changes sync automatically with the project.

### 👉 Click here to join the project on Crowdin

**Why use Crowdin?**
*   **No Coding Required:** You don't need to touch JSON files or worry about syntax errors.
*   **Visual Context:** See exactly what you are translating.
*   **Automatic Sync:** Your translations are automatically merged into the project and will appear in the next release.

---

## 📝 Translation Guidelines

To ensure the extension works perfectly and looks consistent, please follow these simple rules:

### 1. ⚠️ Do NOT Touch Placeholders
Some strings contain variables like `$NAME$`. These are replaced by code (e.g., the user's name).
*   **Correct:** `Good morning, $NAME$`
*   **Incorrect:** `Good morning, John` or `Good morning,`

**Never translate or remove the `$NAME$` tag.** If you do, the greeting feature will break.

### 2. 🎨 Keep Style Names in English
Specific design terms refer to visual themes and should remain in English to maintain brand consistency:
*   **"3D Fluent"**
*   **"Outline"**

----
Please do not translate these terms.

### 3. Punctuation & Tone
*   If the original text ends with `...` or `!`, please keep it in your translation.
*   Try to keep the tone **friendly, minimal, and professional**.

---

## 🙋‍♂️ Missing Your Language?

If you don't see your language listed on our Crowdin page, we would love to add it!

1.  Go to the Crowdin Project Page.
2.  Click **"Request New Language"** or leave a comment.
3.  Alternatively, open a GitHub Issue requesting the new language.

We will add it as soon as possible so you can start translating.

---

### 🛠️ For Developers

While we strongly recommend using Crowdin, if you prefer to submit a Pull Request manually, please ensure you are editing the `_locales/{lang}/messages.json` file and validating your JSON syntax before submitting.

Thank you for helping us make Fluent New Tab global! 🌍
