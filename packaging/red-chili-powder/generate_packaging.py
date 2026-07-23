#!/usr/bin/env python3
"""Generate editable SVG artwork and matching print PDFs for ZestFresh chili powder."""

from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image
from reportlab.graphics import renderPDF, renderSVG
from reportlab.graphics.barcode.eanbc import Ean13BarcodeWidget
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import PCMYKColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
PDF_DIR = ROOT.parents[1] / "output" / "pdf"
TMP_DIR = ROOT.parents[1] / "tmp" / "pdfs"

PAGE_W_MM = 136
PAGE_H_MM = 206
TRIM_X_MM = 3
TRIM_Y_MM = 3
TRIM_W_MM = 130
TRIM_H_MM = 200

MM = 72 / 25.4

BLACK = PCMYKColor(75, 68, 67, 90)
CRIMSON = PCMYKColor(15, 100, 80, 25)
DARK_RED = PCMYKColor(25, 100, 90, 55)
GOLD = PCMYKColor(20, 35, 85, 15)
LIGHT_GOLD = PCMYKColor(5, 18, 55, 3)
WHITE = PCMYKColor(0, 0, 0, 0)
MUTED = PCMYKColor(3, 3, 5, 18)
GREEN = PCMYKColor(80, 15, 100, 5)

pdfmetrics.registerFont(TTFont("ZFSans", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("ZFSansBold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
pdfmetrics.registerFont(TTFont("ZFSerif", "/System/Library/Fonts/Supplemental/Georgia.ttf"))
pdfmetrics.registerFont(TTFont("ZFSerifBold", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"))
pdfmetrics.registerFont(TTFont("ZFSerifItalic", "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"))


def mm(value):
    return value * MM


def top_y(y_mm, height_mm=0):
    return mm(PAGE_H_MM - y_mm - height_mm)


def write_text(c, x, y, text, font="ZFSans", size=8, color=WHITE, align="left"):
    c.setFillColor(color)
    c.setFont(font, size)
    px = mm(x)
    py = top_y(y)
    if align == "center":
        c.drawCentredString(px, py, text)
    elif align == "right":
        c.drawRightString(px, py, text)
    else:
        c.drawString(px, py, text)


def wrap_lines(text, max_chars):
    words = text.split()
    lines, line = [], []
    for word in words:
        if len(" ".join(line + [word])) > max_chars and line:
            lines.append(" ".join(line))
            line = [word]
        else:
            line.append(word)
    if line:
        lines.append(" ".join(line))
    return lines


def paragraph(c, x, y, text, width_chars=56, size=6.4, leading=3.0, color=MUTED):
    for i, line in enumerate(wrap_lines(text, width_chars)):
        write_text(c, x, y + i * leading, line, size=size, color=color)


def rounded_panel(c, x, y, w, h, radius=3, fill=BLACK, stroke=GOLD, stroke_width=0.35):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(mm(stroke_width))
    c.roundRect(mm(x), top_y(y, h), mm(w), mm(h), mm(radius), fill=1, stroke=1)


def page_background(c):
    c.setFillColor(BLACK)
    c.rect(0, 0, mm(PAGE_W_MM), mm(PAGE_H_MM), fill=1, stroke=0)
    c.setFillColor(DARK_RED)
    c.rect(0, 0, mm(PAGE_W_MM), mm(74), fill=1, stroke=0)
    c.setStrokeColor(CRIMSON)
    c.setLineWidth(mm(0.18))
    for x in range(-50, 190, 12):
        c.line(mm(x), 0, mm(x + 80), mm(PAGE_H_MM))
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(0.55))
    c.roundRect(mm(5.5), mm(5.5), mm(125), mm(195), mm(4), fill=0, stroke=1)
    c.setLineWidth(mm(0.18))
    c.roundRect(mm(7.2), mm(7.2), mm(121.6), mm(191.6), mm(3.4), fill=0, stroke=1)


def logo_pdf(c, y=20, compact=False):
    cx = 68
    radius = 8 if not compact else 5.5
    c.setFillColor(CRIMSON)
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(0.5))
    c.circle(mm(cx), top_y(y + radius), mm(radius), fill=1, stroke=1)
    c.setStrokeColor(WHITE)
    c.setLineWidth(mm(1.1 if not compact else 0.8))
    c.line(mm(cx - radius * .45), top_y(y + radius * .72), mm(cx), top_y(y + radius * 1.25))
    c.line(mm(cx), top_y(y + radius * 1.25), mm(cx + radius * .5), top_y(y + radius * .65))
    write_text(c, cx, y + (19 if not compact else 13.7), "ZestFresh", font="ZFSerifBold", size=21 if not compact else 14, align="center")
    write_text(c, cx, y + (24 if not compact else 17.3), "PURE SPICES  |  HONEST FLAVOR", size=5.2 if not compact else 4.2, color=GOLD, align="center")


def badge_pdf(c, x, y, w, label):
    c.setFillColor(BLACK)
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(0.3))
    c.roundRect(mm(x), top_y(y, 10), mm(w), mm(10), mm(5), fill=1, stroke=1)
    c.setFillColor(GOLD)
    c.circle(mm(x + 5), top_y(y + 5), mm(2.2), fill=1, stroke=0)
    c.setStrokeColor(BLACK)
    c.setLineWidth(mm(0.65))
    c.line(mm(x + 3.8), top_y(y + 5), mm(x + 4.7), top_y(y + 6))
    c.line(mm(x + 4.7), top_y(y + 6), mm(x + 6.4), top_y(y + 4))
    write_text(c, x + 9, y + 6.2, label, font="ZFSansBold", size=5.4, color=WHITE)


def draw_photo(c):
    x, y, w, h = 12, 83, 112, 72
    c.saveState()
    path = c.beginPath()
    path.roundRect(mm(x), top_y(y, h), mm(w), mm(h), mm(9))
    c.clipPath(path, stroke=0, fill=0)
    photo = Image.open(ASSETS / "chili-bowl-cmyk.jpg")
    iw, ih = photo.size
    target_ratio = w / h
    source_ratio = iw / ih
    if source_ratio > target_ratio:
        dh = h
        dw = h * source_ratio
    else:
        dw = w
        dh = w / source_ratio
    dx = x + (w - dw) / 2
    dy = y + (h - dh) / 2
    c.drawImage(ImageReader(photo), mm(dx), top_y(dy, dh), mm(dw), mm(dh), preserveAspectRatio=True, mask=None)
    c.restoreState()
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(0.7))
    c.roundRect(mm(x), top_y(y, h), mm(w), mm(h), mm(9), fill=0, stroke=1)


def draw_front_pdf(path):
    c = canvas.Canvas(str(path), pagesize=(mm(PAGE_W_MM), mm(PAGE_H_MM)), pageCompression=1)
    c.setTitle("ZestFresh Premium Red Chili Powder - Front")
    c.setAuthor("ZestFresh")
    page_background(c)
    logo_pdf(c, 15)
    write_text(c, 68, 54, "PREMIUM", font="ZFSansBold", size=9, color=GOLD, align="center")
    write_text(c, 68, 67, "RED CHILI", font="ZFSansBold", size=28, align="center")
    write_text(c, 68, 77, "POWDER", font="ZFSerifBold", size=17, color=GOLD, align="center")
    c.setFillColor(GOLD)
    for x in (60, 76):
        c.circle(mm(x), top_y(80.6), mm(0.8), fill=1, stroke=0)
    write_text(c, 68, 82, "Pure       Natural       Rich in Flavor", size=6.2, align="center")
    draw_photo(c)
    c.setFillColor(CRIMSON)
    c.roundRect(mm(18), top_y(148, 14), mm(100), mm(14), mm(7), fill=1, stroke=0)
    write_text(c, 68, 157, "Bold color. Authentic aroma. Full-bodied heat.", font="ZFSerifItalic", size=7.2, align="center")
    badge_pdf(c, 13, 166, 52, "100% PURE")
    badge_pdf(c, 71, 166, 52, "NO ARTIFICIAL COLORS")
    badge_pdf(c, 13, 179, 52, "HYGIENICALLY PACKED")
    badge_pdf(c, 71, 179, 52, "PREMIUM QUALITY")
    write_text(c, 15, 194, "NET WEIGHT", font="ZFSansBold", size=5.5, color=GOLD)
    write_text(c, 121, 194, "100 g", font="ZFSansBold", size=14, align="right")
    c.showPage()
    c.save()


def section_header(c, x, y, text, w):
    c.setFillColor(CRIMSON)
    c.roundRect(mm(x), top_y(y, 6), mm(w), mm(6), mm(2.4), fill=1, stroke=0)
    write_text(c, x + 3, y + 4.6, text.upper(), font="ZFSansBold", size=5.6, color=WHITE)


def vector_code(c, widget, x, y, w, h):
    bx0, by0, bx1, by1 = widget.getBounds()
    bw, bh = bx1 - bx0, by1 - by0
    drawing = Drawing(mm(w), mm(h), transform=[mm(w) / bw, 0, 0, mm(h) / bh, -bx0 * mm(w) / bw, -by0 * mm(h) / bh])
    drawing.add(widget)
    renderPDF.draw(drawing, c, mm(x), top_y(y, h))


def draw_back_pdf(path):
    c = canvas.Canvas(str(path), pagesize=(mm(PAGE_W_MM), mm(PAGE_H_MM)), pageCompression=1)
    c.setTitle("ZestFresh Premium Red Chili Powder - Back")
    c.setAuthor("ZestFresh")
    page_background(c)
    logo_pdf(c, 11, compact=True)
    write_text(c, 68, 34, "PREMIUM RED CHILI POWDER", font="ZFSansBold", size=10, color=GOLD, align="center")

    section_header(c, 11, 40, "Product Story", 54)
    paragraph(c, 12, 50, "ZestFresh Premium Red Chili Powder is carefully selected and finely ground for vivid color, authentic aroma and balanced heat in everyday cooking.", width_chars=47)
    section_header(c, 70, 40, "Ingredients", 55)
    paragraph(c, 71, 50, "100% dried red chilies. Contains no added color, preservative or filler.", width_chars=40)

    section_header(c, 11, 67, "Usage Suggestions", 54)
    paragraph(c, 12, 77, "Ideal for curries, marinades, dals, chutneys, snacks and spice blends. Add gradually to taste.", width_chars=46)
    section_header(c, 70, 67, "Storage", 55)
    paragraph(c, 71, 77, "Store in a cool, dry place away from sunlight. Reseal after use. Use a clean, dry spoon.", width_chars=40)

    section_header(c, 11, 94, "Nutritional Information", 114)
    write_text(c, 12, 104, "Approximate values per 100 g - SAMPLE ONLY; VERIFY BY NABL LAB", font="ZFSansBold", size=5.2, color=LIGHT_GOLD)
    rows = [
        ("Energy", "398 kcal", "Protein", "12.0 g"),
        ("Carbohydrate", "49.0 g", "Total Sugars", "7.2 g"),
        ("Total Fat", "17.0 g", "Saturated Fat", "3.3 g"),
        ("Sodium", "30 mg", "Dietary Fibre", "27.0 g"),
    ]
    x0, y0, row_h = 11, 108, 7
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(0.25))
    for i, row in enumerate(rows):
        yy = y0 + i * row_h
        c.setFillColor(BLACK if i % 2 == 0 else DARK_RED)
        c.rect(mm(x0), top_y(yy, row_h), mm(114), mm(row_h), fill=1, stroke=1)
        write_text(c, 13, yy + 4.9, row[0], size=5.4)
        write_text(c, 64, yy + 4.9, row[1], font="ZFSansBold", size=5.4, align="right")
        write_text(c, 69, yy + 4.9, row[2], size=5.4)
        write_text(c, 122, yy + 4.9, row[3], font="ZFSansBold", size=5.4, align="right")

    section_header(c, 11, 139, "Pack & Price Details", 55)
    rounded_panel(c, 11, 147, 55, 24, radius=2.5, fill=BLACK)
    details = [("BATCH NO.", "[BATCH]"), ("MRP (INCL. TAXES)", "Rs [MRP]"), ("PACKED DATE", "[MM/YYYY]"), ("BEST BEFORE", "[MM/YYYY]")]
    for i, (label, value) in enumerate(details):
        yy = 152 + i * 5.1
        write_text(c, 13, yy, label, font="ZFSansBold", size=4.7, color=GOLD)
        write_text(c, 64, yy, value, font="ZFSansBold", size=5.2, align="right")

    section_header(c, 70, 139, "Manufacturing Details", 55)
    rounded_panel(c, 70, 147, 55, 24, radius=2.5, fill=BLACK)
    write_text(c, 72, 152, "Manufactured & Packed by:", font="ZFSansBold", size=5.0, color=GOLD)
    write_text(c, 72, 157, "[LEGAL ENTITY NAME]", font="ZFSansBold", size=5.3)
    write_text(c, 72, 162, "[FULL POSTAL ADDRESS, INDIA]", size=4.8)
    write_text(c, 72, 167, "FSSAI Lic. No.: [14-DIGIT LICENSE]", font="ZFSansBold", size=4.9)
    write_text(c, 72, 170, "Country of Origin: India", size=4.8)

    write_text(c, 68, 175, "Customer Care: [PHONE]  |  [EMAIL]  |  www.zestfresh.in", font="ZFSansBold", size=4.7, color=WHITE, align="center")

    qr = QrCodeWidget("https://zestfresh.in")
    vector_code(c, qr, 11, 178, 15, 15)
    write_text(c, 18.5, 195, "SCAN TO VISIT", font="ZFSansBold", size=3.8, color=GOLD, align="center")

    barcode = Ean13BarcodeWidget("890123456789")
    vector_code(c, barcode, 31, 179, 42, 13)
    write_text(c, 52, 195, "PLACEHOLDER GTIN - REPLACE", font="ZFSansBold", size=3.8, color=GOLD, align="center")

    c.setFillColor(WHITE)
    c.setStrokeColor(GREEN)
    c.setLineWidth(mm(0.55))
    c.rect(mm(79), top_y(179, 11), mm(11), mm(11), fill=1, stroke=1)
    c.setFillColor(GREEN)
    c.circle(mm(84.5), top_y(184.5), mm(3.1), fill=1, stroke=0)
    write_text(c, 84.5, 195, "VEG", font="ZFSansBold", size=4.0, color=WHITE, align="center")

    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(0.8))
    c.circle(mm(99), top_y(184.5), mm(5.2), fill=0, stroke=1)
    recycle = c.beginPath()
    recycle.moveTo(mm(99), top_y(180.9))
    recycle.lineTo(mm(102.2), top_y(186.3))
    recycle.lineTo(mm(95.8), top_y(186.3))
    recycle.close()
    c.drawPath(recycle, fill=0, stroke=1)
    write_text(c, 99, 195, "RECYCLE", font="ZFSansBold", size=4.0, color=WHITE, align="center")

    write_text(c, 117, 182, "MADE", font="ZFSansBold", size=5.0, color=GOLD, align="center")
    write_text(c, 117, 188, "IN INDIA", font="ZFSansBold", size=6.4, align="center")
    write_text(c, 117, 193, "with care", font="ZFSerifItalic", size=4.5, color=GOLD, align="center")
    c.showPage()
    c.save()


def code_svg(widget, filename, width, height):
    bx0, by0, bx1, by1 = widget.getBounds()
    bw, bh = bx1 - bx0, by1 - by0
    drawing = Drawing(width, height, transform=[width / bw, 0, 0, height / bh, -bx0 * width / bw, -by0 * height / bh])
    drawing.add(widget)
    renderSVG.drawToFile(drawing, str(ASSETS / filename))


def common_svg_defs():
    return """
  <defs>
    <linearGradient id="crimsonGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#33070d"/>
      <stop offset="0.58" stop-color="#0d0c0e"/>
      <stop offset="1" stop-color="#720c18"/>
    </linearGradient>
    <pattern id="geometry" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
      <path d="M0 0V12" stroke="#8d1521" stroke-width="0.22" opacity="0.32"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.4" flood-color="#000" flood-opacity="0.7"/>
    </filter>
    <clipPath id="heroClip"><rect x="12" y="83" width="112" height="72" rx="9"/></clipPath>
    <style>
      .sans{font-family:Montserrat,Arial,sans-serif}.serif{font-family:Georgia,'Times New Roman',serif}
      .white{fill:#fff}.gold{fill:#d8b35b}.muted{fill:#d7d0c9}.caps{letter-spacing:1.1px}
      .tiny{font-size:4.6px}.small{font-size:5.5px}.body{font-size:5.2px}
      .guide{display:none;fill:none;stroke:#00a7ff;stroke-width:.2;stroke-dasharray:2 1}
    </style>
  </defs>"""


def logo_svg(y=15, compact=False):
    r = 8 if not compact else 5.5
    word_y = y + (19 if not compact else 13.7)
    sub_y = y + (24 if not compact else 17.3)
    size = 10 if not compact else 7.2
    return f"""
    <g id="zestfresh-logo" aria-label="ZestFresh logo">
      <circle cx="68" cy="{y+r}" r="{r}" fill="#9e1424" stroke="#d8b35b" stroke-width=".55"/>
      <path d="M{68-r*.45:.2f} {y+r*.72:.2f} L68 {y+r*1.25:.2f} L{68+r*.5:.2f} {y+r*.65:.2f}" fill="none" stroke="#fff" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="68" y="{word_y}" text-anchor="middle" class="serif white" font-size="{size}" font-weight="700">ZestFresh</text>
      <text x="68" y="{sub_y}" text-anchor="middle" class="sans gold caps" font-size="2.3">PURE SPICES  |  HONEST FLAVOR</text>
    </g>"""


def svg_shell(content, title):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="136mm" height="206mm" viewBox="0 0 136 206">
  <title>{escape(title)}</title>
  <metadata>Artboard 136 x 206 mm; trim 130 x 200 mm at x=3,y=3; bleed 3 mm; safe area 8 mm inside trim. CMYK targets: crimson C15 M100 Y80 K25; black C75 M68 Y67 K90; gold C20 M35 Y85 K15.</metadata>
{common_svg_defs()}
{content}
  <g id="NON_PRINTING_GUIDES" inkscape:groupmode="layer" class="guide">
    <rect x="3" y="3" width="130" height="200"/>
    <rect x="11" y="11" width="114" height="184"/>
    <path d="M3 21H133M3 185H133"/>
  </g>
</svg>
"""


def front_svg():
    badge = lambda x, y, text: f"""<g><rect x="{x}" y="{y}" width="52" height="10" rx="5" fill="#111" stroke="#d8b35b" stroke-width=".3"/><circle cx="{x+5}" cy="{y+5}" r="2.2" fill="#d8b35b"/><path d="M{x+3.8} {y+5}l.8 1 1.7-2" fill="none" stroke="#111" stroke-width=".7"/><text x="{x+9}" y="{y+6.6}" class="sans white" font-size="2.9" font-weight="700">{text}</text></g>"""
    content = f"""
  <g id="BACKGROUND" inkscape:groupmode="layer">
    <rect width="136" height="206" fill="url(#crimsonGlow)"/>
    <rect width="136" height="206" fill="url(#geometry)"/>
    <path d="M0 139C36 121 85 129 136 107V206H0Z" fill="#6f0b17" opacity=".65"/>
    <rect x="5.5" y="5.5" width="125" height="195" rx="4" fill="none" stroke="#d8b35b" stroke-width=".55"/>
    <rect x="7.2" y="7.2" width="121.6" height="191.6" rx="3.4" fill="none" stroke="#d8b35b" stroke-width=".18"/>
  </g>
  <g id="BRAND" inkscape:groupmode="layer">{logo_svg(15)}</g>
  <g id="PRODUCT_NAME" inkscape:groupmode="layer">
    <text x="68" y="54" text-anchor="middle" class="sans gold caps" font-size="4.2" font-weight="700">PREMIUM</text>
    <text x="68" y="67" text-anchor="middle" class="sans white" font-size="14.2" font-weight="900">RED CHILI</text>
    <text x="68" y="77" text-anchor="middle" class="serif gold caps" font-size="8.2" font-weight="700">POWDER</text>
    <text x="68" y="82" text-anchor="middle" class="sans white" font-size="3.1">Pure <tspan fill="#d8b35b">●</tspan> Natural <tspan fill="#d8b35b">●</tspan> Rich in Flavor</text>
  </g>
  <g id="FOOD_PHOTOGRAPHY" inkscape:groupmode="layer" filter="url(#shadow)">
    <image x="12" y="63" width="112" height="112" preserveAspectRatio="xMidYMid slice" xlink:href="assets/chili-bowl.png" clip-path="url(#heroClip)"/>
    <rect x="12" y="83" width="112" height="72" rx="9" fill="none" stroke="#d8b35b" stroke-width=".75"/>
  </g>
  <g id="CLAIMS" inkscape:groupmode="layer">
    <rect x="18" y="148" width="100" height="14" rx="7" fill="#9e1424"/>
    <text x="68" y="157" text-anchor="middle" class="serif white" font-size="3.6" font-style="italic">Bold color. Authentic aroma. Full-bodied heat.</text>
    {badge(13,166,'100% PURE')}{badge(71,166,'NO ARTIFICIAL COLORS')}
    {badge(13,179,'HYGIENICALLY PACKED')}{badge(71,179,'PREMIUM QUALITY')}
  </g>
  <g id="NET_WEIGHT" inkscape:groupmode="layer">
    <text x="15" y="194" class="sans gold caps" font-size="2.7" font-weight="700">NET WEIGHT</text>
    <text x="121" y="194" text-anchor="end" class="sans white" font-size="7" font-weight="800">100 g</text>
  </g>"""
    return svg_shell(content, "ZestFresh Premium Red Chili Powder - Front Artwork")


def back_svg():
    def header(x, y, w, text):
        return f'<rect x="{x}" y="{y}" width="{w}" height="6" rx="2.4" fill="#9e1424"/><text x="{x+3}" y="{y+4.3}" class="sans white caps" font-size="2.7" font-weight="700">{text}</text>'
    content = f"""
  <g id="BACKGROUND" inkscape:groupmode="layer">
    <rect width="136" height="206" fill="url(#crimsonGlow)"/><rect width="136" height="206" fill="url(#geometry)"/>
    <rect x="5.5" y="5.5" width="125" height="195" rx="4" fill="none" stroke="#d8b35b" stroke-width=".55"/>
    <rect x="7.2" y="7.2" width="121.6" height="191.6" rx="3.4" fill="none" stroke="#d8b35b" stroke-width=".18"/>
  </g>
  <g id="BRAND" inkscape:groupmode="layer">{logo_svg(11, True)}<text x="68" y="34" text-anchor="middle" class="sans gold caps" font-size="4.7" font-weight="800">PREMIUM RED CHILI POWDER</text></g>
  <g id="COPY" inkscape:groupmode="layer">
    {header(11,40,54,'PRODUCT STORY')}{header(70,40,55,'INGREDIENTS')}
    <text x="12" y="50" class="sans muted body"><tspan x="12">ZestFresh Premium Red Chili Powder is carefully</tspan><tspan x="12" dy="3.2">selected and finely ground for vivid color, authentic</tspan><tspan x="12" dy="3.2">aroma and balanced heat in everyday cooking.</tspan></text>
    <text x="71" y="50" class="sans muted body"><tspan x="71">100% dried red chilies.</tspan><tspan x="71" dy="3.2">No added color, preservative or filler.</tspan></text>
    {header(11,67,54,'USAGE SUGGESTIONS')}{header(70,67,55,'STORAGE')}
    <text x="12" y="77" class="sans muted body"><tspan x="12">Ideal for curries, marinades, dals, chutneys, snacks</tspan><tspan x="12" dy="3.2">and spice blends. Add gradually to taste.</tspan></text>
    <text x="71" y="77" class="sans muted body"><tspan x="71">Store in a cool, dry place away from sunlight.</tspan><tspan x="71" dy="3.2">Reseal after use. Use a clean, dry spoon.</tspan></text>
  </g>
  <g id="NUTRITION" inkscape:groupmode="layer">
    {header(11,94,114,'NUTRITIONAL INFORMATION')}
    <text x="12" y="104" class="sans gold" font-size="2.45" font-weight="700">APPROXIMATE VALUES PER 100 g - SAMPLE ONLY; VERIFY BY NABL LAB</text>
    <rect x="11" y="108" width="114" height="28" fill="#100e10" stroke="#d8b35b" stroke-width=".25"/>
    <path d="M11 115H125M11 122H125M11 129H125M67 108V136" stroke="#d8b35b" stroke-width=".18"/>
    <g class="sans white" font-size="2.55">
      <text x="13" y="113">Energy</text><text x="64" y="113" text-anchor="end" font-weight="700">398 kcal</text><text x="69" y="113">Protein</text><text x="122" y="113" text-anchor="end" font-weight="700">12.0 g</text>
      <text x="13" y="120">Carbohydrate</text><text x="64" y="120" text-anchor="end" font-weight="700">49.0 g</text><text x="69" y="120">Total Sugars</text><text x="122" y="120" text-anchor="end" font-weight="700">7.2 g</text>
      <text x="13" y="127">Total Fat</text><text x="64" y="127" text-anchor="end" font-weight="700">17.0 g</text><text x="69" y="127">Saturated Fat</text><text x="122" y="127" text-anchor="end" font-weight="700">3.3 g</text>
      <text x="13" y="134">Sodium</text><text x="64" y="134" text-anchor="end" font-weight="700">30 mg</text><text x="69" y="134">Dietary Fibre</text><text x="122" y="134" text-anchor="end" font-weight="700">27.0 g</text>
    </g>
  </g>
  <g id="VARIABLE_DATA" inkscape:groupmode="layer">
    {header(11,139,55,'PACK &amp; PRICE DETAILS')}{header(70,139,55,'MANUFACTURING DETAILS')}
    <rect x="11" y="147" width="55" height="24" rx="2.5" fill="#100e10" stroke="#d8b35b" stroke-width=".3"/>
    <g class="sans white" font-size="2.4"><text x="13" y="152" class="gold" font-weight="700">BATCH NO.</text><text x="64" y="152" text-anchor="end">[BATCH]</text><text x="13" y="157.1" class="gold" font-weight="700">MRP (INCL. TAXES)</text><text x="64" y="157.1" text-anchor="end">Rs [MRP]</text><text x="13" y="162.2" class="gold" font-weight="700">PACKED DATE</text><text x="64" y="162.2" text-anchor="end">[MM/YYYY]</text><text x="13" y="167.3" class="gold" font-weight="700">BEST BEFORE</text><text x="64" y="167.3" text-anchor="end">[MM/YYYY]</text></g>
    <rect x="70" y="147" width="55" height="24" rx="2.5" fill="#100e10" stroke="#d8b35b" stroke-width=".3"/>
    <g class="sans white" font-size="2.3"><text x="72" y="152" class="gold" font-weight="700">Manufactured &amp; Packed by:</text><text x="72" y="156.5" font-weight="700">[LEGAL ENTITY NAME]</text><text x="72" y="161">[FULL POSTAL ADDRESS, INDIA]</text><text x="72" y="165.5" font-weight="700">FSSAI Lic. No.: [14-DIGIT LICENSE]</text><text x="72" y="169.5">Country of Origin: India</text></g>
    <text x="68" y="175" text-anchor="middle" class="sans white" font-size="2.25" font-weight="700">Customer Care: [PHONE]  |  [EMAIL]  |  www.zestfresh.in</text>
  </g>
  <g id="CODES_AND_MARKS" inkscape:groupmode="layer">
    <rect x="10.5" y="177.5" width="16" height="16" fill="#fff"/><image x="11" y="178" width="15" height="15" xlink:href="assets/qr-zestfresh.svg"/><text x="18.5" y="195" text-anchor="middle" class="sans gold" font-size="1.8" font-weight="700">SCAN TO VISIT</text>
    <rect x="30.5" y="178.5" width="43" height="14" fill="#fff"/><image x="31" y="179" width="42" height="13" xlink:href="assets/barcode-placeholder.svg"/><text x="52" y="195" text-anchor="middle" class="sans gold" font-size="1.8" font-weight="700">PLACEHOLDER GTIN - REPLACE</text>
    <rect x="79" y="179" width="11" height="11" fill="#fff" stroke="#159447" stroke-width=".55"/><circle cx="84.5" cy="184.5" r="3.1" fill="#159447"/><text x="84.5" y="195" text-anchor="middle" class="sans white" font-size="1.9" font-weight="700">VEG</text>
    <circle cx="99" cy="184.5" r="5.2" fill="none" stroke="#d8b35b" stroke-width=".8"/><path d="M96 185l2.2-3.8 2.2 3.8m-4.4 0h4.4l-2.2 3.7z" fill="none" stroke="#d8b35b" stroke-width=".55"/><text x="99" y="195" text-anchor="middle" class="sans white" font-size="1.9" font-weight="700">RECYCLE</text>
    <text x="117" y="182" text-anchor="middle" class="sans gold" font-size="2.4" font-weight="700">MADE</text><text x="117" y="188" text-anchor="middle" class="sans white" font-size="3.2" font-weight="800">IN INDIA</text><text x="117" y="193" text-anchor="middle" class="serif gold" font-size="2.2" font-style="italic">with care</text>
  </g>"""
    return svg_shell(content, "ZestFresh Premium Red Chili Powder - Back Artwork")


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    original = Image.open(ASSETS / "chili-bowl.png").convert("CMYK")
    if min(original.size) < 1500:
        original = original.resize((1500, 1500), Image.Resampling.LANCZOS)
    original.save(ASSETS / "chili-bowl-cmyk.jpg", quality=95, dpi=(300, 300), subsampling=0)

    code_svg(QrCodeWidget("https://zestfresh.in"), "qr-zestfresh.svg", 200, 200)
    code_svg(Ean13BarcodeWidget("890123456789"), "barcode-placeholder.svg", 420, 160)

    (ROOT / "zestfresh-red-chili-front.svg").write_text(front_svg(), encoding="utf-8")
    (ROOT / "zestfresh-red-chili-back.svg").write_text(back_svg(), encoding="utf-8")

    draw_front_pdf(PDF_DIR / "zestfresh-red-chili-front-print.pdf")
    draw_back_pdf(PDF_DIR / "zestfresh-red-chili-back-print.pdf")


if __name__ == "__main__":
    main()
