// src/utils/B1.jsx
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



function B1({ params }) {

  const colors = getColors(params.tableType, params.numberType);
  const mainConfig = RectConfigs["B1"];
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

  const scale1 = 100 / PathConfigs.eurovelo.height;
  const xShift1 = mainConfig.outerWidth / 2 - (PathConfigs.eurovelo.width * scale1) / 2;

  // Параметри тексту та точки відліку
  const fontSize = (params.numberType === "national" ? 42 : 45) / 0.7;
  const blockLeftX = mainConfig.outerWidth / 2;
  const blockCenterY = 46 + rectConfig.outerHeight / 2;
  
  // Генеруємо path через утиліту textToPath
  const glyphPath = useMemo(
    
    () =>
      textToPath(
        roadUABold,
        params.routeNumber.toString(),
        fontSize,
        blockLeftX,
        blockCenterY,
        "center",   // вирівнювання від лівого краю
        "middle"  // вирівнювання по центру гліфа вертикально
      ),
    [params.routeNumber, fontSize, blockLeftX, blockCenterY]
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

        {/* 2. Блок з номером */}
        {params.numberType === "national" ? (
          <CircleRenderer
            config={circleConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            cx={mainConfig.outerWidth / 2}
            cy={46 + circleConfig.outerRadius - 4}
          />
        ) : params.numberType === "eurovelo" ? (
          <path
            d={PathConfigs.eurovelo.d}
            fill={colors.routeBox.background}
            transform={`
              translate(${xShift1}, 42)
              scale(${scale1})
            `}
          />
        ) : (
          <RectRenderer
            config={rectConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            x={blockLeftX - rectConfig.outerWidth/2}
            y={46}
          />
        )}

        {/* 3. Номер маршруту як path */}
        <path 
          d={glyphPath} 
          fill={colors.routeBox.text} />

        {/* 4. Стрілка напрямку */}
        <g
          transform={`
            translate(${xShift}, 160)
            rotate(${rotation} ${
            (PathConfigs.bigArrow.width * scale) / 2
          } ${(PathConfigs.bigArrow.height * scale) / 2})
            scale(${scale})
          `}
        >
          <path d={PathConfigs.bigArrow.d} fill={colors.symbolColor} />
        </g>
      </g>
    </svg>
  );
}

export default B1;
