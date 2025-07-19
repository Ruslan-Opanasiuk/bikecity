import React, { useMemo } from "react";
import opentype from "opentype.js";

import PathConfigs from "../config/PathConfigs";
import RouteBadgeGroup from "../components/svg/RouteBadgeGroup";
import { textToPath } from "../utils/textToPath";
import CircleRenderer from "./CircleRenderer";
import CircleConfigs from "../config/CircleConfigs";
import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";
import mediumData from "../utils/export/RoadUA-Medium.ttf.base64?raw";

// === [0] КОНСТАНТИ ТА ЗАВАНТАЖЕННЯ ШРИФТІВ ===
const BASE_FONT_SIZE_PRIMARY = 38;

const boldBuf = Uint8Array.from(atob(boldData), (c) => c.charCodeAt(0)).buffer;
const mediumBuf = Uint8Array.from(atob(mediumData), (c) => c.charCodeAt(0)).buffer;
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
  index,
  itemHeight,     // ← приймаємо!
  layout,         // ← приймаємо!
  textX,
  iconRenderX
}) {
  const isTemporaryRoute = params.isTemporaryRoute === true;
  const TEMP_COLOR = "#F5C30D";

  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }
  const isVeloRoute = iconKey === "bicycleRoute";
  const iconConfig = iconKey ? PathConfigs[iconKey] : null;

  const ribbonIcons = new Set(["cityCentre", "bridge", "interchange", "bicycleRoute"]);
  const isRibbonIcon = ribbonIcons.has(iconKey);
  const useDefaultCircleIcon = !isRibbonIcon;



  // ==== Використовуємо готовий layout ====
  const {
    mainTextLines,
    secondaryLine,
    fontSize1,
    fontSize2,
    applyYShift,
    waveCount,
    waveWidth,
    routeBadgeX,
  } = layout;

  // === [3] ГЕНЕРАЦІЯ ОСНОВНОГО ТЕКСТУ (верхній/верхні рядки) ===
  const mainTextPaths = useMemo(() => {
    return mainTextLines.map((line, i) => {
      const baselineY =
        mainTextLines.length === 1
          ? 50 - BASE_FONT_SIZE_PRIMARY / 2
          : i === 0
          ? 50 - BASE_FONT_SIZE_PRIMARY / 2
          : 100 - BASE_FONT_SIZE_PRIMARY / 2;
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

  const secondaryPath = useMemo(() => {
    const baselineY = mainTextLines.length === 1 ? 75 : 125;
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

  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      {/* [5.1] Тимчасове жовте тло */}
      {isTemporaryRoute && (
        <rect x={10} y={0} width={580} height={itemHeight} fill={TEMP_COLOR} />
      )}
      
      {/* {mainTextLines.length === 1 ? (
        <rect x={91} y={0} width={481} height={100} fill="green" />
      ) : (
        <rect x={91} y={0} width={481} height={150} fill="gray" />
      )}

      <rect x={0} y={0} width={91} height={100} fill="yellow" /> */}

      {/* [5.2] Вертикальна лінія */}
      <rect
        x={47.5}
        y={isFirst ? 50 : 0}
        width={6}
        height={
          isFirst
            ? // Якщо перший і два рядки — з 50, довжина 100
              layout.mainTextLines.length > 1
                ? 100
                : 50
            : isLast
            ? 50
            : itemHeight
        }
        fill={isSeasonal ? TEMP_COLOR : "#000000"}
      />


      {/* [5.3] Основний текст (1 або 2 рядки) */}
      {mainTextPaths.map((d, i) => (
        <path key={i} d={d} fill="black" />
      ))}

      {/* [5.4] Другорядний текст */}
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

      {/* [5.6] SVG-іконка */}
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
      {/* {params.icon === "water" && (
        <g transform={`translate(${textX}, ${125 - PathConfigs.waves.height * PathConfigs.waves.scale / 2})`}>
          {Array.from({ length: waveCount }).map((_, i) => (
            <path
              key={i}
              d={PathConfigs.waves.d}
              transform={`translate(${i * waveWidth}, 0) scale(${PathConfigs.waves.scale})`}
              fill="#005187"
            />
          ))}
        </g>
      )} */}

      {/* [5.9] Бейджі маршрутів (номери, типи тощо) */}
      <RouteBadgeGroup
        params={{
          ...params,
          isTemporaryRoute,
        }}
        x={routeBadgeX}
        y={mainTextLines.length === 1 ? 12 : 37}
      />
    </g>
  );
}

export default B7Item;
