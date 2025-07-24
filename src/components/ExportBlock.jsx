function ExportBlock({ signType, params, exportSVG, exportPNG, exportPDF }) {
  // Уніфіковані стилі для кнопок
  const buttonStyles = "w-[50px] h-9 flex items-center justify-center rounded-md border-2 border-blue-600 bg-white text-blue-600 text-[13px] font-semibold hover:bg-blue-50 transition-colors";

  return (
    <div className="p-4 flex flex-col gap-2 items-start w-full">
      <h2 className="text-[16px] font-bold mb-0 text-left">Завантажити макет:</h2>

      <p className="text-[14px] mb-3 -mt-1 text-gray-500">
        в масштабі <span className="text-black font-bold">1:1</span>
      </p>

      {/* Контейнер для розміщення кнопок в ряд */}
      <div className="flex gap-2">
        <button
          onClick={() => exportSVG(signType, params)}
          className={buttonStyles}
        >
          SVG
        </button>
        <button
          onClick={() => exportPNG(signType, params)}
          className={buttonStyles}
        >
          PNG
        </button>
        <button
          onClick={() => exportPDF(signType, params)}
          className={buttonStyles}
        >
          PDF
        </button>
      </div>
    </div>
  );
}

export default ExportBlock;