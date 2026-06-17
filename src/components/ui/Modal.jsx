import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-espresso-900/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative my-4 w-full ${maxWidth} animate-[fadeIn_0.18s_ease] rounded-2xl bg-white shadow-luxe-lg`}
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition hover:bg-cream-100 hover:text-ink"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
