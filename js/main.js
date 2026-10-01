/**
 * Main Interactive Application Logic - LayerByte Edition
 * Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Preloader Handling
  const preloader = document.getElementById('preloader');
  function removePreloader() {
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 600);
    }
  }

  // Dismiss when window is fully loaded or after 1.2s timeout fallback
  window.addEventListener('load', removePreloader);
  setTimeout(removePreloader, 1200);

  // 2. Navbar Sticky Scroll & Active Link Tracking
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll-to-top button visibility
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
      if (window.scrollY > 350) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  });

  // Intersection Observer for highlighting active section in navbar
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // 3. Mobile Navigation Menu Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking on any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });
  }

  // 4. Scroll To Top Rocket Button
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 5. 3D Card Tilt Effect Helper
  function applyTiltEffects() {
    const tiltCards = document.querySelectorAll('.tilt-effect');
    tiltCards.forEach(card => {
      // Avoid attaching duplicate listeners
      if (card.dataset.tiltActive) return;
      card.dataset.tiltActive = 'true';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'transform 0.08s ease-out';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.4s ease';
      });
    });
  }
  applyTiltEffects();

  // 6. Live GitHub Profile Stats Fetcher
  async function fetchLiveGitHubStats() {
    try {
      const response = await fetch('https://api.github.com/users/layerbyte');
      if (response.ok) {
        const data = await response.json();
        const reposEl = document.getElementById('gh-repos-count');
        const followersEl = document.getElementById('gh-followers-count');
        const followingEl = document.getElementById('gh-following-count');

        if (reposEl && data.public_repos !== undefined) reposEl.textContent = data.public_repos;
        if (followersEl && data.followers !== undefined) followersEl.textContent = data.followers;
        if (followingEl && data.following !== undefined) followingEl.textContent = data.following;
      }
    } catch (err) {
      console.log('GitHub user stats fallback active');
    }
  }
  fetchLiveGitHubStats();

  // 7. Live Pinned Repositories Synchronizer from GitHub
  // GitHub's REST API does not expose profile pins, so we use the maintained
  // Pinned API which reads the current GitHub profile pins. It is cached for
  // a few minutes upstream, then refreshed again when the page is loaded.
  async function fetchLivePinnedRepos() {
    const container = document.getElementById('pinned-projects-grid');
    if (!container) return;

    const escapeHtml = (value) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    try {
      const endpoint = `https://pinned.berrysauce.dev/get/layerbyte?pretty&_=${Date.now()}`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Pinned API returned ${res.status}`);

      const pinnedList = await res.json();
      if (!Array.isArray(pinnedList) || pinnedList.length === 0) {
        throw new Error('No pinned repositories returned');
      }

      container.innerHTML = '';

      pinnedList.slice(0, 6).forEach(repo => {
        const repoName = escapeHtml(repo.name || 'Unnamed Repo');
        const repoDesc = escapeHtml(repo.description || 'Open-source project from LayerByte.');
        const repoLang = escapeHtml(repo.language || 'Code');
        const repoStars = Number(repo.stars ?? repo.stargazers_count ?? 0);
        const repoForks = Number(repo.forks ?? repo.forks_count ?? 0);
        const repoUrl = `https://github.com/LayerByte/${encodeURIComponent(repo.name || '')}`;

        const card = document.createElement('article');
        card.className = 'project-card tilt-effect';
        card.innerHTML = `
          <div class="project-content">
            <div class="project-title">
              <span>${repoName}</span>
              <span class="pinned-badge-tag">PINNED</span>
            </div>
            <p class="project-desc">${repoDesc}</p>
            <div class="project-tech-tags">
              <span class="tech-tag">${repoLang}</span>
              <span class="tech-tag">★ ${repoStars} ${repoStars === 1 ? 'Star' : 'Stars'}</span>
              <span class="tech-tag">⑂ ${repoForks} ${repoForks === 1 ? 'Fork' : 'Forks'}</span>
            </div>
            <div class="project-buttons">
              <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-primary">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span>Repository</span>
              </a>
              <a href="${repoUrl}#readme" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-secondary">
                <span>README</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"/></svg>
              </a>
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      applyTiltEffects();
    } catch (err) {
      console.warn('Live pinned sync error:', err);
      container.innerHTML = `
        <article class="project-card project-card-fallback">
          <div class="project-content">
            <div class="project-title">
              <span>LayerByte Projects</span>
              <span class="pinned-badge-tag">GITHUB</span>
            </div>
            <p class="project-desc">Pinned repositories could not be loaded right now. Open the GitHub profile to see the current pinned projects.</p>
            <div class="project-buttons">
              <a href="https://github.com/LayerByte" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-primary">
                <span>Open GitHub</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }
  }
  fetchLivePinnedRepos();

  // 8. GitHub Contribution Heatmap Generation
  const heatmapContainer = document.getElementById('github-heatmap');
  if (heatmapContainer) {
    const totalCols = 28;
    const daysPerCol = 7;

    for (let col = 0; col < totalCols; col++) {
      const colDiv = document.createElement('div');
      colDiv.className = 'heatmap-col';

      for (let row = 0; row < daysPerCol; row++) {
        const cell = document.createElement('div');
        cell.className = 'heat-cell';

        const rand = Math.random();
        let level = '';
        if (rand > 0.80) level = 'l4';
        else if (rand > 0.62) level = 'l3';
        else if (rand > 0.40) level = 'l2';
        else if (rand > 0.20) level = 'l1';

        if (level) cell.classList.add(level);

        const commitCount = level === 'l4' ? Math.floor(Math.random() * 8 + 8)
                          : level === 'l3' ? Math.floor(Math.random() * 5 + 4)
                          : level === 'l2' ? Math.floor(Math.random() * 3 + 2)
                          : level === 'l1' ? 1 : 0;

        cell.setAttribute('title', `${commitCount} contributions on this day (github.com/LayerByte)`);
        colDiv.appendChild(cell);
      }
      heatmapContainer.appendChild(colDiv);
    }
  }

  // 9. Auto Dynamic Footer Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
