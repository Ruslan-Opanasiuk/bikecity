import PathConfigs from "../../config/PathConfigs";
import { Input } from "@/components/ui/input";
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
      value === "eurovelo"
        ? "4"
        : value === "none"
        ? ""
        : params.routeNumber;

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
    const clamped = Math.max(4, Math.min(value, 15));
    setParams({ ...params, objectCount: clamped });
  };

  const getNumberTypeOptions = () => {
    const options = [];

    if (label.includes("B4") || label.includes("B7")) {
      options.push({ value: "none", label: "Немає" });
    }

    if (params.tableType !== "seasonal") {
      options.push({ value: "national", label: "Національний" });
    }

    if (label.includes("B2")) {
      options.push({ value: "regional", label: "Регіональний/Локальний" });
    } else {
      options.push({ value: "regional", label: "Регіональний" });
      options.push({ value: "local", label: "Локальний" });
    }

    if (
      params.tableType === "permanent" &&
      !label.includes("B4") &&
      !label.includes("B7")
    ) {
      options.push({ value: "eurovelo", label: "Eurovelo 4" });
    }

    return options;
  };


  return (
    <div className="bg-white border border-gray-300 p-6 shadow-md w-fit">
      <p className="text-xl font-semibold mb-6 text-center">{label}</p>

      <div className="space-y-4">
        {/* Тип таблички */}
        <div className="flex items-center gap-4">
          <label className="w-48 font-medium">Тип таблички:</label>
          <Select value={params.tableType} onValueChange={handleTableTypeChange}>
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="permanent">Постійний</SelectItem>
              <SelectItem value="seasonal">Сезонний</SelectItem>
              <SelectItem value="temporary">Тимчасовий</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Рівень маршруту */}
        <div className="flex items-center gap-4">
          <label className="w-48 font-medium">Рівень маршруту:</label>
          <Select value={params.numberType} onValueChange={handleNumberTypeChange}>
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getNumberTypeOptions().map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Номер маршруту */}
        {params.numberType !== "none" && (
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">Номер маршруту:</label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={params.routeNumber || ""}
              onChange={handleRouteNumberChange}
              disabled={params.numberType === "eurovelo"}
              placeholder="Введіть цифру від 1 до 99"
              className="w-[260px]"
            />
          </div>
        )}

        {/* Напрямок */}
        {enableDirection && (
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">Напрямок:</label>
            <Select value={params.direction} onValueChange={handleDirectionChange}>
              <SelectTrigger className="w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {directionOptions.map(({ value, label, icon }) => {
                  const rotation = directionRotation[value] || 0;
                  return (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <svg
                          width={24}
                          height={24}
                          viewBox={`0 0 ${icon.width} ${icon.height}`}
                          className="text-gray-700"
                        >
                          <path
                            d={icon.d}
                            fill="currentColor"
                            fillRule="evenodd"
                            transform={`rotate(${rotation} ${icon.width / 2} ${icon.height / 2}) scale(${icon.scale})`}
                          />
                        </svg>
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Кількість напрямків для B4 */}
        {isB4 && (
          <div className="pt-4">
            <p className="font-medium text-center mb-2">Кількість напрямків</p>
            <div className="flex justify-center border rounded overflow-hidden w-fit mx-auto">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRouteCountChange(num)}
                  className={`px-4 py-2 border-r last:border-r-0 ${
                    params.b4Items?.length === num
                      ? "bg-gray-300 font-semibold"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Кількість об'єктів для B7 */}
        {isB7 && (
          <div className="pt-4 text-center">
            <p className="font-medium mb-2">
              Кількість обʼєктів: {params.objectCount || 4}
            </p>
            <input
              type="range"
              min="4"
              max="15"
              value={params.objectCount || 4}
              onChange={handleObjectCountChange}
              className="w-1/2 mx-auto"
            />
          </div>
        )}


        {/* Уніфікація шрифту */}
        {(isB4 || isB7) &&
          ((params.b4Items?.length ?? 0) >= 2 || (params.objectCount ?? 0) >= 2) && (
            <div className="flex items-center gap-4">
              <label className="w-48 font-medium">Уніфікація шрифту:</label>
              <input
                type="checkbox"
                checked={params.forceUniformTextSize || false}
                onChange={(e) =>
                  setParams({
                    ...params,
                    forceUniformTextSize: e.target.checked,
                  })
                }
              />
            </div>
          )}
      </div>
    </div>
  );
}

export default B1B7SettingsPanel;
