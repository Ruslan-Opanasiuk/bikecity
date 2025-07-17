import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";
import { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";

// === [0] КОНСТАНТИ ШРИФТУ ТА ПРОПОРЦІЙ ===
const BASE_FONT_SIZE_PRIMARY = 38;
const BASE_FONT_SIZE_SECONDARY = 20;
const FONT_VISUAL_HEIGHT_COEFF = 96 / 76;
const DIAGONAL_ARROW_WIDTH = 55.4;

// === [1] АДАПТИВНЕ ЗМЕНШЕННЯ ШРИФТУ ДО ШИРИНИ ===
function scaleFontToFit(text, font, maxWidth, baseSize, minRatio = 0.8) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) return { size: baseSize, ratio: 1 };
  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, minRatio);
  return { size: baseSize * clampedRatio, ratio: clampedRatio };
}

// === [2] РОЗБИТТЯ ДОВГОГО РЯДКА НА 2, ЯКЩО ПОТРІБНО ===
function splitText(text) {
  const words = text.split(" ");
  if (words.length < 2) return [text];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

// === [3] ОСНОВНА ФУНКЦІЯ РОЗРАХУНКУ ЛЕЯУТУ ТЕКСТУ ===
export function computeB4TextLayout(params) {
  const mainKey = params.mainText;
  const subText = params.subText || "";
  const translit = subText ? transliterate(subText) : "";

  let labelUa = "";
  let labelEn = "";

  if (params.icon === "other") {
    labelUa = params.customUa || "";
    labelEn = params.customEn || "";
  } else if (params.icon && mainKey && locationTerms[params.icon]?.[mainKey]) {
    const entry = locationTerms[params.icon][mainKey];
    labelUa = entry.ua ?? "";
    labelEn = entry.en ?? "";
  }

  const mainTextLineRaw = labelUa ? `${labelUa} ${subText}`.trim() : subText;

  let secondaryLine = "";
  if (params.icon === "bicycleRoute") {
    const number = params.routeNumber ? ` ${params.routeNumber}` : "";
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ") + number;
  } else {
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ");
  }

  // === [3.2] Позиція X ===
  const xPadding = 40;
  const arrow = PathConfigs.smallArrow;

  const directionLayout = {
    left: {
      rotation: -90,
      arrowX: xPadding + (arrow.height - arrow.width) / 2,
      iconX: xPadding + arrow.height + 20,
    },
    straight: {
      rotation: 0,
      arrowX: xPadding,
      iconX: xPadding + arrow.width + 20,
    },
    "straight-left": {
      rotation: -45,
      arrowX: xPadding - 3,
      iconX: xPadding - 3 + DIAGONAL_ARROW_WIDTH + 20,
    },
    right: {
      rotation: 90,
      arrowX: 560 - arrow.width - (arrow.height - arrow.width) / 2,
      iconX: xPadding,
    },
    "straight-right": {
      rotation: 45,
      arrowX: 560 + 3 - DIAGONAL_ARROW_WIDTH,
      iconX: xPadding,
    },
  };

  const layout = directionLayout[params.direction] || {};
  const arrowX = layout.arrowX || 0;

  let textX = xPadding;
  if (["left", "straight", "straight-left"].includes(params.direction)) {
    const arrowVisualWidth = {
      straight: arrow.width,
      left: arrow.height,
      "straight-left": DIAGONAL_ARROW_WIDTH,
    }[params.direction] || 0;

    textX = arrowX + arrowVisualWidth + 20;
  }

  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }
  if (!iconKey) {
    switch (params.numberType) {
      case "veloSTO":
      case "veloParking":
      case "eurovelo":
        iconKey = params.numberType;
    }
  }

  const icon = iconKey && PathConfigs[iconKey];
  if (icon) {
    textX += icon.width * icon.scale + 20;
  }

  const originalTextX = textX;

  // === [3.3] Вирівнювання textX (якщо задано) ===
  if (typeof params.alignedTextX === "number") {
    textX = params.alignedTextX;
  }
  const textXShift = textX - originalTextX;

  // === [3.4] Ширини для розрахунків ===
  const baseFontSize1 = BASE_FONT_SIZE_PRIMARY / 0.7;
  const baseFontSize2 = BASE_FONT_SIZE_SECONDARY / 0.7;

  const arrowRightSpace = ["right", "straight-right"].includes(params.direction)
    ? (params.direction === "right" ? arrow.height : DIAGONAL_ARROW_WIDTH) + 20
    : 0;

  const badgeGroupWidth = getRouteBadgeGroupWidth(params);

  const availableTextWidthMain =
    520 - (originalTextX - xPadding) - textXShift - arrowRightSpace - badgeGroupWidth;

  const availableTextWidthSecondary =
    520 - (originalTextX - xPadding) - textXShift - arrowRightSpace;

  // === [3.5] Основний текст: розрахунок розміру та рядків ===
  let mainTextLines;
  let fontSize1;

  const fontFamilyBold = "54px RoadUA-Bold";

  const { ratio: singleLineRatio } = scaleFontToFit(
    mainTextLineRaw,
    fontFamilyBold,
    availableTextWidthMain,
    baseFontSize1,
    0.7
  );

  if (singleLineRatio >= 0.8) {
    mainTextLines = [mainTextLineRaw];
    fontSize1 = params.forcedFontSize1 ?? baseFontSize1 * Math.min(singleLineRatio, 1);
  } else {
    mainTextLines = splitText(mainTextLineRaw);

    const adjustedRatio = Math.min(
      scaleFontToFit(mainTextLines[0], fontFamilyBold, availableTextWidthMain, baseFontSize1, 0.7).ratio,
      scaleFontToFit(mainTextLines[1], fontFamilyBold, availableTextWidthMain, baseFontSize1, 0.7).ratio
    );

    fontSize1 = params.forcedFontSize1 ??
      baseFontSize1 * Math.min(0.8, Math.max(adjustedRatio, 0.7));
  }

  const { size: fontSize2 } = scaleFontToFit(
    secondaryLine,
    "28px RoadUA-Medium",
    availableTextWidthSecondary,
    baseFontSize2
  );

  // === [3.6] Додаткові координати ===
  const measuredLines = mainTextLines.map(line =>
    measureText(line, `${fontSize1}px RoadUA-Bold`)
  );
  const maxTextWidth = Math.max(...measuredLines.map(m => m.width));
  const routeBadgeX = textX + maxTextWidth + 20;

  // === [3.7] Хвильки ===
  const showWave = params.icon === "water";
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

// === [4] МІНІМАЛЬНИЙ РОЗМІР ШРИФТУ СЕРЕД НАПРЯМКІВ ===
export function getMinimalFontSizeAcrossB4Items(items) {
  if (!Array.isArray(items) || items.length === 0)
    return BASE_FONT_SIZE_PRIMARY;

  const fontSizes = items.map((itemParams) => {
    const layout = computeB4TextLayout(itemParams);
    return layout.fontSize1;
  });

  return Math.min(...fontSizes);
}

// === [5] ВИРІВНЮВАННЯ ПО textX ДЛЯ ГРУП ===
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

    if (group.length > 1) {
      const existing = groups.flatMap(g => g.map(item => item.index));
      const newGroup = group.filter(g => !existing.includes(g.index));
      if (newGroup.length > 1) {
        groups.push(newGroup);
      }
    }
  }

  const result = new Map();

  for (const group of groups) {
    const maxTextX = Math.max(...group.map(g => g.textX));
    group.forEach(({ index }) => {
      result.set(index, maxTextX);
    });
  }

  return result;
}
