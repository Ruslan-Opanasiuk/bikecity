import React, { useMemo } from "react";
import opentype from "opentype.js";

import PathConfigs from "../config/PathConfigs";
import { computeB4TextLayout } from "./B4TextLayout";
import RouteBadgeGroup from "../components/svg/RouteBadgeGroup";
import { textToPath } from "../utils/textToPath";

import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";
import mediumData from "../utils/export/RoadUA-Medium.ttf.base64?raw";

// === [0] Завантаження шрифтів ===
const boldBuf = Uint8Array.from(atob(boldData), (c) => c.charCodeAt(0)).buffer;
const mediumBuf = Uint8Array.from(atob(mediumData), (c) => c.charCodeAt(0)).buffer;

const roadUABold = opentype.parse(boldBuf);
const roadUAMedium = opentype.parse(mediumBuf);

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
  const shouldShowTemporaryBg = params.isTemporaryRoute === true;
  const isEndRoute = params.direction === "end" && index === 0;
  const TEMP_COLOR = "#F5C30D";

  // === [1] Іконка ===
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

  // === [2] Стрілка та іконка: положення ===
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
  const rotation = layout.rotation || 0;
  const arrowX = layout.arrowX || 0;
  const iconX = layout.iconX || xPadding;
  const arrowY = 75 - arrow.height / 2;

  // === [3] Текст та бейджі ===
  const {
    mainTextLines,
    secondaryLine,
    fontSize1,
    fontSize2,
    textX,
    applyYShift,
    waveCount,
    waveWidth,
    routeBadgeX,
  } = computeB4TextLayout({
    ...params,
    forcedFontSize1: params.forcedFontSize1 || null,
    alignedTextX: params.alignedTextX || null,
  });

  // === [4] Основний текст (2 рядки або 1) ===
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

  // === [5] Другорядний текст (залежить від кількості рядків в основному) ===
  const secondaryPath = useMemo(() => {
    const baselineY =
      mainTextLines.length === 1
        ? 115 -
          BASE_FONT_SIZE_SECONDARY * 0.5 -
          (BASE_FONT_SIZE_SECONDARY * (FONT_VISUAL_HEIGHT_COEFF - 1)) -
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

  // === [6] Рендер ===
  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      {/* <rect x={40} y={35} width={520} height={80} fill={TEMP_COLOR} /> */}
      {/* 🟡 Тимчасовий жовтий фон — НЕ піднімається */}
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

      {/* Контент, що піднімається (стрілка, текст, бейдж, іконка) */}
      <g transform={`translate(0, ${contentOffsetY})`}>
        {/* 🔴 Кінець маршруту — червона смуга */}
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

        {/* 🖋 Основний текст */}
        {mainTextPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="black"
            style={{ fontFeatureSettings: '"ss02"' }}
          />
        ))}

        {/* 🌐 Англійський текст */}
        <path
          d={secondaryPath}
          fill="black"
          style={{ fontFeatureSettings: '"ss02"' }}
        />

        {/* ➤ Стрілка */}
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

        {/* 🧭 Іконка */}
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

        {/* 🌊 Хвильки */}
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

        {/* 🏷️ Бейджі */}
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
