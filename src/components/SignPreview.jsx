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
  const [scale, setScale] = useState(0.67);

  const shouldReduceSize = (signType === 'B2' || signType === 'B3') && params.isReduced;

  useEffect(() => {
    const svgEl = wrapperRef.current?.querySelector("svg");
    if (!svgEl) return;
    
    const width = parseFloat(svgEl.getAttribute("width"));
    const height = parseFloat(svgEl.getAttribute("height"));

    if (!isNaN(width) && !isNaN(height) && width > 0) {
      setOriginalSize({ width, height });
      setSignSize?.({
        width: shouldReduceSize ? width / 2 : width,
        height: shouldReduceSize ? height / 2 : height,
      });

      const PADDING = 64;
      const availableWidth = window.innerWidth - PADDING;
      let finalScale;

      if (signType === 'G1') {
        finalScale = Math.min(availableWidth / width, 1.0); 
      } else {
        const desiredScale = 0.67;
        finalScale = Math.min(desiredScale, availableWidth / width);
      }
      setScale(finalScale);
    }
  }, [signType, params, setSignSize, shouldReduceSize]);

  if (!Component) {
    return <div>Оберіть тип знака для прев'ю</div>;
  }
  
  if (mode === 'export') {
    const exportScale = shouldReduceSize ? 0.5 : 1.0;
    const sign = <Component params={params} />;
    
    if (signType === 'G1') {
      return (
        <div ref={wrapperRef} style={{ transform: `scale(${exportScale})`, transformOrigin: "top left" }}>
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
    // --- Логіка для режиму PREVIEW ---

    if (signType === 'G1') {
      const g1Sign = <G1 params={params} />;
      const g1ScaleFactor = 0.2; 

      return (
        <div className="flex flex-col items-center w-full">
          {/* ЗМІНА 1: Контейнер 300px, вирівнювання по верху (items-start) */}
          <div className="w-full flex items-start justify-center" style={{ height: '200px' }}>
            <div style={{
              width: `${originalSize.width * g1ScaleFactor}px`,
              height: `${originalSize.height * g1ScaleFactor}px`,
              filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <div ref={wrapperRef} style={{ transform: `scale(${g1ScaleFactor})`, transformOrigin: "center center" }}>
                {g1Sign}
              </div>
            </div>
          </div>
          
          <div className="w-full mt-4">
            {/* ЗМІНА 2: Оновлено стиль заголовка та додано відступ */}
            <h2 className="text-[16px] font-bold pt-4 text-left mb-2">
              Приклад візуалізації ГМО на розмітці:
            </h2>
            <RoadMarkingPreview
              markingType={params.markingType}
              g1Sign={g1Sign}
              g1Params={params}
            />
          </div>
        </div>
      );
    }
    
    const sign = <Component params={params} />;
    return (
      <div style={{ width: originalSize.width * scale, height: originalSize.height * scale, filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))" }}>
        <div ref={wrapperRef} style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {sign}
        </div>
      </div>
    );
  }
}

export default SignPreview;