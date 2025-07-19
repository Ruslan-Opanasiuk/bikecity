import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";

// === [0] КОНСТАНТИ ===
const BASE_FONT_SIZE_PRIMARY = 38;
const BASE_FONT_SIZE_SECONDARY = 20;
const FONT_VISUAL_HEIGHT_COEFF = 96 / 76;

// === [1] Масштабування тексту під ширину ===
function scaleFontToFit(text, font, maxWidth, baseSize, minRatio = 0.8) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) return { size: baseSize, ratio: 1 };

  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, minRatio);

  return {
    size: baseSize * clampedRatio,
    ratio: clampedRatio,
  };
}

// === [2] Розбиття тексту на 2 рядки ===
function splitText(text) {
  const words = text.trim().split(" ");
  if (words.length < 2) return [text];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

// === [3] Основна функція розрахунку лейауту ===
export function computeB4TextLayout(params) {
  const {
    mainText,
    subText = "",
    icon,
    customUa,
    customEn,
    routeNumber,
    isUrbanCenter,
    numberType,
    forcedFontSize1,
    textX = 0,
    availableTextWidthMain = 520,
    availableTextWidthSecondary = 520,
  } = params;

  const translit = subText ? transliterate(subText) : "";

  // === [3.1] Отримання назв ===
  let labelUa = "";
  let labelEn = "";

  if (icon === "other") {
    labelUa = customUa || "";
    labelEn = customEn || "";
  } else if (icon && mainText && locationTerms[icon]?.[mainText]) {
    const entry = locationTerms[icon][mainText];
    labelUa = entry.ua ?? "";
    labelEn = entry.en ?? "";
  }

  const mainTextRaw = labelUa ? `${labelUa} ${subText}`.trim() : subText;

  // === [3.2] Формування англійського рядка ===
  let secondaryLine = "";
  if (icon === "bicycleRoute") {
    const number = routeNumber ? ` ${routeNumber}` : "";
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ") + number;
  } else {
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ");
  }

  // === [3.3] Розмір шрифту ===
  const baseFontSizeMain = BASE_FONT_SIZE_PRIMARY / 0.7;
  const baseFontSizeSecondary = BASE_FONT_SIZE_SECONDARY / 0.7;

  const measured = measureText(mainTextRaw, "54px RoadUA-Bold");
  const actualRatio = availableTextWidthMain / measured.width;

  let mainTextLines;
  let fontSize1;

  if (actualRatio >= 0.8) {
    mainTextLines = [mainTextRaw];
    const clamped = Math.max(actualRatio, 0.7);
    fontSize1 = forcedFontSize1 ?? baseFontSizeMain * Math.min(clamped, 1);
  } else {
    mainTextLines = splitText(mainTextRaw);

    const r1 = scaleFontToFit(
      mainTextLines[0],
      "54px RoadUA-Bold",
      availableTextWidthMain,
      baseFontSizeMain,
      0.7
    ).ratio;

    const r2 = scaleFontToFit(
      mainTextLines[1],
      "54px RoadUA-Bold",
      availableTextWidthMain,
      baseFontSizeMain,
      0.7
    ).ratio;

    const finalRatio = Math.min(r1, r2);
    fontSize1 =
      forcedFontSize1 ?? baseFontSizeMain * Math.min(0.8, Math.max(finalRatio, 0.7));
  }

  const fontSize2 = scaleFontToFit(
    secondaryLine,
    "28px RoadUA-Medium",
    availableTextWidthSecondary,
    baseFontSizeSecondary
  ).size;

  // === [3.4] Розміщення бейджу маршруту ===
  const measuredLines = mainTextLines.map((line) =>
    measureText(line, `${fontSize1}px RoadUA-Bold`)
  );
  const maxTextWidth = Math.max(...measuredLines.map((m) => m.width));
  const routeBadgeX = textX + maxTextWidth + 20;

  // === [3.5] Хвилі для іконки water ===
  const showWave = icon === "water";
  const waves = PathConfigs.waves;
  const waveWidth = waves.width * waves.scale;
  const waveAreaWidth = Math.min(maxTextWidth, availableTextWidthMain);
  const waveCount = showWave ? Math.floor(waveAreaWidth / waveWidth) : 0;

  const yShiftText =
    fontSize1 * 0.7 * FONT_VISUAL_HEIGHT_COEFF - fontSize1 * 0.7;
  const applyYShift = showWave ? yShiftText : 0;

  return {
    mainTextLines,
    secondaryLine,
    fontSize1,
    fontSize2,
    textX,
    applyYShift,
    waveCount,
    waveWidth,
    routeBadgeX,
  };
}

// === [4] Мінімальний шрифт серед напрямків ===
export function getMinimalFontSizeAcrossB4Items(items) {
  if (!Array.isArray(items) || items.length === 0)
    return BASE_FONT_SIZE_PRIMARY;

  const fontSizes = items.map((itemParams) => {
    const layout = computeB4TextLayout(itemParams);
    return layout.fontSize1;
  });

  return Math.min(...fontSizes);
}

// === [5] Вирівнювання textX, якщо вони близько ===
export function getAlignedTextXMap(items) {
  const textXList = items.map((params, i) => {
    const { alignedTextX, ...cleanParams } = params;
    const layout = computeB4TextLayout(cleanParams);
    return { index: i, textX: layout.textX };
  });

  const groups = [];

  for (let i = 0; i < textXList.length; i++) {
    const base = textXList[i];
    let group = [base];

    for (let j = i + 1; j < textXList.length; j++) {
      const next = textXList[j];
      if (Math.abs(base.textX - next.textX) <= 22) {
        group.push(next);
      }
    }

    const alreadyGrouped = groups.flatMap((g) => g.map((el) => el.index));
    const newGroup = group.filter((g) => !alreadyGrouped.includes(g.index));

    if (newGroup.length > 1) groups.push(newGroup);
  }

  const result = new Map();

  for (const group of groups) {
    const maxTextX = Math.max(...group.map((g) => g.textX));
    group.forEach(({ index }) => {
      result.set(index, maxTextX);
    });
  }

  return result;
}
