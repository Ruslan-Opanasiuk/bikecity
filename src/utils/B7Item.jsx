import React, { useMemo } from "react";
import opentype from "opentype.js";

import PathConfigs from "../config/PathConfigs";
import RouteBadgeGroup from "../components/svg/RouteBadgeGroup";
import { textToPath } from "../utils/textToPath";
import CircleRenderer from "./CircleRenderer";
import CircleConfigs from "../config/CircleConfigs";
import MultiColorPathConfigs from "../config/MultiColorPathConfigs"; // Імпорт конфігурацій
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
  iconRenderX,
  temporaryStatus
}) {
  // --- Кольори та константи ---
  const TEMP_COLOR = "#F5C30D";    // Жовтий для сезонних
  const REGIONAL_COLOR = "#D42E12"; // Червоний для регіональних
  const BLACK_COLOR = "#000000";   // Чорний за замовчуванням
  const WHITE_COLOR = "#FFFFFF";

  // --- Обчислення станів та логіки ---
  const isTemporaryRoute = params.isTemporaryRoute === true;
  const temporaryOffset = params.isTemporaryRoute === true ? 63 : 0;
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

  const iconBaseY = (isTemporaryRoute && mainTextLines.length > 1) ? 75 : (isTemporaryRoute && params.icon === 'water' ? 67 : 50);

    const kmTextPath = useMemo(() => {
    return textToPath(roadUABold, 
      params.distance, 
      23, 
      41.5, 
      isTemporaryRoute ? iconBaseY : 50, 
      "center", 
      "visualX");
  }, [params.distance, isTemporaryRoute, iconBaseY]);
  
  // Визначаємо конфігурацію для круглої іконки
    const circleProps = useMemo(() => {
      let config = CircleConfigs["B7"];
      if (iconKey === "bicycleRoute") config = CircleConfigs["B7bicycle"];
      else if (iconKey === "cityCentre") config = CircleConfigs["B7citycentre"];
      else if (iconKey === "interchange") config = CircleConfigs["B7interchange"];
      
      // --- ЗМІНА ТУТ ---
      const isSpecialTempCase = params.isTemporaryRoute && (iconKey === 'cityCentre' || iconKey === 'interchange');
      const finalInnerColor = isSpecialTempCase 
        ? TEMP_COLOR 
        : (shouldHaveColoredDot ? accentColor : WHITE_COLOR);

      return {
        config,
        outerColor: BLACK_COLOR,
        innerColor: finalInnerColor, // Використовуємо нову змінну
        cx: 95.5 + temporaryOffset,
        cy: iconBaseY,
      };
    }, [iconKey, shouldHaveColoredDot, accentColor, temporaryOffset, params.isTemporaryRoute, mainTextLines.length, params.icon]);


    const MultiColorSignPreview = ({ config, size = 45 }) => (
      <svg width={size} height={size} viewBox={config.viewBox}>
        {config.paths.map((path, index) => (
          <path key={index} d={path.d} fill={path.color} transform={path.transform || ''} fillRule={path.fillRule || 'nonzero'}/>
        ))}
      </svg>
    );

    // B7Item.js


  const TempRoutePaths = {
    diagonalUp: 'M 95.5 0 Q 158.5 0, 158.5 75',   // Дуга знизу вгору
    diagonalDown: 'M 95.5 150 Q 158.5 150, 158.5 75', // Дуга зверху вниз
    lineFull: 'M 158.5 0 V 150',                     // Повна вертикальна лінія
    lineHalfDown: 'M 158.5 0 V 75',                 // Лінія зверху до центру
    lineHalfUp: 'M 158.5 75 V 150',                  // Лінія з центру донизу
  };

  // --- Рендер компонента ---
  return (
    <g transform={transform || `translate(${x}, ${y})`}>

      {/* === НОВА ЛОГІКА ДЛЯ ВЕРТИКАЛЬНОЇ ЛІНІЇ (НЕ ТИМЧАСОВІ) === */}
      {!isTemporaryRoute && (
        <>
          {/* Перший елемент: лінія від центру до низу */}
          {isFirst && (
            <path
              d={`M 95.5 ${itemHeight / 2-9} V ${itemHeight+9}`}
              stroke={accentColor}
              strokeWidth="6"
            />
          )}
          {/* Останній елемент: лінія зверху до центру */}
          {isLast && (
            <path
              d={`M 95.5 0 V ${59}`}
              stroke={accentColor}
              strokeWidth="6"
            />
          )}
          {/* Середній елемент: повна лінія */}
          {!isFirst && !isLast && (
            <path
              d={`M 95.5 0 V ${itemHeight}`}
              stroke={accentColor}
              strokeWidth="6"
            />
          )}
        </>
      )}


      {/* <rect x={0} y={iconBaseY-0.5} width={600} height={1} fill={"black"} />
      <rect x={158} y={0} width={1} height={150} fill={"black"} />
      <rect x={95} y={0} width={1} height={150} fill={"black"} /> */}

      {/* Основний текст (1 або 2 рядки) */}
      {mainTextPaths.map((d, i) => <path key={i} d={d} fill={BLACK_COLOR} />)}

      {/* Другорядний текст */}
      <path d={secondaryPath} fill={BLACK_COLOR} />

      {/* Текст відстані в кілометрах */}
      <path d={kmTextPath} fill={BLACK_COLOR} />


      {temporaryStatus && (() => {
        // Розраховуємо вертикальний зсув на основі різниці висот
        const yOffset = (itemHeight - 150) / 2;
        
        return (
          <g 
            transform={`translate(0, ${yOffset})`} 
            fill="none" 
            stroke={accentColor} 
            strokeWidth="6" 
            strokeLinecap="round"
          >
            
            {/* --- ДОДАНО НОВУ ЛІНІЮ --- */}
           <path
              d='M 95.5 0 V 150'
              strokeDasharray="15 10"
              strokeLinecap="butt"
            />
            {/* Логіка для дуг та суцільних ліній залишається */}
            {temporaryStatus === 'standalone' && (
              <>
                <path d={TempRoutePaths.diagonalUp} />
                <path d={TempRoutePaths.diagonalDown} />
              </>
            )}
            {temporaryStatus === 'start' && (
              <>
                <path d={TempRoutePaths.diagonalUp} />
                <path d={TempRoutePaths.lineHalfUp} />
              </>
            )}
            {temporaryStatus === 'middle' && (
              <path d={TempRoutePaths.lineFull} />
            )}
            {temporaryStatus === 'end' && (
              <>
                <path d={TempRoutePaths.lineHalfDown} />
                <path d={TempRoutePaths.diagonalDown} />
              </>
            )}
          </g>
        );
      })()}


      {/* Кругла іконка-маркер (не малюємо для мостів) */}
      {(isRibbonIcon || shouldHaveColoredDot) && iconKey !== 'bridge' ? (
        <CircleRenderer {...circleProps} />
      ) : null}

      {/* SVG-іконка всередині маркера */}
      {iconConfig && (
        <g transform={`translate(${iconRenderX}, ${iconBaseY - (iconConfig.height * iconConfig.scale2) / 2}) scale(${iconConfig.scale2})`}>
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

    {/* === НОВИЙ БЛОК ДЛЯ ПОПЕРЕДЖУВАЛЬНИХ ЗНАКІВ === */}
    {params.warningSignType && MultiColorPathConfigs[params.warningSignType] && (
      <g transform={`translate(73, ${iconBaseY-22.5})`}>
        <MultiColorSignPreview 
          config={MultiColorPathConfigs[params.warningSignType]}
          size={45}
          
        />
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