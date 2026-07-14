/*
 * Hand-built SVG diagrams for the chapter figures.
 * Each function returns an SVG string. Colours come from CSS variables so the
 * figures adapt to light/dark themes. Referenced by `render` keys in content.js.
 */
window.DDIA_DIAGRAMS = {
  /* Figure 1-1 — a composite data system behind one API */
  dataSystem() {
    return `
<svg viewBox="0 0 640 400" role="img" aria-label="Data system architecture combining cache, database, search index and message queue behind one API" class="fig-svg">
  <defs>
    <marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0 0 L9 4.5 L0 9 z" fill="var(--ink)"/>
    </marker>
  </defs>
  <!-- client -->
  <circle cx="320" cy="34" r="12" fill="none" stroke="var(--ink)" stroke-width="1.6"/>
  <path d="M320 46 v20" stroke="var(--ink)" stroke-width="1.6" marker-end="url(#ah)"/>
  <text x="332" y="60" class="d-lbl">client requests · API</text>
  <!-- app code (central) -->
  <rect x="238" y="86" width="164" height="42" rx="3" fill="var(--paper-2)" stroke="var(--sig)" stroke-width="1.8"/>
  <text x="320" y="112" text-anchor="middle" class="d-node">Application code</text>
  <!-- cache -->
  <rect x="46" y="86" width="120" height="42" rx="3" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.4"/>
  <text x="106" y="105" text-anchor="middle" class="d-node">In-memory</text>
  <text x="106" y="120" text-anchor="middle" class="d-node">cache</text>
  <path d="M238 100 H172" stroke="var(--ink)" stroke-width="1.4" marker-end="url(#ah)"/>
  <text x="205" y="93" text-anchor="middle" class="d-lbl">reads</text>
  <!-- primary db -->
  <rect x="238" y="196" width="120" height="42" rx="3" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.4"/>
  <text x="298" y="215" text-anchor="middle" class="d-node">Primary</text>
  <text x="298" y="230" text-anchor="middle" class="d-node">database</text>
  <path d="M300 128 V190" stroke="var(--ink)" stroke-width="1.4" marker-end="url(#ah)"/>
  <text x="308" y="165" class="d-lbl">writes</text>
  <!-- search index -->
  <rect x="392" y="196" width="120" height="42" rx="3" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.4"/>
  <text x="452" y="215" text-anchor="middle" class="d-node">Full-text</text>
  <text x="452" y="230" text-anchor="middle" class="d-node">index</text>
  <path d="M360 122 L440 190" stroke="var(--ink)" stroke-width="1.4" marker-end="url(#ah)"/>
  <text x="420" y="150" class="d-lbl">search</text>
  <!-- async worker + queue -->
  <rect x="392" y="86" width="120" height="42" rx="3" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.4"/>
  <text x="452" y="112" text-anchor="middle" class="d-node">Message queue</text>
  <path d="M402 107 H520 V200" stroke="var(--ink)" stroke-width="1.4" fill="none" marker-end="url(#ah)"/>
  <text x="470" y="80" text-anchor="middle" class="d-lbl">async tasks</text>
  <rect x="470" y="240" width="120" height="40" rx="3" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.4"/>
  <text x="530" y="264" text-anchor="middle" class="d-node">Worker</text>
  <!-- sync arrows between db and derived stores -->
  <path d="M298 238 L298 300 L452 300 L452 240" stroke="var(--ink)" stroke-width="1.2" fill="none" stroke-dasharray="4 3" marker-end="url(#ah)"/>
  <text x="360" y="318" text-anchor="middle" class="d-lbl">app code keeps derived data in sync</text>
  <path d="M46 128 L46 300 L280 300" stroke="var(--ink)" stroke-width="1.2" fill="none" stroke-dasharray="4 3"/>
  <text x="60" y="215" class="d-lbl">invalidate</text>
  <!-- outside world -->
  <rect x="470" y="326" width="120" height="34" rx="3" fill="none" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="530" y="347" text-anchor="middle" class="d-lbl">"outside world"</text>
  <path d="M530 280 V320" stroke="var(--ink)" stroke-width="1.2" marker-end="url(#ah)"/>
</svg>`;
  },

  /* Figure 1-3 — write-time fan-out */
  fanout() {
    return `
<svg viewBox="0 0 640 300" role="img" aria-label="Twitter write-time fan-out delivering a tweet to each follower's timeline cache" class="fig-svg">
  <defs>
    <marker id="ah2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0 0 L9 4.5 L0 9 z" fill="var(--ink)"/>
    </marker>
  </defs>
  <!-- poster -->
  <circle cx="52" cy="150" r="14" fill="none" stroke="var(--sig)" stroke-width="1.8"/>
  <text x="52" y="185" text-anchor="middle" class="d-lbl">user posts</text>
  <text x="52" y="199" text-anchor="middle" class="d-lbl">4.6k writes/s</text>
  <!-- all tweets store -->
  <rect x="118" y="128" width="150" height="44" rx="3" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.4"/>
  <text x="193" y="147" text-anchor="middle" class="d-node">All tweets</text>
  <text x="193" y="163" text-anchor="middle" class="d-lbl">T8 T7 T6 T5 T4 T3 T2 T1</text>
  <path d="M66 150 H112" stroke="var(--ink)" stroke-width="1.6" marker-end="url(#ah2)"/>
  <!-- fan out -->
  <text x="360" y="40" text-anchor="middle" class="d-lbl">fan-out: deliver to each follower's timeline · 345k writes/s</text>
  ${[70, 150, 230].map((y, i) => `
  <path d="M268 150 C 320 150, 330 ${y}, 392 ${y}" stroke="var(--sig)" stroke-width="1.4" fill="none" marker-end="url(#ah2)"/>
  <rect x="392" y="${y - 20}" width="150" height="40" rx="3" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.4"/>
  <text x="467" y="${y - 4}" text-anchor="middle" class="d-node">Timeline ${i + 1}</text>
  <text x="467" y="${y + 12}" text-anchor="middle" class="d-lbl">precomputed cache</text>
  <circle cx="588" cy="${y}" r="11" fill="none" stroke="var(--ink)" stroke-width="1.5"/>
  <path d="M577 ${y} H548" stroke="var(--ink)" stroke-width="1.3" marker-end="url(#ah2)"/>`).join("")}
  <text x="588" y="285" text-anchor="middle" class="d-lbl">300k reads/s</text>
</svg>`;
  },

  /* Ch3 — row-oriented vs column-oriented storage layout */
  rowVsColumn() {
    const cols = ["id", "name", "region", "price"];
    const rows = [
      ["1", "Kettle", "EU", "29"],
      ["2", "Lamp", "US", "40"],
      ["3", "Mug", "EU", "12"],
    ];
    const rowColors = ["var(--sig)", "var(--teal)", "var(--amber)"];
    let out = `<svg viewBox="0 0 640 300" role="img" aria-label="Row-oriented versus column-oriented storage layout" class="fig-svg">`;
    // left: row-oriented
    out += `<text x="20" y="24" class="d-node" style="font-weight:700">Row-oriented</text>`;
    out += `<text x="20" y="40" class="d-lbl">whole rows stored together</text>`;
    let x = 20, y = 58;
    rows.forEach((r, ri) => {
      r.forEach((v, ci) => {
        out += `<rect x="${x + ci * 62}" y="${y + ri * 34}" width="60" height="30" fill="none" stroke="${rowColors[ri]}" stroke-width="1.4"/><text x="${x + ci * 62 + 30}" y="${y + ri * 34 + 19}" text-anchor="middle" class="d-lbl" fill="var(--ink)">${v}</text>`;
      });
      out += `<text x="${x + 4 * 62 + 6}" y="${y + ri * 34 + 19}" class="d-lbl" fill="${rowColors[ri]}">row ${ri + 1}</text>`;
    });
    // right: column-oriented
    const cx = 360;
    out += `<text x="${cx}" y="24" class="d-node" style="font-weight:700">Column-oriented</text>`;
    out += `<text x="${cx}" y="40" class="d-lbl">each column stored together</text>`;
    cols.forEach((c, ci) => {
      out += `<text x="${cx}" y="${58 + ci * 34 + 19}" class="d-lbl" fill="var(--sig)">${c}</text>`;
      rows.forEach((r, ri) => {
        out += `<rect x="${cx + 46 + ri * 46}" y="${58 + ci * 34}" width="44" height="30" fill="none" stroke="var(--muted)" stroke-width="1.3"/><text x="${cx + 46 + ri * 46 + 22}" y="${58 + ci * 34 + 19}" text-anchor="middle" class="d-lbl" fill="var(--ink)">${r[ci]}</text>`;
      });
    });
    out += `<rect x="${cx + 44}" y="${58 + 3 * 34}" width="140" height="30" fill="var(--sig)" opacity="0.10"/>`;
    out += `<text x="${cx}" y="290" class="d-lbl">a query on “price” reads only the price column → far less I/O</text>`;
    out += `</svg>`;
    return out;
  },

  /* Figure 1-4 — response-time distribution with percentiles */
  percentiles() {
    // deterministic pseudo-random bars so the figure is stable
    const bars = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 60; i++) {
      let h = 12 + rnd() * 34;
      if (i === 41) h = 150;         // the p99 outlier spike
      else if (rnd() > 0.9) h += 45; // occasional tall bars
      bars.push(h);
    }
    const base = 250;
    const rects = bars
      .map((h, i) => `<rect x="${40 + i * 8.6}" y="${base - h}" width="6" height="${h}" fill="var(--muted)"/>`)
      .join("");
    const line = (y, label, cls) =>
      `<line x1="36" y1="${y}" x2="576" y2="${y}" stroke="var(--sig)" stroke-width="1" stroke-dasharray="${cls}"/>
       <text x="580" y="${y + 4}" class="d-lbl" fill="var(--sig)">${label}</text>`;
    return `
<svg viewBox="0 0 640 280" role="img" aria-label="Response time distribution showing median, p95 and p99 percentile lines" class="fig-svg">
  ${rects}
  <line x1="36" y1="${base}" x2="576" y2="${base}" stroke="var(--ink)" stroke-width="1.4"/>
  ${line(base - 30, "p50 (median)", "0")}
  ${line(base - 70, "p95", "5 3")}
  ${line(base - 120, "p99", "2 3")}
  <text x="300" y="272" text-anchor="middle" class="d-lbl">100 requests, sorted arrival — the tail is what users feel</text>
</svg>`;
  },
};
