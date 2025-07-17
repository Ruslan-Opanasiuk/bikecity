function RectRenderer({config, outerColor, innerColor, x, y }) {

  const {
    outerHeight,
    outerWidth,
    outerRadius,
    strokeWidth
  } = config;

  return (
    <g>
      <rect
        x={x + strokeWidth / 2}
        y={y + strokeWidth / 2}
        width={outerWidth - strokeWidth}
        height={outerHeight - strokeWidth}
        fill={innerColor}
        stroke={outerColor}
        strokeWidth={strokeWidth}
        rx={outerRadius}
        ry={outerRadius}
      />
    </g>
  );
}

export default RectRenderer;