import { useEffect, useRef, useState } from "react";
import B1 from "../utils/B1";
import B2 from "../utils/B2";
import B3 from "../utils/B3";
import B4 from "../utils/B4";
import B7 from "../utils/B7";
import G1 from "../utils/G1";
import RoadMarkingPreview from "./RoadMarkingPreview";

const components = { B1, B2, B3, B4, B7, G1 };

function SignPreview({ signType, params, setSignSize, mode = "preview" }) {
  const Component = components[signType];
  const wrapperRef = useRef(null);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1.0); // Початковий масштаб

  const shouldReduceSize =
    (signType === "B2" || signType === "B3") && params.isReduced;

  // --- ЗМІНА 1: Оновлений useEffect для адаптивного масштабування G1 ---
  useEffect(() => {
    const PADDING = 64; // Горизонтальний відступ на сторінці
    const availableWidth = window.innerWidth - PADDING;
    const svgEl = wrapperRef.current?.querySelector("svg");

    if (signType === "G1") {
      // Для G1, ми масштабуємо блок розмітки, базова ширина якого 400px.
      const markingBaseWidth = 400;
      const finalScale = Math.min(availableWidth / markingBaseWidth, 1.0);
      setScale(finalScale);

      // Нам все ще потрібно отримати розміри самого знака G1 для експорту та відображення розмірів.
      if (svgEl) {
        const width = parseFloat(svgEl.getAttribute("width"));
        const height = parseFloat(svgEl.getAttribute("height"));
        if (!isNaN(width) && !isNaN(height) && width > 0) {
          setOriginalSize({ width, height });
          setSignSize?.({ width, height });
        }
      }
    } else {
      // Існуюча логіка для знаків B1-B7
      if (!svgEl) return;

      const width = parseFloat(svgEl.getAttribute("width"));
      const height = parseFloat(svgEl.getAttribute("height"));

      if (!isNaN(width) && !isNaN(height) && width > 0) {
        setOriginalSize({ width, height });
        setSignSize?.({
          width: shouldReduceSize ? width / 2 : width,
          height: shouldReduceSize ? height / 2 : height,
        });

        const desiredScale = 0.67;
        const finalScale = Math.min(desiredScale, availableWidth / width);
        setScale(finalScale);
      }
    }
  }, [signType, params, setSignSize, shouldReduceSize]);

  if (!Component) {
    return <div>Оберіть тип знака для прев'ю</div>;
  }

  if (mode === "export") {
    const exportScale = shouldReduceSize ? 0.5 : 1.0;
    const sign = <Component params={params} />;

    if (signType === "G1") {
      return (
        <div
          ref={wrapperRef}
          style={{
            transform: `scale(${exportScale})`,
            transformOrigin: "top left",
          }}
        >
          {sign}
        </div>
      );
    }

    const finalWidth = originalSize.width * exportScale;
    const finalHeight = originalSize.height * exportScale;
    const border = 2;

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
              rx={45 * exportScale}
            />
            <g
              transform={`translate(${border / 2}, ${
                border / 2
              }) scale(${exportScale})`}
            >
              {sign}
            </g>
          </svg>
        ) : (
          sign
        )}
      </div>
    );
  } else {
    // --- Логіка для режиму PREVIEW ---

    // --- ЗМІНА 2: Оновлений блок рендерингу для G1 ---
    if (signType === "G1") {
      const g1Sign = <G1 params={params} />;
      const g1ScaleFactor = 0.2; // Масштаб для маленького прев'ю знака
      const MARKING_BASE_WIDTH = 400;
      const MARKING_BASE_HEIGHT = 125;

      return (
        <div className="flex w-full flex-col items-start lg:items-center">
          {/* Статичне прев'ю самого знака G1 */}
          <div
            style={{
              width: "177px",
              height: "177px",
              backgroundColor: "#808080",
              filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div
              ref={wrapperRef}
              style={{
                transform: `scale(${g1ScaleFactor})`,
                transformOrigin: "center center",
              }}
            >
              {g1Sign}
            </div>
          </div>

          {/* Адаптивний контейнер для розмітки */}
          <div className="mt-4 w-full">
            <hr className="my-2 border-gray-200 mb-8" />
            <div
              style={{
                width: MARKING_BASE_WIDTH * scale,
                height: MARKING_BASE_HEIGHT * scale,
              }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <RoadMarkingPreview
                  markingType={params.markingType}
                  g1Sign={g1Sign}
                  g1Params={params}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Рендеринг для знаків B1-B7
    const sign = <Component params={params} />;
    return (
      <div
        style={{
          width: originalSize.width * scale,
          height: originalSize.height * scale,
          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))",
        }}
      >
        <div
          ref={wrapperRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {sign}
        </div>
      </div>
    );
  }
}

export default SignPreview;