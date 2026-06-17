import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, X, Loader2, Calculator } from "lucide-react";
import Drawer from "../ui/Drawer";
import api, { imageUrl } from "../../lib/api";
import { valueItem } from "../../lib/valuation";
import { formatAED } from "../../lib/format";
import {
  ITEM_TYPES,
  METAL_TYPES,
  PURITIES,
  STONE_TYPES,
} from "../../lib/constants";

const MAX_IMAGES = 8;

const EMPTY = {
  name: "",
  itemType: "Necklace",
  metalType: "Gold",
  purity: "22k",
  netWeight: "",
  grossWeight: "",
  stoneType: "None",
  stoneWeight: "",
  makingCharges: "",
  collectionId: "",
  images: [],
  notes: "",
};

export default function ProductForm({
  open,
  onClose,
  onSaved,
  product,
  collections = [],
  onCollectionCreated,
}) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState(null);
  const fileRef = useRef(null);

  // Pricing rules for the live estimate (fetched once, cached).
  useEffect(() => {
    if (!open || settings) return;
    api.get("/settings").then((res) => setSettings(res.data)).catch(() => {});
  }, [open, settings]);

  // Recompute the estimate whenever the relevant fields change.
  const estimate = useMemo(() => valueItem(form, settings), [form, settings]);

  // Collections for the dropdown — kept local so an inline-created one appears
  // immediately without waiting for the parent to refetch.
  const [cols, setCols] = useState(collections);
  const [showNewCol, setShowNewCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [creatingCol, setCreatingCol] = useState(false);
  useEffect(() => setCols(collections), [collections]);
  useEffect(() => {
    if (!open) {
      setShowNewCol(false);
      setNewColName("");
    }
  }, [open]);

  const createCollection = async () => {
    const name = newColName.trim();
    if (!name) return;
    setCreatingCol(true);
    setError("");
    try {
      const res = await api.post("/collections", { name });
      setCols((prev) => [res.data, ...prev]);
      setForm((f) => ({ ...f, collectionId: res.data._id }));
      setNewColName("");
      setShowNewCol(false);
      onCollectionCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create collection");
    } finally {
      setCreatingCol(false);
    }
  };

  // Hydrate form when opening (for both add and edit).
  useEffect(() => {
    if (!open) return;
    setError("");
    if (product) {
      const imgs = product.images?.length
        ? product.images
        : product.image
        ? [product.image]
        : [];
      setForm({
        name: product.name || "",
        itemType: product.itemType || "Necklace",
        metalType: product.metalType || "Gold",
        purity: product.purity || "22k",
        netWeight: product.netWeight ?? "",
        grossWeight: product.grossWeight ?? "",
        stoneType: product.stoneType || "None",
        stoneWeight: product.stoneWeight ?? "",
        makingCharges: product.makingCharges ?? "",
        collectionId: product.collectionId?._id || product.collectionId || "",
        images: imgs,
        notes: product.notes || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, product]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFiles = async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_IMAGES} photos`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      files.slice(0, room).forEach((f) => data.append("images", f));
      const res = await api.post("/upload/multiple", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, images: [...f.images, ...res.data.urls] }));
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter an item name");
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      netWeight: Number(form.netWeight) || 0,
      grossWeight: Number(form.grossWeight) || 0,
      stoneWeight: Number(form.stoneWeight) || 0,
      makingCharges: Number(form.makingCharges) || 0,
      image: form.images[0] || "",
    };

    try {
      const res = isEdit
        ? await api.put(`/products/${product._id}`, payload)
        : await api.post("/products", payload);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save item");
    } finally {
      setSaving(false);
    }
  };

  const hasStone = form.stoneType && form.stoneType !== "None";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit jewellery item" : "Add jewellery item"}
      subtitle="Estimated value is calculated automatically from metal, stone & making charges."
      widthClass="max-w-xl"
    >
      <form onSubmit={submit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Photos */}
        <div>
          <label className="label">
            Photos{" "}
            <span className="font-normal normal-case text-muted/70">
              (up to {MAX_IMAGES})
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            {form.images.map((src, idx) => (
              <div
                key={src + idx}
                className="group relative h-[88px] w-[88px] overflow-hidden rounded-xl border border-line"
              >
                <img
                  src={imageUrl(src)}
                  alt={`photo ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-espresso-900/70 py-0.5 text-center text-[0.6rem] font-semibold text-cream-100">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-espresso-800 opacity-0 shadow transition hover:text-red-500 group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X size={13} />
                </button>
              </div>
            ))}

            {form.images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid h-[88px] w-[88px] place-items-center rounded-xl border border-dashed border-line bg-cream-100 text-muted transition hover:border-gold-400 hover:text-gold-600"
              >
                {uploading ? (
                  <Loader2 className="animate-spin text-gold-500" size={22} />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-[0.68rem]">
                    <Plus size={20} />
                    Add
                  </span>
                )}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>

        {/* Name + type */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Item name *</label>
            <input
              className="input"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Royal Diamond Necklace"
            />
          </div>
          <div>
            <label className="label">Item type</label>
            <select className="input" value={form.itemType} onChange={set("itemType")}>
              {ITEM_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Metal */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Metal type</label>
            <select className="input" value={form.metalType} onChange={set("metalType")}>
              {METAL_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Purity</label>
            <select className="input" value={form.purity} onChange={set("purity")}>
              {PURITIES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Net weight (g)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.netWeight}
              onChange={set("netWeight")}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Stone */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Stone type</label>
            <select className="input" value={form.stoneType} onChange={set("stoneType")}>
              {STONE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Stone weight (ct)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              disabled={!hasStone}
              className="input disabled:opacity-50"
              value={form.stoneWeight}
              onChange={set("stoneWeight")}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label">Making charges (AED)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.makingCharges}
              onChange={set("makingCharges")}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Collection + notes */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Collection</label>
            <div className="flex gap-2">
              <select
                className="input flex-1"
                value={form.collectionId}
                onChange={set("collectionId")}
              >
                <option value="">— No collection —</option>
                {cols.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCol((s) => !s)}
                className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-line bg-white text-gold-600 transition hover:border-gold-300 hover:bg-cream-100"
                title="New collection"
                aria-label="New collection"
              >
                <Plus size={18} />
              </button>
            </div>
            {showNewCol && (
              <div className="mt-2 flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="New collection name"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      createCollection();
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={createCollection}
                  disabled={creatingCol || !newColName.trim()}
                >
                  {creatingCol ? "…" : "Create"}
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="label">Notes</label>
            <input
              className="input"
              value={form.notes}
              onChange={set("notes")}
              placeholder="Optional details"
            />
          </div>
        </div>

        {/* Live valuation */}
        <div className="overflow-hidden rounded-2xl border border-gold-200 bg-gradient-to-br from-cream-50 to-gold-100/50">
          <div className="flex items-center gap-2 border-b border-gold-200/70 px-4 py-2.5">
            <Calculator size={16} className="text-gold-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">
              Live valuation
            </span>
          </div>
          <div className="space-y-1.5 px-4 py-3 text-sm">
            <Line
              label={`Metal (${form.netWeight || 0}g ${form.purity})`}
              value={formatAED(estimate?.metalValue || 0)}
            />
            {hasStone && (
              <Line
                label={`Stone (${form.stoneType} ${form.stoneWeight || 0}ct)`}
                value={formatAED(estimate?.stoneValue || 0)}
              />
            )}
            <Line
              label="Making charges"
              value={formatAED(Number(form.makingCharges) || 0)}
            />
            <div className="mt-2 flex items-center justify-between border-t border-gold-200/70 pt-2.5">
              <span className="font-display text-base font-semibold text-ink">
                Estimated value
              </span>
              <span className="font-display text-xl font-semibold text-gold-700">
                {formatAED(estimate?.estimatedValue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Est. buy-back value</span>
              <span className="font-semibold">{formatAED(estimate?.resaleValue || 0)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add item"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}

// One line in the live-valuation breakdown.
function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between text-ink/75">
      <span>{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
