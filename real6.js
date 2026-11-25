/* Page 6, real-robot section: one player that shows the whole course of the episode in one place.
   Picture: the head camera (seeked frame by frame), the boxes of the perception step and the four numbered arrows of the plan
   (both only while nothing has moved, before the first motion), and the wrist camera of the active hand while the policy has control.
   In the left column, under the headline and the instruction: Perception / Plan / Execution, with the active plan row highlighted
   and its sub-steps (move, hand over, check, place). The state (data-phase, is-idle) is set on the player and on #realTop,
   the block that holds both columns, so that the list outside the player follows it.
   Under the picture: the ownership bar with Play and the playback speed (24x, 48x).
   Before the first Play the player shows everything at once (boxes, arrows, both plan rows). During playback the clock holds
   briefly on the look step and on the plan, so that the boxes and the arrows can be read.
   The clip and the bar end when the right hand releases the orange. No outcome mark and no totals are shown for this episode. */
(function () {
  'use strict';
  var B = window.B6, $ = B.$, $$ = B.$$, el = B.el, clamp = B.clamp, pct = B.pct;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var HOLD_LOOK = 1200, HOLD_PLAN = 2400;   /* ms of wall time the clock holds on the look step and on the plan */

  /* round tick labels only (0 s, 120 s, ...), never the end value */
  function axis(max) {
    var ax = el('div', 'axis'), t, e;
    for (t = 0; t < max - 30; t += 120) { e = el('span', 'axis-t', t + ' s'); e.style.left = pct(t, max); ax.appendChild(e); }
    return ax;
  }
  function svg(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function initReal() {
    var EP = window.BAPL_REAL, root = $('#realPlayer'), top = $('#realTop');
    if (!root) return;
    if (!EP || !EP.policy || !EP.frames) { root.hidden = true; if ($('#realList')) $('#realList').hidden = true; return; }   /* data missing: the headline stays, the player and its list go */
    var P = EP.player || null;
    var MAX = EP.end, st = { t: 0, playing: false, speed: 24, last: 0, ready: false, started: false, holdUntil: 0, key: '' };
    var head = { video: $('#realHead'), ep: EP, cur: -1, target: 0 };
    var wristBox = $('#realWrist'), wv = $$('video', wristBox);
    var wrists = (EP.wrist || []).map(function (w, i) { return { video: wv[i], ep: w, cur: -1, target: 0 }; });
    var barRoot = $('#realBar'), playBtn = $('#realPlay'), playLab = $('span', playBtn);
    var parts = {}, rows = $$('#realList .rr-rows > li'), subs = $$('#realList .rr-subs > li');
    $$('#realList .rr-part').forEach(function (p) { parts[p.getAttribute('data-p')] = p; });

    var bar = B.buildBar(EP, MAX, {});
    barRoot.appendChild(bar);
    var hd = el('div', 'rr-head'); $('.obar-in', bar).appendChild(hd);
    barRoot.appendChild(axis(MAX));
    var AMAX = Math.floor(MAX / 10) * 10;   /* rounded down: the end value of the cut is not exposed */
    barRoot.setAttribute('aria-valuemax', String(AMAX));

    /* overlays in head-image pixels: the clip shows the rows crop[1] .. crop[1] + crop[3] of the 640 x 480 image */
    var ov = $('#realOv'), arw = $('#realArrows');
    if (P) {
      var C = P.crop, X = function (x) { return ((x - C[0]) / C[2] * 100) + '%'; }, Y = function (y) { return ((y - C[1]) / C[3] * 100) + '%'; };
      P.boxes.forEach(function (b) {
        var d = el('div', 'rr-box' + (b.tag === 'above' ? ' is-above' : ''));
        d.style.left = X(b.xyxy[0]); d.style.top = Y(b.xyxy[1]);
        d.style.width = ((b.xyxy[2] - b.xyxy[0]) / C[2] * 100) + '%'; d.style.height = ((b.xyxy[3] - b.xyxy[1]) / C[3] * 100) + '%';
        d.appendChild(el('span', null, b.name));
        ov.appendChild(d); ov.appendChild(document.createTextNode(' '));   /* spaces: the text of the document reads as separate words */
      });
      P.arrows.forEach(function (a, i) {
        var g = svg('g', { 'class': 'rr-arr', style: '--d:' + (i * 0.25).toFixed(2) + 's' });
        g.appendChild(svg('path', { 'class': 'halo', d: a.d, pathLength: 1 }));
        g.appendChild(svg('path', { 'class': 'ln', d: a.d, pathLength: 1 }));
        g.appendChild(svg('polygon', { 'class': 'hd', points: a.head }));
        arw.appendChild(g);
        var n = el('span', 'rr-num', String(a.n));
        n.style.left = X(a.num[0]); n.style.top = Y(a.num[1]); n.style.setProperty('--d', (i * 0.25).toFixed(2) + 's');
        ov.appendChild(n); ov.appendChild(document.createTextNode(' '));
      });
    } else {
      $('#realList').hidden = true;
    }

    function load() {
      if (st.ready || !B.mayLoad()) return;     /* not while the loading screen is up: load6.js fetches in page order */
      st.ready = true;
      [head].concat(wrists).forEach(function (tr) { B.want(tr.video); });
    }
    function seek(tr, f) {
      tr.target = f;
      var v = tr.video;
      if (f === tr.cur) return;
      if (v.readyState < 1) { if (!st.quiet) load(); return; }
      if (v.seeking) return;
      tr.cur = f;
      try { v.currentTime = (f + 0.5) / tr.ep.fps; } catch (e) {}
    }
    [head].concat(wrists).forEach(function (tr) {
      tr.video.addEventListener('loadedmetadata', function () { seek(tr, tr.target); });
      tr.video.addEventListener('seeked', function () { if (tr.target !== tr.cur) seek(tr, tr.target); });
    });

    /* state of the list and the overlays at time t; idle (before the first Play) shows everything */
    function stateAt(t) {
      if (!P) return null;
      var idle = !st.started;
      var phase = idle ? 'idle' : t < P.look_t ? 'pre' : t < P.plan_t ? 'look' : t < P.move_t ? 'plan' : 'exec';
      var row = -1, show = 0, k, s = [];
      for (k = 0; k < P.rows.length; k++) { if (t >= P.rows[k].t0) show = k; if (t >= P.rows[k].t0 && t < P.rows[k].t1) row = k; }
      if (phase === 'exec') {
        P.rows[show].sub.forEach(function (x) { s.push(t >= x.t1 ? 'd' : t >= x.t0 ? 'c' : ''); });
      }
      return {
        phase: phase,
        boxes: idle || (t >= P.look_t && t < P.move_t),
        arrows: idle || (t >= P.plan_t && t < P.move_t),
        rows: P.rows.map(function (r, i) { return phase !== 'exec' ? '' : i === row ? 'c' : t >= r.t1 ? 'd' : ''; }),
        subs: s
      };
    }
    function render() {
      var t = st.t;
      hd.style.left = pct(t, MAX);
      var at = Math.min(Math.round(t), AMAX);
      barRoot.setAttribute('aria-valuenow', String(at));
      barRoot.setAttribute('aria-valuetext', at + ' s');
      seek(head, B.frameAt(EP, t));
      /* wrist camera of the active hand, only while the policy has control; it sits in the corner away from that hand */
      var wi = -1;
      wrists.forEach(function (w, i) { if (t >= w.ep.t0 && t < w.ep.t1) wi = i; });
      if (wi !== st.wrist) {
        st.wrist = wi;
        wristBox.hidden = wi < 0;
        wristBox.classList.toggle('is-left', wi >= 0 && wrists[wi].ep.arm === 'right');
        wrists.forEach(function (w, i) { w.video.hidden = i !== wi; });
      }
      if (wi >= 0) seek(wrists[wi], B.frameAt(wrists[wi].ep, t));
      var s = stateAt(t);
      if (!s) return;
      var key = JSON.stringify(s);
      if (key === st.key) return;
      st.key = key;
      [root, top].forEach(function (e) { if (!e) return; e.setAttribute('data-phase', s.phase); e.classList.toggle('is-idle', s.phase === 'idle'); });
      root.classList.toggle('bx-on', s.boxes);
      root.classList.toggle('ar-on', s.arrows);
      Object.keys(parts).forEach(function (k) { parts[k].classList.toggle('is-on', s.phase === k || (s.phase === 'exec' && k === 'exec')); });
      rows.forEach(function (li, i) { li.className = s.rows[i] === 'c' ? 'is-cur' : s.rows[i] === 'd' ? 'is-done' : ''; });
      subs.forEach(function (li, i) { li.className = s.subs[i] === 'c' ? 'is-cur' : s.subs[i] === 'd' ? 'is-done' : ''; });
    }
    function setLabel() {
      playLab.textContent = st.playing ? 'Pause' : (st.t >= MAX - 0.01 ? 'Replay' : 'Play');
      playBtn.setAttribute('aria-label', st.playing ? 'Pause' : 'Play');
      root.classList.toggle('is-playing', st.playing);
    }
    function tick(now) {
      if (!st.playing) return;
      var dt = Math.min(0.1, (now - st.last) / 1000); st.last = now;
      if (now < st.holdUntil) { requestAnimationFrame(tick); return; }
      var t0 = st.t, t1 = t0 + dt * st.speed;
      /* hold on the look step and on the plan, so that the boxes and the arrows can be read */
      if (P) {
        [[P.look_t, HOLD_LOOK], [P.plan_t, HOLD_PLAN]].forEach(function (h) {
          if (t0 < h[0] && t1 >= h[0] && st.holdUntil < now) { t1 = h[0]; st.holdUntil = now + h[1]; }
        });
      }
      st.t = t1;
      if (st.t >= MAX) { st.t = MAX; st.playing = false; setLabel(); render(); return; }
      render();
      requestAnimationFrame(tick);
    }
    function start() { if (!st.started) { st.started = true; st.key = ''; } }
    function play() {
      if (st.playing) return;
      if (st.t >= MAX - 0.01) st.t = 0;
      start(); load(); st.holdUntil = 0;
      st.playing = true; st.last = performance.now(); setLabel(); render(); requestAnimationFrame(tick);
    }
    function pause() { st.playing = false; st.holdUntil = 0; setLabel(); }
    function setT(t) { start(); st.t = clamp(t, 0, MAX); st.holdUntil = 0; setLabel(); render(); }
    playBtn.addEventListener('click', function () { if (st.playing) pause(); else play(); });
    $$('#realSpeed button').forEach(function (b) {
      b.addEventListener('click', function () {
        st.speed = +b.getAttribute('data-s');
        $$('#realSpeed button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
    /* drag on the bar to scrub; arrow keys step */
    var drag = false, was = false, inn = $('.obar-in', bar);
    function at(ev) { var r = inn.getBoundingClientRect(); setT((ev.clientX - r.left) / r.width * MAX); }
    barRoot.addEventListener('pointerdown', function (ev) {
      if (ev.button) return;
      drag = true; was = st.playing; if (st.playing) pause();
      barRoot.classList.add('is-drag');
      try { barRoot.setPointerCapture(ev.pointerId); } catch (e) {}
      at(ev); barRoot.focus({ preventScroll: true }); ev.preventDefault();
    });
    barRoot.addEventListener('pointermove', function (ev) { if (drag) at(ev); });
    var end = function () { if (!drag) return; drag = false; barRoot.classList.remove('is-drag'); if (was) play(); };
    barRoot.addEventListener('pointerup', end); barRoot.addEventListener('pointercancel', end);
    barRoot.addEventListener('keydown', function (ev) {
      var k = ev.key, step = ev.shiftKey ? 30 : 5;
      if (k === 'ArrowRight' || k === 'ArrowUp') setT(st.t + step);
      else if (k === 'ArrowLeft' || k === 'ArrowDown') setT(st.t - step);
      else if (k === 'Home') setT(0);
      else if (k === 'End') setT(MAX);
      else if (k === ' ' || k === 'Enter') { if (st.playing) pause(); else play(); }
      else return;
      ev.preventDefault();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) load(); else if (st.playing) pause(); });
      }, { rootMargin: '400px 0px' }).observe(root);
    }
    st.wrist = -2;
    /* the first frame is the poster: drawing it must not start the downloads (load6.js fetches the videos in page order) */
    st.quiet = true; render(); st.quiet = false;
    /* handle for scripted checks */
    window.realPlayer = { state: st, setT: setT, play: play, pause: pause, stateAt: stateAt };
  }

  B.parts.push(initReal);
})();
