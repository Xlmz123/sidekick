# Sidekick

**A free AI side panel for Brave, Chrome and Edge that reads the page you're on and answers questions about it.**

Open it with `Alt+J` and ask anything about the page in front of you: "summarize this," "what does this paragraph mean," "quiz me on this." Sidekick uses **your own free API keys** from Google Gemini and Groq, so there's no subscription, account or server. Your keys stay in your browser.

---

## Features

- **Reads the page each time you ask.** It reads your highlighted text, what's visible on screen, form fields (never passwords), and the main article text. It skips menus, cookie banners and footers.
- **Google Docs and Sheets** are read through their built-in text and CSV export.
- **PDFs and canvas-based pages** are sent as a screenshot instead (Gemini only).
- **📷 Screenshot button** attaches what's on screen to your question.
- **Quick actions:** Summarize · Key points · Explain simply · Quiz me
- **Right-click menu:** "Explain … with Sidekick" on selected text, and "Summarize this page" anywhere else.
- **Automatic backup.** If Gemini hits its free limit or fails, Groq answers instead. A line under each answer shows which model answered.
- **Private sites mode.** Sites you mark as private (by default Gmail, PayPal, Venmo, and anything containing "bank") are only ever sent to Groq.
- **Settings** include "Use Groq first," a box for standing instructions such as "answer briefly," and a counter of today's questions for each provider.

---

## Install (about 5 minutes)

Sidekick isn't in the Chrome Web Store, so you load it as an "unpacked" extension. That's a normal developer option and takes about a minute.

### 1. Download

- Click the green **Code** button at the top of this page, then **Download ZIP**,
- **or** clone it: `git clone https://github.com/Xlmz123/sidekick.git`

Unzip it to a folder you'll keep, such as `Documents\Sidekick`. **Don't delete or move this folder later**, because the browser runs the extension from it.

### 2. Load it into your browser

| Browser | Extensions page |
|---|---|
| Brave | `brave://extensions` |
| Chrome | `chrome://extensions` |
| Edge | `edge://extensions` |

1. Open your browser's extensions page from the table above.
2. Turn on **Developer mode** (a toggle in the top-right corner, or bottom-left in Edge).
3. Click **Load unpacked**.
4. Select the folder that contains `manifest.json`.
5. Click the puzzle-piece icon in the toolbar and **pin** Sidekick.

You need Chrome or Brave version 116 or newer, because side panels require it.

### 3. Get your free API keys

You need at least one key. Getting both gives you the automatic backup.

**Google Gemini (main model)**
1. Go to **https://aistudio.google.com/apikey** and sign in with a Google account.
2. Click **Create API key** (any project is fine) and copy it.

**Groq (backup model)**
1. Go to **https://console.groq.com/keys** and sign up (Google sign-in works).
2. Click **Create API Key**, give it any name, and copy it. It's only shown once.

### 4. Add the keys to Sidekick

1. Open Sidekick with `Alt+J` or the toolbar icon.
2. Click the **⚙ gear** icon.
3. Paste your keys and click **Check keys & load models**.
4. Click **Save**.

That's it. Open any page and ask a question.

---

## Using it

| Action | How |
|---|---|
| Open or close the panel | `Alt+J` or the toolbar icon. Change the shortcut at `brave://extensions/shortcuts` or `chrome://extensions/shortcuts` |
| Ask about the page | Type in the box. Sidekick re-reads the page every time |
| Ask about specific text | Highlight it first, or right-click it and choose **Explain … with Sidekick** |
| Summarize a page | Click **Summarize**, or right-click the page and choose **Summarize this page** |
| Include what's on screen | Click 📷 before sending |

---

## Models and free limits

| Role | Default model | Free allowance (approximate) |
|---|---|---|
| Main | **Gemini Flash-Lite** (newest stable version, picked automatically) | About 500 questions a day. Can read screenshots |
| Backup | **Groq `openai/gpt-oss-120b`** | 1,000 requests and 200K tokens a day, roughly 50 page questions |

- You can change either model in Settings.
- If you run out of Groq quota often, try `llama-3.1-8b-instant`. It allows far more requests a day but is a weaker model.
- The full Gemini Flash model has a much smaller free allowance, which is why Flash-Lite is the default.
- Free limits are set by Google and Groq and can change at any time.

---

## Privacy

- **Your API keys are stored only in your browser's extension storage.** They're never sent anywhere except to Google or Groq when you ask a question.
- **Page content only goes to the model that answers your question.** Sidekick has no server, analytics or tracking.
- **Google's free Gemini tier may use what you send to improve Google products.** Groq says it doesn't train on API requests. That's why sites on your Private list only ever go to Groq. Add any site you consider sensitive in Settings.
- Password fields are never read.

---

## Troubleshooting

- **"Load unpacked" picked the wrong folder.** Choose the folder that has `manifest.json` directly inside it, not its parent folder.
- **Nothing happens on `Alt+J`.** Another extension may be using that shortcut. Change it on your browser's extensions shortcuts page.
- **"Invalid key" or no models load.** Re-copy the key with no extra spaces and click **Check keys & load models** again.
- **It can't read a page.** Browsers block extensions on their own pages (such as `chrome://` pages and the Web Store). Try a normal website.
- **Rate limit errors.** You've used up the free daily quota. Wait until it resets, or add the other provider's key as a backup.

---

## Files

| File | What it does |
|---|---|
| `manifest.json` | Extension manifest (Manifest V3, side panel) |
| `background.js` | Service worker that handles the toolbar button, shortcut and right-click menu |
| `panel.html` / `panel.css` / `panel.js` | The side panel UI, settings and model calls |
| `reader.js` | Page reader that's injected into the current tab |
| `md.js` | Safe Markdown renderer for answers (blocks HTML injection) |
| `icons/` | Extension icons |

Both providers are called through their OpenAI-compatible chat APIs:
- Gemini: `https://generativelanguage.googleapis.com/v1beta/openai`
- Groq: `https://api.groq.com/openai/v1`

## Contributing

Issues and pull requests are welcome. If something breaks on a particular site, open an issue with the URL (if it's public) and what you asked.

## License

[MIT](LICENSE). Free to use, modify and share.
