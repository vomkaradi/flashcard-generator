// ─── State ────────────────────────────────────────────────────────────────────

let cards = [];       // Array of { question, answer } objects from the API
let current = 0;      // Index of the currently displayed card
let isFlipped = false; // Whether the card is showing the answer side
let knownCount = 0;   // How many cards the user has marked as "got it"

// ─── API call ─────────────────────────────────────────────────────────────────

async function generateCards() {
  const apiKey = document.getElementById('api-key').value.trim();
  const notes  = document.getElementById('notes').value.trim();
  const count  = parseInt(document.getElementById('count').value) || 8;

  // Clear any previous error
  hideError();

  // Basic validation before hitting the API
  if (!apiKey) {
    return showError('Please enter your Anthropic API key.');
  }
  if (!apiKey.startsWith('sk-ant-')) {
    return showError("That doesn't look like a valid Anthropic API key (should start with sk-ant-).");
  }
  if (notes.length < 50) {
    return showError('Please paste at least a paragraph of text to generate cards from.');
  }

  setLoading(true);

  try {
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
        messages: [
          {
            role: 'user',
            content: buildPrompt(notes, count),
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    cards = parseCards(data);

    if (!cards.length) {
      throw new Error('No flashcards were returned. Try pasting more text.');
    }

    // Reset state and show the cards UI
    current    = 0;
    isFlipped  = false;
    knownCount = 0;
    showCardsSection();

  } catch (err) {
    showError(err.message || 'Something went wrong. Check your API key and try again.');
  } finally {
    setLoading(false);
  }
}

// Build the prompt sent to Claude
function buildPrompt(text, count) {
  return `You are a study assistant. Read the following text and create exactly ${count} flashcards to help a student study the key concepts.

Return ONLY a valid JSON array — no markdown, no explanation, no backticks. Each object must have exactly two fields:
- "question": a clear, specific question about the text
- "answer": a concise but complete answer (1–3 sentences max)

Text to study:
${text}`;
}

// Parse the raw API response into a clean array of { question, answer }
function parseCards(data) {
  const raw     = data.content[0].text.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  return JSON.parse(cleaned);
}

// ─── UI: rendering ────────────────────────────────────────────────────────────

function showCardsSection() {
  document.getElementById('input-section').style.display = 'none';
  document.getElementById('cards-section').style.display = 'block';
  renderCard();
}

function renderCard() {
  const card = cards[current];

  // Update card text
  document.getElementById('question-text').textContent = card.question;
  document.getElementById('answer-text').textContent   = card.answer;

  // Reset to question side
  document.getElementById('flip-card').classList.remove('flipped');
  isFlipped = false;

  // Update progress bar
  const pct = ((current + 1) / cards.length) * 100;
  document.getElementById('progress-label').textContent  = `${current + 1} / ${cards.length}`;
  document.getElementById('progress-fill').style.width   = pct + '%';
  document.getElementById('score-label').textContent     = `${knownCount} known`;

  // Enable/disable prev & next buttons at the edges
  document.getElementById('prev-btn').disabled = current === 0;
  document.getElementById('next-btn').disabled = current === cards.length - 1;
}

// ─── UI: interactions ─────────────────────────────────────────────────────────

function flipCard() {
  isFlipped = !isFlipped;
  document.getElementById('flip-card').classList.toggle('flipped', isFlipped);
}

// dir: -1 (previous) or +1 (next)
function navigate(dir) {
  const next = current + dir;
  if (next < 0 || next >= cards.length) return;
  current = next;
  renderCard();
}

function markKnew() {
  knownCount++;
  document.getElementById('score-label').textContent = `${knownCount} known`;
  // Auto-advance to the next card if there is one
  if (current < cards.length - 1) {
    navigate(1);
  }
}

function restart() {
  cards      = [];
  current    = 0;
  isFlipped  = false;
  knownCount = 0;
  document.getElementById('cards-section').style.display  = 'none';
  document.getElementById('input-section').style.display  = 'block';
}

// ─── UI: loading state ────────────────────────────────────────────────────────

function setLoading(isLoading) {
  document.getElementById('loading').style.display         = isLoading ? 'block' : 'none';
  document.getElementById('input-section').style.opacity   = isLoading ? '0.5' : '1';
  document.getElementById('generate-btn').disabled         = isLoading;
}

// ─── UI: error handling ───────────────────────────────────────────────────────

function showError(msg) {
  const box = document.getElementById('error-box');
  box.textContent  = msg;
  box.style.display = 'block';
}

function hideError() {
  document.getElementById('error-box').style.display = 'none';
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  // Only active when the cards section is visible
  if (document.getElementById('cards-section').style.display === 'none') return;
  // Don't hijack shortcuts while typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case ' ':
    case 'Spacebar':
      e.preventDefault();   // stop page scroll
      flipCard();
      break;
    case 'ArrowLeft':
      navigate(-1);
      break;
    case 'ArrowRight':
      navigate(1);
      break;
    case 'k':
    case 'K':
      markKnew();
      break;
  }
});
