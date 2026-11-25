/* Boundary-Aware Policy Learning: the entry screen. Loaded first in <body>, so it is up before the page paints.
   The head script of index.html decides what is shown (html.gate-load on a computer, html.gate-phone on a phone); this file builds it.
   - Computer: a large percentage of the page's media fetched so far (load6.js sends it as 'bapl:load'), the ownership bar as the
     progress bar, a line that changes with the progress like the steps of a grasp, and a button to skip. At 100% it says so and steps
     aside; skipping only lifts the screen, the fetching goes on in the background.
   - Phone: a note that the page reads best on a computer, a button to go on, and a button to share or copy the link.
   Checks: &gsim=S spreads the progress over at least S seconds (from file:// everything loads at once), &ghold=P stops it at P percent,
   ?device=phone shows the phone note on a computer; any of them shows the screen again in the same tab. */
(function () {
  var html = document.documentElement, q = location.search;
  if (!html.classList.contains('gate-on')) return;
  var PHONE = html.classList.contains('gate-phone');
  var PREVIEW = /[?&](gate=[a-z]|gsim=|ghold=|device=phone)/.test(q);
  var SIM = +((q.match(/[?&]gsim=(\d+(\.\d+)?)/) || [])[1] || 0), HOLD = (q.match(/[?&]ghold=(\d+)/) || [])[1];
  HOLD = HOLD === undefined ? -1 : Math.min(99, +HOLD) / 100;
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOGO = 'assets/img/logo_funnel.svg', PHOTO = 'assets/img/posters/render_cup_before.jpg';

  /* ------------------------------------------------------------ the wording */
  var C = {
    /* the line changes as the bar passes each share, like a robot doing one grasp */
    stages: [[0, 'Homing both arms'], [12, 'Calibrating the head camera'], [26, 'Segmenting the scene'], [42, 'Planning the approach'],
             [58, 'Handing off to the policy'], [74, 'Grasping'], [90, 'Verifying the grasp']],
    sub: 'Loading assets for a smooth experience.',
    done: 'Grasp verified. Releasing control.',
    skip: 'Skip loading', note: 'Remaining assets keep loading in the background.',
    slow: 'This is taking a while. You can skip; loading continues in the background.',
    phone: { t: 'Best viewed on a computer', b: 'This page is built around scroll-driven videos and wide charts. On a phone they are shown in a simpler form.', go: 'Continue on this phone' }
  };

  /* ------------------------------------------------------------ building */
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function brand() { var p = el('p', 'g-brand'), i = el('img'); i.src = LOGO; i.alt = ''; p.appendChild(i); p.appendChild(el('span', null, 'Boundary-Aware Policy Learning')); return p; }

  var root = el('div', 'gate ' + (PHONE ? 'gate-phone' : 'gate-a'));
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
  var bg = el('img', 'g-bg'); bg.src = PHOTO; bg.alt = ''; root.appendChild(bg); root.appendChild(el('div', 'g-shade'));
  var inner = el('div', 'g-in'); root.appendChild(inner);
  inner.appendChild(brand());

  if (PHONE) {
    root.setAttribute('aria-labelledby', 'gT');
    var t = el('h2', 'g-ph-t', C.phone.t); t.id = 'gT'; inner.appendChild(t);
    inner.appendChild(el('p', 'g-ph-b', C.phone.b));
    var row = el('p', 'g-skip'), go = el('button', 'btn', C.phone.go);
    go.type = 'button'; go.addEventListener('click', function () { leave(false); });
    row.appendChild(go);
    var url = location.href.split(/[?#]/)[0], share = el('button', 'btn g-ghost', navigator.share ? 'Share link' : 'Copy link');
    share.type = 'button';
    share.addEventListener('click', function () {
      if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
      navigator.clipboard.writeText(url).then(function () { share.textContent = 'Link copied'; }, function () { share.hidden = true; });
    });
    if (navigator.share || (navigator.clipboard && window.isSecureContext)) row.appendChild(share);
    inner.appendChild(row);
  } else {
    root.setAttribute('aria-label', 'Loading');
    var p = el('p', 'g-pct'); p.appendChild(el('b', null, '0')); p.appendChild(el('small', null, '%')); inner.appendChild(p);
    var b = el('div', 'g-bar is-zero'); b.appendChild(el('i', 'g-fill')); b.appendChild(el('i', 'g-dot')); inner.appendChild(b);
    var tx = el('div', 'g-text');
    tx.appendChild(el('p', 'g-line')); tx.appendChild(el('p', 'g-sub', C.sub)); tx.appendChild(el('p', 'g-mb'));
    var sl = el('p', 'g-slow', C.slow); sl.hidden = true; tx.appendChild(sl);
    inner.appendChild(tx);
    var sk = el('p', 'g-skip'), sb = el('button', 'btn', C.skip);
    sb.type = 'button'; sb.addEventListener('click', function () { leave(false); });
    sk.appendChild(sb); sk.appendChild(el('span', 'g-note', C.note)); inner.appendChild(sk);
  }
  document.body.insertBefore(root, document.body.firstChild);
  var $ = function (s) { return root.querySelector(s); };
  var nPct = $('.g-pct b'), nBar = $('.g-bar'), nFill = $('.g-fill'), nDot = $('.g-dot'), nLine = $('.g-line'), nMb = $('.g-mb'), nSlow = $('.g-slow');
  if (nBar) { nBar.setAttribute('role', 'progressbar'); nBar.setAttribute('aria-valuemin', '0'); nBar.setAttribute('aria-valuemax', '100'); nBar.setAttribute('aria-label', 'Loading'); }

  /* ------------------------------------------------------------ the page may not scroll while the screen is up */
  var KEYS = { ' ': 1, Spacebar: 1, PageDown: 1, PageUp: 1, End: 1, Home: 1, ArrowDown: 1, ArrowUp: 1 }, y0 = window.scrollY || 0;
  function block(e) { e.preventDefault(); }
  function onKey(e) {
    if (e.key === 'Escape' && !PHONE) { leave(false); return; }
    if (KEYS[e.key] && !(e.target.tagName === 'BUTTON' && root.contains(e.target) && (e.key === ' ' || e.key === 'Spacebar'))) e.preventDefault();
  }
  function hold() { if (window.scrollY !== y0) window.scrollTo({ top: y0, behavior: 'instant' }); }
  var opts = { passive: false, capture: true };
  window.addEventListener('wheel', block, opts); window.addEventListener('touchmove', block, opts);
  window.addEventListener('keydown', onKey, true); window.addEventListener('scroll', hold);

  var gone = false;
  function leave(done) {
    if (gone) return;
    gone = true;
    window.removeEventListener('wheel', block, opts); window.removeEventListener('touchmove', block, opts);
    window.removeEventListener('keydown', onKey, true); window.removeEventListener('scroll', hold);
    if (!PREVIEW) try { sessionStorage.setItem(PHONE ? 'bapl-phone-ok' : 'bapl-entered', done ? 'done' : 'skipped'); } catch (e) {}
    if (root.contains(document.activeElement)) document.activeElement.blur();
    root.classList.add('is-out');
    setTimeout(function () {
      html.classList.remove('gate-on', 'gate-load', 'gate-phone');
      if (root.parentNode) root.parentNode.removeChild(root);
    }, REDUCE ? 0 : 460);
  }
  if (PHONE) return;

  /* ------------------------------------------------------------ progress */
  var L = null, t0 = performance.now(), shown = 0, lastGot = -1, lastMove = t0, doneAt = 0, ticks = false;
  document.addEventListener('bapl:load', function (e) { L = e.detail; });

  function mb(n) { return (n / 1e6).toFixed(1); }
  function stageLine(s) {
    var line = C.stages[0][1];
    C.stages.forEach(function (st) { if (s * 100 >= st[0]) line = st[1]; });
    return line;
  }
  function setLine(text, ell) {
    if (nLine._t === text + ell) return;
    nLine._t = text + ell; nLine.textContent = '';
    nLine.appendChild(el('span', ell ? 'g-ell' : null, text));
  }
  /* ticks on the bar where each part of the page begins (by bytes) */
  function drawTicks() {
    if (ticks || !L || !L.total) return;
    ticks = true;
    var acc = 0;
    L.parts.forEach(function (p, i) {
      if (i > 0 && p.total > 0 && acc > 0) { var k = el('i', 'g-tick'); k.style.left = (acc / L.total * 100).toFixed(2) + '%'; nBar.appendChild(k); }
      acc += p.total;
    });
  }

  function frame(now) {
    if (gone) return;
    var real = L ? L.p : 0, sim = SIM ? Math.min(1, (now - t0) / (SIM * 1000)) : 1, target = Math.min(real, sim);
    if (HOLD >= 0) target = Math.min(target, HOLD);
    var finished = L && L.done && sim >= 1 && HOLD < 0;
    if (finished) target = 1;
    shown = REDUCE ? target : shown + (target - shown) * 0.14;
    if (target - shown < 0.002) shown = target;
    var n = finished && shown >= 0.999 ? 100 : Math.min(99, Math.floor(shown * 100));
    if (nPct.textContent !== String(n)) { nPct.textContent = n; nBar.setAttribute('aria-valuenow', n); }
    nFill.style.width = 'calc(' + (shown * 100).toFixed(2) + '% + 3px)'; nDot.style.left = (shown * 100).toFixed(2) + '%';
    nBar.classList.toggle('is-zero', shown < 0.004);
    if (L) {
      drawTicks();
      var text = mb(Math.min(L.got, L.total * shown)) + ' of ' + mb(L.total) + ' MB';
      if (nMb.textContent !== text) nMb.textContent = text;
      if (L.got !== lastGot) { lastGot = L.got; lastMove = now; }
    }
    if (n === 100) {
      setLine(C.done, false);
      if (!doneAt) { doneAt = now; root.classList.add('is-done'); }
      if (now - doneAt > 650) { leave(true); return; }
    } else setLine(stageLine(shown), true);
    if (nSlow.hidden && ((now - t0 > 25000 && shown < 0.9) || (now - lastMove > 12000 && L && !L.done))) nSlow.hidden = false;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
