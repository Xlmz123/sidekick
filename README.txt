SIDEKICK - AI side panel for Brave

INSTALL (once)
1. Unzip this folder somewhere it can stay, e.g. Documents\Sidekick. Don't delete it later: Brave runs it from there.
2. In Brave, go to brave://extensions
3. Turn on "Developer mode" (top right).
4. Click "Load unpacked" and pick the Sidekick folder (the one with manifest.json in it).
5. Click the puzzle-piece icon in the toolbar and pin Sidekick.

KEYS (free, about 3 minutes)
Gemini (main):
  - Go to https://aistudio.google.com/apikey and sign in with your Google account.
  - Click "Create API key" (pick or create any project). Copy the key.
Groq (backup):
  - Go to https://console.groq.com/keys and sign up (Google sign-in works).
  - Click "Create API Key", give it any name, copy it. It's only shown once.
Then open Sidekick (Alt+J or the toolbar icon) > gear icon > paste both keys >
"Check keys & load models" > Save.

USING IT
- Alt+J opens the panel. Ask about the page you're on: it reads what you've highlighted,
  what's on screen, form fields, and the page text every time you ask.
- Google Docs and Sheets are read through their text export. PDFs and canvas pages get a screenshot instead (Gemini only).
- Camera button = also send a screenshot of what's on screen.
- Right-click selected text > "Explain ... with Sidekick". Right-click a page > "Summarize this page".
- If Gemini hits its free limit or is down, Groq answers automatically (the line under the answer says which one answered).
- Private sites (Settings) only ever go to Groq. Default list: Gmail, PayPal, Venmo, anything with "bank".
- "Today: Gemini N · Groq N" at the bottom counts your questions.

MODELS
Gemini's Flash-Lite model has the biggest free allowance (around 500 questions a day); the bigger Flash model is far
more limited on the free tier. Sidekick picks the newest Flash-Lite automatically. You can change it in Settings.
Free limits change; if one runs out, Groq takes over.
