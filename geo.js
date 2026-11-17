/* Geography tab: one-at-a-time path, plus Challenge Find it / Name it. */
(function () {
  const GKEY = "usefulFacts.geo.v1";
  const SESSION_N = 10;
  const PASS = 0.9;
  const GD = () => window.GeoData;
  const esc = (s) => (window.Facts && window.Facts.esc) ? window.Facts.esc(s) : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = (a) => (window.Facts && window.Facts.shuffle) ? window.Facts.shuffle(a) : a.slice().sort(() => Math.random() - 0.5);
  const advanceClickOk = (el) => (window.Facts && window.Facts.advanceClickOk) ? window.Facts.advanceClickOk(el) : true;
  const $ = (s, el = document) => el.querySelector(s);
  const app = () => document.getElementById("app");

  const blank = () => ({
    items: {},
    resume: null,
    path: {
      world: { next: 0, passed: [], reviewed: {} },
      us: { next: 0, passed: [], reviewed: {} }
    }
  });
  function hydrate(raw) {
    const base = blank();
    if (!raw || typeof raw !== "object") return base;
    const out = Object.assign(base, raw, { items: raw.items && typeof raw.items === "object" ? raw.items : {} });
    const p = raw.path || {};
    out.path = {
      world: Object.assign({ next: 0, passed: [], reviewed: {} }, p.world || {}),
      us: Object.assign({ next: 0, passed: [], reviewed: {} }, p.us || {})
    };
    if (typeof out.path.world.next !== "number" || out.path.world.next < 0) out.path.world.next = 0;
    if (typeof out.path.us.next !== "number" || out.path.us.next < 0) out.path.us.next = 0;
    if (!Array.isArray(out.path.world.passed)) out.path.world.passed = [];
    if (!Array.isArray(out.path.us.passed)) out.path.us.passed = [];
    if (!out.path.world.reviewed || typeof out.path.world.reviewed !== "object") out.path.world.reviewed = {};
    if (!out.path.us.reviewed || typeof out.path.us.reviewed !== "object") out.path.us.reviewed = {};
    return out;
  }
  let geo = blank();
  try {
    const raw = JSON.parse(localStorage.getItem(GKEY) || "null");
    geo = hydrate(raw);
  } catch (e) { geo = blank(); }
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
  function pathRec(kind) {
    if (!geo.path) geo.path = blank().path;
    const key = kind === "us" ? "us" : "world";
    if (!geo.path[key]) geo.path[key] = { next: 0, passed: [], reviewed: {} };
    const p = geo.path[key];
    if (typeof p.next !== "number" || p.next < 0) p.next = 0;
    if (!Array.isArray(p.passed)) p.passed = [];
    if (!p.reviewed || typeof p.reviewed !== "object") p.reviewed = {};
    return p;
  }
  function passNeed(n) { return Math.ceil(PASS * n); }
  function didPass(right, n) { return n > 0 && right / n >= PASS; }
  function stepCount(kind) { return GD().steps(kind).length; }
  function itemsInSteps(kind, from, to) {
    const out = [];
    const seen = new Set();
    for (let i = from; i < to; i++) {
      GD().stepItems(kind, i).forEach(it => {
        if (!seen.has(it.id)) { seen.add(it.id); out.push(it); }
      });
    }
    return out;
  }
  function namesOf(items) {
    if (!items.length) return "";
    if (items.length === 1) return items[0].name;
    if (items.length === 2) return items[0].name + " and " + items[1].name;
    return items.slice(0, -1).map(x => x.name).join(", ") + ", and " + items[items.length - 1].name;
  }
  function placeWord(kind, n) {
    if (kind === "us") return n === 1 ? "state" : "states";
    return n === 1 ? "country" : "countries";
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

  const nbrCache = {};
  function neighborMap(kind, topo) {
    if (nbrCache[kind]) return nbrCache[kind];
    const obj = kind === "us" ? topo.objects.states : topo.objects.countries;
    const geoms = obj.geometries;
    const idx = window.topojson.neighbors(geoms);
    const map = {};
    const d3 = window.d3geo;
    const byKey = {};
    feats(topo, kind).forEach(f => {
      const it = itemForFeat(kind, f);
      const key = it ? it.id : featId(f);
      if (key) byKey[key] = f;
    });
    geoms.forEach((g, i) => {
      const it = itemForFeat(kind, { id: g.id, properties: g.properties });
      const key = it ? it.id : featId({ id: g.id, properties: g.properties });
      if (!key || !byKey[key]) return;
      const main = mainland(byKey[key], d3);
      const c0 = d3.geoCentroid(main);
      map[key] = (idx[i] || []).map(j => {
        const g2 = geoms[j];
        const it2 = itemForFeat(kind, { id: g2.id, properties: g2.properties });
        const key2 = it2 ? it2.id : featId({ id: g2.id, properties: g2.properties });
        const f2 = byKey[key2];
        if (!f2) return null;
        const main2 = mainland(f2, d3);
        const c1 = d3.geoCentroid(main2);
        // Drop overseas-only borders (France–Brazil via Guiana) by mainland-centroid distance.
        const close = Number.isFinite(c0[0]) && Number.isFinite(c1[0]) && d3.geoDistance(c0, c1) < 0.7;
        return close ? key2 : null;
      }).filter(Boolean);
    });
    (GD().NEAR || []).forEach(pair => {
      const a = pair[0], b = pair[1];
      if (!map[a]) map[a] = [];
      if (!map[b]) map[b] = [];
      if (!map[a].includes(b)) map[a].push(b);
      if (!map[b].includes(a)) map[b].push(a);
    });
    nbrCache[kind] = map;
    return map;
  }
  function bearingWord(fromF, toF, d3) {
    if (!fromF || !toF || !d3) return "near";
    const a = d3.geoCentroid(mainland(fromF, d3));
    const b = d3.geoCentroid(mainland(toF, d3));
    if (!a || !b || !Number.isFinite(a[0]) || !Number.isFinite(b[0])) return "near";
    const lat1 = a[1] * Math.PI / 180, lat2 = b[1] * Math.PI / 180;
    const dLon = (b[0] - a[0]) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    const dirs = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
    return dirs[Math.round(brng / 45) % 8];
  }
  function featByItemId(kind, topo) {
    const map = {};
    feats(topo, kind).forEach(f => {
      const it = itemForFeat(kind, f);
      if (it) map[it.id] = f;
    });
    return map;
  }
  function theName(name) {
    if (/^(United |Republic of |Democratic Republic |Central African |Marshall |Solomon |United Arab |The )/.test(name)
      || /(Kingdom|States|Emirates|Netherlands|Philippines|Bahamas|Maldives|Gambia|Congo)$/.test(name)
      || name === "Dominican Republic" || name === "Czech Republic") return "the " + name;
    return name;
  }
  function sitLine(item, learned, kind, topo) {
    const d3 = window.d3geo;
    const nids = ((neighborMap(kind, topo)[item.id]) || []).filter(id => learned.some(x => x.id === id));
    const named = nids.map(id => findItem(kind, id)).filter(Boolean);
    if (!named.length) {
      if (kind === "us") {
        if (item.id === "06") return "California is on the West Coast of the United States, along the Pacific.";
        return item.name + " is in the " + item.region + " region of the United States.";
      }
      return theName(item.name) + " is in " + item.region + ".";
    }
    const fb = featByItemId(kind, topo);
    const groups = {};
    named.forEach(n => {
      const dir = bearingWord(fb[n.id], fb[item.id], d3) || "near";
      (groups[dir] = groups[dir] || []).push(n.name);
    });
    const bits = Object.keys(groups).map(dir => {
      const names = groups[dir];
      const pretty = names.map(theName);
      const who = pretty.length === 1 ? pretty[0] : pretty.slice(0, -1).join(", ") + " and " + pretty[pretty.length - 1];
      return dir === "near" ? "near " + who : dir + " of " + who;
    });
    return theName(item.name) + " sits " + bits.join(", and ") + ".";
  }
  function contextIds(kind, topo, ids, learnedIds) {
    const nbr = neighborMap(kind, topo);
    const out = [];
    const seen = new Set();
    const add = id => { if (id && !seen.has(id)) { seen.add(id); out.push(id); } };
    ids.forEach(add);
    ids.forEach(id => (nbr[id] || []).filter(nid => learnedIds.includes(nid)).forEach(add));
    ids.forEach(id => {
      const extras = (nbr[id] || []).filter(nid => !seen.has(nid));
      extras.slice(0, Math.max(0, 4 - (out.length - ids.length))).forEach(add);
    });
    if (out.length < 3 && learnedIds.length) {
      const fb = featByItemId(kind, topo);
      const d3 = window.d3geo;
      const centers = ids.map(id => fb[id] && d3.geoCentroid(mainland(fb[id], d3))).filter(Boolean);
      if (centers.length) {
        const scored = learnedIds.filter(id => !seen.has(id) && fb[id]).map(id => {
          const c = d3.geoCentroid(mainland(fb[id], d3));
          const d = Math.min(...centers.map(c0 => d3.geoDistance(c0, c)));
          return { id, d };
        }).sort((a, b) => a.d - b.d);
        scored.slice(0, 3).forEach(s => add(s.id));
      }
    }
    return out;
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
    if (shot === "step") {
      const id = (opts && opts.id) || "250";
      const steps = GD().steps("world");
      let idx = steps.findIndex(s => s.includes(id));
      if (idx < 0) idx = 0;
      return startPathLesson("world", idx, { shot: true });
    }
    hub();
  }

  function hub() {
    setTab("geo");
    advanceFn = null;
    const w = pathRec("world");
    const u = pathRec("us");
    const wSteps = stepCount("world");
    const uSteps = stepCount("us");
    const wNext = GD().stepItems("world", Math.min(w.next, wSteps - 1));
    const uNext = GD().stepItems("us", Math.min(u.next, uSteps - 1));
    const wDone = w.next >= wSteps;
    const uDone = u.next >= uSteps;
    const wLine = wDone
      ? `All ${wSteps} steps unlocked.`
      : (w.next === 0
        ? `Start with the ${placeWord("world", 1)} you already live in: ${theName(namesOf(wNext))}.`
        : `Next: ${namesOf(wNext)}. ${w.next} of ${wSteps} steps unlocked.`);
    const uLine = uDone
      ? `All ${uSteps} steps unlocked.`
      : (u.next === 0
        ? `Start with California, since that’s home.`
        : `Next: ${namesOf(uNext)}. ${u.next} of ${uSteps} steps unlocked.`);
    app().innerHTML = `
      <section class="cover">
        <p class="kicker">A practice atlas</p>
        <h1>Geography</h1>
        <p class="cover-lead">Learn one major country at a time, starting with the biggest and best-known, on a zoomed-in map. A short quiz at 90% unlocks the next. The same idea, starting with California, for U.S. states.</p>
      </section>
      <div class="geo-hub-grid">
        <button class="geo-poster" id="go-world">
          <h2>World path</h2>
          <p>${esc(wLine)}</p>
        </button>
        <button class="geo-poster" id="go-us">
          <h2>U.S. path</h2>
          <p>${esc(uLine)}</p>
        </button>
      </div>
      <div class="challenge-box">
        <h2>Challenge</h2>
        <p>Want to try a bigger set at once? Find it and Name it are still here, by region, with no passing score — just practice.</p>
        <div class="actions" style="margin-top:.7rem">
          <button class="alt" id="ch-world">World challenge</button>
          <button class="alt" id="ch-us">U.S. challenge</button>
        </div>
      </div>
      <p class="muted" style="margin-top:1.2rem">Maps are from Natural Earth (public domain) and the U.S. Census Bureau, bundled here via world-atlas and us-atlas. Made with Natural Earth.</p>`;
    $("#go-world").onclick = () => pathHome("world");
    $("#go-us").onclick = () => pathHome("us");
    $("#ch-world").onclick = () => challengeHome("world");
    $("#ch-us").onclick = () => challengeHome("us");
  }

  function pathHome(kind) {
    setTab("geo");
    advanceFn = null;
    const p = pathRec(kind);
    const total = stepCount(kind);
    const title = kind === "us" ? "U.S. states" : "World countries";
    const nextIdx = Math.min(p.next, total - 1);
    const nextItems = GD().stepItems(kind, nextIdx);
    const done = p.next >= total;
    const majorN = kind === "us" ? 20 : (GD().MAJOR_COUNT || 40);
    const majorNote = kind === "us"
      ? "California comes first, then other well-known states. Later steps group a couple of smaller neighbors."
      : `The first ${majorN} are the big, well-known countries; smaller ones come after, still one at a time.`;
    const startLabel = done ? "Review a step" : (p.next === 0 ? "Start this step" : "Continue");
    const head = done
      ? `You’ve unlocked every step.`
      : `Step ${p.next + 1} of ${total}: ${namesOf(nextItems)}`;
    const windowStart = Math.max(0, Math.min(p.next, total - 1) - 3);
    const windowEnd = Math.min(total, windowStart + 8);
    const pips = [];
    for (let i = windowStart; i < windowEnd; i++) {
      const items = GD().stepItems(kind, i);
      const label = items.length === 1 ? items[0].name : (items[0] ? items[0].name + " +" : "Step " + (i + 1));
      const st = i < p.next ? "done" : (i === p.next ? "now" : "lock");
      pips.push(`<button type="button" class="pip ${st}" data-step="${i}" ${i > p.next ? "disabled" : ""}>${esc(label)}</button>`);
    }
    app().innerHTML = `
      ${nav("")}
      <section class="cover">
        <p class="kicker">${esc(title)} · Path</p>
        <h1 style="font-size:clamp(2rem,6.5vw,3.6rem)">${esc(title)}</h1>
        <p class="cover-lead">${esc(head)}</p>
        <p class="muted">${esc(majorNote)} Pass a 3–5 question quiz at 90% to unlock the next step. A short review of earlier places is mixed in.</p>
      </section>
      <div class="step-pips" id="pips">${pips.join("")}</div>
      <div class="actions">
        ${done ? "" : `<button id="go">${esc(startLabel)}</button>`}
        <button class="alt" id="ch">Challenge mode</button>
      </div>`;
    $("#h").onclick = hub;
    if ($("#go")) $("#go").onclick = () => beginStep(kind, p.next);
    $("#ch").onclick = () => challengeHome(kind);
    app().querySelectorAll("#pips .pip").forEach(btn => {
      btn.onclick = () => {
        const i = +btn.dataset.step;
        if (i > p.next) return;
        startPathLesson(kind, i, { revisit: i < p.next });
      };
    });
  }

  function reviewDue(kind) {
    const p = pathRec(kind);
    if (p.next === 0 || p.next % 5 !== 0) return false;
    if (p.next >= stepCount(kind) && p.reviewed[String(p.next)]) return false;
    return !p.reviewed[String(p.next)];
  }

  function beginStep(kind, index, extra) {
    const p = pathRec(kind);
    if (index === p.next && reviewDue(kind)) return startReview(kind);
    return startPathLesson(kind, index, extra);
  }

  async function startPathLesson(kind, index, extra) {
    setTab("geo");
    advanceFn = null;
    const shot = extra && extra.shot;
    const revisit = extra && extra.revisit;
    const items = GD().stepItems(kind, index);
    if (!items.length) return pathHome(kind);
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => pathHome(kind);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map. ${esc(err.message)}</p>`; $("#h").onclick = () => pathHome(kind); return; }
    const learned = itemsInSteps(kind, 0, index);
    const learnedIds = learned.map(x => x.id);
    const ids = items.map(x => x.id);
    const fit = contextIds(kind, topo, ids, learnedIds);
    const title = kind === "us" ? "U.S. path" : "World path";
    const total = stepCount(kind);
    const cards = items.map(it => {
      const regionLabel = kind === "us" ? it.region + " region" : it.region;
      return `<section class="geo-card">
        <h2>${esc(it.name)}</h2>
        <p class="cap">Capital: ${esc(it.capital)}</p>
        <p class="muted">${esc(regionLabel)}</p>
        <p class="sit">${esc(sitLine(it, learned, kind, topo))}</p>
        <p>${esc(it.fact)}</p>
      </section>`;
    }).join("");
    const quizLabel = revisit ? "Practice a short quiz" : "Ready for a short quiz";
    app().innerHTML = `
      ${nav("")}
      <p class="kicker">${esc(title)} · Step ${index + 1} of ${total}</p>
      <h1 style="font-size:clamp(1.8rem,6vw,3rem);margin:0 0 .4rem">${esc(namesOf(items))}</h1>
      <p class="muted" style="margin-top:0">A closer look at this ${placeWord(kind, items.length)}. Pinch or use +/− to zoom.</p>
      <div class="map-frame" id="map"></div>
      <div id="info">${cards}
        <div class="actions" style="margin-top:1rem"><button id="quiz">${esc(quizLabel)}</button></div>
      </div>`;
    $("#h").onclick = () => pathHome(kind);
    const map = new MapView($("#map"), { kind, topo, fitIds: fit });
    const paint = { _default: "dim" };
    fit.forEach(id => { paint[id] = ""; });
    learnedIds.forEach(id => { if (fit.includes(id)) paint[id] = "ok"; });
    ids.forEach(id => { paint[id] = "hl"; });
    map.paint(paint);
    if (!shot) { items.forEach(it => { rec(kind, it.id).seen++; }); save(); }
    if ($("#quiz") && !shot) $("#quiz").onclick = () => startPathQuiz(kind, index, { revisit });
  }

  function quizLen(newItems, learned) {
    if (!learned.length) return 3;
    if (learned.length < 3) return 4;
    return 5;
  }

  function buildPathQuestions(kind, newItems, learned) {
    const n = quizLen(newItems, learned);
    const q = [];
    newItems.forEach(it => {
      q.push({ mode: "find", it });
      q.push({ mode: "name", it });
    });
    const bag = learned.slice();
    while (q.length < n && bag.length) {
      const picked = pickSession(bag, kind, 1)[0];
      if (!picked) break;
      const usedFind = q.some(x => x.it.id === picked.id && x.mode === "find");
      const usedName = q.some(x => x.it.id === picked.id && x.mode === "name");
      const mode = usedFind && !usedName ? "name" : (!usedFind && usedName ? "find" : (Math.random() < 0.5 ? "find" : "name"));
      q.push({ mode, it: picked });
      const i = bag.findIndex(x => x.id === picked.id);
      if (i >= 0) bag.splice(i, 1);
    }
    while (q.length < n) {
      const it = newItems[q.length % newItems.length];
      q.push({ mode: q.length % 2 ? "name" : "find", it });
    }
    return shuffle(q).slice(0, n);
  }

  async function startPathQuiz(kind, index, extra) {
    const revisit = extra && extra.revisit;
    const review = extra && extra.review;
    const newItems = review ? [] : GD().stepItems(kind, index);
    const learned = itemsInSteps(kind, 0, review ? pathRec(kind).next : index);
    const pool = review ? learned : learned.concat(newItems);
    if (!pool.length) return pathHome(kind);
    const q = review
      ? pickSession(learned, kind, Math.min(5, learned.length)).map((it, i) => ({ mode: i % 2 ? "name" : "find", it }))
      : buildPathQuestions(kind, newItems, learned);
    const session = { kind, index, q, i: 0, answers: [], revisit, review, pool };
    if (!revisit && !review) { geo.resume = { type: "path", kind, index, phase: "quiz" }; save(); }
    await showPathQ(session);
  }

  async function startReview(kind) {
    const learned = itemsInSteps(kind, 0, pathRec(kind).next);
    if (learned.length < 3) {
      pathRec(kind).reviewed[String(pathRec(kind).next)] = true;
      save();
      return startPathLesson(kind, pathRec(kind).next);
    }
    return startPathQuiz(kind, pathRec(kind).next, { review: true });
  }

  async function showPathQ(session) {
    const { kind, q, i, pool } = session;
    if (i >= q.length) return pathQuizDone(session);
    const target = q[i].it;
    const mode = q[i].mode;
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => pathHome(kind);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map.</p>`; $("#h").onclick = () => pathHome(kind); return; }
    const learnedIds = pool.map(x => x.id);
    const fit = contextIds(kind, topo, [target.id], learnedIds);
    const kicker = session.review ? "Review" : (session.revisit ? "Practice" : "Quiz");
    const prompt = mode === "find"
      ? `<div class="geo-prompt"><p class="kicker">${kicker} · ${i + 1} / ${q.length}</p><h2>Tap ${esc(target.name)} on the map</h2></div>`
      : `<div class="geo-prompt"><p class="kicker">${kicker} · ${i + 1} / ${q.length}</p><h2>What place is highlighted?</h2></div>`;
    const picks = mode === "name" ? namePicks(target, pool) : [];
    const pickHtml = mode === "name" && picks.length > 1
      ? `<div class="name-picks">${picks.map(p => `<button type="button" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>`
      : "";
    const typeHtml = mode === "name"
      ? `<form class="geo-type" id="typef"><input id="guess" type="text" autocomplete="off" autocapitalize="words" placeholder="Type the name"><button type="submit">Check</button></form>`
      : "";
    app().innerHTML = `
      ${nav("")}
      ${prompt}
      <div class="map-frame" id="map"></div>
      ${pickHtml}${typeHtml}
      <div id="info"><p class="hint">${mode === "find" ? "Tap it on the map." : "Pick or type the name."}</p></div>`;
    $("#h").onclick = () => pathHome(kind);
    const map = new MapView($("#map"), { kind, topo, fitIds: fit });
    const paint = { _default: "dim" };
    fit.forEach(id => { paint[id] = ""; });
    if (mode === "name") paint[target.id] = "hl";
    map.paint(paint);

    let locked = false;
    const finish = (guessId) => {
      if (locked) return;
      locked = true;
      map.locked = true;
      const ok = guessId === target.id;
      const r = rec(kind, target.id);
      r.seen++;
      if (ok) r.right++; else r.wrong++;
      save();
      session.answers.push({ id: target.id, ok });
      if (ok) ding();
      const show = { _default: "dim" };
      fit.forEach(id => { show[id] = ""; });
      show[target.id] = ok ? "ok" : "miss";
      if (!ok && guessId && guessId !== "__none__") show[guessId] = "no";
      map.paint(show);
      if (mode === "name") {
        app().querySelectorAll(".name-picks button").forEach(b => {
          if (b.dataset.id === target.id) b.classList.add("ok");
          else if (b.dataset.id === guessId && !ok) b.classList.add("no");
        });
      }
      $("#info").innerHTML = ok
        ? `<p class="hint">Yes — ${esc(target.name)}. Tap anywhere to continue.</p>`
        : `<p class="hint">It’s ${esc(target.name)}. Tap anywhere to continue.</p>`;
      const next = () => { advanceFn = null; session.i++; showPathQ(session); };
      advanceFn = next;
      const btn = document.createElement("div");
      btn.className = "actions";
      btn.style.marginTop = ".7rem";
      btn.innerHTML = `<button type="button" id="nx">Next</button>`;
      $("#info").appendChild(btn);
      $("#nx").onclick = ev => { ev.stopPropagation(); next(); };
    };
    map.onTap = id => {
      if (locked) return;
      if (mode === "find") finish(id);
    };
    if (mode === "name") {
      app().querySelectorAll(".name-picks button").forEach(b => {
        b.onclick = ev => { ev.stopPropagation(); finish(b.dataset.id); };
      });
      if ($("#typef")) $("#typef").onsubmit = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const guess = $("#guess").value;
        if (!guess.trim()) return;
        const match = pool.find(it => GD().matchName(it, guess));
        finish(match ? match.id : "__none__");
      };
    }
  }

  function pathQuizDone(session) {
    advanceFn = null;
    geo.resume = null;
    const n = session.answers.length;
    const right = session.answers.filter(a => a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    const passed = didPass(right, n);
    const need = passNeed(n);
    const p = pathRec(session.kind);
    const total = stepCount(session.kind);
    if (session.review) {
      if (passed) {
        p.reviewed[String(p.next)] = true;
        save();
      } else save();
      const nextName = p.next < total ? namesOf(GD().stepItems(session.kind, p.next)) : "";
      app().innerHTML = `
        ${nav("")}
        <section class="panel">
          <p class="kicker">Review</p>
          <div class="score-xl">${pct}%</div>
          <p>You got <b>${right}/${n}</b>. ${passed ? (nextName ? `Nice refresh — ${esc(nextName)} is next.` : "Nice refresh.") : `You need ${need}/${n} (90%) to move on. Try the review again — earlier places will keep showing up.`}</p>
          <div class="actions" style="justify-content:center;margin-top:1rem">
            ${passed
              ? (p.next < total ? `<button id="go">Next step</button>` : `<button id="home2">Geography home</button>`)
              : `<button id="again">Try the review again</button>`}
            <button class="alt" id="h2">Path home</button>
          </div>
        </section>`;
      $("#h").onclick = $("#h2").onclick = () => pathHome(session.kind);
      if ($("#go")) $("#go").onclick = () => startPathLesson(session.kind, p.next);
      if ($("#home2")) $("#home2").onclick = hub;
      if ($("#again")) $("#again").onclick = () => startReview(session.kind);
      return;
    }
    if (passed && !session.revisit && session.index === p.next) {
      if (!p.passed.includes(session.index)) p.passed.push(session.index);
      p.next = session.index + 1;
    }
    save();
    const unlocked = passed && !session.revisit && p.next === session.index + 1;
    const more = p.next < total;
    const nxt = more ? namesOf(GD().stepItems(session.kind, p.next)) : "";
    let msg;
    if (session.revisit) msg = `You got <b>${right}/${n}</b> on this practice. Your path progress stays where it is.`;
    else if (unlocked && more) msg = `You got <b>${right}/${n}</b>. <b>${esc(nxt)}</b> is unlocked.`;
    else if (unlocked && !more) msg = `You got <b>${right}/${n}</b>. That’s the last step — nice work.`;
    else msg = `You got <b>${right}/${n}</b>. You need ${need}/${n} (90%) to unlock the next step. Try the quiz again, or look back at the map first.`;
    app().innerHTML = `
      ${nav("")}
      <section class="panel">
        <p class="kicker">${session.revisit ? "Practice" : "Quiz"}</p>
        <div class="score-xl">${pct}%</div>
        <p>${msg}</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          ${unlocked && more ? `<button id="go">Next: ${esc(nxt)}</button>` : ""}
          ${!passed && !session.revisit ? `<button id="again">Try the quiz again</button><button class="alt" id="lesson">Look at the map again</button>` : ""}
          ${session.revisit ? `<button id="again">Practice again</button>` : ""}
          <button class="alt" id="h2">Path home</button>
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = () => pathHome(session.kind);
    if ($("#go")) $("#go").onclick = () => beginStep(session.kind, p.next);
    if ($("#again")) $("#again").onclick = () => startPathQuiz(session.kind, session.index, { revisit: session.revisit });
    if ($("#lesson")) $("#lesson").onclick = () => startPathLesson(session.kind, session.index);
  }

  function challengeHome(kind) {
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
        <p class="kicker">Challenge · ${esc(title)}</p>
        <h1 style="font-size:clamp(2.2rem,7vw,4rem)">${esc(title)}</h1>
        <p class="cover-lead">Optional practice on a bigger map. Pick a region, then learn the map or start a short practice of about 10 places. Missed ones show up more often. There is no passing score here.</p>
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
    if (opts.fitIds && opts.fitIds.length) {
      const want = new Set(opts.fitIds);
      fitSet = all.filter(f => {
        const it = itemForFeat(opts.kind, f);
        return it && want.has(it.id);
      });
      if (!fitSet.length) fitSet = all;
    } else if (opts.region && opts.region !== "All") {
      const ids = new Set(list(opts.kind, opts.region).map(x => x.id));
      fitSet = all.filter(f => {
        const it = itemForFeat(opts.kind, f);
        return it && ids.has(it.id);
      });
      if (!fitSet.length) fitSet = all;
    }
    const pad = (opts.fitIds && opts.fitIds.length) ? 40 : 16;
    const fitFC = {
      type: "FeatureCollection",
      features: fitSet.map(f => mainland(f, d3))
    };
    proj.fitExtent([[pad, pad], [W - pad, H - pad]], fitFC);
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

    this.applyVb = () => svg.setAttribute("viewBox", `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`);
    this.zoomAt = (cx, cy, factor) => {
      const { x, y, w, h } = this.vb;
      const nw = Math.max(80, Math.min(4000, w * factor));
      const nh = nw * (H / W);
      const px = (cx / frame.clientWidth) * w + x;
      const py = (cy / frame.clientHeight) * h + y;
      this.vb = { w: nw, h: nh, x: px - (cx / frame.clientWidth) * nw, y: py - (cx / frame.clientHeight) * nh };
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
    $("#h").onclick = () => challengeHome(kind);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map. ${esc(err.message)}</p>`; $("#h").onclick = () => challengeHome(kind); return; }
    const title = kind === "us" ? "U.S. states" : "World countries";
    const loc = kind === "us" ? "state" : "country";
    const regLine = region && region !== "All" ? ` Showing ${esc(region)}.` : "";
    app().innerHTML = `
      ${nav("")}
      <p class="kicker">Challenge · ${esc(title)} · Learn</p>
      <h1 style="font-size:clamp(1.8rem,6vw,3rem);margin:0 0 .4rem">Tap a place to name it</h1>
      <p class="muted" style="margin-top:0">Pinch or use +/− to zoom. Tiny places have a larger tap target.${regLine}</p>
      <div class="map-frame" id="map"></div>
      <div id="info"><p class="hint">Tap any ${loc} on the map.</p></div>`;
    $("#h").onclick = () => challengeHome(kind);
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
            <p>${esc(it.fact)}</p>
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
    if (items.length < 1) return challengeHome(kind);
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
    $("#h").onclick = () => challengeHome(kind);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map.</p>`; $("#h").onclick = () => challengeHome(kind); return; }
    const prompt = mode === "find"
      ? `<div class="geo-prompt"><p class="kicker">Find it · ${i + 1} / ${q.length}</p><h2>Tap ${esc(target.name)} on the map</h2></div>`
      : `<div class="geo-prompt"><p class="kicker">Name it · ${i + 1} / ${q.length}</p><h2>What place is highlighted?</h2></div>`;
    const picks = mode === "name" ? namePicks(target, list(kind, region)) : [];
    app().innerHTML = `
      ${nav(`<button class="ghost" id="rs">Restart</button>`)}
      ${prompt}
      <div class="map-frame" id="map"></div>
      ${mode === "name" ? `<div class="name-picks">${picks.map(p => `<button type="button" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>
      <form class="geo-type" id="typef"><input id="guess" type="text" autocomplete="off" autocapitalize="words" placeholder="Type the name"><button type="submit">Check</button></form>` : ""}
      <div id="info"><p class="hint">${mode === "find" ? "Tap it on the map." : "Pick or type the name."}</p></div>`;
    $("#h").onclick = () => challengeHome(kind);
    $("#rs").onclick = () => startPractice(kind, region, mode);
    const map = new MapView($("#map"), { kind, topo, region, onTap: id => {} });
    if (mode === "name") {
      map.paint({ [target.id]: "hl", _default: region && region !== "All" ? "dim" : "" });
      if (region && region !== "All") {
        const st = { _default: "dim", [target.id]: "hl" };
        list(kind, region).forEach(x => { if (x.id !== target.id) st[x.id] = ""; });
        map.paint(st);
      }
      map.focusId(target.id);
    } else if (region && region !== "All") {
      const st = { _default: "dim" };
      list(kind, region).forEach(x => { st[x.id] = ""; });
      map.paint(st);
    }
    let locked = false;
    const finish = (guessId) => {
      if (locked) return;
      locked = true;
      map.locked = true;
      const ok = guessId === target.id;
      const r = rec(kind, target.id);
      r.seen++;
      if (ok) r.right++; else r.wrong++;
      save();
      session.answers.push({ id: target.id, ok });
      if (ok) ding();
      const show = {};
      if (region && region !== "All") {
        list(kind, region).forEach(x => { show[x.id] = ""; });
        show._default = "dim";
      }
      show[target.id] = ok ? "ok" : "miss";
      if (!ok && guessId && guessId !== "__none__") show[guessId] = "no";
      map.paint(show);
      if (mode === "name") {
        app().querySelectorAll(".name-picks button").forEach(b => {
          if (b.dataset.id === target.id) b.classList.add("ok");
          else if (b.dataset.id === guessId && !ok) b.classList.add("no");
        });
      }
      $("#info").innerHTML = ok
        ? `<p class="hint">Yes — ${esc(target.name)}. Tap anywhere to continue.</p>`
        : `<p class="hint">It’s ${esc(target.name)}. Tap anywhere to continue.</p>`;
      const next = () => { advanceFn = null; session.i++; showQ(session); };
      advanceFn = next;
      const btn = document.createElement("div");
      btn.className = "actions";
      btn.style.marginTop = ".7rem";
      btn.innerHTML = `<button type="button" id="nx">Next</button>`;
      $("#info").appendChild(btn);
      $("#nx").onclick = ev => { ev.stopPropagation(); next(); };
    };
    map.onTap = id => { if (!locked && mode === "find") finish(id); };
    if (mode === "name") {
      app().querySelectorAll(".name-picks button").forEach(b => {
        b.onclick = ev => { ev.stopPropagation(); finish(b.dataset.id); };
      });
      if ($("#typef")) $("#typef").onsubmit = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        const guess = $("#guess").value;
        if (!guess.trim()) return;
        const match = list(kind, "All").find(it => GD().matchName(it, guess));
        finish(match ? match.id : "__none__");
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
        <p>You got <b>${right}/${n}</b>. ${s.known} of ${s.total} in this set are feeling familiar. There is no passing score in Challenge mode.</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          <button id="again">Practice again</button>
          <button class="alt" id="h2">Geography home</button>
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = hub;
    $("#again").onclick = () => startPractice(session.kind, session.region, session.mode);
  }

  window.Geo = {
    open, setTab, blank, hydrate,
    exportState: () => geo,
    importState: (data) => { if (data && typeof data === "object") { geo = hydrate(data); save(); } },
    weight, pickSession, keyFor, SESSION_N, list, passNeed, didPass, pathRec
  };
})();
