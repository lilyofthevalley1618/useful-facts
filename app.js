/* Useful Facts app: lessons, light quizzes, local progress, backup/restore. */
(function () {
  const F = window.Facts;
  const { LESSONS, ABOUT, shuffle, esc, advanceClickOk } = F;
  const $ = (s, el = document) => el.querySelector(s);
  const app = $("#app");
  const SKEY = "usefulFacts.v1";
  const SNDKEY = "usefulFacts.sound.v1";

  const TONES = {
    metacognition: "#7c6cff",
    bias: "#ff5d2e",
    decisions: "#3ec6ff",
    money: "#f3c14a",
    procrastination: "#ff6b8a",
    neuroplasticity: "#7cf0d2",
    epigenetics: "#46e08a",
    geopolitics: "#4d8dff",
    thinking: "#f4f0e8",
    daily: "#ff5d2e"
  };
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
    const scored = bests.filter(n => n);
    const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : 0;
    return { done, total: LESSONS.length, avg, facts: F.allFacts().length, pct: Math.round(done / LESSONS.length * 100) };
  }

  function ringSvg(pct, tone, cls) {
    const r = 52, c = 2 * Math.PI * r;
    const dash = Math.max(0, Math.min(100, pct)) / 100 * c;
    return `<svg viewBox="0 0 120 120" class="ring ${cls || ""}" aria-hidden="true">
      <circle cx="60" cy="60" r="${r}" class="ring-bg"/>
      <circle cx="60" cy="60" r="${r}" class="ring-fg" style="stroke:${tone || "var(--accent)"};stroke-dasharray:${dash} ${c}"/></svg>`;
  }
  function ring(pct, label, sub, tone) {
    return `<div class="ring-wrap">${ringSvg(pct, tone)}<div class="ring-label"><b>${esc(String(label))}</b><span>${esc(sub)}</span></div></div>`;
  }
  function miniRing(pct, tone) {
    return `<svg viewBox="0 0 120 120" class="ring mini-ring" aria-hidden="true">
      <circle cx="60" cy="60" r="52" class="ring-bg"/>
      <circle cx="60" cy="60" r="52" class="ring-fg" style="stroke:${tone};stroke-dasharray:${Math.max(0, Math.min(100, pct)) / 100 * (2 * Math.PI * 52)} ${2 * Math.PI * 52}"/></svg>`;
  }
  function ticks(n, i) {
    return `<div class="ticks" aria-hidden="true">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? "done" : k === i ? "on" : ""}"><em></em></i>`).join("")}</div>`;
  }
  function ico(id) { return ICONS[id] || ICONS.thinking; }
  function tone(id) { return TONES[id] || "#ff5d2e"; }
  function setMode(play) { document.body.classList.toggle("mode-play", !!play); }

  function home() {
    prog.resume = null; save(); setMode(false);
    const s = stats();
    const cards = LESSONS.map(l => {
      const r = rec(l.id);
      const pct = r.done ? 100 : Math.round((r.seen || 0) / l.facts.length * 100);
      const score = r.last == null ? "Not quizzed yet" : `Best quiz ${r.best}%${r.done ? " · done" : ""}`;
      const extra = l.extra ? `<span class="tag">extra</span>` : "";
      const t = tone(l.id);
      return `<button class="tile${r.done ? " done" : ""}" data-id="${l.id}" style="--tone:${t}">
        <div class="tile-top"><span class="tile-ico">${ico(l.id)}</span>${miniRing(pct, t)}</div>
        <h3>${esc(l.title)}${extra}</h3>
        <p>${esc(l.blurb)}</p>
        <span class="meta">${esc(score)}</span>
      </button>`;
    }).join("");
    app.innerHTML = `
      <section class="hero">
        ${ring(s.pct, `${s.done}/${s.total}`, "lessons done")}
        <div class="hero-copy">
          <h2>Learn things most classes skip.</h2>
          <p>Nine short lessons on how money, the brain, and the world work. ${s.facts} checked facts, light quizzes, no locks. Progress stays on this device.</p>
          <div class="actions">
            <button id="daily">Daily mix</button>
            <button class="alt" id="data">Backup / restore</button>
            ${soundBtn()}
          </div>
        </div>
      </section>
      <div class="lessons">${cards}</div>
      <details class="about">
        <summary>About this list</summary>
        <p>${esc(ABOUT.post)}</p>
        <p>${esc(ABOUT.school)}</p>
        <div class="watch"><b>What the post got wrong, or stretched</b>${esc(ABOUT.caution)}</div>
      </details>`;
    app.querySelectorAll(".tile").forEach(b => b.onclick = () => startLesson(b.dataset.id));
    $("#daily").onclick = startDaily;
    $("#data").onclick = backup;
  }

  function nav(extra) {
    return `<div class="topbar"><button class="ghost" id="h">Home</button><div class="row">${soundBtn()}${extra || ""}</div></div>`;
  }

  function startLesson(id, resumeAt) {
    const lesson = LESSONS.find(l => l.id === id);
    if (!lesson) return home();
    const session = resumeAt && resumeAt.id === id ? resumeAt : { id, mode: "learn", i: 0, answers: [], order: null };
    prog.resume = session; save(); setMode(true);
    if (session.mode === "quiz") return showQuiz(lesson, session);
    showFact(lesson, session);
  }

  function showFact(lesson, session) {
    const i = session.i;
    const fact = lesson.facts[i];
    const r = rec(lesson.id);
    r.seen = Math.max(r.seen || 0, i + 1); save();
    const t = tone(lesson.id);
    const watch = fact.watch ? `<div class="watch"><b>Watch out</b>${esc(fact.watch)}</div>` : "";
    app.innerHTML = `
      ${nav(`<button class="ghost" id="rs">Restart</button>`)}
      <div class="stage">
        ${ticks(lesson.facts.length, i)}
        <section class="flash" id="fact" tabindex="0" style="--tone:${t}">
          <p class="step">${esc(lesson.title)} · ${i + 1} / ${lesson.facts.length}</p>
          <div class="flash-ico">${ico(lesson.id)}</div>
          <h2>${esc(fact.t)}</h2>
          <p class="body">${esc(fact.b)}</p>
          ${watch}
          <p class="hint">${i === 0 ? "Swipe or tap to continue" : "Swipe right to go back · tap or swipe left for next"}</p>
          ${i > 0 ? '<button class="hit-l" id="prevHit" aria-label="Previous fact"></button>' : ""}
          <button class="hit-r" id="nextHit" aria-label="Next" ${i === 0 ? 'style="width:100%"' : ""}></button>
        </section>
        <div class="row"><button id="next">${i + 1 < lesson.facts.length ? "Next fact" : "Start quiz"}</button></div>
      </div>`;
    const goNext = () => {
      if (i + 1 < lesson.facts.length) { session.i = i + 1; prog.resume = session; save(); showFact(lesson, session); }
      else { session.mode = "quiz"; session.i = 0; session.answers = []; session.order = buildQuiz(lesson); prog.resume = session; save(); showQuiz(lesson, session); }
    };
    const goPrev = () => { if (i > 0) { session.i = i - 1; prog.resume = session; save(); showFact(lesson, session); } };
    $("#next").onclick = goNext;
    $("#h").onclick = home;
    $("#rs").onclick = () => startLesson(lesson.id);
    $("#nextHit").onclick = ev => { ev.stopPropagation(); goNext(); };
    if ($("#prevHit")) $("#prevHit").onclick = ev => { ev.stopPropagation(); goPrev(); };
    bindSwipe($("#fact"), { onLeft: goNext, onRight: goPrev });
    bindKeys(goNext, goPrev);
  }

  function buildQuiz(lesson) {
    return lesson.quiz.map((q, qi) => {
      const opts = q.o.map((text, i) => ({ text, i }));
      return { qi, q: q.q, a: q.a, opts: shuffle(opts) };
    });
  }

  function showQuiz(lesson, session) {
    setMode(true);
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
      ? `<div class="fb ${answered.ok ? "ok" : "no"}">${answered.ok ? "Correct." : "Not quite. The highlighted answer is the one to remember."}</div><p class="hint">Tap or swipe to continue</p>`
      : "";
    app.innerHTML = `
      ${nav(`<button class="ghost" id="rs">Restart</button>`)}
      <div class="stage">
        ${ticks(order.length, i)}
        <section class="qcard" id="qcard">
          <p class="step">${esc(lesson.title)} · question ${i + 1} / ${order.length}</p>
          <h2>${esc(item.q)}</h2>
          <div class="opts">${buttons}</div>
          ${fb}
        </section>
      </div>`;
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
      bindSwipe($("#qcard"), { onLeft: go, onRight: null });
      bindKeys(go, null);
    }
  }

  function quizDone(lesson, session) {
    setMode(true);
    const n = session.answers.length;
    const right = session.answers.filter(a => a && a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    const r = rec(lesson.id);
    r.last = pct; r.best = Math.max(r.best || 0, pct); r.done = true; r.seen = lesson.facts.length;
    prog.resume = null; save();
    app.innerHTML = `
      ${nav("")}
      <section class="panel" style="text-align:center">
        <p class="step">${esc(lesson.title)}</p>
        <div class="score-xl">${pct}%</div>
        <p>You got <b>${right}/${n}</b>.${r.best > pct ? ` Best so far is ${r.best}%.` : ""} There is no passing score; retake whenever you want.</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          <button id="again">Retake lesson</button>
          <button class="alt" id="h2">Home</button>
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
    prog.resume = session; save(); setMode(true);
    showDaily(session);
  }

  function showDaily(session) {
    setMode(true);
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
      ? `<div class="fb ${answered.ok ? "ok" : "no"}">${answered.ok ? "Correct." : "Not quite. The highlighted answer is the one to remember."}<div class="muted">From ${esc(item.title)}</div></div><p class="hint">Tap or swipe to continue</p>`
      : `<p class="muted">From ${esc(item.title)}</p>`;
    app.innerHTML = `
      ${nav(`<button class="ghost" id="rs">Restart</button>`)}
      <div class="stage">
        ${ticks(order.length, i)}
        <section class="qcard" id="qcard">
          <p class="step">Daily mix · ${i + 1} / ${order.length}</p>
          <h2>${esc(item.q)}</h2>
          <div class="opts">${buttons}</div>
          ${fb}
        </section>
      </div>`;
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
      bindSwipe($("#qcard"), { onLeft: go, onRight: null });
      bindKeys(go, null);
    }
  }

  function dailyDone(session) {
    setMode(true);
    const n = session.answers.length;
    const right = session.answers.filter(a => a && a.ok).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    prog.dailyLast = pct; prog.dailyBest = Math.max(prog.dailyBest || 0, pct);
    prog.resume = null; save();
    app.innerHTML = `
      ${nav("")}
      <section class="panel" style="text-align:center">
        <p class="step">Daily mix</p>
        <div class="score-xl">${pct}%</div>
        <p>You got <b>${right}/${n}</b>.${prog.dailyBest > pct ? ` Best mix so far is ${prog.dailyBest}%.` : ""}</p>
        <div class="actions" style="justify-content:center;margin-top:1rem">
          <button id="again">Another mix</button>
          <button class="alt" id="h2">Home</button>
        </div>
      </section>`;
    $("#h").onclick = $("#h2").onclick = home;
    $("#again").onclick = startDaily;
  }

  let advanceFn = null;
  let keyFn = null;
  let suppressClick = false;
  function bindAdvance(fn) { advanceFn = fn; }
  function bindKeys(next, prev) {
    keyFn = ev => {
      if (ev.key === "ArrowRight" || ev.key === " " || ev.key === "Enter") { ev.preventDefault(); const f = next; clearNav(); f && f(); }
      else if (ev.key === "ArrowLeft" && prev) { ev.preventDefault(); const f = prev; clearNav(); f(); }
    };
  }
  function clearNav() { advanceFn = null; keyFn = null; }
  document.addEventListener("keydown", e => { if (keyFn) keyFn(e); });
  document.addEventListener("click", e => {
    if (suppressClick) { suppressClick = false; return; }
    if (!advanceFn) return;
    if (!app.contains(e.target) && e.target !== document.documentElement && e.target !== document.body) return;
    if (e.target && (e.target.id === "snd" || (e.target.closest && e.target.closest("#snd")))) return;
    if (!advanceClickOk(e.target)) return;
    const fn = advanceFn; advanceFn = null; fn();
  });

  function bindSwipe(el, { onLeft, onRight }) {
    if (!el) return;
    let x0 = null, y0 = null, tracking = false;
    const start = e => {
      const t = e.changedTouches ? e.changedTouches[0] : e;
      x0 = t.clientX; y0 = t.clientY; tracking = true;
    };
    const end = e => {
      if (!tracking) return; tracking = false;
      const t = e.changedTouches ? e.changedTouches[0] : e;
      const dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      suppressClick = true;
      if (dx < 0 && onLeft) { clearNav(); onLeft(); }
      else if (dx > 0 && onRight) { clearNav(); onRight(); }
      else suppressClick = false;
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", end);
  }

  function backup() {
    prog.resume && save();
    setMode(false);
    app.innerHTML = `
      ${nav("")}
      <section class="panel">
        <h2>Backup / restore</h2>
        <p>Progress lives in this browser only. Download a backup to keep it or move it to another device. Restoring replaces the progress on this device.</p>
        <div class="actions">
          <button id="ex">Download backup</button>
          <label class="btn alt">Restore from file<input type="file" id="im" accept=".json"></label>
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
