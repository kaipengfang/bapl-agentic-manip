/* Page 6, replay: one full-width console. Top line: transport, jumps to the previous / next handoff, the playback speed, the time, the legend.
   Under it the three bars stacked on one time axis with one playhead (name left, bar middle, outcome right, as on the cover),
   then the three head-camera clips side by side with one caption line each, then the agent log, folded, in three columns.
   Nothing is "selected": the three episodes always show the same kind of thing. */
(function () {
  'use strict';
  var B = window.B6, $ = B.$, $$ = B.$$, el = B.el, clamp = B.clamp, pct = B.pct, E = B.E, IDS = B.IDS, TMAX = B.TMAX, CUP = B.CUP, LETTER = B.LETTER;
  var con = { t: 0, playing: false, speed: 12, last: 0, tracks: {}, ready: false, sec: -1 };
  var HANDOFFS = [];

  function readout(id) { return CUP[id].time_s + ' s, ' + CUP[id].calls + ' LLM calls'; }
  /* one short line per step: the command for a handoff, otherwise the first line; scores, chunk counts and planner details are left out */
  function stepLine(s) {
    var lines = s.lines.filter(function (l) { return l !== 'Policy' && !/planner motion|chunk/.test(l); });
    return (lines[0] || '').replace(/\s+\d\.\d+$/, '').replace(/"([^"]*)"/g, '“$1”');
  }
  function boxLabel(s) { return s.replace(/\s+\d\.\d+$/, ''); }   /* names of the detections, without the scores */
  function mark(ok, size) { return B.svgMark(ok).replace(/width="18" height="18"/, 'width="' + size + '" height="' + size + '"'); }

  function initReplay() {
    var bars = $('#tracks'), mons = $('#monitors'), logEl = $('#log');
    var headCol = el('div', 'rx-headcol'), head = el('div', 'rx-head');
    headCol.appendChild(head); con.head = head;

    IDS.forEach(function (id) {
      var ep = E[id], tr = { id: id, ep: ep, cur: -1, target: 0, loading: false, done: null, step: -2, boxes: [] };

      /* row of the bars: name, bar, outcome (three cells of one grid, so that the playhead can span the bar column) */
      var name = el('div', 'rx-name');
      var nb = el('p', 'rx-n'); nb.appendChild(el('b', null, LETTER[id] + ' ' + ep.label));
      name.appendChild(nb);
      name.appendChild(el('small', null, ep.sub));
      var bw = el('div', 'rx-bar'); bw.appendChild(B.buildBar(ep, TMAX, {}));
      var out = el('div', 'rx-out');
      out.innerHTML = '<p class="rx-res">' + mark(ep.ok, 18) + '<span>' + (ep.ok ? 'task succeeds' : 'task fails') + '</span></p><p class="rx-tot">' + readout(id) + '</p>';
      [name, out, bw].forEach(function (c) { bars.appendChild(c); });

      /* head-camera clip */
      var fig = el('figure', 'rx-mon');
      var scr = el('div', 'rx-scr'), v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
      v.preload = 'none'; v.poster = B.ASSETS + ep.poster; v.src = B.ASSETS + ep.video;
      v.tabIndex = -1; v.setAttribute('aria-label', 'Head camera, ' + ep.label);
      scr.appendChild(v);
      var ov = el('div', 'rx-boxes');
      (ep.boxes || []).forEach(function (bx) {
        var d = el('div', 'rx-box');
        d.style.left = (bx.xyxy[0] / 640 * 100) + '%'; d.style.top = (bx.xyxy[1] / 480 * 100) + '%';
        d.style.width = ((bx.xyxy[2] - bx.xyxy[0]) / 640 * 100) + '%'; d.style.height = ((bx.xyxy[3] - bx.xyxy[1]) / 480 * 100) + '%';
        d.appendChild(el('span', null, boxLabel(bx.label))); d.hidden = true;
        ov.appendChild(d); tr.boxes.push({ b: bx, el: d, on: false });
      });
      scr.appendChild(ov);
      scr.appendChild(el('span', 'card rx-tag', LETTER[id]));
      var mk = el('span', 'rx-mark'); mk.innerHTML = mark(ep.ok, 30); scr.appendChild(mk);
      fig.appendChild(scr);
      var cap = el('figcaption', 'rx-cap'); tr.capVerb = el('span', 'rx-verb'); tr.capText = el('span', 'rx-line');
      cap.appendChild(tr.capVerb); cap.appendChild(tr.capText); fig.appendChild(cap);
      mons.appendChild(fig);

      /* agent log, one column per episode, under its clip */
      var col = el('div', 'rx-logcol');
      var lh = el('p', 'rx-loghead'); lh.appendChild(el('b', null, LETTER[id] + ' ' + ep.label)); col.appendChild(lh);
      var task = el('p', 'rx-logtask'); task.appendChild(el('span', 'rx-k', 'task')); task.appendChild(document.createTextNode('“' + ep.task + '”')); col.appendChild(task);
      var ol = el('ol', 'rx-steps');
      tr.logSteps = ep.steps.map(function (s) {
        var li = el('li'), b = el('button'); b.type = 'button';
        b.appendChild(el('span', 'rx-t', Math.round(s.t) + ' s'));
        b.appendChild(el('span', 'rx-v' + (s.kind === 'policy' ? ' is-policy' : ''), s.verb));
        b.appendChild(el('span', 'rx-l', stepLine(s)));
        b.addEventListener('click', function () { setT(s.t); });
        li.appendChild(b); ol.appendChild(li);
        return li;
      });
      col.appendChild(ol);
      logEl.appendChild(col);

      ep.policy.forEach(function (p) { HANDOFFS.push(p[0]); });
      tr.fig = fig; tr.video = v; tr.barEl = $('.obar-in', bw);
      v.addEventListener('loadedmetadata', function () { seek(tr, tr.target); });
      v.addEventListener('seeked', function () { if (tr.target !== tr.cur) seek(tr, tr.target); });
      con.tracks[id] = tr;
    });
    HANDOFFS.sort(function (a, b) { return a - b; });

    var ax = el('div', 'rx-axis'); ax.appendChild(B.buildAxis(TMAX)); bars.appendChild(ax);
    bars.appendChild(headCol);
    bars.setAttribute('aria-valuemax', Math.round(TMAX));
    bindScrub(bars, headCol);

    $('#conPlay').addEventListener('click', togglePlay);
    $('#conPrev').addEventListener('click', function () { jump(-1); });
    $('#conNext').addEventListener('click', function () { jump(1); });
    $$('#conSpeed button').forEach(function (b) {
      b.addEventListener('click', function () {
        con.speed = +b.getAttribute('data-s');
        $$('#conSpeed button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
    bars.addEventListener('keydown', function (ev) {
      var step = ev.shiftKey ? 10 : 1, k = ev.key;
      if (ev.target !== bars) return;
      if (k === 'ArrowRight' || k === 'ArrowUp') setT(con.t + step);
      else if (k === 'ArrowLeft' || k === 'ArrowDown') setT(con.t - step);
      else if (k === 'Home') setT(0);
      else if (k === 'End') setT(TMAX);
      else if (k === ' ' || k === 'Enter') togglePlay();
      else return;
      ev.preventDefault();
    });
    var logBtn = $('#logBtn');
    logBtn.addEventListener('click', function () {
      var open = logEl.hidden;
      logEl.hidden = !open;
      logBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (B.layoutProgress) B.layoutProgress();   /* the page got taller or shorter: move the milestones of the nav */
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) loadAll();
          else if (con.playing) pause();
        });
      }, { rootMargin: '500px 0px' }).observe($('#console'));
    }
    /* the first frame is the poster: drawing it must not start the downloads (load6.js fetches the videos in page order) */
    con.quiet = true; render(); con.quiet = false;
  }
  function loadAll() {
    if (con.ready || con.quiet || !B.mayLoad()) return;
    con.ready = true;
    IDS.forEach(function (id) { var tr = con.tracks[id]; tr.loading = true; B.want(tr.video); });
  }
  function seek(tr, f) {
    /* seek only when the target frame changed and the previous seek has landed; 'seeked' re-applies the latest target */
    tr.target = f;
    var v = tr.video;
    if (f === tr.cur) return;
    if (v.readyState < 1) { if (!tr.loading) loadAll(); return; }
    if (v.seeking) return;
    tr.cur = f;
    try { v.currentTime = (f + 0.5) / tr.ep.fps; } catch (e) {}
  }
  function bindScrub(surface, col) {
    var drag = false, wasPlaying = false;
    function at(ev) { var r = col.getBoundingClientRect(); setT((ev.clientX - r.left) / r.width * TMAX); }
    surface.addEventListener('pointerdown', function (ev) {
      if (ev.button) return;
      var r = col.getBoundingClientRect();
      if (ev.clientX < r.left - 8 || ev.clientX > r.right + 8) return;   /* only the bar column scrubs; names and outcomes stay selectable */
      drag = true; wasPlaying = con.playing; if (con.playing) pause();
      surface.classList.add('is-drag');
      try { surface.setPointerCapture(ev.pointerId); } catch (e) {}
      at(ev);
      surface.focus({ preventScroll: true });
      ev.preventDefault();
    });
    surface.addEventListener('pointermove', function (ev) { if (drag) at(ev); });
    var end = function () { if (!drag) return; drag = false; surface.classList.remove('is-drag'); if (wasPlaying) play(); };
    surface.addEventListener('pointerup', end);
    surface.addEventListener('pointercancel', end);
  }
  function jump(dir) {
    var t = con.t, k, h = null;
    if (dir > 0) { for (k = 0; k < HANDOFFS.length; k++) if (HANDOFFS[k] > t + 0.5) { h = HANDOFFS[k]; break; } }
    else { for (k = HANDOFFS.length - 1; k >= 0; k--) if (HANDOFFS[k] < t - 0.5) { h = HANDOFFS[k]; break; } }
    if (h == null) h = dir > 0 ? TMAX : 0;
    setT(h);
  }
  function setLabel() {
    var lab = con.playing ? 'Pause' : (con.t >= TMAX - 0.01 ? 'Replay' : 'Play');
    $('#conPlayLab').textContent = lab; $('#conPlay').setAttribute('aria-label', con.playing ? 'Pause' : 'Play');
  }
  function play() {
    if (con.playing) return;
    if (con.t >= TMAX - 0.01) con.t = 0;
    loadAll();
    con.playing = true; con.last = performance.now();
    $('#console').classList.add('is-playing');
    setLabel();
    requestAnimationFrame(tick);
  }
  function pause() {
    con.playing = false;
    $('#console').classList.remove('is-playing');
    setLabel();
  }
  function togglePlay() { if (con.playing) pause(); else play(); }
  function tick(now) {
    if (!con.playing) return;
    var dt = Math.min(0.1, (now - con.last) / 1000); con.last = now;
    var t = con.t + dt * con.speed;
    if (t >= TMAX) { con.t = TMAX; pause(); render(); return; }
    con.t = t; render();
    requestAnimationFrame(tick);
  }
  function setT(t) {
    con.t = clamp(t, 0, TMAX);
    if (!con.playing) setLabel();
    render();
  }
  function render() {
    var t = con.t, sec = Math.floor(t);
    con.head.style.left = pct(t, TMAX);
    if (sec !== con.sec) {
      con.sec = sec; $('#conT').textContent = String(sec);
      var te = $('#tracks'); te.setAttribute('aria-valuenow', sec); te.setAttribute('aria-valuetext', sec + ' s');
      $('#conPrev').disabled = !HANDOFFS.some(function (h) { return h < t - 0.5; });
      $('#conNext').disabled = !HANDOFFS.some(function (h) { return h > t + 0.5; });
    }
    IDS.forEach(function (id) {
      var tr = con.tracks[id], ep = tr.ep, done = t >= ep.end, tt = Math.min(t, ep.end);
      if (done !== tr.done) { tr.done = done; tr.fig.classList.toggle('is-done', done); }
      tr.boxes.forEach(function (bx) {
        var on = tt >= bx.b.t0 && tt < bx.b.t1;
        if (on !== bx.on) { bx.on = on; bx.el.hidden = !on; }
      });
      var si = B.lastAt(ep.steps, tt);
      if (si !== tr.step) {
        tr.step = si;
        var s = ep.steps[si];
        tr.capVerb.textContent = s ? s.verb : '';
        tr.capVerb.className = 'rx-verb' + (s && s.kind === 'policy' ? ' is-policy' : '') + (s ? '' : ' is-empty');
        tr.capText.textContent = s ? stepLine(s) : '';
        tr.logSteps.forEach(function (li, i) { li.classList.toggle('is-cur', i === si); });
      }
      seek(tr, B.frameAt(ep, tt));
    });
  }

  B.parts.push(initReplay);
  /* handle for scripted checks of the replay */
  window.replayConsole = { state: con, setT: setT, play: play, pause: pause, jump: jump, handoffs: HANDOFFS, frameAt: B.frameAt, callsAt: B.callsAt, episodes: E };
})();
