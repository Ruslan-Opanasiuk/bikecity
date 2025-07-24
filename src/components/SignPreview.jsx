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

  useEffect(() => {
    const handler = () => {
      const container = wrapperRef.current;
      if (container) {
        const svgEl = container.querySelector("svg");
        if (svgEl) {
          const width = parseFloat(svgEl.getAttribute("width"));
          const height = parseFloat(svgEl.getAttribute("height"));
          if (!isNaN(width) && !isNaN(height)) {
            setOriginalSize({ width, height });
            setSignSize?.({ width, height });
          }
        }
      }
    };
    requestAnimationFrame(handler);
  }, [signType, params, setSignSize, mode]);

  if (!Component) {
    return <div>Тут буде прев’ю {signType}</div>;
  }

  const sign = <Component params={params} />;
  const scale = 0.67;

  if (mode === 'export') {
    // --- ПОВЕРНУЛИ СТАРУ ЛОГІКУ "ПІДКЛАДКИ" ---
    return (
      <div ref={wrapperRef}>
        {originalSize.width > 0 ? (
          // Другий рендер: малюємо знак поверх чорної підкладки
          <svg
            width={originalSize.width + 2}
            height={originalSize.height + 2}
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0"
              y="0"
              width={originalSize.width + 2}
              height={originalSize.height + 2}
              fill="#000" // Суцільна чорна заливка
              rx="45"     // Заокруглені кути для підкладки
            />
            <g transform="translate(1, 1)">{sign}</g>
          </svg>
        ) : (
          // Перший рендер: малюємо знак, щоб виміряти його розміри
          sign
        )}
      </div>
    );
  } else {
    // ---- ВЕРСІЯ ДЛЯ ПРЕВ'Ю (з тінню та масштабуванням) ----
    return (
      <div
        style={{
          width: originalSize.width * scale,
          height: originalSize.height * scale,
          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))",
        }}
      >
        <div ref={wrapperRef} style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {sign}
        </div>
      </div>
    );
  }
}

export default SignPreview;