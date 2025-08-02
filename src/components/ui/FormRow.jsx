// FormRow.jsx
import React from "react";

const FormRow = ({ label, children, align = "center" }) => {
  const alignmentClass = `lg:items-${align}`;
  return (
    // На мобільних: flex-col (мітка над полем)
    // На великих екранах (lg): grid (мітка зліва від поля)
    <div className={`flex flex-col gap-1 lg:grid lg:grid-cols-[150px_1fr] ${alignmentClass} lg:gap-x-4`}>
      <label className="font-semibold text-[13px] text-gray-800 whitespace-nowrap text-left lg:text-right">
        {label}
      </label>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default FormRow;