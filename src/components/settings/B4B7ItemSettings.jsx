import { useEffect, useState } from "react";
import locationTerms from "../../config/locationTerms";
import PathConfigs from "../../config/PathConfigs";
import { Input } from "@/components/ui/input";
import FormRow from "../ui/FormRow";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

/**
 * 🛠 Панель для редагування будь-якого об'єкта B4/B7 із меню вибору.
 */
function B4B7ItemsPanel({
  items,
  setItemParams,
  tableType,
  isB7,
  isTooLongArr = [],
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (selectedIndex >= items.length) setSelectedIndex(0);
  }, [items.length]);

  const selectOptions = items.map((item, i) => {
    let short = "";
    if (
      item?.icon &&
      item?.mainText &&
      locationTerms[item.icon] &&
      locationTerms[item.icon][item.mainText]
    ) {
      short = locationTerms[item.icon][item.mainText].ua;
    }
    const name = item?.subText?.trim() || "";
    let label = short;
    if (short && name) label = `${short} ${name}`;
    else if (name) label = name;
    else if (!short && !name) label = `Обʼєкт ${i + 1}`;

    return { value: `${i}`, label };
  });

  const selectedItem = items[selectedIndex];
  const mainSelectStyles = "w-[250px] text-[13px] text-gray-500 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500";

  // --- ЗМІНА 1: Відступи зменшено ---
  return (
    <div className="space-y-2 mt-10">
      <h4 className="text-left font-semibold text-gray-800 pt-2">
        Налаштування обʼєкту {selectedIndex + 1}:
      </h4>

      <FormRow label="Обрати обʼєкт:">
        <Select
          value={String(selectedIndex)}
          onValueChange={(v) => setSelectedIndex(Number(v))}
        >
          <SelectTrigger className={mainSelectStyles}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormRow>
      
      {selectedItem && (
        <>
          <hr className="my-2 border-gray-200" /> 
          
          <B4B7ItemSettings
            key={selectedIndex}
            index={selectedIndex}
            params={selectedItem}
            setParams={(newParams) => setItemParams(selectedIndex, newParams)}
            isTooLong={isTooLongArr[selectedIndex]}
            tableType={tableType}
            isB7={isB7}
          />
        </>
      )}
    </div>
  );
}

// ==============================================================================
// === НАЛАШТУВАННЯ ДЛЯ ОДНОГО ОБ'ЄКТА ===========================================
// ==============================================================================

function B4B7ItemSettings({
  index,
  params,
  setParams,
  isTooLong,
  tableType,
  isB7,
}) {
  const handleDirectionChange = (value) => {
    setParams({ ...params, direction: value });
  };

  const handleIconChange = (value) => {
    const newIcon = value === "none" ? null : value;
    const isCenterOrRoute = newIcon === "cityCentre" || newIcon === "bicycleRoute";
    const isChangingFromBicycleToOther = params.icon === "bicycleRoute" && newIcon !== "bicycleRoute";
    const baseParams = {
      ...params,
      icon: newIcon,
      mainText: "",
      subText: isCenterOrRoute ? "" : params.subText,
      isUrbanCenter: false,
      customUa: "",
      customEn: "",
      ...(isChangingFromBicycleToOther && { routeNumber: "" }),
    };
    if (newIcon === "bicycleRoute") {
      const allowed = ["showEurovelo", "showVeloParking", "showVeloSTO"];
      const firstActive = allowed.find((key) => params[key]);
      const cleared = allowed.reduce((acc, key) => {
        acc[key] = key === firstActive;
        return acc;
      }, {});
      setParams({ ...baseParams, ...cleared });
    } else {
      setParams(baseParams);
    }
  };

  const handleMainTextChange = (value) => {
    const clearSubText = value === "Центр міста" || value === "Bеломаршрут";
    const actualValue = value === "Регіональний / локальний" ? "Регіональний" : value;
    setParams({ ...params, mainText: actualValue, subText: clearSubText ? "" : params.subText });
  };

  const handleRouteNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) value = value.slice(1);
    value = value.slice(0, 2);
    setParams({ ...params, routeNumber: value });
  };

  const handleUrbanCenterToggle = (e) => setParams({ ...params, isUrbanCenter: e.target.checked });
  const handleCustomUaChange = (e) => setParams({ ...params, customUa: e.target.value });
  const handleCustomEnChange = (e) => setParams({ ...params, customEn: e.target.value });
  const handleTemporaryRouteToggle = (e) => setParams({ ...params, isTemporaryRoute: e.target.checked });

  useEffect(() => {
    if (tableType === "seasonal" && params.mainText === "Національний") {
      setParams({ ...params, mainText: "Регіональний" });
    }
  }, [tableType, params.mainText]);

  const allDirections = [
    { value: "straight", label: "Прямо", icon: PathConfigs.smallArrow },
    { value: "left", label: "Ліворуч", icon: PathConfigs.smallArrow },
    { value: "right", label: "Праворуч", icon: PathConfigs.smallArrow },
    { value: "straight-left", label: "Прямо і ліворуч", icon: PathConfigs.smallArrow },
    { value: "straight-right", label: "Прямо і праворуч", icon: PathConfigs.smallArrow },
    { value: "end", label: "Кінець маршруту", icon: null },
  ];
  const directions = index === 0 ? allDirections : allDirections.filter((d) => d.value !== "end");

  const iconLabelsUa = { cityCentre: "Центр населеного пункту", interchange: "Транспортна розв'язка", bridge: "Міст", port: "Порт", airport: "Аеропорт", settlement: "Населений пункт", railStation: "Залізничний об'єкт", busStation: "Автобусний об'єкт", water: "Водний об'єкт", bicycleRoute: "Веломаршрут", streetNetwork: "Вулично-дорожня мережа", district: "Частина населеного пункту", other: "Інший об'єкт" };
  const iconOptions = Object.keys(locationTerms).map((key) => {
    let iconKey = key;
    if (key === "water") iconKey = "waves";
    if (key === "bicycleRoute") iconKey = "bicycle";
    return { value: key, label: iconLabelsUa[key] || key, icon: PathConfigs[iconKey] };
  });

  let categoryOptionsRaw = params.icon && locationTerms[params.icon] ? Object.keys(locationTerms[params.icon]).filter((key) => { if (tableType === "seasonal" && key === "Національний") return false; return true; }) : [];
  let categoryOptions = categoryOptionsRaw;
  if (params.direction === "end") {
    const hasRegional = categoryOptionsRaw.includes("Регіональний");
    const hasLocal = categoryOptionsRaw.includes("Локальний");
    if (hasRegional || hasLocal) {
      categoryOptions = categoryOptionsRaw.filter((item) => item !== "Регіональний" && item !== "Локальний");
      categoryOptions.unshift("Регіональний / локальний");
    }
  }

  const isBicycleRoute = params.icon === "bicycleRoute" || params.mainText === "Bеломаршрут";
  const shouldShowNameField = !isBicycleRoute && params.icon !== "cityCentre" && !["Центр міста", "Bеломаршрут"].includes(params.mainText);
  const inputClasses = "w-[250px] text-[13px] text-gray-500 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500";

  // --- ЗМІНА 1: Відступи зменшено ---
  return (
    <div className="space-y-2 w-full">
      {!isB7 && (
        <FormRow label="Напрямок:">
          <Select value={params.direction} onValueChange={handleDirectionChange}>
            <SelectTrigger className={inputClasses}><SelectValue /></SelectTrigger>
            <SelectContent>
              {directions.map(({ value, label, icon }) => {
                const rotation = B4B7ItemSettings.directionLayout[value]?.rotation || 0;
                return (
                  <SelectItem key={value} value={value} className="text-[13px]">
                    <div className="flex items-center gap-2">
                      {icon ? (<svg width={24} height={24} viewBox={`0 0 ${icon.width} ${icon.height}`} className="text-gray-700"><path d={icon.d} fill="currentColor" fillRule="evenodd" transform={`rotate(${rotation} ${icon.width / 2} ${icon.height / 2}) scale(${icon.scale})`} /></svg>) : (<span className="w-6 inline-block" />)}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </FormRow>
      )}

      <FormRow label="Піктограма:">
        <Select value={params.icon ?? ""} onValueChange={handleIconChange}>
          <SelectTrigger className={inputClasses}><SelectValue placeholder="Оберіть піктограму" /></SelectTrigger>
          <SelectContent>
            {iconOptions.map(({ value, label, icon }) => (
              <SelectItem key={value} value={value} className="text-[13px]">
                <div className="flex items-center gap-2">
                  {icon ? (<svg width={24} height={24} viewBox={`0 0 ${icon.width} ${icon.height}`} className="text-gray-700"><path d={icon.d} fill="currentColor" fillRule="evenodd" /></svg>) : (<span className="w-6 inline-block" />)}
                  <span>{label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormRow>

      {params.icon === "streetNetwork" && (
        <FormRow label="">
        <label htmlFor="isUrbanCenter" className="inline-flex items-center cursor-pointer gap-3">
          <div className="relative">
          <input
            type="checkbox"
            id="isUrbanCenter"
            className="sr-only peer"
            checked={params.isUrbanCenter || false}
            onChange={handleUrbanCenterToggle}
          />
          <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600"></div>
          <div className="absolute left-0.5 top-0.5 bg-white border-gray-300 border rounded-full h-3 w-3 transition-transform peer-checked:translate-x-3"></div>
          </div>
          <span className="text-[13px] text-gray-700">
          Є центром населеного пункту
          </span>
        </label>
        </FormRow>
      )}
      {params.icon === "other" ? ( <FormRow label="Категорія:"><div className="flex flex-col gap-1"><Input value={params.customUa || ""} onChange={handleCustomUaChange} placeholder="Введіть українську назву" className={inputClasses}/><Input value={params.customEn || ""} onChange={handleCustomEnChange} placeholder="Введіть переклад англійською" className={inputClasses}/></div></FormRow> ) : ( <FormRow label="Категорія:"><Select value={params.mainText} onValueChange={handleMainTextChange}><SelectTrigger className={inputClasses}><div className="truncate">{params.direction === "end" && (params.mainText === "Регіональний" || params.mainText === "Локальний") ? "Регіональний / локальний" : params.mainText || "Оберіть категорію"}</div></SelectTrigger><SelectContent>{categoryOptions.map((item) => ( <SelectItem key={item} value={item} className="text-[13px]">{item}</SelectItem> ))}</SelectContent></Select></FormRow> )}
      {isBicycleRoute ? ( <FormRow label="Номер маршруту:"><Input inputMode="numeric" pattern="\d*" value={params.routeNumber || ""} onChange={handleRouteNumberChange} placeholder="Введіть цифру від 1 до 99" className={inputClasses} /></FormRow> ) : shouldShowNameField && ( <FormRow label="Назва:"><Input value={params.subText || ""} onChange={(e) => setParams({ ...params, subText: e.target.value })} placeholder="Введіть українську назву" className={inputClasses} disabled={isTooLong} /></FormRow> )}
      {isB7 && (
  <FormRow label="Відстань (км):">
    <Input
      inputMode="numeric"
      // 2. Оновлений HTML-патерн для валідації
      pattern="(\d{1,2}(,\d)?|\d{3})"
      value={params.distance ?? ""}
      onChange={(e) => {
        let val = e.target.value.replace('.', ',');
        // 1. Оновлений регулярний вираз, що дозволяє ### або ##,#
        if (/^((\d{1,2}(,\d?)?)|(\d{1,3}))?$/.test(val)) {
          setParams({ ...params, distance: val });
        }
      }}
      // 3. Оновлена підказка
      placeholder="до 99,9 або до 999"
      className={inputClasses}
    />
  </FormRow>
)}
      {tableType !== "temporary" && !(isB7 && tableType === "seasonal") && (
        <FormRow label="">
        <label htmlFor="isTemporaryRoute" className="inline-flex items-center cursor-pointer gap-3">
          <div className="relative">
          <input
            type="checkbox"
            id="isTemporaryRoute"
            className="sr-only peer"
            checked={params.isTemporaryRoute || false}
            onChange={handleTemporaryRouteToggle}
          />
          <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600"></div>
          <div className="absolute left-0.5 top-0.5 bg-white border-gray-300 border rounded-full h-3 w-3 transition-transform peer-checked:translate-x-3"></div>
          </div>
          <span className="text-[13px] text-gray-700">
          Тимчасовий маршрут
          </span>
        </label>
        </FormRow>
      )}
      
      {/* --- ЗМІНА 2: Видалено pt-2 --- */}
      <div>
        <p className="font-semibold text-center text-[13px] mb-2 text-gray-800">Додаткові позначки:</p>
        <div className="flex justify-center border rounded-md overflow-hidden w-fit mx-auto">
          {[
            { key: "showEurovelo", iconKey: "eurovelo" },
            { key: "showVeloParking", iconKey: "veloParking" },
            { key: "showVeloSTO", iconKey: "veloSTO" },
          ].map(({ key, iconKey }) => {
            const icon = PathConfigs[iconKey];
            const isActive = params[key];
            return (
              <button
                key={key}
                type="button"
                className={`w-9 h-9 flex items-center justify-center border-r last:border-r-0 ${
                  isActive ? "bg-blue-600" : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => {
                  const activeKeys = ["showEurovelo", "showVeloParking", "showVeloSTO"].filter(k => params[k]);
                  const isTryingToAdd = !params[key];
                  const maxAllowed = params.icon === "bicycleRoute" ? 1 : 2;
                  if (isTryingToAdd && activeKeys.length >= maxAllowed) return;
                  setParams({ ...params, [key]: !params[key] });
                }}
              >
                <svg
                  width={20}
                  height={20}
                  viewBox={`0 0 ${icon.width} ${icon.height}`}
                  className={`mx-auto ${isActive ? 'text-white' : 'text-gray-700'}`}
                >
                  <path d={icon.d} fill="currentColor" fillRule="evenodd" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

B4B7ItemSettings.directionLayout = {
  straight: { rotation: 0 }, left: { rotation: -90 }, right: { rotation: 90 },
  "straight-left": { rotation: -45 }, "straight-right": { rotation: 45 }, end: { rotation: 0 },
};

export default B4B7ItemsPanel;