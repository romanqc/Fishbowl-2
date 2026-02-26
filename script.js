/* ============================================================
   PERSONS, GIFTS & THE LIVING WORLD — Slideshow Script
   ============================================================ */

(function () {
  const slides    = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap  = document.getElementById('navDots');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  const counter   = document.getElementById('slideCounter');
  const TOTAL     = slides.length;

  let current     = 0;
  let isAnimating = false;

  // --- BUILD DOTS ----------------------------------------- //
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('nav-dot');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(document.querySelectorAll('.nav-dot'));

  // --- GOTO SLIDE ------------------------------------------ //
  function goTo(index, direction = 1) {
    if (isAnimating || index === current) return;
    isAnimating = true;

    const outSlide = slides[current];
    const inSlide  = slides[index];

    // Mark exit direction
    outSlide.classList.add('exit');
    outSlide.classList.remove('active');

    // Set enter direction via inline transform override
    const enterOffset = direction > 0 ? '60px' : '-60px';
    inSlide.style.transform = `translateX(${enterOffset})`;
    inSlide.style.opacity   = '0';
    inSlide.style.pointerEvents = 'none';

    // Force reflow so the initial state is painted before transition
    void inSlide.offsetWidth;

    // Remove style overrides and let CSS transitions handle it
    inSlide.style.transform = '';
    inSlide.style.opacity   = '';
    inSlide.classList.add('active');

    // Clean up after transition
    const duration = 750;
    setTimeout(() => {
      outSlide.classList.remove('exit');
      outSlide.style.transform = '';
      inSlide.style.pointerEvents = '';
      isAnimating = false;
    }, duration);

    current = index;
    updateUI();
  }

  function updateUI() {
    // Counter
    counter.textContent = `${current + 1} / ${TOTAL}`;

    // Dots
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Button states
    prevBtn.style.opacity = current === 0 ? '0.25' : '1';
    nextBtn.style.opacity = current === TOTAL - 1 ? '0.25' : '1';
  }

  // --- BUTTON HANDLERS ------------------------------------ //
  prevBtn.addEventListener('click', () => {
    if (current > 0) goTo(current - 1, -1);
  });

  nextBtn.addEventListener('click', () => {
    if (current < TOTAL - 1) goTo(current + 1, 1);
  });

  // --- KEYBOARD ------------------------------------------- //
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Space') {
      e.preventDefault();
      if (current < TOTAL - 1) goTo(current + 1, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (current > 0) goTo(current - 1, -1);
    } else if (e.key === 'Home') {
      goTo(0, -1);
    } else if (e.key === 'End') {
      goTo(TOTAL - 1, 1);
    }
  });

  // --- TOUCH SWIPE ---------------------------------------- //
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0 && current < TOTAL - 1) goTo(current + 1, 1);
      if (dx > 0 && current > 0)         goTo(current - 1, -1);
    }
  }, { passive: true });

  // --- LIGHTBOX ------------------------------------------- //
  (function () {
    const lightbox   = document.getElementById('lightbox');
    const backdrop   = document.getElementById('lightboxBackdrop');
    const stage      = document.getElementById('lightboxStage');
    const btnPrev    = document.getElementById('lightboxPrev');
    const btnNext    = document.getElementById('lightboxNext');
    const btnClose   = document.getElementById('lightboxClose');
    const pipsWrap   = document.getElementById('lightboxPips');
    const thumbGrid  = document.getElementById('thumbGrid');

    if (!lightbox || !thumbGrid) return;

    // Collect all thumbs and their image data
    const thumbs = Array.from(thumbGrid.querySelectorAll('.thumb'));
    const total  = thumbs.length;
    let current  = 0;

    // Build pip dots
    thumbs.forEach((_, i) => {
      const pip = document.createElement('span');
      pip.className = 'pip' + (i === 0 ? ' active' : '');
      pip.addEventListener('click', () => showImage(i));
      pipsWrap.appendChild(pip);
    });

    const pips = Array.from(pipsWrap.querySelectorAll('.pip'));

    function getImageData(index) {
      const thumb = thumbs[index];
      const img   = thumb.querySelector('img');
      const ph    = thumb.querySelector('.image-placeholder');
      return { img, ph };
    }

    function showImage(index) {
      current = Math.max(0, Math.min(index, total - 1));
      const { img, ph } = getImageData(current);

      // Fade out old content
      const existing = stage.querySelector('img, .lb-placeholder');
      if (existing) existing.classList.add('fading');

      setTimeout(() => {
        stage.innerHTML = '';

        if (img) {
          // Clone the real image for the lightbox
          const el = document.createElement('img');
          el.src = img.src;
          el.alt = img.alt || '';
          stage.appendChild(el);
        } else if (ph) {
          // Show placeholder
          const el = document.createElement('div');
          el.className = 'lb-placeholder';
          el.innerHTML = ph.innerHTML;
          stage.appendChild(el);
        }

        pips.forEach((p, i) => p.classList.toggle('active', i === current));
        btnPrev.disabled = current === 0;
        btnNext.disabled = current === total - 1;
      }, existing ? 150 : 0);
    }

    function openLightbox(index) {
      showImage(index);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Open on thumb click
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => openLightbox(i));
    });

    // Nav buttons
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); showImage(current - 1); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); showImage(current + 1); });

    // Close
    btnClose.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);

    // Keyboard nav inside lightbox
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowRight')  { e.stopPropagation(); showImage(current + 1); }
      if (e.key === 'ArrowLeft')   { e.stopPropagation(); showImage(current - 1); }
    }, true); // capture phase so it intercepts before slide nav
  })();

  // --- INITIAL STATE -------------------------------------- //
  updateUI();

  // Stagger theme cards and panel cards on synthesis/comic slides
  document.querySelectorAll('.theme-card, .panel-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.04}s`;
  });

})();