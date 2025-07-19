import React, { useMemo } from "react";
import opentype from "opentype.js";

import PathConfigs from "../config/PathConfigs";
import { computeB4TextLayout } from "./TextLayout";
import RouteBadgeGroup from "../components/svg/RouteBadgeGroup";
import { textToPath } from "../utils/textToPath";
import CircleRenderer from "./CircleRenderer";
import CircleConfigs from "../config/CircleConfigs";
import { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";

import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";
import mediumData from "../utils/export/RoadUA-Medium.ttf.base64?raw";

// === [0] КОНСТАНТИ ТА ЗАВАНТАЖЕННЯ ШРИФТІВ ===

// Базові розміри шрифтів
const BASE_FONT_SIZE_PRIMARY = 38;
const BASE_FONT_SIZE_SECONDARY = 20;
const FONT_VISUAL_HEIGHT_COEFF = 96 / 76;

// Декодування base64-шрифтів у буфери
const boldBuf = Uint8Array.from(atob(boldData), (c) => c.charCodeAt(0)).buffer;
const mediumBuf = Uint8Array.from(atob(mediumData), (c) => c.charCodeAt(0)).buffer;

// Парсинг шрифтів з opentype.js
const roadUABold = opentype.parse(boldBuf);
const roadUAMedium = opentype.parse(mediumBuf);

// === [1] КОМПОНЕНТ ОДНОГО ЕЛЕМЕНТА B7 ===

function B7Item({
  params,
  x = 0,
  y = 0,
  transform,
  isFirst,
  isLast,
  index
}) {
  // === [1.1] Додаткові параметри ===

  const isTemporaryRoute = params.isTemporaryRoute === true;
  const TEMP_COLOR = "#F5C30D";

  // === [1.2] Обробка типу іконки ===

  let iconKey = params.icon;

  // Замінюємо "streetNetwork" на "cityCentre", якщо потрібно
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }

  const isVeloRoute = iconKey === "bicycleRoute";
  const iconConfig = iconKey ? PathConfigs[iconKey] : null;

  // Іконки, які мають стилі стрічки (ribbon)
  const ribbonIcons = new Set(["cityCentre", "bridge", "interchange", "bicycleRoute"]);
  const isRibbonIcon = ribbonIcons.has(iconKey);
  const useDefaultCircleIcon = !isRibbonIcon;



  // Координата X для рендеру іконки
  const iconType = ribbonIcons.has(iconKey) ? "ribbon" : "zone";

  const iconPositionConfig = {
    ribbon: {
      iconX: 50.5 - (iconConfig?.width || 0) * (iconConfig?.scale2 || 1) / 2,
      textX: 91,
    },
    zone: {
      iconX: 91,
      textX: 91 + (iconConfig?.width || 0) * (iconConfig?.scale2 || 1) + 20,
    },
  }[iconType];

  const iconRenderX = iconPositionConfig.iconX;
  const textX = iconPositionConfig.textX;

  
  const badgeGroupWidth = getRouteBadgeGroupWidth(params);
  const availableTextWidthMain = 600 - 28 - textX -  badgeGroupWidth;
  const availableTextWidthSecondary = 481;

  // === [2] РОЗРАХУНОК ТЕКСТОВОГО ЛЕЯУТУ ===

  const {
    mainTextLines,
    secondaryLine,
    fontSize1,
    fontSize2,
    applyYShift,
    waveCount,
    waveWidth,
    routeBadgeX,
  } = computeB4TextLayout({
    ...params,
    forcedFontSize1: params.forcedFontSize1 || null,
    alignedTextX: params.alignedTextX || null,
    textX,
    availableTextWidthMain,
    availableTextWidthSecondary,
  });

  // === [3] ГЕНЕРАЦІЯ ОСНОВНОГО ТЕКСТУ (верхній/верхні рядки) ===

  const mainTextPaths = useMemo(() => {
    return mainTextLines.map((line, i) => {
      const baselineY =
        mainTextLines.length === 1
          ? 50 - BASE_FONT_SIZE_PRIMARY/ 2
          : i === 0
          ? 50 - BASE_FONT_SIZE_PRIMARY/ 2
          : 100 - BASE_FONT_SIZE_PRIMARY/ 2;

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

  // === [4] ГЕНЕРАЦІЯ ДРУГОРЯДНОГО ТЕКСТУ (нижній рядок) ===

  const secondaryPath = useMemo(() => {
    const baselineY =
      mainTextLines.length === 1
        ? 75
        : 125;

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


  const isSeasonal = params.tableType === "seasonal";
  // === [5] РЕНДЕР SVG ===

  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      
      {/* [5.1] Тимчасове жовте тло */}
      {isTemporaryRoute && (
        <rect x={10} y={0} width={580} height={100} fill={TEMP_COLOR} />
      )}

      {/* [5.2] Сірий прямокутник та коло позаду тексту */}
      <rect x={0} y={0} width={600} height={200} fill="green" />
      <rect x={0} y={200} width={600} height={50} fill="red" />
      {/* <rect x={91} y={0} width={481} height={100} fill="green" /> */}
      {/* <rect x={91} y={49.5} width={481} height={1} fill="red" /> */}
      {/* <circle cx={50.5} cy={50} r={22.5} fill="gray" /> */}
      <rect
        x={47.5}
        y={isFirst ? 50 : 0}
        width={6}
        height={isFirst || isLast ? 50 : 100}
        fill={isSeasonal ? TEMP_COLOR : "#000000"}
      />


      {/* [5.3] Основний текст (один або два рядки) */}
      {mainTextPaths.map((d, i) => (
        <path key={i} d={d} fill="black" />
      ))}

      {/* [5.4] Другорядний текст (нижній рядок) */}
      <path d={secondaryPath} fill="black" />

      {/* [5.5] Веломаршрут — спеціальна кругла іконка */}
      {(isVeloRoute || iconKey === "cityCentre" || iconKey === "interchange" || useDefaultCircleIcon) && (
        <CircleRenderer
          config={
            isVeloRoute
              ? CircleConfigs["B7bicycle"]
              : iconKey === "cityCentre"
              ? CircleConfigs["B7citycentre"]
              : iconKey === "interchange"
              ? CircleConfigs["B7interchange"]
              : CircleConfigs["B7"]
          }
          outerColor="#000"
          innerColor={
            useDefaultCircleIcon && !isVeloRoute && iconKey !== "cityCentre" && iconKey !== "interchange"
              ? isSeasonal
                ? "#F5C30D"
                : "#000000"
              : "#fff"
          }
          cx={50.5}
          cy={50}
        />
      )}




      {/* [5.6] Специфічна SVG-іконка */}
      {iconConfig && (
        <g
          transform={`translate(${iconRenderX}, ${
            50 - (iconConfig.height * iconConfig.scale2) / 2
          }) scale(${iconConfig.scale2})`}
        >
          <path d={iconConfig.d} fill="#000" fillRule="evenodd" />
        </g>
      )}

      {/* [5.8] Хвильки для води */}
      {params.icon === "water" && (
        <g transform={`translate(${textX}, ${125-PathConfigs.waves.height*PathConfigs.waves.scale / 2})`}>
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

      {/* [5.9] Бейджі маршрутів (номери, типи тощо) */}
      <RouteBadgeGroup
        params={{
          ...params,
          isTemporaryRoute,
        }}
        x={routeBadgeX}
        y={mainTextLines.length === 1
        ? 12
        : 37}
      />
    </g>
  );
}

export default B7Item;

// моя версія