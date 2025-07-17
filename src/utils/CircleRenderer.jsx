function CircleRenderer({ config, outerColor, innerColor, cx, cy }) {
  
  const { 
    outerRadius, 
    strokeWidth 
  } = config;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={outerRadius - strokeWidth / 2}
        fill={innerColor}
        stroke={outerColor}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

export default CircleRenderer;
