/* Mystery tab: False North case file, unlocked by Geography performance. */
(function () {
  const MKEY = "usefulFacts.mystery.v1";
  const $ = (s, el = document) => el.querySelector(s);
  const app = () => document.getElementById("app");
  const esc = (s) => (window.Facts && window.Facts.esc) ? window.Facts.esc(s) : String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DATA = () => window.MYSTERY_DATA;
  const shotMode = { on: false, extra: null };

  const blank = () => ({ unlocked: ["intro"], read: [] });
  function hydrate(raw) {
    const base = blank();
    if (!raw || typeof raw !== "object") return base;
    const out = { unlocked: Array.isArray(raw.unlocked) ? raw.unlocked.slice() : ["intro"], read: Array.isArray(raw.read) ? raw.read.slice() : [] };
    if (!out.unlocked.includes("intro")) out.unlocked.unshift("intro");
    return out;
  }
  let state = blank();
  try { state = hydrate(JSON.parse(localStorage.getItem(MKEY) || "null")); } catch (e) { state = blank(); }
  const save = () => { if (shotMode.on) return; try { localStorage.setItem(MKEY, JSON.stringify(state)); } catch (e) {} };

  function setTab(which) {
    const ids = { lessons: "tab-lessons", geo: "tab-geo", mystery: "tab-mystery" };
    Object.keys(ids).forEach(k => {
      const el = document.getElementById(ids[k]);
      if (el) el.classList.toggle("on", which === k);
    });
  }

  function kindOf(cid) { return cid === "us" ? "us" : "world"; }
  function continentName(cid) {
    const c = window.GeoData && window.GeoData.CONTINENTS && window.GeoData.CONTINENTS.find(x => x.id === cid);
    return c ? c.name : cid;
  }
  function passedSteps(cid) {
    return (window.Geo && window.Geo.passedSteps) ? window.Geo.passedSteps(cid) : 0;
  }
  function testPassed(cid) {
    return (window.Geo && window.Geo.testPassed) ? window.Geo.testPassed(cid) : false;
  }
  function allTestsPassed() {
    const list = (window.GeoData && window.GeoData.CONTINENTS) || [];
    return list.length > 0 && list.every(c => testPassed(c.id));
  }
  function meets(clue) {
    const u = clue.unlock || { type: "free" };
    if (u.type === "free") return true;
    if (u.type === "steps") return passedSteps(u.cid) >= (u.n || 1);
    if (u.type === "test") return testPassed(u.cid);
    if (u.type === "finale") return allTestsPassed();
    return false;
  }
  function availableIds() {
    const extra = (shotMode.on && shotMode.extra) || [];
    const have = new Set(state.unlocked.concat(extra));
    (DATA().clues || []).forEach(c => { if (meets(c)) have.add(c.id); });
    return [...have];
  }
  function sync() {
    const before = new Set(state.unlocked);
    const now = availableIds();
    const added = now.filter(id => !before.has(id));
    if (added.length && !shotMode.on) {
      state.unlocked = now;
      save();
    } else if (now.length !== state.unlocked.length) {
      state.unlocked = now;
      if (!shotMode.on) save();
    }
    return added;
  }
  function isOpen(id) { return availableIds().includes(id); }
  function markRead(id) {
    if (shotMode.on) return;
    if (!state.read.includes(id)) { state.read.push(id); save(); }
  }
  function unreadCount() {
    return availableIds().filter(id => id !== "intro" && !state.read.includes(id)).length;
  }
  function suspectLevel(sid) {
    let lvl = 0;
    (DATA().clues || []).forEach(c => {
      if (isOpen(c.id) && c.suspect && c.suspect[sid]) lvl = Math.max(lvl, c.suspect[sid]);
    });
    return lvl;
  }
  function stageText(suspect) {
    const lvl = suspectLevel(suspect.id);
    let text = suspect.stages[0] ? suspect.stages[0].text : "";
    suspect.stages.forEach(s => { if (s.min <= lvl) text = s.text; });
    return text;
  }
  function theoryText() {
    const open = new Set(availableIds());
    let text = "";
    (DATA().theories || []).forEach(t => {
      if (t.text && (t.need || []).every(id => open.has(id))) text = t.text;
    });
    return text;
  }
  function paras(s) {
    return String(s || "").split(/\n\n+/).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  }
  function unlockHint(clue) {
    const u = clue.unlock || {};
    if (u.type === "steps") {
      const n = u.n || 1;
      const have = passedSteps(u.cid);
      const word = n === 1 ? "quiz" : "quizzes";
      return `${clue.teaser || ""} Currently ${have}/${n} ${continentName(u.cid)} learn-path ${word} passed at 90%.`;
    }
    if (u.type === "test") {
      return `${clue.teaser || ""} Pass the ${continentName(u.cid)} region test at 90% to open this folder.`;
    }
    if (u.type === "finale") return clue.teaser || "The last folders open when every region's test has been passed at 90%.";
    return clue.teaser || "Locked.";
  }

  function nav(extra) {
    const sound = (window.UF && window.UF.soundBtn) ? window.UF.soundBtn() : "";
    return `<div class="topbar"><button class="ghost" id="h">Case board</button><div class="actions">${sound}${extra || ""}</div></div>`;
  }

  function open(opts) {
    setTab("mystery");
    shotMode.on = !!(opts && opts.shot);
    shotMode.extra = (opts && opts.unlock) || null;
    sync();
    if (opts && opts.clue && isOpen(opts.clue)) return showClue(opts.clue);
    board();
  }

  function board() {
    setTab("mystery");
    const clues = DATA().clues || [];
    const openIds = availableIds();
    const nOpen = openIds.length;
    const cards = clues.map(c => {
      const unlocked = openIds.includes(c.id);
      const fresh = unlocked && c.id !== "intro" && !state.read.includes(c.id);
      const cls = unlocked ? ("clue-card" + (fresh ? " fresh" : "")) : "clue-card locked";
      const meta = unlocked ? esc(c.place || "") : "Locked";
      const body = unlocked
        ? `<h3>${esc(c.title)}</h3><p class="muted">${esc(c.place || "")}</p>`
        : `<h3>Sealed folder</h3><p class="muted">${esc(unlockHint(c))}</p>`;
      return `<button type="button" class="${cls}" data-id="${esc(c.id)}" ${unlocked ? "" : "disabled"} data-open="${unlocked ? "1" : "0"}">
        <span class="pin" aria-hidden="true"></span>
        <span class="clue-index">${esc(meta)}</span>
        ${body}
      </button>`;
    }).join("");
    const suspects = (DATA().suspects || []).map(s => {
      const lvl = suspectLevel(s.id);
      return `<article class="suspect-card" data-id="${esc(s.id)}">
        <p class="kicker" style="justify-content:flex-start">${esc(s.role)}</p>
        <h3>${esc(s.name)}</h3>
        <p>${esc(stageText(s))}</p>
        <p class="muted">${lvl ? "Profile updated as folders opened." : "Early notes only."}</p>
      </article>`;
    }).join("");
    const theory = theoryText();
    const fresh = unreadCount();
    const freshLine = fresh ? ` ${fresh} new folder${fresh === 1 ? "" : "s"} to read.` : "";
    app().innerHTML = `
      <section class="cover">
        <p class="kicker">A case file</p>
        <h1>${esc(DATA().title)}</h1>
        <p class="cover-lead">${esc(DATA().premise)}</p>
        <p class="muted">${nOpen} of ${clues.length} folders open.${esc(freshLine)} ${esc(DATA().how)}</p>
      </section>
      <section class="case-theory">
        <h2>The case so far</h2>
        <p>${esc(theory)}</p>
      </section>
      <section>
        <h2 class="board-title" style="display:table">Suspects and persons of interest</h2>
        <div class="suspect-row">${suspects}</div>
      </section>
      <section class="board mystery-board">
        <h2 class="board-title">The board</h2>
        <div class="clue-grid">${cards}</div>
      </section>`;
    app().querySelectorAll(".clue-card[data-open='1']").forEach(b => {
      b.onclick = () => showClue(b.dataset.id);
    });
  }

  function showClue(id) {
    setTab("mystery");
    const clues = DATA().clues || [];
    const clue = clues.find(c => c.id === id);
    if (!clue || !isOpen(id)) return board();
    markRead(id);
    const openIds = availableIds();
    const idx = clues.findIndex(c => c.id === id);
    const prev = [...clues.slice(0, idx)].reverse().find(c => openIds.includes(c.id));
    const next = clues.slice(idx + 1).find(c => openIds.includes(c.id));
    app().innerHTML = `
      ${nav("")}
      <article class="spread clue-spread">
        <header class="spread-hero">
          <p class="kicker">Case file · ${esc(clue.place || "Folder")}</p>
          <h1 style="font-size:clamp(2.1rem,7vw,3.8rem)">${esc(clue.title)}</h1>
        </header>
        <div class="clue-body">${paras(clue.body)}</div>
        <div class="actions" style="margin-top:1.2rem">
          ${prev ? `<button class="alt" id="prev">Earlier: ${esc(prev.title)}</button>` : ""}
          ${next ? `<button id="next">Next open: ${esc(next.title)}</button>` : ""}
          <button class="ghost" id="back">Back to the board</button>
        </div>
      </article>`;
    $("#h").onclick = board;
    $("#back").onclick = board;
    if ($("#prev")) $("#prev").onclick = () => showClue(prev.id);
    if ($("#next")) $("#next").onclick = () => showClue(next.id);
  }

  function toast(added) {
    if (!added || !added.length || shotMode.on) return null;
    const first = (DATA().clues || []).find(c => c.id === added[0]);
    const more = added.length > 1 ? ` and ${added.length - 1} more` : "";
    return {
      html: `<div class="mystery-toast" id="mystery-toast">
        <p>A folder opened on the case board${first ? ": <b>" + esc(first.title) + "</b>" : ""}${esc(more)}.</p>
        <button type="button" id="open-mystery">Open Mystery</button>
      </div>`,
      bind: () => { const b = document.getElementById("open-mystery"); if (b) b.onclick = ev => { ev.stopPropagation(); open(); }; }
    };
  }

  window.Mystery = {
    open, setTab, sync, toast, unreadCount, exportState: () => ({ unlocked: state.unlocked.slice(), read: state.read.slice() }),
    importState: (data) => { if (data && typeof data === "object") { state = hydrate(data); save(); } },
    title: () => (DATA() && DATA().title) || "False North"
  };
})();
