import opentype from "opentype.js";

/**
 * Перетворює текст у SVG-path з вирівнюванням, з підтримкою візуального центрування (наприклад, по H або x).
 *
 * @param {opentype.Font} font
 * @param {string} text
 * @param {number} fontSize
 * @param {number} anchorX
 * @param {number} anchorY
 * @param {'left'|'center'|'right'} hAlign
 * @param {'baseline'|'middle'|'top'|'bottom'|'visualH'|'visualx'} vAlign
 * @returns {string} pathData
 */
export function textToPath(
  font, text, fontSize,
  anchorX, anchorY,
  hAlign = "left", vAlign = "baseline"
) {
  const scale = fontSize / font.unitsPerEm;
  const path = new opentype.Path();
  let x = 0;

  for (const char of text) {
    let glyph;
    if (char === "3") {
      glyph = font.glyphs.get(626); // альтернативна 3-ка
    } else {
      glyph = font.charToGlyph(char);
    }

    if (!glyph) continue;

    const glyphPath = glyph.getPath(x, 0, fontSize);
    path.extend(glyphPath);
    x += glyph.advanceWidth * scale;
  }

  const { x1, y1, x2, y2 } = path.getBoundingBox();

  let dx;
  if (hAlign === "center") dx = anchorX - (x1 + x2) / 2;
  else if (hAlign === "right") dx = anchorX - x2;
  else dx = anchorX - x1;

  let dy;
  if (vAlign === "visualX" || vAlign === "visualx") {
    const refChar = vAlign === "visualX" ? "H" : "x";
    const refGlyph = font.charToGlyph(refChar);
    const refBox = refGlyph.getPath(0, 0, fontSize).getBoundingBox();
    const visualCenter = (refBox.y1 + refBox.y2) / 2;
    dy = anchorY - visualCenter;
  } else if (vAlign === "middle") {
    dy = anchorY - (y1 + y2) / 2;
  } else if (vAlign === "top") {
    dy = anchorY - y2;
  } else if (vAlign === "bottom") {
    dy = anchorY - y1;
  } else {
    dy = anchorY; // baseline
  }

  path.commands.forEach((cmd) => {
    if (cmd.x != null) cmd.x += dx;
    if (cmd.y != null) cmd.y += dy;
    if (cmd.x1 != null) cmd.x1 += dx;
    if (cmd.y1 != null) cmd.y1 += dy;
    if (cmd.x2 != null) cmd.x2 += dx;
    if (cmd.y2 != null) cmd.y2 += dy;
  });

  return path.toPathData(2);
}
