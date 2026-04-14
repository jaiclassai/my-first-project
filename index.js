/*
  ============================================================
  FILE        : assets/js/index.js
  PROJECT     : aiGodess NEET Platform
  PURPOSE     : Homepage interactivity for index.html
  VERSION     : 2.0
  CODE RULES  : Numbered sections · Strict mode · No globals
  ============================================================

  TABLE OF CONTENTS
  1.00  STRICT MODE
  2.00  NAV — Scroll behaviour and hamburger menu
  3.00  HERO CAROUSEL — Auto-play and dot navigation
  4.00  FAQ ACCORDION — Open / close panels
  5.00  RAZORPAY PAYMENT BUTTON — Redirect to subscribe page
  6.00  STUDY THEATRE — Video player, playlist, pillar filter
    6.01  Play main trailer on overlay click
    6.02  Select video from playlist
    6.03  Coming soon click handler
    6.04  Filter playlist by pillar
    6.05  Toast notification
    6.06  Initialise first chip active state
  7.00  SCROLL ANIMATIONS — IntersectionObserver fade-up
  ============================================================
*/


/* ============================================================
   1.00  STRICT MODE
   ============================================================ */

"use strict";


/* ============================================================
   2.00  NAV — Scroll behaviour and hamburger menu
   ============================================================ */

(function initNav() {

  var nav       = document.getElementById('nav');
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');

  /* 2.01  Scroll: add/remove .scrolled class */
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  /* 2.02  Hamburger: toggle mobile nav */
  hamburger.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  /* 2.03  Close mobile nav when any link is clicked */
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

})();


/* ============================================================
   3.00  HERO CAROUSEL — Auto-play and dot navigation
   ============================================================ */

(function initCarousel() {

  var carousel = document.getElementById('careerCarousel');
  var dotsWrap = document.getElementById('carouselDots');
  if (!carousel || !dotsWrap) return;

  var slides  = carousel.querySelectorAll('.career-slide');
  var current = 0;
  var timer;

  /* 3.01  Build navigation dots */
  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.className = 'cdot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); });
    dotsWrap.appendChild(dot);
  });

  /* 3.02  Go to specific slide */
  function goTo(index) {
    slides[current].classList.remove('active');
    dotsWrap.querySelectorAll('.cdot')[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dotsWrap.querySelectorAll('.cdot')[current].classList.add('active');
  }

  /* 3.03  Advance to next slide */
  function next() {
    goTo((current + 1) % slides.length);
  }

  /* 3.04  Start auto-play timer */
  function startTimer() {
    timer = setInterval(next, 3000);
  }

  /* 3.05  Pause on hover, resume on leave */
  carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
  carousel.addEventListener('mouseleave', startTimer);

  startTimer();

})();


/* ============================================================
   4.00  FAQ ACCORDION — Open / close panels
   ============================================================ */

(function initFAQ() {

  document.querySelectorAll('.faq__item').forEach(function (item) {

    var btn = item.querySelector('.faq__q');

    btn.addEventListener('click', function () {

      var isOpen = item.classList.contains('open');

      /* 4.01  Close all open items */
      document.querySelectorAll('.faq__item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });

      /* 4.02  Open clicked item (if it was previously closed) */
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }

    });

  });

})();


/* ============================================================
   5.00  RAZORPAY PAYMENT BUTTON — Redirect to subscribe page
   ============================================================ */

(function initRazorpay() {

  var btn = document.getElementById('razorpayBtn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    window.location.href = '/neet-sonnet/neet-subscribe.html';
  });

})();


/* ============================================================
   6.00  STUDY THEATRE — Video player, playlist, pillar filter
   ============================================================ */

(function initStudyTheatre() {

  /* 6.01  Play main trailer on overlay click */
  window.playMainVideo = function () {
    var overlay = document.getElementById('playerOverlay');
    var iframe  = document.getElementById('ytIframe');
    if (!overlay || !iframe) return;
    iframe.src = iframe.getAttribute('data-src');
    overlay.classList.add('hidden');
  };

  /* 6.02  Select video from playlist */
  window.selectVideo = function (item) {

    if (item.getAttribute('data-coming') === 'true') {
      comingSoonClick(item);
      return;
    }

    var videoId = item.getAttribute('data-video-id');
    var title   = item.getAttribute('data-title');

    /* Update iframe src */
    var iframe  = document.getElementById('ytIframe');
    var overlay = document.getElementById('playerOverlay');
    if (iframe)  iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&color=white';
    if (overlay) overlay.classList.add('hidden');

    /* Update now playing bar */
    var npTitle = document.getElementById('npTitle');
    if (npTitle) npTitle.textContent = title;

    /* Update active state in playlist */
    document.querySelectorAll('.playlist-item').forEach(function (el) {
      el.classList.remove('active');
    });
    item.classList.add('active');

    /* Scroll player into view on mobile */
    var player = document.getElementById('mainPlayer');
    if (player && window.innerWidth < 900) {
      player.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  };

  /* 6.03  Coming soon click handler */
  window.comingSoonClick = function (item) {
    var titleEl = item.querySelector('.pi-title');
    var title   = titleEl ? titleEl.textContent : 'this video';
    showTheatreToast('Coming soon: "' + title.substring(0, 40) + '..." Subscribe on YouTube to be notified.');
  };

  /* 6.04  Filter playlist by pillar */
  window.filterPillar = function (pillar) {

    var items = document.querySelectorAll('.playlist-item');
    var count = 0;

    items.forEach(function (item) {
      var p    = item.getAttribute('data-pillar');
      var show = (pillar === 'all') || (p === pillar) || (p === 'all');
      item.style.display = show ? '' : 'none';
      if (show) count++;
    });

    /* Update playlist count */
    var countEl = document.getElementById('playlistCount');
    if (countEl) countEl.textContent = count + ' video' + (count !== 1 ? 's' : '');

    /* Update chip active state */
    document.querySelectorAll('.pillar-chip').forEach(function (chip) {
      chip.classList.remove('active-chip');
      chip.style.opacity = '0.65';
    });
    var activeChip = document.querySelector('.pillar-chip[onclick*="' + pillar + '"]');
    if (activeChip) {
      activeChip.classList.add('active-chip');
      activeChip.style.opacity = '1';
    }

  };

  /* 6.05  Toast notification */
  function showTheatreToast(msg) {
    var existing = document.getElementById('theatreToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'theatreToast';
    toast.setAttribute('role', 'alert');
    toast.style.cssText = [
      'position:fixed', 'bottom:90px', 'left:50%', 'transform:translateX(-50%)',
      'background:#1a1a2e', 'border:1px solid rgba(255,0,0,0.3)', 'border-radius:50px',
      'padding:12px 22px', 'font-size:0.82rem', 'color:rgba(255,255,255,0.9)',
      'z-index:9998', 'max-width:90vw', 'text-align:center',
      'box-shadow:0 8px 32px rgba(0,0,0,0.5)',
      'transition:opacity 0.4s'
    ].join(';');
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function () { toast.style.opacity = '0'; }, 3200);
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 3700);
  }

  /* 6.06  Initialise first chip as active */
  var firstChip = document.querySelector('.pillar-chip');
  if (firstChip) firstChip.style.opacity = '1';

})();


/* ============================================================
   7.00  SCROLL ANIMATIONS — IntersectionObserver fade-up
   ============================================================ */

(function initScrollAnims() {

  if (!('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll(
    '.module-card, .feature-card, .road-card, .career-card, .aaa__card, .aaa__step, .contact-card'
  );

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

})();
