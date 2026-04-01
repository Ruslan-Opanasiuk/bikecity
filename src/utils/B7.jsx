import React, { useMemo } from "react";
import opentype from "opentype.js";

// Імпорт допоміжних функцій та компонентів
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
  computeTextLayout,
} from "./TextLayout";

// Завантаження та парсинг шрифту RoadUA-Bold
const boldBuf = Uint8Array.from(atob(boldData), (c) => c.charCodeAt(0)).buffer;
const roadUABold = opentype.parse(boldBuf);

/**
 * Компонент B7 - відповідає за рендеринг дорожнього знаку типу B7.
 * Знак B7 може містити декілька рядків (об'єктів/напрямків),
 * кожен з яких рендериться компонентом B7Item.
 */
function B7({ params }) {
  // Перетворюємо b4Items на масив, якщо він не є ним, або використовуємо порожній масив
  const items = Array.isArray(params.b4Items) ? params.b4Items : [];

  // Множина іконок, які мають стрічкову або круглу форму (не точкові маркери)
  const ribbonOrCircleIcons = new Set([
    "cityCentre", "bridge", "interchange", "bicycleRoute", "district", "other", "water", "streetNetwork"
  ]);

  /**
   * Обчислення базових параметрів для кожного елемента (рядка) знаку B7.
   * Ці параметри включають початкові координати тексту та іконок,
   * а також доступні ширини для тексту до вирівнювання.
   */
  const baseParamsArray = items.map((item) => {
    // Визначаємо ключ іконки, враховуючи особливий випадок "Центр населеного пункту"
    let iconKey = item.icon;
    if (iconKey === "streetNetwork" && item.isUrbanCenter) {
      iconKey = "cityCentre";
    }

    // Отримуємо конфігурацію іконки
    const iconConfig = iconKey ? PathConfigs[iconKey] : null;

    // Визначаємо, чи є іконка "стрічковою" або "круглою" (впливає на початкове зміщення тексту)
    const isRibbonOrCircle = !ribbonOrCircleIcons.has(iconKey);

    // Зміщення для тимчасових маршрутів
    const temporaryOffset = item.isTemporaryRoute === true ? 63 : 0;
    
    // Розрахунок початкової X-координати для тексту.
    // Логіка залежить від типу іконки та наявності тимчасового зміщення.
    const textX = (isRibbonOrCircle ? 136 + ((iconConfig?.width || 0) * (iconConfig?.scale2 || 1)) + 20 : 136) + temporaryOffset;
    
    // Розрахунок початкової X-координати для рендерингу іконки.
    // Логіка залежить від типу іконки та наявності тимчасового зміщення.
    const iconRenderX = (isRibbonOrCircle ? 136 : 95.5 - (iconConfig?.width || 0) * (iconConfig?.scale2 || 1) / 2) + temporaryOffset;
    
    // Отримуємо ширину групи бейджів маршруту для поточного елемента
    const badgeGroupWidth = getRouteBadgeGroupWidth({ ...params, ...item });
    
    // Розрахунок доступної ширини для основного тексту.
    // 600 - загальна ширина знаку B7.
    // 28 - правий відступ.
    // textX - початкова X-координата тексту.
    // badgeGroupWidth - ширина групи бейджів, які йдуть після тексту.
    const availableTextWidthMain = 600 - 28 - textX - badgeGroupWidth;
    
    // Розрахунок доступної ширини для вторинного (англійського) тексту.
    const availableTextWidthSecondary = 600 - 28 - textX - 8;

    // Повертаємо об'єкт з усіма розрахованими параметрами для поточного елемента
    return { ...params, ...item, textX, iconRenderX, availableTextWidthMain, availableTextWidthSecondary };
  });

  /**
   * Підготовка масиву елементів для вирівнювання тексту.
   * Фільтруємо лише ті, що мають основний текст або іконку.
   */
  const filledParamsArray = baseParamsArray
    .map((item, index) => ({ ...item, _originIndex: index }))
    .filter(item => !!(item.mainText || item.icon));

  // Отримуємо мапу вирівняних X-координат тексту для груп елементів
  const filledAlignedTextXMap = getAlignedTextXMap(filledParamsArray);
  const alignedTextXMap = new Map();
  filledParamsArray.forEach(item => {
    if (filledAlignedTextXMap.has(item._originIndex)) {
      alignedTextXMap.set(item._originIndex, filledAlignedTextXMap.get(item._originIndex));
    }
  });

  // Визначаємо примусовий розмір шрифту (fontSize1), якщо увімкнено однорідний розмір тексту
  let forcedFontSize1 = null;
  if (params.forceUniformTextSize) {
    const withAligned = filledParamsArray.map((item) => ({
      ...item,
      ...(alignedTextXMap.has(item._originIndex) && { textX: alignedTextXMap.get(item._originIndex), alignedTextX: alignedTextXMap.get(item._originIndex) }),
    }));
    forcedFontSize1 = getMinimalFontSizeAcrossB4Items(withAligned);
  }

  /**
   * Обчислення макетів (лейаутів) для кожного елемента.
   * Тут викликається 'computeTextLayout' з уже визначеними та вирівняними параметрами.
   */
  const layouts = baseParamsArray.map((item, i) => {
    // Формуємо кінцеві параметри для передачі в computeTextLayout,
    // застосовуючи вирівняний textX та примусовий fontSize1
    const finalParams = {
      ...item,
      isB7: true,
      ...(alignedTextXMap.has(i) && { textX: alignedTextXMap.get(i), alignedTextX: alignedTextXMap.get(i) }),
      ...(forcedFontSize1 && { forcedFontSize1 }),
    };

    // Оновлюємо availableTextWidthMain після застосування finalParams.textX (вирівняного)
    // Це забезпечує, що доступна ширина для тексту розраховується від фактичної початкової позиції.
    const badgeGroupWidth = getRouteBadgeGroupWidth(finalParams);
    finalParams.availableTextWidthMain = 600 - 28 - finalParams.textX - badgeGroupWidth;
    
    // Обчислюємо повний текстовий макет для поточного елемента
    const layout = computeTextLayout(finalParams);

    // Визначаємо базову висоту елемента залежно від іконки "water" або кількості рядків основного тексту
    let baseItemHeight = 100;
    if (finalParams.icon === "water") baseItemHeight = 134;
    else if (layout.mainTextLines.length > 1) baseItemHeight = 150;
    
    // Визначаємо фінальну висоту елемента, враховуючи, чи є маршрут тимчасовим
    const itemHeight = item.isTemporaryRoute ? 150 : baseItemHeight;

    // Повертаємо об'єкт з обчисленим макетом та параметрами висоти/позицій
    return { layout, baseItemHeight, itemHeight, textX: finalParams.textX, iconRenderX: finalParams.iconRenderX };
  });

  /**
   * Створюємо мапу статусу тимчасового маршруту для кожного елемента,
   * щоб коректно відображати сегменти пунктирних ліній.
   */
  const temporaryStatusMap = items.map((item, i, allItems) => {
    if (!item.isTemporaryRoute) return null; // Якщо не тимчасовий, статус не потрібен
    const isPrevTemp = i > 0 && allItems[i - 1].isTemporaryRoute; // Чи попередній елемент тимчасовий
    const isNextTemp = i < allItems.length - 1 && allItems[i + 1].isTemporaryRoute; // Чи наступний елемент тимчасовий

    // Визначаємо тип сегмента тимчасової лінії
    if (!isPrevTemp && !isNextTemp) return 'standalone'; // Окремий тимчасовий маршрут
    if (!isPrevTemp && isNextTemp) return 'start';      // Початок послідовності тимчасових
    if (isPrevTemp && isNextTemp) return 'middle';      // Середина послідовності тимчасових
    if (isPrevTemp && !isNextTemp) return 'end';        // Кінець послідовності тимчасових
    return null;
  });

  // Базова Y-координата для першого елемента знаку B7
  const baseY = 200;

  /**
   * Обчислення Y-координат для кожного елемента,
   * накопичуючи висоту попередніх елементів.
   */
  const itemY = layouts.reduce((acc, curr, i) => {
    acc.push(i === 0 ? baseY : acc[i - 1] + layouts[i - 1].itemHeight);
    return acc;
  }, []);

  // Обчислення загальної висоти SVG знаку B7
  // 290 - фіксована висота заголовка та верхньої частини знаку.
  // layouts.reduce(...) - сума висот усіх елементів.
  const totalHeight = 290 + layouts.reduce((sum, l) => sum + l.itemHeight, 0);

  // Прапорець для відображення чорної лінії, якщо тип таблиці "temporary"
  const showBlackLine = params.tableType === "temporary";

  /**
   * Генеруємо SVG-шлях для тексту "km" (кілометри).
   * Використовуємо useMemo для мемоізації, оскільки текст статичний.
   */
  const kmText = useMemo(() => {
    return textToPath(roadUABold, "km", 23, 41.5, 240, "center", "visualx");
  }, []);

  // --- Рендеринг SVG-знаку B7 ---
  return (
    <svg width={600} height={totalHeight} xmlns="http://www.w3.org/2000/svg">
      {/* Зовнішній білий прямокутник (фон знаку) */}
      <RectRenderer
        config={{ outerWidth: 600, outerHeight: totalHeight, outerRadius: 45, strokeWidth: 0 }}
        x={0} // Позиція по X
        y={0} // Позиція по Y
        outerColor="#FFFFFF" // Колір зовнішнього контуру
        innerColor="#FFFFFF" // Колір внутрішньої заливки
      />
      
      {/* Мапуємо та рендеримо кожен елемент B7Item */}
      {items.map((itemParams, index) => {
        const isFirst = index === 0; // Прапорець для першого елемента
        const isLast = index === items.length - 1; // Прапорець для останнього елемента
        const y = 40 + itemY[index]; // Y-координата для поточного елемента
        const currentLayout = layouts[index]; // Макет для поточного елемента
        const isTemporary = itemParams.isTemporaryRoute === true; // Чи є елемент тимчасовим
        
        // Зміщення по Y для тимчасових маршрутів, щоб вирівняти їх всередині жовтого блоку
        const yOffset = isTemporary ? (150 - currentLayout.baseItemHeight) / 2 : 0;

        return (
          // Використовуємо React.Fragment, оскільки map повертає список елементів
          <React.Fragment key={index}>
            {/* Рендеримо жовтий фон для тимчасових маршрутів */}
            {isTemporary && (
              <rect x={10} y={y} width={580} height={150} fill="#F5C30D" />
            )}
            {/* Компонент B7Item, що рендерить один рядок знаку */}
            <B7Item
              index={index}
              x={0}
              y={y + yOffset} // Застосовуємо yOffset для тимчасових маршрутів
              isFirst={isFirst}
              isLast={isLast}
              itemHeight={currentLayout.baseItemHeight}
              layout={currentLayout.layout} // Передаємо обчислений макет тексту
              textX={currentLayout.textX}   // Передаємо обчислену X-координату тексту
              iconRenderX={currentLayout.iconRenderX} // Передаємо обчислену X-координату іконки
              temporaryStatus={temporaryStatusMap[index]} // Передаємо статус тимчасової лінії
              params={{
                ...params,    // Загальні параметри знаку
                ...itemParams, // Параметри поточного елемента
                // Передаємо вирівняний textX та примусовий fontSize1, якщо вони визначені
                ...(alignedTextXMap.has(index) && { textX: alignedTextXMap.get(index), alignedTextX: alignedTextXMap.get(index) }),
                ...(forcedFontSize1 && { forcedFontSize1 }),
              }}
            />
          </React.Fragment>
        );
      })}

      {/* SVG-шлях для тексту "km" (кілометри) */}
      <path d={kmText} fill="black" />

      {/* Внутрішня чорна рамка знаку */}
      <RectRenderer
        config={{ outerWidth: 586, outerHeight: totalHeight - 14, outerRadius: 41, strokeWidth: 6 }}
        x={7} // Позиція по X (відступ від зовнішньої рамки)
        y={7} // Позиція по Y (відступ від зовнішньої рамки)
        outerColor="#000000" // Колір зовнішнього контуру (чорний)
        innerColor="none" // Внутрішня заливка відсутня
      />

      {/* Компонент заголовка знаку B4/B7 */}
      <B4B7Header params={params} />

      {/* Верхня чорна лінія, яка відображається тільки для тимчасових табличок */}
      {showBlackLine && (
        <rect x={10} y={197} width={580} height={6} fill="#000000" />
      )}
    </svg>
  );
}

export default B7;