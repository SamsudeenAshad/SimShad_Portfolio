// Profile Page JavaScript - Enhanced with Three.js Background
(() => {
  'use strict';

  // ─── Three.js Animated Particle Background ──────────────────────────
  function initThreeBackground() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded — skipping particle background.');
      return null;
    }

    const canvas = document.getElementById('three-bg');
    if (!canvas) return null;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 50;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Particle configuration
      const PARTICLE_COUNT = 250;
      const COLORS = [
        new THREE.Color(0x3b82f6), // blue
        new THREE.Color(0x8b5cf6), // purple
        new THREE.Color(0x06b6d4), // cyan
      ];

      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      const sizes = new Float32Array(PARTICLE_COUNT);
      const velocities = new Float32Array(PARTICLE_COUNT * 3);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 120;
        positions[i3 + 1] = (Math.random() - 0.5) * 120;
        positions[i3 + 2] = (Math.random() - 0.5) * 60;

        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 2.5 + 0.8;

        velocities[i3] = (Math.random() - 0.5) * 0.015;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.015;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.008;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // Soft-glow circle texture
      const textureCanvas = document.createElement('canvas');
      textureCanvas.width = 64;
      textureCanvas.height = 64;
      const ctx = textureCanvas.getContext('2d');
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
      gradient.addColorStop(0.7, 'rgba(255,255,255,0.15)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      const glowTexture = new THREE.CanvasTexture(textureCanvas);

      const material = new THREE.PointsMaterial({
        size: 1.8,
        map: glowTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Animation loop
      let animationId;
      const clock = new THREE.Clock();

      function animate() {
        animationId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        const posAttr = geometry.attributes.position;
        const posArray = posAttr.array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          posArray[i3] += velocities[i3] + Math.sin(elapsed * 0.3 + i) * 0.003;
          posArray[i3 + 1] += velocities[i3 + 1] + Math.cos(elapsed * 0.2 + i) * 0.003;
          posArray[i3 + 2] += velocities[i3 + 2];

          // Wrap particles that drift out of bounds
          if (posArray[i3] > 60) posArray[i3] = -60;
          if (posArray[i3] < -60) posArray[i3] = 60;
          if (posArray[i3 + 1] > 60) posArray[i3 + 1] = -60;
          if (posArray[i3 + 1] < -60) posArray[i3 + 1] = 60;
          if (posArray[i3 + 2] > 30) posArray[i3 + 2] = -30;
          if (posArray[i3 + 2] < -30) posArray[i3 + 2] = 30;
        }

        posAttr.needsUpdate = true;
        particles.rotation.y = elapsed * 0.02;
        particles.rotation.x = Math.sin(elapsed * 0.01) * 0.05;
        renderer.render(scene, camera);
      }

      animate();

      // Resize handler
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return {
        destroy() {
          cancelAnimationFrame(animationId);
          window.removeEventListener('resize', handleResize);
          geometry.dispose();
          material.dispose();
          glowTexture.dispose();
          renderer.dispose();
        },
      };
    } catch (err) {
      console.warn('Three.js initialisation failed — degrading gracefully.', err);
      return null;
    }
  }

  // ─── DOM Ready ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Three.js background (fire-and-forget; page works fine without it)
    initThreeBackground();

    // ── AOS (Animate On Scroll) ──────────────────────────────────────
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true,
        offset: 100,
        disable: () => window.innerWidth < 768,
      });
    }

    // ── Loading Screen ───────────────────────────────────────────────
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
          loadingScreen.classList.add('hidden');
          setTimeout(() => loadingScreen.remove(), 500);
        }
      }, 1000);
    });

    // ── Mobile Navigation Toggle ─────────────────────────────────────
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    function closeMobileMenu() {
      if (!navMenu || !navToggle) return;
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
      navToggle.querySelectorAll('span').forEach((span) => {
        span.style.transform = '';
        span.style.opacity = '';
      });
    }

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');

        const spans = navToggle.querySelectorAll('span');
        if (navToggle.classList.contains('active')) {
          spans[0].style.transform = 'translateY(6px) rotate(45deg)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
          document.body.style.overflow = 'hidden';
        } else {
          spans.forEach((span) => {
            span.style.transform = '';
            span.style.opacity = '';
          });
          document.body.style.overflow = '';
        }
      });

      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          closeMobileMenu();
        }
      });

      navMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
      });
    }

    // ── Navbar Scroll Effects ────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;

    function handleNavbarScroll() {
      if (!navbar) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      navbar.classList.toggle('scrolled', scrollTop > 100);

      if (scrollTop > lastScrollTop && scrollTop > 200) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
      lastScrollTop = scrollTop;
    }

    // ── Back to Top Button ───────────────────────────────────────────
    const backToTop = document.getElementById('backToTop');

    function handleBackToTopVisibility() {
      if (!backToTop) return;
      backToTop.classList.toggle('visible', window.scrollY > 300);
    }

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // ── Smooth Scrolling for Anchor Links ────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const navbarHeight = navbar ? navbar.offsetHeight : 0;
          window.scrollTo({
            top: targetElement.offsetTop - navbarHeight - 20,
            behavior: 'smooth',
          });
          updateActiveNavLink(targetId);
          closeMobileMenu();
        }
      });
    });

    // ── Active Nav Link Tracking ─────────────────────────────────────
    function updateActiveNavLink(activeId = null) {
      const navLinks = document.querySelectorAll('.nav-link');

      if (activeId) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
        });
        return;
      }

      let current = '';
      document.querySelectorAll('section[id]').forEach((section) => {
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const sectionTop = section.offsetTop - navbarHeight - 50;
        if (
          window.scrollY >= sectionTop &&
          window.scrollY < sectionTop + section.offsetHeight
        ) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    }

    // ── GitHub Iframe Handling ────────────────────────────────────────
    const githubIframe = document.querySelector('.github-iframe-container iframe');
    const iframeOverlay = document.querySelector('.iframe-overlay');

    if (githubIframe && iframeOverlay) {
      githubIframe.addEventListener('load', () => {
        setTimeout(() => {
          iframeOverlay.style.opacity = '0';
          setTimeout(() => {
            iframeOverlay.style.display = 'none';
          }, 300);
        }, 1000);
      });

      githubIframe.addEventListener('error', () => {
        const msg = iframeOverlay.querySelector('.loading-message');
        if (msg) {
          msg.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Unable to load GitHub profile</p>
            <a href="https://github.com/SamsudeenAshad" target="_blank" class="btn btn-primary">
              <i class="fas fa-external-link-alt"></i>
              View on GitHub
            </a>`;
        }
      });
    }

    // ── Counter Animations ───────────────────────────────────────────
    function animateCounter(element, target) {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (target >= 100 ? '+' : '');
      }, 40);
    }

    function observeCounters(selector, getElement = (el) => el) {
      const items = document.querySelectorAll(selector);
      if (!items.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = getElement(entry.target);
              const value = parseInt(el.textContent, 10);
              if (!Number.isNaN(value)) animateCounter(el, value);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      items.forEach((item) => observer.observe(item));
    }

    observeCounters('.stat-card', (card) => card.querySelector('h3'));
    observeCounters('.stat h3');

    // ── Button Ripple Effects ────────────────────────────────────────
    document.querySelectorAll('.btn').forEach((button) => {
      button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position:absolute;width:${size}px;height:${size}px;
          left:${e.clientX - rect.left - size / 2}px;
          top:${e.clientY - rect.top - size / 2}px;
          background:rgba(255,255,255,0.3);border-radius:50%;
          transform:scale(0);animation:ripple .6s ease-out;
          pointer-events:none;z-index:0;`;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });

      // Magnetic effect for primary buttons
      if (button.classList.contains('btn-primary')) {
        button.addEventListener('mousemove', function (e) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        button.addEventListener('mouseleave', function () {
          this.style.transform = 'translate(0, 0)';
        });
      }
    });

    // ── Contact Form Validation & Simulated Submission ───────────────
    const contactForm = document.getElementById('contactForm');

    const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    function showFieldError(field, message) {
      field.style.borderColor = '#ef4444';
      let el = field.parentNode.querySelector('.field-error');
      if (!el) {
        el = document.createElement('div');
        el.className = 'field-error';
        el.style.cssText =
          'color:#ef4444;font-size:0.875rem;margin-top:0.5rem;animation:fadeInUp .3s ease;';
        field.parentNode.appendChild(el);
      }
      el.textContent = message;
    }

    function clearFieldError(field) {
      field.style.borderColor = '';
      field.parentNode.querySelector('.field-error')?.remove();
    }

    function validateField(field) {
      const value = field.value.trim();
      const name = field.getAttribute('name');
      clearFieldError(field);

      const rules = {
        name: { test: () => value.length >= 2, msg: 'Name must be at least 2 characters long' },
        email: { test: () => EMAIL_RE.test(value), msg: 'Please enter a valid email address' },
        subject: {
          test: () => value.length >= 5,
          msg: 'Subject must be at least 5 characters long',
        },
        message: {
          test: () => value.length >= 10,
          msg: 'Message must be at least 10 characters long',
        },
      };

      const rule = rules[name];
      if (rule && !rule.test()) {
        showFieldError(field, rule.msg);
        return false;
      }
      return true;
    }

    if (contactForm) {
      const formInputs = contactForm.querySelectorAll('input, textarea');

      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;

        let isValid = true;
        formInputs.forEach((input) => {
          if (!validateField(input)) isValid = false;
        });
        if (!isValid) return;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        // Simulated submission
        setTimeout(() => {
          submitBtn.textContent = 'Message Sent!';
          submitBtn.style.background = 'var(--accent-green)';
          contactForm.reset();

          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.background = '';
          }, 3000);
        }, 2000);
      });

      formInputs.forEach((input) => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
      });
    }

    // ── Skill Card Hover Interactions ────────────────────────────────
    document.querySelectorAll('.skill-category').forEach((category) => {
      const items = category.querySelectorAll('.skill-item');

      category.addEventListener('mouseenter', () => {
        items.forEach((item) => (item.style.opacity = '0.6'));
      });
      category.addEventListener('mouseleave', () => {
        items.forEach((item) => (item.style.opacity = '1'));
      });

      items.forEach((item) => {
        item.addEventListener('mouseenter', function () {
          this.style.opacity = '1';
          this.style.transform = 'translateX(10px) scale(1.02)';
        });
        item.addEventListener('mouseleave', function () {
          this.style.transform = 'translateX(5px) scale(1)';
        });
      });
    });

    // ── Project Card Hover Overlay ───────────────────────────────────
    document.querySelectorAll('.project-card').forEach((card) => {
      const overlay = card.querySelector('.project-overlay');
      const image = card.querySelector('.project-image');
      if (!overlay || !image) return;

      card.addEventListener('mouseenter', () => {
        overlay.style.opacity = '1';
        image.style.transform = 'scale(1.05)';
      });
      card.addEventListener('mouseleave', () => {
        overlay.style.opacity = '0';
        image.style.transform = 'scale(1)';
      });
    });

    // ── Floating Shapes Parallax ─────────────────────────────────────
    const floatingShapes = document.querySelectorAll('.shape');

    function handleParallax() {
      if (!floatingShapes.length) return;
      const scrolled = window.pageYOffset;
      floatingShapes.forEach((shape, i) => {
        const yPos = -(scrolled * ((i + 1) * 0.5)) / 10;
        shape.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    }

    // ── Lazy Image Loading ───────────────────────────────────────────
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length) {
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imgObserver.unobserve(img);
          }
        });
      });
      lazyImages.forEach((img) => imgObserver.observe(img));
    }

    // ── Keyboard Navigation ──────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });

    // ── Touch Support for Mobile ─────────────────────────────────────
    if ('ontouchstart' in window) {
      document
        .querySelectorAll('.btn, .nav-link, .contact-item, .skill-item, .project-card')
        .forEach((el) => {
          el.addEventListener(
            'touchstart',
            function () {
              this.style.transform = 'scale(0.98)';
            },
            { passive: true }
          );
          el.addEventListener(
            'touchend',
            function () {
              setTimeout(() => {
                this.style.transform = '';
              }, 150);
            },
            { passive: true }
          );
        });
    }

    // ── Throttled Scroll Events ──────────────────────────────────────
    let ticking = false;

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleNavbarScroll();
            handleBackToTopVisibility();
            updateActiveNavLink();
            handleParallax();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    // ── Injected Animation Keyframes & Utility Styles ────────────────
    const sheet = document.createElement('style');
    sheet.textContent = `
      @keyframes ripple {
        to { transform: scale(2); opacity: 0; }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .navbar {
        transition: transform 0.3s ease, background-color 0.3s ease;
      }
      .skill-item, .project-image {
        transition: all 0.3s ease;
      }
      .project-image { overflow: hidden; }
      .btn { position: relative; overflow: hidden; }
      .loaded .fade-in {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(sheet);

    // ── Page Fade-in ─────────────────────────────────────────────────
    setTimeout(() => document.body.classList.add('loaded'), 500);

    console.log('✨ Portfolio profile page loaded successfully with enhanced interactions!');
  });
})();
