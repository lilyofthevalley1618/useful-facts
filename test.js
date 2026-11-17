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
// Keep the look clearly different from the SAT vocab app.
["#E0E6D4","#f6f1e7","#fffdf8","#cfe3f3","--sage:"].forEach(tok => {
  assert.ok(!css.includes(tok), "SAT palette token still in CSS: " + tok);
});
assert.ok(/Syne/.test(css) && /IBM Plex Sans/.test(css), "expected new display/body fonts");
assert.ok(/#0c0d12/.test(css) && /#ff5d2e/.test(css), "expected dark background and bold accent");
assert.ok(app.includes('const SKEY = "usefulFacts.v1"'), "must keep the same progress key");
assert.ok(app.includes('const SNDKEY = "usefulFacts.sound.v1"'), "must keep the same sound key");
assert.ok(/viewBox="0 0 24 24"/.test(app) && /ring-fg/.test(app), "expected SVG icons and progress rings");
assert.ok(/touchstart/.test(app) && /hit-r/.test(app), "expected swipe/tap fact cards");
assert.ok(/id="home"/.test(html) && /site-head/.test(html));

console.log("ok", LESSONS.length, "lessons", facts.length, "facts", questions.length, "questions", watches.length, "corrections");
