import React, { useMemo } from "react";
import opentype from "opentype.js";

import PathConfigs from "../config/PathConfigs";
import RouteBadgeGroup from "../components/svg/RouteBadgeGroup";
import { textToPath } from "../utils/textToPath";
import CircleRenderer from "./CircleRenderer";
import CircleConfigs from "../config/CircleConfigs";
import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";
import mediumData from "../utils/export/RoadUA-Medium.ttf.base64?raw";

// --- Завантаження шрифтів та глобальні константи ---
const BASE_FONT_SIZE_PRIMARY = 38;
const boldBuf = Uint8Array.from(atob(boldData), (c) => c.charCodeAt(0)).buffer;
const mediumBuf = Uint8Array.from(atob(mediumData), (c) => c.charCodeAt(0)).buffer;
const roadUABold = opentype.parse(boldBuf);
const roadUAMedium = opentype.parse(mediumBuf);

/**
 * Компонент для рендерингу одного рядка (об'єкта) на знаку B7.
 */
function B7Item({
  params,
  x = 0,
  y = 0,
  transform,
  isFirst,
  isLast,
  itemHeight,
  layout,
  textX,
  iconRenderX
}) {
  // --- Кольори та константи ---
  const TEMP_COLOR = "#F5C30D";    // Жовтий для сезонних
  const REGIONAL_COLOR = "#D42E12"; // Червоний для регіональних
  const BLACK_COLOR = "#000000";   // Чорний за замовчуванням
  const WHITE_COLOR = "#FFFFFF";

  // --- Обчислення станів та логіки ---
  const isTemporaryRoute = params.isTemporaryRoute === true;
  const isSeasonal = params.tableType === "seasonal";

  // Визначаємо акцентний колір з урахуванням пріоритетів
  const accentColor = isSeasonal ? TEMP_COLOR : (params.numberType === "regional" ? REGIONAL_COLOR : BLACK_COLOR);
  
  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }

  const iconConfig = iconKey ? PathConfigs[iconKey] : null;
  const ribbonIcons = new Set(["cityCentre", "bridge", "interchange", "bicycleRoute"]);
  const isRibbonIcon = ribbonIcons.has(iconKey);
  const shouldHaveColoredDot = !isRibbonIcon;

  // --- Розрахунок SVG-шляхів для тексту (мемоізовано) ---
  const {
    mainTextLines,
    secondaryLine,
    fontSize1,
    fontSize2,
    waveCount,
    waveWidth,
    routeBadgeX,
  } = layout;

  const mainTextPaths = useMemo(() => {
    return mainTextLines.map((line, i) => {
      const baselineY = mainTextLines.length === 1 ? 50 - BASE_FONT_SIZE_PRIMARY / 2 : (i === 0 ? 50 - BASE_FONT_SIZE_PRIMARY / 2 : 100 - BASE_FONT_SIZE_PRIMARY / 2);
      return textToPath(roadUABold, line, fontSize1, textX, baselineY, "left", "visualX");
    });
  }, [mainTextLines, fontSize1, textX]);

  const secondaryPath = useMemo(() => {
    const baselineY = mainTextLines.length === 1 ? 75 : 125;
    return textToPath(roadUAMedium, secondaryLine, fontSize2, textX, baselineY, "left", "visualX");
  }, [secondaryLine, fontSize2, textX, mainTextLines.length]);

  const kmTextPath = useMemo(() => {
    return textToPath(roadUABold, params.distance, 23, 41.5, 50, "center", "visualX");
  }, [params.distance]);
  
  // Визначаємо конфігурацію для круглої іконки
  const circleProps = useMemo(() => {
    let config = CircleConfigs["B7"];
    if (iconKey === "bicycleRoute") config = CircleConfigs["B7bicycle"];
    else if (iconKey === "cityCentre") config = CircleConfigs["B7citycentre"];
    else if (iconKey === "interchange") config = CircleConfigs["B7interchange"];
    
    return {
      config,
      outerColor: BLACK_COLOR,
      innerColor: shouldHaveColoredDot ? accentColor : WHITE_COLOR,
      cx: 95.5,
      cy: 50,
    };
  }, [iconKey, shouldHaveColoredDot, accentColor]);

  // --- Рендер компонента ---
  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      {/* Тимчасове жовте тло */}
      {isTemporaryRoute && (
        <rect x={10} y={0} width={580} height={itemHeight} fill={TEMP_COLOR} />
      )}
      
      {/* Вертикальна лінія */}
      <rect
        x={92.5}
        y={isFirst ? 41 : 0}
        width={6}
        height={isFirst ? (layout.mainTextLines.length > 1 ? 109 : 93) : (isLast ? 59 : itemHeight)}
        fill={accentColor}
      />

      {/* Основний текст (1 або 2 рядки) */}
      {mainTextPaths.map((d, i) => <path key={i} d={d} fill={BLACK_COLOR} />)}

      {/* Другорядний текст */}
      <path d={secondaryPath} fill={BLACK_COLOR} />

      {/* Текст відстані в кілометрах */}
      <path d={kmTextPath} fill={BLACK_COLOR} />

      {/* Кругла іконка-маркер */}
      {isRibbonIcon || shouldHaveColoredDot ? (
        <CircleRenderer {...circleProps} />
      ) : null}

      {/* SVG-іконка всередині маркера */}
      {iconConfig && (
        <g transform={`translate(${iconRenderX}, ${50 - (iconConfig.height * iconConfig.scale2) / 2}) scale(${iconConfig.scale2})`}>
          <path d={iconConfig.d} fill={BLACK_COLOR} fillRule="evenodd" />
        </g>
      )}

      {/* Хвильки для водних об'єктів */}
      {params.icon === "water" && (
        <g transform={`translate(${textX}, 100)`}>
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

      {/* Бейджі з номерами маршрутів */}
      <RouteBadgeGroup
        params={{ ...params, isTemporaryRoute }}
        x={routeBadgeX}
        y={mainTextLines.length === 1 ? 12 : 37}
      />
    </g>
  );
}

export default B7Item;