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

  const blankPath = () => ({ next: 0, passed: [], reviewed: {} });
  const blank = () => ({
    items: {},
    resume: null,
    path: {
      world: blankPath(),
      us: blankPath(),
      regions: {}
    },
    tests: {}
  });
  function ensurePath(p) {
    const o = Object.assign(blankPath(), p || {});
    if (typeof o.next !== "number" || o.next < 0) o.next = 0;
    if (!Array.isArray(o.passed)) o.passed = [];
    if (!o.reviewed || typeof o.reviewed !== "object") o.reviewed = {};
    return o;
  }
  function migrateRegions(out, savedRegions) {
    const list = (GD().CONTINENTS || []);
    const regions = {};
    list.forEach(c => {
      const saved = savedRegions && savedRegions[c.id];
      regions[c.id] = ensurePath(saved || (c.id === "us" && out.path ? out.path.us : null));
    });
    const any = list.some(c => regions[c.id] && regions[c.id].next > 0);
    if (!any && out.path && out.path.world && out.path.world.next > 0 && GD().stepItems) {
      const learned = new Set();
      for (let i = 0; i < out.path.world.next; i++) {
        (GD().stepItems("world", i) || []).forEach(it => learned.add(it.id));
      }
      list.filter(c => c.id !== "us").forEach(c => {
        const steps = GD().continentPath ? GD().continentPath(c.id) : [];
        let next = 0;
        const passed = [];
        for (let i = 0; i < steps.length; i++) {
          const ids = steps[i] || [];
          if (ids.length && ids.every(id => learned.has(id))) { passed.push(i); next = i + 1; }
          else break;
        }
        regions[c.id] = ensurePath({ next, passed, reviewed: {} });
      });
    }
    if (out.path && out.path.us && (out.path.us.next || 0) > (regions.us && regions.us.next || 0)) {
      regions.us = ensurePath(out.path.us);
    }
    return regions;
  }
  function hydrate(raw) {
    const base = blank();
    if (!raw || typeof raw !== "object") return base;
    const out = Object.assign(base, raw, { items: raw.items && typeof raw.items === "object" ? raw.items : {} });
    const p = raw.path || {};
    out.path = {
      world: ensurePath(p.world),
      us: ensurePath(p.us),
      regions: {}
    };
    out.path.regions = migrateRegions(out, p.regions);
    if (out.path.regions.us) out.path.us = out.path.regions.us;
    out.tests = (raw.tests && typeof raw.tests === "object") ? raw.tests : {};
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
  function kindOf(cid) { return cid === "us" ? "us" : "world"; }
  function pathRec(cid) {
    if (!geo.path) geo.path = blank().path;
    if (cid === "world") {
      geo.path.world = ensurePath(geo.path.world);
      return geo.path.world;
    }
    if (!geo.path.regions) geo.path.regions = migrateRegions(geo, geo.path.regions);
    if (!geo.path.regions[cid]) geo.path.regions[cid] = ensurePath(cid === "us" ? geo.path.us : null);
    const p = ensurePath(geo.path.regions[cid]);
    geo.path.regions[cid] = p;
    if (cid === "us") geo.path.us = p;
    return p;
  }
  function passNeed(n) { return Math.ceil(PASS * n); }
  function didPass(right, n) { return n > 0 && right / n >= PASS; }
  function stepList(cid) {
    if (cid === "world") return GD().steps("world");
    return (GD().continentPath && GD().continentPath(cid)) || [];
  }
  function stepCount(cid) { return stepList(cid).length; }
  function stepItemsCid(cid, index) {
    if (cid === "world") return GD().stepItems("world", index);
    const kind = kindOf(cid);
    const cat = kind === "us" ? GD().STATES : GD().WORLD;
    const step = stepList(cid)[index] || [];
    return step.map(id => cat.find(x => x.id === id)).filter(Boolean);
  }
  function itemsInSteps(cid, from, to) {
    const out = [];
    const seen = new Set();
    for (let i = from; i < to; i++) {
      stepItemsCid(cid, i).forEach(it => {
        if (!seen.has(it.id)) { seen.add(it.id); out.push(it); }
      });
    }
    return out;
  }
  function passedSteps(cid) {
    const p = pathRec(cid);
    return Math.max(p.next || 0, (p.passed || []).length);
  }
  function testRec(cid) {
    if (!geo.tests) geo.tests = {};
    if (!geo.tests[cid]) geo.tests[cid] = { last: null, best: null };
    return geo.tests[cid];
  }
  function testPassed(cid) {
    return testBestPct(cid) >= 90;
  }
  function testBestPct(cid) {
    const best = testRec(cid).best;
    if (!best || !best.n) return 0;
    if (typeof best.pct === "number") return best.pct;
    return Math.round(best.right / best.n * 100);
  }
  function mastered(cid) {
    const best = testRec(cid).best;
    return !!(best && best.n && best.right >= best.n);
  }
  function allMastered() {
    const list = GD().CONTINENTS || [];
    return list.length > 0 && list.every(c => mastered(c.id));
  }
  function continentItems(cid) {
    return (GD().continentItems && GD().continentItems(cid)) || [];
  }
  function continentName(cid) {
    const c = (GD().CONTINENTS || []).find(x => x.id === cid);
    return c ? c.name : cid;
  }
  function clampViewBox(vb, W, H, zMax) {
    const minW = W / zMax, maxW = W;
    let w = Math.max(minW, Math.min(maxW, vb.w));
    if (!Number.isFinite(w) || w <= 0) w = W;
    const h = w * (H / W);
    const x = Math.max(0, Math.min(Math.max(0, W - w), vb.x));
    const y = Math.max(0, Math.min(Math.max(0, H - h), vb.y));
    return { x, y, w, h };
  }
  function attachMysteryToast(added) {
    if (!added || !added.length || !window.Mystery || !window.Mystery.toast) return;
    const t = window.Mystery.toast(added);
    if (!t) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = t.html;
    const el = wrap.firstElementChild;
    if (el) { app().appendChild(el); t.bind(); }
  }
  function afterGeoProgress() {
    if (window.Mystery && window.Mystery.sync) return window.Mystery.sync() || [];
    return [];
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
    const ids = { lessons: "tab-lessons", geo: "tab-geo", mystery: "tab-mystery" };
    Object.keys(ids).forEach(k => {
      const el = document.getElementById(ids[k]);
      if (el) el.classList.toggle("on", which === k);
    });
  }

  function open(opts) {
    setTab("geo");
    const shot = opts && opts.shot;
    if (shot === "map" || shot === "study") return startStudy(opts.cid || "eu", { shot: true });
    if (shot === "us") return startStudy("us", { shot: true });
    if (shot === "test") return startRegionTest(opts.cid || "eu", { shot: true, preview: opts.id || "250" });
    if (shot === "step") {
      const id = (opts && opts.id) || "250";
      const cid = (GD().continentOfId && GD().continentOfId("world", id)) || "eu";
      const steps = stepList(cid);
      let idx = steps.findIndex(s => s.includes(id));
      if (idx < 0) idx = 0;
      return startPathLesson(cid, idx, { shot: true });
    }
    if (shot === "region") return startStudy(opts.cid || "eu", { shot: true });
    hub();
  }

  function testLine(cid) {
    const t = testRec(cid);
    if (mastered(cid)) return "Mastered · 100%.";
    if (t.best && t.best.n) return `Best test ${t.best.pct}% (${t.best.right}/${t.best.n}). Retake until you reach 100%.`;
    if (t.last && t.last.n) return `Last test ${t.last.pct}%. Retake until you reach 100%.`;
    return "Study the labeled map, then take the test until you score 100%.";
  }
  function pathLine(cid) {
    const p = pathRec(cid);
    const total = stepCount(cid);
    const nextItems = stepItemsCid(cid, Math.min(p.next, Math.max(0, total - 1)));
    if (p.next >= total) return `All ${total} steps unlocked.`;
    if (p.next === 0) return `Start with ${namesOf(nextItems)}. 0 of ${total} steps unlocked.`;
    return `Next: ${namesOf(nextItems)}. ${p.next} of ${total} steps unlocked.`;
  }

  function hub() {
    setTab("geo");
    advanceFn = null;
    const cards = (GD().CONTINENTS || []).map(c => {
      const us = c.id === "us" ? " us-choice" : "";
      const master = mastered(c.id) ? " mastered" : "";
      const kicker = mastered(c.id) ? "Mastered" : (c.id === "us" ? "U.S. map" : "Continent");
      const seal = mastered(c.id) ? `<span class="done-seal">Mastered</span>` : "";
      return `<button class="geo-poster${us}${master}" data-cid="${esc(c.id)}">
        <p class="kicker" style="justify-content:flex-start;margin:0 0 .25rem">${esc(kicker)}</p>
        <h2>${esc(c.name)}${seal}</h2>
        <p>${esc(c.blurb)}</p>
        <p style="margin-top:.45rem">${esc(testLine(c.id))}</p>
      </button>`;
    }).join("");
    app().innerHTML = `
      <section class="cover">
        <p class="kicker">A practice atlas</p>
        <h1>Geography</h1>
        <p class="cover-lead">Pick any region to start. Every continent and U.S. States are open. You’ll get a large labeled map to study and memorize, then a test of every place. Retake the test until you score 100% to mark the region Mastered. Mystery folders open at 70%, 90%, and 100%.</p>
      </section>
      <div class="geo-hub-grid geo-hub-7">${cards}</div>
      <p class="muted" style="margin-top:1.2rem">Good work here also opens folders in the Mystery tab. Maps are from Natural Earth (public domain) and the U.S. Census Bureau, bundled here via world-atlas and us-atlas. Made with Natural Earth.</p>`;
    app().querySelectorAll(".geo-poster").forEach(b => b.onclick = () => startStudy(b.dataset.cid));
  }


  async function startStudy(cid, extra) {
    setTab("geo");
    advanceFn = null;
    const shot = extra && extra.shot;
    const kind = kindOf(cid);
    const title = continentName(cid);
    const loc = kind === "us" ? "state" : "country";
    const nItems = continentItems(cid).length;
    const resumeTest = !shot && geo.resume && geo.resume.type === "test" && geo.resume.cid === cid && typeof geo.resume.i === "number";
    const testBtn = resumeTest ? "Resume test" : "Take the test";
    const master = mastered(cid);
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = hub;
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map. ${esc(err.message)}</p>`; $("#h").onclick = hub; return; }
    app().innerHTML = `
      ${nav("")}
      <p class="kicker">${esc(title)} · Study map</p>
      <h1 style="font-size:clamp(2rem,6.5vw,3.6rem);margin:0 0 .35rem">${esc(title)}${master ? ` <span class="done-seal">Mastered</span>` : ""}</h1>
      <p class="muted" style="margin-top:0">This is a large labeled map of all ${nItems} ${kind === "us" ? "states" : "countries"} in ${esc(title)}. Study it and try to memorize the names. Tiny places have a leader line or callout. Use + and − to zoom, and Fit to return to this view. Then take the test — you can retake until you score 100%.</p>
      <p class="muted">${esc(testLine(cid))}</p>
      <div class="map-frame study" id="map"></div>
      <div class="actions" style="margin-top:.9rem">
        <button id="test">${esc(testBtn)}</button>
        <button class="ghost" id="steps">Practice step by step</button>
      </div>
      <p class="muted" style="margin-top:.7rem">The step-by-step path is optional practice, one ${loc} at a time.</p>`;
    $("#h").onclick = hub;
    if ($("#test")) $("#test").onclick = () => startRegionTest(cid, resumeTest ? { resume: true } : {});
    if ($("#steps")) $("#steps").onclick = ev => { ev.preventDefault(); ev.stopPropagation(); regionHome(cid); };
    new MapView($("#map"), { kind, topo, continent: cid, labels: true });
  }

  function regionHome(cid) {
    setTab("geo");
    advanceFn = null;
    const kind = kindOf(cid);
    const p = pathRec(cid);
    const total = stepCount(cid);
    const title = continentName(cid);
    const nextIdx = Math.min(p.next, Math.max(0, total - 1));
    const nextItems = stepItemsCid(cid, nextIdx);
    const done = p.next >= total;
    const loc = kind === "us" ? "states" : "countries";
    const nItems = continentItems(cid).length;
    const startLabel = done ? "Review a step" : (p.next === 0 ? "Start this step" : "Continue");
    const head = done
      ? `You’ve unlocked every step.`
      : `Step ${p.next + 1} of ${total}: ${namesOf(nextItems)}`;
    const windowStart = Math.max(0, Math.min(p.next, Math.max(0, total - 1)) - 3);
    const windowEnd = Math.min(total, windowStart + 8);
    const pips = [];
    for (let i = windowStart; i < windowEnd; i++) {
      const items = stepItemsCid(cid, i);
      const label = items.length === 1 ? items[0].name : (items[0] ? items[0].name + " +" : "Step " + (i + 1));
      const st = i < p.next ? "done" : (i === p.next ? "now" : "lock");
      pips.push(`<button type="button" class="pip ${st}" data-step="${i}" ${i > p.next ? "disabled" : ""}>${esc(label)}</button>`);
    }
    const resumeTest = geo.resume && geo.resume.type === "test" && geo.resume.cid === cid && typeof geo.resume.i === "number";
    const testBtn = resumeTest ? "Resume test" : "Take a test";
    app().innerHTML = `
      ${nav("")}
      <section class="cover">
        <p class="kicker">${esc(title)} · Step-by-step practice</p>
        <h1 style="font-size:clamp(2rem,6.5vw,3.6rem)">${esc(title)}</h1>
        <p class="cover-lead">${esc(head)}</p>
        <p class="muted">Optional practice, one place at a time, on a map fitted to ${esc(title)}. Pass a short quiz at 90% to unlock the next step. The main way to learn this region is still the labeled study map and the full test.</p>
        <p class="muted">${esc(testLine(cid))}</p>
      </section>
      <div class="step-pips" id="pips">${pips.join("")}</div>
      <div class="actions">
        ${done ? "" : `<button id="go">${esc(startLabel)}</button>`}
        <button class="alt" id="test">${esc(testBtn)}</button>
      </div>
      <div class="challenge-box">
        <h2>Challenge</h2>
        <p>Optional practice on this region’s fitted map. There is no passing score here.</p>
        <div class="actions" style="margin-top:.7rem">
          <button class="alt" id="learn">Learn the map</button>
          <button class="alt" id="find">Find it</button>
          <button class="alt" id="name">Name it</button>
        </div>
      </div>`;
    $("#h").onclick = () => startStudy(cid);
    $("#h").textContent = "Back to the map";
    if ($("#go")) $("#go").onclick = () => beginStep(cid, p.next);
    $("#test").onclick = () => startRegionTest(cid, resumeTest ? { resume: true } : {});
    $("#learn").onclick = () => startLearn(cid);
    $("#find").onclick = () => startPractice(cid, "find");
    $("#name").onclick = () => startPractice(cid, "name");
    app().querySelectorAll("#pips .pip").forEach(btn => {
      btn.onclick = () => {
        const i = +btn.dataset.step;
        if (i > p.next) return;
        startPathLesson(cid, i, { revisit: i < p.next });
      };
    });
  }

  function reviewDue(cid) {
    const p = pathRec(cid);
    if (p.next === 0 || p.next % 5 !== 0) return false;
    if (p.next >= stepCount(cid) && p.reviewed[String(p.next)]) return false;
    return !p.reviewed[String(p.next)];
  }

  function beginStep(cid, index, extra) {
    const p = pathRec(cid);
    if (index === p.next && reviewDue(cid)) return startReview(cid);
    return startPathLesson(cid, index, extra);
  }

  async function startPathLesson(cid, index, extra) {
    setTab("geo");
    advanceFn = null;
    const kind = kindOf(cid);
    const shot = extra && extra.shot;
    const revisit = extra && extra.revisit;
    const items = stepItemsCid(cid, index);
    if (!items.length) return regionHome(cid);
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => regionHome(cid);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map. ${esc(err.message)}</p>`; $("#h").onclick = () => regionHome(cid); return; }
    const learned = itemsInSteps(cid, 0, index);
    const learnedIds = learned.map(x => x.id);
    const ids = items.map(x => x.id);
    const regionIds = continentItems(cid).map(x => x.id);
    const title = continentName(cid);
    const total = stepCount(cid);
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
      <p class="muted" style="margin-top:0">The map is fitted to ${esc(title)}. Use + and − to zoom, and Fit to return to this view.</p>
      <div class="map-frame" id="map"></div>
      <div id="info">${cards}
        <div class="actions" style="margin-top:1rem"><button id="quiz">${esc(quizLabel)}</button></div>
      </div>`;
    $("#h").onclick = () => regionHome(cid);
    const map = new MapView($("#map"), { kind, topo, continent: cid });
    const paint = { _default: "dim" };
    regionIds.forEach(id => { paint[id] = ""; });
    learnedIds.forEach(id => { paint[id] = "ok"; });
    ids.forEach(id => { paint[id] = "hl"; });
    map.paint(paint);
    if (!shot) { items.forEach(it => { rec(kind, it.id).seen++; }); save(); }
    if ($("#quiz") && !shot) $("#quiz").onclick = () => startPathQuiz(cid, index, { revisit });
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

  async function startPathQuiz(cid, index, extra) {
    const kind = kindOf(cid);
    const revisit = extra && extra.revisit;
    const review = extra && extra.review;
    const newItems = review ? [] : stepItemsCid(cid, index);
    const learned = itemsInSteps(cid, 0, review ? pathRec(cid).next : index);
    const pool = review ? learned : learned.concat(newItems);
    if (!pool.length) return regionHome(cid);
    const q = review
      ? pickSession(learned, kind, Math.min(5, learned.length)).map((it, i) => ({ mode: i % 2 ? "name" : "find", it }))
      : buildPathQuestions(kind, newItems, learned);
    const session = { cid, kind, index, q, i: 0, answers: [], revisit, review, pool };
    if (!revisit && !review) { geo.resume = { type: "path", cid, kind, index, phase: "quiz" }; save(); }
    await showPathQ(session);
  }

  async function startReview(cid) {
    const learned = itemsInSteps(cid, 0, pathRec(cid).next);
    if (learned.length < 3) {
      pathRec(cid).reviewed[String(pathRec(cid).next)] = true;
      save();
      return startPathLesson(cid, pathRec(cid).next);
    }
    return startPathQuiz(cid, pathRec(cid).next, { review: true });
  }

  async function showPathQ(session) {
    const { cid, kind, q, i, pool } = session;
    if (i >= q.length) return pathQuizDone(session);
    const target = q[i].it;
    const mode = q[i].mode;
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => regionHome(cid);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map.</p>`; $("#h").onclick = () => regionHome(cid); return; }
    const regionIds = continentItems(cid).map(x => x.id);
    const prompt = mode === "find"
      ? `<div class="geo-prompt"><p class="kicker">Find it · ${i + 1} / ${q.length}</p><h2>Tap ${esc(target.name)} on the map</h2></div>`
      : `<div class="geo-prompt"><p class="kicker">Name it · ${i + 1} / ${q.length}</p><h2>What place is highlighted?</h2></div>`;
    const picks = mode === "name" ? namePicks(target, pool.length > 3 ? pool : continentItems(cid)) : [];
    app().innerHTML = `
      ${nav("")}
      ${prompt}
      <div class="map-frame" id="map"></div>
      ${mode === "name" ? `<div class="name-picks">${picks.map(p => `<button type="button" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>` : ""}
      <div id="info"><p class="hint">${mode === "find" ? "Tap it on the map. Zoom in if you need a closer look." : "Pick the name. The map is fitted to this region."}</p></div>`;
    $("#h").onclick = () => regionHome(cid);
    const map = new MapView($("#map"), { kind, topo, continent: cid, onTap: id => {} });
    const paint = { _default: "dim" };
    regionIds.forEach(id => { paint[id] = ""; });
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
      regionIds.forEach(id => { show[id] = ""; });
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
        b.onclick = ev => { ev.stopPropagation(); if (!locked) finish(b.dataset.id); };
      });
    }
  }

  function pathQuizDone(session) {
    advanceFn = null;
    geo.resume = null;
    const cid = session.cid;
    const n = session.answers.length;
    const right = session.answers.filter(a => a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    const passed = didPass(right, n);
    const need = passNeed(n);
    const p = pathRec(cid);
    const total = stepCount(cid);
    if (session.review) {
      if (passed) {
        p.reviewed[String(p.next)] = true;
        save();
      } else save();
      const added = afterGeoProgress();
      const nextName = p.next < total ? namesOf(stepItemsCid(cid, p.next)) : "";
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
            <button class="alt" id="h2">Region home</button>
          </div>
        </section>`;
      $("#h").onclick = $("#h2").onclick = () => regionHome(cid);
      if ($("#go")) $("#go").onclick = () => startPathLesson(cid, p.next);
      if ($("#home2")) $("#home2").onclick = hub;
      if ($("#again")) $("#again").onclick = () => startReview(cid);
      attachMysteryToast(added);
      return;
    }
    if (passed && !session.revisit && session.index === p.next) {
      if (!p.passed.includes(session.index)) p.passed.push(session.index);
      p.next = session.index + 1;
    }
    save();
    const added = afterGeoProgress();
    const unlocked = passed && !session.revisit && p.next === session.index + 1;
    const more = p.next < total;
    const nxt = more ? namesOf(stepItemsCid(cid, p.next)) : "";
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
          <button class="alt" id="h2">Region home</button>
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = () => regionHome(cid);
    if ($("#go")) $("#go").onclick = () => beginStep(cid, p.next);
    if ($("#again")) $("#again").onclick = () => startPathQuiz(cid, session.index, { revisit: session.revisit });
    if ($("#lesson")) $("#lesson").onclick = () => startPathLesson(cid, session.index);
    attachMysteryToast(added);
  }

  function testPicks(target, pool, kind, topo) {
    const nbr = neighborMap(kind, topo);
    const ids = new Set(pool.map(p => p.id));
    const near = (nbr[target.id] || []).map(id => findItem(kind, id)).filter(x => x && ids.has(x.id) && x.id !== target.id);
    const rest = pool.filter(x => x.id !== target.id && !near.some(n => n.id === x.id));
    const picks = shuffle(near).concat(shuffle(rest)).slice(0, 3);
    return shuffle([target].concat(picks));
  }

  async function startRegionTest(cid, extra) {
    setTab("geo");
    advanceFn = null;
    const kind = kindOf(cid);
    const shot = extra && extra.shot;
    if (extra && extra.resume && geo.resume && geo.resume.type === "test" && geo.resume.cid === cid && geo.resume.session) {
      return showTestQ(geo.resume.session);
    }
    const items = shuffle(continentItems(cid).slice());
    if (!items.length) return regionHome(cid);
    if (shot && extra.preview) {
      const i = items.findIndex(x => x.id === extra.preview);
      if (i > 0) { const tmp = items[0]; items[0] = items[i]; items[i] = tmp; }
    }
    const session = { type: "test", cid, kind, items, i: 0, answers: [], shot };
    if (!shot) { geo.resume = { type: "test", cid, i: 0, session }; save(); }
    await showTestQ(session);
  }

  async function showTestQ(session) {
    const { cid, kind, items, i, shot } = session;
    if (i >= items.length) return testDone(session);
    const target = items[i];
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => regionHome(cid);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map.</p>`; $("#h").onclick = () => regionHome(cid); return; }
    const picks = testPicks(target, items, kind, topo);
    const regionIds = items.map(x => x.id);
    app().innerHTML = `
      ${nav(`<button class="ghost" id="rs">Restart test</button>`)}
      <div class="geo-prompt">
        <p class="kicker">${esc(continentName(cid))} test · ${i + 1} / ${items.length}</p>
        <h2>Which place is highlighted in red?</h2>
      </div>
      <div class="map-frame" id="map"></div>
      <div class="name-picks">${picks.map(p => `<button type="button" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>
      <div id="info"><p class="hint">Pick the correct name. Use + and − if you need a closer look; Fit returns to the full region.</p></div>`;
    $("#h").onclick = () => regionHome(cid);
    if ($("#rs")) $("#rs").onclick = ev => { ev.stopPropagation(); startRegionTest(cid); };
    const map = new MapView($("#map"), { kind, topo, continent: cid, onTap: () => {} });
    const paint = { _default: "dim" };
    regionIds.forEach(id => { paint[id] = ""; });
    paint[target.id] = "test";
    map.paint(paint);
    let locked = false;
    const finish = (guessId) => {
      if (locked) return;
      locked = true;
      map.locked = true;
      const ok = guessId === target.id;
      if (!shot) {
        const r = rec(kind, target.id);
        r.seen++;
        if (ok) r.right++; else r.wrong++;
        session.answers.push({ id: target.id, ok });
        session.i = i;
        geo.resume = { type: "test", cid, i: i, session };
        save();
      }
      if (ok) ding();
      const show = { _default: "dim" };
      regionIds.forEach(id => { show[id] = ""; });
      show[target.id] = ok ? "ok" : "miss";
      if (!ok && guessId) show[guessId] = "no";
      map.paint(show);
      app().querySelectorAll(".name-picks button").forEach(b => {
        if (b.dataset.id === target.id) b.classList.add("ok");
        else if (b.dataset.id === guessId && !ok) b.classList.add("no");
      });
      $("#info").innerHTML = ok
        ? `<p class="hint">Yes — ${esc(target.name)}. Tap anywhere to continue.</p>`
        : `<p class="hint">It’s ${esc(target.name)}. Tap anywhere to continue.</p>`;
      const next = () => { advanceFn = null; session.i = i + 1; if (!shot) { geo.resume = { type: "test", cid, i: session.i, session }; save(); } showTestQ(session); };
      advanceFn = next;
      const btn = document.createElement("div");
      btn.className = "actions";
      btn.style.marginTop = ".7rem";
      btn.innerHTML = `<button type="button" id="nx">Next</button>`;
      $("#info").appendChild(btn);
      $("#nx").onclick = ev => { ev.stopPropagation(); next(); };
    };
    app().querySelectorAll(".name-picks button").forEach(b => {
      b.onclick = ev => { ev.stopPropagation(); if (!locked) finish(b.dataset.id); };
    });
  }

  function testDone(session) {
    advanceFn = null;
    const { cid, shot } = session;
    const n = session.answers.length;
    const right = session.answers.filter(a => a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    if (!shot) {
      const recT = testRec(cid);
      recT.last = { right, n, pct, at: new Date().toISOString() };
      if (!recT.best || pct > recT.best.pct || (pct === recT.best.pct && right >= recT.best.right)) recT.best = recT.last;
      geo.resume = null;
      save();
    }
    const added = shot ? [] : afterGeoProgress();
    const best = testRec(cid).best;
    const bestLine = best && best.pct !== pct ? ` Best so far is ${best.pct}%.` : "";
    const won = n > 0 && right >= n;
    let passLine;
    if (won) passLine = " That’s 100% — this region is now marked Mastered on the picker. A Mystery folder can open at 100%.";
    else if (pct >= 90) passLine = " So close. Retake until you get every one. Mystery folders open at 70%, 90%, and 100% (Mastered).";
    else if (pct >= 70) passLine = " Nice work — a Mystery folder can open at 70%. Keep going for 90% and Mastered at 100%.";
    else passLine = " Study the labeled map again and retake until you can do it with 100% accuracy. Your best score is saved.";
    app().innerHTML = `
      ${nav("")}
      <section class="panel">
        <p class="kicker">${esc(continentName(cid))} test${won ? " · Mastered" : ""}</p>
        <div class="score-xl">${pct}%</div>
        <p>You got <b>${right}/${n}</b>.${esc(bestLine)}${passLine}</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          ${won ? "" : `<button id="again">Take the test again</button>`}
          <button class="${won ? "" : "alt"}" id="h2">Back to the map</button>
          ${won ? `<button class="alt" id="again">Take the test again</button>` : ""}
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = () => startStudy(cid);
    if ($("#again")) $("#again").onclick = () => startRegionTest(cid);
    attachMysteryToast(added);
  }

  function challengeHome(cid) {
    return startStudy(cid);
  }

  function clipLon(feature, maxLon, d3) {
    const g = feature.geometry;
    if (!g) return feature;
    const polys = g.type === "Polygon" ? [g.coordinates] : (g.type === "MultiPolygon" ? g.coordinates : []);
    const keep = [];
    polys.forEach(coords => {
      const feat = { type: "Feature", geometry: { type: "Polygon", coordinates: coords } };
      const c = d3.geoCentroid(feat);
      if (Number.isFinite(c[0]) && c[0] <= maxLon) keep.push(coords);
    });
    if (!keep.length) return feature;
    if (keep.length === 1) return { type: "Feature", properties: feature.properties, geometry: { type: "Polygon", coordinates: keep[0] } };
    return { type: "Feature", properties: feature.properties, geometry: { type: "MultiPolygon", coordinates: keep } };
  }
  function clipToLonLat(feature, box, d3) {
    const west = box[0], south = box[1], east = box[2], north = box[3];
    const g = feature.geometry;
    if (!g) return feature;
    const polys = g.type === "Polygon" ? [g.coordinates] : (g.type === "MultiPolygon" ? g.coordinates : []);
    const keep = [];
    polys.forEach(coords => {
      const feat = { type: "Feature", geometry: { type: "Polygon", coordinates: coords } };
      const c = d3.geoCentroid(feat);
      if (Number.isFinite(c[0]) && c[0] >= west && c[0] <= east && c[1] >= south && c[1] <= north) keep.push(coords);
    });
    if (!keep.length) return feature;
    if (keep.length === 1) return { type: "Feature", properties: feature.properties, geometry: { type: "Polygon", coordinates: keep[0] } };
    return { type: "Feature", properties: feature.properties, geometry: { type: "MultiPolygon", coordinates: keep } };
  }
  function fitShape(f, cid, kind, d3) {
    const it = itemForFeat(kind, f);
    if (cid === "eu") {
      const base = mainland(f, d3);
      if (it && it.id === "643") return clipLon(base, 60, d3);
      return base;
    }
    if (cid === "na") return clipToLonLat(f, [-180, 7, -50, 72], d3);
    if (cid === "oc") return f;
    if (cid === "us") return f;
    return mainland(f, d3);
  }


  function labelLines(name) {
    const n = String(name || "");
    if (n.length <= 13) return [n];
    const parts = n.split(" ");
    if (parts.length === 1) return n.length > 16 ? [n.slice(0, 12) + "…"] : [n];
    let best = 0, bestScore = 1e9;
    for (let i = 1; i < parts.length; i++) {
      const a = parts.slice(0, i).join(" "), b = parts.slice(i).join(" ");
      const score = Math.abs(a.length - b.length) + (Math.max(a.length, b.length) > 16 ? 8 : 0);
      if (score < bestScore) { bestScore = score; best = i; }
    }
    return [parts.slice(0, best).join(" "), parts.slice(best).join(" ")];
  }
  function textWidth(lines, fs) {
    const longest = Math.max.apply(null, lines.map(l => l.length));
    return longest * fs * 0.62 + 4;
  }
  function boxesOverlap(a, b, gap) {
    gap = gap || 2;
    return !(a.x + a.w + gap <= b.x || b.x + b.w + gap <= a.x || a.y + a.h + gap <= b.y || b.y + b.h + gap <= a.y);
  }
  function placeMapLabels(g, entries, W, H) {
    const NS = "http://www.w3.org/2000/svg";
    const placed = [];
    const layer = document.createElementNS(NS, "g");
    layer.setAttribute("class", "geo-labels");
    layer.setAttribute("pointer-events", "none");
    function fits(box) {
      if (box.x < 2 || box.y < 2 || box.x + box.w > W - 2 || box.y + box.h > H - 2) return false;
      return !placed.some(o => boxesOverlap(box, o, 3));
    }
    function addText(lines, x, y, anchor, fs) {
      const el = document.createElementNS(NS, "text");
      el.setAttribute("class", "geo-label");
      el.setAttribute("x", x);
      el.setAttribute("y", y);
      el.setAttribute("text-anchor", anchor || "middle");
      el.setAttribute("font-size", fs);
      if (lines.length === 1) {
        el.textContent = lines[0];
      } else {
        lines.forEach((ln, i) => {
          const ts = document.createElementNS(NS, "tspan");
          ts.setAttribute("x", x);
          ts.setAttribute("dy", i === 0 ? "0" : String(fs * 1.12));
          ts.textContent = ln;
          el.appendChild(ts);
        });
      }
      layer.appendChild(el);
      return el;
    }
    function addLeader(x1, y1, x2, y2) {
      const ln = document.createElementNS(NS, "path");
      ln.setAttribute("class", "geo-leader");
      ln.setAttribute("d", `M${x1} ${y1} L${x2} ${y2}`);
      layer.appendChild(ln);
    }
    const leftover = [];
    // Large places first: try a label in the interior.
    const byArea = entries.slice().sort((a, b) => b.area - a.area);
    byArea.forEach(e => {
      const fs = e.area > 9000 ? 16 : (e.area > 2500 ? 14 : 12.5);
      e.fs = fs;
      e.lines = labelLines(e.name);
      e.tw = textWidth(e.lines, fs);
      e.th = e.lines.length * fs * 1.15;
      const roomy = e.bw > e.tw + 10 && e.bh > e.th + 8 && e.area > 700;
      const box = { x: e.cx - e.tw / 2, y: e.cy - e.th / 2 + 3, w: e.tw, h: e.th };
      if (roomy && fits(box)) {
        addText(e.lines, e.cx, e.cy + fs * 0.35, "middle", fs);
        placed.push(box);
        e.done = true;
      } else leftover.push(e);
    });
    // Small / crowded places: try a ring of callout positions, then gutters.
    const dirs = [];
    for (let a = 0; a < 16; a++) dirs.push((a * 22.5 + 10) * Math.PI / 180);
    const still = [];
    leftover.sort((a, b) => a.area - b.area);
    leftover.forEach(e => {
      let found = null;
      const radii = [18, 28, 40, 54, 70, 88, 108, 130];
      for (let i = 0; i < radii.length && !found; i++) {
        const r = radii[i];
        for (let d = 0; d < dirs.length && !found; d++) {
          const ang = dirs[(d + (e.cx > W * 0.55 ? 0 : 4)) % dirs.length];
          const lx = e.cx + Math.cos(ang) * r;
          const ly = e.cy + Math.sin(ang) * r;
          const right = Math.cos(ang) >= 0;
          const anchor = right ? "start" : "end";
          const pad = 5;
          const box = {
            x: right ? lx + pad : lx - pad - e.tw,
            y: ly - e.th / 2,
            w: e.tw,
            h: e.th
          };
          if (fits(box)) found = { box, lx, ly, anchor, right };
        }
      }
      if (found) {
        const edgeX = found.right ? found.box.x : found.box.x + found.box.w;
        const edgeY = found.box.y + found.box.h * 0.55;
        addLeader(e.cx, e.cy, edgeX, edgeY);
        addText(e.lines, found.right ? found.box.x : found.box.x + found.box.w, found.box.y + e.fs * 0.85, found.anchor, e.fs);
        placed.push(found.box);
        e.done = true;
      } else still.push(e);
    });
    // Last resort: stack remaining labels in the left or right margin.
    const left = still.filter(e => e.cx < W / 2).sort((a, b) => a.cy - b.cy);
    const right = still.filter(e => e.cx >= W / 2).sort((a, b) => a.cy - b.cy);
    function stack(list, side) {
      const margin = 4;
      let y = 8;
      list.forEach(e => {
        const box = {
          x: side === "left" ? margin : W - margin - e.tw,
          y: Math.max(y, Math.min(H - e.th - 4, e.cy - e.th / 2)),
          w: e.tw,
          h: e.th
        };
        // Walk down until free or off the page.
        let guard = 0;
        while (!fits(box) && box.y + box.h < H - 2 && guard++ < 80) box.y += e.th + 3;
        if (!fits(box)) {
          box.y = 8;
          while (!fits(box) && box.y + box.h < H - 2) box.y += e.th + 3;
        }
        if (!fits(box)) return;
        const anchor = side === "left" ? "start" : "end";
        const tx = side === "left" ? box.x : box.x + box.w;
        const ty = box.y + e.fs * 0.85;
        const edgeX = side === "left" ? box.x + box.w : box.x;
        addLeader(e.cx, e.cy, edgeX, box.y + box.h * 0.55);
        addText(e.lines, tx, ty, anchor, e.fs);
        placed.push(box);
        y = box.y + box.h + 3;
        e.done = true;
      });
    }
    stack(left, "left");
    stack(right, "right");
    g.appendChild(layer);
  }

  const ZMAX = 7;

  function MapView(frame, opts) {
    const d3 = window.d3geo;
    const self = this;
    this.kind = opts.kind;
    this.topo = opts.topo;
    this.features = feats(opts.topo, opts.kind);
    this.onTap = opts.onTap || (() => {});
    this.locked = false;
    const labeled = !!opts.labels;
    const W = labeled ? 1280 : 1000;
    const H = labeled ? 860 : 560;
    this.vb = { x: 0, y: 0, w: W, h: H };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("role", "img");
    const label = opts.continent ? ("Map of " + continentName(opts.continent)) : (opts.kind === "us" ? "Map of the United States" : "Map of the world");
    svg.setAttribute("aria-label", label);
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(g);
    frame.innerHTML = "";
    frame.appendChild(svg);
    const tools = document.createElement("div");
    tools.className = "map-tools";
    tools.innerHTML = `<button type="button" id="zIn" aria-label="Zoom in">+</button><button type="button" id="zOut" aria-label="Zoom out">−</button><button type="button" id="zRst" aria-label="Fit map to the region">Fit</button>`;
    frame.appendChild(tools);

    const proj = opts.kind === "us" ? d3.geoAlbersUsa() : d3.geoNaturalEarth1();
    const all = this.features.filter(f => featId(f) !== "010" && (f.properties && f.properties.name) !== "Antarctica");
    let fitSet = all;
    if (opts.continent) {
      const ids = new Set(continentItems(opts.continent).map(x => x.id));
      fitSet = all.filter(f => {
        const it = itemForFeat(opts.kind, f);
        return it && ids.has(it.id);
      });
      if (!fitSet.length) fitSet = all;
    } else if (opts.fitIds && opts.fitIds.length) {
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
    const cid = opts.continent || null;
    let pad = 16;
    if (labeled) {
      pad = 56;
      if (cid === "oc") pad = 62;
      if (cid === "na") pad = 58;
      if (cid === "us") pad = 48;
      if (cid === "eu" || cid === "as" || cid === "af") pad = 58;
    }
    if (cid === "oc" && proj.rotate) proj.rotate([-155, 0]);
    const fitFC = {
      type: "FeatureCollection",
      features: fitSet.map(f => cid ? fitShape(f, cid, opts.kind, d3) : mainland(f, d3))
    };
    proj.fitExtent([[pad, pad], [W - pad, H - pad]], fitFC);
    this.proj = proj;
    this.path = d3.geoPath(proj);
    this.g = g; this.svg = svg; this.frame = frame; this.W = W; this.H = H; this.zMax = ZMAX;

    const paths = {};
    const drawSet = (opts.continent || (opts.fitIds && opts.fitIds.length) || (opts.region && opts.region !== "All")) ? fitSet : all;
    drawSet.forEach(f => {
      const drawn = cid ? fitShape(f, cid, opts.kind, d3) : f;
      const d = this.path(drawn);
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
      const b = this.path.bounds(drawn);
      const bw = b[1][0] - b[0][0], bh = b[1][1] - b[0][1];
      const c = this.path.centroid(drawn);
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

    if (labeled) {
      const labelAt = { "643": [40, 55] }; // European Russia, near Moscow, reads better than the raw centroid
      const seenId = new Set();
      const labelEntries = [];
      drawSet.forEach(f => {
        const it = itemForFeat(opts.kind, f);
        if (!it || seenId.has(it.id)) return;
        const shape = cid ? fitShape(f, cid, opts.kind, d3) : f;
        let c = this.path.centroid(shape);
        const b = this.path.bounds(shape);
        if (labelAt[it.id] && this.proj) {
          const p = this.proj(labelAt[it.id]);
          if (p && Number.isFinite(p[0])) c = p;
        }
        if (!Number.isFinite(c[0]) || !Number.isFinite(c[1])) {
          c = [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2];
        }
        if (!Number.isFinite(c[0])) return;
        seenId.add(it.id);
        const cx = Math.max(8, Math.min(W - 8, c[0]));
        const cy = Math.max(8, Math.min(H - 8, c[1]));
        const bw = b[1][0] - b[0][0], bh = b[1][1] - b[0][1];
        labelEntries.push({ id: it.id, name: it.name, cx, cy, bw, bh, area: Math.max(0, bw * bh) });
      });
      placeMapLabels(g, labelEntries, W, H);
    }

    const tap = id => { if (!self.locked && id) self.onTap(id); };
    g.addEventListener("click", e => {
      const t = e.target.closest("[data-id]");
      if (t && t.dataset.id) { e.stopPropagation(); tap(t.dataset.id); }
    });
    g.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && e.target.dataset.id) { e.preventDefault(); tap(e.target.dataset.id); }
    });

    this.applyVb = () => svg.setAttribute("viewBox", `${this.vb.x} ${this.vb.y} ${this.vb.w} ${this.vb.h}`);
    this.clampVb = () => { this.vb = clampViewBox(this.vb, W, H, ZMAX); this.applyVb(); };
    this.zoomAt = (cx, cy, factor) => {
      const { x, y, w } = this.vb;
      const fw = frame.clientWidth || W;
      const fh = frame.clientHeight || H;
      const nw = w * factor;
      const nh = nw * (H / W);
      const px = (cx / fw) * w + x;
      const py = (cy / fh) * this.vb.h + y;
      this.vb = { w: nw, h: nh, x: px - (cx / fw) * nw, y: py - (cy / fh) * nh };
      this.clampVb();
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
      this.clampVb();
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
      el.classList.remove("hl", "ok", "no", "miss", "dim", "test");
      if (st) el.classList.add(st);
    });
  };
  MapView.prototype.focusId = function () { this.reset(); };

  async function startLearn(cid, extra) {
    setTab("geo");
    const kind = kindOf(cid);
    const shot = extra && extra.shot;
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => regionHome(cid);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map. ${esc(err.message)}</p>`; $("#h").onclick = () => regionHome(cid); return; }
    const title = continentName(cid);
    const loc = kind === "us" ? "state" : "country";
    app().innerHTML = `
      ${nav("")}
      <p class="kicker">Challenge · ${esc(title)} · Learn</p>
      <h1 style="font-size:clamp(1.8rem,6vw,3rem);margin:0 0 .4rem">Tap a place to name it</h1>
      <p class="muted" style="margin-top:0">The map is fitted to ${esc(title)}. Use + and − to zoom, and Fit to return. Tiny places have a larger tap target.</p>
      <div class="map-frame" id="map"></div>
      <div id="info"><p class="hint">Tap any ${loc} on the map.</p></div>`;
    $("#h").onclick = () => regionHome(cid);
    const map = new MapView($("#map"), {
      kind, topo, continent: cid,
      onTap: id => {
        const it = findItem(kind, id);
        if (!it) return;
        if (!shot) { rec(kind, it.id).seen++; save(); }
        const st = { _default: "dim" };
        continentItems(cid).forEach(x => { st[x.id] = ""; });
        st[it.id] = "hl";
        map.paint(st);
        $("#info").innerHTML = `
          <section class="geo-card">
            <h2>${esc(it.name)}</h2>
            <p class="cap">Capital: ${esc(it.capital)}</p>
            <p>${esc(it.fact)}</p>
            <p class="muted">${esc(it.region)}</p>
          </section>`;
      }
    });
  }

  async function startPractice(cid, mode) {
    setTab("geo");
    const kind = kindOf(cid);
    const items = continentItems(cid);
    if (items.length < 1) return regionHome(cid);
    const q = pickSession(items, kind, SESSION_N);
    const session = { cid, kind, mode, q, i: 0, answers: [] };
    geo.resume = { type: "practice", cid, mode, i: 0 }; save();
    await showQ(session);
  }

  async function showQ(session) {
    const { cid, kind, mode, q, i } = session;
    if (i >= q.length) return practiceDone(session);
    const target = q[i];
    app().innerHTML = `${nav("")}<p class="muted">Loading the map…</p>`;
    $("#h").onclick = () => regionHome(cid);
    let topo;
    try { topo = await loadTopo(kind); }
    catch (err) { app().innerHTML = `${nav("")}<p>Could not load the map.</p>`; $("#h").onclick = () => regionHome(cid); return; }
    const prompt = mode === "find"
      ? `<div class="geo-prompt"><p class="kicker">Find it · ${i + 1} / ${q.length}</p><h2>Tap ${esc(target.name)} on the map</h2></div>`
      : `<div class="geo-prompt"><p class="kicker">Name it · ${i + 1} / ${q.length}</p><h2>What place is highlighted?</h2></div>`;
    const picks = mode === "name" ? namePicks(target, continentItems(cid)) : [];
    app().innerHTML = `
      ${nav(`<button class="ghost" id="rs">Restart</button>`)}
      ${prompt}
      <div class="map-frame" id="map"></div>
      ${mode === "name" ? `<div class="name-picks">${picks.map(p => `<button type="button" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join("")}</div>
      <form class="geo-type" id="typef"><input id="guess" type="text" autocomplete="off" autocapitalize="words" placeholder="Type the name"><button type="submit">Check</button></form>` : ""}
      <div id="info"><p class="hint">${mode === "find" ? "Tap it on the map. Use + and − if you need a closer look." : "Pick or type the name."}</p></div>`;
    $("#h").onclick = () => regionHome(cid);
    $("#rs").onclick = () => startPractice(cid, mode);
    const map = new MapView($("#map"), { kind, topo, continent: cid, onTap: id => {} });
    const st = { _default: "dim" };
    continentItems(cid).forEach(x => { st[x.id] = ""; });
    if (mode === "name") st[target.id] = "hl";
    map.paint(st);
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
      continentItems(cid).forEach(x => { show[x.id] = ""; });
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
        const match = continentItems(cid).find(it => GD().matchName(it, guess));
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
    const items = continentItems(session.cid);
    const knownN = items.filter(it => known(rec(session.kind, it.id))).length;
    app().innerHTML = `
      ${nav("")}
      <section class="panel">
        <p class="kicker">${session.mode === "find" ? "Find it" : "Name it"} · ${esc(continentName(session.cid))}</p>
        <div class="score-xl">${pct}%</div>
        <p>You got <b>${right}/${n}</b>. ${knownN} of ${items.length} in this set are feeling familiar. There is no passing score in Challenge mode.</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          <button id="again">Practice again</button>
          <button class="alt" id="h2">Region home</button>
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = () => startStudy(session.cid);
    $("#again").onclick = () => startPractice(session.cid, session.mode);
  }

  window.Geo = {
    open, setTab, blank, hydrate, clampViewBox, ZMAX,
    exportState: () => geo,
    importState: (data) => { if (data && typeof data === "object") { geo = hydrate(data); save(); } },
    weight, pickSession, keyFor, SESSION_N, list, passNeed, didPass, pathRec,
    passedSteps, testPassed, testBestPct, mastered, allMastered, testRec, kindOf, continentName
  };
})();
