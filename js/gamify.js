/*
 * gamify.js — XP, levels, and badges.
 *
 * Everything here is DERIVED from the saved Progress data (sections read,
 * inline checks answered, evaluations passed) plus the Pomodoro count — so it
 * needs no storage of its own except a record of what's already been announced
 * (kept by app.js in Progress.data.game) so toasts only fire on *new* unlocks.
 */
(function () {
  const XP = { section: 20, check: 15, evalMax: 150 };

  // Level thresholds (cumulative XP) with themed engineer titles.
  const LEVELS = [
    { min: 0, title: "Curious Reader" },
    { min: 60, title: "Intern" },
    { min: 150, title: "Junior Engineer" },
    { min: 300, title: "Backend Developer" },
    { min: 500, title: "Data Engineer" },
    { min: 750, title: "Systems Designer" },
    { min: 1100, title: "Distributed Thinker" },
    { min: 1500, title: "Staff Engineer" },
    { min: 2000, title: "Principal Architect" },
    { min: 2600, title: "Chief Data Whisperer" },
  ];

  const BADGES = [
    { id: "first-section", name: "First Contact", icon: "📡", desc: "Read your first section", test: (s) => s.sectionsRead >= 1 },
    { id: "five-checks", name: "Warming Up", icon: "🔥", desc: "Answer 5 knowledge checks correctly", test: (s) => s.checksCorrect >= 5 },
    { id: "ten-checks", name: "Quiz Whiz", icon: "🧠", desc: "Answer 10 knowledge checks correctly", test: (s) => s.checksCorrect >= 10 },
    { id: "first-eval", name: "Certified", icon: "🎖️", desc: "Pass a chapter evaluation", test: (s) => s.evalsPassed >= 1 },
    { id: "flawless", name: "Flawless", icon: "💎", desc: "Ace an evaluation with 100%", test: (s) => s.flawless },
    { id: "chapter", name: "Chapter Master", icon: "📗", desc: "Fully complete a chapter", test: (s) => s.chaptersComplete >= 1 },
    {
      id: "foundations",
      name: "Foundations Cleared",
      icon: "🏛️",
      desc: "Complete every available chapter of Part I",
      test: (s, content) => {
        const p1 = content.parts.find((p) => p.id === "part1");
        if (!p1) return false;
        const ready = p1.chapters.filter((c) => c.status !== "coming" && c.sections.length);
        return ready.length > 0 && ready.every((c) => s.doneChapters.includes(c.id));
      },
    },
    { id: "focused", name: "In The Zone", icon: "🍅", desc: "Finish 4 Pomodoro focus blocks", test: (s) => s.pomodoros >= 4 },
  ];

  function pomodoroCount() {
    try {
      return (JSON.parse(localStorage.getItem("ddia.pomodoro.v1")) || {}).completed || 0;
    } catch (_) {
      return 0;
    }
  }

  function statsOf(content, P) {
    const sections = P.sections || {};
    const checks = P.checks || {};
    const evals = P.evals || {};
    const sectionsRead = Object.values(sections).filter(Boolean).length;
    // inline checks only (exclude evaluation questions, keyed with ".eval.")
    const checksCorrect = Object.entries(checks).filter(
      ([k, v]) => v && v.correct && k.indexOf(".eval.") === -1
    ).length;

    let evalXp = 0,
      evalsPassed = 0,
      flawless = false;
    Object.values(evals).forEach((e) => {
      evalXp += Math.round(((e.best || 0) / 100) * XP.evalMax);
      if (e.passed) evalsPassed++;
      if ((e.best || 0) >= 100) flawless = true;
    });

    let chaptersComplete = 0;
    const doneChapters = [];
    content.parts.forEach((part) =>
      part.chapters.forEach((ch) => {
        if (ch.status === "coming" || !ch.sections.length) return;
        const allRead = ch.sections.every((s) => sections[`${part.id}.${ch.id}.${s.id}`]);
        const ev = evals[`${part.id}.${ch.id}`];
        if (allRead && ev && ev.passed) {
          chaptersComplete++;
          doneChapters.push(ch.id);
        }
      })
    );

    const xp = sectionsRead * XP.section + checksCorrect * XP.check + evalXp;
    return { sectionsRead, checksCorrect, evalsPassed, flawless, chaptersComplete, doneChapters, xp, pomodoros: pomodoroCount() };
  }

  function levelFor(xp) {
    let i = 0;
    for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k].min) i = k;
    const cur = LEVELS[i];
    const next = LEVELS[i + 1] || null;
    const ceil = next ? next.min : cur.min;
    const pct = next ? Math.round(((xp - cur.min) / (ceil - cur.min)) * 100) : 100;
    return { num: i + 1, title: cur.title, min: cur.min, next, nextTitle: next ? next.title : null, toNext: next ? ceil - xp : 0, pct };
  }

  function compute(content, P) {
    const s = statsOf(content, P);
    const level = levelFor(s.xp);
    const badges = BADGES.map((b) => ({ id: b.id, name: b.name, icon: b.icon, desc: b.desc, earned: !!b.test(s, content) }));
    return { xp: s.xp, level, stats: s, badges };
  }

  const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* --------------------------- rendering ---------------------------- */
  function renderDashboard(g) {
    const L = g.level;
    const earned = g.badges.filter((b) => b.earned).length;
    const badges = g.badges
      .map(
        (b) => `
      <div class="badge ${b.earned ? "earned" : "locked"}">
        <span class="badge-ic">${b.earned ? b.icon : "🔒"}</span>
        <span class="badge-tx"><b>${esc(b.name)}</b><i>${esc(b.desc)}</i></span>
      </div>`
      )
      .join("");
    return `
    <section class="dash">
      <div class="dash-head">
        <div class="lvl-ring" style="--p:${L.pct}">
          <div class="lvl-inner"><span class="lvl-n">${L.num}</span><span class="lvl-lab">LVL</span></div>
        </div>
        <div class="lvl-meta">
          <span class="dash-kicker">Your progress</span>
          <h2 class="lvl-title">${esc(L.title)}</h2>
          <div class="xp-bar"><i style="width:${L.pct}%"></i></div>
          <span class="xp-text"><b>${g.xp}</b> XP${
      L.next ? ` · <b>${L.toNext}</b> to ${esc(L.nextTitle)}` : " · max level reached 🏆"
    }</span>
        </div>
        <div class="dash-stats">
          <div><b>${g.stats.chaptersComplete}</b><span>chapters</span></div>
          <div><b>${g.stats.sectionsRead}</b><span>sections</span></div>
          <div><b>${g.stats.checksCorrect}</b><span>checks</span></div>
          <div><b>${earned}/${g.badges.length}</b><span>badges</span></div>
        </div>
      </div>
      <div class="badges">${badges}</div>
    </section>`;
  }

  function renderRailChip(g) {
    return `
    <div class="rail-xp">
      <div class="rail-xp-top"><span class="rail-lvl">LVL ${g.level.num}</span><span class="rail-xptxt">${g.xp} XP</span></div>
      <div class="xp-bar sm"><i style="width:${g.level.pct}%"></i></div>
      <span class="rail-lvltitle">${esc(g.level.title)}</span>
    </div>`;
  }

  /* --------------------------- notifications ------------------------ */
  let queue = [],
    showing = false;

  function notify(evt) {
    queue.push(evt);
    if (!showing) drain();
  }
  function drain() {
    if (!queue.length) {
      showing = false;
      return;
    }
    showing = true;
    const evt = queue.shift();
    const el = document.createElement("div");
    if (evt.type === "level") {
      el.className = "game-toast game-toast--level";
      el.innerHTML = `<div class="gt-ic">⬆</div><div class="gt-tx"><b>Level up! You're now Level ${evt.level.num}</b><i>${esc(
        evt.level.title
      )}</i></div>`;
    } else {
      el.className = "game-toast game-toast--badge";
      el.innerHTML = `<div class="gt-ic">${evt.badge.icon}</div><div class="gt-tx"><b>Badge unlocked — ${esc(
        evt.badge.name
      )}</b><i>${esc(evt.badge.desc)}</i></div>`;
    }
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => {
        el.remove();
        drain();
      }, 400);
    }, 3600);
  }

  function xpPop(n) {
    const el = document.createElement("div");
    el.className = "xp-pop";
    el.textContent = "+" + n + " XP";
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("go"));
    setTimeout(() => el.remove(), 1200);
  }

  window.Gamify = { compute, renderDashboard, renderRailChip, notify, xpPop, LEVELS, BADGES, XP };
})();
