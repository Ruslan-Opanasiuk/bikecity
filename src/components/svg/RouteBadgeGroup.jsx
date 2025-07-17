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

export function getRouteBadgeGroupWidth(params = {}) {
  const spacing = 20;
  const categoryToType = {
    "Локальний": "local",
    "Регіональний": "regional",
    "Національний": "national",
  };

  const routeType = categoryToType[params.mainText];
  const routeNumberValid = !!params.routeNumber;
  const isDoubleDigit = +params.routeNumber >= 10;

  let total = 0;

  if (routeType && routeNumberValid) {
    total += routeType === "national"
      ? CircleConfigs["E5B4text"].outerRadius * 2
      : isDoubleDigit
        ? RectConfigs["E4B4text"].outerWidth
        : RectConfigs["E3B4text"].outerWidth;
    total += spacing;
  }

  if (params.showEurovelo) {
    total += RectConfigs["euroveloB4text"].outerWidth + spacing;
  }

  if (params.showVeloParking) {
    total += PathConfigs.veloParking.width * PathConfigs.veloParking.scale + spacing;
  }

  if (params.showVeloSTO) {
    total += PathConfigs.veloSTO.width * PathConfigs.veloSTO.scale + spacing;
  }

  return total;
}

function RouteBadgeGroup({ params = {}, x = 0, y = 0 }) {
  const spacing = 20;
  const elements = [];

  const categoryToType = {
    "Локальний": "local",
    "Регіональний": "regional",
    "Національний": "national",
  };
  const routeType = categoryToType[params.mainText];
  const routeNumberValid = !!params.routeNumber;
  const colors = getColors(params.tableType, routeType, params.isTerminus, params.isTemporaryRoute);

  const isPermanent = params.tableType === "permanent";
  const isTemporaryLocally = !!params.isTemporaryRoute;
  const isDoubleDigit = +params.routeNumber >= 10;
  const RectConfig = isDoubleDigit ? RectConfigs["E4B4text"] : RectConfigs["E3B4text"];
  const CircleConfig = CircleConfigs["E5B4text"];

  let currentX = 0;

  // === [2] Маршрутний бейдж з текстом ===
  const badgeTextPath = useMemo(() => {
    if (!routeType || !routeNumberValid) return "";
    const fontSize = (routeType === "national" ? 22 : 25) / 0.7;
    const centerX = routeType === "national"
      ? CircleConfig.outerRadius
      : RectConfig.outerWidth / 2;
    const centerY = routeType === "national"
      ? CircleConfig.outerRadius
      : RectConfig.outerHeight / 2;
    return textToPath(
      roadUABold,
      params.routeNumber.toString(),
      fontSize,
      centerX,
      centerY,
      "center",
      "middle"
    );
  }, [params.routeNumber, routeType]);

  if (routeType && routeNumberValid) {
    const routeBoxFrameColor =
      isPermanent && !isTemporaryLocally
        ? colors.routeBox.background
        : colors.routeBox.frame;

    elements.push(
      <g key="badge" transform={`translate(${currentX}, 0)`}>
        {routeType === "national" ? (
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
        <path d={badgeTextPath} fill={colors.routeBox.text} />
      </g>
    );
    currentX += routeType === "national"
      ? CircleConfig.outerRadius * 2
      : RectConfig.outerWidth;
    currentX += spacing;
  }

  // === [3] Eurovelo бейдж ===
  const euroveloConfig = RectConfigs["euroveloB4text"];
  const euroveloScale = 42.5 / PathConfigs.eurovelo.height;
  const euroveloIconOffset = (euroveloConfig.outerWidth / 2) - (PathConfigs.eurovelo.width * euroveloScale / 2);

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

  // === [4] Велопарковка ===
  if (params.showVeloParking) {
    elements.push(
      <g key="veloParking" transform={`translate(${currentX}, 0) scale(${PathConfigs.veloParking.scale})`}>
        <path d={PathConfigs.veloParking.d} fill="#005187" fillRule="evenodd" />
      </g>
    );
    currentX += PathConfigs.veloParking.width * PathConfigs.veloParking.scale + spacing;
  }

  // === [5] СТО ===
  if (params.showVeloSTO) {
    elements.push(
      <g key="veloSTO" transform={`translate(${currentX}, 0) scale(${PathConfigs.veloSTO.scale})`}>
        <path d={PathConfigs.veloSTO.d} fill="#005187" fillRule="evenodd" />
      </g>
    );
  }

  return <g transform={`translate(${x}, ${y})`}>{elements}</g>;
}

export default RouteBadgeGroup;
