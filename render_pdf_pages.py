from pathlib import Path

import fitz

pdf = Path("3.4.2_仿真功能实现整理.pdf")
out = Path("word_pdf_pages")
out.mkdir(exist_ok=True)

doc = fitz.open(pdf)
for i, page in enumerate(doc, start=1):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    pix.save(out / f"page-{i:02d}.png")
print(doc.page_count)
