# Pelagic Research

Website for **Pelagic Research**, an independent equity research publication covering marine, energy and sustainability stocks. One to two reports per month.

Plain HTML/CSS/JS: no build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Publishing a report

1. Put the PDF in `reports/`, e.g. `reports/2026-11-xyz.pdf`.
2. Open `assets/js/reports.js` and add an entry to the **top** of the list (a template and a field guide are in the comment at the top of that file).
3. Commit and push.

Optional `bear` and `bull` prices (with `price` and `target`) draw the scenario range chart on the cards and report page.

The homepage "Latest report" card, the list of earlier reports, the research archive (with sector filters and search) and the report page (`report.html?id=<your-id>`) all update from that single file.

## Releasing style or script changes

The pages load `assets/css/style.css` and the scripts in `assets/js/` with a version
query (`?v=20261021`). After changing any of those files, bump the version in all four
HTML pages (search for `?v=`) so browsers fetch the new files instead of reusing a
cached copy. `reports.js` is covered too, so bump it when you publish a report.

## Settings

At the top of `assets/js/site.js`:

- `contactEmail`: the address used by every "Contact" link.

## Structure

```
index.html        Home: hero, latest report, about me, sectors, earlier reports, process
research.html     Full archive with sector filter and search
report.html       Report detail page (summary, thesis, risks, embedded PDF)
about.html        Mission, methodology, rating definitions, disclaimer
assets/css/       Styles (system type, deep-navy hero and footer; brand blue #4248ED from the logo)
assets/js/        reports.js (your data), site.js (rendering), motion.js (springs and gestures)
assets/vendor/    PDF.js 3.11.174 (Mozilla, Apache-2.0), loaded when a report PDF is opened
assets/img/       Logo variants, favicon, social share image
assets/img/photos Ocean and sector photographs (Unsplash License; credited in the footer)
reports/          Report PDFs
```

## Hosting on GitHub Pages

Go to Settings → Pages, choose "Deploy from a branch", then pick the branch and the `/ (root)` folder. The `.nojekyll` file is already in place.
