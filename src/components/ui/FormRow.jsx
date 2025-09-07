// FormRow.jsx
import React from "react";

const ALIGN_MAP = {
  start: "lg:items-start",
  center: "lg:items-center",
  end: "lg:items-end",
  baseline: "lg:items-baseline",
};

const FormRow = ({ label, children, align = "center" }) => {
  const alignmentClass = ALIGN_MAP[align] ?? "lg:items-center";

  return (
    // мобільно: колонки; на lg: грід з 2 колонками
    <div className={`flex flex-col gap-1 lg:grid lg:grid-cols-[200px_1fr] ${alignmentClass} lg:gap-x-4`}>
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
