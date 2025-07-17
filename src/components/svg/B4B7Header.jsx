// src/components/headers/B4B7Header.jsx
import React, { useMemo } from "react";
import opentype from "opentype.js";
import { textToPath } from "../../utils/textToPath";
import RectRenderer from "../../utils/RectRenderer";
import CircleRenderer from "../../utils/CircleRenderer";
import PathConfigs from "../../config/PathConfigs";
import CircleConfigs from "../../config/CircleConfigs";
import RectConfigs from "../../config/RectConfigs";
import getColors from "../../config/colorConfig.jsx";
import boldData from "../../utils/export/RoadUA-Bold.ttf.base64?raw";

const fontBuffer = Uint8Array.from(atob(boldData), c => c.charCodeAt(0)).buffer;
const roadUABold = opentype.parse(fontBuffer);

function B4B7Header({ params }) {
  const colors = getColors(params.tableType, params.numberType);
  const circleBadge = CircleConfigs["E5B4"];
  const isDoubleDigit = +params.routeNumber >= 10;
  const rectBadge = isDoubleDigit ? RectConfigs["E4B4"] : RectConfigs["E3B4"];
  const bicycleScale = 86 / PathConfigs.bicycle.height;

  const badgeWidth =
    params.numberType === "none"
      ? 0
      : params.numberType === "national"
      ? circleBadge.outerRadius * 2
      : rectBadge.outerWidth;

  const groupX =
    300 -
    (
      PathConfigs.bicycle.width * bicycleScale +
      (params.numberType !== "none" ? 30 + badgeWidth : 0)
    ) / 2;

  // — Текст як path —
  const fontSize = (params.numberType === "national" ? 38 : 41) / 0.7;
  const textX =
    params.numberType === "national"
      ? groupX + PathConfigs.bicycle.width * bicycleScale + 30 + circleBadge.outerRadius
      : groupX + PathConfigs.bicycle.width * bicycleScale + 30 + rectBadge.outerWidth / 2;
  const textY = params.numberType === "national" ? 105 : 110;

  const glyphPath = useMemo(
    () =>
      textToPath(
        roadUABold,
        params.routeNumber.toString(),
        fontSize,
        textX,
        textY,
        "center",
        "middle"
      ),
    [params.routeNumber, fontSize, textX, textY]
  );

  return (
    <>
      <path d={PathConfigs.topRoundedOuterRect.d} fill={colors.frameColor} />
      <path d={PathConfigs.topRoundedInnerRect.d} fill={colors.backgroundColor} />
      <g transform={`translate(${groupX}, 5)`}>
        <path
          d={PathConfigs.bicycle.d}
          fill={colors.symbolColor}
          fillRule="evenodd"
          transform={`translate(0, ${100 - (PathConfigs.bicycle.height * bicycleScale) / 2}) scale(${bicycleScale})`}
        />
        {params.numberType !== "none" && (
          <g transform={`translate(${PathConfigs.bicycle.width * bicycleScale + 30}, 0)`}>
            {params.numberType === "national" ? (
              <CircleRenderer
                config={circleBadge}
                outerColor={colors.routeBox.frame}
                innerColor={colors.routeBox.background}
                cx={circleBadge.outerRadius}
                cy={100}
              />
            ) : (
              <RectRenderer
                config={rectBadge}
                outerColor={colors.routeBox.frame}
                innerColor={colors.routeBox.background}
                x={0}
                y={100 - rectBadge.outerHeight / 2 + 5}
              />
            )}
          </g>
        )}
      </g>
      {params.numberType !== "none" && (
        <path
          d={glyphPath}
          fill={colors.routeBox.text}
          style={{ fontFeatureSettings: '"ss02"' }}
        />
      )}
    </>
  );
}

export default B4B7Header;
