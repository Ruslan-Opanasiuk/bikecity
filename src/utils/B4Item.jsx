import React, { useMemo } from "react";
import opentype from "opentype.js";

import PathConfigs from "../config/PathConfigs";
import { computeTextLayout } from "./TextLayout";
import RouteBadgeGroup, {
  getRouteBadgeGroupWidth,
} from "../components/svg/RouteBadgeGroup";
import { textToPath } from "../utils/textToPath";

import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";
import mediumData from "../utils/export/RoadUA-Medium.ttf.base64?raw";

// === [0] ЗАВАНТАЖЕННЯ ТА РОЗПАРСЕННЯ ШРИФТІВ ===

const boldBuf = Uint8Array.from(atob(boldData), (c) => c.charCodeAt(0)).buffer;
const mediumBuf = Uint8Array.from(atob(mediumData), (c) => c.charCodeAt(0)).buffer;

const roadUABold = opentype.parse(boldBuf);
const roadUAMedium = opentype.parse(mediumBuf);

// Базові параметри шрифтів
const BASE_FONT_SIZE_PRIMARY = 38;
const BASE_FONT_SIZE_SECONDARY = 20;
const FONT_VISUAL_HEIGHT_COEFF = 96 / 76;
const DIAGONAL_ARROW_WIDTH = 55.4;

function B4Item({
  params,
  x = 0,
  y = 0,
  transform,
  isLast = false,
  index = 0,
  contentOffsetY = 0,
}) {
  // === [1] ОБРОБКА ПАРАМЕТРІВ ===

  const TEMP_COLOR = "#F5C30D";
  const shouldShowTemporaryBg = params.isTemporaryRoute === true;
  const isEndRoute = params.direction === "end" && index === 0;

  // Обчислення ключа іконки
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

  // === [2] РОЗТАШУВАННЯ СТРІЛОК, ІКОНКИ ТА ТЕКСТУ ===

  const xPadding = 40;
  const arrow = PathConfigs.smallArrow;

  // Координати та поворот стрілки залежно від напрямку
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
  const rotation = layout.rotation || 0;
  const arrowX = layout.arrowX ?? 0;
  const iconX = layout.iconX ?? xPadding;
  const arrowY = 75 - arrow.height / 2;

  // Початкове розташування тексту
  let textX = xPadding;

  // Зсув тексту правіше, якщо стрілка зліва
  if (["left", "straight", "straight-left"].includes(params.direction)) {
    const arrowVisualWidth = {
      straight: arrow.width,
      left: arrow.height,
      "straight-left": DIAGONAL_ARROW_WIDTH,
    }[params.direction] || 0;

    textX = arrowX + arrowVisualWidth + 20;
  }

  // Додаємо ширину іконки, якщо є
  if (icon) {
    textX += icon.width * icon.scale + 20;
  }

  const originalTextX = textX;

  // Якщо є вирівнювання по alignedTextX — застосовуємо його
  if (typeof params.alignedTextX === "number") {
    textX = params.alignedTextX;
  }

  const textXShift = textX - originalTextX;

  // Визначаємо відступ справа під стрілку (якщо напрямок праворуч)
  const arrowRightSpace = ["right", "straight-right"].includes(params.direction)
    ? (params.direction === "right" ? arrow.height : DIAGONAL_ARROW_WIDTH) + 20
    : 0;

  const badgeGroupWidth = getRouteBadgeGroupWidth(params);

  // Обчислюємо ширину, доступну під основний і другорядний текст
  const availableTextWidthMain =
    520 - (originalTextX - xPadding) - textXShift - arrowRightSpace - badgeGroupWidth;

  const availableTextWidthSecondary =
    520 - (originalTextX - xPadding) - textXShift - arrowRightSpace - 4;

  // === [3] РОЗРАХУНОК ТЕКСТОВОГО ЛЕЯУТУ ===

  const {
    mainTextLines,
    secondaryLine,
    fontSize1,
    fontSize2,
    applyYShift,
    waveCount,
    waveWidth,
    routeBadgeX,
  } = computeTextLayout({
    ...params,
    forcedFontSize1: params.forcedFontSize1 || null,
    alignedTextX: params.alignedTextX || null,
    textX,
    availableTextWidthMain,
    availableTextWidthSecondary,
  });

  // === [4] ГЕНЕРАЦІЯ ОСНОВНОГО ТЕКСТУ (1 або 2 рядки) ===

  const mainTextPaths = useMemo(() => {
    return mainTextLines.map((line, i) => {
      const baselineY =
        mainTextLines.length === 1
          ? 35 + BASE_FONT_SIZE_PRIMARY / 2 - applyYShift
          : i === 0
          ? 35
          : 75;

      return textToPath(
        roadUABold,
        line,
        fontSize1,
        textX,
        baselineY,
        "left",
        "visualX"
      );
    });
  }, [mainTextLines.join("|"), fontSize1, textX, applyYShift]);

  // === [5] ГЕНЕРАЦІЯ ДРУГОРЯДНОГО ТЕКСТУ (англійський) ===

  const secondaryPath = useMemo(() => {
    const baselineY =
      mainTextLines.length === 1
        ? 115 -
          BASE_FONT_SIZE_SECONDARY * 0.5 -
          BASE_FONT_SIZE_SECONDARY * (FONT_VISUAL_HEIGHT_COEFF - 1) -
          applyYShift
        : 115;

    return textToPath(
      roadUAMedium,
      secondaryLine,
      fontSize2,
      textX,
      baselineY,
      "left",
      "visualX"
    );
  }, [secondaryLine, fontSize2, textX, mainTextLines.length, applyYShift]);

  // === [6] РЕНДЕР SVG ===

  return (
    <g transform={transform || `translate(${x}, ${y})`}>

      {/* <rect x={560} y={0} width={40} height={200} fill={"red"} /> */}
      {/* [6.1] Тимчасовий жовтий фон */}
      {shouldShowTemporaryBg &&
        (isLast ? (
          <path
            d={PathConfigs.temporaryRouteFooterBg.d}
            fill={TEMP_COLOR}
            fillRule="evenodd"
          />
        ) : (
          <rect x={10} y={0} width={580} height={150} fill={TEMP_COLOR} />
        ))}

      <g transform={`translate(0, ${contentOffsetY})`}>
        {/* [6.2] Червона смуга (для напрямку "end") */}
        {isEndRoute && (
          <g
            transform={`translate(
              ${params.b4Items?.length === 1 ? 31 : 0},
              ${params.b4Items?.length === 1 ? -10 : 0}
            )`}
          >
            <path
              d={PathConfigs.stripeBig.d}
              fill="#CC0000"
              fillRule="evenodd"
            />
          </g>
        )}

        {/* [6.3] Основний текст */}
        {mainTextPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="black"
            style={{ fontFeatureSettings: '"ss02"' }}
          />
        ))}

        {/* [6.4] Англійський текст (нижній рядок) */}
        <path
          d={secondaryPath}
          fill="black"
          style={{ fontFeatureSettings: '"ss02"' }}
        />

        {/* [6.5] Стрілка */}
        {params.direction !== "end" && !params.hideArrow && (
          <g
            transform={`
              translate(${arrowX}, ${arrowY})
              rotate(${rotation} ${arrow.width / 2} ${arrow.height / 2})
              scale(${arrow.scale})
            `}
          >
            <path d={arrow.d} fill="black" />
          </g>
        )}

        {/* [6.6] Іконка */}
        {icon && (
          <g
            transform={`translate(
              ${iconX},
              ${75 - (icon.height * icon.scale) / 2}
            ) scale(${icon.scale})`}
          >
            <path d={icon.d} fill="#000" fillRule="evenodd" />
          </g>
        )}

        {/* [6.7] Хвильки (тільки для water) */}
        {params.icon === "water" && (
          <g transform={`translate(${textX}, 108)`}>
            {Array.from({ length: waveCount }).map((_, i) => (
              <path
                key={i}
                d={PathConfigs.waves.d}
                transform={`translate(${i * waveWidth}, 0) scale(${PathConfigs.waves.scale})`}
                fill="#005187"
              />
            ))}
          </g>
        )}

        {/* [6.8] Бейджі маршруту */}
        <RouteBadgeGroup
          params={{
            ...params,
            isTerminus: isEndRoute,
            isTemporaryRoute: shouldShowTemporaryBg,
          }}
          x={routeBadgeX}
          y={35}
        />
      </g>
    </g>
  );
}

export default B4Item;


// === 🧩 СТРУКТУРА КОМПОНЕНТА B4Item (довідка для навігації) ===
//
// [0] Завантаження шрифтів
//     ▸ Завантаження base64-шрифтів та їх парсинг через opentype.js
//
// [1] Обробка параметрів
//     ▸ Перевірка напрямку "end", тимчасовості, визначення іконки
//
// [2] Розрахунок позицій
//     ▸ Стрілка, іконка, зміщення тексту праворуч
//     ▸ Розрахунок ширини тексту з урахуванням іконок і стрілок
//
// [3] Розрахунок текстового леяуту
//     ▸ computeTextLayout обчислює текст, шрифти, хвильки, бейджі
//
// [4] Основний текст
//     ▸ Трансформує кожен рядок у SVG path
//
// [5] Другорядний текст
//     ▸ Розраховує baseline для англійського рядка і теж трансформує у path
//  
// [6] Рендер
//
//   [6.1] Тимчасовий жовтий фон
//   [6.2] Червона смуга (для "end")
//   [6.3] Основний текст (верхній)
//   [6.4] Англійський рядок (нижній)
//   [6.5] Стрілка
//   [6.6] Іконка
//   [6.7] Хвильки (тільки для water)
//   [6.8] Бейджі маршрутів
//
// =================================================================
