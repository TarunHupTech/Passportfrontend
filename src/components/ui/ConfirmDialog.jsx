import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle size={22} />
        </div>
        <p className="pt-1 text-sm leading-relaxed text-ink/80">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          className="btn bg-red-500 text-white hover:bg-red-600"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
