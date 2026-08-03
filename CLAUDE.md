# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Peng Xu's personal academic homepage, published as a GitHub Pages user site at
`https://xxxupeng.github.io` (remote: `xxxupeng/xxxupeng.github.io`, default branch `main`).

It is a **single hand-written static page**. `index.html` at the repo root is the entire
site: bio, News, Experiences, and Projects are all inline HTML. There is no build step,
no templating, no content directory, and no tests.

## Commands

There is nothing to build, lint, or test. To preview locally, serve the directory over
HTTP so the relative `./assets/...` paths resolve:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

`.vscode/settings.json` sets `livePreview.defaultPreviewPath` to `/index.html`, so the
VS Code Live Preview extension also works out of the box.

Deployment is `git push` to `main` — GitHub Pages serves the committed files directly.

## Important: this is NOT a Jekyll site anymore

`README.md`, `Gemfile`, and the footer credit are leftovers from the
[al-folio](https://github.com/alshedivat/al-folio) Jekyll theme this page started from.
None of the Jekyll machinery survives: there is no `_config.yml`, `_pages/`, `_sass/`,
`_bibliography/`, `_data/`, or `bin/deploy`.

**Ignore the installation, usage, and deploy instructions in `README.md`.** Do not run
`bundle exec jekyll serve`, do not edit `_pages/about.md` or `_sass/variables.scss`, and
do not regenerate CSS from Sass — those paths do not exist. Because `index.html` has no
YAML front matter, GitHub Pages passes it through verbatim even though Jekyll is nominally
enabled.

Edit `index.html` and `assets/css/main.css` directly.

## Layout system

Styling lives in two committed, pre-minified-ish CSS files loaded in this order:

- `assets/css/main.css` — the only file to edit. Compiled al-folio output (Basscss +
  theme rules) that has since been maintained by hand. The accent color `#00369f` is
  hard-coded throughout rather than living in a variable.
- `assets/css/style.css` — normalize.css + vendor bulk. **Not linked by `index.html`**;
  effectively dead weight. Don't edit it and don't assume its rules apply.

The grid is a 3-column fractional system: `.img_row` is a flex row, and children take
`.one` (33%), `.two` (66%), or `.three` (100%). The profile photo uses `.profile_img`
(20%). Page width is capped by `.wrapper` at 900px content + 50px gutters. The header is
`position: fixed`, and the nav collapses into a hamburger (the `#nav-trigger` checkbox
hack) below 600px.

jQuery, KaTeX, Font Awesome, and Academicons are loaded at the bottom of `index.html`;
jQuery and KaTeX come from CDNs, the icon fonts are vendored under `assets/webfonts/`
(Font Awesome) and `assets/fonts/` (Academicons). `assets/js/common.js` only wires up
abstract/BibTeX toggles that the current page never renders — the page needs no JS.

## Editing content

Each section is a repeated HTML block; copy the nearest existing entry and edit it rather
than inventing new markup.

- **News** — a `<tr>` in the `.news` table with `<td class="date">` and
  `<td class="announcement">`. Newest first.
- **Experiences** — same date/announcement `<tr>` shape, split across three tables
  (Education, Internship, Review). Note the `<h4>` headings sit *inside* `<table>` where
  HTML doesn't allow them; browsers hoist them out and it renders as intended. Harmless,
  but don't treat it as a pattern to copy into new sections.
- **Projects** — an `.img_row` holding a thumbnail (`.col.one.left`) and a text column
  (`.col.two.left`) with title, author list, venue, and `[Paper]`/`[Code]`/`[Poster]`/
  `[Slide]`/`[Demo]` links. Blocks are ordered newest first and separated by
  `<div style="line-height:80%;"><br /></div>`. Peng Xu's own name is wrapped in `<b>`,
  the corresponding author is marked with a trailing envelope icon `<i>`, and repos with
  public code carry a shields.io GitHub-stars badge.

Per-paper assets (thumbnails, posters, slides, demo videos) live in `projects/<venue>/`,
e.g. `projects/iccv2025/`. Add a directory per paper and reference the files with relative
`./projects/...` paths.

## Known rough edges

Not urgent, but don't be surprised by them:

- `index.html:12` links `./assets/img/favicon.ico`, which does not exist — a guaranteed 404.
- The `<meta name="description">` still describes the al-folio theme, not Peng Xu.
- The contact email is inconsistent: the header and commented-out social block use
  `xxupeng@zju.edu.cn` (two x's) while the body text uses `xxxupeng@zju.edu.cn` (three).
- Google Analytics is initialized with the placeholder ID `UA-XXXXXXXXX`, so it collects
  nothing.
