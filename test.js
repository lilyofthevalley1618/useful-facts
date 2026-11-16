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

console.log("ok", LESSONS.length, "lessons", facts.length, "facts", questions.length, "questions", watches.length, "corrections");
