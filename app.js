/* Useful Facts app: zine + corkboard lessons, flip-and-stamp quizzes. */
(function () {
  const F = window.Facts;
  const { LESSONS, ABOUT, shuffle, esc, advanceClickOk } = F;
  const $ = (s, el = document) => el.querySelector(s);
  const app = $("#app");
  const SKEY = "usefulFacts.v1";
  const SNDKEY = "usefulFacts.sound.v1";

  const svg = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const ICONS = {
    metacognition: svg('<path d="M8 9a5 5 0 1 1 8.5 3.6c-.7.7-1.5 1.5-1.5 2.6v.3H9v-.3c0-1.1-.8-1.9-1.5-2.6A5 5 0 0 1 8 9z"/><path d="M9 18h6M10 21h4"/>'),
    bias: svg('<circle cx="7.5" cy="8.5" r="3"/><circle cx="16.5" cy="15.5" r="3"/><path d="M10 9.5l4 5"/>'),
    decisions: svg('<circle cx="12" cy="12" r="8"/><path d="M12 12L16 8M12 4v2M12 18v2M4 12h2M18 12h2"/>'),
    money: svg('<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9.5 9.2c.6-1 1.6-1.5 2.6-1.5 1.6 0 2.6.9 2.6 2.1 0 2.8-5.4 1.5-5.4 4.2 0 1.2 1.1 2.1 2.8 2.1 1.1 0 2.1-.5 2.6-1.4"/>'),
    procrastination: svg('<path d="M12 7v5l3.5 2"/><circle cx="12" cy="12" r="8"/>'),
    neuroplasticity: svg('<circle cx="6" cy="8" r="2.1"/><circle cx="18" cy="8" r="2.1"/><circle cx="12" cy="16.5" r="2.3"/><path d="M8 9.2l2.5 5M16 9.2l-2.5 5M8.2 8h7.6"/>'),
    epigenetics: svg('<path d="M8 4c4 3 4 13 0 16M16 4c-4 3-4 13 0 16"/><path d="M8.6 8h6.8M8.6 16h6.8"/>'),
    geopolitics: svg('<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>'),
    thinking: svg('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
    daily: svg('<path d="M5 12h14M13 6l6 6-6 6"/>')
  };
  const ROT = ["-2.6deg", "2.2deg", "-1.2deg", "3.1deg", "-3.4deg", "1.4deg", "2.8deg", "-2deg", "1deg"];
  const MYTHS = {
    "Watch out for oversimplified 'brain' stories": "Procrastination is just your amygdala fighting your prefrontal cortex.",
    "Myth: you only use 10% of your brain": "You only use 10% of your brain.",
    "Myth: you must be taught in your 'learning style'": "You learn best only when taught in your visual, auditory, or kinesthetic style.",
    "Correction: this is not 'changing your genes'": "Everyday habits rewrite your DNA sequence.",
    "Correction: 'you will rewrite your grandchildren's genes' is overstated": "Your habits will rewrite your grandchildren's genes.",
    "The Ad Astra list is a prompt, not a syllabus": "Elon Musk's school officially taught this exact eight-topic syllabus."
  };

  const blank = () => ({ lessons: {}, resume: null, dailyBest: 0, dailyLast: null });
  let prog = blank();
  try { const raw = JSON.parse(localStorage.getItem(SKEY) || "null"); if (raw && typeof raw === "object") prog = Object.assign(blank(), raw, { lessons: raw.lessons || {} }); } catch (e) {}
  const save = () => { try { localStorage.setItem(SKEY, JSON.stringify(prog)); } catch (e) {} };

  let soundOn = localStorage.getItem(SNDKEY) !== "off";
  let actx = null;
  const getCtx = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); return actx; } catch (e) { return null; } };
  const DING = [[1568, 0.09], [3136, 0.025], [4704, 0.01]];
  function ding() {
    if (!soundOn) return;
    try {
      const ctx = getCtx(); if (!ctx) return;
      if (ctx.state === "suspended" && ctx.resume) ctx.resume().catch(() => {});
      const t = ctx.currentTime, END = 0.4;
      for (const [f, peak] of DING) {
        const g = ctx.createGain(); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + END);
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(f, t); o.connect(g); o.start(t); o.stop(t + END + 0.02);
      }
    } catch (e) {}
  }
  const soundBtn = () => `<button class="ghost" id="snd" aria-pressed="${soundOn}" title="Play a ding on correct answers">Sound: ${soundOn ? "On" : "Off"}</button>`;
  document.addEventListener("click", e => {
    if (e.target && e.target.id === "snd") {
      soundOn = !soundOn;
      localStorage.setItem(SNDKEY, soundOn ? "on" : "off");
      e.target.textContent = "Sound: " + (soundOn ? "On" : "Off");
      e.target.setAttribute("aria-pressed", soundOn);
    }
  });

  function rec(id) {
    if (!prog.lessons[id]) prog.lessons[id] = { seen: 0, best: 0, last: null, done: false };
    return prog.lessons[id];
  }
  function stats() {
    const done = LESSONS.filter(l => rec(l.id).done).length;
    const bests = LESSONS.map(l => rec(l.id).best || 0).filter(n => n);
    const avg = bests.length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.length) : 0;
    return { done, total: LESSONS.length, avg, facts: F.allFacts().length };
  }
  function ico(id) { return ICONS[id] || ICONS.thinking; }

  function didYouLine(fact) {
    const parts = String(fact.b || "").split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    return parts.find((s, i) => i > 0 && s.length > 40) || parts[1] || parts[0] || fact.t;
  }

  let factObs = null;
  function clearObs() { if (factObs) { factObs.disconnect(); factObs = null; } }

  function nav(extra) {
    return `<div class="topbar"><button class="ghost" id="h">Back to the wall</button><div class="actions">${soundBtn()}${extra || ""}</div></div>`;
  }

  function home() {
    setTab("lessons");
    prog.resume = null; save(); clearObs();
    const s = stats();
    const notes = LESSONS.map((l, i) => {
      const r = rec(l.id);
      const score = r.last == null ? "Not quizzed yet" : `Best quiz ${r.best}%`;
      const extra = l.extra ? `<span class="tag">extra</span>` : "";
      const seal = r.done ? `<span class="done-seal">Read</span>` : "";
      const pin = i % 2 === 0 ? `<span class="pin" aria-hidden="true"></span>` : `<span class="tape" aria-hidden="true"></span>`;
      return `<button class="note" data-id="${l.id}" style="--rot:${ROT[i % ROT.length]}">
        ${pin}
        <div class="pola"><div class="pola-pic">${ico(l.id)}</div></div>
        <h3>${esc(l.title)}${extra}${seal}</h3>
        <p>${esc(l.blurb)}</p>
        <span class="meta">${esc(score)}</span>
      </button>`;
    }).join("");
    app.innerHTML = `
      <section class="cover">
        <p class="kicker">A tiny zine of checked facts</p>
        <h1>Useful <em>Facts</em></h1>
        <p class="cover-lead">Short lessons on how money, the brain, and the world work. ${s.facts} facts, light quizzes, no locks. Progress stays on this device.</p>
        <div class="cover-row">
          <div class="stamp" aria-label="${s.done} of ${s.total} lessons finished">
            <b>${s.done}/${s.total}</b>
            <span>lessons done</span>
          </div>
          <div class="actions">
            <button id="daily">Daily mix</button>
            <button class="alt" id="data">Backup / restore</button>
            ${soundBtn()}
          </div>
        </div>
      </section>
      <section class="board">
        <h2 class="board-title">Pin a lesson</h2>
        <div class="notes">${notes}</div>
      </section>
      <details class="clip">
        <summary>About this list</summary>
        <p>${esc(ABOUT.post)}</p>
        <p>${esc(ABOUT.school)}</p>
        <div class="watch"><b>What the post got wrong, or stretched</b>${esc(ABOUT.caution)}</div>
      </details>`;
    app.querySelectorAll(".note").forEach(b => b.onclick = () => startLesson(b.dataset.id));
    $("#daily").onclick = startDaily;
    $("#data").onclick = backup;
  }

  function startLesson(id, resumeAt) {
    const lesson = LESSONS.find(l => l.id === id);
    if (!lesson) return home();
    const session = resumeAt && resumeAt.id === id ? resumeAt : { id, mode: "learn", i: 0, answers: [], order: null };
    prog.resume = session; save();
    if (session.mode === "quiz") return showQuiz(lesson, session);
    showStory(lesson, session);
  }

  function mythCard(fact, key) {
    const myth = MYTHS[fact.t] || "A popular post oversimplifies this.";
    return `<div class="mythbox" data-myth="${esc(key)}">
      <div class="myth-toggle" role="tablist">
        <button type="button" class="on" data-side="myth">Myth</button>
        <button type="button" data-side="fact">Fact</button>
      </div>
      <div class="myth-panel" data-panel="myth">
        <h3>People often say…</h3>
        <p>${esc(myth)}</p>
      </div>
      <div class="myth-panel" data-panel="fact" hidden>
        <h3>A more careful version</h3>
        <p>${esc(fact.watch)}</p>
        <p>${esc(fact.b)}</p>
      </div>
    </div>`;
  }

  function showStory(lesson, session) {
    clearObs();
    const blocks = lesson.facts.map((fact, i) => {
      const num = String(i + 1).padStart(2, "0");
      const callout = (!fact.watch && i % 3 === 0)
        ? `<aside class="didyou"><b>Did you know?</b>${esc(didYouLine(fact))}</aside>`
        : "";
      const myth = fact.watch ? mythCard(fact, lesson.id + "-" + i) : "";
      const body = fact.watch ? "" : `<p class="body">${esc(fact.b)}</p>`;
      return `<article class="fact-block" data-fact="${i}">
        <div class="fact-num">${num}</div>
        <h2>${esc(fact.t)}</h2>
        ${callout}
        ${body}
        ${myth}
      </article>`;
    }).join("");
    app.innerHTML = `
      ${nav(`<button class="ghost" id="rs">Start over</button>`)}
      <article class="spread">
        <header class="spread-hero">
          <p class="kicker">Lesson · ${esc(lesson.title)}</p>
          <figure class="hero-pola">
            <div class="pola-pic">${ico(lesson.id)}</div>
            <figcaption>${esc(lesson.title)}</figcaption>
          </figure>
          <h1>${esc(lesson.title)}</h1>
          <p class="dek">${esc(lesson.blurb)}</p>
        </header>
        ${lesson.intro ? `<section class="lesson-intro"><h2>What this is</h2><p>${esc(lesson.intro)}</p></section>` : ""}
        ${lesson.examples && lesson.examples.length ? `<section class="lesson-examples"><h2>In real life</h2>${lesson.examples.map(ex => `<div class="example-card"><h3>${esc(ex.t)}</h3><p>${esc(ex.b)}</p></div>`).join("")}</section>` : ""}
        ${blocks}
        <div class="quiz-cta">
          <button id="toquiz">Quiz yourself</button>
          <p class="hint">A short flip-card quiz, not a grade.</p>
        </div>
      </article>`;
    $("#h").onclick = home;
    $("#rs").onclick = () => startLesson(lesson.id);
    $("#toquiz").onclick = () => {
      const r = rec(lesson.id);
      r.seen = lesson.facts.length; save();
      session.mode = "quiz"; session.i = 0; session.answers = []; session.order = buildQuiz(lesson);
      prog.resume = session; save();
      showQuiz(lesson, session);
    };
    app.querySelectorAll(".mythbox").forEach(box => {
      box.querySelectorAll(".myth-toggle button").forEach(btn => btn.onclick = ev => {
        ev.preventDefault();
        const side = btn.dataset.side;
        box.querySelectorAll(".myth-toggle button").forEach(b => b.classList.toggle("on", b === btn));
        box.querySelectorAll(".myth-panel").forEach(p => { p.hidden = p.dataset.panel !== side; });
      });
    });
    const r = rec(lesson.id);
    factObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const i = +e.target.dataset.fact;
        r.seen = Math.max(r.seen || 0, i + 1);
        save();
      });
    }, { threshold: 0.45 });
    app.querySelectorAll("[data-fact]").forEach(el => factObs.observe(el));
  }

  function buildQuiz(lesson) {
    return lesson.quiz.map((q, qi) => {
      const opts = q.o.map((text, i) => ({ text, i }));
      return { qi, q: q.q, a: q.a, opts: shuffle(opts) };
    });
  }

  function showQuiz(lesson, session) {
    clearObs();
    const order = session.order || (session.order = buildQuiz(lesson));
    const i = session.i;
    if (i >= order.length) return quizDone(lesson, session);
    const item = order[i];
    const answered = session.answers[i];
    const tiles = item.opts.map((o, n) => {
      const open = answered ? " open" : "";
      let mark = "";
      if (answered) {
        if (o.i === item.a) mark = " ok";
        else if (o.i === answered.choice && !answered.ok) mark = " no";
      }
      const pick = answered ? "" : `<span class="pick">Stamp this</span>`;
      return `<button type="button" class="flip${open}${mark}" data-i="${o.i}" data-n="${n}" ${answered ? "disabled" : ""}>
        <span class="flip-inner">
          <span class="flip-face flip-front"><small>Card ${n + 1}</small>Tap to reveal</span>
          <span class="flip-face flip-back">${esc(o.text)}${pick}</span>
        </span>
      </button>`;
    }).join("");
    const fb = answered
      ? `<div class="fb ${answered.ok ? "ok" : "no"}">${answered.ok ? "That's the one." : "Not that one. The stamped card is the answer to remember."}</div>
         <div class="actions" style="justify-content:center;margin-top:.9rem"><button id="nextq">Next</button></div>`
      : `<p class="hint">Flip a card to read it, then stamp the one you want.</p>`;
    const from = session.id === "daily" && item.title ? `<p class="muted">From ${esc(item.title)}</p>` : "";
    const title = session.id === "daily" ? "Daily mix" : lesson.title;
    const restart = session.id === "daily"
      ? `<button class="ghost" id="rs">New mix</button>`
      : `<button class="ghost" id="rs">Start over</button>`;
    app.innerHTML = `
      ${nav(restart)}
      <section class="quiz-sheet">
        <p class="kicker">${esc(title)} · ${i + 1} / ${order.length}</p>
        <h2>${esc(item.q)}</h2>
        ${from}
        <div class="flips">${tiles}</div>
        ${fb}
      </section>`;
    $("#h").onclick = home;
    if ($("#rs")) $("#rs").onclick = () => { if (session.id === "daily") startDaily(); else startLesson(lesson.id); };
    if (!answered) {
      app.querySelectorAll(".flip").forEach(b => {
        b.onclick = ev => {
          ev.preventDefault();
          if (!b.classList.contains("open")) {
            b.classList.add("open");
            return;
          }
          const choice = +b.dataset.i;
          const ok = choice === item.a;
          if (ok) ding();
          session.answers[i] = { choice, ok };
          prog.resume = session; save();
          if (session.id === "daily") showDaily(session);
          else showQuiz(lesson, session);
        };
      });
    } else {
      $("#nextq").onclick = () => {
        session.i = i + 1; prog.resume = session; save();
        if (session.id === "daily") showDaily(session);
        else showQuiz(lesson, session);
      };
    }
  }

  function quizDone(lesson, session) {
    clearObs();
    const n = session.answers.length;
    const right = session.answers.filter(a => a && a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    const r = rec(lesson.id);
    r.last = pct; r.best = Math.max(r.best || 0, pct); r.done = true; r.seen = lesson.facts.length;
    prog.resume = null; save();
    app.innerHTML = `
      ${nav("")}
      <section class="panel">
        <p class="kicker">${esc(lesson.title)}</p>
        <div class="score-xl">${pct}%</div>
        <p>You got <b>${right}/${n}</b>.${r.best > pct ? ` Best so far is ${r.best}%.` : ""} There is no passing score; retake whenever you want.</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          <button id="again">Retake lesson</button>
          <button class="alt" id="h2">Back to the wall</button>
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = home;
    $("#again").onclick = () => startLesson(lesson.id);
  }

  function startDaily() {
    const pool = F.allQuestions();
    const picked = shuffle(pool).slice(0, Math.min(8, pool.length)).map(q => {
      const opts = q.o.map((text, i) => ({ text, i }));
      return { lesson: q.lesson, title: q.title, q: q.q, a: q.a, opts: shuffle(opts) };
    });
    const session = { id: "daily", mode: "daily", i: 0, answers: [], order: picked };
    prog.resume = session; save();
    showDaily(session);
  }

  function showDaily(session) {
    // Reuse the flip-sheet renderer with a stub lesson for nav labels.
    const lesson = { title: "Daily mix", id: "daily", facts: [], quiz: [] };
    const order = session.order;
    const i = session.i;
    if (i >= order.length) return dailyDone(session);
    showQuiz(lesson, session);
  }

  function dailyDone(session) {
    clearObs();
    const n = session.answers.length;
    const right = session.answers.filter(a => a && a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    prog.dailyLast = pct; prog.dailyBest = Math.max(prog.dailyBest || 0, pct);
    prog.resume = null; save();
    app.innerHTML = `
      ${nav("")}
      <section class="panel">
        <p class="kicker">Daily mix</p>
        <div class="score-xl">${pct}%</div>
        <p>You got <b>${right}/${n}</b>.${prog.dailyBest > pct ? ` Best mix so far is ${prog.dailyBest}%.` : ""}</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          <button id="again">Another mix</button>
          <button class="alt" id="h2">Back to the wall</button>
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = home;
    $("#again").onclick = startDaily;
  }

  function backup() {
    prog.resume && save();
    clearObs();
    app.innerHTML = `
      ${nav("")}
      <section class="panel" style="text-align:left">
        <h2>Backup / restore</h2>
        <p class="muted">Progress lives in this browser only. Download a backup to keep it or move it to another device. Restoring replaces the progress on this device.</p>
        <div class="actions">
          <button id="ex">Download backup</button>
          <label class="btn alt">Restore from file<input type="file" id="im" accept=".json"></label>
        </div>
        <p id="msg"></p>
      </section>`;
    $("#h").onclick = home;
    $("#ex").onclick = () => {
      const payload = { kind: "usefulFacts.v1", saved: new Date().toISOString(), progress: prog };
      if (window.Geo && window.Geo.exportState) payload.geo = window.Geo.exportState();
      if (window.Mystery && window.Mystery.exportState) payload.mystery = window.Mystery.exportState();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `useful-facts-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    };
    $("#im").onchange = async e => {
      try {
        const data = JSON.parse(await e.target.files[0].text());
        const next = data.progress || (data.lessons ? data : null);
        if (!next || typeof next !== "object") throw new Error("This file is not a Useful Facts backup.");
        prog = Object.assign(blank(), next, { lessons: next.lessons || {} });
        save();
        if (data.geo && window.Geo && window.Geo.importState) window.Geo.importState(data.geo);
        if (data.mystery && window.Mystery && window.Mystery.importState) window.Mystery.importState(data.mystery);
        const bits = ["lesson progress", "scores"];
        if (data.geo) bits.push("geography practice");
        if (data.mystery) bits.push("the case file");
        $("#msg").textContent = "Restored " + bits.join(", ").replace(/, ([^,]*)$/, " and $1") + ".";
      } catch (err) { $("#msg").textContent = "Could not restore: " + err.message; }
    };
  }

  function setTab(which) {
    const ids = { lessons: "tab-lessons", geo: "tab-geo", mystery: "tab-mystery" };
    Object.keys(ids).forEach(k => {
      const el = document.getElementById(ids[k]);
      if (el) el.classList.toggle("on", which === k);
    });
  }

  $("#home").onclick = e => { e.preventDefault(); home(); };
  const tabL = document.getElementById("tab-lessons");
  const tabG = document.getElementById("tab-geo");
  const tabM = document.getElementById("tab-mystery");
  if (tabL) tabL.onclick = () => home();
  if (tabG) tabG.onclick = () => { if (window.Geo) window.Geo.open(); };
  if (tabM) tabM.onclick = () => { if (window.Mystery) window.Mystery.open(); };
  window.UF = { ding, soundBtn, esc, shuffle, advanceClickOk, setTab };

  // Screenshot / deep-link hooks. Do not steal a real in-progress session unless asked.
  const params = new URLSearchParams(location.search);
  const shot = params.get("shot");
  if (shot === "home") home();
  else if (shot === "lesson") startLesson(params.get("id") || "neuroplasticity");
  else if (shot === "quiz") {
    const lesson = LESSONS.find(l => l.id === (params.get("id") || "metacognition")) || LESSONS[0];
    const session = { id: lesson.id, mode: "quiz", i: 0, answers: [], order: buildQuiz(lesson) };
    showQuiz(lesson, session);
  }
  else if (shot === "geo-step" || shot === "step") { if (window.Geo) window.Geo.open({ shot: "step", id: params.get("id") || "250" }); }
  else if (shot === "geo-study" || shot === "study") { if (window.Geo) window.Geo.open({ shot: "study", cid: params.get("cid") || "eu" }); }
  else if (shot === "geo-test" || shot === "test") { if (window.Geo) window.Geo.open({ shot: "test", cid: params.get("cid") || "eu", id: params.get("id") || "250" }); }
  else if (shot === "mystery") { if (window.Mystery) window.Mystery.open({ shot: "board", unlock: ["intro"] }); }
  else if (shot === "mystery-clue") { if (window.Mystery) window.Mystery.open({ shot: "clue", clue: "intro", unlock: ["intro","eu-1","eu-2"] }); }
  else if (shot === "geo" || shot === "map") { if (window.Geo) window.Geo.open({ shot: (shot === "map" || params.get("map") || params.get("cid")) ? "study" : (params.get("us") ? "us" : "hub"), cid: params.get("cid") || (params.get("us") ? "us" : "eu") }); }
  else if (prog.resume && (prog.resume.id === "daily" || LESSONS.some(l => l.id === prog.resume.id))) {
    const r = prog.resume;
    if (r.id === "daily" && r.order) showDaily(r);
    else startLesson(r.id, r);
  } else home();
})();
