import { useEffect, useRef, useState } from "react";
import B1 from "../utils/B1";
import B2 from "../utils/B2";
import B3 from "../utils/B3";
import B4 from "../utils/B4";
import B7 from "../utils/B7";

const components = { B1, B2, B3, B4, B7 };

function SignPreview({ signType, params, setSignSize, mode = "preview" }) {
  const Component = components[signType];
  const wrapperRef = useRef(null);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

  // 1. Визначаємо, чи потрібно застосовувати логіку зменшення
  const shouldReduceSize = (signType === 'B2' || signType === 'B3') && params.isReduced;

  useEffect(() => {
    const handler = () => {
      const container = wrapperRef.current;
      if (container) {
        const svgEl = container.querySelector("svg");
        if (svgEl) {
          const width = parseFloat(svgEl.getAttribute("width"));
          const height = parseFloat(svgEl.getAttribute("height"));

          if (!isNaN(width) && !isNaN(height)) {
            // Завжди зберігаємо повний оригінальний розмір
            setOriginalSize({ width, height });

            // 2. Повідомляємо UI про розмір (зменшений або повний)
            setSignSize?.({
              width: shouldReduceSize ? width / 2 : width,
              height: shouldReduceSize ? height / 2 : height,
            });
          }
        }
      }
    };
    requestAnimationFrame(handler);
  }, [signType, params, setSignSize, mode, shouldReduceSize]); // Додали shouldReduceSize в залежності

  if (!Component) {
    return <div>Тут буде прев’ю {signType}</div>;
  }

  const sign = <Component params={params} />;
  const previewScale = 0.67;

  if (mode === 'export') {
    // 3. Логіка для експорту
    const exportScale = shouldReduceSize ? 0.5 : 1.0;
    const finalWidth = originalSize.width * exportScale;
    const finalHeight = originalSize.height * exportScale;
    const border = 2; // Розмір рамки-підкладки
    
    return (
      <div ref={wrapperRef}>
        {originalSize.width > 0 ? (
          <svg
            width={finalWidth + border}
            height={finalHeight + border}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0"
              y="0"
              width={finalWidth + border}
              height={finalHeight + border}
              fill="#000"
              rx={45 * exportScale} // Радіус кутів також масштабуємо
            />
            {/* Масштабуємо сам знак всередині рамки */}
            <g transform={`translate(${border / 2}, ${border / 2}) scale(${exportScale})`}>
              {sign}
            </g>
          </svg>
        ) : (
          sign // Перший рендер для вимірювання
        )}
      </div>
    );
  } else {
    // 4. Логіка для прев'ю (залишається незмінною)
    // Вона завжди базується на повному originalSize, тому прев'ю не зменшується
    return (
      <div
        style={{
          width: originalSize.width * previewScale,
          height: originalSize.height * previewScale,
          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))",
        }}
      >
        <div ref={wrapperRef} style={{ transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
          {sign}
        </div>
      </div>
    );
  }
}

export default SignPreview;