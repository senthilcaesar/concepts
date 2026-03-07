import './style.css'
import { initConstellation } from './constellation.js'

const concepts = [
  {
    id: 'slope',
    title: 'Slope',
    category: 'Technical',
    tags: [],
    description: 'The amount that Y increase or decreases per one-unit increase in X',
    interactiveType: 'custom'
  },
  {
    id: 'intercept',
    title: 'Intercept',
    category: 'Technical',
    tags: [],
    description: 'The value of Y, the dependent variable, when X, the independent variable, equals 0',
    interactiveType: 'custom'
  },
  {
    id: 'lr',
    title: 'Linear Regression',
    category: 'Technical',
    tags: [],
    description: 'In order to define a linear relationship between two variables, we need a slope and an intercept. \n\nThe four assumptions of simple linear regression are linearity, normality, independent observations, and homoscedasticity. Linearity assumes that each predictor variable Xi is linearly related to the outcome variable Y. Normality assumes that the residual values are normally distributed. Independent observation assumes that each observation in the dataset is independent. And homoscedasticity assumes the values have the same variance.',
    interactiveType: 'custom'
  },
    {
    id: 'residual',
    title: 'Residual',
    category: 'Technical',
    tags: [],
    description: 'The difference between observed or actual value and the predicted values of the regression line. \n\nThe sum of squared residuals is the sum of the squared differences between each observed value and the associated predicted value. Data professionals use this sum to capture a summary of total error in the model.',
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
    // Deterministic: divide epoch ms by ms-per-day to get a stable daily index.
    // Every user on the same calendar day (UTC) sees the exact same concept.
    // Changes automatically at midnight UTC — no localStorage needed.
    const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    return concepts[dayIndex % concepts.length];
  },

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.querySelector('#theme-toggle .icon').textContent = '☀️';
    }
    if (localStorage.getItem('sidebar') === 'collapsed') {
      document.getElementById('app').classList.add('sidebar-collapsed');
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

    // Sidebar toggle
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      const app = document.getElementById('app');
      const collapsed = app.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebar', collapsed ? 'collapsed' : 'open');
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
          ${(concept.description || 'Add your description here...').split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>
      </article>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
