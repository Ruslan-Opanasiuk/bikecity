import { useEffect, useRef, useState } from "react";
import B1 from "../utils/B1";
import B2 from "../utils/B2";
import B3 from "../utils/B3";
import B4 from "../utils/B4";

const components = { В1: B1, В2: B2, В3: B3, В4: B4 };

function SignPreview({ signType, params, mode = "preview" }) {
  const Component = components[signType];
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
    if (mode === "export" && svgRef.current) {
      const svgEl = svgRef.current.querySelector("svg");
      if (svgEl) {
        const width = parseFloat(svgEl.getAttribute("width"));
        const height = parseFloat(svgEl.getAttribute("height"));
        if (!isNaN(width) && !isNaN(height)) {
          setDimensions({ width, height });
        }
      }
    }
  }, [mode, signType, params]);

  if (!Component) {
    return <div>Тут буде прев’ю {signType}</div>;
  }

  const sign = <Component params={params} />;

  if (mode === "export") {
    if (!dimensions) {
      return <div ref={svgRef}>{sign}</div>; // перший рендер — просто SVG
    }

    const { width, height } = dimensions;
    return (
      <svg
        width={width + 2}
        height={height + 2}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={0}
          y={0}
          width={width + 2}
          height={height + 2}
          rx={46}
          fill="#000000"
        />
        <g transform="translate(1,1)">{sign}</g>
      </svg>
    );
  }

  return (
    <div
      style={{
        display: "inline-block",
        filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))",
      }}
    >
      {sign}
    </div>
  );
}

export default SignPreview;
