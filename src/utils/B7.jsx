import React, { useMemo } from "react";
import opentype from "opentype.js";

import { textToPath } from "../utils/textToPath";
import RectRenderer from "./RectRenderer";
import B7Item from "./B7Item";
import B4B7Header from "../components/svg/B4B7Header";
import PathConfigs from "../config/PathConfigs";
import boldData from "../utils/export/RoadUA-Bold.ttf.base64?raw";
import { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";
import {
  getMinimalFontSizeAcrossB4Items,
  getAlignedTextXMap,
  computeB4TextLayout,
} from "./TextLayout";

const boldBuf = Uint8Array.from(atob(boldData), (c) => c.charCodeAt(0)).buffer;
const roadUABold = opentype.parse(boldBuf);

function B7({ params }) {
  const items = Array.isArray(params.b4Items) ? params.b4Items : [];

  // === 1. Попередній розрахунок базових layout-ів ===
  const ribbonOrCircleIcons = new Set([
    "cityCentre", "bridge", "interchange", "bicycleRoute", "district", "other", "water", "streetNetwork"
  ]);

  // Базовий набір параметрів (без уніфікації)
  const baseParamsArray = items.map((item) => {
    let iconKey = item.icon;
    if (iconKey === "streetNetwork" && item.isUrbanCenter) {
      iconKey = "cityCentre";
    }
    const iconConfig = iconKey ? PathConfigs[iconKey] : null;
    const isRibbonOrCircle = !ribbonOrCircleIcons.has(iconKey);

    const textX = isRibbonOrCircle
      ? 136 + ((iconConfig?.width || 0) * (iconConfig?.scale2 || 1)) + 20
      : 136;
    const iconRenderX = isRibbonOrCircle
      ? 136
      : 95.5 - (iconConfig?.width || 0) * (iconConfig?.scale2 || 1) / 2;

    const badgeGroupWidth = getRouteBadgeGroupWidth({ ...params, ...item });
    const availableTextWidthMain = 600 - 28 - textX - badgeGroupWidth;
    const availableTextWidthSecondary = 481;

    return {
      ...params,
      ...item,
      textX,
      iconRenderX,
      availableTextWidthMain,
      availableTextWidthSecondary,
    };
  });

  // === 2. Фільтруємо лише заповнені елементи для вирівнювання ===
  const filledParamsArray = baseParamsArray
    .map((item, index) => ({ ...item, _originIndex: index }))
    .filter(item => !!(item.mainText || item.icon)); // або твій критерій

  // Створюємо map index -> textX тільки для заповнених!
  const filledAlignedTextXMap = getAlignedTextXMap(filledParamsArray);

  // Тепер переносимо вирівнювання до глобального масиву, але лише для тих індексів, які є у filledParamsArray
  const alignedTextXMap = new Map();
  filledParamsArray.forEach(item => {
    if (filledAlignedTextXMap.has(item._originIndex)) {
      alignedTextXMap.set(item._originIndex, filledAlignedTextXMap.get(item._originIndex));
    }
  });

  let forcedFontSize1 = null;
  if (params.forceUniformTextSize) {
    // Знову — лише для заповнених
    const withAligned = filledParamsArray.map((item) => ({
      ...item,
      ...(alignedTextXMap.has(item._originIndex) && {
        textX: alignedTextXMap.get(item._originIndex),
        alignedTextX: alignedTextXMap.get(item._originIndex),
      }),
    }));
    forcedFontSize1 = getMinimalFontSizeAcrossB4Items(withAligned);
  }

  // === 3. Генеруємо фінальні layout-и ===
  const layouts = baseParamsArray.map((item, i) => {
    const finalParams = {
      ...item,
      ...(alignedTextXMap.has(i) && {
        textX: alignedTextXMap.get(i),
        alignedTextX: alignedTextXMap.get(i),
      }),
      ...(forcedFontSize1 && { forcedFontSize1 }),
    };
    const layout = computeB4TextLayout(finalParams);

    let itemHeight = 100;
    if (finalParams.icon === "water") {
      itemHeight = 134;
    } else if (layout.mainTextLines.length > 1) {
      itemHeight = 150;
    }

    return {
      layout,
      itemHeight,
      textX: finalParams.textX,
      iconRenderX: finalParams.iconRenderX,
    };
  });


  // === 4. Координати Y і розміри ===
  const baseY = 200;
  const itemY = layouts.reduce(
    (acc, curr, i) => {
      acc.push(i === 0 ? baseY : acc[i - 1] + layouts[i - 1].itemHeight);
      return acc;
    },
    []
  );
  const totalHeight = 290 + layouts.reduce((sum, l) => sum + l.itemHeight, 0);
  const showBlackLine = params.tableType === "temporary";

  // === 5. "km" текст ===
  const kmText = useMemo(() => {
    return textToPath(
      roadUABold,
      "km",
      23,
      63,
      240,
      "right",
      "visualx"
    );
  }, []);

  // === 6. Рендер ===
  return (
    <svg width={600} height={totalHeight} xmlns="http://www.w3.org/2000/svg">
      {/* Зовнішня біла рамка */}
      <RectRenderer
        config={{
          outerWidth: 600,
          outerHeight: totalHeight,
          outerRadius: 45,
          strokeWidth: 0,
        }}
        x={0}
        y={0}
        outerColor="#FFFFFF"
        innerColor="#FFFFFF"
      />

      <path d={kmText} fill="black" />

      {/* B7Item з уніфікованими параметрами */}
      {items.map((itemParams, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const y = 40 + itemY[index];
        return (
          <B7Item
            key={index}
            index={index}
            x={0}
            y={y}
            isFirst={isFirst}
            isLast={isLast}
            itemHeight={layouts[index].itemHeight}
            layout={layouts[index].layout}
            textX={layouts[index].textX}
            iconRenderX={layouts[index].iconRenderX}
            params={{
              ...params,
              ...itemParams,
              ...(alignedTextXMap.has(index) && {
                textX: alignedTextXMap.get(index),
                alignedTextX: alignedTextXMap.get(index),
              }),
              ...(forcedFontSize1 && { forcedFontSize1 }),
            }}
          />
        );
      })}

      {/* Внутрішня чорна рамка */}
      <RectRenderer
        config={{
          outerWidth: 586,
          outerHeight: totalHeight - 14,
          outerRadius: 41,
          strokeWidth: 6,
        }}
        x={7}
        y={7}
        outerColor="#000000"
        innerColor="none"
      />

      {/* Заголовок */}
      <B4B7Header params={params} />

      {/* Чорна смуга під заголовком */}
      {showBlackLine && (
        <rect x={10} y={197} width={580} height={6} fill="#000000" />
      )}
    </svg>
  );
}

export default B7;
