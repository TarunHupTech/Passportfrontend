import { useState, useEffect, useRef } from "react";
import { Search, Gem, Check, ImageIcon, Loader2, X, Upload } from "lucide-react";
import Drawer from "../ui/Drawer";
import api, { imageUrl } from "../../lib/api";
import { formatAED } from "../../lib/format";

export default function CollectionForm({ open, onClose, onSaved, collection }) {
  const isEdit = Boolean(collection);
  const [form, setForm] = useState({ name: "", description: "", coverImage: "" });
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setSearch("");
    setForm({
      name: collection?.name || "",
      description: collection?.description || "",
      coverImage: collection?.coverImage || "",
    });
    // Load all products, pre-selecting those already in this collection.
    api
      .get("/products")
      .then((res) => {
        setProducts(res.data);
        if (collection) {
          const ids = res.data
            .filter((p) => (p.collectionId?._id || p.collectionId) === collection._id)
            .map((p) => p._id);
          setSelected(new Set(ids));
        } else {
          setSelected(new Set());
        }
      })
      .catch(() => setProducts([]));
  }, [open, collection]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, coverImage: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter a collection name");
    setSaving(true);
    setError("");
    const payload = { ...form, productIds: [...selected] };
    try {
      const res = isEdit
        ? await api.put(`/collections/${collection._id}`, payload)
        : await api.post("/collections", payload);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save collection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit collection" : "New collection"}
      subtitle="Name your set and choose the pieces that belong to it."
      widthClass="max-w-lg"
    >
      <form onSubmit={submit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Cover image */}
        <div>
          <label className="label">Cover image</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCover}
          />
          {form.coverImage ? (
            <div className="group relative h-32 overflow-hidden rounded-xl border border-line">
              <img
                src={imageUrl(form.coverImage)}
                alt="cover"
                className="h-full w-full object-cover"
              />
              {uploading && (
                <span className="absolute inset-0 grid place-items-center bg-white/70">
                  <Loader2 className="animate-spin text-gold-500" size={24} />
                </span>
              )}
              <div className="absolute right-2 top-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-espresso-800 shadow transition hover:text-gold-600"
                  aria-label="Change cover"
                >
                  <Upload size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-espresso-800 shadow transition hover:text-red-500"
                  aria-label="Remove cover"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-cream-100 text-muted transition hover:border-gold-400 hover:text-gold-600"
            >
              {uploading ? (
                <Loader2 className="animate-spin text-gold-500" size={24} />
              ) : (
                <>
                  <ImageIcon size={24} />
                  <span className="text-sm">Add cover image</span>
                </>
              )}
            </button>
          )}
        </div>

        <div>
          <label className="label">Collection name *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Bridal Set"
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[72px] resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional notes about this collection"
          />
        </div>

        {/* Product picker */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0">Items in this collection</label>
            <span className="chip bg-espresso-900 text-white">
              {selected.size} selected
            </span>
          </div>

          {products.length > 4 && (
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-2.5 text-muted" />
              <input
                className="input pl-9"
                placeholder="Search your jewellery…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-xl border border-line bg-cream-50 p-2">
            {filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted">
                {products.length === 0
                  ? "No jewellery yet — add items first, then group them here."
                  : "No items match your search."}
              </p>
            ) : (
              filtered.map((p) => {
                const isSel = selected.has(p._id);
                const inOther =
                  (p.collectionId?._id || p.collectionId) &&
                  (p.collectionId?._id || p.collectionId) !== collection?._id;
                return (
                  <button
                    type="button"
                    key={p._id}
                    onClick={() => toggle(p._id)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition ${
                      isSel
                        ? "border-gold-300 bg-gold-100/50"
                        : "border-transparent hover:bg-cream-100"
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                        isSel
                          ? "border-gold-500 bg-gold-500 text-white"
                          : "border-line bg-white"
                      }`}
                    >
                      {isSel && <Check size={13} />}
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream-200 text-gold-400">
                      {p.images?.[0] || p.image ? (
                        <img
                          src={imageUrl(p.images?.[0] || p.image)}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Gem size={16} strokeWidth={1.5} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {p.name}
                      </span>
                      <span className="block text-xs text-muted">
                        {p.metalType} {p.purity} · {formatAED(p.estimatedValue)}
                        {inOther && !isSel && (
                          <span className="ml-1 text-gold-600">
                            · in {p.collectionId?.name || "another set"}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
          {products.length > 0 && (
            <p className="mt-1.5 text-xs text-muted">
              Moving an item here removes it from any other collection.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create collection"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
