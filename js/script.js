/**
 * BRUK — Main Application Coordinator
 * Handles: Custom cursor lerping, card interactions, interactive estimator engine,
 * case study modal system, theme switcher HUD, FPS monitor, and brief form interactions.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* =========================================================
     1. Sound Engine & Audio UI Binding
     ========================================================= */
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle && window.BrukAudio) {
    soundToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      window.BrukAudio.toggleMute();
    });
  }

  // Helper to play audio safely
  function playHover() {
    if (window.BrukAudio) window.BrukAudio.playHover();
  }
  function playClick() {
    if (window.BrukAudio) window.BrukAudio.playClick();
  }

  /* =========================================================
     2. Theme Switcher HUD & Live FPS Monitor
     ========================================================= */
  const themeBtns = document.querySelectorAll('.theme-btn');

  function switchTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeBtns.forEach((btn) => {
      if (btn.dataset.theme === theme) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
    if (window.BrukAudio) window.BrukAudio.playThemeSwitch();
  }

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const theme = this.dataset.theme;
      if (theme) switchTheme(theme);
    });
  });

  // Browser render FPS Monitor
  const fpsDisplay = document.getElementById('fpsDisplay');
  if (fpsDisplay) {
    let lastTime = performance.now();
    let frames = 0;
    function monitorFps(now) {
      frames++;
      if (now - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        fpsDisplay.textContent = `${Math.min(fps, 60)} FPS`;
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(monitorFps);
    }
    requestAnimationFrame(monitorFps);
  }

  /* =========================================================
     3. Smooth Navbar & Scrolling
     ========================================================= */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  window.addEventListener('scroll', function () {
    if (!navbar) return;
    if (window.pageYOffset > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }, { passive: true });

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      playClick();
      const isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active nav link scrollspy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    const navHeight = navbar ? navbar.offsetHeight : 70;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navHeight - 120;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove('is-active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('is-active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  // Smooth scroll for internal anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        playClick();
        const navHeight = navbar ? navbar.offsetHeight : 70;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  /* =========================================================
     4. Custom Cursor Lerp & Follower
     ========================================================= */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const hoverables = document.querySelectorAll('a, button, .btn, .work-card, .service-card, .tech-node, .chip-btn, .budget-chip');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('is-hovering');
        playHover();
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('is-hovering');
      });
    });
  }

  /* =========================================================
     5. Card Interactive Subtle Tilt & Lift
     ========================================================= */
  const tiltCards = document.querySelectorAll('.work-card, .service-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  /* =========================================================
     6. Selected Work Case Study Modal
     ========================================================= */
  const caseStudies = {
    aether: {
      title: 'Aether Autonomous AI',
      category: 'Enterprise SaaS Platform',
      metrics: [
        { label: 'Session Duration', val: '+340%' },
        { label: 'Demo Conversions', val: '2.8x' },
        { label: 'Lighthouse Score', val: '99/100' }
      ],
      desc: 'Aether needed a groundbreaking web platform to showcase their next-generation neural chip hardware. We engineered a real-time interactive platform that allows prospective enterprise buyers to inspect and benchmark chip architecture directly inside Chrome/Safari at 60 FPS.',
      stack: ['Next.js 15', 'TypeScript', 'WebSockets', 'Tailwind CSS', 'Micro-Frontends']
    },
    lumina: {
      title: 'Lumina Horology',
      category: 'Luxury E-Commerce & Interactive Studio',
      metrics: [
        { label: 'Online Sales', val: '+185%' },
        { label: 'Customizer Completion', val: '82%' },
        { label: 'Page Load Speed', val: '0.6s' }
      ],
      desc: 'Lumina produces high-end Swiss mechanical timepieces. We crafted an interactive watch customizer integrated into a headless Shopify Plus architecture, giving clients the tactile luxury experience of customizing metals, bezels, dials, and straps.',
      stack: ['React 19', 'Shopify Storefront API', 'Stripe', 'Node.js', 'Tailwind CSS']
    },
    synthex: {
      title: 'Synthex Protocol',
      category: 'High-Frequency FinTech Trading Terminal',
      metrics: [
        { label: 'Render Latency', val: '< 8ms' },
        { label: 'Active Traders', val: '45,000+' },
        { label: 'Crash Rate', val: '0.00%' }
      ],
      desc: 'For high-frequency algorithmic crypto trading, lag is fatal. We developed a zero-overhead Rust WebAssembly and canvas charting engine capable of streaming 120,000 order book updates per second with zero UI frame drops or memory leaks.',
      stack: ['Rust WebAssembly', 'React', 'HTML5 Canvas', 'Zero-Copy WebSockets', 'TypeScript']
    },
    vortex: {
      title: 'Vortex Spatial Studio',
      category: 'Interactive Architectural Portfolio',
      metrics: [
        { label: 'Awwwards Honors', val: 'Site of the Day' },
        { label: 'Global Inquiries', val: '+220%' },
        { label: 'Mobile Framerate', val: 'Locked 60 FPS' }
      ],
      desc: 'An internationally acclaimed architectural firm wanted an online portfolio that felt like stepping inside an avant-garde gallery. We engineered an interactive spatial showcase with procedural audio soundscapes that dynamically adapt as visitors explore projects.',
      stack: ['Next.js', 'Web Audio API', 'GSAP ScrollTrigger', 'Tailwind CSS']
    }
  };

  const modal = document.getElementById('caseStudyModal');
  const modalClose = document.getElementById('modalClose');
  const modalBody = document.getElementById('modalBody');

  function openCaseStudy(key) {
    const data = caseStudies[key];
    if (!data || !modal || !modalBody) return;

    playClick();

    const metricsHtml = data.metrics.map((m) => `
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:16px; border-radius:12px; text-align:center;">
        <div style="font-family:var(--font-display); font-size:1.8rem; font-weight:700; color:var(--cyan);">${m.val}</div>
        <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); margin-top:4px;">${m.label}</div>
      </div>
    `).join('');

    const stackHtml = data.stack.map((s) => `
      <span class="stack-pill" style="font-size:0.8rem; padding:5px 12px;">${s}</span>
    `).join('');

    modalBody.innerHTML = `
      <span class="section-tag" style="margin-bottom:12px;">Case Study</span>
      <h2 style="font-size:2rem; margin-bottom:6px;">${data.title}</h2>
      <p style="color:var(--cyan); font-family:var(--font-mono); font-size:0.85rem; margin-bottom:24px;">${data.category}</p>
      
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:28px;">
        ${metricsHtml}
      </div>

      <h4 style="font-size:1.1rem; margin-bottom:8px; color:#fff;">Engineering &amp; Architecture</h4>
      <p style="color:var(--text-secondary); line-height:1.7; margin-bottom:24px;">${data.desc}</p>

      <h4 style="font-size:0.95rem; font-family:var(--font-mono); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px; color:var(--text-dim);">Technologies Deployed</h4>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:32px;">
        ${stackHtml}
      </div>

      <div style="display:flex; gap:16px;">
        <a href="#contact" class="btn btn--primary modal-inquire-btn" style="flex:1;">Inquire Similar Project →</a>
      </div>
    `;

    // Re-bind inquire button
    const inquireBtn = modalBody.querySelector('.modal-inquire-btn');
    if (inquireBtn) {
      inquireBtn.addEventListener('click', () => {
        closeModal();
      });
    }

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    playClick();
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  const workCards = document.querySelectorAll('.work-card');
  workCards.forEach((card) => {
    card.addEventListener('click', function () {
      const projectKey = this.dataset.project;
      if (projectKey) openCaseStudy(projectKey);
    });
  });

  /* =========================================================
     6b. Choose Your Website Type Modal (Onrevv Model)
     ========================================================= */
  const choiceModal = document.getElementById('choiceModal');
  const choiceModalClose = document.getElementById('choiceModalClose');
  const choiceModalMobileClose = document.getElementById('choiceModalMobileClose');
  const buildWebsiteBtn = document.getElementById('buildWebsiteBtn');
  const navGetStartedBtn = document.getElementById('navGetStartedBtn');
  const chooseBusinessBtn = document.getElementById('chooseBusinessBtn');
  const chooseStoreBtn = document.getElementById('chooseStoreBtn');

  function openChoiceModal(e) {
    if (e) e.preventDefault();
    playClick();
    if (!choiceModal) return;
    choiceModal.classList.add('is-open');
    choiceModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeChoiceModal() {
    if (!choiceModal) return;
    playClick();
    choiceModal.classList.remove('is-open');
    choiceModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (buildWebsiteBtn) buildWebsiteBtn.addEventListener('click', openChoiceModal);
  if (navGetStartedBtn) navGetStartedBtn.addEventListener('click', openChoiceModal);
  if (choiceModalClose) choiceModalClose.addEventListener('click', closeChoiceModal);
  if (choiceModalMobileClose) choiceModalMobileClose.addEventListener('click', closeChoiceModal);

  if (choiceModal) {
    choiceModal.addEventListener('click', function (e) {
      if (e.target === choiceModal) closeChoiceModal();
    });
  }

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && choiceModal && choiceModal.classList.contains('is-open')) {
      closeChoiceModal();
    }
  });

  // Handle Business Website selection
  if (chooseBusinessBtn) {
    chooseBusinessBtn.addEventListener('click', function () {
      playClick();
      chooseBusinessBtn.classList.add('is-selected');
      const actionSpan = chooseBusinessBtn.querySelector('.choice-card__action');
      if (actionSpan) actionSpan.textContent = 'CONFIGURING...';

      setTimeout(() => {
        closeChoiceModal();
        chooseBusinessBtn.classList.remove('is-selected');
        if (actionSpan) actionSpan.textContent = 'DEPLOY PROFILE →';

        // Configure Estimator for Business / Portfolio
        if (pagesSlider) {
          pagesSlider.value = 2;
          pagesSlider.dispatchEvent(new Event('input'));
        }
        const projectScope = document.getElementById('projectScope');
        if (projectScope) {
          projectScope.value = '[Goal: Business Website / Portfolio]\nWe want to launch a modern, ultra-fast business website with clean interactive aesthetics and mobile optimization.';
        }

        const estimatorSection = document.getElementById('estimator');
        if (estimatorSection) {
          const navHeight = navbar ? navbar.offsetHeight : 70;
          const targetPos = estimatorSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      }, 350);
    });
  }

  // Handle E-commerce Store selection
  if (chooseStoreBtn) {
    chooseStoreBtn.addEventListener('click', function () {
      playClick();
      chooseStoreBtn.classList.add('is-selected');
      const actionSpan = chooseStoreBtn.querySelector('.choice-card__action');
      if (actionSpan) actionSpan.textContent = 'CONFIGURING...';

      setTimeout(() => {
        closeChoiceModal();
        chooseStoreBtn.classList.remove('is-selected');
        if (actionSpan) actionSpan.textContent = 'DEPLOY STORE →';

        // Configure Estimator for E-commerce
        if (pagesSlider) {
          pagesSlider.value = 3;
          pagesSlider.dispatchEvent(new Event('input'));
        }
        if (backendChips) {
          const chips = backendChips.querySelectorAll('.chip-btn');
          if (chips && chips[1]) chips[1].click();
        }
        const projectScope = document.getElementById('projectScope');
        if (projectScope) {
          projectScope.value = '[Goal: E-Commerce Store]\nWe want to launch a high-converting online store with seamless checkout, product customizer, and payment integrations.';
        }

        const estimatorSection = document.getElementById('estimator');
        if (estimatorSection) {
          const navHeight = navbar ? navbar.offsetHeight : 70;
          const targetPos = estimatorSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      }, 350);
    });
  }

  /* =========================================================
     7. Tech Orbit Node Click Sounds
     ========================================================= */
  const techNodes = document.querySelectorAll('.tech-node');
  techNodes.forEach((node) => {
    node.addEventListener('click', function () {
      playClick();
    });
  });

  /* =========================================================
     8. Interactive Project Estimator Engine
     ========================================================= */
  const pagesSlider = document.getElementById('pagesSlider');
  const pagesValDisplay = document.getElementById('pagesValDisplay');
  const motionChips = document.getElementById('motionChips');
  const backendChips = document.getElementById('backendChips');
  const tierChips = document.getElementById('tierChips');

  const estimatedPriceEl = document.getElementById('estimatedPrice');
  const estimatedTimelineEl = document.getElementById('estimatedTimeline');
  const recommendedStackEl = document.getElementById('recommendedStack');
  const applyScopeBtn = document.getElementById('applyScopeBtn');

  const scopeConfig = {
    1: { label: 'Single Page / Micro-Hub', baseCost: 25000, weeks: '1 - 2 Weeks', stack: 'Vite + TypeScript + Tailwind' },
    2: { label: '5-8 Pages (Standard)', baseCost: 45000, weeks: '3 - 4 Weeks', stack: 'Next.js 15 + React 19 + Vercel Edge' },
    3: { label: 'Full Web App (9-18 Pages)', baseCost: 95000, weeks: '5 - 6 Weeks', stack: 'Next.js 15 + Node.js + PostgreSQL + Tailwind' },
    4: { label: 'Enterprise Cloud Platform', baseCost: 180000, weeks: '7 - 9 Weeks', stack: 'Next.js 15 + Rust WASM + Microservices + AWS' }
  };

  let currentScale = 2;
  let currentMotionMult = 1.0;
  let currentBackendCost = 0;
  let currentTierMult = 1.0;

  function updateEstimator() {
    const scaleData = scopeConfig[currentScale] || scopeConfig[2];
    if (pagesValDisplay) pagesValDisplay.textContent = scaleData.label;

    const calculatedTotal = Math.round((scaleData.baseCost * currentMotionMult + currentBackendCost) * currentTierMult);

    if (estimatedPriceEl) {
      estimatedPriceEl.textContent = '₹' + calculatedTotal.toLocaleString('en-IN');
    }
    if (estimatedTimelineEl) {
      estimatedTimelineEl.textContent = scaleData.weeks;
    }
    if (recommendedStackEl) {
      recommendedStackEl.textContent = scaleData.stack;
    }
  }

  if (pagesSlider) {
    pagesSlider.addEventListener('input', function () {
      currentScale = parseInt(this.value, 10);
      if (window.BrukAudio) {
        window.BrukAudio.playSlider(currentScale / 4);
      }
      updateEstimator();
    });
  }

  function setupChipGroup(container, callback) {
    if (!container) return;
    const buttons = container.querySelectorAll('.chip-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', function () {
        buttons.forEach((b) => b.classList.remove('is-active'));
        this.classList.add('is-active');
        playClick();
        callback(this);
        updateEstimator();
      });
    });
  }

  setupChipGroup(motionChips, (btn) => {
    currentMotionMult = parseFloat(btn.dataset.mult) || 1.0;
  });

  setupChipGroup(backendChips, (btn) => {
    currentBackendCost = parseInt(btn.dataset.cost, 10) || 0;
  });

  setupChipGroup(tierChips, (btn) => {
    currentTierMult = btn.dataset.tier === 'priority' ? 1.25 : 1.0;
  });

  // Apply scope to contact form pre-fill
  if (applyScopeBtn) {
    applyScopeBtn.addEventListener('click', function () {
      playClick();
      const scopeData = scopeConfig[currentScale] || scopeConfig[2];
      const projectScope = document.getElementById('projectScope');
      if (projectScope) {
        projectScope.value = `[Configured Scope]\n• Platform: ${scopeData.label}\n• Estimated Budget: ${estimatedPriceEl.textContent}\n• Timeline: ${scopeData.weeks}\n• Architecture: ${recommendedStackEl.textContent}\n\nProject details: `;
      }
    });
  }

  updateEstimator();

  /* =========================================================
     9. Contact Form Budget Chips & Transmission
     ========================================================= */
  const budgetChips = document.querySelectorAll('.budget-chip');
  let selectedBudget = '₹50k - ₹1L';

  budgetChips.forEach((chip) => {
    chip.addEventListener('click', function () {
      budgetChips.forEach((c) => c.classList.remove('is-active'));
      this.classList.add('is-active');
      selectedBudget = this.dataset.budget;
      playClick();
    });
  });

  const projectForm = document.getElementById('projectForm');
  const submitBtn = document.getElementById('submitBtn');

  if (projectForm) {
    projectForm.addEventListener('submit', function (e) {
      e.preventDefault();
      playClick();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Transmitting Brief... <span style="display:inline-block; animation:spin 1s linear infinite;">✦</span>';
      }

      setTimeout(function () {
        if (window.BrukAudio) window.BrukAudio.playThemeSwitch();

        projectForm.innerHTML = `
          <div style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:14px; padding:36px; text-align:center;">
            <div style="width:52px; height:52px; border-radius:50%; background:#10b981; color:#fff; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto; font-size:1.6rem; box-shadow:0 0 20px rgba(16, 185, 129, 0.5);">✓</div>
            <h3 style="font-size:1.6rem; margin-bottom:8px; color:#fff;">Brief Transmitted Successfully</h3>
            <p style="color:var(--text-secondary); line-height:1.6; margin-bottom:20px;">
              Thank you for reaching out! Our lead engineering partner will review your project requirements and respond within <strong>12 hours</strong>.
            </p>
            <div style="font-family:var(--font-mono); font-size:0.8rem; color:var(--cyan);">Priority Queue Reference: #BRUK-${Math.floor(1000 + Math.random() * 9000)}</div>
          </div>
        `;
      }, 1200);
    });
  }
});
