import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../ui/select";

function VeloRouteInputGroup({
  routeType,
  onRouteTypeChange,
  routeNumber,
  onRouteNumberChange,
  levelOptions = [],
  inputClasses,
  direction,
  allowNone = false,
}) {
  const showNumberInput = !allowNone || (routeType && routeType !== "none");

  const displayValue = useMemo(() => {
    if (direction === 'end' && (routeType === 'Регіональний' || routeType === 'Локальний')) {
      return 'Регіональний / Локальний';
    }
    const selectedOption = levelOptions.find(opt => (typeof opt === 'object' ? opt.value : opt) === routeType);
    if (selectedOption) {
      return typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
    }
    return null;
  }, [routeType, direction, levelOptions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
      {/* ОСЬ ТУТ ВИПРАВЛЕНО ПОМИЛКУ (було md-col-span-3) */}
      <div className={showNumberInput ? "md:col-span-2" : "md:col-span-3"}>
        <Select value={routeType || ""} onValueChange={onRouteTypeChange}>
          <SelectTrigger className={`${inputClasses} lg:w-full`}>
            {displayValue ? (
              <span className="truncate">{displayValue}</span>
            ) : (
              <span className="text-gray-500">Оберіть рівень</span>
            )}
          </SelectTrigger>
          <SelectContent>
            {levelOptions.map((opt) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const label = typeof opt === 'object' ? opt.label : opt;
              return (
                <SelectItem key={value} value={value} className="text-[13px]">
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {showNumberInput && (
        <div className="md:col-span-1">
          <Input
            inputMode="numeric"
            pattern="\d*"
            value={routeNumber || ""}
            onChange={onRouteNumberChange}
            placeholder="Номер"
            className={`${inputClasses} lg:w-full`}
            disabled={routeType === "eurovelo"}
          />
        </div>
      )}
    </div>
  );
}

export default VeloRouteInputGroup;