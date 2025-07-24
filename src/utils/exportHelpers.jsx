// src/utils/exportHelpers.js
import { createRoot } from "react-dom/client";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import SignPreview from "../components/SignPreview";

// Генерація прихованого контейнера з SVG
export const renderForExport = async (signType, params) => {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  return new Promise((resolve) => {
    const root = createRoot(container);
    root.render(
      <SignPreview signType={signType} params={params} mode="export" />
    );
    setTimeout(() => {
      const svgNode = container.querySelector("svg");
      resolve({ svgNode, root, container });
    }, 200);
  });
};

// Експорт SVG
export const exportSVG = async (signType, params) => {
  const { svgNode, root, container } = await renderForExport(signType, params);
  if (!svgNode) return;

  const fullWidth = parseFloat(svgNode.getAttribute("width"));
  const fullHeight = parseFloat(svgNode.getAttribute("height"));

  // --- ЗМІНА ТУТ: Вираховуємо розмір знаку без рамки ---
  const signWidth = Math.round(fullWidth - 2);
  const signHeight = Math.round(fullHeight - 2);

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgNode);

  if (!/xmlns=/.test(source)) {
    source = source.replace(
      "<svg",
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }

  source = source.replace(
    /<svg([^>]*)>/,
    `<svg$1 viewBox="0 0 ${fullWidth} ${fullHeight}">`
  );

  source = source
    .replace(/width="([\d.]+)"/, `width="${fullWidth}mm"`)
    .replace(/height="([\d.]+)"/, `height="${fullHeight}mm"`);

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });
  
  const filename = `${signType}(${signWidth}x${signHeight}).svg`;
  saveAs(blob, filename);

  root.unmount();
  document.body.removeChild(container);
};

// Експорт PNG
export const exportPNG = async (signType, params) => {
  await document.fonts.ready;
  const { svgNode, root, container } = await renderForExport(signType, params);
  if (!svgNode) return;

  const fullWidth = parseFloat(svgNode.getAttribute("width"));
  const fullHeight = parseFloat(svgNode.getAttribute("height"));

  // --- ЗМІНА ТУТ: Вираховуємо розмір знаку без рамки ---
  const signWidth = Math.round(fullWidth - 2);
  const signHeight = Math.round(fullHeight - 2);

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgNode);

  if (!/xmlns=/.test(source)) {
    source = source.replace(
      "<svg",
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const scale = 3.7795;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(fullWidth * scale);
    canvas.height = Math.round(fullHeight * scale);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      const filename = `${signType}(${signWidth}x${signHeight}).png`;
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

// Експорт в PDF
export const exportPDF = async (signType, params) => {
  await document.fonts.ready;
  const { svgNode, root, container } = await renderForExport(signType, params);
  if (!svgNode) return;

  const fullWidth = parseFloat(svgNode.getAttribute("width"));
  const fullHeight = parseFloat(svgNode.getAttribute("height"));

  // --- ЗМІНА ТУТ: Вираховуємо розмір знаку без рамки для назви та розміру PDF ---
  const signWidth = Math.round(fullWidth - 2);
  const signHeight = Math.round(fullHeight - 2);

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgNode);
  if (!/xmlns=/.test(source)) {
    source = source.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const scale = 3.7795;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(fullWidth * scale);
    canvas.height = Math.round(fullHeight * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL('image/png');
    URL.revokeObjectURL(url);

    const pdf = new jsPDF({
      orientation: signWidth > signHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [signWidth, signHeight] // Створюємо PDF розміром самого знаку
    });

    pdf.addImage(imgData, 'PNG', 0, 0, signWidth, signHeight);
    
    const filename = `${signType}(${signWidth}x${signHeight}).pdf`;
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