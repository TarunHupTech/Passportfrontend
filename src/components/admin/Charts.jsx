// Lightweight, dependency-free charts themed to the gold/cream palette.
import { formatAED } from "../../lib/format";

// Compact AED for headline figures (e.g. AED 1.05M / AED 50.1K).
export const compactAED = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `AED ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `AED ${(v / 1_000).toFixed(1)}K`;
  return formatAED(v);
};

export function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cream-100 text-gold-600">
        {Icon && <Icon size={22} strokeWidth={1.8} />}
      </div>
      <div className="min-w-0">
        <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">{label}</p>
        <p className="font-display text-xl font-semibold text-ink">{value}</p>
        {sub && <p className="truncate text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}

export function SectionTitle({ children }) {
  return <h2 className="mb-4 mt-2 font-display text-lg font-semibold text-ink">{children}</h2>;
}

export const PALETTE = [
  "#b8923f",
  "#642128",
  "#cdb066",
  "#a3672f",
  "#8a7f6e",
  "#d4af6a",
  "#7a5c3e",
  "#bfae8e",
];

// Card wrapper with a title.
export function Panel({ title, hint, children, className = "" }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// Horizontal bar list. `metric` is the numeric key; `format` renders the trailing label.
export function BarList({ data, metric = "count", format = (v) => v }) {
  if (!data || data.length === 0)
    return <p className="py-4 text-sm text-muted">No data yet.</p>;
  const max = Math.max(1, ...data.map((d) => d[metric] || 0));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.label + i}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate text-ink">{d.label}</span>
            <span className="ml-3 shrink-0 font-medium text-muted">{format(d[metric])}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full"
              style={{
                width: `${((d[metric] || 0) / max) * 100}%`,
                background: PALETTE[i % PALETTE.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// SVG donut with a legend and a centred figure.
export function Donut({ segments, centerValue, centerLabel }) {
  const real = (segments || []).filter((s) => s.value > 0);
  const total = real.reduce((s, x) => s + x.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width="130" height="130" viewBox="0 0 130 130" className="shrink-0">
        <g transform="rotate(-90 65 65)">
          <circle cx="65" cy="65" r={R} fill="none" stroke="var(--color-cream-200)" strokeWidth="16" />
          {real.map((s, i) => {
            const len = (s.value / total) * C;
            const seg = (
              <circle
                key={i}
                cx="65"
                cy="65"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return seg;
          })}
        </g>
        <text x="65" y="62" textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: "var(--color-ink)" }}>
          {centerValue}
        </text>
        <text x="65" y="80" textAnchor="middle" style={{ fontSize: 10, fill: "var(--color-muted)" }}>
          {centerLabel}
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
            <span className="text-ink">{s.label}</span>
            <span className="text-muted">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Vertical histogram for price ranges. Empty buckets are drawn as dashed "gaps".
export function Histogram({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: 168 }}>
        {data.map((d, i) => {
          const gap = d.count === 0;
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end">
              <span className={`mb-1 text-xs font-semibold ${gap ? "text-muted/60" : "text-ink"}`}>
                {d.count}
              </span>
              <div
                className="w-full rounded-t-md"
                style={{
                  height: gap ? 6 : `${Math.max(8, (d.count / max) * 138)}px`,
                  background: gap ? "var(--color-cream-100)" : "var(--color-gold-500)",
                  border: gap ? "1px dashed var(--color-line)" : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[0.65rem] text-muted">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Monthly trend — bars for count, hover shows count + value.
export function TrendBars({ data, format = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: 150 }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t bg-gradient-to-t from-gold-600 to-gold-400"
              style={{
                height: `${Math.max(d.count ? 4 : 2, (d.count / max) * 120)}px`,
                opacity: d.count ? 1 : 0.3,
              }}
            />
            <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded bg-espresso-900 px-2 py-1 text-[0.65rem] text-cream-100 shadow group-hover:block">
              {d.count} items · {format(d.value)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[0.58rem] text-muted">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
