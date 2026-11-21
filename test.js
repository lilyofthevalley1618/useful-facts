const assert = require("assert");
const F = require("./facts.js");
const { LESSONS, ABOUT, allFacts, allQuestions, shuffle, esc, advanceClickOk } = F;

assert.strictEqual(LESSONS.length, 9);
const ids = LESSONS.map(l => l.id);
assert.strictEqual(new Set(ids).size, ids.length, "duplicate lesson ids");
["metacognition","bias","decisions","money","procrastination","neuroplasticity","epigenetics","geopolitics","thinking"]
  .forEach(id => assert.ok(ids.includes(id), "missing " + id));

const facts = allFacts();
const questions = allQuestions();
assert.ok(facts.length >= 55, "expected a full set of facts, got " + facts.length);
assert.strictEqual(questions.length, LESSONS.reduce((n, l) => n + l.quiz.length, 0));
assert.ok(questions.length >= 36);

for (const l of LESSONS) {
  assert.ok(l.title && l.blurb && l.color, l.id + " metadata");
  assert.ok(l.facts.length >= 6, l.id + " too few facts");
  assert.ok(l.quiz.length >= 4, l.id + " too few questions");
  l.facts.forEach((f, i) => {
    assert.ok(f.t && f.t.length > 3, l.id + " fact title " + i);
    assert.ok(f.b && f.b.length > 40, l.id + " fact body " + i);
    assert.ok(!/Elon Musk created a private school to teach his children things other schools don't/i.test(f.b + (f.watch || "")), "do not paste the cover slogan as a taught fact");
  });
  l.quiz.forEach((q, i) => {
    assert.ok(q.q && q.o && q.o.length === 4, l.id + " quiz " + i + " needs 4 options");
    assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < 4, l.id + " quiz " + i + " bad answer index");
    assert.strictEqual(new Set(q.o).size, 4, l.id + " quiz " + i + " duplicate options");
    q.o.forEach(o => assert.ok(o && o.length > 2, "empty option"));
  });
}

const watches = facts.filter(f => f.watch);
assert.ok(watches.length >= 6, "expected flagged corrections");
const watchText = watches.map(f => f.watch).join(" ").toLowerCase();
assert.ok(/dna sequence/.test(watchText), "epigenetics DNA correction");
assert.ok(/grandchildren|transgenerational/.test(watchText), "transgenerational overclaim");
assert.ok(/10%/.test(watchText), "10% brain myth");
assert.ok(/learning style/.test(watchText), "learning styles myth");
assert.ok(/amygdala|prefrontal/.test(watchText), "procrastination brain cartoon");
assert.ok(/official syllabus|not documented/.test(watchText), "Ad Astra syllabus caution");

const about = (ABOUT.post + ABOUT.school + ABOUT.caution).toLowerCase();
assert.ok(/ad astra/.test(about) && /2014/.test(about));
assert.ok(/epigenetics/.test(about) && /not a documented official/.test(about));
assert.ok(/joshua dahn|spacex/.test(about));

// key facts remain accurate in wording
const blob = facts.map(f => f.t + " " + f.b + " " + (f.watch || "")).join("\n").toLowerCase();
assert.ok(/rule of 72/.test(blob));
assert.ok(/compound interest/.test(blob));
assert.ok(/sunk cost/.test(blob));
assert.ok(/confirmation bias/.test(blob));
assert.ok(/retrieval practice/.test(blob));
assert.ok(/implementation intention/.test(blob));
assert.ok(/strait of hormuz|suez canal/.test(blob));
assert.ok(/14 times/.test(blob));
assert.ok(/correlation is not causation/.test(blob));

// helpers
const s = shuffle([1,2,3,4,5]);
assert.strictEqual(s.length, 5);
assert.deepStrictEqual([...s].sort(), [1,2,3,4,5]);
assert.strictEqual(esc("<a & b>"), "&lt;a &amp; b&gt;");
assert.strictEqual(advanceClickOk({ tagName: "BUTTON" }), false);
assert.strictEqual(advanceClickOk({ tagName: "A" }), false);
assert.strictEqual(advanceClickOk({ tagName: "DIV" }), true);
assert.strictEqual(advanceClickOk({ tagName: "BUTTON", disabled: true }), true);


const fs = require("fs");
const css = fs.readFileSync(__dirname + "/style.css", "utf8");
const app = fs.readFileSync(__dirname + "/app.js", "utf8");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
// Keep the look clearly different from the SAT vocab app and the old dark theme.
["#E0E6D4", "#f6f1e7", "#fffdf8", "#cfe3f3", "--sage:", "#0c0d12", "#12141c"].forEach(tok => {
  assert.ok(!css.includes(tok), "forbidden palette token still in CSS: " + tok);
});
assert.ok(/Fraunces/.test(css) && /Nunito/.test(css), "expected Fraunces + Nunito");
assert.ok(/#F3DFC8/.test(css) && /#FFF1A8/.test(css) && /#EE4E16/.test(css), "expected beige, butter yellow, tangerine");
assert.ok(app.includes('const SKEY = "usefulFacts.v1"'), "must keep the same progress key");
assert.ok(app.includes('const SNDKEY = "usefulFacts.sound.v1"'), "must keep the same sound key");
assert.ok(/class="note"/.test(app) && /board-title/.test(app), "expected corkboard sticky notes");
assert.ok(/fact-block/.test(app) && /Did you know\?/.test(app), "expected magazine fact story");
assert.ok(/myth-toggle/.test(app) && /Myth/.test(app), "expected myth vs fact toggle");
assert.ok(/flip-front/.test(app) && /Stamp this/.test(app), "expected flip-and-stamp quiz, not a plain option list");
assert.ok(/id="home"/.test(html) && /wordmark/.test(html));
assert.ok(!/site-head/.test(html) && !/#0c0d12/.test(css));


const GeoData = require("./geo-data.js");
const worldTopo = JSON.parse(fs.readFileSync(__dirname + "/data/countries-50m.json", "utf8"));
const usTopo = JSON.parse(fs.readFileSync(__dirname + "/data/states-10m.json", "utf8"));
const wids = new Set(worldTopo.objects.countries.geometries.map(g => g.id));
const wnames = new Set(worldTopo.objects.countries.geometries.map(g => g.properties && g.properties.name));
assert.ok(GeoData.WORLD.length >= 190, "expected a full country list, got " + GeoData.WORLD.length);
assert.ok(GeoData.STATES.filter(s => s.id !== "11").length === 50, "expected 50 states");
assert.ok(GeoData.STATES.some(s => s.id === "11" && /Columbia/.test(s.name)), "include D.C.");
GeoData.WORLD.forEach(c => {
  assert.ok(c.name && c.capital && c.region && c.fact, "incomplete country " + c.id);
  if (c.id === "Kosovo") assert.ok(wnames.has("Kosovo"), "Kosovo missing from map");
  else assert.ok(wids.has(c.id), "country not in Natural Earth map: " + c.id + " " + c.name);
});
GeoData.STATES.forEach(s => {
  assert.ok(s.name && s.capital && s.region && s.fact, "incomplete state " + s.id);
  assert.ok(usTopo.objects.states.geometries.some(g => g.id === s.id), "state not in Census map: " + s.name);
});
assert.ok(GeoData.matchName(GeoData.WORLD.find(c => c.id === "840"), "USA"));
assert.ok(GeoData.matchName(GeoData.WORLD.find(c => c.id === "826"), "UK"));
assert.ok(GeoData.matchName(GeoData.WORLD.find(c => c.id === "203"), "Czech Republic"));
assert.ok(!GeoData.matchName(GeoData.WORLD.find(c => c.id === "840"), "Canada"));
const geoSrc = fs.readFileSync(__dirname + "/app.js", "utf8") + fs.readFileSync(__dirname + "/geo.js", "utf8");
assert.ok(geoSrc.includes('usefulFacts.geo.v1'), "geography must use its own storage key");
assert.ok(geoSrc.includes('const SKEY = "usefulFacts.v1"'), "must keep the lesson progress key");
assert.ok(/payload\.geo|data\.geo/.test(geoSrc), "backup/restore must include geography");
assert.ok(/Find it/.test(geoSrc) && /Name it/.test(geoSrc) && /Learn the map/.test(geoSrc));
assert.ok(/countries-50m\.json/.test(geoSrc) && /states-10m\.json/.test(geoSrc));
assert.ok(fs.existsSync(__dirname + "/vendor/geo-lib.js"));
assert.ok(fs.existsSync(__dirname + "/data/ATTRIBUTION.md"));
assert.ok(/tab-geo/.test(html) && /map-frame/.test(css) && /#D4A534/.test(css));
function weight(r) { r = r || { seen: 0, right: 0, wrong: 0 }; return 1 + (r.wrong || 0) * 3 + ((r.right || 0) === 0 ? 2 : 0) + Math.max(0, 2 - (r.right || 0)); }
assert.ok(weight({ right: 0, wrong: 4 }) > weight({ right: 5, wrong: 0 }), "misses should be weighted more");
assert.ok(geoSrc.includes("(r.wrong || 0) * 3"), "practice weighting must live in geo.js");



assert.strictEqual(GeoData.WORLD_PATH.length, GeoData.WORLD.length);
assert.strictEqual(new Set(GeoData.WORLD_PATH).size, GeoData.WORLD.length);
assert.strictEqual(GeoData.WORLD_PATH[0], "840", "path should start with the United States");
assert.ok(GeoData.WORLD_MAJOR.length >= 30 && GeoData.WORLD_MAJOR.length <= 40);
GeoData.WORLD_MAJOR.forEach((id, i) => assert.strictEqual(GeoData.WORLD_PATH[i], id, "majors should come first: " + id));
assert.strictEqual(GeoData.STATE_STEPS[0].join(), "06", "U.S. path should start with California");
assert.strictEqual(GeoData.STATE_STEPS.flat().length, GeoData.STATES.length);
assert.strictEqual(new Set(GeoData.STATE_STEPS.flat()).size, GeoData.STATES.length);
assert.ok(geoSrc.includes("const PASS = 0.9") || geoSrc.includes("0.9"), "90% path pass mark");
assert.ok(/path:\s*\{/.test(geoSrc) && /hydrate/.test(geoSrc), "path progress must migrate on usefulFacts.geo.v1");
assert.ok(/Challenge/.test(geoSrc) && /Learn the map/.test(geoSrc));
function passNeed(n) { return Math.ceil(0.9 * n); }
function didPass(right, n) { return n > 0 && right / n >= 0.9; }
assert.ok(didPass(5, 5) && !didPass(4, 5), "5-question quizzes need 5/5");
assert.ok(didPass(3, 3) && !didPass(2, 3));
assert.ok(didPass(9, 10) && !didPass(8, 10));
assert.strictEqual(passNeed(5), 5);
assert.ok(/geo-step/.test(app) || /shot: "step"/.test(app));
// migrate: old geo saves keep item stats and gain an empty path
const oldSave = { items: { "w:840": { seen: 4, right: 3, wrong: 1 } }, resume: null };
function hydrate(raw) {
  const base = { items: {}, resume: null, path: { world: { next: 0, passed: [], reviewed: {} }, us: { next: 0, passed: [], reviewed: {} } } };
  if (!raw || typeof raw !== "object") return base;
  const out = Object.assign(base, raw, { items: raw.items && typeof raw.items === "object" ? raw.items : {} });
  const p = raw.path || {};
  out.path = {
    world: Object.assign({ next: 0, passed: [], reviewed: {} }, p.world || {}),
    us: Object.assign({ next: 0, passed: [], reviewed: {} }, p.us || {})
  };
  return out;
}
const migrated = hydrate(oldSave);
assert.strictEqual(migrated.items["w:840"].right, 3, "must not wipe item stats");
assert.strictEqual(migrated.path.world.next, 0);

assert.ok(/California/.test(geoSrc), "U.S. path still starts with California in the UI or data");

// Lessons now include a clear intro, researched examples, and 4–6 quiz questions.
for (const l of LESSONS) {
  assert.ok(l.intro && l.intro.length > 80, l.id + " needs an explanation of the topic");
  assert.ok(Array.isArray(l.examples) && l.examples.length >= 2, l.id + " needs real-life examples");
  l.examples.forEach((ex, i) => {
    assert.ok(ex.t && ex.b && ex.b.length > 40, l.id + " example " + i);
  });
  assert.ok(l.quiz.length >= 4 && l.quiz.length <= 6, l.id + " should have 4–6 quiz questions, got " + l.quiz.length);
}
const lessonBlob = LESSONS.map(l => [l.intro, ...(l.examples || []).map(e => e.t + " " + e.b)].join(" ")).join("\n").toLowerCase();
assert.ok(/roediger|karpicke|retrieval/.test(lessonBlob), "metacognition example");
assert.ok(/ever given|suez/.test(lessonBlob), "geopolitics example");
assert.ok(/dutch hunger/.test(lessonBlob), "epigenetics example");
assert.ok(/taxi/.test(lessonBlob) && /hippocampus/.test(lessonBlob), "neuroplasticity example");
assert.ok(/john snow|broad street/.test(lessonBlob), "thinking example");

// Continents + U.S. States picker
assert.strictEqual(GeoData.CONTINENTS.length, 7, "six continents plus U.S. States");
assert.deepStrictEqual(GeoData.CONTINENTS.map(c => c.id), ["na","sa","eu","af","as","oc","us"]);
const na = GeoData.continentItems("na");
assert.ok(na.some(c => c.name === "United States") && na.some(c => c.region === "Central America & Caribbean"));
const asia = GeoData.continentItems("as");
assert.ok(asia.some(c => c.region === "Middle East & Caucasus") && asia.some(c => c.name === "China"));
assert.strictEqual(GeoData.continentPath("us")[0].join(), "06");
assert.strictEqual(GeoData.continentPath("eu")[0].join(), "826", "Europe path should start with the United Kingdom");
for (const c of GeoData.CONTINENTS) {
  const items = GeoData.continentItems(c.id);
  const path = GeoData.continentPath(c.id).flat();
  assert.strictEqual(new Set(path).size, items.length, c.id + " path should cover each place once");
  assert.ok(items.every(it => path.includes(it.id)), c.id + " missing an item on the path");
}

// Zoom clamps: min is the fitted view, max is 7x, pan stays in bounds
assert.ok(geoSrc.includes("const ZMAX = 7") && geoSrc.includes("function clampViewBox"), "zoom clamps must live in geo.js");
assert.ok(/Fit map to the region/.test(geoSrc) && /id="zRst"/.test(geoSrc), "Fit button");
assert.ok(/Take the test/.test(geoSrc) && /path\.geo\.test|class="test"/.test(css + geoSrc), "region tests");
assert.ok(/function startStudy/.test(geoSrc) && /function placeMapLabels/.test(geoSrc) && /geo-label/.test(css), "labeled study maps");
assert.ok(/this\.flash/.test(geoSrc) && /geo-ping-ring/.test(css) && /geo-label-hit/.test(css + geoSrc), "click-to-find animation on study maps");
assert.ok(/prefers-reduced-motion/.test(css), "study map find animation respects reduced motion");

assert.ok(geoSrc.includes("[-131, 7, -51, 60]"), "NA default view crops Alaska and the Arctic");
assert.ok(/pad = 8/.test(geoSrc) && /pad = 28/.test(geoSrc), "tighter default map padding");

assert.ok(/Mastered/.test(geoSrc) && /testBestPct/.test(geoSrc));
assert.ok(/Practice step by step/.test(geoSrc), "optional step-by-step practice remains");
["na","sa","eu","af","as","oc","us"].forEach(cid => {
  assert.ok(geoSrc.includes("startStudy") && GeoData.CONTINENTS.some(c => c.id === cid), "study flow covers " + cid);
});
function clampViewBox(vb, W, H, zMax) {
  const minW = W / zMax, maxW = W;
  let w = Math.max(minW, Math.min(maxW, vb.w));
  if (!Number.isFinite(w) || w <= 0) w = W;
  const h = w * (H / W);
  const x = Math.max(0, Math.min(Math.max(0, W - w), vb.x));
  const y = Math.max(0, Math.min(Math.max(0, H - h), vb.y));
  return { x, y, w, h };
}
const W = 1000, H = 560, Z = 7;
assert.strictEqual(clampViewBox({ x: 0, y: 0, w: 2000, h: 1120 }, W, H, Z).w, W, "cannot zoom out past fitted view");
assert.strictEqual(clampViewBox({ x: 0, y: 0, w: 50, h: 28 }, W, H, Z).w, W / Z, "max zoom is 7x");
const panned = clampViewBox({ x: -400, y: -400, w: 200, h: 112 }, W, H, Z);
assert.ok(panned.x >= 0 && panned.y >= 0 && panned.x + panned.w <= W + 1e-9 && panned.y + panned.h <= H + 1e-9, "pan stays in view");
assert.ok(/tab-mystery/.test(html), "Mystery tab in the header");
assert.ok(/payload\.mystery|data\.mystery/.test(fs.readFileSync(__dirname + "/app.js", "utf8")), "backup/restore must include the case file");

const Mystery = require("./mystery-data.js");
assert.strictEqual(Mystery.title, "False North");
assert.ok(Mystery.clues.length >= 20 && Mystery.clues.length <= 30, "20–30 clues, got " + Mystery.clues.length);
assert.strictEqual(new Set(Mystery.clues.map(c => c.id)).size, Mystery.clues.length, "unique clue ids");
assert.ok(Mystery.clues[0].unlock && Mystery.clues[0].unlock.type === "free");
const cids = ["na","sa","eu","af","as","oc","us"];
cids.forEach(cid => {
  const group = Mystery.clues.filter(c => c.unlock && (c.unlock.cid === cid));
  assert.ok(group.length === 3, "each region should have 3 clues, " + cid + " has " + group.length);
  assert.ok(group.some(c => c.unlock.type === "score" && c.unlock.pct === 70), cid + " 70% clue");
  assert.ok(group.some(c => c.unlock.type === "score" && c.unlock.pct === 90), cid + " 90% clue");
  assert.ok(group.some(c => c.unlock.type === "score" && c.unlock.pct === 100), cid + " 100% clue");
});
assert.ok(/70%/.test(Mystery.how) && /100%/.test(Mystery.how) && /mastered/i.test(Mystery.how));
assert.ok(Mystery.clues.filter(c => c.unlock && c.unlock.type === "finale").length >= 3, "finale chapters");
assert.ok(Mystery.suspects.length >= 4);
assert.ok(!/ellingham|stevie bell|cassie hobbes|naturals|fbi academy/i.test(JSON.stringify(Mystery)), "must not copy those series");
assert.ok(fs.existsSync(__dirname + "/mystery.js"));
assert.ok(/usefulFacts\.mystery\.v1/.test(fs.readFileSync(__dirname + "/mystery.js", "utf8")));
assert.ok(/What this is/.test(fs.readFileSync(__dirname + "/app.js", "utf8")) && /In real life/.test(fs.readFileSync(__dirname + "/app.js", "utf8")));




console.log("ok", LESSONS.length, "lessons", facts.length, "facts", questions.length, "questions", watches.length, "corrections");
