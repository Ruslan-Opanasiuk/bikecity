// src/App.jsx
import { useEffect, useState, useRef } from "react";
import { saveAs } from "file-saver";

import SignSelector from "./components/SignSelector";
import SignPreview from "./components/SignPreview";
import B1B6SettingsPanel from "./components/settings/B1B6SettingsPanel";
import B4ItemSettings from "./components/settings/B4ItemSettings";

// Імпортуємо обидва base64-шрифти як рядки
import mediumData from "./utils/export/RoadUA-Medium.ttf.base64?raw";
import boldData   from "./utils/export/RoadUA-Bold.ttf.base64?raw";

function App() {
  const [signType, setSignType] = useState("В1");

  const [b1b3Params, setB1b3Params] = useState({
    tableType: "permanent",
    numberType: "national",
    routeNumber: "",
    direction: "straight",
  });
  const [params, setParams] = useState(b1b3Params);

  const isB1toB3 = ["В1", "В2", "В3"].includes(signType);
  const isB4toB6 = ["В4", "В5", "В6"].includes(signType);
  const isB4 = signType === "В4";

  const enableDirection = isB1toB3 && signType !== "В2";
  const allowNoneOption = isB4toB6;

  const handleSignTypeChange = (newType) => {
    setSignType(newType);
    if (["В1", "В2", "В3"].includes(newType)) {
      setParams(b1b3Params);
    } else {
      setParams({
        tableType: "permanent",
        numberType: "none",
        routeNumber: "",
        direction: "straight",
        forceUniformTextSize: false, // ← оце треба!
        b4Items: [
          {
            mainText: "",
            subText: "",
            direction: "straight",
            routeNumber: "",
          },
        ],
      });
    }
  };

  const setParamsAndStore = (newParams) => {
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
    const updatedItems = [...params.b4Items];
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

  // Реф на контейнер, всередині якого лежить <svg>
  const previewRef = useRef(null);

  // --- Експорт у SVG ---
  const handleExportSVG = () => {
    const svgNode = previewRef.current.querySelector("svg");
    if (!svgNode) return;

    // 1) Запам’ятовуємо «оригінальні» піксельні розміри
    const origW = svgNode.getAttribute("width");
    const origH = svgNode.getAttribute("height");

    // 2) Серіалізуємо SVG у рядок
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgNode);

    // 3) Додаємо xmlns, якщо його немає
    if (!/xmlns=/.test(source)) {
      source = source.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }

    // 4) Вбудовуємо обидва шрифти та правило для <text>
    const defs = `
      <defs>
        <style type="text/css">
          @font-face {
            font-family: 'RoadUA';
            src: url(data:font/ttf;base64,${mediumData}) format('truetype');
            font-weight: 500;
          }
          @font-face {
            font-family: 'RoadUA';
            src: url(data:font/ttf;base64,${boldData}) format('truetype');
            font-weight: 700;
          }
          text {
            font-family: 'RoadUA' !important;
            font-weight: 700 !important;
            font-feature-settings: 'ss02' !important;
          }
        </style>
      </defs>`;
    source = source.replace(/<svg[^>]*>/, (m) => m + defs);

    // 5) Додаємо viewBox, щоб внутрішні px масштабувалися
    source = source.replace(
      /<svg([^>]*)>/,
      `<svg$1 viewBox="0 0 ${origW} ${origH}">`
    );

    // 6) Перетворюємо атрибути width/height у mm (1px = 1mm)
    source = source
      .replace(/width="(\d+)"/, 'width="$1mm"')
      .replace(/height="(\d+)"/, 'height="$1mm"');

    // 7) Створюємо Blob і завантажуємо файл
    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    saveAs(blob, `${signType}.svg`);
  };


  // --- Експорт у PNG через canvas ---
  const handleExportPNG = async () => {
  await document.fonts.ready;

  const svgNode = previewRef.current.querySelector("svg");
  if (!svgNode) return;

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgNode);

  if (!/xmlns=/.test(source)) {
    source = source.replace(
      "<svg",
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }

  const defs = `
    <defs>
      <style type="text/css">
        @font-face {
          font-family: 'RoadUA';
          src: url(data:font/ttf;base64,${mediumData}) format('truetype');
          font-weight: 500;
        }
        @font-face {
          font-family: 'RoadUA';
          src: url(data:font/ttf;base64,${boldData}) format('truetype');
          font-weight: 700;
        }
        text {
          font-family: 'RoadUA' !important;
          font-weight: 700 !important;
          font-feature-settings: 'ss02' !important;
        }
      </style>
    </defs>`;

  source = source.replace(/<svg[^>]*>/, (m) => m + defs);

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const widthMm = parseFloat(svgNode.getAttribute("width"));
    const heightMm = parseFloat(svgNode.getAttribute("height"));

    const scale = 3.7795; // 1 мм = 3.7795 px
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(widthMm * scale);
    canvas.height = Math.round(heightMm * scale);

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale); // Щоб координати відповідали мм
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
};


  return (
    <div className="min-h-screen bg-gray-50 text-center p-6">
      <h1 className="text-3xl font-bold mb-6">
        Конструктор Велосипедного маршрутного орієнтування
      </h1>

      <SignSelector signType={signType} setSignType={handleSignTypeChange} />

      <div className="flex justify-between max-w-4xl mx-auto mb-6 p-4">
        <div className="flex justify-end w-1/2 p-2" ref={previewRef}>
          <SignPreview signType={signType} params={safeParams} />
        </div>

        <div className="flex flex-col gap-4 justify-start w-1/2 p-2">
          {(isB1toB3 || isB4toB6) && (
            <B1B6SettingsPanel
              label={`Налаштування ${signType}`}
              params={safeParams}
              setParams={setParamsAndStore}
              enableDirection={enableDirection}
              allowNoneOption={allowNoneOption}
            />
          )}
          {isB4 &&
            params.b4Items.map((item, i) => (
              <B4ItemSettings
                key={i}
                index={i}
                label={`Напрямок ${i + 1}`}
                params={item}
                setParams={(newItem) => updateB4Item(i, newItem)}
                tableType={params.tableType}
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
