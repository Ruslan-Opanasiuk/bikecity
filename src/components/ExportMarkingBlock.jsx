function ExportMarkingBlock({ signType, params, exportSVG, exportPNG, exportPDF }) {
  const buttonStyles =
    "w-[50px] h-9 flex items-center justify-center rounded-md border-2 border-blue-600 bg-white text-blue-600 text-[13px] font-semibold hover:bg-blue-600 hover:text-white transition-colors";

  return (
    <div className="w-full flex flex-col items-start mt-10">
      <h2 className="text-[16px] font-bold pt-4 text-left">
        Завантажити розмітку:
      </h2>

      {/* роздільна лінія */}
      <hr className="my-2 border-gray-200 w-48" />

      <div className="flex gap-2">
        <button onClick={() => exportSVG(signType, params)} className={buttonStyles}>
          SVG
        </button>
        <button onClick={() => exportPNG(signType, params)} className={buttonStyles}>
          PNG
        </button>
        <button onClick={() => exportPDF(signType, params)} className={buttonStyles}>
          PDF
        </button>
      </div>
    </div>
  );
}

export default ExportMarkingBlock;
