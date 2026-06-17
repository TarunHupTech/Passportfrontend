export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-cream-100 text-gold-500">
          <Icon size={30} strokeWidth={1.6} />
        </div>
      )}
      <h3 className="mt-5 font-display text-xl font-semibold text-ink">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
