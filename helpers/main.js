/* ============================================================
   EMPTY SANDBOX — MAIN.JS
   Global JS: custom mobile menu, scroll listener, active nav,
   scroll-reveal utility
   ============================================================ */

$(document).ready(function () {

  // ── Active Nav Link Highlighting ──────────────────────────
  // Marks both desktop and mobile nav links for the current page
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  $('#main-menu .nav-pill-group li a, .mobile-nav ul li a').each(function () {
    if ($(this).attr('href') === currentPage) {
      $(this).addClass('active');
    }
  });

  // ── Sticky Header Scroll Class ────────────────────────────
  var $header = $('#site-header');

  $(window).on('scroll.header', function () {
    $header.toggleClass('is-scrolled', $(window).scrollTop() > 20);
  });

  // ── Custom Mobile Menu ─────────────────────────────────────
  var $toggle   = $('#nav-toggle');
  var $menu     = $('#mobile-menu');
  var $close    = $('#mobile-menu-close');

  function openMenu() {
    $menu.addClass('is-open');
    $toggle.addClass('is-open');
    $toggle.attr('aria-expanded', 'true');
    $menu.attr('aria-hidden', 'false');
    $('body').css('overflow', 'hidden');
    // Shift focus to close button for accessibility
    setTimeout(function() { $close.focus(); }, 50);
  }

  function closeMenu() {
    $menu.removeClass('is-open');
    $toggle.removeClass('is-open');
    $toggle.attr('aria-expanded', 'false');
    $menu.attr('aria-hidden', 'true');
    $('body').css('overflow', '');
    $toggle.focus();
  }

  $toggle.on('click', openMenu);
  $close.on('click', closeMenu);

  // Close when clicking the backdrop (outside the card)
  $menu.on('click', function (e) {
    if ($(e.target).is($menu)) closeMenu();
  });

  // Close on Escape key
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $menu.hasClass('is-open')) closeMenu();
  });

  // Close when a mobile nav link is clicked
  $('.mobile-nav a, .mobile-cta-btn').on('click', closeMenu);

  // ── Scroll Reveal ─────────────────────────────────────────
  // Adds .is-visible to [data-reveal] elements when they enter viewport
  function revealOnScroll() {
    $('[data-reveal]').each(function () {
      if ($(this).offset().top < $(window).scrollTop() + $(window).height() - 60) {
        $(this).addClass('is-visible');
      }
    });
  }

  $(window).on('scroll.reveal', revealOnScroll);
  revealOnScroll(); // Run immediately for elements already in view

  // ── How We Work — unified scroll handler ──
  // Handles: card scale/opacity stacking, per-card bg color shift,
  // last-card exit scale, and bg blend to white on exit.
  // All in one rAF loop to prevent the two phases from fighting each other.
  (function () {
    var cards = document.querySelectorAll('.hww-card');
    if (!cards.length) return;

    var section = document.getElementById('how-we-work');

    // RGB peak colour the section bg shifts toward as each card pins.
    // Kept light and airy — pastel tints rather than full saturation.
    var BG = [
      [232, 218, 252],  // base:   soft lavender
      [218, 224, 252],  // card 1: light periwinkle
      [252, 218, 238],  // card 2: light rose
      [222, 218, 252],  // card 3: light violet
      [250, 218, 250],  // card 4: light lilac
      [218, 226, 252],  // card 5: light blue-indigo
      [252, 215, 244],  // card 6: light pink-magenta
    ];

    var SCALE_STEP    = 0.030;
    var OPACITY_STEP  = 0.08;
    var MIN_SCALE     = 0.82;
    var MIN_OPACITY   = 0.45;
    var TRANSITION_PX = 500;
    var ticking       = false;

    function update() {
      if (window.innerWidth <= 900) {
        cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; });
        ticking = false;
        return;
      }

      // ── 1. Arrival progress for every card (0 = far, 1 = pinned) ──
      var arrivals = [];
      for (var j = 0; j < cards.length; j++) {
        var rect = cards[j].getBoundingClientRect();
        var st = parseInt(window.getComputedStyle(cards[j]).top, 10) || 140;
        var p  = 1 - Math.min(1, Math.max(0, (rect.top - st) / TRANSITION_PX));
        p = p * p * (3 - 2 * p);
        arrivals[j] = p;
      }

      // ── 2. Last-card exit progress (0 while pinned, 1 when scrolled away) ──
      var last     = cards[cards.length - 1];
      var lastR    = last.getBoundingClientRect();
      var lastST   = parseInt(window.getComputedStyle(last).top, 10) || 140;
      var cardH    = last.offsetHeight || 600;
      var exitProg = Math.max(0, Math.min(1, (lastST - lastR.top) / (cardH * 0.8)));

      // ── 3. Section background colour ──
      if (section) {
        var r, g, b;
        if (exitProg > 0) {
          // Blend last card's colour → white as it scrolls away
          var lc = BG[BG.length - 1];
          r = Math.round(lc[0] + (255 - lc[0]) * exitProg);
          g = Math.round(lc[1] + (255 - lc[1]) * exitProg);
          b = Math.round(lc[2] + (255 - lc[2]) * exitProg);
        } else {
          // Shift hue per card arrival
          var total = 0;
          for (var k = 0; k < arrivals.length; k++) { total += arrivals[k]; }
          var pos = Math.min(total, BG.length - 1.001);
          var ci  = Math.floor(pos), ni = Math.min(ci + 1, BG.length - 1);
          var t   = pos - ci; t = t * t * (3 - 2 * t);
          var fc  = BG[ci], tc = BG[ni];
          r = Math.round(fc[0] + (tc[0] - fc[0]) * t);
          g = Math.round(fc[1] + (tc[1] - fc[1]) * t);
          b = Math.round(fc[2] + (tc[2] - fc[2]) * t);
        }
        section.style.setProperty('--hww-mid', 'rgb(' + r + ',' + g + ',' + b + ')');
      }

      // ── 4. Scale / opacity for cards 0 → N-2 ──
      for (var i = 0; i < cards.length - 1; i++) {
        var depth = 0;
        for (var k = i + 1; k < cards.length; k++) { depth += arrivals[k]; }
        cards[i].style.transform = 'perspective(1200px) scale(' +
          Math.max(MIN_SCALE,   1 - depth * SCALE_STEP).toFixed(4)   + ')';
        cards[i].style.opacity  =
          Math.max(MIN_OPACITY, 1 - depth * OPACITY_STEP).toFixed(4);
      }

      // ── 5. Last card: scale 1.0 → 0.97 on exit ──
      last.style.transform = 'perspective(1200px) scale(' +
        (1 - exitProg * 0.03).toFixed(4) + ')';

      ticking = false;
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  // ── Logo Text Slide — Anthropic-style scroll-driven retract ──
  // As user scrolls, the wordmark slides left while CSS clip-path
  // crops the SVG from the right. Because the clip acts on rendered
  // pixels (not SVG paint order), it works even though the icon is
  // a transparent outline. Text appears to retract into the icon side.
  (function () {
    var logoSvg = document.getElementById('header-logo-svg');
    var textGroup = document.getElementById('logo-text-paths');
    if (!logoSvg || !textGroup) return;

    var SLIDE_START    = 20;    // px scrolled before animation begins
    var SLIDE_END      = 200;   // px scrolled when text is fully hidden
    // Crop from the right so only the icon remains visible.
    // Icon right edge is at x=2280 in a 5000-wide viewBox → 45.6% visible.
    // So we crop ~54.4% from the right.
    var MAX_CROP_RIGHT = 54.40; // % to crop from the right at full retract

    var ticking = false;

    function updateTextSlide() {
      var scrollY = window.scrollY || window.pageYOffset;
      var progress;

      if (scrollY <= SLIDE_START) {
        progress = 0;
      } else if (scrollY >= SLIDE_END) {
        progress = 1;
      } else {
        progress = (scrollY - SLIDE_START) / (SLIDE_END - SLIDE_START);
      }

      // Smoothstep easing
      progress = progress * progress * (3 - 2 * progress);

      // CSS clip crops rendered pixels from the right — text vanishes
      // at the icon's right edge without ever drifting behind it
      var cropRight = progress * MAX_CROP_RIGHT;
      logoSvg.style.clipPath = 'inset(0 ' + cropRight.toFixed(2) + '% 0 0)';

      // Ensure *zero* wordmark pixels remain visible (even through the
      // icon's transparent interior) once we reach the fully-hidden state.
      if (progress >= 0.999) {
        textGroup.style.opacity = '0';
      } else {
        textGroup.style.opacity = '1';
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateTextSlide);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateTextSlide();

    // Persist scroll so the <head> inline script can pre-paint the correct
    // logo clip-path on the next page load / reload without a flash.
    window.addEventListener('beforeunload', function () {
      try { sessionStorage.setItem('esb_scrollY', window.scrollY || window.pageYOffset); } catch (e) {}
    });
  })();

  // ── Work Deck — Aloha-style fan + click-to-reveal blurb ──
  (function () {
    var deck = document.getElementById('workDeck');
    if (!deck) return;

    var cards = Array.prototype.slice.call(deck.querySelectorAll('.work-deck-card'));
    var activeIdx = -1;

    function setActive(idx) {
      cards.forEach(function (card, i) {
        card.classList.remove('is-active', 'is-behind');
        if (i === idx) {
          card.classList.add('is-active');
        } else if (idx >= 0) {
          card.classList.add('is-behind');
        }
      });
      activeIdx = idx;
    }

    cards.forEach(function (card, i) {
      card.addEventListener('click', function (e) {
        e.stopPropagation();
        setActive(activeIdx === i ? -1 : i);
      });
    });

    document.addEventListener('click', function () {
      if (activeIdx >= 0) setActive(-1);
    });
  })();

});
