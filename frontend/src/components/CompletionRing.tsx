export function CompletionRing({
  percent,
  size = 40,
  fill = true,
  label = true,
}: {
  percent: number;
  size?: number;
  fill?: boolean; // false = transparent center (e.g. wrapped around an avatar)
  label?: boolean; // false = hide the % text
}) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  const isPlatinum = percent === 100;
  const color = isPlatinum ? '#fbbf24' : '#a3e635'; // gold for 100%, else lime

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill={fill ? 'rgba(0,0,0,0.65)' : 'none'}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {label && (
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fontSize={size * 0.28}
          fontWeight="700"
          fill="#fff"
        >
          {percent}%
        </text>
      )}
    </svg>
  );
}
