import React from "react";
import RectRenderer from "./RectRenderer";
import B4Item from "./B4Item";
import B4B7Header from "../components/svg/B4B7Header";
import RectConfigs from "../config/RectConfigs";
import {
  getMinimalFontSizeAcrossB4Items,
  getAlignedTextXMap,
} from "./TextLayout";
import PathConfigs from "../config/PathConfigs";
import { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";

// === НОВА ЄДИНА ФУНКЦІЯ РОЗРАХУНКУ ЛЕЙАУТУ ===
// Ця функція тепер є єдиним джерелом правди для розрахунку позицій
function calculateB4ItemLayout(params) {
  const xPadding = 40;
  const arrow = PathConfigs.smallArrow;
  const DIAGONAL_ARROW_WIDTH = 58.4;

  const directionLayout = {
    left: { arrowX: xPadding + (arrow.height - arrow.width) / 2 },
    straight: { arrowX: xPadding },
    "straight-left": { arrowX: xPadding - 3 },
    right: { arrowX: 560 - arrow.width - (arrow.height - arrow.width) / 2},
    "straight-right": { arrowX: 560 + 3 - DIAGONAL_ARROW_WIDTH },
  };

  const layout = directionLayout[params.direction] || {};
  const arrowX = layout.arrowX ?? 0;

  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }
  const icon = iconKey && PathConfigs[iconKey];

  let textX = xPadding;
  if (["left", "straight", "straight-left"].includes(params.direction)) {
    const arrowWidthMap = {
      straight: arrow.width,
      left: arrow.height,
      "straight-left": DIAGONAL_ARROW_WIDTH,
    };
    const arrowVisualWidth = arrowWidthMap[params.direction] || 0;
    const directionCorrection = params.direction === "left" ? -7 : 0;
    textX = arrowX + arrowVisualWidth + 20 + directionCorrection;
  }

  if (icon) {
    textX += icon.width * icon.scale + 20;
  }

  const badgeGroupWidth = getRouteBadgeGroupWidth(params);

  const arrowRightSpace = ["right", "straight-right"].includes(params.direction)
    ? (params.direction === "right" ? arrow.height : DIAGONAL_ARROW_WIDTH) + 20 - 5
    : 0;

  const availableTextWidthMain = 520 - (textX - xPadding) - arrowRightSpace - badgeGroupWidth;
  const availableTextWidthSecondary = 520 - (textX - xPadding) - arrowRightSpace;

  return { textX, availableTextWidthMain, availableTextWidthSecondary };
}


// === КОМПОНЕНТ ТАБЛИЧКИ B4 З КІЛЬКОМА НАПРЯМКАМИ ===
function B4({ params }) {
  const itemCount = params.b4Items?.length || 1;
  const outerRect = RectConfigs[`B${itemCount + 3}`];
  const innerRect = RectConfigs[`strokeB${itemCount + 3}`];
  const showBlackLine = params.tableType === "temporary";
  const baseY = 200;
  const itemHeight = 150;
  const arrowOverlapOffset = -13;

  const b4ItemY = (index, hideArrow) => baseY + index * itemHeight + (hideArrow ? arrowOverlapOffset : 0);

  const renderSeparatorLines = () => {
    const lines = [];
    for (let i = 1; i < params.b4Items.length; i++) {
      if (params.b4Items[i - 1].direction !== params.b4Items[i].direction) {
        lines.push(<rect key={`line-${i}`} x={10} y={baseY + i * itemHeight - 3} width={580} height={6} fill="#000000" />);
      }
    }
    return lines;
  };

  // === ПІДГОТОВКА ЕЛЕМЕНТІВ (ТЕПЕР ВИКОРИСТОВУЄ ЄДИНУ ФУНКЦІЮ) ===
  let preparedItems = [];
  if (Array.isArray(params.b4Items)) {
    preparedItems = params.b4Items.map(item => {
      const mergedParams = { ...params, ...item };
      const layout = calculateB4ItemLayout(mergedParams); // ВИКЛИКАЄМО НОВУ ФУНКЦІЮ
      return { ...mergedParams, ...layout };
    });
  }

  const alignedTextXMap = getAlignedTextXMap(preparedItems);

  let forcedFontSize1 = null;
  if (params.forceUniformTextSize && preparedItems.length > 0) {
    const itemsWithFinalLayout = preparedItems.map((item, index) => {
      const alignedX = alignedTextXMap.get(index);
      if (alignedX) {
        // Якщо є вирівнювання, ПЕРЕРАХОВУЄМО ширину з новими даними
        const newLayout = calculateB4ItemLayout({ ...item, textX: alignedX, alignedTextX: alignedX });
        return { ...item, ...newLayout };
      }
      return item;
    });
    forcedFontSize1 = getMinimalFontSizeAcrossB4Items(itemsWithFinalLayout);
  }

  return (
    <svg width={outerRect.outerWidth} height={outerRect.outerHeight} xmlns="http://www.w3.org/2000/svg">
      <RectRenderer config={outerRect} outerColor="#FFFFFF" innerColor="#FFFFFF" x={0} y={0} />

      {preparedItems.map((itemParams, index) => {
        const prev = index > 0 ? params.b4Items[index - 1] : null;
        const hideArrow = prev && prev.direction === itemParams.direction;
        const isLast = index === params.b4Items.length - 1;
        const contentOffsetY = hideArrow ? arrowOverlapOffset : 0;

        // Передаємо фінальні параметри, включаючи вирівнювання та уніфікований шрифт
        const finalParams = {
          ...itemParams,
          hideArrow,
          ...(alignedTextXMap.has(index) && { alignedTextX: alignedTextXMap.get(index) }),
          ...(forcedFontSize1 && { forcedFontSize1 }),
        };

        return (
          <B4Item
            key={index}
            x={0}
            y={b4ItemY(index, false)}
            isLast={isLast}
            contentOffsetY={contentOffsetY}
            params={finalParams}
          />
        );
      })}

      <RectRenderer config={innerRect} outerColor="#000000" innerColor="none" x={7} y={7} />
      <B4B7Header params={params} />
      {renderSeparatorLines()}
      {showBlackLine && <rect x={10} y={197} width={580} height={6} fill="#000000" />}
    </svg>
  );
}

export default B4;