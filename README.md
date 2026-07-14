# DDIA Interactive — a practical, question-driven field manual

An interactive study companion for **_Designing Data-Intensive Applications_** by
Martin Kleppmann. Learn by doing: read a focused section, answer knowledge checks
as you go, then clear an end-of-chapter evaluation — all paced by a built-in
**Pomodoro** timer.

> **Currently covers:** Part I · Chapter 1 — *Reliable, Scalable & Maintainable
> Applications*. More chapters drop into the same content model over time.

## Features

- **Question-based learning** — inline knowledge checks inside every section, each
  with an explanation of the correct answer.
- **Evaluation gate** — a 12-question chapter assessment; score 70%+ to mark the
  chapter complete.
- **Pomodoro built in** — 25/5 focus cycles (long break every 4th), persistent
  across reloads, with a completion chime.
- **Progress tracking** — sections read, checks answered, and best evaluation
  score are saved in your browser (`localStorage`).
- **Hand-drawn SVG figures** — the data-system, Twitter fan-out, and response-time
  percentile diagrams from the chapter, redrawn in the app's style.
- **Zero build step** — plain HTML/CSS/JS, so GitHub Pages serves it as-is.

## Run locally

It's a static site — just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly over `file://` also works, since there are no ES
module imports.)

## Adding a chapter

All course material lives in [`js/content.js`](js/content.js) as data. To add a
chapter, append a chapter object (sections → content blocks + `check` questions,
plus an `evaluation`) to the relevant part. New figures go in
[`js/diagrams.js`](js/diagrams.js). No engine changes required.

## Project structure

```
index.html          # shell + font loading
styles.css          # the "engineering field manual" theme
js/content.js       # all course content (data-driven)
js/diagrams.js      # hand-built SVG figures
js/pomodoro.js      # the focus timer widget
js/app.js           # router, rendering, progress, quiz engine
```

## A note on the book

This app contains original explanatory summaries and questions written to help you
learn. The book itself is © Martin Kleppmann / O'Reilly Media and is **not**
included in this repository — please [buy the book](https://dataintensive.net/) to
support the author.

## License

App code: MIT. Book content and concepts belong to their author.
