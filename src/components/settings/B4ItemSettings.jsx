import { useEffect } from "react";
import locationTerms from "../../config/locationTerms";
import PathConfigs from "../../config/PathConfigs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

/**
 * 🛠 Компонент для редагування одного елемента B4:
 * вибір напрямку, піктограми, назви, категорії, номеру маршруту тощо.
 */
function B4ItemSettings({ index, label, params, setParams, isTooLong, tableType }) {
  // === [1] ОБРОБНИКИ ЗМІН ПОЛІВ ===

  // Зміна напрямку (стрілки)
  const handleDirectionChange = (value) => {
    setParams({ ...params, direction: value });
  };

  // Зміна піктограми
  const handleIconChange = (value) => {
    const newIcon = value === "none" ? null : value;
    const isCenterOrRoute = newIcon === "cityCentre" || newIcon === "bicycleRoute";

    const isChangingFromBicycleToOther =
      params.icon === "bicycleRoute" && newIcon !== "bicycleRoute";

    const baseParams = {
      ...params,
      icon: newIcon,
      mainText: "",
      subText: isCenterOrRoute ? "" : params.subText,
      isUrbanCenter: false,
      customUa: "",
      customEn: "",
      // 🧼 очищаємо номер, якщо вихід з веломаршруту
      ...(isChangingFromBicycleToOther && { routeNumber: "" }),
    };

    // Якщо це веломаршрут — залишаємо лише одну активну позначку (якщо є)
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



  // Зміна основного тексту (категорії)
  const handleMainTextChange = (value) => {
    const clearSubText = value === "Центр міста" || value === "Веломаршрут";

    // Якщо обрано об’єднану категорію — зберігаємо як "Регіональний"
    const actualValue =
      value === "Регіональний / локальний" ? "Регіональний" : value;

    setParams({
      ...params,
      mainText: actualValue,
      subText: clearSubText ? "" : params.subText,
    });
  };


  // Введення номеру маршруту (тільки цифри, не більше 2)
  const handleRouteNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) value = value.slice(1);
    value = value.slice(0, 2);
    setParams({ ...params, routeNumber: value });
  };

  // Чекбокс "Є центром населеного пункту"
  const handleUrbanCenterToggle = (e) => {
    setParams({ ...params, isUrbanCenter: e.target.checked });
  };

  // Власна назва українською
  const handleCustomUaChange = (e) => {
    setParams({ ...params, customUa: e.target.value });
  };

  // Власна назва англійською
  const handleCustomEnChange = (e) => {
    setParams({ ...params, customEn: e.target.value });
  };

  // Чекбокс "Тимчасовий маршрут"
  const handleTemporaryRouteToggle = (e) => {
    setParams({ ...params, isTemporaryRoute: e.target.checked });
  };

  // === [2] СПЕЦІАЛЬНА ПРАВКА ДЛЯ СЕЗОННИХ ТАБЛИЦЬ ===
  // Якщо таблиця сезонна, а вибрано "Національний" — змінюємо на "Регіональний"
  useEffect(() => {
    if (tableType === "seasonal" && params.mainText === "Національний") {
      setParams({ ...params, mainText: "Регіональний" });
    }
  }, [tableType, params.mainText]);

  // === [3] ВАРІАНТИ НАПРЯМКІВ ТА ІКОНОК ===

  // Усі напрямки
  const allDirections = [
    { value: "straight", label: "Прямо", icon: PathConfigs.smallArrow },
    { value: "left", label: "Ліворуч", icon: PathConfigs.smallArrow },
    { value: "right", label: "Праворуч", icon: PathConfigs.smallArrow },
    { value: "straight-left", label: "Прямо і ліворуч", icon: PathConfigs.smallArrow },
    { value: "straight-right", label: "Прямо і праворуч", icon: PathConfigs.smallArrow },
    { value: "end", label: "Кінець маршруту", icon: null },
  ];

  // Приховуємо "Кінець маршруту", якщо це не перший елемент
  const directions = index === 0
    ? allDirections
    : allDirections.filter((d) => d.value !== "end");

  // Українські підписи до іконок
  const iconLabelsUa = {
    cityCentre: "Центр населеного пункту",
    interchange: "Транспортна розв'язка",
    bridge: "Міст",
    port: "Порт",
    airport: "Аеропорт",
    settlement: "Населений пункт",
    railStation: "Залізничний об'єкт",
    busStation: "Автобусний об'єкт",
    water: "Водний об'єкт",
    bicycleRoute: "Веломаршрут",
    streetNetwork: "Вулично-дорожня мережа",
    district: "Частина населеного пункту",
    other: "Інший об'єкт",
  };

  // Побудова списку іконок для селектора
  const iconOptions = Object.keys(locationTerms).map((key) => {
    let iconKey = key;
    if (key === "water") iconKey = "waves";
    if (key === "bicycleRoute") iconKey = "bicycle";

    return {
      value: key,
      label: iconLabelsUa[key] || key,
      icon: PathConfigs[iconKey],
    };
  });


  // Варіанти категорій залежно від обраної іконки
  let categoryOptionsRaw = params.icon && locationTerms[params.icon]
    ? Object.keys(locationTerms[params.icon]).filter((key) => {
        if (tableType === "seasonal" && key === "Національний") return false;
        return true;
      })
    : [];

  let categoryOptions = categoryOptionsRaw;

  if (params.direction === "end") {
    const hasRegional = categoryOptionsRaw.includes("Регіональний");
    const hasLocal = categoryOptionsRaw.includes("Локальний");

    if (hasRegional || hasLocal) {
      categoryOptions = categoryOptionsRaw.filter(
        (item) => item !== "Регіональний" && item !== "Локальний"
      );

      categoryOptions.unshift("Регіональний / локальний");
    }
  }


  // === [4] УМОВИ ВІДОБРАЖЕННЯ ===
  const isBicycleRoute =
    params.icon === "bicycleRoute" || params.mainText === "Веломаршрут";

  const shouldShowNameField =
    !isBicycleRoute &&
    params.icon !== "cityCentre" &&
    !["Центр міста", "Веломаршрут"].includes(params.mainText);

  // === [5] РЕНДЕР ФОРМИ ===
  return (
    <div className="bg-white border border-gray-300 p-6 shadow-md w-fit">
      <p className="text-xl font-semibold mb-6 text-center">{label}</p>

      <div className="space-y-4">

        {/* === [5.1] Напрямок руху === */}
        <div className="flex items-center gap-4">
          <label className="w-48 font-medium">Напрямок:</label>
          <Select value={params.direction} onValueChange={handleDirectionChange}>
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {directions.map(({ value, label, icon }) => {
                const rotation = B4ItemSettings.directionLayout[value]?.rotation || 0;
                return (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {icon ? (
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
                      ) : (
                        <span className="w-6 inline-block" />
                      )}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* === [5.2] Піктограма === */}
        <div className="flex items-center gap-4">
          <label className="w-48 font-medium">Піктограма:</label>
          <Select value={params.icon ?? ""} onValueChange={handleIconChange}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Оберіть піктограму" />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    {icon ? (
                      <svg
                        width={24}
                        height={24}
                        viewBox={`0 0 ${icon.width} ${icon.height}`}
                        className="text-gray-700"
                      >
                        <path d={icon.d} fill="currentColor" fillRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="w-6 inline-block" />
                    )}
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* === [5.3] Галочка: "Є центром населеного пункту" === */}
        {params.icon === "streetNetwork" && (
          <div className="flex items-center gap-2 ml-52">
            <input
              type="checkbox"
              id="isUrbanCenter"
              checked={params.isUrbanCenter || false}
              onChange={handleUrbanCenterToggle}
            />
            <label htmlFor="isUrbanCenter" className="text-sm">Є центром населеного пункту</label>
          </div>
        )}

        {/* === [5.4] Категорія або власна назва === */}
        {params.icon === "other" ? (
          // Власний текст (other)
          <div className="flex items-start gap-4">
            <label className="w-48 font-medium mt-2">Категорія:</label>
            <div className="flex flex-col gap-1">
              <Input
                value={params.customUa || ""}
                onChange={handleCustomUaChange}
                placeholder="Введіть українську назву"
                className="w-[260px]"
              />
              <Input
                value={params.customEn || ""}
                onChange={handleCustomEnChange}
                placeholder="Введіть переклад англійською"
                className="w-[260px]"
              />
            </div>
          </div>
        ) : (
          // Вибір категорії з готового списку
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">Категорія:</label>
            <Select value={params.mainText} onValueChange={handleMainTextChange}>
            <SelectTrigger className="w-[260px]">
              <div className="truncate">
                {params.direction === "end" &&
                (params.mainText === "Регіональний" || params.mainText === "Локальний")
                  ? "Регіональний / локальний"
                  : params.mainText || "Оберіть категорію"}
              </div>
            </SelectTrigger>

              <SelectContent>
                {categoryOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* === [5.5] Номер маршруту або назва === */}
        {isBicycleRoute ? (
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">Номер маршруту:</label>
            <Input
              inputMode="numeric"
              pattern="\d*"
              value={params.routeNumber || ""}
              onChange={handleRouteNumberChange}
              placeholder="Введіть цифру від 1 до 99"
              className="w-[260px]"
            />
          </div>
        ) : shouldShowNameField && (
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">Назва:</label>
            <Input
              value={params.subText || ""}
              onChange={(e) => setParams({ ...params, subText: e.target.value })}
              placeholder="Введіть українську назву"
              className="w-[260px]"
              disabled={isTooLong}
            />
          </div>
        )}

        {/* === [5.6] Чекбокс "Тимчасовий маршрут" === */}
        {tableType !== "temporary" && (
          <div className="flex items-center gap-2 ml-52">
            <input
              type="checkbox"
              id="isTemporaryRoute"
              checked={params.isTemporaryRoute || false}
              onChange={handleTemporaryRouteToggle}
            />
            <label htmlFor="isTemporaryRoute" className="text-sm">Тимчасовий маршрут</label>
          </div>
        )}

        {/* === [5.7] Додаткові позначки (іконки) === */}
        <div className="pt-4">
          <p className="font-medium text-center mb-2">Додаткові позначки:</p>
          <div className="flex justify-center border rounded overflow-hidden w-fit mx-auto">
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
                  className={`px-4 py-2 border-r last:border-r-0 ${
                    isActive ? "bg-blue-100" : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    // Обмеження: max 1 позначка для веломаршруту, 2 — для інших
                    const activeKeys = ["showEurovelo", "showVeloParking", "showVeloSTO"].filter(k => params[k]);
                    const isTryingToAdd = !params[key];
                    const maxAllowed = params.icon === "bicycleRoute" ? 1 : 2;

                    if (isTryingToAdd && activeKeys.length >= maxAllowed) return;

                    setParams({ ...params, [key]: !params[key] });
                  }}
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox={`0 0 ${icon.width} ${icon.height}`}
                    className="text-gray-700 mx-auto"
                  >
                    <path d={icon.d} fill="currentColor" fillRule="evenodd" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// === [6] РОТАЦІЇ ДЛЯ СТРІЛОК (для SelectItem іконок) ===
B4ItemSettings.directionLayout = {
  straight: { rotation: 0 },
  left: { rotation: -90 },
  right: { rotation: 90 },
  "straight-left": { rotation: -45 },
  "straight-right": { rotation: 45 },
  end: { rotation: 0 },
};

export default B4ItemSettings;
