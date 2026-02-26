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

  // --- INITIAL STATE -------------------------------------- //
  updateUI();

  // Stagger theme cards and panel cards on synthesis/comic slides
  document.querySelectorAll('.theme-card, .panel-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.04}s`;
  });

})();