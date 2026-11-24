/* Page 6, results and ending: one gallery with two groups and a clip viewer, the two main charts side by side, one player with two videos. */
(function () {
  'use strict';
  var B = window.B6, $ = B.$, $$ = B.$$, el = B.el, R = B.R;
  var reduce = B.mqReduce.matches;
  function playSafe(v) { var p = v.play(); if (p && p.catch) p.catch(B.noop); }

  /* ------------------------------------------------------------ clip viewer: one clip at a time, native controls to pause and drag, previous / next */
  var viewer = (function () {
    var dlg, video, label, group, count, prev, next, list = [], idx = 0, from = null, gname = '';
    function show(i) {
      idx = i;
      var it = list[i];
      label.textContent = it.label; group.textContent = gname; count.textContent = (i + 1) + ' / ' + list.length;
      prev.disabled = i === 0; next.disabled = i === list.length - 1;
      video.poster = B.ASSETS + it.poster; video.src = B.ASSETS + it.video;
      if (!reduce) playSafe(video);
    }
    function close() { if (dlg.open) dlg.close(); }
    return {
      init: function () {
        dlg = $('#viewer'); video = $('#vwVideo'); label = $('#vwLabel'); group = $('#vwGroup'); count = $('#vwCount'); prev = $('#vwPrev'); next = $('#vwNext');
        prev.addEventListener('click', function () { if (idx > 0) show(idx - 1); });
        next.addEventListener('click', function () { if (idx < list.length - 1) show(idx + 1); });
        $('#vwClose').addEventListener('click', close);
        dlg.addEventListener('click', function (ev) { if (ev.target === dlg) close(); });
        dlg.addEventListener('close', function () {
          video.pause(); video.removeAttribute('src'); try { video.load(); } catch (e) {}
          if (from && from.focus) from.focus({ preventScroll: true });
        });
        dlg.addEventListener('keydown', function (ev) {
          if (ev.target === video) return;
          if (ev.key === 'ArrowLeft') prev.click(); else if (ev.key === 'ArrowRight') next.click(); else return;
          ev.preventDefault();
        });
      },
      open: function (items, i, name, tile) {
        list = items; gname = name; from = tile;
        if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
        show(i);
      }
    };
  })();

  /* ------------------------------------------------------------ gallery tiles: a still that plays on hover; a click opens the viewer */
  var playingTile = null;
  function tileStop(tile) {
    if (!tile || !tile._v) return;
    var v = tile._v; tile._v = null;
    v.pause(); v.removeAttribute('src'); try { v.load(); } catch (e) {}
    if (v.parentNode) v.parentNode.removeChild(v);
    tile.classList.remove('is-playing');
    if (playingTile === tile) playingTile = null;
  }
  function tilePlay(tile) {
    if (playingTile && playingTile !== tile) tileStop(playingTile);
    if (tile._v) return;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
    v.preload = 'auto'; v.tabIndex = -1; v.src = tile.getAttribute('data-video');
    tile._v = v; tile.insertBefore(v, tile.firstChild.nextSibling);
    tile.classList.add('is-playing'); playingTile = tile;
    playSafe(v);
  }
  function makeTile(items, i, name) {
    var item = items[i], b = el('button', 'tile'); b.type = 'button';
    b.setAttribute('data-video', B.ASSETS + item.video);
    b.setAttribute('aria-label', 'Play the clip: ' + item.label);
    var img = document.createElement('img');
    img.loading = 'lazy'; img.decoding = 'async'; img.alt = ''; img.src = B.ASSETS + item.poster;
    b.appendChild(img);
    b.appendChild(el('span', 'tile-label', item.label));
    b.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse' && !reduce) tilePlay(b); });
    b.addEventListener('pointerleave', function () { tileStop(b); });
    b.addEventListener('click', function () { tileStop(b); viewer.open(items, i, name, b); });
    return b;
  }
  function initGallery() {
    viewer.init();
    var wall = $('#wall'), dojo = $('#wallDojo');
    R.wall.forEach(function (w, i) { wall.appendChild(makeTile(R.wall, i, 'RoboTwin 2.0')); });
    R.robodojo.forEach(function (d, i) { dojo.appendChild(makeTile(R.robodojo, i, 'RoboDojo')); });
  }

  /* ------------------------------------------------------------ horizontal bars of this half (own classes: mx-) */
  function methodHTML(n) { return n === 'π0.5' ? 'π<sub>0.5</sub>' : n; }
  function buildBars(root, rows) {
    var out = [];
    rows.forEach(function (r) {
      var row = el('div', 'mx-row' + (r.ours ? ' is-ours' : '')), inn = el('div', 'mx-rin');
      var name = el('div', 'mx-name'); name.innerHTML = '<b>' + methodHTML(r.name) + '</b>' + (r.kind ? '<small>' + r.kind + '</small>' : '');
      var track = el('div', 'mx-track'), bar = el('div', 'mx-bar'), val = el('span', 'mx-val');
      track.appendChild(bar); track.appendChild(val);
      inn.appendChild(name); inn.appendChild(track); row.appendChild(inn); root.appendChild(row);
      row.tabIndex = 0;
      out.push({ r: r, row: row, bar: bar, val: val, track: track });
    });
    var foot = el('div', 'mx-row mx-axis'), fin = el('div', 'mx-rin');
    fin.appendChild(el('div', 'mx-name'));
    var ft = el('div', 'mx-track');
    [0, 50, 100].forEach(function (v) { var s = el('span', null, String(v)); s.style.left = v + '%'; ft.appendChild(s); });
    ft.appendChild(el('em', null, 'success (%)'));
    fin.appendChild(ft); foot.appendChild(fin); root.appendChild(foot);
    return out;
  }
  function setBar(it, v, best) {
    var gone = v == null;
    it.row.classList.toggle('is-gone', gone);
    it.row.classList.toggle('is-best', !!best);
    it.row.setAttribute('aria-hidden', gone ? 'true' : 'false');
    it.row.tabIndex = gone ? -1 : 0;
    if (!gone) {
      it.bar.style.width = v + '%'; it.val.style.left = v + '%'; it.val.textContent = v.toFixed(1);
      it.row.setAttribute('aria-label', it.r.name + (it.r.kind ? ', ' + it.r.kind : '') + ': ' + v.toFixed(1));
    }
  }
  /* hovering or focusing a row lights it and dims the others; no new numbers appear */
  function bindHighlight(root, items, onHl) {
    items.forEach(function (it) {
      var on = function () { root.classList.add('has-hl'); items.forEach(function (x) { x.row.classList.toggle('is-hl', x === it); }); if (onHl) onHl(it); };
      var off = function () { root.classList.remove('has-hl'); it.row.classList.remove('is-hl'); };
      it.row.addEventListener('pointerenter', on); it.row.addEventListener('pointerleave', off);
      it.row.addEventListener('focus', on); it.row.addEventListener('blur', off);
    });
  }

  /* ------------------------------------------------------------ main result: one card, two tabs; the bars move between the tabs */
  function initMain() {
    var T = R.table1, root = $('#mainChart'), tabs = $$('#mainSwitch [role="tab"]'), foots = $$('#mainFoot p');
    var items = buildBars(root, T.rows.map(function (r) { return { name: r.method, kind: r.kind, ours: r.ours, src: r }; }));
    var ours = items.filter(function (it) { return it.r.ours; })[0];
    var gain = el('div', 'mx-gain'); gain.appendChild(el('span', null, '')); ours.track.appendChild(gain);
    bindHighlight(root, items);
    function set(k, focus) {
      var base = 0;
      items.forEach(function (it) {
        var v = it.r.src[k];
        setBar(it, v, T.best[k] === it.r.src.method);   /* a system without a result in this setting has no row (ORA on RoboDojo) */
        if (!it.r.ours && v != null && v > base) base = v;
      });
      gain.style.left = base + '%'; gain.style.width = (ours.r.src[k] - base) + '%';
      gain.firstChild.textContent = '+' + T.gain[k];
      tabs.forEach(function (b) {
        var on = b.getAttribute('data-k') === k;
        b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        if (on) { root.setAttribute('aria-labelledby', b.id); if (focus) b.focus(); }
      });
      foots.forEach(function (f) { f.classList.toggle('is-on', f.getAttribute('data-k') === k); });
      if (B.layoutProgress) setTimeout(B.layoutProgress, 700);   /* the ORA row folds: the page height changes */
    }
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { set(b.getAttribute('data-k')); });
      b.addEventListener('keydown', function (ev) {
        var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        set(tabs[(i + d + tabs.length) % tabs.length].getAttribute('data-k'), true); ev.preventDefault();
      });
    });
    set('c2r');
  }

  /* ------------------------------------------------------------ ablation: two switches select one of the four systems */
  function initAblation() {
    var A = R.ablation, root = $('#ablChart'), val = $('#abVal');
    /* rows of results.js: Harness VLA, + handoff protocol, + our policy, Ours (both) */
    var IDX = { '00': 0, '01': 1, '10': 2, '11': 3 }, KEY = ['00', '01', '10', '11'];
    var items = buildBars(root, A.map(function (a) { return { name: a.label, ours: a.ours, v: a.value }; }));
    items.forEach(function (it) { setBar(it, it.r.v, false); });
    var st = { p: 1, q: 1 };
    function sync() {
      var i = IDX['' + st.p + st.q];
      items.forEach(function (it, k) { it.row.classList.toggle('is-sel', k === i); it.row.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      val.textContent = A[i].value.toFixed(1);
      [['#abPolicy', st.p], ['#abProto', st.q]].forEach(function (g) {
        $$(g[0] + ' button').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-v') === g[1] ? 'true' : 'false'); });
      });
    }
    $$('#abPolicy button').forEach(function (b) { b.addEventListener('click', function () { st.p = +b.getAttribute('data-v'); sync(); }); });
    $$('#abProto button').forEach(function (b) { b.addEventListener('click', function () { st.q = +b.getAttribute('data-v'); sync(); }); });
    items.forEach(function (it, k) {
      var pick = function () { st.p = +KEY[k][0]; st.q = +KEY[k][1]; sync(); };
      it.row.addEventListener('pointerenter', pick); it.row.addEventListener('focus', pick); it.row.addEventListener('click', pick);
    });
    sync();
  }
  function initCharts() { initMain(); initAblation(); }

  /* ------------------------------------------------------------ one player, two videos (choice on the left, as on page 5); nothing plays before a click */
  function initPlayer() {
    /* two videos, one shown at a time; each has the page's own control (play button and progress line, story6.js clip), no native controls */
    var vids = {}, cur = 'highlights', tabs = $$('#vTabs button');
    $$('#player video').forEach(function (v) { vids[v.getAttribute('data-k')] = v; B.clip(v); });
    function show(k, focus) {
      cur = k;
      Object.keys(vids).forEach(function (n) {
        var v = vids[n], bar = v.nextElementSibling;
        if (!v.paused) v.pause();
        v.hidden = n !== k; if (bar && bar.classList.contains('cc')) bar.hidden = n !== k;
      });
      tabs.forEach(function (b) {
        var on = b.getAttribute('data-k') === k;
        b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
    }
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { show(b.getAttribute('data-k')); });
      b.addEventListener('keydown', function (ev) {
        var d = (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') ? 1 : (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') ? -1 : 0;
        if (!d) return;
        show(tabs[(i + d + tabs.length) % tabs.length].getAttribute('data-k'), true); ev.preventDefault();
      });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting) Object.keys(vids).forEach(function (n) { if (!vids[n].paused) vids[n].pause(); }); });
      }, { threshold: 0 }).observe($('#player'));
    }
    show(cur);
  }

  /* ------------------------------------------------------------ more results: folded rows, closed by default; every chart is built at load */
  function initMore() {
    var T = R.table1;
    /* RoboDojo by subset (as page 5, without the clips: they are in the gallery above) */
    var dojo = $('#mrDojoChart');
    [['gen', 'generalization'], ['mem', 'memory'], ['open', 'open vocabulary']].forEach(function (s) {
      var k = s[0], g = el('div', 'mr-dg');
      g.appendChild(el('p', 'mr-dhead', s[1]));
      var ch = el('div', 'mx-chart mr-small'); g.appendChild(ch); dojo.appendChild(g);
      var rows = T.rows.filter(function (r) { return r[k] != null; }).map(function (r) { return { name: r.method, ours: r.ours, src: r }; });
      buildBars(ch, rows).forEach(function (it) {
        setBar(it, it.r.src[k], T.best[k] === it.r.src.method);
        if ((it.r.src.dagger || []).indexOf(k) >= 0) it.val.textContent += '†';
      });
    });
    /* Table 1 with the clean scenes */
    var cols = T.columns, h = '<thead><tr><th rowspan="2"></th><th colspan="2">RoboTwin 2.0</th><th colspan="4">RoboDojo</th></tr><tr>';
    cols.forEach(function (c) { h += '<th class="n' + (c.main ? ' is-main' : '') + '">' + c.label + '</th>'; });
    h += '</tr></thead><tbody>';
    T.rows.forEach(function (r) {
      h += '<tr' + (r.ours ? ' class="is-ours"' : '') + '><th scope="row">' + methodHTML(r.method) + '</th>';
      cols.forEach(function (c) {
        var v = r[c.key], best = T.best[c.key] === r.method, dag = (r.dagger || []).indexOf(c.key) >= 0;
        h += '<td class="n' + (c.main ? ' is-main' : '') + (best ? ' is-best' : '') + '">' + (v == null ? '–' : v.toFixed(1) + (dag ? '†' : '')) + '</td>';
      });
      h += '</tr>';
    });
    $('#mrT1').innerHTML = h + '</tbody>';
    /* the policy alone in three settings */
    buildBars($('#mrAlone'), R.boundary.policy_alone.map(function (a) { return { name: a.label, v: a.value }; })).forEach(function (it) { setBar(it, it.r.v, false); });
    /* Table 2 */
    var t2 = '<thead><tr><th>Language model</th><th>Effort</th><th class="n">Success (%)</th><th class="bar"></th><th class="n">Cost (USD / episode)</th></tr></thead><tbody>';
    R.models.forEach(function (m, i) {
      t2 += '<tr' + (i === 0 ? ' class="is-ours"' : '') + '><td>' + m.model + '</td><td>' + m.effort + '</td><td class="n">' + m.success.toFixed(1) + '</td><td class="bar"><i style="width:' + m.success + '%"></i></td><td class="n">' + m.cost.toFixed(2) + '</td></tr>';
    });
    $('#mrT2').innerHTML = t2 + '</tbody>';
    /* opening or closing a row changes the page height: move the milestones of the nav */
    $$('details.mr-row').forEach(function (d) { d.addEventListener('toggle', function () { if (B.layoutProgress) B.layoutProgress(); }); });
    initCloser();
  }

  /* ------------------------------------------------------------ row "A closer look at agent-direct control": two charts with a hover layer.
     Numbers from the paper's tables tab_cl_results.csv (configurations passed),
     tab_cl_failures.csv (causes of the failed trials) and tab_cl_time.csv (the two inference shares, written in the row's text). */
  var CLOSER = {
    passed: [   /* percent and counts of configurations: first attempt, within three attempts, of all */
      { name: 'RoboTwin 2.0', tip: 'RoboTwin 2.0', first: 62.0, within: 72.0, n1: 31, n3: 36, of: 50 },
      { name: 'RoboDojo', tip: 'RoboDojo', first: 37.0, within: 48.1, n1: 20, n3: 26, of: 54 },
      { group: 'RoboDojo by category' },
      { name: 'Open-vocabulary', tip: 'RoboDojo, open-vocabulary', first: 62.5, within: 62.5, n1: 5, n3: 5, of: 8 },
      { name: 'Memory', tip: 'RoboDojo, memory', first: 50.0, within: 50.0, n1: 3, n3: 3, of: 6 },
      { name: 'Generalization', tip: 'RoboDojo, generalization', first: 41.7, within: 54.2, n1: 10, n3: 13, of: 24 },
      { name: 'Long-horizon', tip: 'RoboDojo, long-horizon', first: 25.0, within: 37.5, n1: 2, n3: 3, of: 8 },
      { name: 'Precision', tip: 'RoboDojo, precision', first: 0.0, within: 25.0, n1: 0, n3: 2, of: 8 }
    ],
    rings: [{ name: 'RoboTwin 2.0', n: 48 }, { name: 'RoboDojo', n: 94 }],
    total: 142,
    causes: [   /* failed trials per cause: RoboTwin 2.0, RoboDojo, total */
      { k: 'num', name: 'Unstated numeric criterion', v: [21, 14], total: 35, def: 'the success check requires a threshold or a target that the instruction does not state' },
      { k: 'amb', name: 'Ambiguous instruction', v: [6, 8], total: 14, def: 'the success check reads the instruction differently from the agent' },
      { k: 'itf', name: 'Interface defect', v: [14, 18], total: 32, def: 'from the interface that we built around each benchmark, such as a reach limit that we set' },
      { k: 'agt', name: 'Agent failure', v: [7, 54], total: 61 }
    ],
    agent: { title: 'Agent failure, 61 trials', n: 61, max: 22,
      types: [['Unfinished', 22], ['Manipulation error', 19], ['Disturbed other objects', 7], ['Misjudged final state', 7], ['Insufficient quality', 4], ['Misread task or scene', 2]] }
  };
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function f1(v) { return v.toFixed(1); }

  /* one tooltip per card: hover (mouse, pen), keyboard focus, and tap (a second tap on the same mark or a tap elsewhere closes it).
     Nothing is measured before the row is open: the tooltip is placed when it is shown. */
  function cardTips(card) {
    var tip = el('div', 'cl-tip card'), cur = null, wasOn = false;
    tip.hidden = true; tip.setAttribute('aria-hidden', 'true'); card.appendChild(tip);
    function place(t) {
      var cr = card.getBoundingClientRect(), r = (t.getTipRect ? t.getTipRect() : t.getBoundingClientRect());
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var x = r.left + r.width / 2 - cr.left - w / 2;
      x = Math.max(8, Math.min(cr.width - w - 8, x));
      var y = r.top - cr.top - h - 10;
      if (y < 6) y = r.bottom - cr.top + 10;
      tip.style.left = Math.round(x) + 'px'; tip.style.top = Math.round(y) + 'px';
    }
    function show(t) {
      cur = t; tip.innerHTML = t._tip(); tip.hidden = false; place(t);
      card.classList.add('has-hl'); if (t._hl) t._hl(true);
    }
    function hide(t) {
      if (t && cur !== t) return;
      if (cur && cur._hl) cur._hl(false);
      cur = null; tip.hidden = true; card.classList.remove('has-hl');
    }
    card.addEventListener('pointerdown', function (ev) { if (!ev.target.closest || !ev.target.closest('.cl-hot')) hide(); });
    document.addEventListener('pointerdown', function (ev) { if (cur && !card.contains(ev.target)) hide(); });
    return function bind(t, html, hl) {
      t._tip = html; t._hl = hl;
      t.classList.add('cl-hot'); t.setAttribute('tabindex', '0');
      t.addEventListener('pointerenter', function (ev) { if (ev.pointerType !== 'touch') show(t); });
      t.addEventListener('pointerleave', function (ev) { if (ev.pointerType !== 'touch') hide(t); });
      t.addEventListener('pointerdown', function (ev) { wasOn = ev.pointerType === 'touch' && cur === t; });
      t.addEventListener('focus', function () { show(t); });
      t.addEventListener('blur', function () { hide(t); });
      t.addEventListener('click', function () {
        if (wasOn) { wasOn = false; hide(); if (t.blur) t.blur(); } else if (cur !== t) show(t);
      });
      t.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') hide(); });
    };
  }

  /* chart A: configurations passed; per row one standard bar of the page (light grey, black outline, hard shadow) up to the first
     attempt, and the part passed only within three attempts as its paper-white extension (same outline, no shadow) */
  function initPassed(card) {
    var C = CLOSER.passed, h = '';
    /* one series only: the first attempt; the values within three attempts stay in the data, not in the picture */
    h += '<p class="chart-title cl-t1">Configurations passed on the first attempt (%)</p>';
    h += '<div class="cl-pass">';
    C.forEach(function (r) {
      if (r.group) { h += '<p class="cl-grp">' + r.group + '</p>'; return; }
      h += '<div class="cl-prow' + (r.tip.indexOf(',') > 0 ? ' is-cat' : '') + '" aria-label="' + r.tip + ': first attempt ' + r.n1 + ' of ' + r.of + '">' +
        '<span class="cl-pname">' + r.name + '</span> ' +
        '<span class="cl-ptrack">' + (r.first > 0 ? '<i class="cl-b1" style="width:' + r.first + '%"></i>' : '') +
        '<span class="cl-pval" style="left:' + r.first + '%"><b>' + f1(r.first) + '</b></span></span></div>';
    });
    h += '<div class="cl-paxis" aria-hidden="true"><span></span><span class="cl-ptrack">' + [0, 50, 100].map(function (v) { return '<span style="left:' + v + '%">' + v + '</span>'; }).join(' ') + '</span></div>';
    h += '</div>';
    card.innerHTML = h;
    var bind = cardTips(card), rows = $$('.cl-prow', card), k = 0;
    C.forEach(function (r) {
      if (r.group) return;
      var row = rows[k++];
      row.setAttribute('role', 'img');
      bind(row, function () {
        return '<b>' + r.tip + '</b><span><i class="sw cl-sw1"></i>first attempt <b>' + r.n1 + ' of ' + r.of + '</b></span>';
      }, function (on) { row.classList.toggle('is-hl', on); });
    });
  }

  /* chart B: two rings (areas proportional to the failed trials) and the bars of the agent failures, in the page's chart style:
     segments outlined in black, the three other causes in three light greys, "Agent failure" in one emphasis fill that the attribute
     data-agt of the card selects (red: a deep red; hatch: no red, ink hatching). The hatching of the rings is an SVG pattern. */
  function ringSector(c, r0, r1, a0, a1, gap) {
    var dO = Math.asin(gap / 2 / r1), dI = Math.asin(gap / 2 / r0);
    function p(r, a) { return (c + r * Math.sin(a)).toFixed(2) + ' ' + (c - r * Math.cos(a)).toFixed(2); }
    var big = (a1 - a0) > Math.PI ? 1 : 0;
    return 'M' + p(r1, a0 + dO) + ' A' + r1 + ' ' + r1 + ' 0 ' + big + ' 1 ' + p(r1, a1 - dO) +
      ' L' + p(r0, a1 - dI) + ' A' + r0 + ' ' + r0 + ' 0 ' + big + ' 0 ' + p(r0, a0 + dI) + ' Z';
  }
  function initCauses(card) {
    var D = CLOSER, RMAX = 74, HOLE = 0.56, GAP = 0;
    var h = '<p class="chart-title">Causes of the ' + D.total + ' failed trials</p>';
    h += '<div class="cl-rtop"><div class="cl-rings"></div><ul class="legend on-paper cl-lg cl-lg4">' +
      D.causes.map(function (c) { return '<li data-k="' + c.k + '"><i class="sw cl-sw-' + c.k + '"></i>' + c.name + '</li>'; }).join(' ') + '</ul></div>';
    h += '<div class="cl-agent"><p class="cl-sub"><i class="sw cl-sw-agt"></i>' + D.agent.title + '</p><div class="cl-abars">' +
      D.agent.types.map(function (t) {
        return '<div class="cl-arow" role="img" aria-label="' + t[0] + ': ' + t[1] + ' of ' + D.agent.n + ' agent failures"><span class="cl-aname">' + t[0] + '</span> ' +
          '<span class="cl-atrack"><i style="width:' + (t[1] / D.agent.max * 100).toFixed(2) + '%"></i><b style="left:' + (t[1] / D.agent.max * 100).toFixed(2) + '%">' + t[1] + '</b></span></div>';
      }).join(' ') + '</div></div>';
    card.innerHTML = h;
    var bind = cardTips(card), rings = $('.cl-rings', card), segs = [];
    var rBig = RMAX, nBig = Math.max.apply(null, D.rings.map(function (r) { return r.n; }));
    D.rings.forEach(function (rg, j) {
      var r1 = rBig * Math.sqrt(rg.n / nBig), r0 = r1 * HOLE, size = Math.ceil(2 * r1 + 2), c = size / 2;
      var fig = el('div', 'cl-ring');
      var svg = svgEl('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, role: 'group', 'aria-label': rg.name + ', ' + rg.n + ' failed trials' });
      if (j === 0) {   /* one pattern for both rings */
        var defs = svgEl('defs', {}), pat = svgEl('pattern', { id: 'clHatch', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
        pat.appendChild(svgEl('rect', { width: 5, height: 5, fill: '#fff' })); pat.appendChild(svgEl('rect', { width: 2, height: 5, fill: '#141414' }));
        defs.appendChild(pat); svg.appendChild(defs);
      }
      var a = 0;
      D.causes.forEach(function (cz) {
        var v = cz.v[j], a1 = a + v / rg.n * 2 * Math.PI, mid = (a + a1) / 2, rm = (r0 + r1) / 2;
        var g = svgEl('g', { 'class': 'cl-seg cl-f-' + cz.k, 'data-k': cz.k, role: 'img', 'aria-label': cz.name + ', ' + rg.name + ': ' + v + ' of ' + rg.n });
        g.appendChild(svgEl('path', { d: ringSector(c, r0, r1, a, a1, GAP) }));
        var t = svgEl('text', { x: (c + rm * Math.sin(mid)).toFixed(1), y: (c - rm * Math.cos(mid)).toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'central' });
        t.textContent = String(v); g.appendChild(t);
        svg.appendChild(g);
        segs.push({ g: g, k: cz.k, cz: cz, j: j });
        a = a1;
      });
      var n = svgEl('text', { 'class': 'cl-rn', x: c, y: c, 'text-anchor': 'middle', 'dominant-baseline': 'central' }); n.textContent = String(rg.n); svg.appendChild(n);
      fig.appendChild(svg); fig.appendChild(el('p', 'cl-rname', rg.name));
      rings.appendChild(fig); if (j === 0) rings.appendChild(document.createTextNode(' '));
    });
    /* one cause lit in both rings and in the legend */
    function light(k, on) {
      segs.forEach(function (s) { s.g.classList.toggle('is-hl', on && s.k === k); });
      $$('.cl-lg4 li', card).forEach(function (li) { li.classList.toggle('is-hl', on && li.getAttribute('data-k') === k); });
      card.classList.toggle('has-cause', on);
    }
    function causeTip(cz, j) {
      var s = '<b>' + cz.name + '</b>';
      if (cz.def) s += '<em class="cl-def">' + cz.def + '</em>';
      D.rings.forEach(function (rg, i) { s += '<span' + (i === j ? ' class="is-on"' : '') + '>' + rg.name + ' <b>' + cz.v[i] + ' of ' + rg.n + '</b></span>'; });
      return s + '<span' + (j == null ? ' class="is-on"' : '') + '>total <b>' + cz.total + ' of ' + D.total + '</b></span>';
    }
    segs.forEach(function (s) {
      s.g.getTipRect = function () { return s.g.getBoundingClientRect(); };
      bind(s.g, function () { return causeTip(s.cz, s.j); }, function (on) { light(s.k, on); });
    });
    $$('.cl-lg4 li', card).forEach(function (li, i) {
      var cz = D.causes[i];
      li.setAttribute('aria-label', cz.name + ': ' + cz.total + ' of ' + D.total);
      bind(li, function () { return causeTip(cz, null); }, function (on) { light(cz.k, on); });
    });
    $$('.cl-arow', card).forEach(function (row, i) {
      var t = D.agent.types[i];
      bind(row, function () { return '<b>' + t[0] + '</b><span>agent failures <b>' + t[1] + ' of ' + D.agent.n + '</b></span>'; },
        function (on) { row.classList.toggle('is-hl', on); card.classList.toggle('has-type', on); });
    });
  }
  function initCloser() {
    var a = $('#clPassed'), b = $('#clCauses');
    if (a) initPassed(a);
    if (b) initCauses(b);
  }

  /* a space between generated sibling elements, so that the text of the document reads as separate words and numbers (as page 5) */
  function spaceOut() {
    ['#mainChart', '#ablChart', '#mrDojoChart', '#mrT1', '#mrAlone', '#mrT2', '#clPassed', '#clCauses', '#tracks', '#monitors', '#log', '#realBar'].forEach(function (s) {
      var root = $(s);
      if (!root) return;
      $$('*', root).forEach(function (e) {
        var n = e.nextSibling;
        if (n && n.nodeType === 1) e.parentNode.insertBefore(document.createTextNode(' '), n);
      });
    });
  }
  B.parts.push(initGallery, initCharts, initPlayer, initMore);
  (B.after = B.after || []).push(spaceOut);
})();
