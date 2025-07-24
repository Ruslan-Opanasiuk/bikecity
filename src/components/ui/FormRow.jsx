// /components/ui/FormRow.js

const FormRow = ({ label, children }) => {
  return (
    // Змінено 180px на 150px, щоб зменшити поле для назви
    <div className="grid grid-cols-[120px_1fr] items-center gap-x-4">
      <label className="text-right font-semibold text-[13px] text-gray-800 whitespace-nowrap">
        {label}
      </label>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default FormRow;