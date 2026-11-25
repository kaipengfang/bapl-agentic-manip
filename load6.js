/* Boundary-Aware Policy Learning: fetching the page's media in page order.
   On a computer every image and video the page uses is fetched front to back, two files at a time; the two films of the Video section
   come last and are not waited for (they stream while they play). Over http(s) each file is fetched whole, which gives an exact share
   of bytes for the loading screen (gate6.js), and a video that has not started yet is switched to the downloaded copy, so that clips
   driven by scrolling never wait for the network (a video element alone stops buffering after a few seconds of a long file).
   From file:// there is no fetch: the video elements themselves preload, one after the other.
   On a phone nothing is fetched ahead: each part loads its videos when the reader gets there.
   Progress goes out as the document event 'bapl:load' with B.load as its detail. File sizes come from assets/data/sizes.js
   (generated from the files); a file missing there counts with a guess until its download reports its length. */
(function () {
  var B = window.B6, $$ = B.$$, html = document.documentElement;
  var SIZES = window.BAPL_SIZES || {}, HTTP = /^https?:$/.test(location.protocol) && !!window.fetch && !!window.Blob && !!window.URL;
  var PARTS = [['#top', 'Cover'], ['#boundary', 'Overview'], ['#stage1', 'Stage 1'], ['#stage2', 'Stage 2'], ['#console', 'Replay'],
               ['#results', 'Results'], ['#realTop', 'Real robot'], ['#video', 'Video'], ['#more', 'More results']];
  var TYPES = { mp4: 'video/mp4', webm: 'video/webm', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', svg: 'image/svg+xml' };
  var L = B.load = { items: [], parts: [], got: 0, total: 0, p: 0, done: false, started: false };
  var queue = [], active = 0, MAX = 2, raf = 0;
  /* while the loading screen is up the parts of the page do not start their own downloads, which would jump the queue */
  B.mayLoad = function () { return !html.classList.contains('gate-load'); };
  /* a part that needs a video asks for it here: load() resets an element, so a video that already has data (often the downloaded copy)
     or is already loading in full is left alone, and the part's own record of the frame it showed stays true */
  B.want = function (v) {
    if (v.readyState > 0 || v.preload === 'auto' && v.networkState === 2) return;
    v.preload = 'auto';
    try { v.load(); } catch (e) {}
  };

  function key(url) { var i = url.indexOf('/assets/'); return i < 0 ? url : decodeURIComponent(url.slice(i + 8).split(/[?#]/)[0]); }
  function abs(u) { try { return new URL(u, location.href).href; } catch (e) { return u; } }

  /* every file the page uses, in document order (which is reading order), grouped by the part of the page it belongs to */
  function collect() {
    var seen = {}, marks = PARTS.map(function (p) { return document.querySelector(p[0]); });
    L.parts = PARTS.map(function (p) { return { id: p[0].slice(1), label: p[1], got: 0, total: 0, n: 0, nDone: 0, late: false }; });
    function part(node) {
      var k = 0;
      for (var i = 0; i < marks.length; i++) if (marks[i] && (marks[i] === node || marks[i].compareDocumentPosition(node) & 4)) k = i;
      return k;
    }
    function add(url, kind, node, owner) {
      if (!url || /^(data|blob):/.test(url)) return;
      url = abs(url);
      if (seen[url]) { if (node) seen[url].nodes.push(node); return; }     /* one file, several elements (the cover and the strip) */
      var k = key(url), w = SIZES[k], it = { url: url, key: k, kind: kind, nodes: node ? [node] : [], part: part(owner), w: w || (kind === 'img' ? 6e4 : 1e6),
        sized: !!w, got: 0, state: 0, late: !!owner.closest('#player') };
      seen[url] = it; L.items.push(it);
    }
    $$('img, video, [data-video]').forEach(function (n) {
      if (n.tagName === 'VIDEO') {
        if (n.getAttribute('poster')) add(n.getAttribute('poster'), 'img', null, n);
        if (n.getAttribute('src')) add(n.getAttribute('src'), 'video', n, n);
      } else if (n.tagName === 'IMG') add(n.getAttribute('src'), 'img', n, n);
      else add(n.getAttribute('data-video'), 'tile', n, n);
    });
    /* a file that is both a poster and a frame of an early part keeps its first place; the films stay out of the count */
    L.items.forEach(function (it) { var p = L.parts[it.part]; if (it.late) { p.late = true; return; } p.total += it.w; p.n++; L.total += it.w; });
  }

  function emit() {
    raf = 0;
    L.p = L.total ? Math.min(1, L.got / L.total) : 1;
    document.dispatchEvent(new CustomEvent('bapl:load', { detail: L }));
  }
  function changed() { if (!raf) raf = requestAnimationFrame(emit); }
  function credit(it, n) { if (n <= 0) return; it.got += n; if (!it.late) { L.got += n; L.parts[it.part].got += n; } changed(); }
  function resize(it, n) {
    if (!n || n === it.w) return;
    if (!it.late) { L.total += n - it.w; L.parts[it.part].total += n - it.w; }
    it.w = n; it.sized = true;
  }
  function finish(it) {
    credit(it, it.w - it.got);
    it.state = 2;
    if (!it.late) L.parts[it.part].nDone++;
    active--; pump();
  }

  /* http(s): fetch the whole file, count its bytes; keep a video's bytes and hand them to its element if it has not started */
  function fetchWhole(it) {
    var keep = it.kind !== 'img', chunks = [];
    return fetch(it.url, { credentials: 'same-origin' }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      resize(it, +res.headers.get('content-length') || 0);
      var type = TYPES[(it.key.split('.').pop() || '').toLowerCase()] || res.headers.get('content-type') || '';
      if (!res.body || !res.body.getReader) return res.blob().then(function (b) { credit(it, b.size); return b; });
      var rd = res.body.getReader();
      return (function pump() {
        return rd.read().then(function (r) {
          if (r.done) return keep ? new Blob(chunks, { type: type }) : null;
          if (keep) chunks.push(r.value);
          credit(it, Math.min(r.value.length, it.w - it.got));
          return pump();
        });
      })();
    }).then(function (blob) {
      if (!blob) return;
      var u = URL.createObjectURL(blob);
      it.nodes.forEach(function (n) {
        if (it.kind === 'tile') n.setAttribute('data-video', u);
        else if (idle(n)) { n.preload = 'auto'; n.src = u; }     /* from memory: the first frame is ready before the reader arrives */
      });
    });
  }
  /* no data yet and not playing: switching it to the downloaded copy loses nothing (WebKit reports such an element as loading) */
  function idle(v) { return v.readyState === 0 && v.paused; }
  /* file://: let the element itself preload (the browser reads the file at once); pictures need nothing */
  function preloadElement(it) {
    return new Promise(function (ok) {
      var v = it.nodes[0];
      if (it.kind !== 'video' || v.readyState >= 3) { ok(); return; }
      var t = setTimeout(ok, 15000);
      function go() { clearTimeout(t); v.removeEventListener('canplaythrough', go); v.removeEventListener('error', go); ok(); }
      v.addEventListener('canplaythrough', go); v.addEventListener('error', go);
      if (v.readyState === 0 && v.networkState !== 2) { v.preload = 'auto'; try { v.load(); } catch (e) { go(); } }
      else if (v.preload !== 'auto') v.preload = 'auto';
    });
  }

  function pump() {
    while (active < MAX && queue.length) {
      var it = queue.shift();
      active++; it.state = 1;
      /* a video the page has already started everywhere it is used (the cover's, or one the reader reached) loads itself */
      if (HTTP && it.kind === 'video' && !it.nodes.some(idle)) { it.self = true; finish(it); continue; }
      (HTTP ? fetchWhole(it) : preloadElement(it)).then(finish.bind(null, it), function () { it.failed = true; finish(it); });
    }
    if (!active && !queue.length && !L.done) { L.done = true; emit(); films(); }
  }
  /* after everything else: the films, one after the other, as far as the browser buffers them ahead */
  function films() {
    var list = L.items.filter(function (it) { return it.late && it.kind === 'video'; });
    (function next() {
      var it = list.shift();
      if (!it) return;
      var v = it.nodes[0];
      if (v.readyState > 0 || v.networkState === 2) { next(); return; }
      var t = setTimeout(go, 15000);
      function go() { clearTimeout(t); v.removeEventListener('canplaythrough', go); v.removeEventListener('error', go); next(); }
      v.addEventListener('canplaythrough', go); v.addEventListener('error', go);
      v.preload = 'auto';
      try { v.load(); } catch (e) { go(); }
    })();
  }

  function start() {
    if (L.started) return;
    L.started = true;
    queue = L.items.filter(function (it) { return !it.late; });
    emit(); pump();
  }

  B.after = B.after || [];
  B.after.push(function () {
    if (html.classList.contains('is-phone')) return;
    collect();
    if (html.classList.contains('gate-load')) { start(); return; }     /* the loading screen is up: start at once */
    var later = function () { setTimeout(start, 600); };
    if (document.readyState === 'complete') later(); else window.addEventListener('load', later);
  });
})();
