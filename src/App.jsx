import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { createRoot } from "react-dom/client";

import SignSelector from "./components/SignSelector";
import SignPreview from "./components/SignPreview";
import B1B7SettingsPanel from "./components/settings/B1B7SettingsPanel";
import B4B7ItemSettings from "./components/settings/B4B7ItemSettings";

function App() {
  const [signType, setSignType] = useState("B1");

  const [b1b3Params, setB1b3Params] = useState({
    tableType: "permanent",
    numberType: "national",
    routeNumber: "",
    direction: "straight",
  });

  const [params, setParams] = useState(b1b3Params);

  const isB1toB3 = ["B1", "B2", "B3"].includes(signType);
  const isB4orB7 = ["B4", "B7"].includes(signType);
  const usesB1B6Panel = ["B1", "B2", "B3", "B4", "B7"].includes(signType);

  const enableDirection = isB1toB3 && signType !== "B2";
  const allowNoneOption = signType === "B4";

  const handleSignTypeChange = (newType) => {
    setSignType(newType);

    if (["B1", "B2", "B3"].includes(newType)) {
      setParams(b1b3Params);
    } else if (["B4", "B7"].includes(newType)) {
      const defaultCount = newType === "B7" ? 4 : 1;
      setParams({
        tableType: "permanent",
        numberType: "none",
        routeNumber: "",
        direction: "straight",
        forceUniformTextSize: false,
        objectCount: defaultCount,
        b4Items: Array.from({ length: defaultCount }, () => ({
          mainText: "",
          subText: "",
          direction: "straight",
          routeNumber: "",
          icon: "",
          isTemporaryRoute: false,
          isUrbanCenter: false,
          forcedFontSize1: null,
          alignedTextX: null,
        })),
      });
    } else {
      setParams({});
    }
  };

  const setParamsAndStore = (newParams) => {
    if (signType === "B7") {
      const count = Math.max(1, Math.min(20, newParams.objectCount || 1));
      const existing = newParams.b4Items || [];
      const padded = Array.from({ length: count }, (_, i) => {
        return existing[i] || {
          mainText: "",
          subText: "",
          direction: "straight",
          routeNumber: "",
          icon: "",
          isTemporaryRoute: false,
          isUrbanCenter: false,
          forcedFontSize1: null,
          alignedTextX: null,
        };
      });

      newParams.b4Items = padded;
    }

    setParams(newParams);

    if (isB1toB3) setB1b3Params(newParams);
  };

  const safeParams = {
    ...params,
    numberType:
      isB1toB3 && params.numberType === "none"
        ? "regional"
        : params.numberType,
  };

  const updateB4Item = (index, updatedItem) => {
    const updatedItems = [...(params.b4Items || [])];
    updatedItems[index] = updatedItem;
    setParams({ ...params, b4Items: updatedItems });
  };

  useEffect(() => {
    if (params.tableType === "temporary") {
      const items = params.b4Items || [];
      const hadTemp = items.some((i) => i.isTemporaryRoute);
      if (hadTemp) {
        setParams({
          ...params,
          b4Items: items.map((i) => ({ ...i, isTemporaryRoute: false })),
        });
      }
    }
  }, [params.tableType]);

  const renderForExport = async () => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    return new Promise((resolve) => {
      const root = createRoot(container);
      root.render(
        <SignPreview signType={signType} params={safeParams} mode="export" />
      );

      setTimeout(() => {
        const svgNode = container.querySelector("svg");
        resolve({ svgNode, root, container });
      }, 100);
    });
  };

  const handleExportSVG = async () => {
    const { svgNode, root, container } = await renderForExport();
    if (!svgNode) return;

    const origW = svgNode.getAttribute("width");
    const origH = svgNode.getAttribute("height");

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgNode);

    if (!/xmlns=/.test(source)) {
      source = source.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }

    source = source.replace(
      /<svg([^>]*)>/,
      `<svg$1 viewBox="0 0 ${origW} ${origH}">`
    );

    source = source
      .replace(/width="(\d+)"/, 'width="$1mm"')
      .replace(/height="(\d+)"/, 'height="$1mm"');

    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    saveAs(blob, `${signType}.svg`);

    root.unmount();
    document.body.removeChild(container);
  };

  const handleExportPNG = async () => {
    await document.fonts.ready;

    const { svgNode, root, container } = await renderForExport();
    if (!svgNode) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgNode);

    if (!/xmlns=/.test(source)) {
      source = source.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }

    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const widthMm = parseFloat(svgNode.getAttribute("width"));
      const heightMm = parseFloat(svgNode.getAttribute("height"));

      const scale = 3.7795;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(widthMm * scale);
      canvas.height = Math.round(heightMm * scale);

      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        saveAs(pngBlob, `${signType}.png`);
      });
    };

    img.onerror = (e) => {
      console.error("Error loading SVG for PNG export", e);
    };

    img.src = url;

    root.unmount();
    document.body.removeChild(container);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-center p-6">
      <h1 className="text-3xl font-bold mb-6">
        Конструктор велосипедного маршрутного орієнтування
      </h1>

      <SignSelector signType={signType} setSignType={handleSignTypeChange} />

      <div className="flex justify-between max-w-4xl mx-auto mb-6 p-4">
        <div className="flex justify-end w-1/2 p-2">
          <SignPreview signType={signType} params={safeParams} />
        </div>

        <div className="flex flex-col gap-4 justify-start w-1/2 p-2">
          {usesB1B6Panel && (
            <B1B7SettingsPanel
              label={`Налаштування ${signType}`}
              params={safeParams}
              setParams={setParamsAndStore}
              enableDirection={enableDirection}
              allowNoneOption={allowNoneOption}
            />
          )}
          {isB4orB7 &&
            params.b4Items?.map((item, i) => (
              <B4B7ItemSettings
                key={i}
                index={i}
                label={`Обʼєкт ${i + 1}`}
                params={item}
                setParams={(newItem) => updateB4Item(i, newItem)}
                tableType={params.tableType}
                isB7={signType === "B7"}
              />
            ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={handleExportSVG}
          className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700"
        >
          Експорт SVG
        </button>
        <button
          onClick={handleExportPNG}
          className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700"
        >
          Експорт PNG
        </button>
      </div>
    </div>
  );
}

export default App;
