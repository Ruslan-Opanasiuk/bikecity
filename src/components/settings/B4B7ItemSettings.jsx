import { useState, useEffect } from "react";
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
import MultiColorPathConfigs from "../../config/MultiColorPathConfigs";
import { computeTextLayout } from "../../utils/TextLayout";
import { getRouteBadgeGroupWidth } from "../svg/RouteBadgeGroup";

// ==============================================================================
//  ГОЛОВНИЙ КОМПОНЕНТ ДЛЯ ПАНЕЛІ НАЛАШТУВАНЬ
// ==============================================================================

function B4B7ItemsPanel({
  items,
  setItemParams,
  tableType,
  isB7,
  isTooLongArr = [],
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(0);
    }
  }, [items, selectedIndex]);

  const selectOptions = items.map((item, i) => {
    let short = "";
    if (item?.icon && item?.mainText && locationTerms[item.icon]?.[item.mainText]) {
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
  const mainSelectStyles = "w-full lg:w-[250px] text-[13px] text-gray-900 font-normal placeholder:text-gray-500 [&[data-placeholder]]:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500";
  const showObjectSelector = !(isB7 === false && items.length === 1);

  return (
    <div className="space-y-2 mt-10">
      <h4 className="text-left font-semibold text-gray-800 pt-2">
        Налаштування обʼєкту {selectedIndex + 1}:
      </h4>

      {showObjectSelector && (
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
      )}
        
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
//  КОМПОНЕНТ ФОРМИ НАЛАШТУВАНЬ ДЛЯ ОДНОГО ОБ'ЄКТА
// ==============================================================================

const ribbonOrCircleIcons = new Set([
  "cityCentre", "bridge", "interchange", "bicycleRoute", "district", "other", "water", "streetNetwork"
]);

const MultiColorSignPreview = ({ config, size = 24 }) => (
  <svg width={size} height={size} viewBox={config.viewBox}>
    {config.paths.map((path, index) => (
      <path key={index} d={path.d} fill={path.color} transform={path.transform || ''} fillRule={path.fillRule || 'nonzero'}/>
    ))}
  </svg>
);


function B4B7ItemSettings({
  index,
  params,
  setParams,
  isTooLong,
  tableType,
  isB7,
}) {
  
  const [temporaryOverflowMessage, setTemporaryOverflowMessage] = useState(null);
  const [iconOverflowMessage, setIconOverflowMessage] = useState(null);
  const [textOverflowMessage, setTextOverflowMessage] = useState(null);

  const clearAllOverflowMessages = () => {
    setTemporaryOverflowMessage(null);
    setIconOverflowMessage(null);
    setTextOverflowMessage(null);
  };

  const checkOverflowForSpeculativeParams = (speculativeParams) => {
    const iconKey = speculativeParams.icon === "streetNetwork" && speculativeParams.isUrbanCenter ? "cityCentre" : speculativeParams.icon;
    const iconConfig = iconKey ? PathConfigs[iconKey] : null;
    const isRibbonOrCircle = !ribbonOrCircleIcons.has(iconKey);
    const temporaryOffset = speculativeParams.isTemporaryRoute ? 63 : 0;
    
    const textX = (isRibbonOrCircle ? 136 + ((iconConfig?.width || 0) * (iconConfig?.scale2 || 1)) + 20 : 136) + temporaryOffset;
    const badgeGroupWidth = getRouteBadgeGroupWidth(speculativeParams);
    const availableTextWidthMain = 600 - 28 - textX - badgeGroupWidth;
    const availableTextWidthSecondary = 600 - 28 - textX;
    
    const layout = computeTextLayout({
      ...speculativeParams,
      textX,
      availableTextWidthMain,
      availableTextWidthSecondary,
    });

    return layout.isOverflowing;
  };

  const handleDirectionChange = (value) => { clearAllOverflowMessages(); setParams({ ...params, direction: value }); };
  const handleRouteNumberChange = (e) => {
    clearAllOverflowMessages();
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) value = value.slice(1);
    value = value.slice(0, 2);
    setParams({ ...params, routeNumber: value });
  };
  const handleUrbanCenterToggle = (e) => { clearAllOverflowMessages(); setParams({ ...params, isUrbanCenter: e.target.checked }); };
  const handleCustomUaChange = (e) => { clearAllOverflowMessages(); setParams({ ...params, customUa: e.target.value }); };
  const handleCustomEnChange = (e) => { clearAllOverflowMessages(); setParams({ ...params, customEn: e.target.value }); };
  
  const handleTemporaryRouteToggle = (e) => {
    clearAllOverflowMessages();
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // ЛОГІКА ДЛЯ B7: блокуємо, якщо немає місця
      if (isB7) {
        const speculativeParams = { ...params, isTemporaryRoute: true };
        if (checkOverflowForSpeculativeParams(speculativeParams)) {
          setTemporaryOverflowMessage("Недостатньо місця");
          return;
        }
      }
      // ДЛЯ B4 ЦЕЙ БЛОК БУДЕ ВИКОНУВАТИСЯ БЕЗ ПЕРЕВІРОК
      setParams({ ...params, isTemporaryRoute: isChecked });
    } else {
      setParams({ ...params, isTemporaryRoute: isChecked, warningSignType: null });
    }
  };

  const handleIconChange = (value) => {
    clearAllOverflowMessages();
    const newIcon = value === "none" ? null : value;
    const isCenterOrRoute = newIcon === "cityCentre" || newIcon === "bicycleRoute";
    const isChangingFromBicycleToOther = params.icon === "bicycleRoute" && newIcon !== "bicycleRoute";
      
    const baseParams = {
      ...params, icon: newIcon, mainText: "", subText: isCenterOrRoute ? "" : params.subText,
      isUrbanCenter: false, customUa: "", customEn: "",
      ...(isChangingFromBicycleToOther && { routeNumber: "" }),
    };

    if (newIcon === "bicycleRoute") {
      const allowed = ["showEurovelo", "showVeloParking", "showVeloSTO"];
      const firstActive = allowed.find((key) => params[key]);
      const cleared = allowed.reduce((acc, key) => ({ ...acc, [key]: key === firstActive }), {});
      setParams({ ...baseParams, ...cleared });
    } else {
      setParams(baseParams);
    }
  };

  const handleMainTextChange = (value) => {
    clearAllOverflowMessages();
    const clearSubText = value === "Центр міста" || value === "Bеломаршрут";
    const actualValue = value === "Регіональний / локальний" ? "Регіональний" : value;
    setParams({ ...params, mainText: actualValue, subText: clearSubText ? "" : params.subText });
  };

  const handleSubTextChange = (e) => {
    clearAllOverflowMessages();
    const newText = e.target.value;
    const isAddingText = newText.length > (params.subText || "").length;

    const speculativeParams = { ...params, subText: newText };
    
    if (checkOverflowForSpeculativeParams(speculativeParams) && isAddingText) {
      setTextOverflowMessage("Текст занадто довгий");
      return;
    }

    setTextOverflowMessage(null);
    setParams(speculativeParams);
  };
  
  const handleDistanceChange = (e) => {
    clearAllOverflowMessages();
    let val = e.target.value.replace('.', ',');
    if (/^((\d{1,2}(,\d?)?)|(\d{1,3}))?$/.test(val)) {
      setParams({ ...params, distance: val });
    }
  };

  const handleWarningSignChange = (value) => {
    clearAllOverflowMessages();
    setParams({ ...params, warningSignType: value === 'none' ? null : value });
  };

// === ДОДАЙ поруч з іншими handle* ===
const handleExtraRoute1TypeChange = (value) => {
  clearAllOverflowMessages();
  // перевіряємо переповнення лише якщо вже є номер
  if (params.extraRoute1Number) {
    const spec = { ...params, showExtraRoute1: true, extraRoute1Type: value };
    if (checkOverflowForSpeculativeParams(spec)) {
      setIconOverflowMessage("Недостатньо місця");
      return;
    }
  }
  setParams({ ...params, extraRoute1Type: value });
};

const handleExtraRoute1NumberChange = (e) => {
  clearAllOverflowMessages();
  let value = e.target.value.replace(/\D/g, "");
  if (value.startsWith("0")) value = value.slice(1);
  value = value.slice(0, 2);

  if (value) {
    const spec = { ...params, showExtraRoute1: true, extraRoute1Number: value };
    if (checkOverflowForSpeculativeParams(spec)) {
      setIconOverflowMessage("Недостатньо місця");
      return;
    }
  }
  setParams({ ...params, extraRoute1Number: value });
};

const handleExtraRoute2TypeChange = (value) => {
  clearAllOverflowMessages();
  if (params.extraRoute2Number) {
    const spec = { ...params, showExtraRoute2: true, extraRoute2Type: value };
    if (checkOverflowForSpeculativeParams(spec)) {
      setIconOverflowMessage("Недостатньо місця");
      return;
    }
  }
  setParams({ ...params, extraRoute2Type: value });
};

const handleExtraRoute2NumberChange = (e) => {
  clearAllOverflowMessages();
  let value = e.target.value.replace(/\D/g, "");
  if (value.startsWith("0")) value = value.slice(1);
  value = value.slice(0, 2);

  if (value) {
    const spec = { ...params, showExtraRoute2: true, extraRoute2Number: value };
    if (checkOverflowForSpeculativeParams(spec)) {
      setIconOverflowMessage("Недостатньо місця");
      return;
    }
  }
  setParams({ ...params, extraRoute2Number: value });
};


const getRightFreeSpacePx = (p) => {
  // рахуємо поточний текстовий лейаут і відстань праворуч від групи бейджів
  const iconKey = p.icon === "streetNetwork" && p.isUrbanCenter ? "cityCentre" : p.icon;
  const iconConfig = iconKey ? PathConfigs[iconKey] : null;
  const isRibbonOrCircle = !ribbonOrCircleIcons.has(iconKey);
  const temporaryOffset = p.isTemporaryRoute ? 63 : 0;

  const textX = (isRibbonOrCircle
    ? 136 + ((iconConfig?.width || 0) * (iconConfig?.scale2 || 1)) + 20
    : 136) + temporaryOffset;

  const badgeGroupWidth = getRouteBadgeGroupWidth(p);
  const availableTextWidthMain = 600 - 28 - textX - badgeGroupWidth;
  const availableTextWidthSecondary = 600 - 28 - textX;

  const layout = computeTextLayout({
    ...p,
    textX,
    availableTextWidthMain,
    availableTextWidthSecondary,
  });

  const routeBadgeX = layout?.routeBadgeX ?? (textX + availableTextWidthMain);
  const rightBound = 600 - 28;
  const freePx = rightBound - (routeBadgeX + badgeGroupWidth); // скільки ще лишилось праворуч
  return freePx;
};


  useEffect(() => {
    if (tableType === "seasonal" && params.mainText === "Національний") {
      setParams({ ...params, mainText: "Регіональний" });
    }
  }, [tableType, params.mainText, setParams]);


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
  const iconOptions = Object.keys(locationTerms).map((key) => ({
    value: key,
    label: iconLabelsUa[key] || key,
    icon: PathConfigs[key === "water" ? "waves" : key === "bicycleRoute" ? "bicycle" : key],
  }));
  const categoryOptionsRaw = params.icon && locationTerms[params.icon] ? Object.keys(locationTerms[params.icon]).filter(key => !(tableType === "seasonal" && key === "Національний")) : [];
  let categoryOptions = [...categoryOptionsRaw];
  if (params.direction === "end" && (categoryOptions.includes("Регіональний") || categoryOptions.includes("Локальний"))) {
    categoryOptions = categoryOptions.filter(item => item !== "Регіональний" && item !== "Локальний");
    categoryOptions.unshift("Регіональний / локальний");
  }

  const isBicycleRoute = params.icon === "bicycleRoute" || params.mainText === "Bеломаршрут";
  const shouldShowNameField = !isBicycleRoute && params.icon !== "cityCentre" && !["Центр міста", "Bеломаршрут"].includes(params.mainText);
  const inputClasses = "w-full lg:w-[250px] text-[13px] text-gray-900 font-normal placeholder:text-gray-500 [&[data-placeholder]]:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500";
    
  const warningSignOptions = [
    { value: 'roadWorks', label: 'Дорожні роботи' },
    { value: 'unevenRoad', label: 'Нерівна дорога' },
    { value: 'pothole', label: 'Вибоїна' },
    { value: 'dangerAhead', label: 'Аварійна ділянка' },
    { value: 'noEntry', label: 'Рух заборонено' },
    { value: 'noCycling', label: 'Велорух заборонено' },
    { value: 'doNotEnter', label: 'В\'їзд заборонено' },
  ];
  
  const temporaryToggleJSX = (
    <FormRow label="">
      <div className="flex flex-col gap-1">
        <label htmlFor="isTemporaryRoute" className="inline-flex items-center cursor-pointer gap-3">
          <div className="relative">
            <input type="checkbox" id="isTemporaryRoute" className="sr-only peer" checked={params.isTemporaryRoute || false} onChange={handleTemporaryRouteToggle}/>
            <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600"></div>
            <div className="absolute left-0.5 top-0.5 bg-white border-gray-300 border rounded-full h-3 w-3 transition-transform peer-checked:translate-x-3"></div>
          </div>
          <span className="text-[13px] text-gray-700">Тимчасовий маршрут</span>
        </label>
        {temporaryOverflowMessage && (
          <p className="text-red-500 text-xs mt-1">
            {temporaryOverflowMessage}
          </p>
        )}
      </div>
    </FormRow>
  );

  return (
    <div className="space-y-2 w-full">
      {isB7 && tableType !== "temporary" && tableType !== "seasonal" && temporaryToggleJSX}
      
      {params.isTemporaryRoute && isB7 && (
        <FormRow label="Застережний знак:">
          <Select
            value={params.warningSignType || ''}
            onValueChange={handleWarningSignChange}
          >
            <SelectTrigger className={inputClasses}>
              <SelectValue placeholder="Виберіть знак" />
            </SelectTrigger>
            <SelectContent>
              {warningSignOptions.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-[13px]">
                  <div className="flex items-center gap-2">
                    {option.value !== 'none' && MultiColorPathConfigs[option.value] && (
                      <MultiColorSignPreview config={MultiColorPathConfigs[option.value]} />
                    )}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>
      )}

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
                      {icon ? (<svg width={24} height={24} viewBox={`0 0 ${icon.width} ${icon.height}`} className="text-gray-700"><path d={icon.d} fill="currentColor" fillRule="evenodd" transform={`rotate(${rotation} ${icon.width / 2} ${icon.height / 2}) scale(${icon.scale})`} /></svg>) : (<span className="w-6" />)}
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
                  {icon ? (<svg width={24} height={24} viewBox={`0 0 ${icon.width} ${icon.height}`} className="text-gray-700"><path d={icon.d} fill="currentColor" fillRule="evenodd" /></svg>) : (<span className="w-6" />)}
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
              <input type="checkbox" id="isUrbanCenter" className="sr-only peer" checked={params.isUrbanCenter || false} onChange={handleUrbanCenterToggle} />
              <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600"></div>
              <div className="absolute left-0.5 top-0.5 bg-white border-gray-300 border rounded-full h-3 w-3 transition-transform peer-checked:translate-x-3"></div>
            </div>
            <span className="text-[13px] text-gray-700">Є центром населеного пункту</span>
          </label>
        </FormRow>
      )}

      {params.icon === "other" ? (
        <FormRow label="Категорія:">
          <div className="flex flex-col gap-1">
            <Input value={params.customUa || ""} onChange={handleCustomUaChange} placeholder="Ведіть українську назву" className={inputClasses}/>
            <Input value={params.customEn || ""} onChange={handleCustomEnChange} placeholder="Ведіть переклад англійською" className={inputClasses}/>
          </div>
        </FormRow>
      ) : (
        <FormRow label="Категорія:">
          <Select value={params.mainText} onValueChange={handleMainTextChange}>
            <SelectTrigger className={inputClasses}>
              <div className="truncate">{params.direction === "end" && (params.mainText === "Регіональний" || params.mainText === "Локальний") ? "Регіональний / локальний" : params.mainText || "Оберіть категорію"}</div>
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((item) => <SelectItem key={item} value={item} className="text-[13px]">{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormRow>
      )}

      {isBicycleRoute && (
        <FormRow label="Номер маршруту:">
          <Input inputMode="numeric" pattern="\d*" value={params.routeNumber || ""} onChange={handleRouteNumberChange} placeholder="Введіть цифру від 1 до 99" className={inputClasses} />
        </FormRow>
      )}
      {!isBicycleRoute && shouldShowNameField && (
        <>
          <FormRow label="Назва:">
            <Input
              value={params.subText || ""}
              onChange={handleSubTextChange}
              placeholder="Ведіть українську назву"
              className={inputClasses}
            />
          </FormRow>
          {textOverflowMessage && (
            <FormRow>
              <p className="text-red-500 text-xs mt-1">
                {textOverflowMessage}
              </p>
            </FormRow>
          )}
        </>
      )}
      
      {isB7 && (
        <FormRow label="Відстань (км):">
          <Input inputMode="numeric" pattern="(\d{1,2}(,\d)?|\d{3})" value={params.distance ?? ""} onChange={handleDistanceChange} placeholder="Введіть значення від 0,1 до 999" className={inputClasses} />
        </FormRow>
      )}

      {!isB7 && tableType !== "temporary" && tableType !== "seasonal" && temporaryToggleJSX}
      
      <>
<FormRow label="Додаткові позначки:">
  <div className="flex border rounded-md overflow-hidden w-fit">
    {[
      { key: "showEurovelo", iconKey: "eurovelo", label: "EU" },
      { key: "showVeloParking", iconKey: "veloParking", label: "P" },
      { key: "showVeloSTO", iconKey: "veloSTO", label: "STO" },
      { key: "showExtraRoute1", iconKey: null, label: "VR1" }, // TODO: SVG-іконка для VR1
      { key: "showExtraRoute2", iconKey: null, label: "VR2" }, // TODO: SVG-іконка для VR2
    ].map(({ key, iconKey, label }) => {
      const isActive = !!params[key];
      return (
        <button
          key={key}
          type="button"
          className={`w-9 h-9 flex items-center justify-center border-r last:border-r-0 ${isActive ? "bg-blue-600" : "bg-white hover:bg-gray-100"}`}
          onClick={() => {
            clearAllOverflowMessages();

            const isTryingToAdd = !params[key];
            const activeKeys = [
              "showEurovelo",
              "showVeloParking",
              "showVeloSTO",
              "showExtraRoute1",
              "showExtraRoute2",
            ].filter((k) => params[k]);
            const maxAllowed = params.icon === "bicycleRoute" ? 1 : 2;

            // Ліміт кількості позначок
            if (isTryingToAdd && activeKeys.length >= maxAllowed) return;

            // Увімкнення
            if (isTryingToAdd) {
              // Звичайні позначки — одразу перевірка overflow
              if (key === "showEurovelo" || key === "showVeloParking" || key === "showVeloSTO") {
                const speculativeParams = { ...params, [key]: true };
                if (checkOverflowForSpeculativeParams(speculativeParams)) {
                  setIconOverflowMessage("Недостатньо місця");
                  return;
                }
                setParams({ ...params, [key]: true });
                return;
              }

              // === VR1/VR2: PRE-CHECK МІНІМУМ 36 PX ВІЛЬНОГО ПРОСТОРУ ===
              const freePx = getRightFreeSpacePx(params);
              if (freePx < 36) {
                setIconOverflowMessage("Недостатньо місця");
                return;
              }

              // якщо ок — вмикаємо і ініціалізуємо поля (тип/номер задасть користувач)
              if (key === "showExtraRoute1") {
                setParams({
                  ...params,
                  showExtraRoute1: true,
                  extraRoute1Type: params.extraRoute1Type || "",
                  extraRoute1Number: params.extraRoute1Number || "",
                });
                return;
              }
              if (key === "showExtraRoute2") {
                setParams({
                  ...params,
                  showExtraRoute2: true,
                  extraRoute2Type: params.extraRoute2Type || "",
                  extraRoute2Number: params.extraRoute2Number || "",
                });
                return;
              }
            }

            // Вимкнення
            const next = { ...params, [key]: false };
            if (key === "showExtraRoute1") {
              next.extraRoute1Type = "";
              next.extraRoute1Number = "";
            }
            if (key === "showExtraRoute2") {
              next.extraRoute2Type = "";
              next.extraRoute2Number = "";
            }
            setParams(next);
          }}
          title={
            key === "showExtraRoute1" ? "Веломаршрут 1" :
            key === "showExtraRoute2" ? "Веломаршрут 2" :
            undefined
          }
        >
          {iconKey ? (
            (() => {
              const icon = PathConfigs[iconKey];
              return (
                <svg
                  width={20}
                  height={20}
                  viewBox={`0 0 ${icon.width} ${icon.height}`}
                  className={`mx-auto ${isActive ? "text-white" : "text-gray-700"}`}
                >
                  <path d={icon.d} fill="currentColor" fillRule="evenodd" />
                </svg>
              );
            })()
          ) : (
            <span className={`text-[10px] font-medium select-none ${isActive ? "text-white" : "text-gray-700"}`}>
              {label}
            </span>
          )}
        </button>
      );
    })}
  </div>
</FormRow>



{/* Налаштування для Веломаршрут 1 */}
{params.showExtraRoute1 && (
  <FormRow label="Дод. веломаршрут 1:">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
      {/* 2/3: рівень маршруту */}
      <div className="md:col-span-2">
        <Select
          value={params.extraRoute1Type || ""}
          onValueChange={handleExtraRoute1TypeChange}
        >
          <SelectTrigger className={`${inputClasses} lg:w-full`}>
            <SelectValue placeholder="Оберіть рівень" />
          </SelectTrigger>
          <SelectContent>
            {["Локальний", "Регіональний", "Національний"].map((t) => (
              <SelectItem key={t} value={t} className="text-[13px]">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 1/3: номер маршруту */}
      <div className="md:col-span-1">
        <Input
          inputMode="numeric"
          pattern="\d*"
          value={params.extraRoute1Number || ""}
          onChange={handleExtraRoute1NumberChange}
          placeholder="Номер"
          className={`${inputClasses} lg:w-full`}
        />
      </div>
    </div>
  </FormRow>
)}

{/* Налаштування для Веломаршрут 2 */}
{params.showExtraRoute2 && (
  <FormRow label="Дод. веломаршрут 2:">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
      {/* 2/3: рівень маршруту */}
      <div className="md:col-span-2">
        <Select
          value={params.extraRoute2Type || ""}
          onValueChange={handleExtraRoute2TypeChange}
        >
          <SelectTrigger className={`${inputClasses} lg:w-full`}>
            <SelectValue placeholder="Оберіть рівень" />
          </SelectTrigger>
          <SelectContent>
            {["Локальний", "Регіональний", "Національний"].map((t) => (
              <SelectItem key={t} value={t} className="text-[13px]">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 1/3: номер маршруту */}
      <div className="md:col-span-1">
        <Input
          inputMode="numeric"
          pattern="\d*"
          value={params.extraRoute2Number || ""}
          onChange={handleExtraRoute2NumberChange}
          placeholder="Номер"
          className={`${inputClasses} lg:w-full`}
        />
      </div>
    </div>
  </FormRow>
)}



        {iconOverflowMessage && (
          <FormRow>
            <p className="text-red-500 text-xs mt-1">
              {iconOverflowMessage}
            </p>
          </FormRow>
        )}
      </>
    </div>
  );
}

B4B7ItemSettings.directionLayout = {
  straight: { rotation: 0 }, left: { rotation: -90 }, right: { rotation: 90 },
  "straight-left": { rotation: -45 }, "straight-right": { rotation: 45 }, end: { rotation: 0 },
};

export default B4B7ItemsPanel;
