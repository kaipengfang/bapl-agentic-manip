/* Page 6, visuals that follow the scroll inside the pinned scenes (scrolling back rewinds them): the handoff protocol of Stage 1,
   and in Stage 2 the cost of many calls and the earlier handoff. Mappings: B6.stepQ, and B6.tallQ for a tall step (app.js). */
(function () {
  'use strict';
  var B = window.B6, $ = B.$, $$ = B.$$, el = B.el, span = B.span, lerp = B.lerp, ease = B.ease, pct = B.pct, E = B.E, CUP = B.CUP;
  var draws = [];

  /* draw(q, pinned): q from B.stepQ, or from B.tallQ for a tall step; a switch between pinned and plain always redraws */
  function follow(layerId, draw) {
    var step = $('.step[data-layer="' + layerId + '"]'), tall = step.classList.contains('step-tall'), last = -1, pin = null;
    draws.push(function () {
      var q = tall ? B.tallQ(step) : B.stepQ(step), p = B.isPinned();
      /* the two ends are always drawn exactly */
      if (p === pin && (q === last || (q > 0 && q < 1 && Math.abs(q - last) < 0.002))) return;
      last = q; pin = p; draw(q, p);
    });
  }
  function update() { for (var k = 0; k < draws.length; k++) draws[k](); }
  function show(node, a, dy) {
    node.style.opacity = a.toFixed(3);
    if (dy) node.style.transform = a >= 1 ? '' : 'translateY(' + ((1 - a) * dy).toFixed(1) + 'px)';
  }

  /* ------------------------------------------------------------ Stage 1: the sampling rule becomes the handoff protocol */
  function initProto() {
    var root = $('.proto');
    if (!root) return;
    var src = $('.proto-src', root), title = $('.proto-main .proto-title', root), box = $('.proto-rules', root), rules = $$('.proto-rule', root);
    var segs = $$('.proto-main .pb', root), dot = $('.proto-main .pb-dot', root), who = $('.proto-who', root), chain = $('.proto-chain', root);
    var links = Array.prototype.slice.call(chain.children);
    follow('protocol', function (q) {
      show($('.proto-title', src), span(q, 0.02, 0.1)); show($('.proto-srule', src), span(q, 0.04, 0.14), 10);
      src.style.setProperty('--arr', span(q, 0.16, 0.24).toFixed(3));
      show(title, span(q, 0.2, 0.28)); show(box, span(q, 0.22, 0.3), 10);
      rules.forEach(function (r, i) {
        var a = span(q, 0.28 + i * 0.1, 0.36 + i * 0.1);
        show(r, a); show(segs[i], a);
        if (i === 1) { dot.style.opacity = a.toFixed(3); dot.style.transform = 'scale(' + a.toFixed(3) + ')'; }
      });
      show(who, span(q, 0.62, 0.72));
      chain.style.opacity = span(q, 0.74, 0.78).toFixed(3);
      links.forEach(function (n, k) { show(n, span(q, 0.76 + k * 0.035, 0.8 + k * 0.035)); });
      root.classList.toggle('is-done', q >= 0.94);
    });
  }

  /* ------------------------------------------------------------ Stage 2, 1. many calls: costly and slow */
  function initCost() {
    var ep = E.cup_ours, root = $('#cost'), bar = B.buildBar(ep, ep.end), inn = $('.obar-in', bar);
    $('#costBar').appendChild(bar);
    var head = el('div', 'ob-head'); inn.appendChild(head);
    var ticks = $$('.ob-tick', bar), calls = $('#costCalls'), secs = $('#costSecs'), N = CUP.cup_ours.calls, T = CUP.cup_ours.time_s;
    follow('calls', function (q) {
      /* the playhead crosses the episode, then the two totals are marked as the cost */
      var p = span(q, 0.02, 0.9), t = p * ep.end, n = Math.min(N, B.callsAt(ep, t)), done = q >= 0.93;
      head.style.left = pct(t, ep.end);
      ticks.forEach(function (tk, i) { tk.classList.toggle('is-lit', ep.call_times[i] <= t); });
      /* the final numbers stay in the text; while counting, the running value is painted over them */
      calls.setAttribute('data-n', p >= 1 ? N : n); secs.setAttribute('data-n', p >= 1 ? T : Math.round(p * T));
      calls.classList.toggle('is-counting', p < 1); secs.classList.toggle('is-counting', p < 1);
      root.classList.toggle('is-done', done);
    });
  }

  /* (2. the retraining step is a clip that plays by itself: story6.js clip, asset built by tools/retrain_anim) */

  /* ------------------------------------------------------------ 4. before and after on one time axis: the bar "after" is the bar "before", reshaped */
  function initSooner() {
    var rows = $('#soRows'), TMAX = B.TMAX, A = E.cup_ours, Z = E.cup_after, e;
    function addRow(name, node) {
      var row = el('div', 'so-row'); row.appendChild(el('span', 'so-name', name));
      var b = el('div', 'so-bar'); b.appendChild(node); row.appendChild(b); rows.appendChild(row);
      return row;
    }
    addRow('before', B.buildBar(A, TMAX));
    /* same parts as buildBar; their places are set from the scroll */
    var bar = el('div', 'obar'), inn = el('div', 'obar-in'); bar.appendChild(inn);
    var base = el('div', 'ob-base'), ag1 = el('div', 'ob-agent'), pol = el('div', 'ob-policy'), ag2 = el('div', 'ob-agent'), dot = el('div', 'ob-dot');
    ag1.appendChild(el('span', 'ob-lab', 'Agent')); pol.appendChild(el('span', 'ob-lab', 'Policy')); ag2.appendChild(el('span', 'ob-lab', 'Agent'));
    [base, ag1, ag2, pol, dot].forEach(function (n) { inn.appendChild(n); });
    /* calls that also exist after self-improvement stay; the call that issues the handoff moves with it; the others go */
    var left = Z.call_times.slice(), pair = {};
    A.call_times.forEach(function (c, i) { var k = left.indexOf(c); if (k >= 0) { pair[i] = c; left.splice(k, 1); } });
    var iHand = B.callsAt(A, A.policy[0][0]) - 1;
    if (left.length && pair[iHand] == null) pair[iHand] = left.shift();
    var ticks = A.call_times.map(function (c, i) { e = el('div', 'ob-tick'); inn.appendChild(e); return { el: e, c: c, to: pair[i] }; });
    var after = addRow('after', bar);
    var ax = el('div', 'so-row so-axis'); ax.appendChild(el('span', 'so-name'));
    var ab = el('div', 'so-bar'); ab.appendChild(B.buildAxis(TMAX)); ax.appendChild(ab); rows.appendChild(ax);
    var res = $('#soRes'), nCalls = $('#soCalls'), nSecs = $('#soSecs');
    var A0 = { h: A.policy[0][0], pe: A.policy[0][1], end: A.end, s: CUP.cup_ours.time_s }, Z0 = { h: Z.policy[0][0], pe: Z.policy[0][1], end: Z.end, s: CUP.cup_after.time_s };
    function L(v, w) { e = v.style; e.left = pct(w[0], TMAX); e.width = pct(Math.max(0, w[1] - w[0]), TMAX); }
    follow('sooner', function (q) {
      /* the copy leaves the bar "before", then its parts move to where they are after self-improvement */
      var a = span(q, 0.02, 0.14), m = ease(span(q, 0.16, 0.84));
      if (q >= 1) m = 1;
      after.style.opacity = a.toFixed(3);
      after.style.transform = a >= 1 ? '' : 'translateY(' + (-(1 - a) * (after.offsetTop - rows.firstChild.offsetTop)).toFixed(1) + 'px)';
      var h = lerp(A0.h, Z0.h, m), pe = lerp(A0.pe, Z0.pe, m), end = lerp(A0.end, Z0.end, m), n = 0;
      L(base, [0, end]); L(ag1, [0, h]); L(pol, [h, pe]); L(ag2, [pe, end]); dot.style.left = pct(h, TMAX);
      ticks.forEach(function (t) {
        var on = true, x = t.c;
        if (t.to != null) x = lerp(t.c, t.to, m);
        else on = !((t.c > h && t.c < pe) || t.c > end || (t.c < Z0.h && m > 0.45));
        t.el.style.left = pct(x, TMAX); t.el.classList.toggle('is-gone', !on);
        if (on) n++;
      });
      nCalls.textContent = String(n); nSecs.textContent = String(Math.round(lerp(A0.s, Z0.s, m)));
      res.style.opacity = span(q, 0.06, 0.16).toFixed(3);
      res.classList.toggle('is-final', m >= 1);
    });
    B.sooner = { inn: inn, after: Z };
  }

  B.parts.push(initProto, initCost, initSooner);
  B.after = B.after || [];
  B.after.push(update);
  B.scroll.push(update);
  B.resize.push(update);
})();
