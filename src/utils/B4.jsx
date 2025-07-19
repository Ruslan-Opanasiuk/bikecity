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

// === [0] ДОПОМІЖНА ФУНКЦІЯ: Розрахунок позиції тексту та ширин для тексту ===
function calculateTextXAndWidths(params) {
  const xPadding = 40;
  const arrow = PathConfigs.smallArrow;
  const DIAGONAL_ARROW_WIDTH = 55.4;

  // Залежність від напрямку руху
  const directionLayout = {
    left: { arrowX: xPadding + (arrow.height - arrow.width) / 2 },
    straight: { arrowX: xPadding },
    "straight-left": { arrowX: xPadding - 3 },
    right: {
      arrowX: 560 - arrow.width - (arrow.height - arrow.width) / 2,
    },
    "straight-right": {
      arrowX: 560 + 3 - DIAGONAL_ARROW_WIDTH,
    },
  };

  const layout = directionLayout[params.direction] || {};
  const arrowX = layout.arrowX ?? 0;

  // Початкове значення координати тексту
  let textX = xPadding;

  // Зсуваємо текст, якщо стрілка ліворуч
  if (["left", "straight", "straight-left"].includes(params.direction)) {
    const arrowWidthMap = {
      straight: arrow.width,
      left: arrow.height,
      "straight-left": DIAGONAL_ARROW_WIDTH,
    };

    const arrowVisualWidth = arrowWidthMap[params.direction] || 0;
    textX = arrowX + arrowVisualWidth + 20;
  }

  // Обробка іконки, якщо потрібно змінити тип
  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }

  if (!iconKey) {
    switch (params.numberType) {
      case "veloSTO":
      case "veloParking":
      case "eurovelo":
        iconKey = params.numberType;
    }
  }

  const icon = iconKey && PathConfigs[iconKey];
  if (icon) {
    textX += icon.width * icon.scale + 20;
  }

  const badgeGroupWidth = getRouteBadgeGroupWidth(params);

  const arrowRightSpace = ["right", "straight-right"].includes(params.direction)
    ? (params.direction === "right" ? arrow.height : DIAGONAL_ARROW_WIDTH) + 20
    : 0;

  const availableTextWidthMain =
    520 - (textX - xPadding) - arrowRightSpace - badgeGroupWidth;

  const availableTextWidthSecondary =
    520 - (textX - xPadding) - arrowRightSpace;

  return {
    textX,
    availableTextWidthMain,
    availableTextWidthSecondary,
  };
}

// === [1] КОМПОНЕНТ ТАБЛИЧКИ B4 З КІЛЬКОМА НАПРЯМКАМИ ===
function B4({ params }) {
  const itemCount = params.b4Items?.length || 1;

  // Розміри зовнішнього та внутрішнього прямокутника
  const outerRect = RectConfigs[`B${itemCount + 3}`];
  const innerRect = RectConfigs[`strokeB${itemCount + 3}`];

  const showBlackLine = params.tableType === "temporary";

  // Y-координати для розміщення елементів
  const baseY = 200;
  const itemHeight = 150;
  const arrowOverlapOffset = -13;

  // === [1.1] Розрахунок Y-позиції для елементу B4 ===
  const b4ItemY = (index, hideArrow) =>
    baseY + index * itemHeight + (hideArrow ? arrowOverlapOffset : 0);

  // === [1.2] Малювання роздільних ліній між різними напрямками ===
  const renderSeparatorLines = () => {
    const lines = [];

    for (let i = 1; i < params.b4Items.length; i++) {
      const prev = params.b4Items[i - 1];
      const curr = params.b4Items[i];

      // Якщо напрямки змінилися — додаємо роздільну лінію
      if (prev.direction !== curr.direction) {
        const y = baseY + i * itemHeight - 3;

        lines.push(
          <rect
            key={`line-${i}`}
            x={10}
            y={y}
            width={580}
            height={6}
            fill="#000000"
          />
        );
      }
    }

    return lines;
  };

  // === [2] ПІДГОТОВКА ЕЛЕМЕНТІВ: вирівнювання, розміри шрифтів ===

  let alignedTextXMap = new Map();
  let forcedFontSize1 = null;
  let preparedItems = [];

  if (Array.isArray(params.b4Items)) {
    // Копіюємо та розширюємо параметри кожного елементу
    preparedItems = params.b4Items.map((item, index) => {
      const mergedParams = {
        ...params,
        ...item,
      };

      const layout = calculateTextXAndWidths(mergedParams);

      return {
        ...mergedParams,
        ...layout,
      };
    });

    // Вирівнювання textX між схожими елементами
    alignedTextXMap = getAlignedTextXMap(preparedItems);

    // Примусове вирівнювання розміру шрифтів, якщо задано
    if (params.forceUniformTextSize) {
      const withAligned = preparedItems.map((item, index) => ({
        ...item,
        ...(alignedTextXMap.has(index) && {
          textX: alignedTextXMap.get(index),
        }),
      }));

      forcedFontSize1 = getMinimalFontSizeAcrossB4Items(withAligned);
    }
  }

  // === [3] РЕНДЕР КОМПОНЕНТА ===

  return (
    <svg
      width={outerRect.outerWidth}
      height={outerRect.outerHeight}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* [3.1] Зовнішня рамка */}
      <RectRenderer
        config={outerRect}
        outerColor="#FFFFFF"
        innerColor="#FFFFFF"
        x={0}
        y={0}
      />

      {/* [3.2] Елементи B4Item (напрямки) */}
      {params.b4Items?.map((itemParams, index) => {
        const prev = index > 0 ? params.b4Items[index - 1] : null;
        const hideArrow = prev && prev.direction === itemParams.direction;
        const isLast = index === params.b4Items.length - 1;
        const contentOffsetY = hideArrow ? arrowOverlapOffset : 0;

        const finalParams = {
          ...preparedItems[index],
          hideArrow,
          ...(alignedTextXMap.has(index) && {
            alignedTextX: alignedTextXMap.get(index),
          }),
          ...(forcedFontSize1 && { forcedFontSize1 }),
        };

        return (
          <B4Item
            key={index}
            index={index}
            x={0}
            y={b4ItemY(index, false)}
            isLast={isLast}
            contentOffsetY={contentOffsetY}
            params={finalParams}
            onTooLong={(val) => updateTooLongFlag(index, val)} // !!! якщо не оголошено - винести наверх
          />
        );
      })}

      {/* [3.3] Внутрішня чорна рамка */}
      <RectRenderer
        config={innerRect}
        outerColor="#000000"
        innerColor="none"
        x={7}
        y={7}
      />

      {/* [3.4] Заголовок */}
      <B4B7Header params={params} />

      {/* [3.5] Роздільні лінії між різними напрямками */}
      {renderSeparatorLines()}

      {/* [3.6] Верхня чорна лінія для "temporary" табличок */}
      {showBlackLine && (
        <rect x={10} y={197} width={580} height={6} fill="#000000" />
      )}
    </svg>
  );
}

export default B4;


// === 🧩 СТРУКТУРА КОМПОНЕНТА B4 (довідка для навігації) ===
//
// [0] calculateTextXAndWidths
//     ▸ Допоміжна функція для розрахунку координати тексту (textX)
//     ▸ Обраховує ширину доступного простору під основний і другорядний текст
//     ▸ Враховує тип стрілки, іконку, відступи, бейджі
//
// [1] B4 — головна функція-компонент
//
//   [1.1] b4ItemY()
//         ▸ Обчислює Y-позицію для кожного елементу залежно від індексу та того, чи потрібно ховати стрілку
//
//   [1.2] renderSeparatorLines()
//         ▸ Рендерить горизонтальні чорні лінії між напрямками, якщо вони змінюються
//
// [2] ПІДГОТОВКА ДАНИХ
//     ▸ Формує масив preparedItems на основі b4Items
//     ▸ Виконує обчислення textX та ширин
//     ▸ Визначає вирівнювання тексту між схожими напрямками
//     ▸ Розраховує однаковий розмір шрифту, якщо вказано forceUniformTextSize
//
// [3] РЕНДЕР
//
//   [3.1] <RectRenderer outer>
//         ▸ Малює зовнішній білий прямокутник
//
//   [3.2] <B4Item>
//         ▸ Рендерить кожен напрямок/елемент маршруту
//         ▸ Передає hideArrow, alignedTextX, forcedFontSize1
//
//   [3.3] <RectRenderer inner>
//         ▸ Малює чорну рамку зверху білого прямокутника
//
//   [3.4] <B4B7Header />
//         ▸ Виводить заголовок таблиці
//
//   [3.5] renderSeparatorLines()
//         ▸ Горизонтальні роздільні лінії між напрямками
//
//   [3.6] Верхня чорна лінія (опціонально)
//         ▸ Відображається, якщо tableType === "temporary"
//         ▸ Розміщується на фіксованій координаті Y (197)
//
// =================================================================
