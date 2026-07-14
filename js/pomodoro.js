/*
 * Pomodoro widget — a small focus timer that lives in the corner of the app.
 * 25-minute focus blocks alternating with 5-minute breaks (long break every 4).
 * State persists across reloads via localStorage so a session survives a refresh.
 */
(function () {
  const KEY = "ddia.pomodoro.v1";
  const MODES = {
    focus: { label: "Focus", mins: 25, next: "short" },
    short: { label: "Short break", mins: 5, next: "focus" },
    long: { label: "Long break", mins: 15, next: "focus" },
  };

  const Pomodoro = {
    el: null,
    tickHandle: null,
    state: {
      mode: "focus",
      remaining: MODES.focus.mins * 60,
      running: false,
      completed: 0, // focus blocks finished
      endsAt: null, // wall-clock ms when running, so tab-throttling can't drift
    },

    init() {
      this.load();
      this.render();
      // If we reloaded mid-run, recompute remaining from the wall clock.
      if (this.state.running && this.state.endsAt) {
        this.state.remaining = Math.max(0, Math.round((this.state.endsAt - Date.now()) / 1000));
        this.startTick();
      }
      this.paint();
    },

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) Object.assign(this.state, JSON.parse(raw));
      } catch (_) {}
    },
    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.state));
      } catch (_) {}
    },

    setMode(mode, autostart) {
      this.stopTick();
      this.state.mode = mode;
      this.state.remaining = MODES[mode].mins * 60;
      this.state.running = false;
      this.state.endsAt = null;
      if (autostart) this.start();
      else {
        this.save();
        this.paint();
      }
    },

    start() {
      if (this.state.running) return;
      this.state.running = true;
      this.state.endsAt = Date.now() + this.state.remaining * 1000;
      this.startTick();
      this.save();
      this.paint();
    },
    pause() {
      this.state.running = false;
      this.state.endsAt = null;
      this.stopTick();
      this.save();
      this.paint();
    },
    reset() {
      this.setMode(this.state.mode, false);
    },
    toggle() {
      this.state.running ? this.pause() : this.start();
    },
    collapse() {
      this.el.classList.toggle("pom--min");
    },

    startTick() {
      this.stopTick();
      this.tickHandle = setInterval(() => this.tick(), 250);
    },
    stopTick() {
      if (this.tickHandle) clearInterval(this.tickHandle);
      this.tickHandle = null;
    },

    tick() {
      if (!this.state.running) return;
      this.state.remaining = Math.max(0, Math.round((this.state.endsAt - Date.now()) / 1000));
      if (this.state.remaining <= 0) this.complete();
      else this.paint();
    },

    complete() {
      this.stopTick();
      const finished = this.state.mode;
      if (finished === "focus") this.state.completed++;
      this.ding();
      this.flash(finished);
      // choose next mode: long break after every 4th focus block
      let next = MODES[finished].next;
      if (finished === "focus" && this.state.completed % 4 === 0) next = "long";
      this.setMode(next, false);
    },

    ding() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [880, 1320];
        notes.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = f;
          o.type = "sine";
          o.connect(g);
          g.connect(ctx.destination);
          const t = ctx.currentTime + i * 0.18;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
          o.start(t);
          o.stop(t + 0.36);
        });
      } catch (_) {}
    },

    flash(mode) {
      const msg = mode === "focus" ? "Focus block done — take a break." : "Break over — back to it.";
      const n = document.createElement("div");
      n.className = "pom-toast";
      n.textContent = msg;
      document.body.appendChild(n);
      requestAnimationFrame(() => n.classList.add("show"));
      setTimeout(() => {
        n.classList.remove("show");
        setTimeout(() => n.remove(), 400);
      }, 4200);
    },

    fmt(s) {
      const m = Math.floor(s / 60);
      const r = s % 60;
      return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
    },

    render() {
      const el = document.createElement("div");
      el.className = "pom";
      el.innerHTML = `
        <button class="pom-collapse" title="Minimize" aria-label="Minimize timer">–</button>
        <div class="pom-body">
          <div class="pom-modes" role="tablist">
            <button data-mode="focus" class="pom-mode">Focus</button>
            <button data-mode="short" class="pom-mode">Break</button>
            <button data-mode="long"  class="pom-mode">Long</button>
          </div>
          <div class="pom-clock" aria-live="polite">25:00</div>
          <div class="pom-meta"><span class="pom-mlabel">Focus</span> · <span class="pom-count">0</span> done</div>
          <div class="pom-ctrls">
            <button class="pom-toggle btn-primary">Start</button>
            <button class="pom-reset btn-ghost" title="Reset">Reset</button>
          </div>
        </div>
        <div class="pom-mini">🍅 <span class="pom-mini-time">25:00</span></div>`;
      document.body.appendChild(el);
      this.el = el;

      el.querySelector(".pom-collapse").addEventListener("click", () => this.collapse());
      el.querySelector(".pom-mini").addEventListener("click", () => this.collapse());
      el.querySelector(".pom-toggle").addEventListener("click", () => this.toggle());
      el.querySelector(".pom-reset").addEventListener("click", () => this.reset());
      el.querySelectorAll(".pom-mode").forEach((b) =>
        b.addEventListener("click", () => this.setMode(b.dataset.mode, false))
      );
    },

    paint() {
      if (!this.el) return;
      const { mode, remaining, running, completed } = this.state;
      const total = MODES[mode].mins * 60;
      this.el.querySelector(".pom-clock").textContent = this.fmt(remaining);
      this.el.querySelector(".pom-mini-time").textContent = this.fmt(remaining);
      this.el.querySelector(".pom-mlabel").textContent = MODES[mode].label;
      this.el.querySelector(".pom-count").textContent = completed;
      this.el.querySelector(".pom-toggle").textContent = running ? "Pause" : "Start";
      this.el.classList.toggle("pom--running", running);
      this.el.dataset.mode = mode;
      this.el.querySelectorAll(".pom-mode").forEach((b) =>
        b.classList.toggle("is-active", b.dataset.mode === mode)
      );
      // progress ring via conic gradient
      const pct = 1 - remaining / total;
      this.el.style.setProperty("--pom-pct", (pct * 100).toFixed(1) + "%");
      document.title =
        running ? `${this.fmt(remaining)} · ${MODES[mode].label} — DDIA` : "DDIA Interactive";
    },
  };

  window.Pomodoro = Pomodoro;
})();
