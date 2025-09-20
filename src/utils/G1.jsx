import React, { useMemo } from "react";
import opentype from "opentype.js";
import { textToPath } from "./textToPath";
import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import RectConfigs from "../config/RectConfigs";
import CircleConfigs from "../config/CircleConfigs";

// Завантажуємо та парсимо шрифт один раз для оптимізації
import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";
const fontBuffer = Uint8Array.from(atob(boldData), c => c.charCodeAt(0)).buffer;
const roadUABold = opentype.parse(fontBuffer);

function G1({ params }) {
  // --- 1. Визначення кольорів залежно від типу маршруту ---
  const { numberType = 'national', routeNumber = '' } = params;
  let colors;

  switch (numberType) {
    case 'local':
      colors = {
        frame: '#0075ed',
        background: '#0075ed',
        text: '#FFFFFF',
      };
      break;
    case 'regional':
      colors = {
        frame: '#fa0000',
        background: '#fa0000',
        text: '#FFFFFF',
      };
      break;
    case 'national':
      colors = {
        frame: '#fec100',
        background: '#fec100',
        text: '#333333',
      };
      break;
    case 'temporary':
      colors = {
        frame: '#fec100',
        background: '#808080',
        text: '#fec100',
      };
      break;
    default:
      colors = { frame: '#0075ed', background: '#0075ed', text: '#FFFFFF' };
  }

  // --- 2. Визначення форми та конфігурації знака ---
  const isNational = numberType === 'national';
  const isDoubleDigit = String(routeNumber).length > 1;

  const mainConfig = isNational
    ? CircleConfigs.G1
    : isDoubleDigit
    ? RectConfigs.longG1
    : RectConfigs.shortG1;

  const width = isNational ? mainConfig.outerRadius * 2 : mainConfig.outerWidth;
  const height = isNational ? mainConfig.outerRadius * 2 : mainConfig.outerHeight;
  
  // --- 3. Розрахунок параметрів тексту ---
  // ЗМІНА ТУТ: Розмір шрифту тепер залежить від типу маршруту
  const fontSize = isNational ? (326 / 0.7) : (350 / 0.7);
  const textX = width / 2;
  const textY = height / 2;
  
  // Генеруємо SVG-контур для тексту
  const glyphPath = useMemo(
    () =>
      textToPath(
        roadUABold,
        String(routeNumber),
        fontSize,
        textX,
        textY,
        "center",
        "middle"
      ),
    [routeNumber, fontSize, textX, textY]
  );

  // --- 4. Рендер SVG ---
  return (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {isNational ? (
        <CircleRenderer
          config={mainConfig}
          outerColor={colors.frame}
          innerColor={colors.background}
          cx={textX}
          cy={textY}
        />
      ) : (
        <RectRenderer
          config={mainConfig}
          outerColor={colors.frame}
          innerColor={colors.background}
          x={0}
          y={0}
        />
      )}
      <path 
        d={glyphPath} 
        fill={colors.text} 
      />
    </svg>
  );
}

export default G1;