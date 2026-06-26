import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Tag, Pencil, Trash2, Gem } from "lucide-react";
import api, { imageUrl } from "../lib/api";
import { formatAED } from "../lib/format";
import BrandForm from "../components/brands/BrandForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/brands");
      setBrands(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b) => {
    setEditing(b);
    setFormOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/brands/${deleting._id}`);
      setDeleting(null);
      load();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Brands
          </h1>
          <p className="mt-1 text-sm text-muted">
            The brands your pieces are from.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> New Brand
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading brands…" />
      ) : brands.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No brands yet"
          message="Brands appear here automatically when you type one while adding an item — or create one now and add a cover image."
          action={
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={18} /> New Brand
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <div key={b._id} className="card group overflow-hidden">
              {/* Cover band */}
              <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-espresso-800 to-espresso-900">
                {b.coverImage ? (
                  <img
                    src={imageUrl(b.coverImage)}
                    alt={b.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold-500/15 blur-2xl" />
                    <Tag size={32} className="text-gold-300/80" strokeWidth={1.4} />
                  </>
                )}
                <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(b)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-espresso-800 shadow transition hover:text-gold-600"
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleting(b)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-espresso-800 shadow transition hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{b.name}</h3>
                <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm text-muted">
                  {b.description || "No description"}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="flex items-center gap-1.5 text-sm text-ink/80">
                    <Gem size={15} className="text-gold-500" />
                    {b.itemCount} {b.itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="font-display font-semibold text-gold-600">
                    {formatAED(b.totalValue)}
                  </span>
                </div>

                <Link
                  to={`/jewellery?brand=${encodeURIComponent(b.name)}`}
                  className="mt-3 block text-center text-xs font-semibold text-gold-600 hover:underline"
                >
                  View items →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <BrandForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        brand={editing}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete this brand?"
        message={`"${deleting?.name}" will be removed. Its items are kept, but their brand is cleared.`}
      />
    </div>
  );
}
