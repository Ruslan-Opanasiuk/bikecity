import RectRenderer from "./RectRenderer";
import B4Item from "./B4Item";
import B4B7Header from "../components/svg/B4B7Header";
import RectConfigs from "../config/RectConfigs";
import {
  getMinimalFontSizeAcrossB4Items,
  getAlignedTextX,
} from "./B4TextLayout";

/**
 * 📦 Компонент для побудови таблички B4 з кількома напрямками.
 */
function B4({ params }) {
  // === [1] Розрахунок кількості напрямків ===
  const count = params.b4Items?.length || 1;

  // === [2] Вибір зовнішньої та внутрішньої рамки ===
  const outerRect = RectConfigs[`B${count + 3}`];
  const innerRect = RectConfigs[`strokeB${count + 3}`];

  // === [3] Прапорець для чорної лінії під заголовком ===
  const showBlackLine = params.tableType === "temporary";

  // === [4] Вертикальне позиціонування B4Item ===
  const baseY = 200;
  const itemHeight = 150;
  const arrowOverlapOffset = -13;

  const b4ItemY = (index, hideArrow) =>
    baseY + index * itemHeight + (hideArrow ? arrowOverlapOffset : 0);

  // === [5] Роздільники між напрямками (чорні лінії між різними стрілками) ===
  const renderSeparatorLines = () => {
    const lines = [];

    for (let i = 1; i < params.b4Items.length; i++) {
      const prev = params.b4Items[i - 1];
      const curr = params.b4Items[i];

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

  // === [6] УНІФІКАЦІЯ ШРИФТУ (якщо активована) ===
  let forcedFontSize1 = null;
  if (params.forceUniformTextSize && Array.isArray(params.b4Items)) {
    forcedFontSize1 = getMinimalFontSizeAcrossB4Items(
      params.b4Items.map((item) => ({
        ...params,
        ...item,
      }))
    );
  }

  // === [7] ВИРІВНЮВАННЯ ПО textX (якщо різниця < 20px) ===
  let alignedTextX = null;
  if (Array.isArray(params.b4Items)) {
    const itemsWithMergedParams = params.b4Items.map((item) => ({
      ...params,
      ...item,
    }));
    alignedTextX = getAlignedTextX(itemsWithMergedParams);
  }

  // === [8] Рендер SVG таблички ===
  return (
    <svg
      width={outerRect.outerWidth + 2}
      height={outerRect.outerHeight + 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        transform="translate(1,1)"
        style={{ filter: "drop-shadow(0 0 1px black)" }}
      >
        {/* === [8.1] Зовнішня біла рамка === */}
        <RectRenderer
          config={outerRect}
          outerColor="#FFFFFF"
          innerColor="#FFFFFF"
          x={0}
          y={0}
        />

        {/* === [8.2] Елементи напрямків (B4Item) === */}
        {params.b4Items?.map((itemParams, index) => {
          const prev = index > 0 ? params.b4Items[index - 1] : null;
          const hideArrow = prev && prev.direction === itemParams.direction;
          const isLast = index === params.b4Items.length - 1;
          const contentOffsetY = hideArrow ? arrowOverlapOffset : 0;

          return (
            <B4Item
              key={index}
              index={index}
              x={0}
              y={b4ItemY(index, false)} // Фон не зміщуємо!
              isLast={isLast}
              contentOffsetY={contentOffsetY}
              params={{
                ...params,
                ...itemParams,
                hideArrow,
                ...(forcedFontSize1 && { forcedFontSize1 }),
                ...(alignedTextX && { alignedTextX }),
              }}
              onTooLong={(val) => updateTooLongFlag(index, val)}
            />
          );
        })}

        {/* === [8.3] Внутрішня чорна рамка === */}
        <RectRenderer
          config={innerRect}
          outerColor="#000000"
          innerColor="none"
          x={7}
          y={7}
        />

        {/* === [8.4] Заголовок таблички (верхній блок) === */}
        <B4B7Header params={params} />

        {/* === [8.5] Чорні роздільники між напрямками === */}
        {renderSeparatorLines()}

        {/* === [8.6] Чорна смуга під заголовком (для тимчасових знаків) === */}
        {showBlackLine && (
          <rect
            x={10}
            y={197}
            width={580}
            height={6}
            fill="#000000"
          />
        )}
      </g>
    </svg>
  );
}

export default B4;
