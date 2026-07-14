/*
 * build_db.mjs — generate data/course.db (SQLite) from js/content.js.
 *
 * js/content.js is the human-editable source of truth. The runtime app loads
 * the generated SQLite database (via sql.js) instead of the raw JS, so course
 * content lives in a real database file.
 *
 * Node has no bundled SQLite here, so we emit SQL and pipe it through the
 * `sqlite3` CLI. Run:  npm run build:db   (see package.json)  — or:
 *   node tools/build_db.mjs | sqlite3 data/course.db
 *
 * This script prints SQL to stdout; the npm script handles the rest
 * (removing any old db first so the build is reproducible).
 */
import { readFileSync } from "node:fs";

// Load content.js by evaluating it with a minimal window shim.
globalThis.window = globalThis;
const src = readFileSync(new URL("../js/content.js", import.meta.url), "utf8");
// eslint-disable-next-line no-eval
(0, eval)(src);
const C = globalThis.DDIA_CONTENT;
if (!C) {
  console.error("Could not load DDIA_CONTENT from js/content.js");
  process.exit(1);
}

const q = (v) => (v == null ? "NULL" : "'" + String(v).replace(/'/g, "''") + "'");
const lines = [];
const emit = (s) => lines.push(s);

emit("PRAGMA foreign_keys = ON;");
emit("BEGIN TRANSACTION;");

emit(`
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE parts (id TEXT PRIMARY KEY, ord INTEGER, label TEXT, title TEXT, blurb TEXT);
CREATE TABLE chapters (
  id TEXT PRIMARY KEY, part_id TEXT, ord INTEGER, number INTEGER,
  title TEXT, summary TEXT, est_minutes INTEGER, status TEXT,
  epigraph_quote TEXT, epigraph_source TEXT
);
CREATE TABLE sections (
  id TEXT, chapter_id TEXT, ord INTEGER, title TEXT, icon TEXT, est_minutes INTEGER,
  PRIMARY KEY (chapter_id, id)
);
CREATE TABLE blocks (
  chapter_id TEXT, section_id TEXT, ord INTEGER, payload TEXT
);
CREATE TABLE eval_meta (chapter_id TEXT PRIMARY KEY, title TEXT, pass_pct INTEGER, intro TEXT);
CREATE TABLE eval_questions (chapter_id TEXT, ord INTEGER, payload TEXT);
`);

// book meta
emit(`INSERT INTO meta (key, value) VALUES ${["title", "author", "subtitle"]
  .map((k) => `(${q(k)}, ${q(C.book[k])})`)
  .join(", ")};`);

C.parts.forEach((part, pi) => {
  emit(
    `INSERT INTO parts VALUES (${q(part.id)}, ${pi}, ${q(part.label)}, ${q(part.title)}, ${q(part.blurb)});`
  );
  part.chapters.forEach((ch, ci) => {
    const status = ch.status || "ready";
    emit(
      `INSERT INTO chapters VALUES (${q(ch.id)}, ${q(part.id)}, ${ci}, ${ch.number}, ${q(
        ch.title
      )}, ${q(ch.summary)}, ${ch.estMinutes || "NULL"}, ${q(status)}, ${q(
        ch.epigraph && ch.epigraph.quote
      )}, ${q(ch.epigraph && ch.epigraph.source)});`
    );
    (ch.sections || []).forEach((sec, si) => {
      emit(
        `INSERT INTO sections VALUES (${q(sec.id)}, ${q(ch.id)}, ${si}, ${q(sec.title)}, ${q(
          sec.icon
        )}, ${sec.estMinutes || "NULL"});`
      );
      (sec.blocks || []).forEach((b, bi) => {
        emit(
          `INSERT INTO blocks VALUES (${q(ch.id)}, ${q(sec.id)}, ${bi}, ${q(JSON.stringify(b))});`
        );
      });
    });
    if (ch.evaluation) {
      const e = ch.evaluation;
      emit(
        `INSERT INTO eval_meta VALUES (${q(ch.id)}, ${q(e.title)}, ${e.passPct}, ${q(e.intro)});`
      );
      e.questions.forEach((qq, qi) => {
        emit(`INSERT INTO eval_questions VALUES (${q(ch.id)}, ${qi}, ${q(JSON.stringify(qq))});`);
      });
    }
  });
});

emit("COMMIT;");
process.stdout.write(lines.join("\n") + "\n");
