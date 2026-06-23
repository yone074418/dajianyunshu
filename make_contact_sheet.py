from pathlib import Path

from PIL import Image, ImageDraw

src = Path("word_pdf_pages")
paths = sorted(src.glob("page-*.png"))
thumbs = []
for path in paths:
    im = Image.open(path).convert("RGB")
    im.thumbnail((420, 560))
    canvas = Image.new("RGB", (440, 600), "white")
    x = (440 - im.width) // 2
    canvas.paste(im, (x, 20))
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 575), path.stem, fill=(40, 40, 40))
    thumbs.append(canvas)

cols = 2
rows = (len(thumbs) + cols - 1) // cols
sheet = Image.new("RGB", (cols * 440, rows * 600), (235, 235, 235))
for idx, im in enumerate(thumbs):
    sheet.paste(im, ((idx % cols) * 440, (idx // cols) * 600))
sheet.save("word_layout_contact_sheet.png")
print(Path("word_layout_contact_sheet.png").resolve())
