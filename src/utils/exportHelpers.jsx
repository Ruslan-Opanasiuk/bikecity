import { createRoot } from "react-dom/client";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import SignPreview from "../components/SignPreview";
import RoadMarkingPreview from "../components/RoadMarkingPreview";
import G1 from "../utils/G1";

// ------------------------------------------------------------
// 1. Функція для визначення назви файлу
// ------------------------------------------------------------
const getEffectiveSignType = (signType, params) => {
  if (signType === "B4" && params.b4Items) {
    const itemCount = params.b4Items.length;
    if (itemCount === 2) return "B5";
    if (itemCount === 3) return "B6";
  }
  // Логіка для Г.1-Г.4
  if (signType === "G1") {
    const titleMap = {
      national: "Г1",
      regional: "Г2",
      local: "Г3",
      temporary: "Г4",
    };
    return titleMap[params.numberType] || signType;
  }
  return signType;
};

// ------------------------------------------------------------
// 2. Універсальний рендер для експорту
//    mode = "sign" (дефолт) або "marking"
// ------------------------------------------------------------
export const renderForExport = async (signType, params, mode = "sign") => {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  return new Promise((resolve) => {
    const root = createRoot(container);

    if (mode === "sign") {
      root.render(<SignPreview signType={signType} params={params} mode="export" />);
    } else if (mode === "marking") {
      root.render(
        <RoadMarkingPreview
          markingType={params.markingType}
          g1Sign={<G1 params={params} />}
          g1Params={params}
        />
      );
    }

    setTimeout(() => {
      const svgNode = container.querySelector("svg");
      resolve({ svgNode, root, container });
    }, 200);
  });
};// ... решта імпортів лишаємо без змін ...

// ------------------------------------------------------------
// 3. Експорт SVG
// ------------------------------------------------------------
export const exportSVG = async (signType, params, mode = "sign") => {
  const { svgNode, root, container } = await renderForExport(signType, params, mode);
  if (!svgNode) return;

  const fullWidth = parseFloat(svgNode.getAttribute("width"));
  const fullHeight = parseFloat(svgNode.getAttribute("height"));

  // масштаб 0.4 мм/px тільки для розмітки
  const targetWidthMm = mode === "marking" ? fullWidth * 0.4 : fullWidth;
  const targetHeightMm = mode === "marking" ? fullHeight * 0.4 : fullHeight;

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgNode);

  if (!/xmlns=/.test(source)) {
    source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // прибираємо старий viewBox і задаємо свій
  source = source
    .replace(/viewBox="[^"]*"/, "")
    .replace(
      /<svg([^>]*)>/,
      `<svg$1 viewBox="0 0 ${fullWidth} ${fullHeight}">`
    );

  // задаємо розміри в мм
  source = source
    .replace(/width="([\d.]+)"/, `width="${targetWidthMm}mm"`)
    .replace(/height="([\d.]+)"/, `height="${targetHeightMm}mm"`);

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });

  // --- формуємо назву ---
  let filename;
  if (mode === "marking") {
    filename = `${params.markingType}.svg`;
  } else {
    let displayWidth = targetWidthMm;
    let displayHeight = targetHeightMm;
    if (mode === "sign" && !signType.startsWith("G")) {
      displayWidth = Math.round(displayWidth - 2);
      displayHeight = Math.round(displayHeight - 2);
    }
    const effectiveSignType = getEffectiveSignType(signType, params);
    filename = `${effectiveSignType}(${displayWidth}x${displayHeight}).svg`;
  }

  saveAs(blob, filename);

  root.unmount();
  document.body.removeChild(container);
};

// ------------------------------------------------------------
// 4. Експорт PNG
// ------------------------------------------------------------
export const exportPNG = async (signType, params, mode = "sign") => {
  await document.fonts.ready;
  const { svgNode, root, container } = await renderForExport(signType, params, mode);
  if (!svgNode) return;

  const fullWidth = parseFloat(svgNode.getAttribute("width"));
  const fullHeight = parseFloat(svgNode.getAttribute("height"));

  const targetWidthMm = mode === "marking" ? fullWidth * 0.4 : fullWidth;
  const targetHeightMm = mode === "marking" ? fullHeight * 0.4 : fullHeight;

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgNode);
  if (!/xmlns=/.test(source)) {
    source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const pxPerMm = 3.7795;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(targetWidthMm * pxPerMm);
    canvas.height = Math.round(targetHeightMm * pxPerMm);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      let filename;
      if (mode === "marking") {
        filename = `${params.markingType}.png`;
      } else {
        let displayWidth = targetWidthMm;
        let displayHeight = targetHeightMm;
        if (mode === "sign" && !signType.startsWith("G")) {
          displayWidth = Math.round(displayWidth - 2);
          displayHeight = Math.round(displayHeight - 2);
        }
        const effectiveSignType = getEffectiveSignType(signType, params);
        filename = `${effectiveSignType}(${displayWidth}x${displayHeight}).png`;
      }
      saveAs(pngBlob, filename);
    });
  };

  img.onerror = (e) => {
    console.error("Error loading SVG for PNG export", e);
  };
  img.src = url;

  root.unmount();
  document.body.removeChild(container);
};

// ------------------------------------------------------------
// 5. Експорт PDF
// ------------------------------------------------------------
export const exportPDF = async (signType, params, mode = "sign") => {
  await document.fonts.ready;
  const { svgNode, root, container } = await renderForExport(signType, params, mode);
  if (!svgNode) return;

  const fullWidth = parseFloat(svgNode.getAttribute("width"));
  const fullHeight = parseFloat(svgNode.getAttribute("height"));

  const targetWidthMm = mode === "marking" ? fullWidth * 0.4 : fullWidth;
  const targetHeightMm = mode === "marking" ? fullHeight * 0.4 : fullHeight;

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgNode);
  if (!/xmlns=/.test(source)) {
    source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  source = source.replace(/viewBox="[^"]*"/, "");

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const pxPerMm = 3.7795;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(targetWidthMm * pxPerMm);
    canvas.height = Math.round(targetHeightMm * pxPerMm);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL("image/png");
    URL.revokeObjectURL(url);

    const pdf = new jsPDF({
      orientation: targetWidthMm > targetHeightMm ? "landscape" : "portrait",
      unit: "mm",
      format: [targetWidthMm, targetHeightMm],
    });

    pdf.addImage(imgData, "PNG", 0, 0, targetWidthMm, targetHeightMm);

    let filename;
    if (mode === "marking") {
      filename = `${params.markingType}.pdf`;
    } else {
      let displayWidth = targetWidthMm;
      let displayHeight = targetHeightMm;
      if (mode === "sign" && !signType.startsWith("G")) {
        displayWidth = Math.round(displayWidth - 2);
        displayHeight = Math.round(displayHeight - 2);
      }
      const effectiveSignType = getEffectiveSignType(signType, params);
      filename = `${effectiveSignType}(${displayWidth}x${displayHeight}).pdf`;
    }

    pdf.save(filename);
  };

  img.onerror = (e) => {
    console.error("Error loading SVG for PDF export", e);
    URL.revokeObjectURL(url);
  };
  img.src = url;

  root.unmount();
  document.body.removeChild(container);
};
