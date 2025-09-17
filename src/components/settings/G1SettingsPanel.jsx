import React, { useMemo } from "react";
import FormRow from "../ui/FormRow";
import VeloRouteInputGroup from "./VeloRouteInputGroup";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

function G1SettingsPanel({ params, setParams, signSize }) {
  // --- Обробники подій ---

  const handleNumberTypeChange = (value) => {
    setParams({ ...params, numberType: value });
  };

  const handleRouteNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) value = value.slice(1);
    value = value.slice(0, 2);
    setParams({ ...params, routeNumber: value });
  };

  const handleMarkingTypeChange = (value) => {
    setParams({ ...params, markingType: value });
  };

  // --- Дані для налаштувань ---

  // 1. ЗМІНЕНО ПОРЯДОК ЗНАЧЕНЬ
  const g1RouteLevelOptions = [
    { value: 'national', label: 'Національний' },
    { value: 'regional', label: 'Регіональний' },
    { value: 'local', label: 'Локальний' },
    { value: 'temporary', label: 'Тимчасовий' },
  ];

  // 2. ДОДАНО ЛОГІКУ ДЛЯ ДИНАМІЧНОГО ЗАГОЛОВКА
  const displayTitle = useMemo(() => {
    const titleMap = {
      national: 'Г.1',
      regional: 'Г.2',
      local: 'Г.3',
      temporary: 'Г.4',
    };
    const signIdentifier = titleMap[params.numberType] || 'Г.1';
    return `Налаштування ${signIdentifier}:`;
  }, [params.numberType]);

  const markingOptions = Array.from({ length: 8 }, (_, i) => `B.${i + 1}`);

  const inputStyles = "w-full lg:w-[250px] text-[13px] text-gray-900 font-normal placeholder:text-gray-500 [&[data-placeholder]]:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500";

  return (
    <div className="p-0 w-full">
      <h2 className="text-[16px] font-bold mb-0 text-left">
        {displayTitle}
        <span className="text-[15px] font-normal ml-1">Горизонтальне ВМО</span>
      </h2>

      {/* 3. ЗНАЧЕННЯ РОЗМІРІВ ПОМНОЖЕНО НА 10 */}
      {signSize && (
        <div className="flex justify-between items-center mb-8">
          <p className="text-[14px] text-gray-500">
            розмір знаку:{" "}
            <span className="text-black">
              {Math.round(signSize.width)}x{Math.round(signSize.height)} мм
            </span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <FormRow label="Рівень і номер:">
          <VeloRouteInputGroup
            routeType={params.numberType}
            onRouteTypeChange={handleNumberTypeChange}
            routeNumber={params.routeNumber}
            onRouteNumberChange={handleRouteNumberChange}
            levelOptions={g1RouteLevelOptions}
            inputClasses={inputStyles}
          />
        </FormRow>
      </div>
      <div className="space-y-2 mt-10 ">
        <h2 className="text-[16px] font-bold pt-4 text-left">
            Приклад застосування з розміткою:
        </h2>
        <hr className="my-2 border-gray-200" />
        <FormRow label="Тип розмітки:">
            <Select
                value={params.markingType}
                onValueChange={handleMarkingTypeChange}
            >
                <SelectTrigger className={inputStyles}>
                    <SelectValue placeholder="Оберіть тип" />
                </SelectTrigger>
                <SelectContent>
                    {markingOptions.map((name) => (
                        <SelectItem key={name} value={name} className="text-[13px]">
                            {name} (тимчасова назва)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FormRow>
        
      </div>
    </div>
  );
}

export default G1SettingsPanel;