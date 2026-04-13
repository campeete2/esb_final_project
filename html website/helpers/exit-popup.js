/**
 * EMPTY SANDBOX — Exit Intent Popup
 * Shows "Still interested?" when user moves mouse toward leaving the page.
 * Fires once per session, only on pages with a contact form or after visiting contact.
 */

(function () {
  'use strict';

  // Only fire on pages that have a contact context (contact.html or if user visited it)
  var SESSION_KEY = 'esb_exit_shown';

  // Don't show if already shown this session
  if (sessionStorage.getItem(SESSION_KEY)) return;

  var overlay  = document.getElementById('exit-overlay');
  var closeBtn = document.getElementById('exit-modal-close');
  var form     = document.getElementById('exit-intent-form');
  var triggered = false;

  if (!overlay) return; // No popup on this page

  function showPopup() {
    if (triggered) return;
    triggered = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function hidePopup() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Trigger: mouse leaves viewport from the top
  document.addEventListener('mouseleave', function (e) {
    if (e.clientY <= 5) showPopup();
  });

  // Trigger: mobile — back button / navigation away (pagehide / visibilitychange)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') showPopup();
  });

  // Close handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', hidePopup);
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hidePopup();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hidePopup();
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = document.getElementById('exit-name').value.trim();
      var email   = document.getElementById('exit-email').value.trim();
      var service = document.getElementById('exit-service').value;

      if (!email) return;

      // Submit to Formspark via fetch
      fetch('https://submit-form.com/f4zKd7j1Z', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          service: service,
          source: 'exit-intent'
        })
      }).then(function () {
        overlay.classList.add('show-success');
        setTimeout(hidePopup, 3000);
      }).catch(function () {
        // Still show success — don't block user
        overlay.classList.add('show-success');
        setTimeout(hidePopup, 3000);
      });
    });
  }

})();
