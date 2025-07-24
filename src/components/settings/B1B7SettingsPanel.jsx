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


function B1B7SettingsPanel({
  label,
  params,
  setParams,
  enableDirection,
  allowNoneOption,
  signSize,
}) {
  const isB4 = label.includes("B4");
  const isB7 = label.includes("B7");

  const directionOptions = [
    { value: "straight", label: "Прямо", icon: PathConfigs.smallArrow },
    { value: "left", label: "Ліворуч", icon: PathConfigs.smallArrow },
    { value: "right", label: "Праворуч", icon: PathConfigs.smallArrow },
    {
      value: "straight-left",
      label: "Прямо і ліворуч",
      icon: PathConfigs.smallArrow,
    },
    {
      value: "straight-right",
      label: "Прямо і праворуч",
      icon: PathConfigs.smallArrow,
    },
  ];

  const directionRotation = {
    straight: 0,
    left: -90,
    right: 90,
    "straight-left": -45,
    "straight-right": 45,
  };

  const handleTableTypeChange = (value) => {
    let numberType = params.numberType;
    if (value === "seasonal" && numberType === "national")
      numberType = "regional";
    if (value !== "permanent" && numberType === "eurovelo")
      numberType = "regional";
    setParams({ ...params, tableType: value, numberType });
  };

  const handleNumberTypeChange = (value) => {
    const routeNumber =
      value === "eurovelo" ? "4" : value === "none" ? "" : params.routeNumber;
    setParams({ ...params, numberType: value, routeNumber });
  };

  const handleRouteNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) value = value.slice(1);
    if (params.numberType === "eurovelo") value = "4";
    else value = value.slice(0, 2);
    setParams({ ...params, routeNumber: value });
  };

  const handleDirectionChange = (value) => {
    setParams({ ...params, direction: value });
  };
  
  const handleRouteCountChange = (count) => {
    const newItems = Array.from({ length: count }, (_, i) => {
      return params.b4Items?.[i] || {
        mainText: "",
        subText: "",
        direction: "straight",
        routeNumber: "",
      };
    });
    setParams({ ...params, b4Items: newItems });
  };

  const handleObjectCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const clamped = Math.max(4, Math.min(value, 14));
    setParams({ ...params, objectCount: clamped });
  };

  const getNumberTypeOptions = () => {
    const options = [];
    if (isB4 || isB7) options.push({ value: "none", label: "Немає" });
    if (params.tableType !== "seasonal")
      options.push({ value: "national", label: "Національний" });
    if (label.includes("B2")) {
      options.push({ value: "regional", label: "Регіональний/Локальний" });
    } else {
      options.push({ value: "regional", label: "Регіональний" });
      options.push({ value: "local", label: "Локальний" });
    }
    if (params.tableType === "permanent" && !isB4 && !isB7) {
      options.push({ value: "eurovelo", label: "Eurovelo 4" });
    }
    return options;
  };

  const inputStyles = "w-[250px] text-[13px] text-gray-500 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500";


  return (
    <div className="p-0 w-full">
      <p className="text-[16px] font-bold mb-1 text-left">{label}</p>
      {signSize && (
        <p className="text-[14px] mb-5 text-gray-500">
          розмір знаку:{" "}
          <span className="text-black font-bold">
            {Math.round(signSize.width)}x{Math.round(signSize.height)} мм
          </span>
        </p>
      )}

      {/* --- ЗМІНА 1: Відступи між рядками зменшено --- */}
      <div className="space-y-2">
        <FormRow label="Тип таблички:">
          <Select value={params.tableType} onValueChange={handleTableTypeChange}>
            <SelectTrigger className={inputStyles}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="permanent" className="text-[13px]">Постійний</SelectItem>
              <SelectItem value="seasonal" className="text-[13px]">Сезонний</SelectItem>
              <SelectItem value="temporary" className="text-[13px]">Тимчасовий</SelectItem>
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label="Рівень маршруту:">
          <Select value={params.numberType} onValueChange={handleNumberTypeChange}>
            <SelectTrigger className={inputStyles}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getNumberTypeOptions().map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        {params.numberType !== "none" && (
          <FormRow label="Номер маршруту:">
            <Input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={params.routeNumber || ""}
              onChange={handleRouteNumberChange}
              disabled={params.numberType === "eurovelo"}
              placeholder="Введіть цифру від 1 до 99"
              className={inputStyles}
            />
          </FormRow>
        )}

        {enableDirection && (
          <FormRow label="Напрямок:">
            <Select value={params.direction} onValueChange={handleDirectionChange}>
              <SelectTrigger className={inputStyles}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {directionOptions.map(({ value, label, icon }) => {
                  const rotation = directionRotation[value] || 0;
                  return (
                    <SelectItem key={value} value={value} className="text-[13px]">
                      <div className="flex items-center gap-2">
                        <svg width={24} height={24} viewBox={`0 0 ${icon.width} ${icon.height}`} className="text-gray-700">
                          <path d={icon.d} fill="currentColor" fillRule="evenodd" transform={`rotate(${rotation} ${icon.width / 2} ${icon.height / 2}) scale(${icon.scale})`}/>
                        </svg>
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormRow>
        )}
        
        {(isB4 || isB7) && ((params.b4Items?.length ?? 0) >= 2 || (params.objectCount ?? 0) >= 2) && (
          <FormRow label="">
            <label htmlFor="forceUniformTextSize" className="inline-flex items-center cursor-pointer gap-3">
            <div className="relative">
              <input
              type="checkbox"
              id="forceUniformTextSize"
              className="sr-only peer"
              checked={params.forceUniformTextSize || false}
              onChange={(e) => setParams({ ...params, forceUniformTextSize: e.target.checked })}
              />
              <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600"></div>
              <div className="absolute left-0.5 top-0.5 bg-white border-gray-300 border rounded-full h-3 w-3 transition-transform peer-checked:translate-x-3"></div>
            </div>
            <span className="text-[13px] text-gray-700">
              Уніфікація шрифту
            </span>
            </label>
          </FormRow>
          )}

        {/* --- ЗМІНА 2: Видалено pt-4 --- */}
        {isB4 && (
          <div>
            <p className="font-semibold text-center text-[13px] mb-2 text-gray-800">Кількість напрямків:</p>
            <div className="flex justify-center border rounded-md overflow-hidden w-fit mx-auto">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRouteCountChange(num)}
                  className={`w-9 h-9 flex items-center justify-center border-r last:border-r-0 text-[13px] ${
                    params.b4Items?.length === num
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- ЗМІНА 2: Видалено pt-4 --- */}
        {isB7 && (
          <div className="text-center">
            <p className="font-semibold text-center text-[13px] mb-1px text-gray-800">
              Кількість обʼєктів: {params.objectCount || 4}
            </p>

            {(() => {
              const min = 4;
              const max = 14;
              const value = params.objectCount || min;
              const progressPercent = ((value - min) / (max - min)) * 100;
              const tickInterval = 100 / (max - min);

              const sliderStyle = {
                backgroundImage: `
                  repeating-linear-gradient(to right, 
                    #ffffff 0, #ffffff 1px, 
                    transparent 1px, transparent ${tickInterval}%
                  ),
                  linear-gradient(to right, 
                    #2563eb ${progressPercent}%, 
                    #e5e7eb ${progressPercent}%
                  )
                `,
              };

              return (
                <div className="w-1/2 mx-auto">
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleObjectCountChange}
                    style={sliderStyle}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer 
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:h-3 
                      [&::-webkit-slider-thumb]:w-3 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:border 
                      [&::-webkit-slider-thumb]:border-gray-400 
                      [&::-webkit-slider-thumb]:shadow 
                      [&::-webkit-slider-thumb]:shadow-gray-300"
                  />
                </div>
              );
            })()}

            <div className="flex justify-between w-1/2 mx-auto text-xs text-gray-500 mt-1">
              {Array.from({ length: 14 - 4 + 1 }, (_, i) => 4 + i)
                .map((num, index) => (
                  <span key={num} className="w-4 text-center">
                    {index % 2 === 0 ? num : '\u00A0'}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default B1B7SettingsPanel;