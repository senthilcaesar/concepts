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
    description: 'In order to define a linear relationship between two variables, we need a slope and an intercept. \n\nThe four assumptions of simple linear regression are linearity, normality, independent observations, and homoscedasticity. Linearity assumes that each predictor variable Xi is linearly related to the outcome variable Y. Normality assumes that the residual values are normally distributed. Independent observation assumes that each observation in the dataset is independent. And homoscedasticity assumes over the values have the same variance.\n\nFor more reading, check out these guides:\n\n• <a href="https://woolly-revolve-fec.notion.site/The-four-main-assumptions-of-simple-linear-regression-31cbdfa1611d80e89277dea76aa262e9?source=copy_link" target="_blank" class="read-more-link">The Four Main Assumptions of Simple Linear Regression</a>\n\n• <a href="https://woolly-revolve-fec.notion.site/Correlation-and-the-intuition-behind-simple-linear-regression-31cbdfa1611d801689c5e06961a2c888?source=copy_link" target="_blank" class="read-more-link">Correlation and the intuition behind simple linear regression</a>\n\n• <a href="/concepts/docs/slr.html" target="_blank" class="read-more-link">Explore linear regression with Python</a>',
    interactiveType: 'custom'
  },
    {
    id: 'residual',
    title: 'Residual',
    category: 'Technical',
    tags: [],
    description: 'The difference between observed or actual value and the predicted values of the regression line. \n\nThe sum of squared residuals is the sum of the squared differences between each observed value and the associated predicted value. Data professionals use this sum to capture a summary of total error in the model.\n\nFor more reading, check out this guide: <a href="https://woolly-revolve-fec.notion.site/Explore-ordinary-least-squares-31cbdfa1611d80ae9278f35874020e58?source=copy_link" target="_blank" class="read-more-link">Explore ordinary least squares</a>',
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

// Study Mode State
const studyMode = {
  isActive: false,
  isLocked: false,
  isMinimized: false,
  currentView: 'timer',
  timer: {
    duration: 25 * 60,
    remaining: 25 * 60,
    interval: null,
    isRunning: false
  },
  flashcards: {
    currentIndex: 0,
    shuffled: [],
    isFlipped: false
  },
  stats: {
    streak: 0,
    cardsToday: 0,
    focusMinutes: 0,
    lastStudyDate: null
  }
};

const app = {
  activeConcept: null,

  init() {
    this.renderSidebar();
    this.setupEventListeners();
    this.initTheme();
    this.initStudyMode();
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

  isMobile() {
    return window.innerWidth <= 640;
  },

  closeMobileSidebar() {
    document.getElementById('app').classList.remove('sidebar-open');
  },

  setupEventListeners() {
    // Concept list: close mobile drawer after selecting
    document.getElementById('concept-list').addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-item')) {
        const id = e.target.dataset.id;
        if (this.isMobile()) this.closeMobileSidebar();
        this.selectConcept(id);
      }
    });

    // Sidebar toggle: overlay drawer on mobile, collapse on desktop
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      const app = document.getElementById('app');
      if (this.isMobile()) {
        app.classList.toggle('sidebar-open');
      } else {
        const collapsed = app.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebar', collapsed ? 'collapsed' : 'open');
      }
    });

    // Backdrop click: close mobile drawer
    document.getElementById('app').addEventListener('click', (e) => {
      if (this.isMobile() && e.target === document.getElementById('app')) {
        this.closeMobileSidebar();
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
      if (this.isMobile()) this.closeMobileSidebar();
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
  },

  // ========================================
  // STUDY MODE
  // ========================================

  initStudyMode() {
    // Load stats from localStorage
    this.loadStudyStats();
    this.updateStudyMetrics();
    this.initZenFlow();

    // Study mode button
    document.getElementById('study-mode-btn').addEventListener('click', () => {
      this.toggleStudyMode();
    });

    // Exit study mode
    document.getElementById('exit-study').addEventListener('click', () => {
      this.toggleStudyMode();
    });

    // Timer controls
    document.getElementById('timer-toggle').addEventListener('click', () => {
      this.toggleTimer();
    });

    document.getElementById('timer-reset').addEventListener('click', () => {
      this.resetTimer();
    });

    // Timer presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const time = parseInt(e.target.dataset.time);
        this.setTimerDuration(time);
      });
    });

    // Minimize / expand study mode
    document.getElementById('minimize-study').addEventListener('click', () => {
      this.minimizeStudy();
    });

    document.getElementById('expand-study').addEventListener('click', () => {
      this.expandStudy();
    });

    document.getElementById('mini-stop-btn').addEventListener('click', () => {
      this.expandStudy();
      this.toggleStudyMode(); // exit study mode
    });

    // Lock / unlock screen
    document.getElementById('lock-screen-btn').addEventListener('click', () => {
      this.lockScreen();
    });

    document.getElementById('unlock-screen-btn').addEventListener('click', () => {
      this.unlockScreen();
    });
  },

  loadStudyStats() {
    const saved = localStorage.getItem('studyStats');
    if (saved) {
      studyMode.stats = JSON.parse(saved);
      this.updateStreak();
    }
  },

  saveStudyStats() {
    localStorage.setItem('studyStats', JSON.stringify(studyMode.stats));
  },

  updateStreak() {
    const today = new Date().toDateString();
    const lastDate = studyMode.stats.lastStudyDate;

    if (lastDate) {
      const lastStudy = new Date(lastDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStudy.toDateString() === yesterday.toDateString()) {
        // Continue streak
      } else if (lastStudy.toDateString() !== today) {
        // Reset streak
        studyMode.stats.streak = 0;
      }
    }
  },

  updateStudyMetrics() {
    // Elements removed from UI — guard against null refs
    const streak = document.getElementById('study-streak');
    const cards  = document.getElementById('study-cards');
    const mins   = document.getElementById('study-minutes');
    if (streak) streak.textContent = studyMode.stats.streak;
    if (cards)  cards.textContent  = studyMode.stats.cardsToday;
    if (mins)   mins.textContent   = studyMode.stats.focusMinutes;
  },

  toggleStudyMode() {
    studyMode.isActive = !studyMode.isActive;
    const overlay = document.getElementById('study-mode-overlay');
    const zenFlowBg = document.querySelector('.zen-flow-bg');

    if (studyMode.isActive) {
      // If coming back from minimized, just expand
      if (studyMode.isMinimized) {
        this.expandStudy();
        return;
      }
      overlay.classList.remove('hidden');
      overlay.classList.add('active');
      zenFlowBg.style.opacity = '1';
      this.updateStreak();
      this.saveStudyStats();
    } else {
      // Fully exit — also clear minimized state
      this.expandStudy(); // ensure mini-timer is hidden
      overlay.classList.remove('active');
      zenFlowBg.style.opacity = '0';
      this.resetTimer();
      setTimeout(() => {
        overlay.classList.add('hidden');
      }, 500);
    }
  },

  // Timer methods
  setTimerDuration(minutes) {
    studyMode.timer.duration = minutes * 60;
    studyMode.timer.remaining = minutes * 60;

    // Update UI
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.time) === minutes);
    });

    this.updateTimerDisplay();
  },

  toggleTimer() {
    if (studyMode.timer.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  },

  startTimer() {
    studyMode.timer.isRunning = true;
    document.getElementById('timer-toggle').textContent = 'Pause';
    document.querySelector('.timer-wrapper').classList.add('active');
    document.getElementById('lock-screen-btn').classList.remove('hidden');

    studyMode.timer.interval = setInterval(() => {
      studyMode.timer.remaining--;
      this.updateTimerDisplay();

      if (studyMode.timer.remaining <= 0) {
        this.completeTimer();
      }
    }, 1000);
  },

  pauseTimer() {
    studyMode.timer.isRunning = false;
    document.getElementById('timer-toggle').textContent = 'Resume';
    document.querySelector('.timer-wrapper').classList.remove('active');
    document.getElementById('lock-screen-btn').classList.add('hidden');
    clearInterval(studyMode.timer.interval);
    if (studyMode.isLocked) this.unlockScreen();
  },

  resetTimer() {
    this.pauseTimer();
    studyMode.timer.remaining = studyMode.timer.duration;
    document.getElementById('timer-toggle').textContent = 'Start Focus';
    document.getElementById('timer-status').textContent = 'Ready to focus';
    document.getElementById('lock-screen-btn').classList.add('hidden');
    this.updateTimerDisplay();
  },

  completeTimer() {
    this.pauseTimer();
    document.getElementById('timer-status').textContent = 'Focus complete! Great work!';

    // Update stats
    studyMode.stats.focusMinutes += Math.floor(studyMode.timer.duration / 60);
    this.updateStreakDate();
    this.saveStudyStats();
    this.updateStudyMetrics();

    // Play notification sound (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Session Complete', {
        body: 'Great job! Take a break.',
        icon: '/vite.svg'
      });
    }
  },

  updateTimerDisplay() {
    const minutes = Math.floor(studyMode.timer.remaining / 60);
    const seconds = studyMode.timer.remaining % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');

    // Update mini-timer display
    document.getElementById('mini-timer-display').textContent = timeStr;
    const progressPct = (studyMode.timer.remaining / studyMode.timer.duration) * 100;
    document.getElementById('mini-timer-progress').style.width = `${progressPct}%`;

    // Update progress ring
    const progress = (studyMode.timer.remaining / studyMode.timer.duration);
    const circumference = 2 * Math.PI * 130;
    const offset = circumference * (1 - progress);
    document.getElementById('timer-progress').style.strokeDashoffset = offset;

    // Update status
    if (!studyMode.timer.isRunning) {
      document.getElementById('timer-status').textContent = 'Ready to focus';
    } else {
      document.getElementById('timer-status').textContent = 'Stay focused...';
    }
  },

  // Minimize to floating widget
  minimizeStudy() {
    studyMode.isMinimized = true;
    const overlay = document.getElementById('study-mode-overlay');
    const zenFlowBg = document.querySelector('.zen-flow-bg');
    overlay.classList.remove('active');
    zenFlowBg.style.opacity = '0';
    setTimeout(() => overlay.classList.add('hidden'), 500);
    document.getElementById('mini-timer').classList.remove('hidden');
    // Sync mini display immediately
    const m = Math.floor(studyMode.timer.remaining / 60);
    const s = studyMode.timer.remaining % 60;
    document.getElementById('mini-timer-display').textContent =
      `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    const progressPct = (studyMode.timer.remaining / studyMode.timer.duration) * 100;
    document.getElementById('mini-timer-progress').style.width = `${progressPct}%`;
  },

  // Expand back to full study mode
  expandStudy() {
    studyMode.isMinimized = false;
    document.getElementById('mini-timer').classList.add('hidden');
    if (studyMode.isActive) {
      const overlay = document.getElementById('study-mode-overlay');
      const zenFlowBg = document.querySelector('.zen-flow-bg');
      overlay.classList.remove('hidden');
      overlay.classList.add('active');
      zenFlowBg.style.opacity = '1';
    }
  },

  // Lock Screen
  lockScreen() {
    studyMode.isLocked = true;
    document.getElementById('study-mode-overlay').classList.add('study-locked');
    document.getElementById('unlock-screen-overlay').classList.remove('hidden');
  },

  unlockScreen() {
    studyMode.isLocked = false;
    document.getElementById('study-mode-overlay').classList.remove('study-locked');
    document.getElementById('unlock-screen-overlay').classList.add('hidden');
  },

  updateStreakDate() {
    const today = new Date().toDateString();
    const lastDate = studyMode.stats.lastStudyDate;

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate === yesterday.toDateString()) {
        studyMode.stats.streak++;
      } else {
        studyMode.stats.streak = 1;
      }

      studyMode.stats.lastStudyDate = today;
    }
  },

  // Zen Flow Animation
  initZenFlow() {
    const canvas = document.getElementById('zen-flow-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 80 + 40,
          hue: Math.random() * 60 + 170, // Blue-cyan range
          alpha: Math.random() * 0.1 + 0.05,
          pulse: Math.random() * Math.PI * 2
        });
      }
    };

    const animate = () => {
      if (!studyMode.isActive) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Get theme colors
      const isLight = document.documentElement.classList.contains('light-mode');

      particles.forEach(p => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;

        // Update pulse
        p.pulse += 0.02;

        // Draw particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        const pulseRadius = p.radius * (1 + Math.sin(p.pulse) * 0.1);

        if (isLight) {
          gradient.addColorStop(0, `hsla(40, 30%, 70%, ${p.alpha * 0.5})`);
          gradient.addColorStop(0.5, `hsla(40, 20%, 80%, ${p.alpha * 0.2})`);
          gradient.addColorStop(1, 'transparent');
        } else {
          gradient.addColorStop(0, `hsla(${p.hue}, 70%, 50%, ${p.alpha})`);
          gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, ${p.alpha * 0.3})`);
          gradient.addColorStop(1, 'transparent');
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Draw breathing aura
      if (studyMode.timer.isRunning) {
        const time = Date.now() / 1000;
        const breathRadius = 150 + Math.sin(time * 0.5) * 20;

        const breathGradient = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, breathRadius
        );

        if (isLight) {
          breathGradient.addColorStop(0, 'hsla(40, 30%, 75%, 0.05)');
          breathGradient.addColorStop(1, 'transparent');
        } else {
          breathGradient.addColorStop(0, 'hsla(180, 70%, 50%, 0.03)');
          breathGradient.addColorStop(1, 'transparent');
        }

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, breathRadius, 0, Math.PI * 2);
        ctx.fillStyle = breathGradient;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
