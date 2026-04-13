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
    $header.toggleClass('scrolled', $(window).scrollTop() > 10);
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

});
