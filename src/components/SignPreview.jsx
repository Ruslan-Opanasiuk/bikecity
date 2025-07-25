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
  const [scale, setScale] = useState(0.67); // Стан для динамічного масштабу

  const shouldReduceSize = (signType === 'B2' || signType === 'B3') && params.isReduced;

  useEffect(() => {
    // Цей ефект вимірює знак і розраховує правильний масштаб
    const svgEl = wrapperRef.current?.querySelector("svg");
    if (!svgEl) return;
    
    const width = parseFloat(svgEl.getAttribute("width"));
    const height = parseFloat(svgEl.getAttribute("height"));

    if (!isNaN(width) && !isNaN(height) && width > 0) {
      // Завжди зберігаємо повний оригінальний розмір
      setOriginalSize({ width, height });

      // Повідомляємо UI про розмір (зменшений або повний)
      setSignSize?.({
        width: shouldReduceSize ? width / 2 : width,
        height: shouldReduceSize ? height / 2 : height,
      });

      // --- ГОЛОВНА ЛОГІКА АДАПТАЦІЇ ---
      const PADDING = 64; // Орієнтовні відступи зліва і справа на сторінці
      const availableWidth = window.innerWidth - PADDING;
      const desiredScale = 0.67;
      // Розраховуємо, який масштаб потрібен, щоб знак вліз у доступну ширину
      const scaleToFit = availableWidth / width;
      // Використовуємо найменший з масштабів (або бажаний, або той, що влазить)
      setScale(Math.min(desiredScale, scaleToFit));
    }
  }, [signType, params, setSignSize, shouldReduceSize]); // Залежності

  if (!Component) {
    return <div>Тут буде прев’ю {signType}</div>;
  }

  const sign = <Component params={params} />;
  
  if (mode === 'export') {
    const exportScale = shouldReduceSize ? 0.5 : 1.0;
    const finalWidth = originalSize.width * exportScale;
    const finalHeight = originalSize.height * exportScale;
    const border = 2;
    
    return (
      <div ref={wrapperRef}>
        {originalSize.width > 0 ? (
          <svg width={finalWidth + border} height={finalHeight + border} xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width={finalWidth + border} height={finalHeight + border} fill="#000" rx={45 * exportScale} />
            <g transform={`translate(${border / 2}, ${border / 2}) scale(${exportScale})`}>
              {sign}
            </g>
          </svg>
        ) : ( sign )}
      </div>
    );
  } else {
    // Версія для прев'ю тепер використовує динамічний 'scale' і сама задає свою ширину
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