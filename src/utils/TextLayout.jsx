import transliterate from "./transliterate";
  import PathConfigs from "../config/PathConfigs";
  import locationTerms from "../config/locationTerms";
  import measureText from "./measureText";

  // === [0] КОНСТАНТИ ===
  const BASE_FONT_SIZE_PRIMARY = 38;
  const BASE_FONT_SIZE_SECONDARY = 20; // Базовий розмір для англійського тексту
  const FONT_VISUAL_HEIGHT_COEFF = 96 / 76;

  // Нова константа для буфера виявлення переповнення (можна підібрати експериментально)
  const OVERFLOW_DETECTION_BUFFER = 10; // наприклад, 10 пікселів

  // === [1] Масштабування тексту під ширину ===
  function scaleFontToFit(text, font, maxWidth, baseSize, minRatio) {
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

  // === [2] Розбиття тексту на 2 рядки ===
  function splitText(text) {
    const words = text.trim().split(" ");
    if (words.length < 2) return [text];
    const half = Math.ceil(words.length / 2);
    return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
  }

  // === [3] Основна функція розрахунку лейауту ===
  export function computeTextLayout(params) {
    const {
      mainText,
      subText = "",
      icon,
      customUa,
      customEn,
      routeNumber,
      isUrbanCenter,
      isOnlySymbol,
      numberType,
      forcedFontSize1,
      textX = 0,
      availableTextWidthMain = 520,
      availableTextWidthSecondary = 520,
    } = params;

    // === [3.1] Отримання назв ===
    let labelUa = "";
    let labelEn = "";
    let labelShortEn = "";

    if (icon === "other") {
      labelUa = customUa || "";
      labelEn = customEn || "";
      labelShortEn = customEn || "";
    } else if (icon && mainText && locationTerms[icon]?.[mainText]) {
      const entry = locationTerms[icon][mainText];
      labelUa = entry.ua ?? "";
      labelEn = entry.en ?? "";
      labelShortEn = entry.shortEn ?? "";
    }

const mainTextRaw = isOnlySymbol 
      ? subText.trim() 
      : (labelUa ? `${labelUa} ${subText}`.trim() : subText);

    // === [3.2] Формування англійського рядка (первинний варіант) ===
    let secondaryLineFull = "";
    if (icon === "bicycleRoute") {
      const number = routeNumber ? ` ${routeNumber}` : "";
      secondaryLineFull = [transliterate(subText), labelEn].filter(Boolean).join(" ") + number;
    } else {
      secondaryLineFull = [transliterate(subText), labelEn].filter(Boolean).join(" ");
    }

    // === [3.3] Логіка вибору та зменшення розміру шрифту для secondaryLine ===
    let secondaryLineToRender = secondaryLineFull;
    let fontSize2;

    const baseFontSizeSecondaryAdjusted = BASE_FONT_SIZE_SECONDARY / 0.7;

    // Спочатку пробуємо масштабувати повний текст з мінімальним коефіцієнтом 0.5
    let resultFull = scaleFontToFit(
      secondaryLineToRender,
      "28px RoadUA-Medium",
      availableTextWidthSecondary,
      baseFontSizeSecondaryAdjusted,
      0.5 // Завжди дозволяємо зменшення до 50%
    );

    // Якщо повний текст поміщається або зменшився до 50%
    if (resultFull.ratio >= 0.5) {
        fontSize2 = resultFull.size;
    } else {
        // Якщо повний текст не поміщається навіть при 50% і є коротка версія
        if (labelShortEn && labelShortEn.trim().length > 0) {
            let secondaryLineShort = "";
            if (icon === "bicycleRoute") {
                const number = routeNumber ? ` ${routeNumber}` : "";
                secondaryLineShort = [transliterate(subText), labelShortEn].filter(Boolean).join(" ") + number;
            } else {
                secondaryLineShort = [transliterate(subText), labelShortEn].filter(Boolean).join(" ");
            }

            // Пробуємо масштабувати коротку версію до 50%
            let resultShort = scaleFontToFit(
                secondaryLineShort,
                "28px RoadUA-Medium",
                availableTextWidthSecondary,
                baseFontSizeSecondaryAdjusted,
                0.5
            );

            if (resultShort.ratio >= 0.5) {
                secondaryLineToRender = secondaryLineShort;
                fontSize2 = resultShort.size;
            } else {
                // Якщо навіть коротка версія не поміщається при 50%, повертаємося до повного тексту
                // і використовуємо його розмір (який вже обчислений з minRatio 0.5)
                fontSize2 = resultFull.size;
            }
        } else {
            // Якщо короткої версії немає, просто використовуємо розмір повного тексту
            // (який вже обчислений з minRatio 0.5)
            fontSize2 = resultFull.size;
        }
    }


    // === [3.4] Розмір шрифту для основного тексту ===
    const baseFontSizeMain = BASE_FONT_SIZE_PRIMARY / 0.7;

    let mainTextLines;
    let fontSize1;
    
    // Визначаємо мінімально допустимий розмір шрифту
    const minFontSize1 = baseFontSizeMain * 0.7;

    const measuredMainText = measureText(mainTextRaw, `${baseFontSizeMain}px RoadUA-Bold`);
    const actualRatioMain = availableTextWidthMain / measuredMainText.width;

    // --- ЗМІНА ТУТ: Логіка для блокування розбиття на два рядки для водних об'єктів ---
    const shouldAllowTwoLines = params.icon !== "water"; // Прапорець, що дозволяє розбиття

    if (actualRatioMain >= 0.8 || !shouldAllowTwoLines) {
      // Якщо текст поміщається при 80% АБО якщо розбиття заборонено (наприклад, для water)
      mainTextLines = [mainTextRaw]; // Завжди один рядок
      const clamped = Math.max(actualRatioMain, 0.7);
      fontSize1 = forcedFontSize1 ?? baseFontSizeMain * Math.min(clamped, 1);
    } else {
      // Якщо текст не поміщається і розбиття дозволено
      mainTextLines = splitText(mainTextRaw);

      const r1 = scaleFontToFit(
        mainTextLines[0],
        `${baseFontSizeMain}px RoadUA-Bold`,
        availableTextWidthMain,
        baseFontSizeMain,
        0.7
      ).ratio;

      const r2 = scaleFontToFit(
        mainTextLines[1],
        `${baseFontSizeMain}px RoadUA-Bold`,
        availableTextWidthMain,
        baseFontSizeMain,
        0.7
      ).ratio;

      const finalRatio = Math.min(r1, r2);
      fontSize1 =
        forcedFontSize1 ?? baseFontSizeMain * Math.min(0.8, Math.max(finalRatio, 0.7));
    }

    // === [3.5] Розміщення бейджу маршруту ===
    const measuredLines = mainTextLines.map((line) =>
      measureText(line, `${fontSize1}px RoadUA-Bold`)
    );
    const maxTextWidth = Math.max(...measuredLines.map((m) => m.width));
    const badgeGap = params.isB7 ? 13 : 15;

    const routeBadgeX = textX + maxTextWidth + badgeGap;

    // === [3.6] Хвилі для іконки water ===
    const showWave = icon === "water";
    const waves = PathConfigs.waves;
    const waveWidth = waves.width * waves.scale;
    const waveAreaWidth = showWave ? Math.min(maxTextWidth, availableTextWidthMain) : 0; // Перевіряємо showWave
    const waveCount = showWave ? Math.floor(waveAreaWidth / waveWidth) : 0;

    const yShiftText =
      fontSize1 * 0.7 * FONT_VISUAL_HEIGHT_COEFF - fontSize1 * 0.7;
    const applyYShift = showWave ? yShiftText : 0;

    // === [НОВА ЛОГІКА ДЛЯ isOverflowing] ===
    // Ця логіка перевіряє, чи фінальний розмір шрифту є мінімально можливим.
    // Якщо так, це означає, що текст переповнює доступний простір,
    // і його довелося зменшити до максимального рівня.
    const isOverflowing = fontSize1 <= minFontSize1;

    // === ПОВЕРНЕННЯ РЕЗУЛЬТАТІВ ===
    console.debug('[layout.secondaryLine]', secondaryLineToRender);

    return {
      mainTextLines,
      secondaryLine: secondaryLineToRender,
      fontSize1,
      fontSize2,
      textX,
      applyYShift,
      waveCount,
      waveWidth,
      routeBadgeX,
      isOverflowing, // <<-- ТЕПЕР ПРАЦЮЄ ПРАВИЛЬНО
    };
  }

  // === [4] Мінімальний шрифт серед напрямків ===
  // Перейменовано computeB4TextLayout на computeTextLayout
  export function getMinimalFontSizeAcrossB4Items(items) {
    if (!Array.isArray(items) || items.length === 0)
      return BASE_FONT_SIZE_PRIMARY;

    const fontSizes = items.map((itemParams) => {
      const layout = computeTextLayout(itemParams); // Змінено на computeTextLayout
      return layout.fontSize1;
    });

    return Math.min(...fontSizes);
  }

  // === [5] Вирівнювання textX, якщо вони близько ===
  export function getAlignedTextXMap(items) {
    const textXList = items.map((params, i) => {
      const { alignedTextX, ...cleanParams } = params;
      const layout = computeTextLayout(cleanParams); // Змінено на computeTextLayout
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