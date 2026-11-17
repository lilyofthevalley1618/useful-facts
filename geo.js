/* Geography tab: interactive maps, learn + Find it + Name it practice. */
(function () {
  const GKEY = "usefulFacts.geo.v1";
  const SESSION_N = 10;
  const GD = () => window.GeoData;
  const esc = (s) => (window.Facts && window.Facts.esc) ? window.Facts.esc(s) : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => (window.Facts && window.Facts.shuffle) ? window.Facts.shuffle(a) : a.slice().sort(() => Math.random() - 0.5);
  const advanceClickOk = (el) => (window.Facts && window.Facts.advanceClickOk) ? window.Facts.advanceClickOk(el) : true;
  const $ = (s, el = document) => el.querySelector(s);
  const app = () => document.getElementById("app");

  const blank = () => ({ items: {}, resume: null });
  let geo = blank();
  try {
    const raw = JSON.parse(localStorage.getItem(GKEY) || "null");
    if (raw && typeof raw === "object") geo = Object.assign(blank(), raw, { items: raw.items || {} });
  } catch (e) {}
  const save = () => { try { localStorage.setItem(GKEY, JSON.stringify(geo)); } catch (e) {} };

  function keyFor(kind, id) { return (kind === "us" ? "s:" : "w:") + id; }
  function rec(kind, id) {
    const k = keyFor(kind, id);
    if (!geo.items[k]) geo.items[k] = { seen: 0, right: 0, wrong: 0 };
    return geo.items[k];
  }
  function known(r) { return (r.right || 0) >= 2 && (r.right || 0) > (r.wrong || 0); }
  function weight(r) {
    r = r || { seen: 0, right: 0, wrong: 0 };
    return 1 + (r.wrong || 0) * 3 + ((r.right || 0) === 0 ? 2 : 0) + Math.max(0, 2 - (r.right || 0));
  }
  function list(kind, region) {
    const all = kind === "us" ? GD().STATES : GD().WORLD;
    return region && region !== "All" ? all.filter(x => x.region === region) : all.slice();
  }
  function pickSession(items, kind, n) {
    const bag = items.map(it => ({ it, w: weight(rec(kind, it.id)) }));
    const out = [];
    n = Math.min(n || SESSION_N, bag.length);
    for (let i = 0; i < n; i++) {
      const total = bag.reduce((s, b) => s + b.w, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (; idx < bag.length; idx++) { r -= bag[idx].w; if (r <= 0) break; }
      if (idx >= bag.length) idx = bag.length - 1;
      out.push(bag[idx].it);
      bag.splice(idx, 1);
    }
    return out;
  }
  function statsFor(kind, region) {
    const items = list(kind, region);
    const k = items.filter(it => known(rec(kind, it.id))).length;
    return { known: k, total: items.length };
  }

  const cache = {};
  async function loadTopo(kind) {
    if (cache[kind]) return cache[kind];
    const url = kind === "us" ? "data/states-10m.json" : "data/countries-50m.json";
    const json = await fetch(url).then(r => { if (!r.ok) throw new Error("Could not load map data."); return r.json(); });
    cache[kind] = json;
    return json;
  }
  function feats(topo, kind) {
    const obj = kind === "us" ? topo.objects.states : topo.objects.countries;
    return window.topojson.feature(topo, obj).features;
  }
  function featId(f) { return f.id || (f.properties && f.properties.name) || ""; }
  function catalog(kind) { return kind === "us" ? GD().STATES : GD().WORLD; }
  function findItem(kind, id) { return catalog(kind).find(x => x.id === id); }
  function itemForFeat(kind, f) {
    const id = featId(f);
    return catalog(kind).find(x => x.id === id || x.name === (f.properties && f.properties.name));
  }

  function mainland(feature, d3) {
    const g = feature.geometry;
    if (!g || g.type === "Polygon") return feature;
    if (g.type !== "MultiPolygon") return feature;
    const parts = g.coordinates.map(coords => ({ type: "Feature", geometry: { type: "Polygon", coordinates: coords } }));
    parts.sort((a, b) => d3.geoArea(b) - d3.geoArea(a));
    const main = parts[0];
    const c0 = d3.geoCentroid(main);
    const keep = parts.filter(p => d3.geoDistance(c0, d3.geoCentroid(p)) < 0.45);
    if (keep.length === 1) return main;
    return { type: "Feature", geometry: { type: "MultiPolygon", coordinates: keep.map(p => p.geometry.coordinates) } };
  }

  let advanceFn = null;
  document.addEventListener("click", e => {
    if (!advanceFn) return;
    if (e.target && (e.target.id === "snd" || (e.target.closest && e.target.closest("#snd")))) return;
    if (!advanceClickOk(e.target)) return;
    const fn = advanceFn; advanceFn = null; fn();
  });

  function soundBtn() { return (window.UF && window.UF.soundBtn) ? window.UF.soundBtn() : ""; }
  function ding() { if (window.UF && window.UF.ding) window.UF.ding(); }
  function nav(extra) {
    return `<div class="topbar"><button class="ghost" id="h">Geography home</button><div class="actions">${soundBtn()}${extra || ""}</div></div>`;
  }

  function setTab(which) {
    const les = document.getElementById("tab-lessons");
    const g = document.getElementById("tab-geo");
    if (les) les.classList.toggle("on", which === "lessons");
    if (g) g.classList.toggle("on", which === "geo");
  }

  function open(opts) {
    setTab("geo");
    const shot = opts && opts.shot;
    if (shot === "map") return startLearn("world", "All", { shot: true });
    if (shot === "us") return startLearn("us", "All", { shot: true });
    hub();
  }

  function hub() {
    setTab("geo");
    advanceFn = null;
    const w = statsFor("world", "All");
    const u = statsFor("us", "All");
    app().innerHTML = `
      <section class="cover">
        <p class="kicker">A practice atlas</p>
        <h1>Geography</h1>
        <p class="cover-lead">Learn where countries and U.S. states are. Tap the map to look around, then try Find it or Name it. No passing score — just practice, especially the ones you miss.</p>
      </section>
      <div class="geo-hub-grid">
        <button class="geo-poster" id="go-world">
          <h2>World countries</h2>
          <p>${w.known} of ${w.total} feeling familiar. Grouped by region so you can learn in chunks.</p>
        </button>
        <button class="geo-poster" id="go-us">
          <h2>U.S. states</h2>
          <p>${u.known} of ${u.total} feeling familiar, including Washington, D.C. Grouped by census division.</p>
        </button>
      </div>
      <p class="muted" style="margin-top:1.2rem">Maps are from Natural Earth (public domain) and the U.S. Census Bureau, bundled here via world-atlas and us-atlas. Made with Natural Earth.</p>`;
    $("#go-world").onclick = () => sectionHome("world");
    $("#go-us").onclick = () => sectionHome("us");
  }

  function sectionHome(kind) {
    setTab("geo");
    const regions = kind === "us" ? GD().STATE_REGIONS : GD().WORLD_REGIONS;
    const title = kind === "us" ? "U.S. states" : "World countries";
    const all = statsFor(kind, "All");
    const chips = [`<button class="chip on" data-region="All">All (${all.known}/${all.total})</button>`]
      .concat(regions.map(r => {
        const s = statsFor(kind, r);
        return `<button class="chip" data-region="${esc(r)}">${esc(r)} (${s.known}/${s.total})</button>`;
      })).join("");
    app().innerHTML = `
      ${nav("")}
      <section class="cover">
        <p class="kicker">${esc(title)}</p>
        <h1 style="font-size:clamp(2.2rem,7vw,4rem)">${esc(title)}</h1>
        <p class="cover-lead">Pick a region, then learn the map or start a short practice of about 10 places. Missed ones show up more often.</p>
      </section>
      <div class="chips" id="regs">${chips}</div>
      <div class="actions">
        <button id="learn">Learn the map</button>
        <button class="alt" id="find">Find it</button>
        <button class="alt" id="name">Name it</button>
      </div>`;
    $("#h").onclick = hub;
    let region = "All";
    app().querySelectorAll("#regs .chip").forEach(c => c.onclick = () => {
      app().querySelectorAll("#regs .chip").forEach(x => x.classList.remove("on"));
      c.classList.add("on");
      region = c.dataset.region;
    });
    $("#learn").onclick = () => startLearn(kind, region);
    $("#find").onclick = () => startPractice(kind, region, "find");
    $("#name").onclick = () => startPractice(kind, region, "name");
  }

  function MapView(frame, opts) {
    const d3 = window.d3geo;
    const self = this;
    this.kind = opts.kind;
    this.topo = opts.topo;
    this.features = feats(opts.topo, opts.kind);
    this.onTap = opts.onTap || (() => {});
    this.locked = false;
    const W = 1000, H = 560;
    this.vb = { x: 0, y: 0, w: W, h: H };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", opts.kind === "us" ? "Map of the United States" : "Map of the world");
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    frame.innerHTML = "";
    frame.appendChild(svg);
    const tools = document.createElement("div");
    tools.className = "map-tools";
    tools.innerHTML = `<button type="button" id="zIn" aria-label="Zoom in">+</button><button type="button" id="zOut" aria-label="Zoom out">−</button><button type="button" id="zRst" aria-label="Reset map">⌂</button>`;
    frame.appendChild(tools);

    const proj = opts.kind === "us" ? d3.geoAlbersUsa() : d3.geoNaturalEarth1();
    const all = this.features.filter(f => featId(f) !== "010" && (f.properties && f.properties.name) !== "Antarctica");
    let fitSet = all;
    if (opts.region && opts.region !== "All") {
      const ids = new Set(list(opts.kind, opts.region).map(x => x.id));
      fitSet = all.filter(f => {
        const it = itemForFeat(opts.kind, f);
        return it && ids.has(it.id);
      });
      if (!fitSet.length) fitSet = all;
    }
    const fitFC = {
      type: "FeatureCollection",
      features: fitSet.map(f => mainland(f, d3))
    };
    proj.fitExtent([[16, 16], [W - 16, H - 16]], fitFC);
    this.proj = proj;
    this.path = d3.geoPath(proj);
    this.baseFit = { type: "FeatureCollection", features: all.map(f => mainland(f, d3)) };
    this.g = g; this.svg = svg; this.frame = frame; this.W = W; this.H = H;

    const paths = {};
    all.forEach(f => {
      const d = this.path(f);
      if (!d) return;
      const id = featId(f);
      const it = itemForFeat(opts.kind, f);
      const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      el.setAttribute("d", d);
      el.setAttribute("class", "geo");
      el.dataset.id = it ? it.id : id;
      el.setAttribute("tabindex", it ? "0" : "-1");
      if (it) el.setAttribute("aria-label", it.name);
      g.appendChild(el);
      paths[el.dataset.id] = paths[el.dataset.id] || [];
      paths[el.dataset.id].push(el);
      const b = this.path.bounds(f);
      const bw = b[1][0] - b[0][0], bh = b[1][1] - b[0][1];
      const c = this.path.centroid(f);
      if (it && Number.isFinite(c[0]) && (bw < 14 || bh < 14 || bw * bh < 120)) {
        const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        hit.setAttribute("class", "hit");
        hit.setAttribute("cx", c[0]); hit.setAttribute("cy", c[1]);
        hit.setAttribute("r", 12);
        hit.dataset.id = it.id;
        hit.setAttribute("aria-label", it.name);
        g.appendChild(hit);
      }
    });
    this.paths = paths;

    const tap = id => { if (!self.locked && id) self.onTap(id); };
    g.addEventListener("click", e => {
      const t = e.target.closest("[data-id]");
      if (t && t.dataset.id) { e.stopPropagation(); tap(t.dataset.id); }
    });
    g.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && e.target.dataset.id) { e.preventDefault(); tap(e.target.dataset.id); }
    });

    // pan / zoom via viewBox
    this.applyVb = () => svg.setAttribute("viewBox", `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`);
    this.zoomAt = (cx, cy, factor) => {
      const { x, y, w, h } = this.vb;
      const nw = Math.max(80, Math.min(4000, w * factor));
      const nh = nw * (H / W);
      const px = (cx / frame.clientWidth) * w + x;
      const py = (cy / frame.clientHeight) * h + y;
      this.vb = { w: nw, h: nh, x: px - (cx / frame.clientWidth) * nw, y: py - (cy / frame.clientHeight) * nh };
      this.applyVb();
    };
    this.reset = () => { this.vb = { x: 0, y: 0, w: W, h: H }; this.applyVb(); };
    tools.querySelector("#zIn").onclick = ev => { ev.stopPropagation(); this.zoomAt(frame.clientWidth / 2, frame.clientHeight / 2, 0.7); };
    tools.querySelector("#zOut").onclick = ev => { ev.stopPropagation(); this.zoomAt(frame.clientWidth / 2, frame.clientHeight / 2, 1.35); };
    tools.querySelector("#zRst").onclick = ev => { ev.stopPropagation(); this.reset(); };

    let dragging = false, pid = null, lx = 0, ly = 0, moved = false;
    let pinch = null;
    const pt = ev => {
      const r = frame.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    };
    frame.addEventListener("pointerdown", ev => {
      if (ev.target.closest(".map-tools")) return;
      if (ev.pointerType === "touch" && ev.isPrimary === false) return;
      frame.setPointerCapture(ev.pointerId);
      dragging = true; pid = ev.pointerId; moved = false;
      const p = pt(ev); lx = p.x; ly = p.y;
    });
    frame.addEventListener("pointermove", ev => {
      if (!dragging || ev.pointerId !== pid) return;
      const p = pt(ev);
      const dx = p.x - lx, dy = p.y - ly;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      const { w, h } = this.vb;
      this.vb.x -= dx * (w / frame.clientWidth);
      this.vb.y -= dy * (h / frame.clientHeight);
      lx = p.x; ly = p.y;
      this.applyVb();
    });
    const endDrag = ev => {
      if (ev.pointerId !== pid) return;
      dragging = false; pid = null;
    };
    frame.addEventListener("pointerup", endDrag);
    frame.addEventListener("pointercancel", endDrag);
    frame.addEventListener("click", ev => { if (moved) ev.stopPropagation(); }, true);
    frame.addEventListener("wheel", ev => {
      ev.preventDefault();
      const p = pt(ev);
      this.zoomAt(p.x, p.y, ev.deltaY > 0 ? 1.12 : 0.88);
    }, { passive: false });
    frame.addEventListener("touchstart", ev => {
      if (ev.touches.length === 2) {
        const [a, b] = ev.touches;
        pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) };
      }
    }, { passive: true });
    frame.addEventListener("touchmove", ev => {
      if (ev.touches.length === 2 && pinch) {
        ev.preventDefault();
        const [a, b] = ev.touches;
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const r = frame.getBoundingClientRect();
        const cx = (a.clientX + b.clientX) / 2 - r.left;
        const cy = (a.clientY + b.clientY) / 2 - r.top;
        this.zoomAt(cx, cy, pinch.d / d);
        pinch.d = d;
      }
    }, { passive: false });
    frame.addEventListener("touchend", () => { pinch = null; });
  }
  MapView.prototype.paint = function (states) {
    // states: { id: "hl"|"ok"|"no"|"miss"|"dim"|"" }
    const allEls = this.g.querySelectorAll("[data-id]");
    allEls.forEach(el => {
      const st = states[el.dataset.id] || states._default || "";
      el.classList.remove("hl", "ok", "no", "miss", "dim");
      if (st) el.classList.add(st);
    });
  };
  MapView.prototype.focusId = function (id) {
    const els = this.paths[id];
    if (!els || !els[0]) return;
    try {
      const box = els[0].getBBox();
      const pad = 80;
      const w = Math.max(120, box.width + pad);
      const h = w * (this.H / this.W);
      this.vb = { x: box.x + box.width / 2 - w / 2, y: box.y + box.height / 2 - h / 2, w, h };
      this.applyVb();
    } catch (e) {}
  };

  async function startLearn(kind, region, extra) {
    setTab("geo");
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => sectionHome(kind);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map. ${esc(err.message)}</p>`; $("#h").onclick = () => sectionHome(kind); return; }
    const title = kind === "us" ? "U.S. states" : "World countries";
    const loc = kind === "us" ? "state" : "country";
    const regLine = region && region !== "All" ? ` Showing ${esc(region)}.` : "";
    app().innerHTML = `
      ${nav("")}
      <p class="kicker">${esc(title)} · Learn</p>
      <h1 style="font-size:clamp(1.8rem,6vw,3rem);margin:0 0 .4rem">Tap a place to name it</h1>
      <p class="muted" style="margin-top:0">Pinch or use +/− to zoom. Tiny places have a larger tap target.${regLine}</p>
      <div class="map-frame" id="map"></div>
      <div id="info"><p class="hint">Tap any ${loc} on the map.</p></div>`;
    $("#h").onclick = () => sectionHome(kind);
    const map = new MapView($("#map"), {
      kind, topo, region,
      onTap: id => {
        const it = findItem(kind, id);
        if (!it) return;
        rec(kind, it.id).seen++; save();
        map.paint({ [it.id]: "hl", _default: "" });
        $("#info").innerHTML = `
          <section class="geo-card">
            <h2>${esc(it.name)}</h2>
            <p class="cap">Capital: ${esc(it.capital)}</p>
            ${it.fact ? `<p>${esc(it.fact)}</p>` : ""}
            <p class="muted">${esc(it.region)}</p>
          </section>`;
      }
    });
    if (region && region !== "All") {
      const ids = list(kind, region).map(x => x.id);
      const st = { _default: "dim" };
      ids.forEach(id => { st[id] = ""; });
      map.paint(st);
    }
  }

  async function startPractice(kind, region, mode) {
    setTab("geo");
    const items = list(kind, region);
    if (items.length < 1) return sectionHome(kind);
    const q = pickSession(items, kind, SESSION_N);
    const session = { kind, region, mode, q, i: 0, answers: [] };
    geo.resume = { kind, region, mode, i: 0 }; save();
    await showQ(session);
  }

  async function showQ(session) {
    const { kind, region, mode, q, i } = session;
    if (i >= q.length) return practiceDone(session);
    const target = q[i];
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => sectionHome(kind);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map.</p>`; $("#h").onclick = () => sectionHome(kind); return; }
    const prompt = mode === "find"
      ? `<div class="geo-prompt"><p class="kicker">Find it · ${i + 1} / ${q.length}</p><h2>Tap ${esc(target.name)} on the map</h2></div>`
      : `<div class="geo-prompt"><p class="kicker">Name it · ${i + 1} / ${q.length}</p><h2>What place is highlighted?</h2></div>`;
    const picks = mode === "name" ? namePicks(target, list(kind, region)) : [];
    app().innerHTML = `
      ${nav(`<button class="ghost" id="rs">Restart</button>`)}
      ${prompt}
      <div class="map-frame" id="map"></div>
      <div id="quizExtra"></div>
      <div id="fb"></div>`;
    $("#h").onclick = () => sectionHome(kind);
    $("#rs").onclick = () => startPractice(kind, region, mode);
    if (mode === "name") {
      $("#quizExtra").innerHTML = `
        <div class="name-picks" id="picks">${picks.map(p => `<button type="button" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>
        <form class="geo-type" id="typeForm"><input type="text" id="guess" autocomplete="off" autocapitalize="words" placeholder="Or type the name"><button type="submit" class="alt">Check</button></form>`;
    }
    const map = new MapView($("#map"), { kind, topo, region, onTap: id => {} });
    if (mode === "name") {
      map.paint({ [target.id]: "hl", _default: "dim" });
      map.focusId(target.id);
    } else if (region && region !== "All") {
      const st = { _default: "dim" };
      list(kind, region).forEach(x => { st[x.id] = ""; });
      map.paint(st);
    }

    let answered = false;
    const finish = (choiceId, via) => {
      if (answered) return;
      answered = true;
      map.locked = true;
      const ok = choiceId === target.id;
      const r = rec(kind, target.id);
      r.seen++; if (ok) r.right++; else r.wrong++; save();
      if (ok) ding();
      session.answers.push({ id: target.id, ok, choiceId });
      const paint = { [target.id]: "miss" };
      if (!ok && choiceId) paint[choiceId] = "no";
      if (ok) paint[target.id] = "ok";
      if (region && region !== "All") {
        list(kind, region).forEach(x => { if (!paint[x.id]) paint[x.id] = "dim"; });
      }
      map.paint(paint);
      if (mode === "find" && !ok) map.focusId(target.id);
      if (mode === "name") {
        document.querySelectorAll("#picks button").forEach(b => {
          b.disabled = true;
          if (b.dataset.id === target.id) b.classList.add("ok");
          if (b.dataset.id === choiceId && !ok) b.classList.add("no");
        });
        const form = $("#typeForm"); if (form) form.querySelectorAll("input,button").forEach(x => x.disabled = true);
      }
      const it = target;
      $("#fb").innerHTML = `
        <div class="fb ${ok ? "ok" : "no"}">${ok ? "Yes — that's " + esc(it.name) + "." : (choiceId ? "Not that one. " : "") + "That's " + esc(it.name) + "."}</div>
        <section class="geo-card">
          <h2>${esc(it.name)}</h2>
          <p class="cap">Capital: ${esc(it.capital)}</p>
          ${it.fact ? `<p>${esc(it.fact)}</p>` : ""}
        </section>
        <p class="hint">Tap anywhere to continue</p>
        <div class="actions" style="margin-top:.7rem"><button id="nextq">Next</button></div>`;
      const go = () => { advanceFn = null; session.i++; showQ(session); };
      $("#nextq").onclick = ev => { ev.stopPropagation(); go(); };
      advanceFn = go;
    };

    if (mode === "find") {
      map.onTap = id => finish(id, "map");
    } else {
      map.onTap = () => {}; // map is the clue, not the answer
      document.querySelectorAll("#picks button").forEach(b => b.onclick = ev => { ev.stopPropagation(); finish(b.dataset.id, "pick"); });
      $("#typeForm").onsubmit = ev => {
        ev.preventDefault(); ev.stopPropagation();
        const guess = $("#guess").value;
        const match = list(kind, "All").find(it => GD().matchName(it, guess));
        if (!guess.trim()) return;
        finish(match ? match.id : "__none__", "type");
      };
    }
  }

  function namePicks(target, pool) {
    const others = shuffle(pool.filter(x => x.id !== target.id)).slice(0, 3);
    return shuffle([target].concat(others));
  }

  function practiceDone(session) {
    advanceFn = null;
    const n = session.answers.length;
    const right = session.answers.filter(a => a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    geo.resume = null; save();
    const s = statsFor(session.kind, session.region);
    app().innerHTML = `
      ${nav("")}
      <section class="panel">
        <p class="kicker">${session.mode === "find" ? "Find it" : "Name it"}</p>
        <div class="score-xl">${pct}%</div>
        <p>You got <b>${right}/${n}</b>. ${s.known} of ${s.total} in this set are feeling familiar. There is no passing score.</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          <button id="again">Practice again</button>
          <button class="alt" id="h2">Geography home</button>
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = hub;
    $("#again").onclick = () => startPractice(session.kind, session.region, session.mode);
  }

  window.Geo = {
    open, setTab, blank, exportState: () => geo,
    importState: (data) => { if (data && typeof data === "object") { geo = Object.assign(blank(), data, { items: data.items || {} }); save(); } },
    weight, pickSession, keyFor, SESSION_N, list
  };
})();
