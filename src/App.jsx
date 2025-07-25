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

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      {/* --- ЗМІНА: Повертаємо все в єдиний Grid-макет --- */}
      <main className="grid grid-cols-1 lg:grid-cols-[170px_min-content_450px_200px] gap-4 max-w-screen-2xl mx-auto justify-center items-start">
              
        {/* Заголовок як перший елемент сітки, що займає всі колонки */}
        <header className="col-span-full p-4 order-first">
          <h1 className="text-[24px] font-bold text-left flex items-center gap-4">
            <BicycleIconInFrame />
            <span>Конструктор велосипедного маршрутного орієнтування</span>
          </h1>
        </header>

        {/* Сайдбар (на моб. перший) */}
        <div className="p-4 order-1 lg:order-none">
          <SignTypeSidebar
            signType={signType}
            setSignType={handleSignTypeChange}
          />
        </div>

        {/* Прев'ю (на моб. третій) */}
        <div className="p-4 order-3 lg:order-none">
          <SignPreview signType={signType} params={safeParams} setSignSize={setSignSize} />
        </div>

        {/* Налаштування (на моб. другий) */}
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
            />
          )}
        </div>

        {/* Експорт (на моб. четвертий) */}
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