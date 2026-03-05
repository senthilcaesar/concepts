import './style.css'
import { initConstellation } from './constellation.js'

const concepts = [
  {
    id: 'slope',
    title: 'Slope',
    category: 'Technical',
    tags: [],
    description: '',
    interactiveType: 'custom'
  },
  {
    id: 'intercept',
    title: 'Intercept',
    category: 'Technical',
    tags: [],
    description: '',
    interactiveType: 'custom'
  },
  {
    id: 'confidence-interval',
    title: 'Confidence Interval',
    category: 'Technical',
    tags: [],
    description: '',
    interactiveType: 'custom'
  },
  {
    id: 'backpropagation',
    title: 'Backpropagation',
    category: 'Technical',
    tags: [],
    description: '',
    interactiveType: 'custom'
  }
];

const app = {
  activeConcept: null,
  
  init() {
    this.renderSidebar();
    this.setupEventListeners();
    this.initTheme();
    this.renderWelcome();
    // Start the neural constellation background
    initConstellation(document.getElementById('constellation-bg'));
  },

  renderWelcome() {
    // Restore constellation on home screen
    document.getElementById('constellation-bg').style.display = '';
    const cotd = this.getConceptOfTheDay();
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="cotd-ticker">
        <span class="cotd-label">✦ Concept of the Day</span>
        <div class="ticker-track">
          <span class="ticker-text">${cotd.title}</span>
        </div>
      </div>
      <div class="welcome-card">
        <h2>Welcome to Knowledge Lab</h2>
        <p>Select a concept from the sidebar to begin your interactive learning journey.</p>
      </div>
    `;

    // Make the ticker clickable to open the concept
    contentArea.querySelector('.cotd-ticker').addEventListener('click', () => {
      this.selectConcept(cotd.id);
    });

    // Pin the start position to the exact right edge of the track (no dead zone)
    const tickerText = contentArea.querySelector('.ticker-text');
    const trackWidth = contentArea.querySelector('.ticker-track').offsetWidth;
    tickerText.style.setProperty('--start-x', trackWidth + 'px');
  },

  getConceptOfTheDay() {
    const stored = JSON.parse(localStorage.getItem('cotd') || '{}');
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // If we have a stored concept AND it's less than 24h old, reuse it
    if (stored.id && stored.timestamp && (now - stored.timestamp) < twentyFourHours) {
      const found = concepts.find(c => c.id === stored.id);
      if (found) return found;
    }

    // Otherwise pick a new random concept and store it
    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
    localStorage.setItem('cotd', JSON.stringify({ id: randomConcept.id, timestamp: now }));
    return randomConcept;
  },

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.querySelector('#theme-toggle .icon').textContent = '☀️';
    }
  },

  renderSidebar() {
    const list = document.getElementById('concept-list');
    list.innerHTML = concepts.map(c => `
      <li class="nav-item" data-id="${c.id}">${c.title}</li>
    `).join('');
  },

  setupEventListeners() {
    document.getElementById('concept-list').addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-item')) {
        const id = e.target.dataset.id;
        this.selectConcept(id);
      }
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-mode');
      const icon = document.querySelector('#theme-toggle .icon');
      icon.textContent = isLight ? '☀️' : '🌙';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // Home navigation
    document.getElementById('home-link').addEventListener('click', () => {
      this.activeConcept = null;
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      this.renderWelcome();
    });

    // Search functionality
    document.getElementById('concept-search').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const items = document.querySelectorAll('.nav-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'block' : 'none';
      });
    });
  },

  selectConcept(id) {
    const concept = concepts.find(c => c.id === id);
    if (!concept) return;

    // Hide constellation when reading a concept
    document.getElementById('constellation-bg').style.display = 'none';

    // Update UI
    this.activeConcept = concept;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-id="${id}"]`).classList.add('active');

    this.renderConcept(concept);
  },

  renderConcept(concept) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <article class="concept-card">
        <h2 class="concept-title">${concept.title}</h2>
        <div class="concept-meta">
          <span class="tag">${concept.category}</span>
          ${concept.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="concept-content" id="concept-description">
          <p>${concept.description || 'Add your description here...'}</p>
        </div>
      </article>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
