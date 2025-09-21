import React from 'react';

function DimensionRuler({
  lines = [],
  dimensions = [],
  height = 25,
}) {
  if (lines.length === 0 || dimensions.length !== lines.length - 1) {
    return null;
  }

  const width = Math.max(...lines);
  const lineHeight = height * 0.66;
  const lineYStart = (height - lineHeight) / 2;
  const lineYEnd = lineYStart + lineHeight;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />

      {lines.map((x, index) => {
        let finalX = x;
        if (index === 0) {
          finalX = x + 1; // Першу лінію зміщуємо праворуч
        } else if (index === lines.length - 1) {
          finalX = x - 1; // Останню лінію зміщуємо ліворуч
        }
        
        return (
          <line
            key={`line-${index}`}
            x1={finalX} y1={lineYStart}
            x2={finalX} y2={lineYEnd}
            stroke="#808080"
            strokeWidth="1" // --- ЗМІНА ТУТ: Прибрано зайву умову ---
            strokeLinecap="round"
          />
        );
      })}

      {dimensions.map((dim, index) => {
        const startX = lines[index];
        const endX = lines[index + 1];
        const centerX = startX + (endX - startX) / 2;
        const centerY = height / 2;

        return (
          <text
            key={`dim-${index}`}
            x={centerX}
            y={centerY}
            fontSize="8"
            fill="black"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="400"
            transform={`rotate(90, ${centerX}, ${centerY})`}
          >
            {dim}
          </text>
        );
      })}
    </svg>
  );
}

export default DimensionRuler;