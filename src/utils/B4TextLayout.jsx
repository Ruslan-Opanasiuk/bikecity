import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";
import { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";

// === [0] КОНСТАНТИ, ЯКІ ВИКОРИСТОВУЮТЬСЯ ДЛЯ РОЗРАХУНКІВ РОЗМІРІВ ТЕКСТУ ТА ЕЛЕМЕНТІВ ===
const BASE_FONT_SIZE_PRIMARY = 38;
const BASE_FONT_SIZE_SECONDARY = 20;
const FONT_VISUAL_HEIGHT_COEFF = 96 / 76; // коефіцієнт візуального зміщення тексту вниз
const DIAGONAL_ARROW_WIDTH = 55.4; // ширина діагональної стрілки

// === [1] ФУНКЦІЯ АДАПТИВНОГО ЗМЕНШЕННЯ ШРИФТУ ДО ШИРИНИ ===
// Приймає текст, шрифт, максимальну ширину, базовий розмір шрифту і мінімальний коефіцієнт.
// Повертає новий розмір шрифту та коефіцієнт масштабування.
function scaleFontToFit(text, font, maxWidth, baseSize, minRatio = 0.8) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) {
    return { size: baseSize, ratio: 1 };
  }

  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, minRatio);

  return {
    size: baseSize * clampedRatio,
    ratio: clampedRatio,
  };
}

// === [2] ФУНКЦІЯ РОЗБИТТЯ ДОВГОГО ТЕКСТУ НА ДВА РЯДКИ ===
// Розбиває рядок тексту навпіл, щоб уникнути переповнення при виведенні.
function splitText(text) {
  const words = text.split(" ");
  if (words.length < 2) return [text];

  const middleIndex = Math.ceil(words.length / 2);
  const firstLine = words.slice(0, middleIndex).join(" ");
  const secondLine = words.slice(middleIndex).join(" ");

  return [firstLine, secondLine];
}

// === [3] ОСНОВНА ФУНКЦІЯ РОЗРАХУНКУ РОЗТАШУВАННЯ ТЕКСТУ НА ЗНАКУ ===
export function computeB4TextLayout(params) {
  // === [3.1] Формування основного та додаткового тексту ===
  const mainKey = params.mainText;
  const subText = params.subText || "";
  const translit = subText ? transliterate(subText) : "";

  let labelUa = "";
  let labelEn = "";

  // Визначаємо підпис залежно від типу іконки та основного ключа
  if (params.icon === "other") {
    labelUa = params.customUa || "";
    labelEn = params.customEn || "";
  } else if (params.icon && mainKey && locationTerms[params.icon]?.[mainKey]) {
    const entry = locationTerms[params.icon][mainKey];
    labelUa = entry.ua ?? "";
    labelEn = entry.en ?? "";
  }

  const mainTextRaw = labelUa ? `${labelUa} ${subText}`.trim() : subText;

  // Формування другого (нижнього) рядка
  let secondaryLine = "";
  if (params.icon === "bicycleRoute") {
    const routeNumber = params.routeNumber ? ` ${params.routeNumber}` : "";
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ") + routeNumber;
  } else {
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ");
  }

  // === [3.2] Розрахунок координат X для стрілок та іконок ===
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
  const arrowX = layout.arrowX ?? 0;

  // Визначення позиції тексту залежно від напрямку
  let textX = xPadding;
  if (["left", "straight", "straight-left"].includes(params.direction)) {
    const arrowVisualWidth = {
      straight: arrow.width,
      left: arrow.height,
      "straight-left": DIAGONAL_ARROW_WIDTH,
    }[params.direction] || 0;

    textX = arrowX + arrowVisualWidth + 20;
  }

  // === [3.3] Обробка випадків, де іконка може змінитися ===
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

  // Додаємо ширину іконки, якщо вона є
  const icon = iconKey && PathConfigs[iconKey];
  if (icon) {
    textX += icon.width * icon.scale + 20;
  }

  const originalTextX = textX;

  // === [3.4] Якщо потрібно вирівняти по заданій координаті X ===
  if (typeof params.alignedTextX === "number") {
    textX = params.alignedTextX;
  }
  const textXShift = textX - originalTextX;

  // === [3.5] Розрахунок доступної ширини для тексту ===
  const baseFontSizeMain = BASE_FONT_SIZE_PRIMARY / 0.7;
  const baseFontSizeSecondary = BASE_FONT_SIZE_SECONDARY / 0.7;

  const arrowRightSpace = ["right", "straight-right"].includes(params.direction)
    ? (params.direction === "right" ? arrow.height : DIAGONAL_ARROW_WIDTH) + 20
    : 0;

  const badgeGroupWidth = getRouteBadgeGroupWidth(params);

  const availableTextWidthMain =
    520 - (originalTextX - xPadding) - textXShift - arrowRightSpace - badgeGroupWidth;

  const availableTextWidthSecondary =
    520 - (originalTextX - xPadding) - textXShift - arrowRightSpace;

  // === [3.6] Розрахунок розміру основного тексту ===
  let mainTextLines;
  let fontSize1;

  const fontFamilyBold = "54px RoadUA-Bold";
  const { ratio: oneLineRatio } = scaleFontToFit(
    mainTextRaw,
    fontFamilyBold,
    availableTextWidthMain,
    baseFontSizeMain,
    0.7
  );

  if (oneLineRatio >= 0.8) {
    mainTextLines = [mainTextRaw];
    fontSize1 = params.forcedFontSize1 ?? baseFontSizeMain * Math.min(oneLineRatio, 1);
  } else {
    mainTextLines = splitText(mainTextRaw);

    const ratio1 = scaleFontToFit(mainTextLines[0], fontFamilyBold, availableTextWidthMain, baseFontSizeMain).ratio;
    const ratio2 = scaleFontToFit(mainTextLines[1], fontFamilyBold, availableTextWidthMain, baseFontSizeMain).ratio;

    const adjustedRatio = Math.min(ratio1, ratio2);

    fontSize1 = params.forcedFontSize1 ?? baseFontSizeMain * Math.min(0.8, Math.max(adjustedRatio, 0.7));
  }

  // === [3.7] Розрахунок розміру другого рядка ===
  const { size: fontSize2 } = scaleFontToFit(
    secondaryLine,
    "28px RoadUA-Medium",
    availableTextWidthSecondary,
    baseFontSizeSecondary
  );

  // === [3.8] Визначення X-позиції для бейджу маршруту (badge) ===
  const measuredLines = mainTextLines.map(line =>
    measureText(line, `${fontSize1}px RoadUA-Bold`)
  );
  const maxTextWidth = Math.max(...measuredLines.map(m => m.width));
  const routeBadgeX = textX + maxTextWidth + 20;

  // === [3.9] Обробка хвиль (візуального елементу для води) ===
  const showWave = params.icon === "water";
  const waves = PathConfigs.waves;
  const waveWidth = waves.width * waves.scale;
  const waveAreaWidth = Math.min(maxTextWidth, availableTextWidthMain);
  const waveCount = showWave ? Math.floor(waveAreaWidth / waveWidth) : 0;

  // === [3.10] Корекція вертикального зміщення тексту при хвилях ===
  const yShiftText = fontSize1 * 0.7 * FONT_VISUAL_HEIGHT_COEFF - fontSize1 * 0.7;
  const applyYShift = showWave ? yShiftText : 0;

  // === [3.11] Повернення всіх даних, необхідних для рендеру ===
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

// === [4] ФУНКЦІЯ ЗНАХОДЖЕННЯ МІНІМАЛЬНОГО РОЗМІРУ ШРИФТУ СЕРЕД УСІХ ЕЛЕМЕНТІВ ===
export function getMinimalFontSizeAcrossB4Items(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return BASE_FONT_SIZE_PRIMARY;
  }

  const fontSizes = items.map((itemParams) => {
    const layout = computeB4TextLayout(itemParams);
    return layout.fontSize1;
  });

  return Math.min(...fontSizes);
}

// === [5] ФУНКЦІЯ ВИРІВНЮВАННЯ КООРДИНАТ textX ДЛЯ ГРУПОВИХ ЕЛЕМЕНТІВ ===
// Групує елементи, у яких textX досить близько (різниця <= 22), і вирівнює їх.
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

    const alreadyGrouped = groups.flatMap(g => g.map(item => item.index));
    const newGroup = group.filter(g => !alreadyGrouped.includes(g.index));

    if (newGroup.length > 1) {
      groups.push(newGroup);
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
