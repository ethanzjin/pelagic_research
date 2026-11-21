"""Tear-sheet checks, run by tools/check-site.mjs (prints OK / WARN / FAIL lines).

For every report in tools/tearsheets.json:
  * every sentence and figure must appear in that report's PDF, word for word
    (line-break hyphens and [n] citation markers are ignored);
  * reports/<id>-tearsheet.pdf must exist, be exactly one page, and contain the current intro text.

Needs pypdf (pip install pypdf).
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def norm(text: str) -> str:
    text = re.sub(r"\[[0-9, ]+\]", "", text)                 # citation markers like [1, 6]
    text = re.sub(r"(\w)-\s+(\w)", r"\1-\2", text)            # words split across lines: "12- month"
    text = re.sub(r"\s+", " ", text).replace(" - ", "-").replace(" – ", "–")
    return text.strip().lower()


def sentences(text: str) -> list[str]:
    return [s for s in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text) if s.strip()]


def pdf_text(path: Path, PdfReader) -> tuple[str, int]:
    reader = PdfReader(str(path))
    return " ".join(page.extract_text() or "" for page in reader.pages), len(reader.pages)


def main() -> int:
    try:
        from pypdf import PdfReader
    except ImportError:
        print("WARN pypdf isn't installed (pip install pypdf), so tear-sheet text wasn't checked against the reports")
        return 0

    sheets = json.loads((ROOT / "tools" / "tearsheets.json").read_text(encoding="utf8"))
    failures = 0
    for rid, sheet in sheets.items():
        if rid.startswith("_"):
            continue
        report_pdf = ROOT / "reports" / f"{rid}.pdf"
        if not report_pdf.exists():
            print(f"FAIL tear sheet {rid}: the report PDF reports/{rid}.pdf is missing, so its text can't be checked")
            failures += 1
            continue
        full, _ = pdf_text(report_pdf, PdfReader)
        source = norm(full)
        tight = source.replace(" ", "")

        texts = [sheet["intro"], sheet.get("lens", "")]
        texts += [p[k] for p in sheet["summary"] for k in ("lead", "body")]
        texts += [p[k] for p in sheet["risks"] for k in ("title", "body")]
        missing = [s for t in texts for s in sentences(t)
                   if norm(s) not in source and norm(s).replace(" ", "") not in tight]
        values = [v for _, v in sheet["keyData"]] + [c for row in sheet["scenarios"]["rows"] for c in row[1:]]
        missing += [f"figure {v}" for v in values if norm(v).replace(" ", "") not in tight]
        for m in missing:
            print(f"FAIL tear sheet {rid}: not found word for word in the report PDF: \"{m[:90]}\"")
        failures += len(missing)

        sheet_pdf = ROOT / "reports" / f"{rid}-tearsheet.pdf"
        if sheet_pdf.exists():
            text, pages = pdf_text(sheet_pdf, PdfReader)
            if pages != 1:
                print(f"FAIL tear sheet {rid}: the PDF has {pages} pages; it must fit on one")
                failures += 1
            if norm(sheet["intro"])[:50].replace(" ", "") not in norm(text).replace(" ", ""):
                print(f"FAIL tear sheet {rid}: the PDF doesn't match tools/tearsheets.json; run node tools/build-pages.mjs")
                failures += 1
        if not missing:
            print(f"OK Tear sheet {rid}: every sentence and figure matches the report PDF")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
