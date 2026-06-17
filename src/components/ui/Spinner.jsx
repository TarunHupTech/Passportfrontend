export default function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-cream-300 border-t-gold-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
