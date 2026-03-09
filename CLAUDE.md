# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Knowledge Lab** is a single-page, static web app for storing and reviewing technical concept notes (e.g. Slope, Linear Regression, Backpropagation). It is built with vanilla HTML/CSS/JavaScript using Vite as the bundler. There is no backend — all state is stored in the browser via `localStorage`.

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Bundler     | Vite (vanilla template) |
| Languages   | HTML, CSS, JavaScript   |
| Animation   | Canvas 2D (no Three.js) |
| Fonts       | Google Fonts — Inter, Outfit |
| Deployment  | GitHub Pages via GitHub Actions |

## Key Files

```
concepts/
├── index.html                  # App shell — sidebar, main layout, canvas
├── vite.config.js              # Sets base: '/concepts/' for GitHub Pages
├── src/
│   ├── main.js                 # App logic: concepts data, rendering, events
│   ├── constellation.js        # Neural constellation canvas animation
│   └── style.css               # All styles — dark theme, light mode, components
└── .github/workflows/main.yml  # Auto-deploy to GitHub Pages on push to main
```

## Architecture

- **`main.js`** holds a `concepts` array (the data source) and an `app` object with methods:
  - `init()` — entry point, called on `DOMContentLoaded`
  - `renderWelcome()` — renders the home screen with the "Concept of the Day" ticker
  - `renderSidebar()` — populates the nav list from `concepts`
  - `selectConcept(id)` — loads a concept card into the main content area
  - `getConceptOfTheDay()` — picks a random concept once per 24h, persisted in `localStorage`
  - `initTheme()` — restores theme + sidebar state from `localStorage`
  - `setupEventListeners()` — all click/input handlers

- **`constellation.js`** exports `initConstellation(canvas)`. It runs a Canvas 2D animation: 70 drifting nodes, gradient connection lines, mouse repulsion, pulsing glows, and periodic sparks. It is only visible on the home/welcome screen — hidden when a concept card is open.

## Features

- 🌙 **Dark / Light theme toggle** (top-right button) — persisted in `localStorage`
  - Dark: futuristic neon (cyan, violet, magenta)
  - Light: warm "Parchment" reading theme (`#fcf8e8`, ink-brown text)
- 📰 **Concept of the Day ticker** — scrolling banner on the home screen; refreshes every 24h; clickable to open that concept
- 🧠 **Neural Constellation Web** — live canvas animation in the background (home screen only)
- 🔲 **Sidebar toggle** (`‹` button in top-bar) — collapses/expands with smooth CSS transition; persisted in `localStorage`
- 🏠 **Home navigation** — clicking "KnowledgeLab" title resets to the welcome screen
- 🔍 **Search** — filters the sidebar concept list in real-time

## Adding New Concepts

Edit the `concepts` array in `src/main.js`:

```js
{
  id: 'my-concept',       // unique kebab-case ID
  title: 'My Concept',    // display name
  category: 'Technical',  // shown as a tag
  tags: ['ml', 'stats'],  // additional tags
  description: 'Your note here...',
  interactiveType: 'custom'
}
```

## LocalStorage Keys

| Key        | Value                            |
|------------|----------------------------------|
| `theme`    | `'light'` or `'dark'`           |
| `sidebar`  | `'collapsed'` or `'open'`       |
| `cotd`     | `{ id, timestamp }` JSON object |

## Dev Commands

```bash
npm install       # install dependencies
npm run dev       # start local dev server at http://localhost:5173/
npm run build     # build to dist/ for production
npm run preview   # preview the production build locally
```

## Deployment

Pushes to `main` automatically trigger the GitHub Actions workflow (`.github/workflows/main.yml`):
1. Installs deps + builds with Vite
2. Pushes `dist/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`

Live URL: **https://senthilcaesar.github.io/concepts/**

GitHub Pages source must be set to the `gh-pages` branch in repo Settings → Pages.

## Design System

All colors are CSS variables defined in `:root` (dark) and `:root.light-mode` (light):

| Variable           | Dark value          | Light value        |
|--------------------|---------------------|--------------------|
| `--bg-color`       | `#050507`           | `#fcf8e8`          |
| `--text-primary`   | `#f0f0f5`           | `#3d3021`          |
| `--accent-primary` | `#00f2ff` (cyan)    | `#b08d57` (brass)  |
| `--accent-secondary` | `#7000ff` (violet) | `#7d6b5d` (earth) |

Fonts: headings use `Outfit 800`, body uses `Inter`.
