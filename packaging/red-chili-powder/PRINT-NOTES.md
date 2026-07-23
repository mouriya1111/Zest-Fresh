# ZestFresh Red Chili Powder packaging

## Production size

- Artwork: separate front and back panels
- Artboard: 136 x 206 mm
- Trim: 130 x 200 mm
- Bleed: 3 mm on every side
- Safe area: 8 mm inside trim
- Top seal/zipper planning zone: 18 mm from trim top
- Bottom gusset planning zone: 18 mm from trim bottom

This is a standard working size selected for a 100 g stand-up pouch. The pouch converter's final dieline always overrides these dimensions. Before printing, place the artwork into the converter's approved zipper, seal, gusset, notch and corner-radius dieline.

## Print color targets

- Deep crimson: C15 M100 Y80 K25
- Matte black: C75 M68 Y67 K90
- Gold: C20 M35 Y85 K15
- White: C0 M0 Y0 K0

The print PDFs use CMYK process colors. Gold is a process-color simulation; request a metallic Pantone or foil plate from the printer if a true metallic finish is desired. The hero image has a 300 DPI CMYK production copy.

## Mandatory replacements before press

- Legal manufacturer/packer name and full postal address
- Valid 14-digit FSSAI license number
- Customer care phone and email
- Batch, MRP, packed date and best-before data
- GS1-issued GTIN/barcode; the current barcode is an obvious placeholder
- Lab-verified nutrition values and all product claims
- Final net quantity declarations and statutory text approved by the responsible food-label compliance professional

The QR code resolves to `https://zestfresh.in`.

## Editing and scaling

Open the SVG files in Adobe Illustrator, Affinity Designer, CorelDRAW or Inkscape. Layers are named by function. Text remains live for easy correction; outline a duplicate of the final approved file before handoff if the printer requires outlined fonts. The logo mark, borders, patterns, badges and symbols are vector.

For 200 g, 500 g and 1 kg packs, retain the hierarchy and resize/reflow within the converter's supplied dieline. Do not uniformly stretch the artwork. Replace the net-weight field and keep legal text at the printer's minimum readable size.

## Regenerating

Run `generate_packaging.py` with the bundled Python/ReportLab environment to rebuild the SVG support assets and PDFs from the same source.
