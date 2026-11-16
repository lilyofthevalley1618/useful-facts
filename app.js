/* Useful Facts app: lessons, light quizzes, local progress, backup/restore. */
(function () {
  const F = window.Facts;
  const { LESSONS, ABOUT, shuffle, esc, advanceClickOk } = F;
  const $ = (s, el = document) => el.querySelector(s);
  const app = $("#app");
  const SKEY = "usefulFacts.v1";
  const SNDKEY = "usefulFacts.sound.v1";

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
    const bests = LESSONS.map(l => rec(l.id).best || 0);
    const avg = bests.filter(n => n).length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.filter(n => n).length) : 0;
    return { done, total: LESSONS.length, avg, facts: F.allFacts().length };
  }

  function home() {
    prog.resume = null; save();
    const s = stats();
    const cards = LESSONS.map(l => {
      const r = rec(l.id);
      const pct = r.done ? 100 : Math.round((r.seen || 0) / l.facts.length * 100);
      const score = r.last == null ? "Not quizzed yet" : `Best quiz: ${r.best}%${r.done ? " · done" : ""}`;
      const extra = l.extra ? `<span class="tag">extra</span>` : "";
      return `<button class="lesson ${l.color}${r.done ? " done" : ""}" data-id="${l.id}">
        <h3>${esc(l.title)}${extra}</h3>
        <small>${esc(l.blurb)}</small>
        <small>${esc(score)}</small>
        <div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
      </button>`;
    }).join("");
    app.innerHTML = `
      <section class="card">
        <div class="row" style="justify-content:space-between">
          <p class="muted" style="margin:0">Nine short lessons, light quizzes, no locks. Progress stays on this device.</p>
          ${soundBtn()}
        </div>
      </section>
      <div class="stats">
        <div class="stat"><b>${s.done}/${s.total}</b> lessons finished</div>
        <div class="stat"><b>${s.facts}</b> facts to learn</div>
        <div class="stat"><b>${s.avg ? s.avg + "%" : "—"}</b> avg best quiz</div>
      </div>
      <section class="card">
        <h2>About this list</h2>
        <p>${esc(ABOUT.post)}</p>
        <p>${esc(ABOUT.school)}</p>
        <div class="watch"><b>What the post got wrong, or stretched</b>${esc(ABOUT.caution)}</div>
      </section>
      <div class="row" style="margin:0 0 1rem">
        <button id="daily">Daily mix</button>
        <button class="alt" id="data">Backup / restore</button>
      </div>
      <div class="lessons">${cards}</div>`;
    app.querySelectorAll(".lesson").forEach(b => b.onclick = () => startLesson(b.dataset.id));
    $("#daily").onclick = startDaily;
    $("#data").onclick = backup;
  }

  function startLesson(id, resumeAt) {
    const lesson = LESSONS.find(l => l.id === id);
    if (!lesson) return home();
    const session = resumeAt && resumeAt.id === id ? resumeAt : { id, mode: "learn", i: 0, answers: [], order: null };
    prog.resume = session; save();
    if (session.mode === "quiz") return showQuiz(lesson, session);
    showFact(lesson, session);
  }

  function showFact(lesson, session) {
    const i = session.i;
    const fact = lesson.facts[i];
    const r = rec(lesson.id);
    r.seen = Math.max(r.seen || 0, i + 1); save();
    const watch = fact.watch ? `<div class="watch"><b>Watch out</b>${esc(fact.watch)}</div>` : "";
    app.innerHTML = `
      <div class="topbar"><button class="ghost" id="h">Home</button>${soundBtn()}<button class="ghost" id="rs">Restart</button></div>
      <section class="card fact" id="fact" tabindex="0">
        <p class="step">${esc(lesson.title)} · fact ${i + 1} of ${lesson.facts.length}</p>
        <h2>${esc(fact.t)}</h2>
        <p>${esc(fact.b)}</p>
        ${watch}
        <p class="hint">Tap anywhere to continue</p>
      </section>
      <div class="row"><button id="next">${i + 1 < lesson.facts.length ? "Next fact" : "Start quiz"}</button></div>`;
    const go = () => {
      if (i + 1 < lesson.facts.length) { session.i = i + 1; prog.resume = session; save(); showFact(lesson, session); }
      else { session.mode = "quiz"; session.i = 0; session.answers = []; session.order = buildQuiz(lesson); prog.resume = session; save(); showQuiz(lesson, session); }
    };
    $("#next").onclick = go;
    $("#h").onclick = home;
    $("#rs").onclick = () => startLesson(lesson.id);
    bindAdvance(go);
  }

  function buildQuiz(lesson) {
    return lesson.quiz.map((q, qi) => {
      const opts = q.o.map((text, i) => ({ text, i }));
      return { qi, q: q.q, a: q.a, opts: shuffle(opts) };
    });
  }

  function showQuiz(lesson, session) {
    const order = session.order || (session.order = buildQuiz(lesson));
    const i = session.i;
    if (i >= order.length) return quizDone(lesson, session);
    const item = order[i];
    const answered = session.answers[i];
    const buttons = item.opts.map(o => {
      let cls = "";
      if (answered) {
        if (o.i === item.a) cls = "ok";
        else if (o.i === answered.choice && !answered.ok) cls = "no";
      }
      return `<button data-i="${o.i}" class="${cls}" ${answered ? "disabled" : ""}>${esc(o.text)}</button>`;
    }).join("");
    const fb = answered
      ? `<div class="fb ${answered.ok ? "ok" : "no"}">${answered.ok ? "Correct." : "Not quite. The highlighted answer is the one to remember."}</div><p class="hint">Tap anywhere to continue</p>`
      : "";
    app.innerHTML = `
      <div class="topbar"><button class="ghost" id="h">Home</button>${soundBtn()}<button class="ghost" id="rs">Restart</button></div>
      <section class="card" id="qcard">
        <p class="step">${esc(lesson.title)} · question ${i + 1} of ${order.length}</p>
        <h2>${esc(item.q)}</h2>
        <div class="opts">${buttons}</div>
        ${fb}
      </section>`;
    $("#h").onclick = home;
    $("#rs").onclick = () => startLesson(lesson.id);
    if (!answered) {
      app.querySelectorAll(".opts button").forEach(b => b.onclick = ev => {
        ev.stopPropagation();
        const choice = +b.dataset.i;
        const ok = choice === item.a;
        if (ok) ding();
        session.answers[i] = { choice, ok };
        prog.resume = session; save();
        showQuiz(lesson, session);
      });
    } else {
      const go = () => { session.i = i + 1; prog.resume = session; save(); showQuiz(lesson, session); };
      bindAdvance(go);
    }
  }

  function quizDone(lesson, session) {
    const n = session.answers.length;
    const right = session.answers.filter(a => a && a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    const r = rec(lesson.id);
    r.last = pct; r.best = Math.max(r.best || 0, pct); r.done = true; r.seen = lesson.facts.length;
    prog.resume = null; save();
    app.innerHTML = `
      <div class="topbar"><button class="ghost" id="h">Home</button>${soundBtn()}</div>
      <section class="card">
        <h2>${esc(lesson.title)} · quiz done</h2>
        <p>You got <b>${right}/${n}</b> (${pct}%).${r.best > pct ? ` Best so far is ${r.best}%.` : ""} There is no passing score; retake whenever you want.</p>
        <div class="row"><button id="again">Retake lesson</button><button class="alt" id="h2">Home</button></div>
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
    const order = session.order;
    const i = session.i;
    if (i >= order.length) return dailyDone(session);
    const item = order[i];
    const answered = session.answers[i];
    const buttons = item.opts.map(o => {
      let cls = "";
      if (answered) {
        if (o.i === item.a) cls = "ok";
        else if (o.i === answered.choice && !answered.ok) cls = "no";
      }
      return `<button data-i="${o.i}" class="${cls}" ${answered ? "disabled" : ""}>${esc(o.text)}</button>`;
    }).join("");
    const fb = answered
      ? `<div class="fb ${answered.ok ? "ok" : "no"}">${answered.ok ? "Correct." : "Not quite. The highlighted answer is the one to remember."}<div class="muted">From ${esc(item.title)}</div></div><p class="hint">Tap anywhere to continue</p>`
      : `<p class="muted">From ${esc(item.title)}</p>`;
    app.innerHTML = `
      <div class="topbar"><button class="ghost" id="h">Home</button>${soundBtn()}<button class="ghost" id="rs">Restart</button></div>
      <section class="card">
        <p class="step">Daily mix · question ${i + 1} of ${order.length}</p>
        <h2>${esc(item.q)}</h2>
        <div class="opts">${buttons}</div>
        ${fb}
      </section>`;
    $("#h").onclick = home;
    $("#rs").onclick = startDaily;
    if (!answered) {
      app.querySelectorAll(".opts button").forEach(b => b.onclick = ev => {
        ev.stopPropagation();
        const choice = +b.dataset.i;
        const ok = choice === item.a;
        if (ok) ding();
        session.answers[i] = { choice, ok };
        prog.resume = session; save();
        showDaily(session);
      });
    } else {
      const go = () => { session.i = i + 1; prog.resume = session; save(); showDaily(session); };
      bindAdvance(go);
    }
  }

  function dailyDone(session) {
    const n = session.answers.length;
    const right = session.answers.filter(a => a && a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    prog.dailyLast = pct; prog.dailyBest = Math.max(prog.dailyBest || 0, pct);
    prog.resume = null; save();
    app.innerHTML = `
      <div class="topbar"><button class="ghost" id="h">Home</button>${soundBtn()}</div>
      <section class="card">
        <h2>Daily mix done</h2>
        <p>You got <b>${right}/${n}</b> (${pct}%).${prog.dailyBest > pct ? ` Best mix so far is ${prog.dailyBest}%.` : ""}</p>
        <div class="row"><button id="again">Another mix</button><button class="alt" id="h2">Home</button></div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = home;
    $("#again").onclick = startDaily;
  }

  let advanceFn = null;
  function bindAdvance(fn) {
    advanceFn = fn;
  }
  document.addEventListener("click", e => {
    if (!advanceFn) return;
    if (!app.contains(e.target) && e.target !== document.documentElement && e.target !== document.body) return;
    if (e.target && (e.target.id === "snd" || e.target.closest && e.target.closest("#snd"))) return;
    if (!advanceClickOk(e.target)) return;
    const fn = advanceFn; advanceFn = null; fn();
  });

  function backup() {
    prog.resume && save();
    app.innerHTML = `
      <section class="card">
        <h2>Backup / restore</h2>
        <p class="muted">Progress lives in this browser only. Download a backup to keep it or move it to another device. Restoring replaces the progress on this device.</p>
        <div class="row">
          <button id="ex">Download backup</button>
          <label class="btn" style="background:var(--sage);color:var(--ink)">Restore from file<input type="file" id="im" accept=".json"></label>
          <button class="ghost" id="h">Back</button>
        </div>
        <p id="msg"></p>
      </section>`;
    $("#h").onclick = home;
    $("#ex").onclick = () => {
      const blob = new Blob([JSON.stringify({ kind: "usefulFacts.v1", saved: new Date().toISOString(), progress: prog }, null, 2)], { type: "application/json" });
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
        $("#msg").textContent = "Restored lesson progress and scores.";
      } catch (err) { $("#msg").textContent = "Could not restore: " + err.message; }
    };
  }

  $("#home").onclick = e => { e.preventDefault(); home(); };

  if (prog.resume && (prog.resume.id === "daily" || LESSONS.some(l => l.id === prog.resume.id))) {
    const r = prog.resume;
    if (r.id === "daily" && r.order) showDaily(r);
    else startLesson(r.id, r);
  } else home();
})();
