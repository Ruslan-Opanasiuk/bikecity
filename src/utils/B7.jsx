import RectRenderer from "./RectRenderer";
import B7Item from "./B7Item";
import B4B7Header from "../components/svg/B4B7Header";
import PathConfigs from "../config/PathConfigs";
import { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";
import {
  getMinimalFontSizeAcrossB4Items,
  getAlignedTextXMap,
  computeB4TextLayout,
} from "./TextLayout";

function B7({ params }) {
  const items = Array.isArray(params.b4Items) ? params.b4Items : [];

  // Множина для визначення типу іконки
  const ribbonOrCircleIcons = new Set([
    "cityCentre", "bridge", "interchange", "bicycleRoute", "district", "other", "water", "streetNetwork"
  ]);

  // Масив леяутів і координат
  const layouts = items.map((item, i) => {
    let iconKey = item.icon;
    if (iconKey === "streetNetwork" && item.isUrbanCenter) {
      iconKey = "cityCentre";
    }
    const iconConfig = iconKey ? PathConfigs[iconKey] : null;
    // Визначення типу іконки
    const isRibbonOrCircle = !ribbonOrCircleIcons.has(iconKey);

    // === ГОЛОВНА ЛОГІКА: textX, iconRenderX ===
    const textX = isRibbonOrCircle
      ? 91 + ((iconConfig?.width || 0) * (iconConfig?.scale2 || 1)) + 20
      : 91;
    const iconRenderX = isRibbonOrCircle
      ? 91
      : 50.5 - (iconConfig?.width || 0) * (iconConfig?.scale2 || 1) / 2;

    // Решта як було
    const badgeGroupWidth = getRouteBadgeGroupWidth({ ...params, ...item });
    const availableTextWidthMain = 600 - 28 - textX - badgeGroupWidth;
    const availableTextWidthSecondary = 481;

    const layout = computeB4TextLayout({
      ...params,
      ...item,
      textX,
      availableTextWidthMain,
      availableTextWidthSecondary,
    });

    const hasTwoLines = layout.mainTextLines.length > 1;
    const itemHeight = hasTwoLines ? 150 : 100;

    return { layout, itemHeight, textX, iconRenderX };
  });

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

  let alignedTextXMap = new Map();
  let forcedFontSize1 = null;

  if (items.length) {
    const baseParams = items.map((item) => ({
      ...params,
      ...item,
    }));

    alignedTextXMap = getAlignedTextXMap(baseParams);

    if (params.forceUniformTextSize) {
      const withAligned = baseParams.map((item, index) => ({
        ...item,
        ...(alignedTextXMap.has(index)
          ? { alignedTextX: alignedTextXMap.get(index) }
          : {}),
      }));

      forcedFontSize1 = getMinimalFontSizeAcrossB4Items(withAligned);
    }
  }

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

      {/* B7Item з усіма параметрами */}
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
            iconRenderX={layouts[index].iconRenderX} // ← Додаємо!
            params={{
              ...params,
              ...itemParams,
              ...(alignedTextXMap.has(index) && {
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
