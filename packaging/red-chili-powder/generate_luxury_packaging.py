#!/usr/bin/env python3
"""Generate the frameless luxury flexible-pouch redesign for ZestFresh."""

from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.eanbc import Ean13BarcodeWidget
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import PCMYKColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
PDF_DIR = ROOT.parents[1] / "output" / "pdf"
MM = 72 / 25.4
W, H = 136, 206

BLACK = PCMYKColor(75, 68, 67, 90)
BURGUNDY = PCMYKColor(20, 100, 75, 48)
CRIMSON = PCMYKColor(10, 100, 85, 22)
GOLD = PCMYKColor(18, 32, 82, 12)
GOLD_LIGHT = PCMYKColor(8, 18, 54, 4)
IVORY = PCMYKColor(3, 4, 12, 0)
MUTED = PCMYKColor(6, 6, 10, 22)
GREEN = PCMYKColor(80, 12, 100, 4)

pdfmetrics.registerFont(TTFont("LuxSans", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("LuxSansBold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
pdfmetrics.registerFont(TTFont("LuxSerif", "/System/Library/Fonts/Supplemental/Georgia.ttf"))
pdfmetrics.registerFont(TTFont("LuxSerifBold", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"))
pdfmetrics.registerFont(TTFont("LuxSerifItalic", "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"))

STORY = (
    "Our premium red chilli powder is crafted from carefully selected chillies grown in the fertile lands of "
    "Guntur, nourished by the Godavari river basin. This unique region is celebrated worldwide for producing "
    "chillies with exceptional colour, rich aroma and balanced heat. Every batch is carefully sourced, "
    "hygienically processed and packed to preserve its natural freshness, authentic flavour and vibrant red "
    "colour, bringing the true taste of Andhra Pradesh to your kitchen."
)


def mm(v):
    return v * MM


def ty(y, height=0):
    return mm(H - y - height)


def txt(c, x, y, value, font="LuxSans", size=7, color=IVORY, align="left"):
    c.setFillColor(color)
    c.setFont(font, size)
    px, py = mm(x), ty(y)
    if align == "center":
        c.drawCentredString(px, py, value)
    elif align == "right":
        c.drawRightString(px, py, value)
    else:
        c.drawString(px, py, value)


def wrapped(c, x, y, value, width_mm, font="LuxSans", size=5.3, leading_mm=3.25, color=MUTED):
    words = value.split()
    lines, line = [], []
    for word in words:
        candidate = " ".join(line + [word])
        if pdfmetrics.stringWidth(candidate, font, size) > mm(width_mm) and line:
            lines.append(" ".join(line))
            line = [word]
        else:
            line.append(word)
    if line:
        lines.append(" ".join(line))
    for i, line_text in enumerate(lines):
        txt(c, x, y + i * leading_mm, line_text, font=font, size=size, color=color)
    return y + len(lines) * leading_mm


def brand_mark_pdf(c, cx, top, scale=1):
    c.setFillColor(GOLD)
    p = c.beginPath()
    p.moveTo(mm(cx), ty(top + 2 * scale))
    p.curveTo(mm(cx - 7 * scale), ty(top + 4 * scale), mm(cx - 7 * scale), ty(top + 12 * scale), mm(cx), ty(top + 15 * scale))
    p.curveTo(mm(cx + 7 * scale), ty(top + 12 * scale), mm(cx + 7 * scale), ty(top + 4 * scale), mm(cx), ty(top + 2 * scale))
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.setFillColor(BURGUNDY)
    p = c.beginPath()
    p.moveTo(mm(cx - 2.6 * scale), ty(top + 6 * scale))
    p.lineTo(mm(cx + 2.7 * scale), ty(top + 6 * scale))
    p.lineTo(mm(cx - 2.7 * scale), ty(top + 11 * scale))
    p.lineTo(mm(cx + 2.6 * scale), ty(top + 11 * scale))
    c.setLineWidth(mm(.85 * scale))
    c.setStrokeColor(BURGUNDY)
    c.drawPath(p, fill=0, stroke=1)


def brand_pdf(c, cx=68, top=15, compact=False):
    s = .62 if compact else 1
    brand_mark_pdf(c, cx, top, s)
    txt(c, cx, top + (20 if not compact else 14), "ZestFresh", font="LuxSerifBold", size=22 if not compact else 14, align="center")
    txt(c, cx, top + (26 if not compact else 18.3), "PURE SPICES  |  HONEST FLAVOR", font="LuxSansBold", size=5.2 if not compact else 4.1, color=GOLD, align="center")


def draw_front(path):
    c = canvas.Canvas(str(path), pagesize=(mm(W), mm(H)), pageCompression=1)
    c.setTitle("ZestFresh Premium Red Chilli Powder - Luxury Front")
    c.setAuthor("ZestFresh")
    c.setFillColor(BLACK)
    c.rect(0, 0, mm(W), mm(H), fill=1, stroke=0)
    c.drawImage(ImageReader(ASSETS / "chilli-composition-luxury-bright-v2-cmyk.jpg"), 0, 0, mm(W), mm(H), preserveAspectRatio=False, mask=None)
    c.setFillColor(BLACK)
    c.setFillAlpha(.25)
    c.rect(0, 0, mm(W), mm(28), fill=1, stroke=0)
    c.setFillAlpha(1)

    brand_pdf(c, top=12)
    txt(c, 68, 56, "SINGLE ORIGIN  •  GUNTUR", font="LuxSansBold", size=5.4, color=GOLD, align="center")
    txt(c, 68, 74, "RED CHILLI", font="LuxSerifBold", size=32, color=IVORY, align="center")
    txt(c, 68, 86, "P O W D E R", font="LuxSansBold", size=10, color=GOLD_LIGHT, align="center")
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(.38))
    c.line(mm(56), ty(92), mm(80), ty(92))
    txt(c, 68, 98, "ANDHRA PRADESH  •  INDIA", font="LuxSansBold", size=5, color=IVORY, align="center")

    txt(c, 11, 187, "100% PREMIUM GUNTUR RED CHILLIES", font="LuxSansBold", size=5.2, color=GOLD_LIGHT)
    txt(c, 11, 193, "VIVID COLOUR  |  RICH AROMA  |  BALANCED HEAT", font="LuxSans", size=4.4, color=IVORY)
    txt(c, 125, 189, "100 g", font="LuxSerifBold", size=16, color=IVORY, align="right")
    txt(c, 125, 194, "NET WEIGHT", font="LuxSansBold", size=4.2, color=GOLD, align="right")
    c.showPage()
    c.save()


def heading(c, x, y, value, size=7.2):
    txt(c, x, y, value.upper(), font="LuxSansBold", size=size, color=GOLD)


def field_art_pdf(c):
    c.setFillColor(CRIMSON)
    c.circle(mm(105), ty(54), mm(8), fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(.5))
    c.line(mm(85), ty(67), mm(125), ty(67))
    for end_x in (88, 96, 104, 112, 120, 126):
        p = c.beginPath()
        p.moveTo(mm(105), ty(67))
        p.curveTo(mm(105 + (end_x - 105) * .2), ty(77), mm(end_x), ty(88), mm(end_x), ty(99))
        c.drawPath(p, fill=0, stroke=1)
    c.setLineWidth(mm(.28))
    for y in (75, 82, 89, 96):
        c.line(mm(86), ty(y), mm(124), ty(y + 2))
    # Farmers harvesting: restrained silhouettes.
    for x, y, flip in ((99, 75, 1), (114, 78, -1)):
        c.setFillColor(GOLD)
        c.circle(mm(x), ty(y), mm(1.25), fill=1, stroke=0)
        c.setStrokeColor(GOLD)
        c.setLineWidth(mm(.7))
        c.line(mm(x), ty(y + 1.5), mm(x + 1.6 * flip), ty(y + 8))
        c.line(mm(x + .5 * flip), ty(y + 4), mm(x + 4 * flip), ty(y + 6))
        c.line(mm(x + 1.6 * flip), ty(y + 8), mm(x - .4 * flip), ty(y + 13))
        c.line(mm(x + 1.6 * flip), ty(y + 8), mm(x + 4 * flip), ty(y + 13))
    c.setFillColor(CRIMSON)
    for x in range(88, 124, 4):
        c.ellipse(mm(x), ty(95, 1.4), mm(x + 2.8), ty(95), fill=1, stroke=0)
    txt(c, 105, 104, "GUNTUR  •  ANDHRA PRADESH", font="LuxSansBold", size=4.3, color=GOLD, align="center")


def code_widget(c, widget, x, y, w, h):
    x0, y0, x1, y1 = widget.getBounds()
    bw, bh = x1 - x0, y1 - y0
    d = Drawing(mm(w), mm(h), transform=[mm(w) / bw, 0, 0, mm(h) / bh, -x0 * mm(w) / bw, -y0 * mm(h) / bh])
    d.add(widget)
    renderPDF.draw(d, c, mm(x), ty(y, h))


def draw_back(path):
    c = canvas.Canvas(str(path), pagesize=(mm(W), mm(H)), pageCompression=1)
    c.setTitle("ZestFresh Premium Red Chilli Powder - Luxury Back")
    c.setAuthor("ZestFresh")
    c.setFillColor(BLACK)
    c.rect(0, 0, mm(W), mm(H), fill=1, stroke=0)
    c.setFillColor(BURGUNDY)
    c.rect(0, 0, mm(W), mm(78), fill=1, stroke=0)

    brand_pdf(c, top=10, compact=True)
    txt(c, 11, 42, "From the Heart of Guntur", font="LuxSerifBold", size=14, color=IVORY)
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(.45))
    c.line(mm(11), ty(47), mm(36), ty(47))
    wrapped(c, 11, 54, STORY, 67, font="LuxSerif", size=5.15, leading_mm=3.15, color=MUTED)
    field_art_pdf(c)

    heading(c, 11, 110, "Ingredients")
    txt(c, 11, 117, "100% Premium Guntur Red Chillies", font="LuxSerifBold", size=6.2, color=IVORY)
    heading(c, 73, 110, "Storage Instructions")
    txt(c, 73, 117, "Keep in a cool, dry place.", size=5.1, color=MUTED)
    txt(c, 73, 121, "Away from moisture and direct sunlight.", size=5.1, color=MUTED)

    heading(c, 11, 132, "Nutritional Information", size=6.4)
    txt(c, 11, 137, "Approximate values per 100 g - lab verification required", size=4.2, color=GOLD_LIGHT)
    nutrition = [
        ("Energy", "[VALUE] kcal"), ("Protein", "[VALUE] g"),
        ("Carbohydrate", "[VALUE] g"), ("Total Sugars", "[VALUE] g"),
        ("Total Fat", "[VALUE] g"), ("Sodium", "[VALUE] mg"),
    ]
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(.22))
    for i, (label, value) in enumerate(nutrition):
        yy = 142 + i * 4.6
        c.line(mm(11), ty(yy + 1.5), mm(67), ty(yy + 1.5))
        txt(c, 11, yy, label, size=4.8, color=IVORY)
        txt(c, 67, yy, value, font="LuxSansBold", size=4.6, color=IVORY, align="right")

    heading(c, 75, 132, "Pack Information", size=6.4)
    fields = [
        ("BATCH NO.", "[BATCH]"), ("MRP", "Rs [MRP]"), ("PACKED ON", "[MM/YYYY]"),
        ("BEST BEFORE", "[MM/YYYY]"), ("FSSAI NO.", "[14-DIGIT LICENSE]"),
    ]
    for i, (label, value) in enumerate(fields):
        yy = 140 + i * 5.4
        txt(c, 75, yy, label, font="LuxSansBold", size=4.3, color=GOLD_LIGHT)
        txt(c, 125, yy, value, font="LuxSansBold", size=4.5, color=IVORY, align="right")

    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(.35))
    c.line(mm(11), ty(171), mm(125), ty(171))
    heading(c, 11, 178, "Manufactured By", size=5.2)
    txt(c, 11, 184, "[LEGAL ENTITY NAME]", font="LuxSansBold", size=4.8)
    txt(c, 11, 189, "[FULL POSTAL ADDRESS, INDIA]", size=4.5, color=IVORY)
    txt(c, 11, 194, "Customer Care: [PHONE]  |  [EMAIL]  |  zestfresh.in", font="LuxSansBold", size=4.4, color=GOLD_LIGHT)

    barcode = Ean13BarcodeWidget("890123456789")
    code_widget(c, barcode, 73, 175, 31, 13)
    txt(c, 88.5, 191, "PLACEHOLDER GTIN", font="LuxSansBold", size=3.6, color=GOLD_LIGHT, align="center")
    code_widget(c, QrCodeWidget("https://zestfresh.in"), 108, 175, 15, 15)
    txt(c, 115.5, 193, "SCAN", font="LuxSansBold", size=3.6, color=GOLD_LIGHT, align="center")

    c.setFillColor(IVORY)
    c.setStrokeColor(GREEN)
    c.setLineWidth(mm(.45))
    c.rect(mm(73), ty(193, 8), mm(8), mm(8), fill=1, stroke=1)
    c.setFillColor(GREEN)
    c.circle(mm(77), ty(197), mm(2.3), fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(mm(.65))
    c.circle(mm(89), ty(197), mm(3.8), fill=0, stroke=1)
    p = c.beginPath()
    p.moveTo(mm(89), ty(194.4)); p.lineTo(mm(91.5), ty(198.6)); p.lineTo(mm(86.5), ty(198.6)); p.close()
    c.drawPath(p, fill=0, stroke=1)
    txt(c, 101, 199, "MADE IN INDIA", font="LuxSansBold", size=4.2, color=IVORY)
    c.showPage()
    c.save()


def mark_svg(cx=68, top=12, compact=False):
    s = .62 if compact else 1
    return f'<path d="M{cx} {top+2*s} C{cx-7*s} {top+4*s},{cx-7*s} {top+12*s},{cx} {top+15*s} C{cx+7*s} {top+12*s},{cx+7*s} {top+4*s},{cx} {top+2*s}Z" fill="#c7a34d"/><path d="M{cx-2.6*s} {top+6*s}H{cx+2.7*s}L{cx-2.7*s} {top+11*s}H{cx+2.6*s}" fill="none" stroke="#5e0d1c" stroke-width="{.85*s}"/>'


def logo_svg(cx=68, top=12, compact=False):
    word_y = top + (20 if not compact else 14)
    sub_y = top + (26 if not compact else 18.3)
    size = 10.8 if not compact else 7.2
    return f"""
    <g id="ZESTFRESH_LOGO">
      {mark_svg(cx, top, compact)}
      <text x="{cx}" y="{word_y}" text-anchor="middle" class="serif ivory" font-size="{size}" font-weight="700">ZestFresh</text>
      <text x="{cx}" y="{sub_y}" text-anchor="middle" class="sans gold tracked" font-size="2.25">PURE SPICES  |  HONEST FLAVOR</text>
    </g>"""


def shell(body, title):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="136mm" height="206mm" viewBox="0 0 136 206">
  <title>{escape(title)}</title>
  <metadata>Flexible pouch panel. Artboard 136 x 206 mm. Trim 130 x 200 mm at x=3,y=3. Bleed 3 mm. Safe area 8 mm inside trim. Foil elements are isolated in GOLD_FOIL.</metadata>
  <defs><style>.sans{{font-family:Arial,sans-serif}}.serif{{font-family:Georgia,'Times New Roman',serif}}.ivory{{fill:#f3eddf}}.gold{{fill:#c7a34d}}.muted{{fill:#c8c0b5}}.tracked{{letter-spacing:.55px}}.guide{{display:none;fill:none;stroke:#00a7ff;stroke-width:.2;stroke-dasharray:2 1}}</style></defs>
{body}
  <g id="NON_PRINTING_GUIDES" inkscape:groupmode="layer" class="guide"><rect x="3" y="3" width="130" height="200"/><rect x="11" y="11" width="114" height="184"/><path d="M3 20H133M3 186H133"/></g>
</svg>
"""


def front_svg():
    body = f"""
  <g id="BACKGROUND" inkscape:groupmode="layer"><rect width="136" height="206" fill="#0c0b0c"/><image x="0" y="0" width="136" height="206" preserveAspectRatio="none" xlink:href="assets/chilli-composition-luxury-bright-v2.png"/><rect x="0" y="178" width="136" height="28" fill="#0c0b0c" opacity=".25"/></g>
  <g id="BRAND" inkscape:groupmode="layer"><text x="68" y="32" text-anchor="middle" class="serif ivory" font-size="10.8" font-weight="700">ZestFresh</text></g>
  <g id="GOLD_FOIL" inkscape:groupmode="layer">{mark_svg()}<text x="68" y="38" text-anchor="middle" class="sans gold tracked" font-size="2.25">PURE SPICES  |  HONEST FLAVOR</text><text x="68" y="56" text-anchor="middle" class="sans gold tracked" font-size="2.6" font-weight="700">SINGLE ORIGIN  •  GUNTUR</text><text x="68" y="86" text-anchor="middle" class="sans gold tracked" font-size="4.8" font-weight="700">P O W D E R</text><path d="M56 92H80" stroke="#c7a34d" stroke-width=".38"/><text x="11" y="187" class="sans gold" font-size="2.5" font-weight="700">100% PREMIUM GUNTUR RED CHILLIES</text><text x="125" y="194" text-anchor="end" class="sans gold" font-size="2" font-weight="700">NET WEIGHT</text></g>
  <g id="PRIMARY_TYPOGRAPHY" inkscape:groupmode="layer"><text x="68" y="74" text-anchor="middle" class="serif ivory" font-size="15.8" font-weight="700">RED CHILLI</text><text x="68" y="98" text-anchor="middle" class="sans ivory tracked" font-size="2.4" font-weight="700">ANDHRA PRADESH  •  INDIA</text><text x="11" y="193" class="sans ivory" font-size="2.15">VIVID COLOUR  |  RICH AROMA  |  BALANCED HEAT</text><text x="125" y="189" text-anchor="end" class="serif ivory" font-size="8" font-weight="700">100 g</text></g>"""
    return shell(body, "ZestFresh Premium Red Chilli Powder - Luxury Front")


def svg_story_lines():
    return [
        "Our premium red chilli powder is crafted from carefully selected", "chillies grown in the fertile lands of Guntur, nourished by the", "Godavari river basin. This unique region is celebrated worldwide", "for producing chillies with exceptional colour, rich aroma and", "balanced heat. Every batch is carefully sourced, hygienically", "processed and packed to preserve its natural freshness, authentic", "flavour and vibrant red colour, bringing the true taste of Andhra", "Pradesh to your kitchen."
    ]


def field_art_svg():
    rows = "".join(f'<ellipse cx="{x+1.4}" cy="95" rx="1.4" ry=".7" fill="#8e1428"/>' for x in range(88,124,4))
    curves = "".join(f'<path d="M105 67C105 77,{x} 87,{x} 99"/>' for x in (88,96,104,112,120,126))
    return f"""<g fill="none" stroke="#c7a34d"><circle cx="105" cy="54" r="8" fill="#8e1428" stroke="none"/><path d="M85 67H125" stroke-width=".5"/>{curves}<path d="M86 75L124 77M86 82L124 84M86 89L124 91M86 96L124 98" stroke-width=".28"/><g stroke-width=".7"><circle cx="99" cy="75" r="1.25" fill="#c7a34d"/><path d="M99 76.5l1.6 6.5m-1.1-3l3.5 2m-2.4 1l-2 5m2-5l2.5 5"/><circle cx="114" cy="78" r="1.25" fill="#c7a34d"/><path d="M114 79.5l-1.6 6.5m1.1-3l-3.5 2m2.4 1l2 5m-2-5l-2.5 5"/></g></g>{rows}<text x="105" y="104" text-anchor="middle" class="sans gold tracked" font-size="2.05" font-weight="700">GUNTUR  •  ANDHRA PRADESH</text>"""


def back_svg():
    story_tspans = "".join(f'<tspan x="11" dy="{0 if i == 0 else 3.15}">{escape(line)}</tspan>' for i, line in enumerate(svg_story_lines()))
    nutrition = [("Energy","[VALUE] kcal"),("Protein","[VALUE] g"),("Carbohydrate","[VALUE] g"),("Total Sugars","[VALUE] g"),("Total Fat","[VALUE] g"),("Sodium","[VALUE] mg")]
    nrows = "".join(f'<path d="M11 {y+1.5}H67" stroke="#c7a34d" stroke-width=".22"/><text x="11" y="{y}" class="sans ivory" font-size="2.3">{a}</text><text x="67" y="{y}" text-anchor="end" class="sans ivory" font-size="2.2" font-weight="700">{b}</text>' for (a,b),y in zip(nutrition,[142,146.6,151.2,155.8,160.4,165]))
    fields = [("BATCH NO.","[BATCH]"),("MRP","Rs [MRP]"),("PACKED ON","[MM/YYYY]"),("BEST BEFORE","[MM/YYYY]"),("FSSAI NO.","[14-DIGIT LICENSE]")]
    frows = "".join(f'<text x="75" y="{y}" class="sans gold" font-size="2.05" font-weight="700">{a}</text><text x="125" y="{y}" text-anchor="end" class="sans ivory" font-size="2.2" font-weight="700">{escape(b)}</text>' for (a,b),y in zip(fields,[140,145.4,150.8,156.2,161.6]))
    body = f"""
  <g id="BACKGROUND" inkscape:groupmode="layer"><rect width="136" height="206" fill="#0c0b0c"/><rect y="128" width="136" height="78" fill="#5e0d1c"/></g>
  <g id="BRAND" inkscape:groupmode="layer">{logo_svg(top=10,compact=True)}<text x="11" y="42" class="serif ivory" font-size="7" font-weight="700">From the Heart of Guntur</text><path d="M11 47H36" stroke="#c7a34d" stroke-width=".45"/></g>
  <g id="STORY" inkscape:groupmode="layer"><text x="11" y="54" class="serif muted" font-size="1.82">{story_tspans}</text>{field_art_svg()}</g>
  <g id="PRODUCT_INFORMATION" inkscape:groupmode="layer"><text x="11" y="110" class="sans gold" font-size="3.1" font-weight="700">INGREDIENTS</text><text x="11" y="117" class="serif ivory" font-size="3" font-weight="700">100% Premium Guntur Red Chillies</text><text x="73" y="110" class="sans gold" font-size="3.1" font-weight="700">STORAGE INSTRUCTIONS</text><text x="73" y="117" class="sans muted" font-size="2.4">Keep in a cool, dry place.</text><text x="73" y="121" class="sans muted" font-size="2.4">Away from moisture and direct sunlight.</text></g>
  <g id="NUTRITION" inkscape:groupmode="layer"><text x="11" y="132" class="sans gold" font-size="2.9" font-weight="700">NUTRITIONAL INFORMATION</text><text x="11" y="137" class="sans gold" font-size="2">Approximate values per 100 g - lab verification required</text>{nrows}</g>
  <g id="VARIABLE_DATA" inkscape:groupmode="layer"><text x="75" y="132" class="sans gold" font-size="2.9" font-weight="700">PACK INFORMATION</text>{frows}<path d="M11 171H125" stroke="#c7a34d" stroke-width=".35"/><text x="11" y="178" class="sans gold" font-size="2.5" font-weight="700">MANUFACTURED BY</text><text x="11" y="184" class="sans ivory" font-size="2.35" font-weight="700">[LEGAL ENTITY NAME]</text><text x="11" y="189" class="sans ivory" font-size="2.15">[FULL POSTAL ADDRESS, INDIA]</text><text x="11" y="194" class="sans gold" font-size="2.1" font-weight="700">Customer Care: [PHONE]  |  [EMAIL]  |  zestfresh.in</text></g>
  <g id="CODES_AND_MARKS" inkscape:groupmode="layer"><rect x="72.5" y="174.5" width="32" height="14" fill="#fff"/><image x="73" y="175" width="31" height="13" xlink:href="assets/barcode-placeholder.svg"/><text x="88.5" y="191" text-anchor="middle" class="sans gold" font-size="1.7" font-weight="700">PLACEHOLDER GTIN</text><rect x="107.5" y="174.5" width="16" height="16" fill="#fff"/><image x="108" y="175" width="15" height="15" xlink:href="assets/qr-zestfresh.svg"/><text x="115.5" y="193" text-anchor="middle" class="sans gold" font-size="1.7" font-weight="700">SCAN</text><rect x="73" y="193" width="8" height="8" fill="#fff" stroke="#159447" stroke-width=".45"/><circle cx="77" cy="197" r="2.3" fill="#159447"/><circle cx="89" cy="197" r="3.8" fill="none" stroke="#c7a34d" stroke-width=".65"/><path d="M89 194.4l2.5 4.2h-5z" fill="none" stroke="#c7a34d" stroke-width=".55"/><text x="101" y="199" class="sans ivory" font-size="2" font-weight="700">MADE IN INDIA</text></g>"""
    return shell(body, "ZestFresh Premium Red Chilli Powder - Luxury Back")


def main():
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    source = Image.open(ASSETS / "chilli-composition-luxury-bright-v2.png").convert("CMYK")
    source = source.resize((1800, 2700), Image.Resampling.LANCZOS)
    source.save(ASSETS / "chilli-composition-luxury-bright-v2-cmyk.jpg", quality=95, subsampling=0, dpi=(300,300))
    (ROOT / "zestfresh-red-chilli-front-luxury.svg").write_text(front_svg(), encoding="utf-8")
    (ROOT / "zestfresh-red-chilli-back-luxury.svg").write_text(back_svg(), encoding="utf-8")
    draw_front(PDF_DIR / "zestfresh-red-chilli-front-luxury-print.pdf")
    draw_back(PDF_DIR / "zestfresh-red-chilli-back-luxury-print.pdf")


if __name__ == "__main__":
    main()
