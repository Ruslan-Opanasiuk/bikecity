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

  const ribbonOrCircleIcons = new Set([
    "cityCentre", "bridge", "interchange", "bicycleRoute", "district", "other", "water", "streetNetwork"
  ]);

  const baseParamsArray = items.map((item) => {
    let iconKey = item.icon;
    if (iconKey === "streetNetwork" && item.isUrbanCenter) {
      iconKey = "cityCentre";
    }
    const iconConfig = iconKey ? PathConfigs[iconKey] : null;
    const isRibbonOrCircle = !ribbonOrCircleIcons.has(iconKey);
    const temporaryOffset = item.isTemporaryRoute === true ? 63 : 0;
    
    const textX = (isRibbonOrCircle ? 136 + ((iconConfig?.width || 0) * (iconConfig?.scale2 || 1)) + 20 : 136) + temporaryOffset;
    const iconRenderX = (isRibbonOrCircle ? 136 : 95.5 - (iconConfig?.width || 0) * (iconConfig?.scale2 || 1) / 2) + temporaryOffset;
    
    const badgeGroupWidth = getRouteBadgeGroupWidth({ ...params, ...item });
    
    // Цей розрахунок залишається для попередніх етапів (вирівнювання, розмір шрифту)
    const availableTextWidthMain = 600 - 28 - textX - badgeGroupWidth;
    const availableTextWidthSecondary = 481 - temporaryOffset;

    return { ...params, ...item, textX, iconRenderX, availableTextWidthMain, availableTextWidthSecondary };
  });

  const filledParamsArray = baseParamsArray
    .map((item, index) => ({ ...item, _originIndex: index }))
    .filter(item => !!(item.mainText || item.icon));

  const filledAlignedTextXMap = getAlignedTextXMap(filledParamsArray);
  const alignedTextXMap = new Map();
  filledParamsArray.forEach(item => {
    if (filledAlignedTextXMap.has(item._originIndex)) {
      alignedTextXMap.set(item._originIndex, filledAlignedTextXMap.get(item._originIndex));
    }
  });

  let forcedFontSize1 = null;
  if (params.forceUniformTextSize) {
    const withAligned = filledParamsArray.map((item) => ({
      ...item,
      ...(alignedTextXMap.has(item._originIndex) && { textX: alignedTextXMap.get(item._originIndex), alignedTextX: alignedTextXMap.get(item._originIndex) }),
    }));
    forcedFontSize1 = getMinimalFontSizeAcrossB4Items(withAligned);
  }

  const layouts = baseParamsArray.map((item, i) => {
    const finalParams = {
      ...item,
      ...(alignedTextXMap.has(i) && { textX: alignedTextXMap.get(i), alignedTextX: alignedTextXMap.get(i) }),
      ...(forcedFontSize1 && { forcedFontSize1 }),
    };

    // --- ЗМІНА ТУТ: Перераховуємо доступну ширину з фінальним textX ---
    const badgeGroupWidth = getRouteBadgeGroupWidth(finalParams);
    finalParams.availableTextWidthMain = 600 - 28 - finalParams.textX - badgeGroupWidth;
    
    const layout = computeB4TextLayout(finalParams);

    let baseItemHeight = 100;
    if (finalParams.icon === "water") baseItemHeight = 134;
    else if (layout.mainTextLines.length > 1) baseItemHeight = 150;
    
    const itemHeight = item.isTemporaryRoute ? 150 : baseItemHeight;

    return { layout, baseItemHeight, itemHeight, textX: finalParams.textX, iconRenderX: finalParams.iconRenderX };
  });

  const temporaryStatusMap = items.map((item, i, allItems) => {
    if (!item.isTemporaryRoute) return null;
    const isPrevTemp = i > 0 && allItems[i - 1].isTemporaryRoute;
    const isNextTemp = i < allItems.length - 1 && allItems[i + 1].isTemporaryRoute;

    if (!isPrevTemp && !isNextTemp) return 'standalone';
    if (!isPrevTemp && isNextTemp) return 'start';
    if (isPrevTemp && isNextTemp) return 'middle';
    if (isPrevTemp && !isNextTemp) return 'end';
    return null;
  });

  const baseY = 200;
  const itemY = layouts.reduce((acc, curr, i) => {
    acc.push(i === 0 ? baseY : acc[i - 1] + layouts[i - 1].itemHeight);
    return acc;
  }, []);
  const totalHeight = 290 + layouts.reduce((sum, l) => sum + l.itemHeight, 0);
  const showBlackLine = params.tableType === "temporary";

  const kmText = useMemo(() => {
    return textToPath(roadUABold, "km", 23, 41.5, 240, "center", "visualx");
  }, []);

  return (
    <svg width={600} height={totalHeight} xmlns="http://www.w3.org/2000/svg">
      <RectRenderer
        config={{ outerWidth: 600, outerHeight: totalHeight, outerRadius: 45, strokeWidth: 0 }}
        x={0} y={0} outerColor="#FFFFFF" innerColor="#FFFFFF"
      />
      
      {items.map((itemParams, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const y = 40 + itemY[index];
        const currentLayout = layouts[index];
        const isTemporary = itemParams.isTemporaryRoute === true;
        const yOffset = isTemporary ? (150 - currentLayout.baseItemHeight) / 2 : 0;

        return (
          <React.Fragment key={index}>
            {isTemporary && (
              <rect x={10} y={y} width={580} height={150} fill="#F5C30D" />
            )}
            <B7Item
              index={index}
              x={0}
              y={y + yOffset}
              isFirst={isFirst}
              isLast={isLast}
              itemHeight={currentLayout.baseItemHeight}
              layout={currentLayout.layout}
              textX={currentLayout.textX}
              iconRenderX={currentLayout.iconRenderX}
              temporaryStatus={temporaryStatusMap[index]}
              params={{
                ...params,
                ...itemParams,
                ...(alignedTextXMap.has(index) && { textX: alignedTextXMap.get(index), alignedTextX: alignedTextXMap.get(index) }),
                ...(forcedFontSize1 && { forcedFontSize1 }),
              }}
            />
          </React.Fragment>
        );
      })}

      <path d={kmText} fill="black" />
      <RectRenderer
        config={{ outerWidth: 586, outerHeight: totalHeight - 14, outerRadius: 41, strokeWidth: 6 }}
        x={7} y={7} outerColor="#000000" innerColor="none"
      />
      <B4B7Header params={params} />
      {showBlackLine && (
        <rect x={10} y={197} width={580} height={6} fill="#000000" />
      )}
    </svg>
  );
}

export default B7;