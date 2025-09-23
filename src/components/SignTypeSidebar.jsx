import React from "react";

function SignTypeSidebar({ signType, setSignType }) {
  const plates = ["B1"];
  const signs = ["B2", "B3", "B4", "B7"];
  const horizontal = ["G1"];

  const formatSignType = (type) => {
    // 1. ЗМІНЕНО: Назва для G1 тепер "Г.1-Г.4"
    if (type === 'G1') return 'Г.1 - Г.4'; 
    if (type === 'B4') return 'B.4 - B.6';
    if (type.startsWith('B')) return `B.${type.slice(1)}`;
    return type;
  };

  const renderButtonList = (items, indented = false) => (
    <ul className="space-y-[1px]">
      {items.map((type) => (
        <li key={type} className={indented ? 'pl-4' : ''}>
          <button
            onClick={() => setSignType(type)}
            className="px-2 py-1 text-[14px] text-blue-600 hover:text-blue-800"
          >
            <span
              className={`inline ${
                signType === type
                  ? "text-black border-b-2 border-blue-600 font-medium"
                  : ""
              }`}
            >
              {formatSignType(type)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
  
  const renderSubheading = (title) => (
    <h3 className="pl-2 text-[14px] text-gray-500 font-medium mt-2 mb-0">
      {title}
    </h3>
  );

  return (
    <aside className="w-full">
      <h2 className="text-[16px] font-bold mb-2">Вибір ВМО:</h2>
      <div className="mb-0 last:mb-0">
        <h3 className="text-[14px] text-gray-500  mb-2">
          Вертикальне ВМО
        </h3>
        {renderSubheading("Таблички")}
        {renderButtonList(plates, true)}
        {renderSubheading("Знаки")}
        {renderButtonList(signs, true)}
      </div>

      <div className="mb-6 last:mb-0">
        <h3 className="text-[14px] text-gray-500 mt-2 mb-0">
          Горизонтальне ВМО
        </h3>
        {/* 2. ДОДАНО: 'true' для відступу, як у "Таблички" та "Знаки" */}
        {renderButtonList(horizontal, true)}
      </div>
    </aside>
  );
}

export default SignTypeSidebar;