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
assert.ok(/World path/.test(geoSrc) && /California/.test(geoSrc));


console.log("ok", LESSONS.length, "lessons", facts.length, "facts", questions.length, "questions", watches.length, "corrections");
