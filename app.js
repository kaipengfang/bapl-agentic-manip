/* Boundary-Aware Policy Learning: scroll page (page 6, revised from the live page). Vanilla JS, no modules, runs from file://. */
(function () {
  'use strict';

  var R = window.BAPL_RESULTS, E = window.BAPL_EPISODES;
  var ASSETS = 'assets/';
  var IDS = ['cup_harness', 'cup_ours', 'cup_after'];
  var LETTER = { cup_harness: '(a)', cup_ours: '(b)', cup_after: '(c)' };
  var TMAX = Math.max.apply(null, IDS.map(function (k) { return E[k].end; }));
  var CUP = {};
  R.cup.forEach(function (c) { CUP[c.id] = c; });

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqPin = window.matchMedia('(min-width: 980px) and (prefers-reduced-motion: no-preference)');
  var noop = function () {};

  /* ------------------------------------------------------------ helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pct(t, max) { return (t / max * 100).toFixed(3) + '%'; }
  function svgMark(ok) {
    return '<svg class="mark ' + (ok ? 'ok' : 'no') + '" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="9"/>' +
      (ok ? '<path d="M5.5 10.5l3 3 6-7"/>' : '<path d="M6.5 6.5l7 7M13.5 6.5l-7 7"/>') + '</svg>';
  }
  function arrow() { return '<svg class="arr" viewBox="0 0 22 12" width="22" height="12" aria-hidden="true"><path d="M1 6h18M14 1.5L19.5 6 14 10.5"/></svg>'; }
  function fmtMethod(name) { return name === 'π0.5' ? 'π<sub>0.5</sub>' : name; }
  function span(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { t = clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  var B6 = window.B6 = { $: $, $$: $$, el: el, clamp: clamp, pct: pct, span: span, lerp: lerp, ease: ease, svgMark: svgMark, arrow: arrow, fmtMethod: fmtMethod,
    R: R, E: E, IDS: IDS, LETTER: LETTER, CUP: CUP, TMAX: TMAX, ASSETS: ASSETS, mqReduce: mqReduce, noop: noop, parts: [], scroll: [], resize: [] };

  /* ------------------------------------------------------------ episode maths (pure) */
  function frameAt(ep, t) {
    var fr = ep.frames, f = fr[0][2], i, s;
    for (i = 0; i < fr.length; i++) {
      s = fr[i];
      if (t < s[0]) break;
      if (t <= s[1]) { f = s[2] + (t - s[0]) / (s[1] - s[0]) * (s[3] - s[2]); break; }
      f = s[3];
    }
    return Math.max(0, Math.min(ep.n_frames - 1, Math.round(f)));
  }
  function callsAt(ep, t) {
    var n = 0, i;
    for (i = 0; i < ep.call_times.length; i++) if (ep.call_times[i] <= t) n++;
    return n;
  }
  function lastAt(list, t) {
    var k = -1, i;
    for (i = 0; i < list.length; i++) if (list[i].t <= t) k = i;
    return k;
  }
  function agentGaps(ep) {
    var out = [], a = 0;
    ep.policy.forEach(function (p) { if (p[0] > a) out.push([a, p[0]]); a = p[1]; });
    if (ep.end > a) out.push([a, ep.end]);
    return out;
  }

  /* ------------------------------------------------------------ ownership bar */
  /* o.ticks === false leaves the calls out. (o.unknown, once a hatched Policy block, is accepted and ignored: all Policy blocks are the plain white block.) */
  function buildBar(ep, max, o) {
    o = o || {};
    var bar = el('div', 'obar'), inn = el('div', 'obar-in'), e;
    bar.appendChild(inn);
    e = el('div', 'ob-base'); e.style.width = pct(ep.end, max); inn.appendChild(e);
    agentGaps(ep).forEach(function (g) {
      e = el('div', 'ob-agent'); e.style.left = pct(g[0], max); e.style.width = pct(g[1] - g[0], max);
      e.appendChild(el('span', 'ob-lab', 'Agent')); inn.appendChild(e);
    });
    ep.policy.forEach(function (p) {
      e = el('div', 'ob-policy'); e.style.left = pct(p[0], max); e.style.width = pct(p[1] - p[0], max);
      e.appendChild(el('span', 'ob-lab', 'Policy')); inn.appendChild(e);
    });
    ep.policy.forEach(function (p) {
      e = el('div', 'ob-dot'); e.style.left = pct(p[0], max); inn.appendChild(e);
    });
    if (o.ticks !== false) ep.call_times.forEach(function (c, i) {
      e = el('div', 'ob-tick'); e.style.left = pct(c, max); e.style.setProperty('--i', i); inn.appendChild(e);
    });
    return bar;
  }
  function buildAxis(max) {
    var ax = el('div', 'axis'), t, e;
    for (t = 0; t <= max; t += 60) {
      e = el('span', 'axis-t' + (t / max > 0.9 ? ' flip' : ''), t + ' s'); e.style.left = pct(t, max); ax.appendChild(e);
    }
    return ax;
  }
  B6.buildBar = buildBar; B6.buildAxis = buildAxis; B6.agentGaps = agentGaps; B6.frameAt = frameAt; B6.callsAt = callsAt; B6.lastAt = lastAt;
  function readout(id) { return CUP[id].time_s + ' s, ' + CUP[id].calls + ' LLM calls'; }

  /* ------------------------------------------------------------ 1. hero bars */
  function initHero() {
    var rows = $('#heroRows'), delay = 0.5;
    IDS.forEach(function (id) {
      var ep = E[id], a = el('div', 'hrow'), dur = ep.end / TMAX * 1.0, q = id === 'cup_harness';
      /* between the name and the bar: the boundary of this row's policy, state (a), (b) or (c) of the boundary diagram in miniature */
      var fig = el('span', 'hrow-fig'); fig.innerHTML = B6.boundaryMini(LETTER[id].charAt(1));
      a.setAttribute('data-track', id);
      a.style.setProperty('--delay', delay.toFixed(2) + 's');
      a.style.setProperty('--dur', dur.toFixed(2) + 's');
      a.style.setProperty('--after', (delay + dur).toFixed(2) + 's');
      delay += dur + 0.3;
      var lab = el('span', 'hrow-label'); lab.appendChild(el('b', null, ep.label));
      if (q) lab.appendChild(el('small', null, 'narrow and hard-to-describe boundary'));
      a.appendChild(lab);
      a.appendChild(fig);
      var b = el('span', 'hrow-bar'); b.appendChild(buildBar(ep, TMAX)); a.appendChild(b);
      var o = el('span', 'hrow-out');
      o.innerHTML = svgMark(ep.ok) + '<span>' + (ep.ok ? 'succeeds' : 'fails') + '</span><b>' + readout(id) + '</b>';
      a.appendChild(o);
      rows.appendChild(a);
    });
    var foot = el('div', 'hrow hrow-axis');
    foot.appendChild(el('span', 'hrow-label'));
    foot.appendChild(el('span', 'hrow-fig'));
    var ab = el('span', 'hrow-bar'); ab.appendChild(buildAxis(TMAX)); foot.appendChild(ab);
    foot.appendChild(el('span', 'hrow-out'));
    rows.appendChild(foot);
    if (!mqReduce.matches) {
      $('#heroBars').classList.add('will-draw');
      requestAnimationFrame(function () { requestAnimationFrame(function () { $('#heroBars').classList.add('draw'); }); });
    }
    $$('.btn.is-off').forEach(function (b) { b.addEventListener('click', function (ev) { ev.preventDefault(); }); });
  }

  /* ------------------------------------------------------------ scroll scenes */
  var layerHooks = {}, layerCues = {};
  var scenes = [];
  var pinned = false;
  function initScenes() {
    $$('.scene').forEach(function (sc) {
      var s = { el: sc, stage: $('.scene-stage', sc), steps: $$('.step', sc), layers: {}, active: -1, pre: false };
      $$('.layer', sc).forEach(function (L) {
        var id = L.id.replace('layer-', '');
        s.layers[id] = L; L._home = L.parentNode;
      });
      scenes.push(s);
    });
    setPinned(mqPin.matches);
    var onMq = function () { setPinned(mqPin.matches); };
    if (mqPin.addEventListener) mqPin.addEventListener('change', onMq); else mqPin.addListener(onMq);
  }
  function setPinned(on) {
    pinned = on;
    document.documentElement.classList.toggle('pinned', on);
    scenes.forEach(function (s) {
      Object.keys(s.layers).forEach(function (id) {
        var L = s.layers[id];
        if (on) { s.stage.appendChild(L); L.classList.remove('is-on'); }
        else { L._home.appendChild(L); L.classList.add('is-on'); L.setAttribute('data-state', L.getAttribute('data-static-state') || ''); }
      });
      s.steps.forEach(function (st) { st.classList.remove('is-active'); });
      s.active = -1; s.pre = false;
    });
    if (on) updateScenes();
    $$('video[data-auto]').forEach(syncVideo);
  }
  /* Where scroll-driven motion starts and ends, as fractions of the window height: the progress q of a step is 0 while the centre of
     its box is at Q_START or lower and 1 once it has risen to Q_END. The same line (Q_START) decides which step of a scene is live. */
  var Q_START = 0.93, Q_END = 0.44;
  function stepQ(step) {
    if (!pinned) return 1;
    var r = step.getBoundingClientRect(), q = span(Q_START - (r.top + r.bottom) / 2 / window.innerHeight, 0, Q_START - Q_END);
    /* scroll positions are whole pixels: within half a percent of an end counts as that end */
    return q < 0.005 ? 0 : q > 0.995 ? 1 : q;
  }
  /* A tall step (class step-tall) keeps its text in place while it scrolls. Its progress runs over the whole stretch in which that text
     is held: 0 when the top of the step reaches the top of the window, 1 when its bottom reaches the bottom of the window. */
  function tallQ(step) {
    if (!pinned) return 1;
    var r = step.getBoundingClientRect(), d = r.height - window.innerHeight;
    if (d <= 0) return 1;
    var q = clamp(-r.top / d, 0, 1);
    return q < 0.002 ? 0 : q > 0.998 ? 1 : q;
  }
  var TALL_ANCHOR = 0.38;     /* a tall step is live from where a step of the usual height (76% of the window) would be: its top at 93 - 38 = 55% */
  function updateScenes() {
    if (!pinned) return;
    var vh = window.innerHeight, line = vh * Q_START + 0.5;
    scenes.forEach(function (s) {
      var sr = s.el.getBoundingClientRect();
      if (sr.top >= vh || sr.bottom <= 0) { deactivate(s); preshow(s, false); return; }
      /* the live step is the last one whose centre has come up to the start line */
      var cur = -1;
      s.steps.forEach(function (st, i) {
        var r = st.getBoundingClientRect();
        var at = st.classList.contains('step-tall') ? r.top + vh * TALL_ANCHOR : st.classList.contains('step-dwell') ? r.top + vh / 2 : (r.top + r.bottom) / 2;
        if (at <= line) cur = i;     /* step-dwell: its text sits in the middle of a box one window high, at the top of the step */
      });
      /* while the scene comes up, its first visual is already there in its start state */
      if (cur < 0) { deactivate(s); preshow(s, true); return; }
      if (cur !== s.active) { s.pre = false; activate(s, cur); }
    });
  }
  function preshow(s, on) {
    if (s.pre === on) return;
    s.pre = on;
    var id = s.steps[0].getAttribute('data-layer');
    s.layers[id].classList.toggle('is-on', on);
    if (on && layerCues[id]) layerCues[id]();
  }
  function deactivate(s) {
    if (s.active < 0) return;
    var prev = s.steps[s.active].getAttribute('data-layer');
    s.active = -1;
    s.steps.forEach(function (x) { x.classList.remove('is-active'); });
    Object.keys(s.layers).forEach(function (k) {
      var L = s.layers[k];
      L.classList.remove('is-on'); L.setAttribute('data-state', '');
      $$('video[data-auto]', L).forEach(syncVideo);
      if (layerHooks[k] && k === prev) layerHooks[k](false);
    });
  }
  function activate(s, i) {
    var prev = s.active >= 0 ? s.steps[s.active].getAttribute('data-layer') : null;
    s.active = i;
    var st = s.steps[i], id = st.getAttribute('data-layer');
    s.steps.forEach(function (x, k) { x.classList.toggle('is-active', k === i); });
    Object.keys(s.layers).forEach(function (k) {
      var L = s.layers[k], on = k === id;
      L.classList.toggle('is-on', on);
      L.setAttribute('data-state', on ? st.getAttribute('data-state') || '' : '');
      $$('video[data-auto]', L).forEach(function (v) {
        if (on && prev !== id) { try { v.currentTime = 0; } catch (e) {} }
        syncVideo(v);
      });
      if (layerHooks[k] && prev !== id && (on || k === prev)) layerHooks[k](on);
    });
  }

  /* ------------------------------------------------------------ looping clips: play only in view (and on the active layer) */
  function syncVideo(v) {
    var L = v.closest ? v.closest('.layer') : null;
    var want = v._in && !mqReduce.matches && (!L || !pinned || L.classList.contains('is-on'));
    if (want) { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(noop); } }
    else if (!v.paused) v.pause();
  }
  function initAutoVideos() {
    var vids = $$('video[data-auto]');
    if (mqReduce.matches) vids.forEach(function (v) { if (!v.classList.contains('hero-bg')) v.controls = true; });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { en.target._in = en.isIntersecting; syncVideo(en.target); });
    }, { threshold: 0.2 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ------------------------------------------------------------ nav progress */
  var prog = null;
  function initProgress() {
    var bar = $('#progress');
    prog = { bar: bar, fill: $('.np-fill', bar), dot: $('.np-dot', bar), cur: $('#npCur'), ms: [], name: null };
    $$('.np-ms', bar).forEach(function (a) {
      prog.ms.push({ el: a, name: a.textContent, target: $(a.getAttribute('href')) });
    });
    layoutProgress();
  }
  function layoutProgress() {
    if (!prog) return;
    var H = document.documentElement.scrollHeight - window.innerHeight;
    prog.H = H;
    prog.ms.forEach(function (t) {
      t.y = t.target.getBoundingClientRect().top + window.pageYOffset;
      t.p = clamp(t.y / H, 0, 1);
      t.el.style.left = (t.p * 100).toFixed(3) + '%';
      t.el.classList.toggle('flip', t.p > 0.9);
    });
  }
  function updateProgress() {
    if (!prog) return;
    var y = window.pageYOffset, p = prog.H > 0 ? clamp(y / prog.H, 0, 1) : 0;
    prog.fill.style.width = (p * 100).toFixed(2) + '%';
    prog.dot.style.left = (p * 100).toFixed(2) + '%';
    var cur = null;
    prog.ms.forEach(function (t) { if (y + window.innerHeight * 0.4 >= t.y) cur = t; });
    prog.ms.forEach(function (t) {
      t.el.classList.toggle('is-past', y + 2 >= Math.min(t.y, prog.H));
      t.el.classList.toggle('is-cur', t === cur);
      if (t === cur) t.el.setAttribute('aria-current', 'true'); else t.el.removeAttribute('aria-current');
    });
    var name = cur ? cur.name : '';
    if (name !== prog.name) { prog.name = name; prog.cur.textContent = name; prog.cur.hidden = !name; }
    prog.cur.style.left = (p * 100).toFixed(2) + '%';
    prog.cur.classList.toggle('flip', p > 0.88);
    $('#nav').classList.toggle('is-solid', y > 40);
  }

  /* ------------------------------------------------------------ 3. chart: success and first handoffs by distance */
  function initBins() {
    var B = R.boundary.bins, root = $('#binsChart'), SCALE = 112;
    var lg = el('ul', 'legend on-paper');
    lg.innerHTML = '<li><i class="sw sw-bar-grey"></i>policy success rate</li><li><i class="sw sw-bar-green"></i>share of the agent\'s first handoffs</li>';
    root.appendChild(lg);
    var plot = el('div', 'plot');
    [0, 50, 100].forEach(function (v) {
      var g = el('div', 'grid-y'); g.style.bottom = (v / SCALE * 100) + '%'; g.appendChild(el('span', null, String(v))); plot.appendChild(g);
    });
    plot.appendChild(el('span', 'plot-ytitle', 'Rate (%)'));
    /* shown only while a number or the chip of the sentence is pointed at (initLinks): a band behind the first four bins (within 40 mm),
       and the line at 82.2, the least success rate inside the band */
    var NIN = 4, LEAST = 82.2;     /* the bins within 40 mm; the "at least" of the sentence (the bins are rounded, 82 for 30–40) */
    var band = el('div', 'lk-band'); band.style.width = (NIN / B.length * 100) + '%'; plot.appendChild(band);
    var least = el('div', 'lk-least'); least.style.width = (NIN / B.length * 100) + '%'; least.style.bottom = (LEAST / SCALE * 100) + '%';
    var groups = el('div', 'groups'), tip = el('div', 'tip card');
    tip.hidden = true;
    B.forEach(function (b) {
      var g = el('button', 'grp'); g.type = 'button';
      g.setAttribute('aria-label', b.mm + ' mm: policy success rate ' + b.policy + '%, share of the agent\'s first handoffs ' + b.handoffs + '%');
      var p = el('span', 'vbar vbar-grey'); p.style.height = (b.policy / SCALE * 100) + '%'; p.appendChild(el('b', null, String(b.policy)));
      var h = el('span', 'vbar vbar-green'); h.style.height = (b.handoffs / SCALE * 100) + '%'; h.appendChild(el('b', null, String(b.handoffs)));
      g.appendChild(p); g.appendChild(h);
      var show = function () {
        tip.innerHTML = '<b>' + b.mm + ' mm</b><span><i class="sw sw-bar-grey"></i>policy success rate <b>' + b.policy + '%</b></span><span><i class="sw sw-bar-green"></i>share of the agent\'s first handoffs <b>' + b.handoffs + '%</b></span>';
        tip.hidden = false;
        var gr = g.getBoundingClientRect(), pr = plot.getBoundingClientRect();
        var x = gr.left + gr.width / 2 - pr.left;
        tip.style.left = clamp(x, 110, pr.width - 110) + 'px';
        groups.classList.add('has-focus'); g.classList.add('is-focus');
      };
      var hide = function () { tip.hidden = true; groups.classList.remove('has-focus'); g.classList.remove('is-focus'); };
      g.addEventListener('pointerenter', show); g.addEventListener('pointerleave', hide);
      g.addEventListener('focus', show); g.addEventListener('blur', hide);
      groups.appendChild(g);
    });
    plot.appendChild(groups); plot.appendChild(least); plot.appendChild(tip);
    root.appendChild(plot);
    var xl = el('div', 'xlabels');
    B.forEach(function (b) { xl.appendChild(el('span', null, b.mm)); });
    root.appendChild(xl);
    root.appendChild(el('p', 'xtitle', 'Distance to training trajectories (mm)'));
  }

  /* ------------------------------------------------------------ 3a. the sentence beside the chart points into it: 91.1% (share of first handoffs),
     82.2% (policy success, at least) and the chip "within 40 mm" each light the first four bins (data-link on #binsChart, CSS does the rest).
     Mouse hover, keyboard focus, and a tap that toggles (a tap elsewhere clears). Separate from the tooltip of a single bar. */
  function initLinks() {
    var chart = $('#binsChart'), links = $$('#analysis .qs-link'), cur = null, touch = false;
    function set(a) {
      if (cur === a) return;
      if (cur) cur.classList.remove('is-link');
      cur = a;
      if (a) { a.classList.add('is-link'); chart.setAttribute('data-link', a.getAttribute('data-link')); }
      else chart.removeAttribute('data-link');
    }
    function back() { set(links.indexOf(document.activeElement) >= 0 ? document.activeElement : null); }
    links.forEach(function (a) {
      a.addEventListener('pointerdown', function (ev) { touch = ev.pointerType !== 'mouse'; a._mouse = !touch; });
      a.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse') set(a); });
      /* a mouse click focuses the target; leaving it with the mouse lets go of that focus too (keyboard focus stays) */
      a.addEventListener('pointerleave', function (ev) { if (ev.pointerType !== 'mouse') return; if (a._mouse && document.activeElement === a) a.blur(); back(); });
      a.addEventListener('focus', function () { set(a); });
      a.addEventListener('blur', function () { a._open = false; a._mouse = false; if (cur === a) set(null); });
      a.addEventListener('click', function () {
        if (!touch) return;
        if (cur === a && a._open) { a._open = false; set(null); a.blur(); } else { set(a); a._open = true; }
      });
      a.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { set(null); a.blur(); } });
    });
    document.addEventListener('pointerdown', function (ev) {
      if (cur && links.indexOf(ev.target.closest ? ev.target.closest('.qs-link') : null) < 0) { if (cur._open) cur._open = false; set(null); }
    });
  }

  /* ------------------------------------------------------------ 3b. four cases under the chart: a larger view on hover, focus or tap */
  function initCases() {
    var row = $('#casesRow');
    if (!row) return;
    var CASES = [['mug', 'hanging mug'], ['shoes', 'place dual shoes'], ['bell', 'click bell'], ['stapler', 'move stapler pad']];
    var box = $('#cases'), pop = $('#casesPop'), big = $('#casesPopImg'), cap = $('#casesPopCap'), cur = null, touch = false;
    function hide(b) {
      if (b && b !== cur) return;
      if (cur) cur.setAttribute('aria-expanded', 'false');
      cur = null; pop.hidden = true;
    }
    CASES.forEach(function (c) {
      var li = el('li', 'case'), b = el('button'), im = document.createElement('img');
      b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Enlarge: ' + c[1]);
      im.loading = 'lazy'; im.decoding = 'async'; im.alt = ''; im.width = 311; im.height = 360;
      im.src = ASSETS + 'img/cases/handoff_' + c[0] + '_thumb.jpg';
      b.appendChild(im); li.appendChild(b); li.appendChild(el('span', null, c[1])); row.appendChild(li);
      function show() {
        if (cur === b) return;
        hide(); cur = b; b.setAttribute('aria-expanded', 'true');
        big.src = ASSETS + 'img/cases/handoff_' + c[0] + '.png'; big.alt = 'Training poses and first handoffs of the agent, ' + c[1];
        cap.textContent = c[1];
        /* above the tiles where the window has room for it, else below them; if neither side has room, on the larger side and smaller */
        var br = b.getBoundingClientRect(), xr = box.getBoundingClientRect(), vh = window.innerHeight, GAP = 14, TOP = 62;
        pop.style.width = ''; pop.style.top = ''; pop.style.bottom = ''; pop.hidden = false;
        var w = pop.offsetWidth, h = pop.offsetHeight, up = xr.top - GAP - TOP, down = vh - xr.bottom - GAP - 8, room = Math.max(up, down);
        var above = up >= h || (down < h && up >= down);
        if (room < h) { w = Math.max(160, Math.round(w * room / h)); pop.style.width = w + 'px'; }
        if (above) pop.style.bottom = 'calc(100% + ' + GAP + 'px)'; else { pop.style.bottom = 'auto'; pop.style.top = 'calc(100% + ' + GAP + 'px)'; }
        pop.style.left = clamp(br.left + br.width / 2 - xr.left - w / 2, 0, Math.max(0, xr.width - w - 8)) + 'px';
      }
      b.addEventListener('pointerdown', function (ev) { touch = ev.pointerType !== 'mouse'; });
      b.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse') show(); });
      b.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') hide(b); });
      b.addEventListener('focus', show);
      b.addEventListener('blur', function () { b._open = false; hide(b); });
      /* a tap opens the case and a second tap closes it */
      b.addEventListener('click', function () { if (!touch) { show(); return; } if (cur === b && b._open) { b._open = false; hide(b); } else { show(); b._open = true; } });
      b.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') hide(b); });
    });
  }

  /* ------------------------------------------------------------ horizontal bars (main comparison, ablation) */
  function buildHBars(root, rows) {
    var out = [];
    var axis = el('div', 'hb-axis');
    [0, 50, 100].forEach(function (v) { var g = el('i', null); g.style.left = v + '%'; g.setAttribute('data-v', v); axis.appendChild(g); });
    rows.forEach(function (r) {
      var row = el('div', 'hb-row' + (r.ours ? ' is-ours' : ''));
      var name = el('div', 'hb-name'); name.innerHTML = '<b>' + fmtMethod(r.name) + '</b>' + (r.kind ? '<small>' + r.kind + '</small>' : '');
      var track = el('div', 'hb-track'), bar = el('div', 'hb-bar'), val = el('span', 'hb-val');
      track.appendChild(bar); track.appendChild(val);
      row.appendChild(name); row.appendChild(track); root.appendChild(row);
      out.push({ r: r, row: row, bar: bar, val: val, track: track });
    });
    var foot = el('div', 'hb-row hb-foot');
    foot.appendChild(el('div', 'hb-name'));
    var ft = el('div', 'hb-track');
    [0, 50, 100].forEach(function (v) { var s = el('span', null, String(v)); s.style.left = v + '%'; ft.appendChild(s); });
    ft.appendChild(el('em', null, 'success (%)'));
    foot.appendChild(ft); root.appendChild(foot);
    return out;
  }
  function setHBar(item, v, best) {
    var isNull = v == null;
    item.row.classList.toggle('is-null', isNull);
    item.row.classList.toggle('is-best', !!best);
    item.bar.style.width = isNull ? '0%' : v + '%';
    item.val.style.left = isNull ? '0%' : v + '%';
    item.val.textContent = isNull ? '–' : v.toFixed(1);
  }
  B6.buildHBars = buildHBars; B6.setHBar = setHBar;

  /* ------------------------------------------------------------ 4. self-improvement, before and after */
  function initSI() {
    var S = R.selfimprove, root = $('#siChart'), cells = [];
    var FMT = {
      success: function (v) { return v.toFixed(1) + '%'; },
      calls: function (v) { return v.toFixed(1); },
      cost: function (v) { return '$' + v.toFixed(2); },
      time: function (v) { return v.toFixed(2) + ' min'; }
    };
    var NAME = { success: 'success rate', calls: 'LLM calls per episode', cost: 'API cost per episode', time: 'time per episode' };
    S.metrics.forEach(function (m) {
      var max = m.key === 'success' ? 100 : Math.max(S.all50.easy.before[m.key], S.all50.hard.before[m.key]);
      var c = el('div', 'si-cell');
      var head = el('p', 'si-name'); head.appendChild(el('span', null, NAME[m.key]));
      var d = el('b', 'si-delta'); head.appendChild(d);
      c.appendChild(head);
      var rows = {};
      ['before', 'after'].forEach(function (k) {
        var r = el('div', 'si-row si-' + k);
        r.appendChild(el('span', 'si-k', k));
        var tr = el('div', 'si-track'), b = el('div', 'si-bar'), v = el('span', 'si-val');
        tr.appendChild(b); tr.appendChild(v); r.appendChild(tr); c.appendChild(r);
        rows[k] = { bar: b, val: v };
      });
      root.appendChild(c);
      cells.push({ key: m.key, max: max, rows: rows, delta: d });
    });
    function set(k) {
      var D = S.all50[k];
      cells.forEach(function (c) {
        ['before', 'after'].forEach(function (s) {
          var v = D[s][c.key], w = v / c.max * 100;
          c.rows[s].bar.style.width = w + '%'; c.rows[s].val.style.left = w + '%';
          c.rows[s].val.textContent = FMT[c.key](v);
        });
        var dv = D.delta[c.key];
        c.delta.textContent = dv == null ? '' : '−' + Math.abs(dv) + '%';
      });
      $$('#siSwitch button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-k') === k ? 'true' : 'false'); });
    }
    $$('#siSwitch button').forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-k')); }); });
    set('easy');
  }

  /* ------------------------------------------------------------ 7. ending */
  function initEnding() {
    var copy = $('#bibCopy');
    copy.addEventListener('click', function () {
      var text = $('#bibText').textContent, done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
      function fallback() {
        var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
    $$('.proto-rule').forEach(function (r) {
      var seg = r.getAttribute('data-seg'), proto = r.closest('.proto');
      var on = function () { proto.setAttribute('data-hl', seg); }, off = function () { proto.removeAttribute('data-hl'); };
      r.addEventListener('pointerenter', on); r.addEventListener('pointerleave', off);
      r.addEventListener('focus', on); r.addEventListener('blur', off);
    });
  }

  /* ------------------------------------------------------------ one scroll loop */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; updateScenes(); updateProgress(); B6.scroll.forEach(function (f) { f(); }); });
  }

  B6.hooks = layerHooks; B6.cues = layerCues;
  B6.stepQ = stepQ; B6.tallQ = tallQ; B6.Q_START = Q_START; B6.Q_END = Q_END;
  B6.isPinned = function () { return pinned; };
  B6.layoutProgress = function () { layoutProgress(); updateProgress(); };
  B6.start = function () {
    /* the cover has no comparison panel any more; the replay console compares the three systems */
    initBins();
    initLinks();
    initCases();
    initSI();
    initEnding();
    B6.parts.forEach(function (f) { f(); });
    initScenes();
    (B6.after || []).forEach(function (f) { f(); });
    initAutoVideos();
    initProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { B6.resize.forEach(function (f) { f(); }); layoutProgress(); onScroll(); });
    window.addEventListener('load', function () { layoutProgress(); onScroll(); });
    onScroll();
  };

})();
