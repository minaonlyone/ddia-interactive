/*
 * DDIA Interactive — application engine.
 * Hash-routed single-page app. No build step, no dependencies.
 * Views: home  ·  section (reading + inline checks)  ·  evaluation (quiz).
 * Progress persists in localStorage.
 */
(function () {
  const C = window.DDIA_CONTENT;
  const DIAG = window.DDIA_DIAGRAMS;
  const PKEY = "ddia.progress.v1";
  const app = document.getElementById("app");

  /* ---------------------------- progress ---------------------------- */
  const Progress = {
    data: { sections: {}, checks: {}, evals: {} },
    load() {
      try {
        const raw = localStorage.getItem(PKEY);
        if (raw) this.data = Object.assign(this.data, JSON.parse(raw));
      } catch (_) {}
    },
    save() {
      try {
        localStorage.setItem(PKEY, JSON.stringify(this.data));
      } catch (_) {}
    },
    markSection(id) {
      this.data.sections[id] = true;
      this.save();
    },
    markCheck(id, correct) {
      this.data.checks[id] = { correct };
      this.save();
    },
    recordEval(id, pct, passed) {
      const prev = this.data.evals[id] || { best: 0, passed: false };
      this.data.evals[id] = {
        best: Math.max(prev.best, pct),
        passed: prev.passed || passed,
        last: pct,
      };
      this.save();
    },
    sectionDone(id) {
      return !!this.data.sections[id];
    },
    evalOf(id) {
      return this.data.evals[id] || null;
    },
    chapterPct(part, chap) {
      const total = chap.sections.length + 1; // sections + evaluation
      let done = chap.sections.filter((s) => this.sectionDone(`${part.id}.${chap.id}.${s.id}`)).length;
      const ev = this.evalOf(`${part.id}.${chap.id}`);
      if (ev && ev.passed) done++;
      return Math.round((done / total) * 100);
    },
  };

  /* ---------------------------- helpers ----------------------------- */
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // lightweight inline formatting: **bold**  *em*  `code`
  const fmt = (s) =>
    esc(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  const findChapter = (partId, chapId) => {
    const part = C.parts.find((p) => p.id === partId);
    const chap = part && part.chapters.find((c) => c.id === chapId);
    return { part, chap };
  };

  const ICONS = {
    layers: "M12 2 2 7l10 5 10-5-10-5Zm0 9L2 16l10 5 10-5-10-5Z",
    shield: "M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z",
    trending: "M3 17l6-6 4 4 8-8M21 7v6M21 7h-6",
    wrench: "M14 6a4 4 0 0 1 5 5l-9 9-4-4 9-9a4 4 0 0 1-1-1Z",
    check: "M20 6 9 17l-5-5",
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name] || ICONS.layers}"/></svg>`;

  /* --------------------------- block render ------------------------- */
  function renderBlock(b, ctx) {
    switch (b.type) {
      case "lead":
        return `<p class="lead">${fmt(b.text)}</p>`;
      case "p":
        return `<p>${fmt(b.text)}</p>`;
      case "h":
        return `<h3 class="sub">${fmt(b.text)}</h3>`;
      case "term":
        return `<div class="term"><span class="term-word">${fmt(b.word)}</span><span class="term-def">${fmt(
          b.def
        )}</span></div>`;
      case "list": {
        const tag = b.ordered ? "ol" : "ul";
        return `<${tag} class="blist">${b.items.map((i) => `<li>${fmt(i)}</li>`).join("")}</${tag}>`;
      }
      case "code":
        return `<pre class="code"><code>${esc(b.code)}</code></pre>`;
      case "callout":
        return `<div class="callout callout--${b.variant}"><div class="callout-tag">${esc(
          b.title
        )}</div><p>${fmt(b.text)}</p></div>`;
      case "figure": {
        const svg = DIAG[b.render] ? DIAG[b.render]() : "";
        return `<figure class="figure">${svg}<figcaption>${fmt(b.caption)}</figcaption></figure>`;
      }
      case "check":
        return renderQuestion(b, `${ctx}.chk${ctx.q || 0}`, { inline: true });
      default:
        return "";
    }
  }

  /* --------------------------- question ----------------------------- */
  // opts: { inline:bool }. Returns HTML; interactivity wired in wireQuestions().
  let qSeq = 0;
  function renderQuestion(q, id, opts = {}) {
    const qid = `q_${qSeq++}`;
    const saved = Progress.data.checks[id];
    return `
    <div class="quiz ${opts.inline ? "quiz--inline" : ""}" data-qid="${qid}" data-answer="${q.answer}" data-key="${esc(
      id
    )}" data-why="${esc(q.why)}">
      ${opts.inline ? `<div class="quiz-kicker">${icon("check")} Knowledge check</div>` : ""}
      <p class="quiz-q">${fmt(q.q)}</p>
      <div class="quiz-opts">
        ${q.options
          .map(
            (o, i) =>
              `<button class="opt" data-i="${i}"><span class="opt-key">${String.fromCharCode(
                65 + i
              )}</span><span class="opt-txt">${fmt(o)}</span></button>`
          )
          .join("")}
      </div>
      <div class="quiz-why" hidden></div>
      ${saved ? `<div class="quiz-prev ${saved.correct ? "ok" : "no"}">Previously answered ${
        saved.correct ? "correctly" : "incorrectly"
      }</div>` : ""}
    </div>`;
  }

  function wireQuestions(root, onAnswer) {
    root.querySelectorAll(".quiz").forEach((qel) => {
      const answer = +qel.dataset.answer;
      const why = qel.dataset.why;
      const key = qel.dataset.key;
      let locked = false;
      qel.querySelectorAll(".opt").forEach((opt) => {
        opt.addEventListener("click", () => {
          if (locked) return;
          locked = true;
          const chosen = +opt.dataset.i;
          const correct = chosen === answer;
          qel.classList.add("answered");
          qel.querySelectorAll(".opt").forEach((o) => {
            o.disabled = true;
            const i = +o.dataset.i;
            if (i === answer) o.classList.add("correct");
            if (i === chosen && !correct) o.classList.add("wrong");
          });
          const whyEl = qel.querySelector(".quiz-why");
          whyEl.hidden = false;
          whyEl.innerHTML = `<span class="why-tag">${correct ? "Correct" : "Not quite"}</span> ${fmt(why)}`;
          whyEl.classList.add(correct ? "ok" : "no");
          if (key) Progress.markCheck(key, correct);
          if (onAnswer) onAnswer(correct);
        });
      });
    });
  }

  /* ------------------------------ views ----------------------------- */
  function viewHome() {
    const parts = C.parts
      .map((part) => {
        const chapters = part.chapters
          .map((chap) => {
            const pct = Progress.chapterPct(part, chap);
            const ev = Progress.evalOf(`${part.id}.${chap.id}`);
            const badge = ev && ev.passed ? `<span class="pill pill--pass">Passed ${ev.best}%</span>` : "";
            return `
            <a class="chapcard" href="#/read/${part.id}/${chap.id}">
              <div class="chapcard-top">
                <span class="chapnum">Ch ${chap.number}</span>
                ${badge}
              </div>
              <h3>${esc(chap.title)}</h3>
              <p>${esc(chap.summary)}</p>
              <div class="chapcard-foot">
                <span class="est">${chap.estMinutes} min · ${chap.sections.length} sections</span>
                <span class="pct">${pct}%</span>
              </div>
              <div class="bar"><i style="width:${pct}%"></i></div>
            </a>`;
          })
          .join("");
        return `
        <section class="part">
          <div class="part-head">
            <span class="part-label">${esc(part.label)}</span>
            <h2>${esc(part.title)}</h2>
            <p class="part-blurb">${esc(part.blurb)}</p>
          </div>
          <div class="chapgrid">${chapters}</div>
        </section>`;
      })
      .join("");

    return `
    <header class="hero">
      <div class="hero-grid"></div>
      <div class="hero-inner">
        <div class="hero-kicker">Interactive field manual · learn by doing</div>
        <h1 class="hero-title">${esc(C.book.title)}</h1>
        <p class="hero-sub">${esc(C.book.subtitle)}</p>
        <p class="hero-by">A practical, question-driven companion to Martin Kleppmann's book — one focused Pomodoro at a time.</p>
        <div class="hero-cta">
          <a class="btn-primary lg" href="#/read/part1/ch1">Begin Chapter 1 →</a>
          <span class="hero-note">Your progress saves automatically in this browser.</span>
        </div>
        <div class="hero-legend">
          <span>${icon("shield")} Reliability</span>
          <span>${icon("trending")} Scalability</span>
          <span>${icon("wrench")} Maintainability</span>
        </div>
      </div>
    </header>
    <main class="wrap">${parts}
      <footer class="site-foot">
        <p>Built as a study companion. The book text is © Martin Kleppmann / O'Reilly — buy it to support the author.</p>
      </footer>
    </main>`;
  }

  function sectionNav(part, chap, activeId) {
    const items = chap.sections
      .map((s, i) => {
        const done = Progress.sectionDone(`${part.id}.${chap.id}.${s.id}`);
        const active = s.id === activeId;
        return `<a class="rail-item ${active ? "active" : ""} ${done ? "done" : ""}" href="#/read/${part.id}/${chap.id}/${s.id}">
          <span class="rail-ic">${icon(s.icon)}</span>
          <span class="rail-txt"><b>${esc(s.title)}</b><i>${s.estMinutes} min</i></span>
          <span class="rail-tick">${done ? icon("check") : `${i + 1}`}</span>
        </a>`;
      })
      .join("");
    const ev = Progress.evalOf(`${part.id}.${chap.id}`);
    const evDone = ev && ev.passed;
    return `
    <nav class="rail">
      <a class="rail-back" href="#/">← All chapters</a>
      <div class="rail-title"><span class="part-label">${esc(part.label)} · Ch ${chap.number}</span></div>
      ${items}
      <a class="rail-item rail-eval ${evDone ? "done" : ""}" href="#/eval/${part.id}/${chap.id}">
        <span class="rail-ic">${icon("check")}</span>
        <span class="rail-txt"><b>Evaluation</b><i>${evDone ? `passed ${ev.best}%` : "quiz · gate"}</i></span>
        <span class="rail-tick">${evDone ? icon("check") : "★"}</span>
      </a>
    </nav>`;
  }

  function viewSection(part, chap, section) {
    const idx = chap.sections.indexOf(section);
    const sid = `${part.id}.${chap.id}.${section.id}`;
    const blocks = section.blocks.map((b) => renderBlock(b, sid)).join("");
    const prev = idx > 0 ? chap.sections[idx - 1] : null;
    const next = idx < chap.sections.length - 1 ? chap.sections[idx + 1] : null;
    const nextHref = next
      ? `#/read/${part.id}/${chap.id}/${next.id}`
      : `#/eval/${part.id}/${chap.id}`;
    const nextLabel = next ? `Next: ${next.title} →` : "Take the chapter evaluation →";

    return `
    <div class="reader">
      ${sectionNav(part, chap, section.id)}
      <article class="content">
        <div class="content-head">
          <div class="crumb">${esc(part.label)} · Chapter ${chap.number} · Section ${idx + 1}/${chap.sections.length}</div>
          <h1>${icon(section.icon)} ${esc(section.title)}</h1>
        </div>
        <div class="prose">${blocks}</div>
        <div class="section-end">
          <button class="btn-primary mark-read" data-sid="${esc(sid)}" data-next="${nextHref}">
            Mark section read &amp; continue
          </button>
          <div class="section-nav">
            ${prev ? `<a class="btn-ghost" href="#/read/${part.id}/${chap.id}/${prev.id}">← ${esc(prev.title)}</a>` : "<span></span>"}
            <a class="btn-ghost" href="${nextHref}">${esc(nextLabel)}</a>
          </div>
        </div>
      </article>
    </div>`;
  }

  function viewEval(part, chap) {
    const ev = chap.evaluation;
    const id = `${part.id}.${chap.id}`;
    const prev = Progress.evalOf(id);
    const questions = ev.questions
      .map((q, i) => `<div class="eval-item"><span class="eval-n">${i + 1}</span>${renderQuestion(q, `${id}.eval.${i}`, {})}</div>`)
      .join("");
    return `
    <div class="reader reader--eval">
      ${sectionNav(part, chap, "__eval__")}
      <article class="content">
        <div class="content-head">
          <div class="crumb">${esc(part.label)} · Chapter ${chap.number} · Assessment</div>
          <h1>${icon("check")} ${esc(ev.title)}</h1>
          <p class="eval-intro">${esc(ev.intro)}</p>
          ${prev ? `<div class="eval-prevscore">Best so far: <b>${prev.best}%</b> ${prev.passed ? "· passed ✓" : ""}</div>` : ""}
        </div>
        <div class="eval-live" hidden>
          <span>Answered <b class="eval-answered">0</b>/${ev.questions.length}</span>
          <span>Score <b class="eval-score">0</b>%</span>
        </div>
        <form class="eval-form" data-id="${id}" data-pass="${ev.passPct}" data-total="${ev.questions.length}">
          ${questions}
        </form>
        <div class="eval-result" hidden></div>
      </article>
    </div>`;
  }

  /* ---------------------------- mounting ---------------------------- */
  function mount(html) {
    app.innerHTML = html;
    window.scrollTo(0, 0);
    wireDynamic();
  }

  function wireDynamic() {
    // reading: mark-read button
    const mr = app.querySelector(".mark-read");
    if (mr) {
      mr.addEventListener("click", () => {
        Progress.markSection(mr.dataset.sid);
        location.hash = mr.dataset.next.replace(/^#/, "");
      });
    }

    // inline knowledge checks
    wireQuestions(app.querySelector(".prose") || app);

    // evaluation form
    const form = app.querySelector(".eval-form");
    if (form) wireEvaluation(form);
  }

  function wireEvaluation(form) {
    const total = +form.dataset.total;
    const pass = +form.dataset.pass;
    const id = form.dataset.id;
    const reader = form.closest(".content");
    const live = reader.querySelector(".eval-live");
    const answeredEl = reader.querySelector(".eval-answered");
    const scoreEl = reader.querySelector(".eval-score");
    const resultEl = reader.querySelector(".eval-result");
    let answered = 0;
    let correctCount = 0;

    live.hidden = false;
    wireQuestions(form, (correct) => {
      answered++;
      if (correct) correctCount++;
      const pct = Math.round((correctCount / total) * 100);
      answeredEl.textContent = answered;
      scoreEl.textContent = pct;
      if (answered === total) finishEval();
    });

    function finishEval() {
      const pct = Math.round((correctCount / total) * 100);
      const passed = pct >= pass;
      Progress.recordEval(id, pct, passed);
      resultEl.hidden = false;
      resultEl.className = `eval-result ${passed ? "pass" : "fail"}`;
      resultEl.innerHTML = `
        <div class="result-score">${pct}<span>%</span></div>
        <div class="result-body">
          <h3>${passed ? "Chapter complete ✓" : "Not quite — review & retry"}</h3>
          <p>${correctCount} of ${total} correct. ${
        passed
          ? "You cleared the " + pass + "% bar. This chapter is marked done on your home screen."
          : "You need " + pass + "% to pass. Revisit the sections you missed and take it again — the questions reshuffle nothing, so focus on the *why* explanations above."
      }</p>
          <div class="result-cta">
            <a class="btn-primary" href="#/">Back to chapters</a>
            <button class="btn-ghost" onclick="location.reload()">Retake evaluation</button>
          </div>
        </div>`;
      resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ---------------------------- router ------------------------------ */
  function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/").filter(Boolean);

    if (parts.length === 0) return mount(viewHome());

    if (parts[0] === "read") {
      const { part, chap } = findChapter(parts[1], parts[2]);
      if (!chap) return mount(viewHome());
      const section =
        (parts[3] && chap.sections.find((s) => s.id === parts[3])) || chap.sections[0];
      return mount(viewSection(part, chap, section));
    }

    if (parts[0] === "eval") {
      const { part, chap } = findChapter(parts[1], parts[2]);
      if (!chap) return mount(viewHome());
      return mount(viewEval(part, chap));
    }

    mount(viewHome());
  }

  /* ------------------------------ boot ------------------------------ */
  Progress.load();
  window.addEventListener("hashchange", route);
  route();
  if (window.Pomodoro) window.Pomodoro.init();
})();
