/*
 * db.js — load course content from the SQLite database (data/course.db).
 *
 * The database is queried in the browser with sql.js (SQLite compiled to
 * WebAssembly). We reconstruct the same nested object shape the renderer
 * expects and expose it via window.DDIA_loadContent() → Promise<content>.
 *
 * Requires a served origin (http/https) so fetch() can read the .db file —
 * GitHub Pages and any local dev server both work. sql.js is loaded from a CDN.
 */
(function () {
  const SQLJS_VER = "1.10.3";
  const CDN = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VER}/dist/`;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }

  async function loadContent() {
    if (!window.initSqlJs) await loadScript(CDN + "sql-wasm.js");
    const SQL = await window.initSqlJs({ locateFile: (f) => CDN + f });

    const res = await fetch("data/course.db");
    if (!res.ok) throw new Error("Could not fetch data/course.db (" + res.status + ")");
    const db = new SQL.Database(new Uint8Array(await res.arrayBuffer()));

    const rows = (sql) => {
      const r = db.exec(sql);
      if (!r.length) return [];
      const { columns, values } = r[0];
      return values.map((v) => Object.fromEntries(v.map((cell, i) => [columns[i], cell])));
    };

    const meta = {};
    rows("SELECT key, value FROM meta").forEach((m) => (meta[m.key] = m.value));

    const parts = rows("SELECT * FROM parts ORDER BY ord");
    const chapters = rows("SELECT * FROM chapters ORDER BY ord");
    const sections = rows("SELECT * FROM sections");
    const blocks = rows("SELECT * FROM blocks");
    const evalMeta = rows("SELECT * FROM eval_meta");
    const evalQ = rows("SELECT * FROM eval_questions");
    db.close();

    const content = {
      book: { title: meta.title, author: meta.author, subtitle: meta.subtitle },
      parts: parts.map((p) => ({
        id: p.id,
        label: p.label,
        title: p.title,
        blurb: p.blurb,
        chapters: chapters
          .filter((c) => c.part_id === p.id)
          .map((c) => {
            const chap = {
              id: c.id,
              number: c.number,
              title: c.title,
              summary: c.summary,
              estMinutes: c.est_minutes,
              status: c.status || "ready",
              sections: sections
                .filter((s) => s.chapter_id === c.id)
                .sort((a, b) => a.ord - b.ord)
                .map((s) => ({
                  id: s.id,
                  title: s.title,
                  icon: s.icon,
                  estMinutes: s.est_minutes,
                  blocks: blocks
                    .filter((b) => b.chapter_id === c.id && b.section_id === s.id)
                    .sort((a, b) => a.ord - b.ord)
                    .map((b) => JSON.parse(b.payload)),
                })),
            };
            if (c.epigraph_quote) {
              chap.epigraph = { quote: c.epigraph_quote, source: c.epigraph_source };
            }
            const em = evalMeta.find((e) => e.chapter_id === c.id);
            if (em) {
              chap.evaluation = {
                title: em.title,
                passPct: em.pass_pct,
                intro: em.intro,
                questions: evalQ
                  .filter((q) => q.chapter_id === c.id)
                  .sort((a, b) => a.ord - b.ord)
                  .map((q) => JSON.parse(q.payload)),
              };
            }
            return chap;
          }),
      })),
    };

    window.DDIA_CONTENT = content; // also expose for debugging
    return content;
  }

  window.DDIA_loadContent = loadContent;
})();
