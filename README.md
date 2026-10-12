# Pelagic Research

Website for **Pelagic Research**, an independent equity research publication covering marine, energy and sustainability stocks. One report per month.

Plain HTML/CSS/JS: no build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Publishing a monthly report

1. Put the PDF in `reports/`, e.g. `reports/2026-11-xyz.pdf`.
2. Open `assets/js/reports.js` and add an entry to the **top** of the list (a template and a field guide are in the comment at the top of that file).
3. Commit and push.

The homepage "Latest report" card, the recent-research grid, the 12-month publication log, the research archive (with sector filters and search) and the report page (`report.html?id=<your-id>`) all update from that single file.

Once your first real report is live, delete the entry marked `sample: true`.

## Settings

At the top of `assets/js/site.js`:

- `contactEmail`: the address used by every "Contact" link.
- `subscribeAction` / `subscribeField`: paste a newsletter form endpoint (Buttondown, Formspree, Substack, etc.). If you leave it empty, the subscribe form opens a pre-filled email to `contactEmail`.

## Structure

```
index.html        Home: hero, latest report, coverage, publication log, recent research, subscribe
research.html     Full archive with sector filter and search
report.html       Report detail page (summary, thesis, risks, embedded PDF)
about.html        Mission, methodology, rating definitions, disclaimer
assets/css/       Styles (brand blue #4248ED is sampled from the logo)
assets/js/        reports.js (your data) and site.js (rendering)
assets/img/       Logo variants, favicon, social share image
reports/          Report PDFs
```

## Hosting on GitHub Pages

Go to Settings → Pages, choose "Deploy from a branch", then pick the branch and the `/ (root)` folder. The `.nojekyll` file is already in place.
