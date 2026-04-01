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
  const BLACK_COLOR = "#000000";    // Чорний за замовчуванням
  const WHITE_COLOR = "#FFFFFF";

  // --- Обчислення станів та логіки ---
  const isTemporaryRoute = params.isTemporaryRoute === true;
  const temporaryOffset = isTemporaryRoute ? 63 : 0;
  const isSeasonal = params.tableType === "seasonal";

  // Визначаємо акцентний колір з урахуванням пріоритетів
  const accentColor = isSeasonal ? TEMP_COLOR : (params.numberType === "regional" ? REGIONAL_COLOR : BLACK_COLOR);

  // Мапінг спеціального кейсу: "streetNetwork" у центр міста
  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }

  const iconConfig = iconKey ? PathConfigs[iconKey] : null;

  // Логіка для одночасного відображення мішені на лінії та іконки праворуч для населених пунктів
  const isEffectivelyCityCentre = iconKey === "cityCentre" || (iconKey === "settlement" && params.isUrbanCenter);

  /**
   * Іконки, які РЕНДЕРЯТЬСЯ НА СТРІЧЦІ (на вертикалі, на лінії x≈95.5)
   * Тобто саме вони можуть "замінити" виколоте кільце.
   * ВАЖЛИВО: bicycleRoute тут ВИКЛЮЧЕНО — бо це не “інша” піктограма.
   */
  const ribbonOnLineIcons = new Set(["cityCentre", "interchange", "bridge"]);

  /**
   * Іконки, для яких ми взагалі показуємо круглий маркер (стрічку).
   * Міст ("bridge") окремо обробляємо — без будь-якого маркера.
   */
  const ribbonCircleIcons = new Set(["cityCentre", "interchange", "bicycleRoute"]);

  // Чи показувати кольорову "крапку" (внутрішнє заповнення) замість вибивки/кільця
  // Якщо це ефективно мішень (cityCentre або settlement + isUrbanCenter), крапку не малюємо
  const shouldHaveColoredDot = iconKey ? (!ribbonCircleIcons.has(iconKey) && !isEffectivelyCityCentre) : true;

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
      const baselineY =
        mainTextLines.length === 1
          ? 50 - BASE_FONT_SIZE_PRIMARY / 2
          : (i === 0
              ? 50 - BASE_FONT_SIZE_PRIMARY / 2
              : 100 - BASE_FONT_SIZE_PRIMARY / 2);
      return textToPath(roadUABold, line, fontSize1, textX, baselineY, "left", "visualX");
    });
  }, [mainTextLines, fontSize1, textX]);

  const secondaryPath = useMemo(() => {
    const baselineY = mainTextLines.length === 1 ? 75 : 125;
    return textToPath(roadUAMedium, secondaryLine, fontSize2, textX, baselineY, "left", "visualX");
  }, [secondaryLine, fontSize2, textX, mainTextLines.length]);

  const iconBaseY = (isTemporaryRoute && mainTextLines.length > 1)
    ? 75
    : (isTemporaryRoute && params.icon === "water" ? 67 : 50);

  const kmTextPath = useMemo(() => {
    return textToPath(
      roadUABold,
      params.distance,
      23,
      41.5,
      isTemporaryRoute ? iconBaseY : 50,
      "center",
      "visualX"
    );
  }, [params.distance, isTemporaryRoute, iconBaseY]);

  // --- ЛОГІКА ВИКОЛОТОГО КІЛЬЦЯ (fixed) ---
  const hasExtraBikeRoute = Boolean(params.showExtraRoute1 || params.showExtraRoute2);
  const intersectsBike = iconKey === "bicycleRoute" || hasExtraBikeRoute;

  // якщо є перетин з веломаршрутом — показуємо виколоте кільце,
  // ОКРІМ випадку, коли є інша піктограма, що розташовується на стрічці (або це ефективно мішень)
  const wantsBicycleRing = intersectsBike && !(iconKey && (ribbonOnLineIcons.has(iconKey) || isEffectivelyCityCentre));

  const circleProps = useMemo(() => {
    let config = CircleConfigs["B7"];
    if (wantsBicycleRing) {
      config = CircleConfigs["B7bicycle"]; // «дірчасте» кільце
    } else if (isEffectivelyCityCentre) { // Використовуємо нову умову
      config = CircleConfigs["B7citycentre"];
    } else if (iconKey === "interchange") {
      config = CircleConfigs["B7interchange"];
    }

    // Додаємо isEffectivelyCityCentre в умову для тимчасових маршрутів
    const isSpecialTempCase =
      isTemporaryRoute && (isEffectivelyCityCentre || iconKey === "interchange");

    const finalInnerColor = isSpecialTempCase
      ? TEMP_COLOR
      : (wantsBicycleRing
          ? WHITE_COLOR // для кільця – вибивка всередині
          : (shouldHaveColoredDot ? accentColor : WHITE_COLOR)); // білий для мішені

    return {
      config,
      outerColor: BLACK_COLOR,
      innerColor: finalInnerColor,
      cx: 95.5 + temporaryOffset,
      cy: iconBaseY,
    };
  }, [
    iconKey,
    shouldHaveColoredDot,
    accentColor,
    temporaryOffset,
    isTemporaryRoute,
    wantsBicycleRing,
    iconBaseY,
    isEffectivelyCityCentre, // Залежність
  ]);

  const MultiColorSignPreview = ({ config, size = 45 }) => (
    <svg width={size} height={size} viewBox={config.viewBox}>
      {config.paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          fill={path.color}
          transform={path.transform || ""}
          fillRule={path.fillRule || "nonzero"}
        />
      ))}
    </svg>
  );

  const TempRoutePaths = {
    diagonalUp: "M 95.5 0 Q 158.5 0, 158.5 75",       // Дуга знизу вгору
    diagonalDown: "M 95.5 150 Q 158.5 150, 158.5 75", // Дуга зверху вниз
    lineFull: "M 158.5 0 V 150",                      // Повна вертикальна лінія
    lineHalfDown: "M 158.5 0 V 75",                   // Лінія зверху до центру
    lineHalfUp: "M 158.5 75 V 150",                   // Лінія з центру донизу
  };

  // --- Рендер компонента ---
  return (
    <g transform={transform || `translate(${x}, ${y})`}>

      {/* === ВЕРТИКАЛЬНА ЛІНІЯ ДЛЯ НЕ ТИМЧАСОВИХ === */}
      {!isTemporaryRoute && (
        <>
          {isFirst && (
            <path
              d={`M 95.5 ${50 - 9} V ${itemHeight + 9}`}
              stroke={accentColor}
              strokeWidth="6"
            />
          )}
          {isLast && (
            <path
              d={`M 95.5 0 V 59`}
              stroke={accentColor}
              strokeWidth="6"
            />
          )}
          {!isFirst && !isLast && (
            <path
              d={`M 95.5 0 V ${itemHeight}`}
              stroke={accentColor}
              strokeWidth="6"
            />
          )}
        </>
      )}

      {/* Основний текст (1 або 2 рядки) */}
      {mainTextPaths.map((d, i) => <path key={i} d={d} fill={BLACK_COLOR} />)}

      {/* Другорядний текст */}
      <path d={secondaryPath} fill={BLACK_COLOR} />

      {/* Текст відстані в кілометрах */}
      <path d={kmTextPath} fill={BLACK_COLOR} />

      {/* === ТИМЧАСОВИЙ МАРШРУТ (штрихи) === */}
      {temporaryStatus && (() => {
        const yOffset = (itemHeight - 150) / 2;
        return (
          <g
            transform={`translate(0, ${yOffset})`}
            fill="none"
            stroke={accentColor}
            strokeWidth="6"
            strokeLinecap="round"
          >
            <path
              d="M 95.5 0 V 150"
              strokeDasharray="15 10"
              strokeLinecap="butt"
            />
            {temporaryStatus === "standalone" && (
              <>
                <path d={TempRoutePaths.diagonalUp} />
                <path d={TempRoutePaths.diagonalDown} />
              </>
            )}
            {temporaryStatus === "start" && (
              <>
                <path d={TempRoutePaths.diagonalUp} />
                <path d={TempRoutePaths.lineHalfUp} />
              </>
            )}
            {temporaryStatus === "middle" && (
              <path d={TempRoutePaths.lineFull} />
            )}
            {temporaryStatus === "end" && (
              <>
                <path d={TempRoutePaths.lineHalfDown} />
                <path d={TempRoutePaths.diagonalDown} />
              </>
            )}
          </g>
        );
      })()}

      {/* Кругла іконка-маркер (міст не малюємо) */}
      {/* Використовуємо isEffectivelyCityCentre для відображення мішені */}
      {( (iconKey && iconKey !== "bridge" && ribbonCircleIcons.has(iconKey)) || shouldHaveColoredDot || isEffectivelyCityCentre ) ? (
        iconKey === "bridge" ? null : <CircleRenderer {...circleProps} />
      ) : null}

      {/* ДОДАТКОВА КРАПКА МІШЕНІ ДЛЯ НАСЕЛЕНОГО ПУНКТУ + ЦЕНТР */}
      {params.icon === "settlement" && params.isUrbanCenter && (() => {
        const ccConfig = PathConfigs["cityCentre"];
        const ccX = 95.5 - (ccConfig.width * ccConfig.scale2) / 2 + temporaryOffset;
        return (
          <g
            transform={`translate(${ccX}, ${
              iconBaseY - (ccConfig.height * ccConfig.scale2) / 2
            }) scale(${ccConfig.scale2})`}
          >
            <path d={ccConfig.d} fill={BLACK_COLOR} fillRule="evenodd" />
          </g>
        );
      })()}

      {/* SVG-іконка всередині маркера (або праворуч для settlement) */}
      {iconConfig && (
        <g
          transform={`translate(${iconRenderX}, ${
            iconBaseY - (iconConfig.height * iconConfig.scale2) / 2
          }) scale(${iconConfig.scale2})`}
        >
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

      {/* Попереджувальні знаки (багатокольорові) */}
      {params.warningSignType && MultiColorPathConfigs[params.warningSignType] && (
        <g transform={`translate(73, ${iconBaseY - 22.5})`}>
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