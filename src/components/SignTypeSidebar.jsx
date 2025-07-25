function SignTypeSidebar({ signType, setSignType }) {
  const vertical = ["B1", "B2", "B3", "B4", "B7"];
  const horizontal = ["Г1"];

  const renderGroup = (title, items) => (
    <div className="mb-6">
      <h3 className="text-[14px] text-gray-500 mb-2">
        {title}
      </h3>
      <ul className="space-y-[1px]">
        {items.map((type) => (
          <li key={type}>
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
                {type}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <aside className="w-full">
      <h2 className="text-[16px] font-bold mb-0">Вибір ВМО:</h2>
      {renderGroup("Вертикальне ВМО", vertical)}
      {renderGroup("Горизонтальне ВМО", horizontal)}
    </aside>
  );
}

export default SignTypeSidebar;