export default function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 text-gold-700">
        {Icon && <Icon size={22} strokeWidth={1.8} />}
      </div>
      <div className="min-w-0">
        <p className="text-[0.68rem] font-medium uppercase tracking-wider text-muted">
          {label}
        </p>
        <p className="truncate font-display text-xl font-semibold text-ink">
          {value}
        </p>
        {sub && <p className="truncate text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}
