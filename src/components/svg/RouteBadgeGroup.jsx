import { useMemo } from "react";
import RectConfigs from "../../config/RectConfigs";
import CircleConfigs from "../../config/CircleConfigs";
import PathConfigs from "../../config/PathConfigs";
import RectRenderer from "../../utils/RectRenderer";
import CircleRenderer from "../../utils/CircleRenderer";
import getColors from "../../config/colorConfig.jsx";
import { textToPath } from "../../utils/textToPath";
import boldData from "../../utils/export/RoadUA-Bold.ttf.base64?raw";
import opentype from "opentype.js";

// === [1] Розбір шрифту ===
const fontBuffer = Uint8Array.from(atob(boldData), c => c.charCodeAt(0)).buffer;
const roadUABold = opentype.parse(fontBuffer);

const categoryToType = {
  "Локальний": "local",
  "Регіональний": "regional",
  "Національний": "national",
};

// === [A] Хелпер: повертає ширину одного маршрутного бейджа (за типом/номером)
function getSingleRouteBadgeWidth(routeTypeStr, routeNumber) {
  if (!routeTypeStr || !routeNumber) return 0;
  const isDouble = +routeNumber >= 10;
  if (routeTypeStr === "national") {
    return CircleConfigs["E5B4text"].outerRadius * 2;
  }
  return isDouble ? RectConfigs["E4B4text"].outerWidth : RectConfigs["E3B4text"].outerWidth;
}

// === [B] Хелпер: конфіги для рендера одного маршрутного бейджа
function getSingleRouteBadgeConfigs(routeTypeStr, routeNumber) {
  const isDouble = +routeNumber >= 10;
  const RectConfig = isDouble ? RectConfigs["E4B4text"] : RectConfigs["E3B4text"];
  const CircleConfig = CircleConfigs["E5B4text"];
  return { RectConfig, CircleConfig };
}

export function getRouteBadgeGroupWidth(params = {}) {
  const spacing = 20;

  const mainType = categoryToType[params.mainText];
  const mainHasNumber = !!params.routeNumber;

  let total = 0;

  // основний бейдж
  if (mainType && mainHasNumber) {
    total += getSingleRouteBadgeWidth(mainType, params.routeNumber);
    total += spacing;
  }

  // === НОВЕ: додаткові номерні бейджі ===
  const extra1Type = categoryToType[params.extraRoute1Type];
  const extra1Has = params.showExtraRoute1 && !!params.extraRoute1Number && !!extra1Type;
  if (extra1Has) {
    total += getSingleRouteBadgeWidth(extra1Type, params.extraRoute1Number);
    total += spacing;
  }

  const extra2Type = categoryToType[params.extraRoute2Type];
  const extra2Has = params.showExtraRoute2 && !!params.extraRoute2Number && !!extra2Type;
  if (extra2Has) {
    total += getSingleRouteBadgeWidth(extra2Type, params.extraRoute2Number);
    total += spacing;
  }

  // EuroVelo
  if (params.showEurovelo) {
    total += RectConfigs["euroveloB4text"].outerWidth + spacing;
  }

  // Паркінг
  if (params.showVeloParking) {
    total += PathConfigs.veloParking.width * PathConfigs.veloParking.scale + spacing;
  }

  // СТО (без фінального spacing — зберігаємо поточну поведінку)
  if (params.showVeloSTO) {
    total += PathConfigs.veloSTO.width * PathConfigs.veloSTO.scale + spacing; // якщо хочеш без хвоста — прибери + spacing
  }

  return total;
}

function RouteBadgeGroup({ params = {}, x = 0, y = 0 }) {
  const spacing = 20;
  const elements = [];

  const mainType = categoryToType[params.mainText];
  const mainHasNumber = !!params.routeNumber;

  const isPermanent = params.tableType === "permanent";
  const isTemporaryLocally = !!params.isTemporaryRoute;

  let currentX = 0;

  // === [C] Хелпер: побудувати path для тексту в бейджі
  const buildBadgeTextPath = (routeTypeStr, routeNumber, RectConfig, CircleConfig) => {
    if (!routeTypeStr || !routeNumber) return "";
    const fontSize = (routeTypeStr === "national" ? 22 : 25) / 0.7;
    const centerX = routeTypeStr === "national" ? CircleConfig.outerRadius : RectConfig.outerWidth / 2;
    const centerY = routeTypeStr === "national" ? CircleConfig.outerRadius : RectConfig.outerHeight / 2;
    return textToPath(roadUABold, String(routeNumber), fontSize, centerX, centerY, "center", "middle");
  };

  // === [D] Хелпер: зрендерити один маршрутний бейдж (прямокутник/коло + текст)
  const pushRouteBadge = (key, routeTypeStr, routeNumber) => {
    if (!routeTypeStr || !routeNumber) return;

    const { RectConfig, CircleConfig } = getSingleRouteBadgeConfigs(routeTypeStr, routeNumber);
    const colors = getColors(params.tableType, routeTypeStr, params.isTerminus, params.isTemporaryRoute);
    const routeBoxFrameColor = isPermanent && !isTemporaryLocally ? colors.routeBox.background : colors.routeBox.frame;

    const textPath = buildBadgeTextPath(routeTypeStr, routeNumber, RectConfig, CircleConfig);

    elements.push(
      <g key={key} transform={`translate(${currentX}, 0)`}>
        {routeTypeStr === "national" ? (
          <CircleRenderer
            config={CircleConfig}
            outerColor={routeBoxFrameColor}
            innerColor={colors.routeBox.background}
            cx={CircleConfig.outerRadius}
            cy={CircleConfig.outerRadius}
          />
        ) : (
          <RectRenderer
            config={RectConfig}
            outerColor={routeBoxFrameColor}
            innerColor={colors.routeBox.background}
            x={0}
            y={0}
          />
        )}
        <path d={textPath} fill={colors.routeBox.text} />
      </g>
    );

    // зсув по X
    currentX += getSingleRouteBadgeWidth(routeTypeStr, routeNumber);
    currentX += spacing;
  };

  // === [2] Основний маршрутний бейдж
  const mainConfigs = useMemo(() => {
    if (!mainType || !mainHasNumber) return null;
    return getSingleRouteBadgeConfigs(mainType, params.routeNumber);
  }, [mainType, mainHasNumber, params.routeNumber]);

  const mainTextPath = useMemo(() => {
    if (!mainType || !mainHasNumber || !mainConfigs) return "";
    return buildBadgeTextPath(mainType, params.routeNumber, mainConfigs.RectConfig, mainConfigs.CircleConfig);
  }, [mainType, mainHasNumber, mainConfigs, params.routeNumber]);

  if (mainType && mainHasNumber && mainConfigs) {
    const colors = getColors(params.tableType, mainType, params.isTerminus, params.isTemporaryRoute);
    const routeBoxFrameColor = isPermanent && !isTemporaryLocally ? colors.routeBox.background : colors.routeBox.frame;

    elements.push(
      <g key="badge-main" transform={`translate(${currentX}, 0)`}>
        {mainType === "national" ? (
          <CircleRenderer
            config={mainConfigs.CircleConfig}
            outerColor={routeBoxFrameColor}
            innerColor={colors.routeBox.background}
            cx={mainConfigs.CircleConfig.outerRadius}
            cy={mainConfigs.CircleConfig.outerRadius}
          />
        ) : (
          <RectRenderer
            config={mainConfigs.RectConfig}
            outerColor={routeBoxFrameColor}
            innerColor={colors.routeBox.background}
            x={0}
            y={0}
          />
        )}
        <path d={mainTextPath} fill={colors.routeBox.text} />
      </g>
    );
    currentX += getSingleRouteBadgeWidth(mainType, params.routeNumber);
    currentX += spacing;
  }

  // === [3] ДОДАТКОВІ маршрутні бейджі (VR1 / VR2) ===
  const extra1Type = categoryToType[params.extraRoute1Type];
  const extra1Has = params.showExtraRoute1 && !!params.extraRoute1Number && !!extra1Type;
  if (extra1Has) pushRouteBadge("badge-extra1", extra1Type, params.extraRoute1Number);

  const extra2Type = categoryToType[params.extraRoute2Type];
  const extra2Has = params.showExtraRoute2 && !!params.extraRoute2Number && !!extra2Type;
  if (extra2Has) pushRouteBadge("badge-extra2", extra2Type, params.extraRoute2Number);

  // === [4] Eurovelo бейдж ===
  const euroveloConfig = RectConfigs["euroveloB4text"];
  const euroveloScale = 42.5 / PathConfigs.eurovelo.height;
  const euroveloIconOffset =
    euroveloConfig.outerWidth / 2 - (PathConfigs.eurovelo.width * euroveloScale) / 2;

  const euroveloTextPath = useMemo(() => {
    if (!params.showEurovelo) return "";
    const fontSize = 18 / 0.7;
    const cx = euroveloConfig.outerWidth / 2;
    const cy = cx;
    return textToPath(roadUABold, "4", fontSize, cx, cy, "center", "middle");
  }, [params.showEurovelo]);

  if (params.showEurovelo) {
    elements.push(
      <g key="eurovelo" transform={`translate(${currentX}, 0)`}>
        <RectRenderer
          config={euroveloConfig}
          outerColor={"#005187"}
          innerColor={"#005187"}
          x={0}
          y={0}
        />
        <g transform={`translate(${euroveloIconOffset}, ${euroveloIconOffset}) scale(${euroveloScale})`}>
          <path d={PathConfigs.eurovelo.d} fill="#F5C30D" fillRule="evenodd" />
        </g>
        <path d={euroveloTextPath} fill="#FFFFFF" />
      </g>
    );
    currentX += euroveloConfig.outerWidth + spacing;
  }

  // === [5] Велопарковка ===
  if (params.showVeloParking) {
    elements.push(
      <g key="veloParking" transform={`translate(${currentX}, 0) scale(${PathConfigs.veloParking.scale})`}>
        <path d={PathConfigs.veloParking.d} fill="#005187" fillRule="evenodd" />
      </g>
    );
    currentX += PathConfigs.veloParking.width * PathConfigs.veloParking.scale + spacing;
  }

  // === [6] СТО ===
  if (params.showVeloSTO) {
    elements.push(
      <g key="veloSTO" transform={`translate(${currentX}, 0) scale(${PathConfigs.veloSTO.scale})`}>
        <path d={PathConfigs.veloSTO.d} fill="#005187" fillRule="evenodd" />
      </g>
    );
    // зберігаємо поточну поведінку по spacing (за потреби можеш його не додавати)
  }

  return <g transform={`translate(${x}, ${y})`}>{elements}</g>;
}

export default RouteBadgeGroup;
