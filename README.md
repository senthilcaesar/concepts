# Knowledge Lab 🧠

A personal, interactive web app for storing and reviewing technical concept notes — built to be beautiful enough to make you *want* to come back every day.

🔗 **Live site:** [senthilcaesar.github.io/concepts](https://senthilcaesar.github.io/concepts/)

---

## Features

| Feature | Description |
|---|---|
| 🌌 **Neural Constellation** | Live canvas animation — 70 glowing nodes drifting and reacting to your mouse |
| 📰 **Concept of the Day** | Scrolling ticker picks a random concept each day (persisted 24h) |
| 🌙 **Dark / Light Theme** | Futuristic dark mode + warm "Parchment" reading mode |
| 🔲 **Collapsible Sidebar** | Toggle the sidebar open/closed, state persists across visits |
| 🔍 **Live Search** | Filter concepts from the sidebar in real time |
| 🏠 **Home Navigation** | Click `KnowledgeLab` to return to the welcome screen |

All preferences (theme, sidebar state, concept of the day) are saved in `localStorage`.

---

## Adding Your Own Concepts

Edit the `concepts` array in `src/main.js`:

```js
{
  id: 'gradient-descent',   // unique kebab-case ID
  title: 'Gradient Descent',
  category: 'ML',
  tags: ['optimization', 'neural-nets'],
  description: 'An iterative algorithm that minimizes a loss function by moving in the direction of steepest descent.',
  interactiveType: 'custom'
}
```

---

## Tech Stack

- **Vite** — fast dev server + production bundler  
- **Vanilla JS / CSS / HTML** — no frameworks  
- **Canvas 2D** — neural constellation animation  
- **GitHub Actions** — automated deploy on every push to `main`

---

## Local Development

```bash
npm install       # install dependencies
npm run dev       # start dev server → http://localhost:5173/
npm run build     # build for production → dist/
```

## Deployment

Pushing to `main` automatically triggers the GitHub Actions workflow (`.github/workflows/main.yml`), which builds the project and deploys the `dist/` folder to **GitHub Pages**.
