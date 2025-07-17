// src/utils/B3.jsx
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

function B3({ params }) {
  const colors = getColors(params.tableType, params.numberType);
  const mainConfig = RectConfigs["B3"];
  const circleConfig = CircleConfigs["E5B1"];
  const isDouble = +params.routeNumber >= 10;
  const rectConfig = isDouble ? RectConfigs["E4B1"] : RectConfigs["E3B1"];

  const rotationMap = {
    straight: 0,
    right: 90,
    left: -90,
    "straight-right": 45,
    "straight-left": -45,
  };
  const rotation = rotationMap[params.direction];

  const scale = 105 / PathConfigs.bigArrow.height;
  const xShift = mainConfig.outerWidth / 2 - (PathConfigs.bigArrow.width * scale) / 2;

  const scale1 = 74 / PathConfigs.bicycle.height;
  const xShift1 = mainConfig.outerWidth / 2 - (PathConfigs.bicycle.width * scale1) / 2;

  const scale2 = 100 / PathConfigs.eurovelo.height;
  const xShift2 = mainConfig.outerWidth / 2 - (PathConfigs.eurovelo.width * scale2) / 2;

  // Текст як path
  const fontSize = (params.numberType === "national" ? 42 : 45) / 0.7;
  const badgeX = mainConfig.outerWidth / 2;
  const badgeY = 144 + rectConfig.outerHeight / 2;

  const glyphPath = useMemo(
    () =>
      textToPath(
        roadUABold,
        params.routeNumber.toString(),
        fontSize,
        badgeX,
        badgeY,
        "center",
        "middle"
      ),
    [params.routeNumber, fontSize, badgeX, badgeY]
  );

  return (
    <svg
      width={mainConfig.outerWidth}
      height={mainConfig.outerHeight}
      xmlns="http://www.w3.org/2000/svg"
    >
        {/* 5.1 Рамка */}
        <RectRenderer
          config={mainConfig}
          outerColor={colors.frameColor}
          innerColor={colors.backgroundColor}
          x={0}
          y={0}
        />

        {/* 5.2 Бейдж */}
        {params.numberType === "national" ? (
          <CircleRenderer
            config={circleConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            cx={mainConfig.outerWidth / 2}
            cy={144 + circleConfig.outerRadius - 4}
          />
        ) : params.numberType === "eurovelo" ? (
          <path
            d={PathConfigs.eurovelo.d}
            fill={colors.routeBox.background}
            transform={`translate(${xShift2}, 140) scale(${scale2})`}
          />
        ) : (
          <RectRenderer
            config={rectConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            x={mainConfig.outerWidth / 2 - rectConfig.outerWidth / 2}
            y={144}
          />
        )}

        {/* 5.3 Номер як path */}
        <path d={glyphPath} fill={colors.routeBox.text} style={{ fontFeatureSettings: '"ss02"' }} />

        {/* 5.4 Іконка велосипеда */}
        <path
          d={PathConfigs.bicycle.d}
          fill={colors.symbolColor}
          fillRule="evenodd"
          transform={`translate(${xShift1}, 46) scale(${scale1})`}
        />

        {/* 5.5 Стрілка напрямку */}
        <g
          transform={`
            translate(${xShift}, 260)
            rotate(${rotation} ${PathConfigs.bigArrow.width * scale / 2} ${PathConfigs.bigArrow.height * scale / 2})
            scale(${scale})
          `}
        >
          <path d={PathConfigs.bigArrow.d} fill={colors.symbolColor} />
        </g>
    </svg>
  );
}

export default B3;
