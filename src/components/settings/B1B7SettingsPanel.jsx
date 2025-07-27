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
 * Компонент панелі налаштувань для знаків B1-B7.
 * Керує загальними параметрами знаку, а також відображає
 * специфічні налаштування для B4 та B7.
 */
function B1B7SettingsPanel({
  label,
  params,
  setParams,
  enableDirection,
  signSize,
}) {
  const isB4 = label.includes("B4");
  const isB7 = label.includes("B7");

  // --- Константи для налаштувань ---

  const directionOptions = [
    { value: "straight", label: "Прямо", icon: PathConfigs.smallArrow },
    { value: "left", label: "Ліворуч", icon: PathConfigs.smallArrow },
    { value: "right", label: "Праворуч", icon: PathConfigs.smallArrow },
    { value: "straight-left", label: "Прямо і ліворуч", icon: PathConfigs.smallArrow },
    { value: "straight-right", label: "Прямо і праворуч", icon: PathConfigs.smallArrow },
  ];

  const directionRotation = {
    straight: 0,
    left: -90,
    right: 90,
    "straight-left": -45,
    "straight-right": 45,
  };

  // --- Обробники подій ---

  const handleTableTypeChange = (value) => {
      // Створюємо копію поточних параметрів, щоб їх змінювати
      const newParams = { ...params, tableType: value };

      // Ваша існуюча логіка для numberType
      if (value === "seasonal" && newParams.numberType === "national") {
        newParams.numberType = "regional";
      }
      if (value !== "permanent" && newParams.numberType === "eurovelo") {
        newParams.numberType = "regional";
      }

      // --- НОВА ЛОГІКА: Скидаємо статус isTemporaryRoute для всіх об'єктів ---
      if (newParams.b4Items) {
        newParams.b4Items = newParams.b4Items.map(item => ({
          ...item,
          isTemporaryRoute: false,
          warningSignType: null, // <-- ДОДАЙТЕ ЦЕЙ РЯДОК
        }));
      }

      // Зберігаємо всі оновлені параметри
      setParams(newParams);
    };

  const handleNumberTypeChange = (value) => {
    const routeNumber = value === "eurovelo" ? "4" : value === "none" ? "" : params.routeNumber;
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
    const clamped = Math.max(4, Math.min(value, 16));
    setParams({ ...params, objectCount: clamped });
  };

  // --- Допоміжні функції ---

  const getNumberTypeOptions = () => {
    const options = [];
    if (isB4 || isB7) options.push({ value: "none", label: "Немає" });
    if (params.tableType !== "seasonal") options.push({ value: "national", label: "Національний" });
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

  const signNames = {
    B1: "Номер і напрямок веломаршруту",
    B2: "Кінець веломаршруту",
    B3: "Номер і напрямок веломаршруту",
    B4: "Покажчик І-ІІІ напрямків",
    B7: "Схема веломаршруту",
  };

  // Витягуємо тип знаку з назви для зручності
  const signType = label.split(' ')[1].replace(':', '');

  // --- Стилі ---

  // Змінено: основний текст - чорний, підказка - сіра
  const inputStyles = "w-full lg:w-[250px] text-[13px] text-gray-900 font-normal placeholder:text-gray-500 [&[data-placeholder]]:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500";

  // --- Рендер компонента ---

  return (
    <div className="p-0 w-full">
      <h2 className="text-[16px] font-bold mb-0 text-left">
        {label}
        <span className="text-[15px] font-bold ml-1">{signNames[signType]}</span>
      </h2>

      {signSize && (
        <p className="text-[14px] mb-2 text-gray-500 mb-8">
          {/* Змінено: текст залежить від типу знаку */}
          {signType === 'B1' ? 'розмір таблички:' : 'розмір знаку:'}{" "}
          <span className="text-black">
            {Math.round(signSize.width)}x{Math.round(signSize.height)} мм
          </span>
        </p>
      )}

      <div className="space-y-2">
        {/* --- Основні налаштування --- */}
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
            <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
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
              <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
              <SelectContent>
                {directionOptions.map(({ value, label, icon }) => {
                  const rotation = directionRotation[value] || 0;
                  return (
                    <SelectItem key={value} value={value} className="text-[13px]">
                      <div className="flex items-center gap-2">
                        <svg width={20} height={20} viewBox={`0 0 ${icon.width} ${icon.height}`} className="text-gray-700">
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
        
        {(label.includes("B2") || label.includes("B3")) && (
          <FormRow label="">
            <label htmlFor="isReduced" className="inline-flex items-center cursor-pointer gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  id="isReduced"
                  className="sr-only peer"
                  checked={params.isReduced || false}
                  onChange={(e) => setParams({ ...params, isReduced: e.target.checked })}
                />
                <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600"></div>
                <div className="absolute left-0.5 top-0.5 bg-white border-gray-300 border rounded-full h-3 w-3 transition-transform peer-checked:translate-x-3"></div>
              </div>
              <span className="text-[13px] text-gray-700">Зменшення знаку для наліпок</span>
            </label>
          </FormRow>
        )}

        {isB4 && (
          <FormRow label="Кількість напрямків:">
            <div className="flex border rounded-md overflow-hidden w-fit">
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
          </FormRow>
        )}


        {isB7 && (
          <FormRow label={`Кількість обʼєктів: ${params.objectCount || 4}`}>
            {(() => {
              const min = 4;
              const max = 16;
              const value = params.objectCount || min;
              const progressPercent = ((value - min) / (max - min)) * 100;
              const tickInterval = 100 / (max - min);
              const sliderStyle = {
                backgroundImage: `
                  repeating-linear-gradient(to right, #ffffff 0, #ffffff 1px, transparent 1px, transparent ${tickInterval}%),
                  linear-gradient(to right, #2563eb ${progressPercent}%, #e5e7eb ${progressPercent}%)`,
              };
              const sliderThumbStyles = `[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:shadow-gray-300`;

              return (
                <div className="h-9 pt-3.5">
                  {/* --- ЗМІНА ТУТ --- */}
                  <div className="flex flex-col w-full lg:w-[250px]">
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={value}
                      onChange={handleObjectCountChange}
                      style={sliderStyle}
                      className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${sliderThumbStyles}`}
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num, index) => (
                        <span key={num} className="w-4 text-center">{index % 2 === 0 ? num : '\u00A0'}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
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
              <span className="text-[13px] text-gray-700">Уніфікація шрифту</span>
            </label>
          </FormRow>
        )}

      </div>
    </div>
  );
}

export default B1B7SettingsPanel;