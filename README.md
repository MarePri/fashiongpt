# FashionGPT

An AI personal stylist for the Inditex ecosystem (Zara, Pull&Bear, Bershka, Stradivarius, Massimo Dutti, Oysho) — built as a conversational, AI-first styling companion rather than a traditional storefront.

## Features

- **Chat** — Free-form conversation with a live Claude-powered stylist. Describe a goal ("first date outfit", "city break in Barcelona") and get a real outfit recommendation with product cards, scores, and pricing.
- **Occasion Builder** — Tap an occasion (wedding, festival, office, beach...) and the AI names and explains a complete look.
- **Trend Radar** — Live-style trend bars showing what's rising and fading this season.
- **FashionDNA** — A short style quiz that generates a personal archetype, palette, confidence scores, and a wardrobe gap to fill.
- **Capsule Wardrobe Builder** — Generates a 10-piece cross-brand capsule with total cost and possible outfit combinations.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API key

Copy `.env.example` to `.env` and add your key:

```bash
cp .env.example .env
```

Get a key at [console.anthropic.com](https://console.anthropic.com/).

> ⚠️ **Important:** This demo calls the Anthropic API directly from the browser for simplicity, which exposes your API key to anyone who opens dev tools. This is fine for local experimentation, but **before deploying publicly**, move the `callAI()` function in `src/App.jsx` into a small backend route (Node/Express, Next.js API route, Cloudflare Worker, etc.) that holds the key server-side, and call that route from the frontend instead.

### 3. Run it

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

### 4. Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
fashiongpt-project/
├── index.html          # Vite entry HTML
├── src/
│   ├── main.jsx         # React mount point
│   └── App.jsx          # The entire FashionGPT app (UI + data + AI calls)
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## Tech

- React 18 + Vite
- No external UI library — all styling is hand-written CSS-in-JS (see the `css` template string in `App.jsx`)
- Calls `claude-sonnet-4-6` via the Anthropic Messages API for live styling logic

## Customizing

All product data, occasions, trends, and archetypes live as plain arrays near the top of `src/App.jsx` (`PRODUCTS`, `OCCASIONS`, `TRENDS`, `ARCHETYPES`). Edit those directly to swap in real catalog data, change brands, or extend the trend list — no other code changes needed.
