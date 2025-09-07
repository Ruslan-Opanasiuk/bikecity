import { useEffect, useState } from "react";

import SignTypeSidebar from "./components/SignTypeSidebar";
import SignPreview from "./components/SignPreview";
import B1B7SettingsPanel from "./components/settings/B1B7SettingsPanel";
import B4B7ItemsPanel from "./components/settings/B4B7ItemSettings";
import ExportBlock from "./components/ExportBlock";
import { exportSVG, exportPNG, exportPDF } from "./utils/exportHelpers";
import PathConfigs from "./config/PathConfigs";

import {
  defaultB1B3Params,
  defaultB4Params,
  defaultB7Params,
} from "./config/defaultParams";

// Імпортуємо допоміжні функції для обчислення макету
import { computeTextLayout } from "./utils/TextLayout";
import { getRouteBadgeGroupWidth } from "./components/svg/RouteBadgeGroup";

// Додаємо конфігурацію для іконок, які не є стрічковими
const ribbonOrCircleIcons = new Set([
  "cityCentre", "bridge", "interchange", "bicycleRoute", "district", "other", "water", "streetNetwork"
]);

const BicycleIconInFrame = () => {
  const icon = PathConfigs.bicycle;
  const desiredWidth = 36;
  const boxSize = 48;
  const scale = desiredWidth / icon.width;
  const finalHeight = icon.height * scale;
  const translateX = (boxSize - desiredWidth) / 2;
  const translateY = (boxSize - finalHeight) / 2;

  return (
    <svg width={boxSize} height={boxSize} viewBox={`0 0 ${boxSize} ${boxSize}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={boxSize} height={boxSize} rx="7" fill="#005187" />
      <g transform={`translate(${translateX}, ${translateY}) scale(${scale})`}>
        <path d={icon.d} fill="white" fillRule="evenodd"/>
      </g>
    </svg>
  );
};

function App() {
  const [signType, setSignType] = useState("B1");
  const [params, setParams] = useState(defaultB1B3Params);
  const [signSize, setSignSize] = useState(null);
  const [fontSizes, setFontSizes] = useState([]);

  // --- НОВИЙ СТАН ДЛЯ ВІДСТЕЖЕННЯ ПЕРЕПОВНЕННЯ ---
  const [isTooLongArr, setIsTooLongArr] = useState([]);

  const isB1toB3 = ["B1", "B2", "B3"].includes(signType);
  const isB4orB7 = ["B4", "B7"].includes(signType);
  const usesB1B6Panel = ["B1", "B2", "B3", "B4", "B7"].includes(signType);
  const enableDirection = isB1toB3 && signType !== "B2";

  const handleSignTypeChange = (newType) => {
    setSignType(newType);
    if (["B1", "B2", "B3"].includes(newType)) setParams({ ...defaultB1B3Params });
    else if (newType === "B4") setParams({ ...defaultB4Params });
    else if (newType === "B7") setParams({ ...defaultB7Params });
    else setParams({});
  };

  const setParamsAndStore = (newParams) => {
    if (signType === "B7") {
      const count = Math.max(1, Math.min(20, newParams.objectCount || 1));
      const existing = newParams.b4Items || [];
      const padded = Array.from({ length: count }, (_, i) => (
        existing[i] || { mainText: "", subText: "", direction: "straight", routeNumber: "", icon: "", isTemporaryRoute: false, isUrbanCenter: false, forcedFontSize1: null, alignedTextX: null, distance: "" }
      ));
      newParams.b4Items = padded;
    }
    setParams(newParams);
  };

  const safeParams = { ...params, numberType: isB1toB3 && params.numberType === "none" ? "regional" : params.numberType };

  const updateB4Item = (index, updatedItem) => {
    const updatedItems = [...(params.b4Items || [])];
    updatedItems[index] = updatedItem;
    setParams({ ...params, b4Items: updatedItems });
  };

  useEffect(() => {
    if (params.tableType === "temporary") {
      const items = params.b4Items || [];
      if (items.some((i) => i.isTemporaryRoute)) {
        setParams(p => ({ ...p, b4Items: p.b4Items.map((i) => ({ ...i, isTemporaryRoute: false })) }));
      }
    }
  }, [params.tableType]);

  // --- НОВИЙ ЕФЕКТ ДЛЯ ОБЧИСЛЕННЯ ПЕРЕПОВНЕННЯ ---
  useEffect(() => {
    if (isB4orB7 && safeParams.b4Items) {
      const newIsTooLongArr = safeParams.b4Items.map(itemParams => {
        // Логіка для розрахунку availableTextWidthMain
        // (скопійована з компонента B7, оскільки вона універсальна)
        const iconKey = itemParams.icon === "streetNetwork" && itemParams.isUrbanCenter ? "cityCentre" : itemParams.icon;
        const iconConfig = iconKey ? PathConfigs[iconKey] : null;
        const isRibbonOrCircle = !ribbonOrCircleIcons.has(iconKey);
        const temporaryOffset = itemParams.isTemporaryRoute ? 63 : 0;
        
        const textX = (isRibbonOrCircle ? 136 + ((iconConfig?.width || 0) * (iconConfig?.scale2 || 1)) + 20 : 136) + temporaryOffset;
        const badgeGroupWidth = getRouteBadgeGroupWidth({ ...safeParams, ...itemParams });
        const availableTextWidthMain = 600 - 28 - textX - badgeGroupWidth;
        const availableTextWidthSecondary = 600 - 28 - textX;
        
        // Викликаємо computeTextLayout для перевірки з усіма параметрами
        const layout = computeTextLayout({
          ...safeParams,
          ...itemParams,
          textX,
          availableTextWidthMain,
          availableTextWidthSecondary,
        });
        
        const shouldBeBlocked = layout.isOverflowing && 
                                (layout.mainTextLines.length > 1 || itemParams.icon === "water");

        return shouldBeBlocked;
      });
      setIsTooLongArr(newIsTooLongArr);
    } else {
      setIsTooLongArr([]);
    }
}, [isB4orB7, safeParams]);;

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <main className="grid grid-cols-1 lg:grid-cols-[170px_434px_500px_250px] gap-4 max-w-screen-2xl mx-auto justify-center items-start">
        <header className="col-span-full p-4 order-first">
          <h1 className="text-[24px] font-bold text-left flex items-center gap-4">
            <div className="flex-shrink-0">
              <BicycleIconInFrame />
            </div>
            <span>
              Конструктор велосипедного маршрутного орієнтування
            </span>
          </h1>
        </header>

        <div className="p-4 order-1 lg:order-none">
          <SignTypeSidebar
            signType={signType}
            setSignType={handleSignTypeChange}
          />
        </div>

        <div className="w-full lg:w-[434px] p-4 order-3 lg:order-none flex justify-start lg:justify-center items-start">
          <SignPreview
            signType={signType}
            params={safeParams}
            setSignSize={setSignSize}
            onFontRender={setFontSizes}
          />
        </div>

        <div className="p-4 flex flex-col gap-4 order-2 lg:order-none">
          {usesB1B6Panel && (
            <B1B7SettingsPanel
              label={`Налаштування ${signType}:`}
              params={safeParams}
              setParams={setParamsAndStore}
              enableDirection={enableDirection}
              signSize={signSize}
            />
          )}
          {isB4orB7 && safeParams.b4Items && (
            <B4B7ItemsPanel
              key={signType}
              items={safeParams.b4Items}
              setItemParams={(i, newItem) => updateB4Item(i, newItem)}
              tableType={safeParams.tableType}
              isB7={signType === "B7"}
              // --- ПЕРЕДАЄМО НОВИЙ МАСИВ ЗІ СТАНОМ ПЕРЕПОВНЕННЯ ---
              isTooLongArr={isTooLongArr}
            />
          )}
        </div>

        <div className="p-4 order-4 lg:order-none">
          <ExportBlock
            signType={signType}
            params={safeParams}
            exportSVG={exportSVG}
            exportPNG={exportPNG}
            exportPDF={exportPDF}
          />
        </div>
      </main>
    </div>
  );
}

export default App;