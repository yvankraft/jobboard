// Dependency-free SVG charts for admin dashboards.
// Pure SVG — safe to render from server components.

type Pt = { x: number; y: number };

function smooth(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function AreaChart({
  data,
  id,
  height = 200,
  stroke = "var(--chart-1)",
  className,
}: {
  data: number[];
  id: string;
  height?: number;
  stroke?: string;
  className?: string;
}) {
  const W = 600;
  const H = 160;
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = max - min || 1;
  const pad = 8;
  const pts = data.map((v, i) => ({
    x: pad + (i / Math.max(1, data.length - 1)) * (W - pad * 2),
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const line = smooth(pts);
  const area = `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="0"
          x2={W}
          y1={H * f}
          y2={H * f}
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeDasharray="4 6"
        />
      ))}
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Spark({
  data,
  width = 120,
  height = 36,
  stroke = "var(--chart-1)",
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
}) {
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: 2 + (i / Math.max(1, data.length - 1)) * (width - 4),
    y: height - 3 - ((v - min) / range) * (height - 6),
  }));
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width, height }}
      aria-hidden
    >
      <path d={smooth(pts)} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MiniBars({
  data,
  width = 110,
  height = 44,
  color = "var(--chart-1)",
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}) {
  const max = Math.max(1, ...data);
  const n = data.length;
  const gap = 3;
  const bw = Math.max(2, (width - gap * (n - 1)) / n);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width, height }}
      aria-hidden
    >
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * height);
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={height - h}
            width={bw}
            height={h}
            rx={2}
            fill={color}
            opacity={0.35 + (0.65 * v) / max}
          />
        );
      })}
    </svg>
  );
}

export function Bars({
  data,
  height = 180,
  color = "var(--chart-1)",
  labels,
  className,
}: {
  data: number[];
  height?: number;
  color?: string;
  labels?: string[];
  className?: string;
}) {
  const max = Math.max(1, ...data);
  return (
    <div className={className}>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((v, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${Math.max(3, (v / max) * 100)}%`,
                background: `linear-gradient(180deg, ${color}, transparent 140%)`,
                opacity: v === max ? 1 : 0.45 + (0.4 * v) / max,
              }}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div className="mt-1 flex gap-1.5">
          {labels.map((l, i) => (
            <div
              key={i}
              className="min-w-0 flex-1 truncate text-center text-[10px] text-muted-foreground"
            >
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Donut({
  segments,
  size = 150,
  thickness = 20,
  centerLabel,
  centerValue,
  className,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offsets: number[] = [];
  segments.reduce((acc, s) => {
    offsets.push(acc);
    return acc + (s.value / total) * c;
  }, 0);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeWidth={thickness}
      />
      {segments.map((s, i) => {
        const frac = s.value / total;
        const dash = `${Math.max(0, frac * c - 2)} ${c}`;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={dash}
            strokeDashoffset={-offsets[i]}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
      {(centerValue !== undefined || centerLabel) && (
        <>
          <text
            x="50%"
            y={centerLabel ? "47%" : "53%"}
            textAnchor="middle"
            fill="currentColor"
            fontSize={size / 6}
            fontWeight="600"
          >
            {centerValue}
          </text>
          {centerLabel && (
            <text
              x="50%"
              y="62%"
              textAnchor="middle"
              fill="currentColor"
              fillOpacity="0.55"
              fontSize={size / 11}
            >
              {centerLabel}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Segmented semicircular gauge — Ultraleads "Customers Volume" style. */
export function Gauge({
  value,
  segments = 24,
  size = 190,
  thickness = 12,
  color = "var(--chart-1)",
  track = "currentColor",
  className,
}: {
  /** 0-100 */
  value: number;
  segments?: number;
  size?: number;
  thickness?: number;
  color?: string;
  track?: string;
  className?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2 - 2;
  const gap = 3; // degrees between segments
  const span = 180 / segments;
  const filled = Math.round((Math.min(100, Math.max(0, value)) / 100) * segments);

  const arcs = Array.from({ length: segments }, (_, i) => {
    const a0 = -90 + i * span + gap / 2;
    const a1 = -90 + (i + 1) * span - gap / 2;
    const p0 = polar(cx, cy, r, a0);
    const p1 = polar(cx, cy, r, a1);
    return {
      d: `M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`,
      active: i < filled,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size / 2 + thickness}`}
      className={className}
      style={{ width: "100%", height: "auto" }}
      aria-hidden
    >
      {arcs.map((a, i) => (
        <path
          key={i}
          d={a.d}
          fill="none"
          stroke={a.active ? color : track}
          strokeOpacity={a.active ? 1 : 0.12}
          strokeWidth={thickness}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
