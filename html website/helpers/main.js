/* ============================================================
   EMPTY SANDBOX — MAIN.JS
   Global JavaScript: Slicknav init, scroll listeners, utilities
   ============================================================ */

$(document).ready(function () {

  // ── Slicknav Mobile Menu ──────────────────────────────────
  // Clones the desktop #main-menu ul and converts it into
  // a hamburger menu for screens <= 768px
  $('#main-menu ul').slicknav({
    prependTo: '#site-header',
    label: '',
    allowParentLinks: true,
    closeOnClick: true,
    animations: 'jquery',
    speed: 200,
    init: function () {
      // Ensure the slicknav button is accessible
      $('.slicknav_btn').attr('aria-label', 'Toggle Navigation');
    }
  });

  // ── Sticky Header Scroll Class ────────────────────────────
  // Adds a "scrolled" class to the header once the user
  // scrolls past the initial position for shadow/bg change
  var $header = $('#site-header');

  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 10) {
      $header.addClass('scrolled');
    } else {
      $header.removeClass('scrolled');
    }
  });

  // ── Active Nav Link Highlighting ──────────────────────────
  // Automatically marks the current page's nav link as active
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  $('#main-menu ul li a').each(function () {
    var linkHref = $(this).attr('href');
    if (linkHref === currentPage) {
      $(this).addClass('active');
    }
  });

  // ── Smooth Reveal on Scroll ───────────────────────────────
  // Adds .is-visible to elements with [data-reveal] once they
  // enter the viewport, triggering CSS entrance animations
  function revealOnScroll() {
    $('[data-reveal]').each(function () {
      var elementTop = $(this).offset().top;
      var viewportBottom = $(window).scrollTop() + $(window).height();
      if (elementTop < viewportBottom - 60) {
        $(this).addClass('is-visible');
      }
    });
  }

  $(window).on('scroll', revealOnScroll);
  revealOnScroll(); // Run on page load for elements already in view

});
