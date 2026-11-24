/* Boundary diagram, (a) to (b) to (c): ported from page 5 (5_core/story.js) by build_diagram.py; every state is a function of (chapter, p).
   The geometry (constants and path builders) is shared with the three miniatures of the cover rows (B6.boundaryMini). */
(function () {
  'use strict';
  var B = window.B6, $$ = B.$$, lerp = B.lerp, span = B.span, ease = B.ease, clamp = B.clamp;
  /* ------------------------------------------------------------ geometry, in the units of the 720-wide drawing */
  var X0 = 40, XM = 300, XT = 610, XB = 634, XE = 132, CY = 150, BY = 296, BH = 34, N = 7;
  var DOT_B = [322, 91], DOT_C = [XE + 18, CY - 66.5];
  var SX = [52, 66, 48, 60, 50, 68, 56], SY = [66, 96, 124, 152, 180, 208, 236];
  function ymA(i) { return CY + (i - 3) * 3.6; }
  function ymB(i) { return CY + (i - 3) * 30; }
  function f(n) { return n.toFixed(1); }
  /* trajectory i from the mouth of the boundary to the object; m = 0 the narrow tube, m = 1 the funnel */
  function seg2(i, m) {
    var ym = lerp(ymA(i), ymB(i), m);
    return 'M' + XM + ',' + f(ym) + ' C' + (XM + 115) + ',' + f(ym) + ' ' + (XT - 125) + ',' + f(CY + (i - 3) * lerp(1.2, 3, m)) + ' ' + XT + ',' + f(CY + (i - 3) * lerp(1, 2.4, m));
  }
  function edge(m, sgn) {
    var yl = lerp(13, 100, m), yr = lerp(6, 13, m);
    return 'M' + XM + ',' + f(CY + sgn * yl) + ' C' + (XM + 115) + ',' + f(CY + sgn * yl) + ' ' + (XT - 125) + ',' + f(CY + sgn * yr) + ' ' + XT + ',' + f(CY + sgn * yr);
  }
  function fill(m) {
    var yl = lerp(13, 100, m), yr = lerp(6, 13, m);
    return edge(m, -1) + ' L' + XT + ',' + f(CY + yr) + ' C' + (XT - 125) + ',' + f(CY + yr) + ' ' + (XM + 115) + ',' + f(CY + yl) + ' ' + XM + ',' + f(CY + yl) + ' Z';
  }
  function extEdge(sgn) { return 'M' + XE + ',' + (CY + sgn * 108) + ' C' + (XE + 60) + ',' + (CY + sgn * 108) + ' ' + (XM - 60) + ',' + (CY + sgn * 100) + ' ' + XM + ',' + (CY + sgn * 100); }
  function extFill() { return 'M' + XE + ',' + (CY - 108) + ' C' + (XE + 60) + ',' + (CY - 108) + ' ' + (XM - 60) + ',' + (CY - 100) + ' ' + XM + ',' + (CY - 100) + ' L' + XM + ',' + (CY + 100) + ' C' + (XM - 60) + ',' + (CY + 100) + ' ' + (XE + 60) + ',' + (CY + 108) + ' ' + XE + ',' + (CY + 108) + ' Z'; }
  /* trajectory i of the extension (c), and of a whole-task policy (a), both ending at the mouth */
  function trajE(i) { var sy = CY + (i - 3) * 33.3; return 'M' + XE + ',' + f(sy) + ' C' + (XE + 60) + ',' + f(sy) + ' ' + (XM - 60) + ',' + ymB(i) + ' ' + XM + ',' + ymB(i); }
  /* the same trajectory drawn from the left end of the drawing (miniatures of (b) and (c): all three miniatures span the same width) */
  function trajF(i) { var sy = CY + (i - 3) * 33.3; return 'M54,' + f(sy) + ' L' + XE + ',' + f(sy) + cont0(trajE(i)); }
  function cont0(d) { return d.replace(/^M[^ ]+ /, ' '); }
  function trajA(i) { return 'M' + SX[i] + ',' + SY[i] + ' C' + (SX[i] + 95) + ',' + SY[i] + ' ' + (XM - 105) + ',' + f(ymA(i)) + ' ' + XM + ',' + f(ymA(i)); }
  /* the highlighted way from a handoff inside the funnel to the object, and from the earlier handoff of (c) to that of (b) */
  var D2 = [331, 180], D3 = [347, 209.5];
  function hlPath(d, i2) { return 'M' + d[0] + ',' + d[1] + ' C' + (d[0] + 105) + ',' + d[1] + ' ' + (XT - 125) + ',' + f(CY + (i2 - 3) * 3) + ' ' + XT + ',' + f(CY + (i2 - 3) * 2.4); }
  function hlExt() { return 'M' + DOT_C[0] + ',' + DOT_C[1] + ' C' + (XE + 70) + ',' + (CY - 66.5) + ' ' + (XM - 60) + ',' + ymB(1) + ' ' + DOT_B[0] + ',' + DOT_B[1]; }
  function mix(a, b, t) { return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(lerp(a[k], b[k], t)); }).join(',') + ')'; }
  var GRAY = [154, 154, 154], GREEN = [57, 173, 91];

  B.boundaryDiagram = function (mount, sfx) {
    var h = '', i;
    h += '<defs><clipPath id="bdClip' + sfx + '"><rect id="bdClipRect' + sfx + '" x="' + XM + '" y="20" width="0" height="260"/></clipPath>' +
      '<clipPath id="bdClip2' + sfx + '"><rect id="bdClip2Rect' + sfx + '" x="330" y="50" width="0" height="60"/></clipPath><marker id="bdArrR' + sfx + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="#FF5A52" stroke-width="1.8"/></marker>' +
      '<marker id="bdArrG' + sfx + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="#9A9A9A" stroke-width="1.8"/></marker>' +
      '<marker id="bdArrN' + sfx + '" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="#39AD5B" stroke-width="1.8"/></marker></defs>';
    /* (c) extension, revealed from the mouth toward earlier stages */
    h += '<g id="bdExt' + sfx + '" clip-path="url(#bdClip' + sfx + ')">' +
      '<path d="' + extFill() + '" fill="#39AD5B" fill-opacity=".1"/>' +
      '<path d="' + extEdge(-1) + '" fill="none" stroke="#39AD5B" stroke-width="2.4" stroke-dasharray="12 8"/><path d="' + extEdge(1) + '" fill="none" stroke="#39AD5B" stroke-width="2.4" stroke-dasharray="12 8"/>' +
      '<path d="M' + XE + ',' + (CY - 108) + ' L' + XE + ',' + (CY + 108) + '" fill="none" stroke="#39AD5B" stroke-width="2.4"/>';
    for (i = 0; i < N; i++) h += '<path class="traj" d="' + trajE(i) + '"/><circle class="pose" cx="' + XE + '" cy="' + f(CY + (i - 3) * 33.3) + '" r="4.5"/>';
    h += '</g>';
    /* (a) whole-task trajectories */
    h += '<g id="bdTrajA' + sfx + '">';
    for (i = 0; i < N; i++) h += '<path class="traj" d="' + trajA(i) + '"/><circle class="pose" cx="' + SX[i] + '" cy="' + SY[i] + '" r="4.5"/>';
    h += '</g>';
    /* boundary: tube that opens into the funnel */
    h += '<path id="bdFill' + sfx + '" fill="#39AD5B"/><g id="bdSeg' + sfx + '">';
    for (i = 0; i < N; i++) h += '<path class="traj"/>';
    h += '</g><path id="bdTop' + sfx + '" fill="none" stroke-width="2.4" stroke-dasharray="7 6"/><path id="bdBot' + sfx + '" fill="none" stroke-width="2.4" stroke-dasharray="7 6"/><path id="bdMouth' + sfx + '" fill="none" stroke-width="2.4"/>';
    h += '<g id="bdPoses' + sfx + '">'; for (i = 0; i < N; i++) h += '<circle class="pose" cx="' + XM + '" cy="' + ymB(i) + '" r="4.5"/>'; h += '</g>';
    /* highlighted segments from the handoffs to the object */
    h += '<path class="hl" id="bdHlE' + sfx + '" pathLength="1" stroke-dasharray="1 1" d="' + hlExt() + '"/>';
    h += '<path class="hl" id="bdHl1' + sfx + '" pathLength="1" stroke-dasharray="1 1" d="' + hlPath(DOT_B, 1) + '"/><path class="hl" id="bdHl2' + sfx + '" pathLength="1" stroke-dasharray="1 1" d="' + hlPath(D2, 4) + '"/><path class="hl" id="bdHl3' + sfx + '" pathLength="1" stroke-dasharray="1 1" d="' + hlPath(D3, 5) + '"/>';
    h += '<rect class="obj" x="' + XT + '" y="' + (CY - 12) + '" width="24" height="24" rx="3"/>';
    h += '<path class="arrow" d="M642,' + CY + ' L660,' + CY + '" marker-end="url(#bdArrG' + sfx + ')"/>';
    h += '<g id="bdNo' + sfx + '"><circle cx="684" cy="' + CY + '" r="15" fill="#F21D1D"/><path d="M677.5,' + (CY - 6.5) + ' l13,13 M690.5,' + (CY - 6.5) + ' l-13,13" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/><text class="t-sm" x="684" y="' + (CY + 37) + '" text-anchor="middle">fails</text></g>';
    h += '<g id="bdOk' + sfx + '"><circle cx="684" cy="' + CY + '" r="15" fill="#01BF1A"/><path d="M676.5,' + (CY + .5) + ' l5,5.5 l9,-11" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text class="t-sm" x="676" y="' + (CY + 37) + '" text-anchor="middle">succeeds</text></g>';
    /* labels */
    h += '<g id="bdLabA' + sfx + '"><text x="462" y="203" text-anchor="middle">narrow and</text><text x="462" y="225" text-anchor="middle">hard to describe</text><path class="arrow" d="M462,184 L462,168" marker-end="url(#bdArrG' + sfx + ')"/></g>';
    h += '<g id="bdLabB' + sfx + '"><text class="t-green" x="512" y="252" text-anchor="middle">wide and explicit</text><path d="M486,234 L470,208" fill="none" stroke="#39AD5B" stroke-width="1.6" marker-end="url(#bdArrN' + sfx + ')"/></g>';
    h += '<g id="bdOod' + sfx + '"><path class="ood" id="bdOodPath' + sfx + '" clip-path="url(#bdClip2' + sfx + ')" d="M335,85 C360,70 384,98 420,66"/><path id="bdOodHead' + sfx + '" d="M409,65 L421,65 L418,77" fill="none" stroke="#FF5A52" stroke-width="2.4" stroke-linejoin="round"/><path d="M322,103 L322,134" fill="none" stroke="#FF5A52" stroke-width="1.6" stroke-dasharray="2 4"/><text class="t-red" x="322" y="68" text-anchor="middle">OOD</text></g>';
    /* mini bar on the same x axis as the diagram */
    h += '<path class="link" id="bdLink' + sfx + '"/>';
    h += '<rect id="bdAgent' + sfx + '" x="' + X0 + '" y="' + BY + '" height="' + BH + '" rx="4" fill="#BFBFBF" stroke="#767171" stroke-width="1.5"/><text id="bdAgentT' + sfx + '" class="t-dark" y="' + (BY + 23) + '" text-anchor="middle">Agent</text>';
    h += '<rect id="bdPolHole' + sfx + '" y="' + BY + '" height="' + BH + '" rx="4" fill="none" stroke="#767171" stroke-width="1.5" stroke-dasharray="5 5"/>';
    h += '<rect id="bdPol' + sfx + '" y="' + BY + '" height="' + BH + '" rx="4" stroke="#8A8A8A" stroke-width="1.5"/>';
    h += '<rect id="bdGain' + sfx + '" y="' + (BY + 1) + '" height="' + (BH - 2) + '" fill="#39AD5B"/><path id="bdGainArr' + sfx + '" fill="none" stroke="#1E7A3C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    h += '<text id="bdPolQ' + sfx + '" class="t-white" y="' + (BY + 23) + '" text-anchor="middle">? Policy execution</text><text id="bdPolT' + sfx + '" class="t-dark" y="' + (BY + 23) + '" text-anchor="middle">Policy execution</text><text id="bdPolP' + sfx + '" class="t-dark" y="' + (BY + 23) + '" text-anchor="middle">Policy′</text>';
    h += '<g id="bdGhost' + sfx + '"><path d="M' + DOT_B[0] + ',' + (BY - 6) + ' L' + DOT_B[0] + ',' + (BY + BH + 6) + '" fill="none" stroke="#FFC000" stroke-width="1.5" stroke-dasharray="4 3"/><text class="t-sm" x="' + (DOT_B[0] + 6) + '" y="' + (BY + BH + 22) + '">before</text></g>';
    h += '<circle class="dot" id="bdBarDot' + sfx + '" cy="' + (BY + BH / 2) + '" r="9"/>';
    h += '<text id="bdHand' + sfx + '" class="t-sm" y="' + (BY + BH + 22) + '" text-anchor="middle">handoff</text>';
    h += '<text id="bdSubA' + sfx + '" class="t-sm" x="' + XB + '" y="' + (BY + BH + 22) + '" text-anchor="end">trained on whole tasks</text><text id="bdSubB' + sfx + '" class="t-sm" x="' + XB + '" y="' + (BY + BH + 22) + '" text-anchor="end">trained on contact segments only</text>';
    /* handoffs */
    h += '<circle class="dot" id="bdDot2' + sfx + '" cx="' + D2[0] + '" cy="' + D2[1] + '" r="9"/><circle class="dot" id="bdDot3' + sfx + '" cx="' + D3[0] + '" cy="' + D3[1] + '" r="9"/><circle class="dot" id="bdDot1' + sfx + '" r="10"/>';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 30 720 334'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Motivation and Method Overview');
    svg.innerHTML = h;
    mount.appendChild(svg);
    function q$(id) { return svg.querySelector('#' + id + sfx); }
    var G = {};
    ['bdClipRect', 'bdClip2Rect', 'bdExt', 'bdTrajA', 'bdFill', 'bdSeg', 'bdTop', 'bdBot', 'bdMouth', 'bdPoses', 'bdHlE', 'bdHl1', 'bdHl2', 'bdHl3', 'bdNo', 'bdOk', 'bdLabA', 'bdLabB', 'bdOod', 'bdOodPath', 'bdOodHead',
      'bdLink', 'bdAgent', 'bdAgentT', 'bdPolHole', 'bdPol', 'bdGain', 'bdGainArr', 'bdPolQ', 'bdPolT', 'bdPolP', 'bdGhost', 'bdBarDot', 'bdHand', 'bdSubA', 'bdSubB', 'bdDot1', 'bdDot2', 'bdDot3'].forEach(function (k) { G[k] = q$(k); });
    var segs = $$('path', G.bdSeg);
    function f3(n) { return n.toFixed(3); }
    function op(node, v) { node.style.opacity = f3(clamp(v, 0, 1)); node.style.visibility = v <= 0.001 ? 'hidden' : 'visible'; }
    function dash(node, v) { node.setAttribute('stroke-dashoffset', f3(1 - clamp(v, 0, 1))); node.style.visibility = v <= 0.001 ? 'hidden' : 'visible'; }

    function draw(ch, p) {
      var e, m, d, q;
      if (ch === 0) { e = span(p, 0.04, 0.8); m = 0; d = 0; q = 0; }
      else if (ch === 1) { e = 1; m = ease(span(p, 0.03, 0.45)); d = span(p, 0.42, 0.85); q = 0; }
      else { e = 1; m = 1; d = 1; q = ease(span(p, 0.05, 0.7)); }
      var k;
      /* trajectories and boundary */
      op(G.bdTrajA, 1 - m * 2.2);
      for (k = 0; k < N; k++) segs[k].setAttribute('d', seg2(k, m));
      G.bdFill.setAttribute('d', fill(m)); G.bdFill.setAttribute('fill-opacity', f3(0.04 + 0.14 * m));
      G.bdFill.setAttribute('fill', mix(GRAY, GREEN, m));
      var stroke = mix(GRAY, GREEN, m);
      G.bdTop.setAttribute('d', edge(m, -1)); G.bdBot.setAttribute('d', edge(m, 1));
      G.bdTop.setAttribute('stroke', stroke); G.bdBot.setAttribute('stroke', stroke); G.bdMouth.setAttribute('stroke', stroke);
      var yl = lerp(13, 100, m);
      G.bdMouth.setAttribute('d', 'M' + XM + ',' + f(CY - yl) + ' L' + XM + ',' + f(CY + yl));
      G.bdMouth.setAttribute('stroke-dasharray', q > 0.02 ? '2 6' : m > 0.5 ? 'none' : '7 6');
      op(G.bdPoses, span(d, 0, 0.3));
      op(G.bdLabA, 1 - m * 3); op(G.bdLabB, span(m, 0.6, 1));
      /* (c) */
      var w = (XM - XE + 12) * q;
      G.bdClipRect.setAttribute('x', f(XM - w)); G.bdClipRect.setAttribute('width', f(w));
      op(G.bdExt, q > 0 ? 1 : 0);
      /* handoffs */
      var dx = lerp(DOT_B[0], DOT_C[0], q), dy = lerp(DOT_B[1], DOT_C[1], q), pop = span(e, 0.08, 0.22);
      G.bdDot1.setAttribute('cx', f(dx)); G.bdDot1.setAttribute('cy', f(dy)); G.bdDot1.setAttribute('r', f(10 * (0.4 + 0.6 * pop))); op(G.bdDot1, pop);
      op(G.bdDot2, span(d, 0.15, 0.4)); op(G.bdDot3, span(d, 0.3, 0.55));
      dash(G.bdHl1, span(d, 0.25, 0.75)); dash(G.bdHl2, span(d, 0.4, 0.85)); dash(G.bdHl3, span(d, 0.5, 0.95));
      var he = span(q, 0.55, 1);
      G.bdHlE.setAttribute('stroke-dashoffset', f3(-(1 - he))); G.bdHlE.style.visibility = he <= 0.001 ? 'hidden' : 'visible';
      /* out of the boundary */
      var ood = span(e, 0.45, 0.8), gone = 1 - m * 3;
      op(G.bdOod, Math.min(span(e, 0.4, 0.5), gone));
      G.bdClip2Rect.setAttribute('width', f(96 * ood));
      op(G.bdOodHead, span(e, 0.78, 0.82));
      op(G.bdNo, Math.min(span(e, 0.86, 0.96), gone)); op(G.bdOk, span(d, 0.8, 1));
      /* mini bar */
      var xh = dx;
      G.bdAgent.setAttribute('width', f(xh - X0)); G.bdAgentT.setAttribute('x', f((X0 + xh) / 2));
      G.bdPolHole.setAttribute('x', f(xh)); G.bdPolHole.setAttribute('width', f(XB - xh)); op(G.bdPolHole, 1 - span(e, 0.3, 0.5));
      var polOn = span(e, 0.3, 0.5);
      G.bdPol.setAttribute('x', f(xh)); G.bdPol.setAttribute('width', f(XB - xh)); G.bdPol.setAttribute('fill', mix([14, 14, 14], [255, 255, 255], m)); op(G.bdPol, polOn);
      var cx = (xh + XB) / 2;
      G.bdPolQ.setAttribute('x', f(cx)); G.bdPolT.setAttribute('x', f(cx)); G.bdPolP.setAttribute('x', f(cx));
      op(G.bdPolQ, Math.min(polOn, 1 - m * 2.5)); op(G.bdPolT, Math.min(span(m, 0.55, 0.9), 1 - span(q, 0.2, 0.45))); op(G.bdPolP, span(q, 0.5, 0.8));
      G.bdGain.setAttribute('x', f(xh + 1)); G.bdGain.setAttribute('width', f(Math.max(0, DOT_B[0] - xh - 1))); G.bdGain.setAttribute('fill-opacity', f3(0.3 * span(q, 0, 0.3)));
      var ax = Math.max(xh + 18, DOT_B[0] - 14 - (DOT_B[0] - xh - 34) * span(q, 0.1, 1)), ay = BY + BH / 2;
      G.bdGainArr.setAttribute('d', 'M' + (DOT_B[0] - 12) + ',' + ay + ' L' + f(ax) + ',' + ay + ' M' + f(ax + 8) + ',' + (ay - 7) + ' L' + f(ax) + ',' + ay + ' L' + f(ax + 8) + ',' + (ay + 7));
      op(G.bdGainArr, span(q, 0.15, 0.4));
      op(G.bdGhost, span(q, 0.34, 0.54));
      G.bdBarDot.setAttribute('cx', f(xh)); op(G.bdBarDot, pop);
      G.bdHand.setAttribute('x', f(Math.max(xh, X0 + 30))); op(G.bdHand, pop);
      G.bdLink.setAttribute('d', 'M' + f(dx) + ',' + f(dy + 12) + ' L' + f(dx) + ',' + (BY + 6)); op(G.bdLink, pop * 0.9);
      op(G.bdSubA, 1 - m * 3); op(G.bdSubB, Math.min(span(m, 0.6, 1), 1 - span(q, 0.02, 0.2)));
    }
    return draw;
  };

  /* ------------------------------------------------------------ the miniatures beside the cover rows: states (a), (b), (c) of the same drawing, without text, bar and outcome mark.
     They are drawn in their own pixel space (96 x 40), so that stroke weights and dashes are exact; every point comes from the path builders above.
     (a) narrow and dashed, the handoff outside; (b) wide and solid, the handoff inside; (c) extended to earlier stages, the handoff earlier. */
  var MW = 96, MH = 40, MS = 0.16, MX = 38;     /* size, scale, and the drawing's x at the left edge */
  function mx(x) { return (x - MX) * MS; }
  function my(y) { return (y - CY) * MS + MH / 2; }
  function mp(d) { return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, function (_, x, y) { return mx(+x).toFixed(2) + ',' + my(+y).toFixed(2); }); }
  function cont(d) { return d.replace(/^M[^ ]+ /, ' '); }     /* a path that continues the one before it */
  var M_FAN = [0, 1, 2, 3, 4, 5, 6], M_TRAJ = [0.6, 1.8, 3, 4.2, 5.4], M_NARROW = 0.07;     /* the tube of (a) is drawn a little open (m = 0.07), or its two edges would touch at this size */
  B.boundaryMini = function (state) {
    var g = '#39AD5B', h = '', k, i, ln = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
    function path(d, extra) { return '<path d="' + mp(d) + '" ' + ln + ' ' + extra + '/>'; }
    function vline(x, y, extra) { return '<path d="M' + mx(x).toFixed(2) + ',' + my(CY - y).toFixed(2) + ' V' + my(CY + y).toFixed(2) + '" ' + ln + ' ' + extra + '/>'; }
    var traj = 'stroke="#8E8E8E" stroke-width="0.9"', line = 'stroke="' + g + '" stroke-width="1.5"', way = 'stroke="' + g + '" stroke-width="1.3"';
    if (state === 'a') {
      var dash = 'stroke="#D6D6D6" stroke-width="1.1" stroke-dasharray="2.6 2.2"';
      for (k = 0; k < M_FAN.length; k++) h += path(trajA(M_FAN[k]), traj);
      h += '<path d="' + mp(fill(M_NARROW)) + '" fill="#9A9A9A" fill-opacity=".22"/>';
      h += path(edge(M_NARROW, -1), dash) + path(edge(M_NARROW, 1), dash);
    } else {
      var m = state === 'c';
      h += '<path d="' + mp((m ? extFill() + ' ' : '') + fill(1)) + '" fill="' + g + '" fill-opacity=".2"/>';
      for (k = 0; k < M_TRAJ.length; k++) { i = M_TRAJ[k]; h += path(m ? trajF(i) + cont(seg2(i, 1)) : seg2(i, 1), traj); }     /* (b): only inside its boundary; (c): from the left end */
      if (m) h += vline(XM, 100, 'stroke="' + g + '" stroke-width="1" stroke-dasharray="0.1 2.6"');
      h += path(m ? hlExt() + cont(hlPath(DOT_B, 1)) : hlPath(DOT_B, 1), way);
      h += path(m ? extEdge(-1) + cont(edge(1, -1)) : edge(1, -1), line) + path(m ? extEdge(1) + cont(edge(1, 1)) : edge(1, 1), line);
      h += vline(m ? XE : XM, m ? 108 : 100, line);
    }
    var o = 12 * MS, d = state === 'c' ? DOT_C : DOT_B;
    h += '<rect x="' + mx(XT).toFixed(2) + '" y="' + (MH / 2 - o).toFixed(2) + '" width="' + (2 * o).toFixed(2) + '" height="' + (2 * o).toFixed(2) + '" rx="0.6" fill="#141414" stroke="#EDEDED" stroke-width="1.2"/>';
    h += '<circle cx="' + mx(d[0]).toFixed(2) + '" cy="' + my(d[1]).toFixed(2) + '" r="3.2" fill="#FFC000" stroke="#000" stroke-width="1"/>';
    return '<svg class="bmini" viewBox="0 0 ' + MW + ' ' + MH + '" width="' + MW + '" height="' + MH + '" aria-hidden="true">' + h + '</svg>';
  };
})();
