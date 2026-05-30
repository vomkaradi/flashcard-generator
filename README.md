# Flashcard Generator

An AI-powered flashcard generator built with vanilla HTML, CSS, and JavaScript. Paste any text — notes, a textbook passage, a Wikipedia article — and the app generates study flashcards instantly using the Claude API.

**Live demo:** [your-username.github.io/flashcard-generator](https://your-username.github.io/flashcard-generator)

---

![screenshot placeholder](screenshot.png)

---

## Features

- Paste any text and generate 3–20 flashcards automatically
- 3D card flip animation (click or press `Space`)
- Keyboard navigation (`←` `→` arrow keys, `K` to mark known)
- Progress bar and "known" counter
- Works entirely in the browser — no server, no backend
- API key stays in your browser and is never stored

## File structure

```
flashcard-generator/
├── index.html   ← page structure
├── style.css    ← all styles
├── app.js       ← all JavaScript logic
└── README.md
```

## How to run locally

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/flashcard-generator
   cd flashcard-generator
   ```

2. Open `index.html` in Chrome or Firefox — no build step, no npm install.

3. Get a free API key at [console.anthropic.com](https://console.anthropic.com) and paste it into the app.

## How to deploy (GitHub Pages)

1. Push your code to GitHub
2. Go to your repo → **Settings** → **Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Click **Save** — your app is live at `https://your-username.github.io/flashcard-generator` in about 60 seconds

## How it works

1. The user pastes text and clicks "Generate cards"
2. `app.js` sends the text to the Anthropic API with a prompt asking for JSON-formatted flashcards
3. Claude returns a JSON array of `{ question, answer }` objects
4. The app renders them as interactive flip cards

### The core API call (in `app.js`)

```js
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  }),
});
```

## What I learned building this

- How to call a REST API from the browser using `fetch()`
- How to write a prompt that reliably returns structured JSON from an LLM
- CSS `perspective` and `rotateY` transforms for 3D card flipping
- `backface-visibility: hidden` to hide the reverse side during rotation
- Keyboard `keydown` event handling for accessible shortcuts
- Deploying a static site to GitHub Pages

## Potential improvements

- [ ] Save card sets to `localStorage` so they persist between sessions
- [ ] Export cards to Anki `.apkg` format
- [ ] Highlight which part of the source text each card came from
- [ ] Spaced repetition — show cards you got wrong more often
- [ ] Upload a PDF instead of pasting text

## Tech stack

- HTML5, CSS3, vanilla JavaScript — no frameworks, no build tools
- [Anthropic Claude API](https://docs.anthropic.com) for flashcard generation
- [Google Fonts](https://fonts.google.com) — Instrument Serif + DM Sans

## License

MIT — free to use, modify, and share.
