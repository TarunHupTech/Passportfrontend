import { useState, useEffect, useRef } from "react";
import { ImageIcon, Loader2, X, Upload, Search, Gem } from "lucide-react";
import Drawer from "../ui/Drawer";
import api, { imageUrl } from "../../lib/api";

export default function BrandForm({ open, onClose, onSaved, brand }) {
  const isEdit = Boolean(brand);
  const [form, setForm] = useState({ name: "", description: "", coverImage: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Product picker state
  const [allProducts, setAllProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setProductSearch("");
    setForm({
      name: brand?.name || "",
      description: brand?.description || "",
      coverImage: brand?.coverImage || "",
    });

    // Fetch all products and pre-select those already in this brand.
    api.get("/products").then((res) => {
      setAllProducts(res.data);
      if (brand?.name) {
        setSelectedIds(
          new Set(res.data.filter((p) => p.brand === brand.name).map((p) => p._id))
        );
      } else {
        setSelectedIds(new Set());
      }
    }).catch(() => setAllProducts([]));
  }, [open, brand]);

  const toggleProduct = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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
    if (!form.name.trim()) return setError("Please enter a brand name");
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, productIds: [...selectedIds] };
      const res = isEdit
        ? await api.put(`/brands/${brand._id}`, payload)
        : await api.post("/brands", payload);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save brand");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = productSearch.trim()
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      )
    : allProducts;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit brand" : "New brand"}
      subtitle="Name the brand, add a cover image, and select which items belong to it."
      widthClass="max-w-md"
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
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
          {form.coverImage ? (
            <div className="relative h-32 overflow-hidden rounded-xl border border-line">
              <img src={imageUrl(form.coverImage)} alt="cover" className="h-full w-full object-cover" />
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

        {/* Brand name */}
        <div>
          <label className="label">Brand name *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Cartier"
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[72px] resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional notes about this brand"
          />
        </div>

        {/* Product picker */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0">Items in this brand</label>
            {selectedIds.size > 0 && (
              <span className="chip bg-gold-100 text-gold-700">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          {allProducts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line bg-cream-50 px-4 py-5 text-center text-sm text-muted">
              No items yet — add jewellery first, then assign it to brands.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line">
              {/* Search (show if more than 4 items) */}
              {allProducts.length > 4 && (
                <div className="relative border-b border-line">
                  <Search size={15} className="absolute left-3.5 top-2.5 text-muted" />
                  <input
                    className="w-full bg-cream-50 py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted/60"
                    placeholder="Search items…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
              )}

              <ul className="max-h-56 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-muted">No items match your search.</li>
                ) : (
                  filteredProducts.map((p) => {
                    const checked = selectedIds.has(p._id);
                    return (
                      <li key={p._id}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-cream-50">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProduct(p._id)}
                            className="h-4 w-4 shrink-0 accent-gold-500"
                          />
                          {(p.images?.[0] || p.image) ? (
                            <img
                              src={imageUrl(p.images?.[0] || p.image)}
                              alt={p.name}
                              className="h-9 w-9 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cream-200 text-gold-400">
                              <Gem size={16} strokeWidth={1.5} />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                            <p className="text-xs text-muted">
                              {p.itemType} · {p.metalType} {p.purity}
                              {p.brand && p.brand !== (brand?.name || "") && (
                                <span className="ml-1 text-gold-600">(in {p.brand})</span>
                              )}
                            </p>
                          </div>
                        </label>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create brand"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
