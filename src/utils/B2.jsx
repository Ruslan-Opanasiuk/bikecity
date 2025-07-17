// src/utils/B2.jsx
import React, { useMemo } from "react";
import opentype from "opentype.js";
import { textToPath } from "./textToPath";
import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import PathConfigs from "../config/PathConfigs";
import RectConfigs from "../config/RectConfigs";
import CircleConfigs from "../config/CircleConfigs";
import getColors from "../config/colorConfig.jsx";
// base64-дані Bold-файла
import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";

// Парсимо шрифт один раз
const fontBuffer = Uint8Array.from(atob(boldData), c => c.charCodeAt(0)).buffer;
const roadUABold = opentype.parse(fontBuffer);

function B2({ params }) {
  const colors = getColors(params.tableType, params.numberType, true);
  const mainConfig = RectConfigs["B1"];
  const circleConfig = CircleConfigs["E5B1"];
  const isDouble = +params.routeNumber >= 10;
  const rectConfig = isDouble ? RectConfigs["E4B1"] : RectConfigs["E3B1"];

  const scale = 74 / PathConfigs.bicycle.height;
  const xShift = mainConfig.outerWidth / 2 - (PathConfigs.bicycle.width * scale) / 2;
  const scale1 = 100 / PathConfigs.eurovelo.height;
  const xShift1 = mainConfig.outerWidth / 2 - (PathConfigs.eurovelo.width * scale1) / 2;

  // Параметри позиціювання тексту
  const fontSize = (params.numberType === "national" ? 42 : 45) / 0.7;
  const badgeCenterX = mainConfig.outerWidth / 2;
  const badgeCenterY = 160 + rectConfig.outerHeight / 2;

  const glyphPath = useMemo(
    () =>
      textToPath(
        roadUABold,
        params.routeNumber.toString(),
        fontSize,
        badgeCenterX,
        badgeCenterY,
        "center",
        "middle"
      ),
    [params.routeNumber, fontSize, badgeCenterX, badgeCenterY]
  );

  return (
    <svg
      width={mainConfig.outerWidth + 2}
      height={mainConfig.outerHeight + 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(1,1)" style={{ filter: "drop-shadow(0 0 1px black)" }}>
        {/* 1. Рамка */}
        <RectRenderer
          config={mainConfig}
          outerColor={colors.frameColor}
          innerColor={colors.backgroundColor}
          x={0}
          y={0}
        />

        {/* 2. Сірий фон (бейдж) */}
        {params.numberType !== "eurovelo" && (
          params.numberType === "national" ? (
            <CircleRenderer
              config={circleConfig}
              outerColor={colors.routeBox.frame}
              innerColor="#989898"
              cx={badgeCenterX}
              cy={160 + circleConfig.outerRadius - 4}
            />
          ) : (
            <RectRenderer
              config={rectConfig}
              outerColor={colors.routeBox.frame}
              innerColor="#989898"
              x={badgeCenterX - rectConfig.outerWidth / 2}
              y={160}
            />
          )
        )}

        {/* 3. Червона стрічка */}
        <path d={PathConfigs.stripe.d} fill="#CC0000" />

        {/* 4. Контур бейджа */}
        {params.numberType === "national" ? (
          <CircleRenderer
            config={circleConfig}
            outerColor={colors.routeBox.frame}
            innerColor="none"
            cx={badgeCenterX}
            cy={160 + circleConfig.outerRadius - 4}
          />
        ) : params.numberType === "eurovelo" ? (
          <path
            d={PathConfigs.eurovelo.d}
            fill="#F5C30D"
            transform={`translate(${xShift1}, 156) scale(${scale1})`}
          />
        ) : (
          <RectRenderer
            config={rectConfig}
            outerColor={colors.routeBox.frame}
            innerColor="none"
            x={badgeCenterX - rectConfig.outerWidth / 2}
            y={160}
          />
        )}

        {/* 5. Іконка велосипеда */}
        <path
          d={PathConfigs.bicycle.d}
          fill={colors.symbolColor}
          fillRule="evenodd"
          transform={`translate(${xShift}, 48) scale(${scale})`}
        />

        {/* 6. Текст як path */}
        <path d={glyphPath} fill={colors.routeBox.text} style={{ fontFeatureSettings: '"ss02"' }} />
      </g>
    </svg>
  );
}

export default B2;
