/* Page 6, story parts: clips that play once and hold (with a small control), the episode strip of the opening with its switching text,
   the three-state diagram on the scroll, and the small looping diagrams under the two stage titles. */
(function () {
  'use strict';
  var B = window.B6, $ = B.$, $$ = B.$$, el = B.el, clamp = B.clamp, span = B.span, lerp = B.lerp, pct = B.pct, E = B.E;
  var reduce = B.mqReduce.matches;
  /* how the clips are shown: without a window and without controls.
     The two other forms stay reachable for comparison: ?clips=frame (window only) and ?clips=full (window, play button, progress line). */
  var CLIPS = /[?&]clips=(frame|full)\b/.exec(location.search);
  document.documentElement.classList.add('clips-' + (CLIPS ? CLIPS[1] : 'bare'));
  var ICON = '<svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true"><path class="i-play" d="M5 3l12 7-12 7z"/><path class="i-pause" d="M4 3h4v14H4zM12 3h4v14h-4z"/></svg>';

  /* ------------------------------------------------------------ one clip: plays once, holds its last frame, can be paused and dragged.
     data-start (seconds, optional): the clip plays from there and restarts there; the progress line covers start to end.
     data-rate (optional): the playback rate (1.15 plays the clip 15% faster). data-dur / data-end are times in the clip, not durations
     of the play-through. */
  function clip(v) {
    var end = +v.getAttribute('data-end') || +v.getAttribute('data-dur') || 0, start = +v.getAttribute('data-start') || 0;
    var rate = +v.getAttribute('data-rate') || 1;
    /* some browsers reset the rate when the source loads: set it again then, and on every play */
    function speed() { if (rate !== 1 && v.playbackRate !== rate) { v.defaultPlaybackRate = rate; v.playbackRate = rate; } }
    speed();
    var subs = [], raf = 0, want = -1;
    /* the story clips (data-clip) loop: at the end they hold the last frame for a moment, then start again */
    var LOOP = v.hasAttribute('data-clip'), HOLD = 1500, looping = false, timer = 0;
    function again() { if (!LOOP || !looping || timer) return; timer = setTimeout(function () { timer = 0; if (looping) { seek(start); play(); } }, HOLD); }
    var bar = el('div', 'cc'), btn = el('button', 'cc-btn'), track = el('div', 'cc-track'), fill = el('i', 'cc-fill');
    btn.type = 'button'; btn.innerHTML = ICON; btn.setAttribute('aria-label', 'Play');
    track.setAttribute('role', 'slider'); track.setAttribute('tabindex', '0'); track.setAttribute('aria-label', 'Progress of the clip');
    track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', '100');
    track.appendChild(fill); bar.appendChild(btn); bar.appendChild(track);
    v.parentNode.insertBefore(bar, v.nextSibling);
    /* a clip with sound gets, at the end of its bar, a volume button that opens a vertical slider above it, and a full-screen button */
    if (!v.muted && !v.hasAttribute('muted')) {
      var vol = el('div', 'cc-vol'), volBtn = el('button', 'cc-ico cc-mute'), pop = el('div', 'cc-pop'), level = document.createElement('input');
      volBtn.type = 'button'; volBtn.setAttribute('aria-label', 'Volume'); volBtn.setAttribute('aria-expanded', 'false');
      volBtn.innerHTML = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path stroke="none" d="M3 7h3l4-4v14l-4-4H3z"/>' +
        '<g class="i-on" fill="none" stroke-width="1.6"><path d="M13 7.2a4 4 0 0 1 0 5.6"/><path d="M15.2 5a7 7 0 0 1 0 10"/></g>' +
        '<g class="i-off" fill="none" stroke-width="1.8"><path d="M13 7.5l5 5M18 7.5l-5 5"/></g></svg>';
      level.type = 'range'; level.className = 'cc-level'; level.min = '0'; level.max = '1'; level.step = '0.05'; level.value = String(v.volume);
      level.setAttribute('aria-label', 'Volume'); level.setAttribute('aria-orientation', 'vertical');
      pop.hidden = true; pop.appendChild(level); vol.appendChild(pop); vol.appendChild(volBtn);
      var full = el('button', 'cc-ico cc-full');
      full.type = 'button'; full.setAttribute('aria-label', 'Full screen');
      full.innerHTML = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><g fill="none" stroke-width="1.8"><path d="M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5"/></g></svg>';
      bar.appendChild(vol); bar.appendChild(full);
      var showVol = function () { var off = v.muted || v.volume === 0; vol.classList.toggle('is-muted', off); level.value = String(v.muted ? 0 : v.volume); };
      var openPop = function (on) { pop.hidden = !on; volBtn.setAttribute('aria-expanded', on ? 'true' : 'false'); if (on) level.focus({ preventScroll: true }); };
      volBtn.addEventListener('click', function (ev) { ev.stopPropagation(); openPop(pop.hidden); });
      pop.addEventListener('click', function (ev) { ev.stopPropagation(); });
      document.addEventListener('click', function () { if (!pop.hidden) openPop(false); });
      vol.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !pop.hidden) { openPop(false); volBtn.focus(); } });
      level.addEventListener('input', function () { v.volume = +level.value; v.muted = +level.value === 0; showVol(); });
      v.addEventListener('volumechange', showVol);
      showVol();
      /* full screen: the box of the video with its own bar (the browser's controls stay off) */
      var box = v.parentNode;
      full.addEventListener('click', function () {
        var fs = document.fullscreenElement || document.webkitFullscreenElement;
        if (fs) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
        var req = box.requestFullscreen || box.webkitRequestFullscreen;
        if (req) req.call(box);
      });
    }
    v.parentNode.classList.add('clipbox');
    v.loop = false;

    function now() { return want >= 0 ? want : v.currentTime; }
    function paint(t) {
      var q = end > start ? clamp((t - start) / (end - start), 0, 1) : 0;
      fill.style.width = (q * 100).toFixed(2) + '%';
      track.setAttribute('aria-valuenow', Math.round(q * 100));
      for (var k = 0; k < subs.length; k++) subs[k](t, end);
    }
    function state(on) { bar.classList.toggle('is-playing', on); btn.setAttribute('aria-label', on ? 'Pause' : 'Play'); }
    function loop() {
      raf = 0;
      if (v.paused) { state(false); return; }
      if (v.currentTime >= end - 0.03) { v.pause(); state(false); paint(end); again(); return; }
      paint(Math.max(start, now()));
      raf = requestAnimationFrame(loop);
    }
    function play() {
      looping = true;
      speed();
      var p = v.play();
      speed();
      if (p && p.catch) p.catch(B.noop);
      state(true);
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function pause() { looping = false; if (timer) { clearTimeout(timer); timer = 0; } if (!v.paused) v.pause(); state(false); }
    function seek(t) {
      t = clamp(t, start, Math.max(start, end - 0.02));
      want = t; paint(t);
      if (v.readyState < 1) { v.preload = 'auto'; try { v.load(); } catch (e) {} return; }
      if (v.seeking) return;
      want = -1;
      try { v.currentTime = t; } catch (e) {}
    }
    v.addEventListener('loadedmetadata', function () {
      speed();
      if (!+v.getAttribute('data-end') && isFinite(v.duration)) end = v.duration;
      if (want >= 0) { var t = want; want = -1; try { v.currentTime = t; } catch (e) {} }
    });
    v.addEventListener('seeked', function () { if (want >= 0) seek(want); });
    v.addEventListener('ended', function () { state(false); paint(end); again(); });
    v.addEventListener('pause', function () { state(false); });
    v.addEventListener('play', speed);

    btn.addEventListener('click', function () {
      if (!v.paused || timer) { pause(); return; }
      if (now() >= end - 0.06) seek(start);
      play();
    });
    var drag = false, was = false;
    function at(ev) { var r = track.getBoundingClientRect(); seek(start + clamp((ev.clientX - r.left) / r.width, 0, 1) * (end - start)); }
    track.addEventListener('pointerdown', function (ev) {
      if (ev.button) return;
      drag = true; was = !v.paused; pause();
      try { track.setPointerCapture(ev.pointerId); } catch (e) {}
      at(ev); ev.preventDefault(); track.focus({ preventScroll: true });
    });
    track.addEventListener('pointermove', function (ev) { if (drag) at(ev); });
    var up = function () { if (!drag) return; drag = false; if (was && now() < end - 0.06) play(); };
    track.addEventListener('pointerup', up); track.addEventListener('pointercancel', up);
    track.addEventListener('keydown', function (ev) {
      var k = ev.key, st = (end - start) / 20;
      if (k === 'ArrowRight' || k === 'ArrowUp') { pause(); seek(now() + st); }
      else if (k === 'ArrowLeft' || k === 'ArrowDown') { pause(); seek(now() - st); }
      else if (k === 'Home') { pause(); seek(start); }
      else if (k === 'End') { pause(); seek(end); }
      else if (k === ' ' || k === 'Enter') btn.click();
      else return;
      ev.preventDefault();
    });
    v.addEventListener('click', function () { btn.click(); });

    var api = {
      video: v,
      on: function (fn) { subs.push(fn); return api; },
      restart: function () { seek(start); play(); },
      cue: function () { pause(); seek(start); },     /* show the first frame and wait */
      pause: pause,
      still: function () { paint(end); }     /* the poster is the last frame: show the control at its end */
    };
    paint(end);
    return api;
  }
  B.clip = clip;

  /* A step whose picture is a video holds still for a short stretch once its text is centred: the step gets a
     sticky inner box one window high (class step-dwell, style.css), so the wheel keeps turning while nothing moves, and the reader
     finds the best place to watch. Only with pinned scenes; the box is harmless otherwise. */
  function initDwell() {
    $$('.scene .step').forEach(function (st) {
      var L = $('.layer', st);
      if (!L || !$('video[data-clip]', L) || st.classList.contains('step-tall')) return;
      var box = el('div', 'dw-pin');
      Array.prototype.slice.call(st.children).forEach(function (c) { if (c !== L) box.appendChild(c); });
      st.insertBefore(box, st.firstChild);
      st.classList.add('step-dwell');
    });
  }

  function initClips() {
    var io = null, free = [];
    $$('video[data-clip]').forEach(function (v) {
      var c = clip(v), L = v.closest('.layer');
      v._clip = c;
      if (L) {
        var id = L.id.replace('layer-', ''), prev = B.hooks[id];
        /* in a pinned scene the clip starts when its step becomes live */
        B.hooks[id] = function (on) {
          if (prev) prev(on);
          if (on && !reduce) c.restart(); else c.pause();
        };
        /* the first clip of a scene waits on its first frame while the scene comes up */
        B.cues[id] = function () { if (!reduce) c.cue(); };
      }
      free.push(c);
    });
    /* without pinned scenes (narrow screens) a clip starts once, when it comes into view */
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var c = e.target._clip;
          if (!e.isIntersecting) { if (!B.isPinned() || !e.target.closest('.layer')) c.pause(); return; }
          if (B.isPinned() && e.target.closest('.layer')) return;
          if (!reduce) c.restart();     /* loops while in view */
        });
      }, { threshold: 0.6 });
      free.forEach(function (c) { io.observe(c.video); });
    }
  }

  /* ------------------------------------------------------------ the episode strip: footage of the moment at the playhead, above the bar of the episode.
     It belongs to one tall step: the scroll over that step moves the playhead from the start of the episode to its end (B6.tallQ), in one go.
     The text of the step stays in place and has three states, decided only by the policy intervals of the episode (the same source as
     the Agent / Policy tag on the picture and the blocks of the bar): before, during and after.
     The footage is configured here: a main picture and an inset, each with its own map from episode time to frames
     ([t0, t1, f0, f1] as in episodes.js; before the first interval the first frame, between intervals the last frame reached). */
  var STRIP = {
    episode: 'cup_ours',
    tail: 0.94,     /* the playhead reaches the end at this fraction of the step; the rest holds the end state */
    main: {
      /* posters: the first and the last frame of the clip (the last one is used where the strip shows its final state) */
      src: 'assets/video/render/cup_before_scrub.mp4', poster: 'img/strip_main_first.jpg', poster_end: 'img/strip_main_last.jpg', fps: 25, n_frames: 905,
      frames: [[32, 47, 0, 313], [51, 99, 313, 413], [117, 130, 413, 592], [139, 155, 592, 739], [157, 171, 739, 864], [173, 180, 864, 904]]
    },
    /* the head camera of the same episode; null values are taken from the episode in episodes.js. Boxes are in the pixels of this picture. */
    inset: { src: null, poster: null, fps: null, n_frames: null, frames: null, size: [640, 480], label: 'head camera' }
  };
  var strip = null;
  function stepText(s) {
    /* what the step says; scores, chunk counts and planner details are left out */
    if (s.kind === 'policy') return '';     /* the command of a handoff is on the callout above the bar, and only there */
    return s.lines.filter(function (l) { return l !== 'Policy' && !/planner motion|chunk/.test(l); })
      .map(function (l) { return l.replace(/\s+\d\.\d+$/, '').replace(/"([^"]*)"/g, '“$1”'); }).join(', ');
  }
  function command(s) { return s.lines.filter(function (l) { return /^"/.test(l); }).map(function (l) { return l.replace(/"([^"]*)"/g, '“$1”'); }).join(', '); }
  function mkVideo(cfg, name) {
    var v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
    v.preload = 'none'; v.poster = cfg.poster; v.src = cfg.src; v.tabIndex = -1; v.setAttribute('aria-label', name);
    return v;
  }
  function initStrip() {
    var root = $('#strip');
    if (!root) return;
    var ep = E[STRIP.episode], END = ep.end, HAND = ep.policy[0][0], e;
    var ins = STRIP.inset, insCfg = {
      src: ins.src || B.ASSETS + ep.video, poster: ins.poster || B.ASSETS + ep.poster, fps: ins.fps || ep.fps,
      n_frames: ins.n_frames || ep.n_frames, frames: ins.frames || ep.frames
    };
    var S = strip = { ep: ep, END: END, HAND: HAND, t: -1, scrollT: -1, manual: false, step: -2, ready: false, phase: 0,
      tall: $('.step-tall[data-layer="strip"]'), sents: $$('#stripText .sw-s'), notes: $$('#stripText .sw-n'), vids: [] };

    /* footage window */
    var fig = el('figure', 'es-fig'), view = el('div', 'es-view');
    var vm = mkVideo(STRIP.main, 'The robot and the table, seen from the side');
    /* the poster of the main picture is painted by the window itself, so that it is cropped exactly like the video */
    vm.removeAttribute('poster'); S.view = view;
    vm.className = 'es-main'; view.appendChild(vm);
    S.who = el('span', 'es-who is-agent', 'Agent'); view.appendChild(S.who);
    S.inset = el('div', 'es-inset');
    var vi = mkVideo(insCfg, 'Head camera'); S.inset.appendChild(vi);
    S.boxes = ep.boxes.map(function (b) {
      var d = el('div', 'es-box'), W = ins.size[0], H = ins.size[1];
      d.style.left = (b.xyxy[0] / W * 100).toFixed(2) + '%'; d.style.top = (b.xyxy[1] / H * 100).toFixed(2) + '%';
      d.style.width = ((b.xyxy[2] - b.xyxy[0]) / W * 100).toFixed(2) + '%'; d.style.height = ((b.xyxy[3] - b.xyxy[1]) / H * 100).toFixed(2) + '%';
      d.appendChild(el('span', null, b.label.replace(/\s+\d\.\d+$/, '')));
      S.inset.appendChild(d);
      return { el: d, t0: b.t0, t1: b.t1 };
    });
    /* two boxes shown at once: the name of the second goes under its box, so that the names do not collide */
    S.boxes.forEach(function (b, i) { if (i > 0 && S.boxes[i - 1].t0 === b.t0) b.el.classList.add('is-below'); });
    S.inset.appendChild(el('span', 'es-inset-lab', ins.label));
    view.appendChild(S.inset);
    fig.appendChild(view);
    var cap = el('figcaption', 'es-cap');
    S.verb = el('span', 'es-verb'); S.line = el('span', 'es-line'); cap.appendChild(S.verb); cap.appendChild(S.line);
    fig.appendChild(cap);
    root.appendChild(fig);

    /* the bar of the episode, with its calls above and its steps below */
    var track = S.track = el('div', 'es-track');
    track.setAttribute('role', 'slider'); track.setAttribute('tabindex', '0'); track.setAttribute('aria-label', 'Episode time');
    track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', Math.round(END));
    var lead = el('div', 'es-lead');
    S.ticklab = el('span', 'es-ticklab', 'LLM calls'); lead.appendChild(S.ticklab);
    var hand = ep.steps.filter(function (s) { return s.kind === 'policy'; })[0];
    S.cmd = el('div', 'es-cmd'); S.cmd.style.left = pct(HAND, END);
    var card = el('span', 'card'); card.appendChild(el('b', null, 'handoff')); card.appendChild(document.createTextNode(' ' + command(hand)));
    S.cmd.appendChild(card); lead.appendChild(S.cmd);
    track.appendChild(lead);
    var bar = B.buildBar(ep, END), inn = S.inn = $('.obar-in', bar);
    /* the blocks are drawn up to the playhead; the handoff dot and the calls stay outside that clip */
    S.clip = el('div', 'es-clip');
    $$('.ob-base, .ob-agent, .ob-policy', inn).forEach(function (n) { S.clip.appendChild(n); });
    inn.insertBefore(S.clip, inn.firstChild);
    inn.insertBefore(el('div', 'es-ghost'), S.clip);
    S.dot = $('.ob-dot', inn); S.ticks = $$('.ob-tick', inn);
    track.appendChild(bar);
    var verbs = el('div', 'es-verbs');
    S.verbs = ep.steps.map(function (s, i) {
      e = el('span', 'es-vb lv' + (i % 3) + (s.kind === 'policy' ? ' is-policy' : '') + (s.t / END > 0.8 ? ' flip' : ''), s.verb);
      e.style.left = pct(s.t, END); verbs.appendChild(e);
      return e;
    });
    track.appendChild(verbs);
    S.head = el('div', 'es-head'); S.head.appendChild(el('i')); track.appendChild(S.head);
    root.appendChild(track);

    /* the two pictures follow one playhead: remember the frame wanted, seek only when the previous seek has landed */
    S.vids = [{ v: vm, cfg: STRIP.main, cur: -1, target: 0 }, { v: vi, cfg: insCfg, cur: -1, target: 0 }];
    S.vids.forEach(function (o) {
      o.v.addEventListener('loadedmetadata', function () { seekTo(o, o.target); });
      o.v.addEventListener('seeked', function () { if (o.target !== o.cur) seekTo(o, o.target); });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) loadStrip(); }); }, { rootMargin: '700px 0px' }).observe(root);
    } else loadStrip();

    /* dragging on the bar moves the playhead by hand, until the next scroll */
    var drag = false;
    function at(ev) { var r = inn.getBoundingClientRect(); S.manual = true; setStrip(clamp((ev.clientX - r.left) / r.width, 0, 1) * END); }
    track.addEventListener('pointerdown', function (ev) {
      if (ev.button) return;
      drag = true;
      try { track.setPointerCapture(ev.pointerId); } catch (x) {}
      track.classList.add('is-pointer');     /* no focus ring for a drag; the keys bring it back */
      at(ev); track.focus({ preventScroll: true }); ev.preventDefault();
    });
    track.addEventListener('pointermove', function (ev) { if (drag) at(ev); });
    var up = function () { drag = false; };
    track.addEventListener('pointerup', up); track.addEventListener('pointercancel', up);
    track.addEventListener('blur', function () { track.classList.remove('is-pointer'); });
    track.addEventListener('keydown', function (ev) {
      var k = ev.key, st = ev.shiftKey ? 10 : 2;
      track.classList.remove('is-pointer');
      if (k === 'ArrowRight' || k === 'ArrowUp') { S.manual = true; setStrip(S.t + st); }
      else if (k === 'ArrowLeft' || k === 'ArrowDown') { S.manual = true; setStrip(S.t - st); }
      else if (k === 'Home') { S.manual = true; setStrip(0); }
      else if (k === 'End') { S.manual = true; setStrip(END); }
      else return;
      ev.preventDefault();
    });
    B.strip = S;
  }
  function loadStrip() {
    if (strip.ready || !B.mayLoad()) return;     /* not while the loading screen is up: load6.js fetches in page order */
    strip.ready = true;
    strip.vids.forEach(function (o) { B.want(o.v); });
  }
  function seekTo(o, f) {
    o.target = f;
    if (f === o.cur) return;
    if (o.v.readyState < 1) { if (strip.ready) return; loadStrip(); return; }
    if (o.v.seeking) return;
    o.cur = f;
    try { o.v.currentTime = (f + 0.5) / o.cfg.fps; } catch (e) {}
  }
  function setStrip(t) {
    var S = strip, ep = S.ep, END = S.END;
    t = clamp(t, 0, END);
    if (t === S.t) return;
    S.t = t;
    var x = t / END * 100, handed = t >= S.HAND - 0.001;
    S.head.style.left = x.toFixed(3) + '%';
    S.clip.style.clipPath = 'inset(-3px ' + (100 - x).toFixed(3) + '% -3px -3px)';
    S.ticks.forEach(function (tk, i) { tk.classList.toggle('is-on', ep.call_times[i] <= t); });
    S.ticklab.classList.toggle('is-on', ep.call_times[0] <= t);
    S.dot.classList.toggle('is-on', handed);
    S.cmd.classList.toggle('is-on', handed);
    S.verbs.forEach(function (v, i) { v.classList.toggle('is-on', ep.steps[i].t <= t); });
    /* who controls the robot at t: one value for the tag on the picture and for the sentence beside the strip */
    var pol = ep.policy.some(function (p) { return t >= p[0] - 0.001 && t < p[1]; });
    var phase = pol ? 2 : t < ep.policy[0][0] ? 1 : 3;
    if (pol !== S.pol) { S.pol = pol; S.who.textContent = pol ? 'Policy' : 'Agent'; S.who.className = 'es-who ' + (pol ? 'is-policy' : 'is-agent'); }
    if (phase !== S.phase) {
      S.phase = phase;
      /* the sentences before the current one have left upwards, those after it wait below (CSS rolls them) */
      S.sents.forEach(function (n, i) { n.classList.toggle('is-cur', i === phase - 1); n.classList.toggle('is-past', i < phase - 1); });
      S.notes.forEach(function (n, i) { n.classList.toggle('is-cur', i === phase - 1); });
    }
    var si = B.lastAt(ep.steps, t);
    if (si !== S.step) {
      S.step = si;
      var s = ep.steps[si];
      /* before the first step the line is empty; during a handoff it shows the verb only */
      S.verb.textContent = s ? s.verb : '';
      S.verb.className = 'es-verb' + (!s ? ' is-empty' : s.kind === 'policy' ? ' is-policy' : '');
      S.line.textContent = s ? stepText(s) : '';
    }
    var looking = false;
    S.boxes.forEach(function (b) { var on = t >= b.t0 && t < b.t1; b.el.classList.toggle('is-on', on); looking = looking || on; });
    S.inset.classList.toggle('is-looking', looking);
    S.vids.forEach(function (o) { seekTo(o, B.frameAt(o.cfg, t)); });
    S.track.setAttribute('aria-valuenow', Math.round(t)); S.track.setAttribute('aria-valuetext', Math.round(t) + ' s');
  }
  function updateStrip() {
    if (!strip) return;
    var S = strip, po = B.isPinned() ? STRIP.main.poster : STRIP.main.poster_end;
    if (po !== S.poster) { S.poster = po; S.view.style.backgroundImage = 'url("' + po + '")'; }
    /* one continuous mapping over the tall step; without pinning the strip shows its end state */
    var t = span(B.tallQ(S.tall), 0, STRIP.tail) * S.END;
    if (t === S.scrollT) return;     /* the scroll did not move the playhead: a position set by hand stays */
    S.scrollT = t; S.manual = false;
    setStrip(t);
  }

  /* ------------------------------------------------------------ the idea: (a) to (b) to (c) on the scroll */
  var idea = null;
  /* The headline beside the diagram: of the two verbs, the one of the current state is large (a class; CSS animates the size), and the
     typeface follows the diagram inside that state: "shape" gains weight as the tube opens into the funnel (the m of the drawing),
     "expand" widens as the boundary extends to earlier stages (its q). ch: 0, 1, 2 for (a), (b), (c); anything else shows no state. */
  var WEIGHT = [450, 800], WIDTH = [84, 125];     /* ranges of the two axes of the typeface, start to end of a state */
  function ideaHead(root) {
    var sh = $('.il-shape', root), ex = $('.il-expand', root), cur = -9;
    return function (ch, p) {
      if (ch !== cur) { cur = ch; sh.classList.toggle('is-on', ch === 1); ex.classList.toggle('is-on', ch === 2); }
      sh.style.fontWeight = ch === 1 ? String(Math.round(lerp(WEIGHT[0], WEIGHT[1], B.ease(span(p, 0.03, 0.45))))) : '';
      ex.style.fontStretch = ch === 2 ? lerp(WIDTH[0], WIDTH[1], B.ease(span(p, 0.05, 0.7))).toFixed(1) + '%' : '';
    };
  }
  B.ideaHead = ideaHead;
  function initIdea() {
    var sec = $('#idea'), figs = $$('.bd-fig', sec);
    idea = { sec: sec, figs: figs, draws: figs.map(function (f, i) { return B.boundaryDiagram($('.bd-svg', f), '_' + i); }), head: ideaHead($('#ideaLine')), ch: -1, p: -1, live: null };
    setIdeaMode();
  }
  function setIdeaMode() {
    /* pinned: one diagram that follows the scroll; otherwise the three final states one under the other */
    var live = B.isPinned();
    if (live === idea.live) return;
    idea.live = live; idea.ch = -1; idea.p = -1;
    if (!live) {
      idea.draws.forEach(function (d, i) { d(i, 1); });
      idea.figs.forEach(function (f) { f.classList.remove('is-on'); });
      idea.sec.setAttribute('data-ch', 'all');
      idea.head(-1, 0);
    } else {
      idea.figs.forEach(function (f, i) { f.classList.toggle('is-on', i === 0); });
      idea.sec.setAttribute('data-ch', '0');
      idea.draws[0](0, 0); idea.head(0, 0); idea.ch = 0; idea.p = 0;
      updateIdea();
    }
  }
  function updateIdea() {
    if (!idea) return;
    if (idea.live !== B.isPinned()) { setIdeaMode(); return; }
    if (!idea.live) return;
    var r = idea.sec.getBoundingClientRect(), vh = window.innerHeight, L = r.height - vh, s = -r.top;
    if (s < -vh * 1.2 || s > L + vh * 0.5) return;
    /* (c) is complete at two thirds of the pinned distance; the rest holds the final state */
    var ch, p;
    if (s < 0.14 * L) { ch = 0; p = span(s, -0.25 * vh, 0.14 * L); }
    else if (s < 0.40 * L) { ch = 1; p = span(s, 0.14 * L, 0.40 * L); }
    else { ch = 2; p = span(s, 0.40 * L, 0.66 * L); }
    if (ch === idea.ch && Math.abs(p - idea.p) < 0.003) return;
    if (ch !== idea.ch) {
      idea.figs.forEach(function (f, i) { f.classList.toggle('is-on', i === ch); });
      idea.sec.setAttribute('data-ch', ch);
    }
    idea.ch = ch; idea.p = p;
    idea.draws[ch](ch, p);
    idea.head(ch, p);
  }

  /* ------------------------------------------------------------ under each stage title: what the stage does, as one transition of the diagram that replays.
     Stage 1 is (a) to (b), stage 2 is (b) to (c). One cycle: rest on the start state, play, hold the end state, fade out, back to the start, fade in. */
  var LOOP = { rest: 0.7, play: 3.5, hold: 2.5, fade: 0.4 };
  function initLoops() {
    $$('.stage-loop').forEach(function (box, k) {
      var ch = +box.getAttribute('data-loop'), draw = B.boundaryDiagram($('.bd-svg', box), '_L' + k);
      if (reduce) { draw(ch, 1); return; }
      var t0 = 0, raf = 0, on = false, last = -1, total = LOOP.rest + LOOP.play + LOOP.hold + 2 * LOOP.fade;
      draw(ch, 0);
      function frame(now) {
        raf = 0;
        if (!on) return;
        var t = ((now - t0) / 1000) % total, p, a = 1;
        if (t < LOOP.rest) p = 0;
        else if (t < LOOP.rest + LOOP.play) p = (t - LOOP.rest) / LOOP.play;
        else if (t < LOOP.rest + LOOP.play + LOOP.hold) p = 1;
        else if (t < total - LOOP.fade) { p = 1; a = 1 - (t - (total - 2 * LOOP.fade)) / LOOP.fade; }
        else { p = 0; a = (t - (total - LOOP.fade)) / LOOP.fade; }
        if (p !== last) { last = p; draw(ch, p); }
        box.style.opacity = a.toFixed(3);
        raf = requestAnimationFrame(frame);
      }
      function set(v) {
        if (v === on) return;
        on = v;
        if (on) { t0 = performance.now(); last = -1; if (!raf) raf = requestAnimationFrame(frame); }
        else { box.style.opacity = ''; }
      }
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (en) { set(en.isIntersecting); }); }, { threshold: 0.35 }).observe(box);
      else draw(ch, 1);
    });
  }

  /* ------------------------------------------------------------ loading
     While a video that should play (or show a frame) is still waiting for data, a small spinner turns over it.
     Fetching the page's media in page order is load6.js. */
  function initLoading() {
    var vids = $$('video').filter(function (v) { return !v.classList.contains('hero-bg'); });
    vids.forEach(function (v) {
      var box = v.parentNode, sp = el('i', 'vload'), timer = 0;
      if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
      sp.setAttribute('aria-hidden', 'true'); box.appendChild(sp);
      function place() {
        var a = v.getBoundingClientRect(), b = box.getBoundingClientRect();
        sp.style.left = (a.left - b.left + a.width / 2).toFixed(1) + 'px'; sp.style.top = (a.top - b.top + a.height / 2).toFixed(1) + 'px';
      }
      function on() { if (timer || v.hidden) return; timer = setTimeout(function () { timer = 0; if (v.readyState < 3) { place(); sp.classList.add('is-on'); } }, 250); }
      function off() { if (timer) { clearTimeout(timer); timer = 0; } sp.classList.remove('is-on'); }
      v.addEventListener('waiting', on);
      v.addEventListener('seeking', function () { if (v.readyState < 3) on(); });
      ['playing', 'canplay', 'canplaythrough', 'seeked', 'pause', 'error', 'emptied'].forEach(function (e) { v.addEventListener(e, off); });
    });
  }

  B.parts.push(initDwell, initClips, initStrip);
  B.after = (B.after || []).concat([initLoading]);
  B.scroll.push(updateIdea, updateStrip);
  B.resize.push(updateIdea, updateStrip);
  /* the diagram and the strip need to know whether scenes are pinned, which is decided in initScenes: run after it */
  B.after = B.after || [];
  B.after.push(initIdea, initLoops, updateStrip);
})();
