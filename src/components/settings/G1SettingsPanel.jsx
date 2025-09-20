import React, { useMemo, useEffect } from "react";
import FormRow from "../ui/FormRow";
import VeloRouteInputGroup from "./VeloRouteInputGroup";
import PathConfigs from "../../config/PathConfigs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

function G1SettingsPanel({ params, setParams, signSize }) {
  // --- Обробники подій ---
  const handleParamChange = (param, value) => setParams(prev => ({ ...prev, [param]: value }));
  const handleRouteNumberChange = (param, e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) value = value.slice(1);
    value = value.slice(0, 2);
    setParams(prev => ({ ...prev, [param]: value }));
  };
  const handleMarkingTypeChange = (value) => {
    setParams(prev => {
      const newParams = { ...prev, markingType: value, arrowType: 'none', isTwoDirections: false };
      delete newParams.secondNumberType;
      delete newParams.secondRouteNumber;
      delete newParams.secondArrowType;
      return newParams;
    });
  };
  
  const handleTwoDirectionsToggle = (e) => {
    const isChecked = e.target.checked;
    const newParams = { ...params, isTwoDirections: isChecked };

    // ЗМІНА ТУТ: При ввімкненні повзунка одразу встановлюємо значення за замовчуванням
    if (isChecked) {
      newParams.secondNumberType = 'national'; // Ваш дефолт
      newParams.secondRouteNumber = '';        // Порожній номер для початку
      newParams.secondArrowType = 'none';
    } else {
      // При вимкненні - очищуємо
      delete newParams.secondNumberType;
      delete newParams.secondRouteNumber;
      delete newParams.secondArrowType;
    }
    setParams(newParams);
  };

  // --- Дані та логіка ---
  const g1RouteLevelOptions = [
    { value: 'national', label: 'Національний' },
    { value: 'regional', label: 'Регіональний' },
    { value: 'local', label: 'Локальний' },
    { value: 'temporary', label: 'Тимчасовий' },
  ];
  const displayTitle = useMemo(() => {
    const titleMap = { national: 'Г.1', regional: 'Г.2', local: 'Г.3', temporary: 'Г.4' };
    const signIdentifier = titleMap[params.numberType] || 'Г.1';
    return `Налаштування ${signIdentifier}:`;
  }, [params.numberType]);
  const markingOptions = ['Розмітка1', 'Розмітка2', 'Розмітка3', 'Розмітка4', 'Розмітка5'];

  // Створюємо різні списки опцій для стрілок
  const allDirectionOptions = [
    { value: 'none', label: 'Немає', icon: null },
    { value: 'arrowStraight', label: 'Стрілка1', icon: PathConfigs.arrowStraight },
    { value: 'arrowSide', label: 'Стрілка2', icon: PathConfigs.arrowSide },
    { value: 'arrowStraightSide', label: 'Стрілка3', icon: PathConfigs.arrowStraightSide },
    { value: 'arrowSideR', label: 'Стрілка4', icon: PathConfigs.arrowSideR },
    { value: 'arrowStraightSideR', label: 'Стрілка5', icon: PathConfigs.arrowStraightSideR },
  ];
  const firstDirectionOptions = allDirectionOptions.filter(opt => !opt.value.includes('R'));
  const secondDirectionOptions = allDirectionOptions.filter(opt => !['arrowSide', 'arrowStraightSide'].includes(opt.value));
  
  const inputStyles = "w-full lg:w-[250px] text-[13px] text-gray-900 font-normal placeholder:text-gray-500 [&[data-placeholder]]:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=open]:ring-2 data-[state=open]:ring-blue-500";
  const markingsWithDirection = ['Розмітка3', 'Розмітка4', 'Розмітка5'];
  const showDirectionSelect = markingsWithDirection.includes(params.markingType);
  const showTwoDirectionsToggle = params.markingType === 'Розмітка5';

  // Визначаємо, який набір опцій використовувати для першої стрілки
  const optionsForFirstArrow = showTwoDirectionsToggle && params.isTwoDirections
    ? firstDirectionOptions
    : allDirectionOptions;

  return (
    <div className="p-0 w-full">
      <h2 className="text-[16px] font-bold mb-0 text-left">{displayTitle}<span className="text-[15px] font-normal ml-1">Горизонтальне ВМО</span></h2>
      {signSize && <div className="flex justify-between items-center mb-8"><p className="text-[14px] text-gray-500">розмір знаку: <span className="text-black">{Math.round(signSize.width)}x{Math.round(signSize.height)} мм</span></p></div>}
      <div className="space-y-2">
        <FormRow label="Рівень і номер:"><VeloRouteInputGroup routeType={params.numberType} onRouteTypeChange={(val) => handleParamChange('numberType', val)} routeNumber={params.routeNumber} onRouteNumberChange={(e) => handleRouteNumberChange('routeNumber', e)} levelOptions={g1RouteLevelOptions} inputClasses={inputStyles} /></FormRow>
      </div>
      <div className="space-y-2 mt-10 ">
        <h2 className="text-[16px] font-bold pt-4 text-left">Приклад застосування з розміткою:</h2>
        <hr className="my-2 border-gray-200" />
        <FormRow label="Тип розмітки:">
          <Select value={params.markingType} onValueChange={handleMarkingTypeChange}>
            <SelectTrigger className={inputStyles}><SelectValue placeholder="Оберіть тип" /></SelectTrigger>
            <SelectContent>{markingOptions.map((name) => (<SelectItem key={name} value={name} className="text-[13px]">{name}</SelectItem>))}</SelectContent>
          </Select>
        </FormRow>
        {showDirectionSelect && (
          <FormRow label="Напрямок:">
            <Select value={params.arrowType || 'none'} onValueChange={(val) => handleParamChange('arrowType', val)}>
              <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
              <SelectContent>
                {optionsForFirstArrow.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-[13px]"><div className="flex items-center gap-2">{opt.icon ? (<svg width={24} height={24} viewBox={`0 0 ${opt.icon.width} ${opt.icon.height}`} className="text-gray-700"><path d={opt.icon.d} fill="currentColor" fillRule="evenodd" /></svg>) : (<span className="w-6" />)}<span>{opt.label}</span></div></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        )}
        {showTwoDirectionsToggle && (
          <FormRow label=""><label htmlFor="isTwoDirections" className="inline-flex items-center cursor-pointer gap-3"><div className="relative"><input type="checkbox" id="isTwoDirections" className="sr-only peer" checked={params.isTwoDirections || false} onChange={handleTwoDirectionsToggle} /><div className="w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600"></div><div className="absolute left-0.5 top-0.5 bg-white border-gray-300 border rounded-full h-3 w-3 transition-transform peer-checked:translate-x-3"></div></div><span className="text-[13px] text-gray-700">Два напрямки</span></label></FormRow>
        )}
        {showTwoDirectionsToggle && params.isTwoDirections && (
          <div className="space-y-2 pt-2">
            <FormRow label="Рівень і номер 2:"><VeloRouteInputGroup routeType={params.secondNumberType} onRouteTypeChange={(val) => handleParamChange('secondNumberType', val)} routeNumber={params.secondRouteNumber} onRouteNumberChange={(e) => handleRouteNumberChange('secondRouteNumber', e)} levelOptions={g1RouteLevelOptions} inputClasses={inputStyles} /></FormRow>
            <FormRow label="Напрямок 2:">
              <Select value={params.secondArrowType || 'none'} onValueChange={(val) => handleParamChange('secondArrowType', val)}>
                <SelectTrigger className={inputStyles}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {secondDirectionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[13px]"><div className="flex items-center gap-2">{opt.icon ? (<svg width={24} height={24} viewBox={`0 0 ${opt.icon.width} ${opt.icon.height}`} className="text-gray-700"><path d={opt.icon.d} fill="currentColor" fillRule="evenodd" /></svg>) : (<span className="w-6" />)}<span>{opt.label}</span></div></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
          </div>
        )}
      </div>
    </div>
  );
}

export default G1SettingsPanel;