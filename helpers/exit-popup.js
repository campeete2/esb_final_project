/**
 * EMPTY SANDBOX — Exit Intent Popup
 * ─────────────────────────────────────────────────────────────
 * Logic:
 *   1. contact.html: Set sessionStorage flag that user visited.
 *      When form submits, set "submitted" flag.
 *   2. All other pages: If the user visited contact but did NOT
 *      submit, show the popup on mouse-leave (once per session).
 *   3. The popup is NEVER in the static HTML. It's created here.
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  var KEY_VISITED   = 'esb_contact_visited';
  var KEY_SUBMITTED = 'esb_form_submitted';
  var KEY_SHOWN     = 'esb_exit_shown';

  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // On the hire page: mark as visited
  if (page === 'higher.html') {
    sessionStorage.setItem(KEY_VISITED, '1');

    // If form submits successfully, mark as submitted
    var origFetch = window.fetch;
    window.fetch = function (url, opts) {
      return origFetch.apply(this, arguments).then(function (res) {
        if (String(url).indexOf('submit-form.com') !== -1 && res.ok) {
          sessionStorage.setItem(KEY_SUBMITTED, '1');
        }
        return res;
      });
    };
    return; // Don't run popup logic on the hire page itself
  }

  /* ── Don't show on response or hire pages ─────────────────── */
  if (page === 'response.html' || page === 'higher.html') return;

  /* ── Only show if user came from contact but didn't submit ── */
  if (!sessionStorage.getItem(KEY_VISITED))   return;
  if (sessionStorage.getItem(KEY_SUBMITTED))  return;
  if (sessionStorage.getItem(KEY_SHOWN))      return;

  /* ── Build popup DOM ─────────────────────────────────────── */
  var overlay = document.createElement('div');
  overlay.id = 'exit-overlay';
  overlay.className = 'exit-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'exit-title');
  overlay.innerHTML = [
    '<div class="exit-modal">',
      '<button class="exit-modal-close" id="exit-modal-close" aria-label="Close">&#x2715;</button>',
      '<div class="exit-modal-body">',
        '<h3 id="exit-title">Still interested?</h3>',
        '<p>Leave us your details and we\'ll reach out personally within one business day.</p>',
        '<form class="exit-form" id="exit-intent-form" novalidate>',
          '<input type="text"  id="exit-name"  placeholder="Your name" autocomplete="name">',
          '<input type="email" id="exit-email" placeholder="Your email" required autocomplete="email">',
          '<select id="exit-service">',
            '<option value="" disabled selected>What are you looking to build?</option>',
            '<option value="MVP Development">MVP Development</option>',
            '<option value="Digital Transformation">Digital Transformation</option>',
            '<option value="Custom Tooling">Custom Tooling</option>',
            '<option value="Web Design">Web Design &amp; Rebuild</option>',
            '<option value="Strategy">Strategy &amp; Consulting</option>',
            '<option value="Not sure">Not sure yet</option>',
          '</select>',
          '<button type="submit" class="exit-form-submit">Get in Touch</button>',
        '</form>',
      '</div>',
      '<div class="exit-success" style="display:none;text-align:center;padding:2rem 0">',
        '<div class="exit-check-icon"></div>',
        '<h4>We\'ll be in touch.</h4>',
        '<p style="color:#666;font-size:.875rem;font-weight:300">Expect to hear from us within one business day.</p>',
      '</div>',
    '</div>'
  ].join('');

  document.body.appendChild(overlay);

  /* ── Show / hide helpers ─────────────────────────────────── */
  var triggered = false;

  function showPopup() {
    if (triggered) return;
    triggered = true;
    sessionStorage.setItem(KEY_SHOWN, '1');
    overlay.style.display = 'flex';
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
  }

  function hidePopup() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.style.display = 'none'; }, 250);
  }

  /* ── Triggers ────────────────────────────────────────────── */
  // 1. Mouse leaving viewport from the top edge
  document.addEventListener('mouseleave', function (e) {
    if (e.clientY <= 5) showPopup();
  });

  // 2. Auto-show after 5 s — catches users who navigate via link clicks
  //    rather than moving the mouse to the top of the viewport
  setTimeout(showPopup, 5000);

  /* ── Event handlers ──────────────────────────────────────── */
  var closeBtn = overlay.querySelector('#exit-modal-close');
  closeBtn.addEventListener('click', hidePopup);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) hidePopup();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hidePopup();
  });

  /* ── Form submit ─────────────────────────────────────────── */
  var form = overlay.querySelector('#exit-intent-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = overlay.querySelector('#exit-email').value.trim();
    if (!email) return;

    sessionStorage.setItem(KEY_SUBMITTED, '1');

    fetch('https://submit-form.com/f4zKd7j1Z', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name:    overlay.querySelector('#exit-name').value.trim(),
        email:   email,
        service: overlay.querySelector('#exit-service').value,
        source:  'exit-intent'
      })
    }).catch(function () {}).finally(function () {
      overlay.querySelector('.exit-modal-body').style.display = 'none';
      overlay.querySelector('.exit-success').style.display = 'block';
      setTimeout(hidePopup, 3000);
    });
  });

})();
