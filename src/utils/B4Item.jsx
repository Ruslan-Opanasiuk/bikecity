import React, { useMemo } from "react";
import opentype from "opentype.js";
import PathConfigs from "../config/PathConfigs";
import { computeTextLayout } from "./TextLayout";
import RouteBadgeGroup from "../components/svg/RouteBadgeGroup";
import { textToPath } from "../utils/textToPath";
import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";
import mediumData from "../utils/export/RoadUA-Medium.ttf.base64?raw";

const boldBuf = Uint8Array.from(atob(boldData), (c) => c.charCodeAt(0)).buffer;
const mediumBuf = Uint8Array.from(atob(mediumData), (c) => c.charCodeAt(0)).buffer;
const roadUABold = opentype.parse(boldBuf);
const roadUAMedium = opentype.parse(mediumBuf);

const BASE_FONT_SIZE_PRIMARY = 38;
const BASE_FONT_SIZE_SECONDARY = 20;
const FONT_VISUAL_HEIGHT_COEFF = 96 / 76;
const DIAGONAL_ARROW_WIDTH = 58.4;

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

  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }
  const icon = iconKey && PathConfigs[iconKey];



  const {
    textX,
    availableTextWidthMain,
    availableTextWidthSecondary,
  } = params;


  
  const arrow = PathConfigs.smallArrow;
  const directionLayout = {
    left: { rotation: -90, arrowX: 40 + (arrow.height - arrow.width) / 2 },
    straight: { rotation: 0, arrowX: 40 },
    "straight-left": { rotation: -45, arrowX: 40 - 3 },
    right: { rotation: 90, arrowX: 560 - arrow.width - (arrow.height - arrow.width) / 2 },
    "straight-right": { rotation: 45, arrowX: 560 + 3 - DIAGONAL_ARROW_WIDTH },
  };

  const layout = directionLayout[params.direction] || {};
  const rotation = layout.rotation || 0;
  const arrowX = layout.arrowX ?? 0;
  const arrowY = 75 - arrow.height / 2;
  const iconX = 40 + (
  ["left", "straight", "straight-left"].includes(params.direction) 
    ? (layout.arrowX - 40) + 
      ({
        straight: arrow.width, 
        left: arrow.height, 
        "straight-left": DIAGONAL_ARROW_WIDTH
      }[params.direction] || 0) + 
      20 + (params.direction === "left" ? -7 : 0) // <--- РЕМАРКА ТУТ
    : 0
);



  // === РОЗРАХУНОК ТЕКСТОВОГО ЛЕЯУТУ ===
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
    ...params, // Передаємо всі параметри, включаючи вже розраховані
  });

  // === Генерація SVG Path для тексту (без змін) ===
  const mainTextPaths = useMemo(() => {
    return mainTextLines.map((line, i) => {
      const baselineY = mainTextLines.length === 1 ? 35 + BASE_FONT_SIZE_PRIMARY / 2 - applyYShift : i === 0 ? 35 : 75;
      return textToPath(roadUABold, line, fontSize1, textX, baselineY, "left", "visualX");
    });
  }, [mainTextLines.join("|"), fontSize1, textX, applyYShift]);

  const secondaryPath = useMemo(() => {
    const baselineY = mainTextLines.length === 1 ? 115 - BASE_FONT_SIZE_SECONDARY * 0.5 - BASE_FONT_SIZE_SECONDARY * (FONT_VISUAL_HEIGHT_COEFF - 1) - applyYShift : 115;
    return textToPath(roadUAMedium, secondaryLine, fontSize2, textX, baselineY, "left", "visualX");
  }, [secondaryLine, fontSize2, textX, mainTextLines.length, applyYShift]);

  // === РЕНДЕР SVG (без змін) ===
  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      {shouldShowTemporaryBg && (isLast ? <path d={PathConfigs.temporaryRouteFooterBg.d} fill="#F5C30D" fillRule="evenodd" /> : <rect x={10} y={0} width={580} height={150} fill="#F5C30D" />)}
      <g transform={`translate(0, ${contentOffsetY})`}>
        {isEndRoute && <g transform={`translate(${params.b4Items?.length === 1 ? 31 : 0}, ${params.b4Items?.length === 1 ? -10 : 0})`}><path d={PathConfigs.stripeBig.d} fill="#CC0000" fillRule="evenodd" /></g>}
        {mainTextPaths.map((d, i) => (<path key={i} d={d} fill="black" style={{ fontFeatureSettings: '"ss02"' }} />))}
        <path d={secondaryPath} fill="black" style={{ fontFeatureSettings: '"ss02"' }} />
        {params.direction !== "end" && !params.hideArrow && (
          <g transform={`translate(${arrowX}, ${arrowY}) rotate(${rotation} ${arrow.width / 2} ${arrow.height / 2}) scale(${arrow.scale})`}>
            <path d={arrow.d} fill="black" />
          </g>
        )}
        {icon && (
          <g transform={`translate(${iconX}, ${75 - (icon.height * icon.scale) / 2}) scale(${icon.scale})`}>
            <path d={icon.d} fill="#000" fillRule="evenodd" />
          </g>
        )}
        {params.icon === "water" && (
          <g transform={`translate(${textX}, 108)`}>
            {Array.from({ length: waveCount }).map((_, i) => (
              <path key={i} d={PathConfigs.waves.d} transform={`translate(${i * waveWidth}, 0) scale(${PathConfigs.waves.scale})`} fill="#005187" />
            ))}
          </g>
        )}
        <RouteBadgeGroup
          params={{ ...params, isTerminus: isEndRoute, isTemporaryRoute: shouldShowTemporaryBg }}
          x={routeBadgeX}
          y={35}
        />
      </g>
    </g>
  );
}

export default B4Item;