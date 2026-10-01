/**
 * Cosmic Starry Particle Canvas Engine - LayerByte Edition
 * Pure vanilla JavaScript - Zero dependencies
 * Generates twinkling stars in electric blue (#3977da), deep blue (#065ec0),
 * soft blue (#86a6d5), and crisp white (#ffffff).
 */

(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };

  const PARTICLE_COUNT = 90;
  const STAR_COLORS = [
    'rgba(255, 255, 255, 0.95)',
    'rgba(57, 119, 218, 0.9)',
    'rgba(6, 94, 192, 0.8)',
    'rgba(134, 166, 213, 0.85)',
    'rgba(255, 255, 255, 0.75)'
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.2 + 0.6;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45 - 0.15; // gentle upward drift
      this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      this.alpha = Math.random() * 0.8 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.glow = Math.random() > 0.65;
    }

    update() {
      // Natural floating
      this.x += this.vx;
      this.y += this.vy;

      // Twinkling alpha
      this.alpha += this.pulseSpeed;
      if (this.alpha > 1 || this.alpha < 0.2) {
        this.pulseSpeed = -this.pulseSpeed;
      }

      // Screen wrap
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse proximity interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = (dx / distance) * force * 1.5;
          const directionY = (dy / distance) * force * 1.5;
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));
      ctx.fillStyle = this.color;
      
      if (this.glow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3977da';
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? Math.floor(PARTICLE_COUNT * 0.5) : PARTICLE_COUNT;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    const maxDistance = 110;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = (1 - dist / maxDistance) * 0.22;
          ctx.strokeStyle = `rgba(57, 119, 218, ${opacity})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    connectParticles();
    requestAnimationFrame(animate);
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Touch support for mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Start engine
  resize();
  initParticles();
  animate();
})();
