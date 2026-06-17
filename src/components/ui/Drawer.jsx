import { useEffect } from "react";
import { X } from "lucide-react";

// Right-hand slide-in panel. Same prop shape as <Modal/> so forms swap easily.
export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = "max-w-md",
}) {
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
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-espresso-900/45 backdrop-blur-sm"
        style={{ animation: "overlayIn 0.2s ease" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full ${widthClass} flex-col bg-white shadow-luxe-lg`}
        style={{ animation: "slideInRight 0.26s cubic-bezier(0.22,1,0.36,1)" }}
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

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
