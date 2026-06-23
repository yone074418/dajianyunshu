import json
from pathlib import Path

import fitz

doc = fitz.open("article.pdf")
for page_no in range(55, 62):
    page = doc[page_no - 1]
    data = page.get_text("dict")
    print(f"PAGE {page_no}")
    for block in data["blocks"]:
        bbox = [round(v, 1) for v in block["bbox"]]
        if block["type"] == 0:
            text = " ".join(
                span["text"]
                for line in block.get("lines", [])
                for span in line.get("spans", [])
            ).strip()
            if text:
                print(json.dumps({"type": "text", "bbox": bbox, "text": text[:160]}, ensure_ascii=False))
        elif block["type"] == 1:
            print(json.dumps({"type": "image", "bbox": bbox, "width": block.get("width"), "height": block.get("height")}, ensure_ascii=False))
