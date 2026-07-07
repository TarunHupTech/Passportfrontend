import { useState, useEffect, useRef } from "react";
import { Plus, X, Loader2, Gift } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Drawer from "../ui/Drawer";
import api, { imageUrl } from "../../lib/api";
import { useAttributes } from "../../lib/useAttributes";

const MAX_IMAGES = 8;

// Keep the item's saved value selectable even if an admin later removed that
// option — so editing an older item never silently loses its attribute.
const withCurrent = (list, val) =>
  val && !list.includes(val) ? [val, ...list] : list;

const EMPTY = {
  name: "",
  itemType: "Necklace",
  metalType: "Gold",
  purity: "22k",
  netWeight: "",
  stoneType: "None",
  stoneWeight: "",
  brand: "",
  invoiceAmount: "",
  images: [],
  notes: "",
  occasion: "",
  isGift: false,
  purchaseDate: null,
  giftedDate: null,
};

export default function ProductForm({ open, onClose, onSaved, product, brands = [] }) {
  const isEdit = Boolean(product);
  const attrs = useAttributes();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

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
        stoneType: product.stoneType || "None",
        stoneWeight: product.stoneWeight ?? "",
        brand: product.brand || "",
        invoiceAmount: product.invoiceAmount ?? "",
        images: imgs,
        notes: product.notes || "",
        occasion: product.occasion || "",
        isGift: !!product.isGift,
        purchaseDate: product.purchaseDate ? new Date(product.purchaseDate) : null,
        giftedDate: product.giftedDate ? new Date(product.giftedDate) : null,
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
    if (room <= 0) return setError(`You can add up to ${MAX_IMAGES} photos`);
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
      stoneWeight: Number(form.stoneWeight) || 0,
      invoiceAmount: Number(form.invoiceAmount) || 0,
      image: form.images[0] || "",
      purchaseDate: form.isGift ? null : form.purchaseDate,
      giftedDate: form.isGift ? form.giftedDate : null,
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
      title={isEdit ? "Edit jewellery item" : "Add Jewellery Item"}
      subtitle="Record your piece and the amount you paid (invoice amount)."
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
                <img src={imageUrl(src)} alt={`photo ${idx + 1}`} className="h-full w-full object-cover" />
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
                    <Plus size={20} /> Add
                  </span>
                )}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>

        {/* Name + type */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Item name *</label>
            <input className="input" value={form.name} onChange={set("name")} placeholder="e.g. Royal Diamond Necklace" />
          </div>
          <div>
            <label className="label">Item type</label>
            <select className="input" value={form.itemType} onChange={set("itemType")}>
              {withCurrent(attrs.itemTypes, form.itemType).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand + invoice amount */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Brand</label>
            <input
              className="input"
              list="brand-options"
              value={form.brand}
              onChange={set("brand")}
              placeholder="e.g. Liali"
            />
            <datalist id="brand-options">
              {brands.map((b) => (
                <option key={b._id} value={b.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label">Invoice amount (AED)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.invoiceAmount}
              onChange={set("invoiceAmount")}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Metal */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Metal type</label>
            <select className="input" value={form.metalType} onChange={set("metalType")}>
              {withCurrent(attrs.metalTypes, form.metalType).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Purity</label>
            <select className="input" value={form.purity} onChange={set("purity")}>
              {withCurrent(attrs.purities, form.purity).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Net weight (g)</label>
            <input type="number" step="0.01" min="0" className="input" value={form.netWeight} onChange={set("netWeight")} placeholder="0.00" />
          </div>
        </div>

        {/* Stone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Stone type</label>
            <select className="input" value={form.stoneType} onChange={set("stoneType")}>
              {withCurrent(attrs.stoneTypes, form.stoneType).map((t) => (
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
        </div>

        {/* Gift toggle + date */}
        <div className="rounded-2xl border border-line bg-cream-50 p-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={form.isGift}
              onChange={(e) => setForm((f) => ({ ...f, isGift: e.target.checked }))}
              className="h-4 w-4 accent-gold-500"
            />
            <Gift size={16} className="text-gold-600" />
            This item was a gift
          </label>

          <div className="mt-3">
            {form.isGift ? (
              <>
                <label className="label">Gifted date</label>
                <DatePicker
                  selected={form.giftedDate}
                  onChange={(d) => setForm((f) => ({ ...f, giftedDate: d }))}
                  dateFormat="dd MMM yyyy"
                  maxDate={new Date()}
                  placeholderText="Select gifted date"
                  className="input"
                  wrapperClassName="w-full block"
                  popperClassName="liali-datepicker-popper"
                  popperProps={{ strategy: "fixed" }}
                  isClearable
                />
              </>
            ) : (
              <>
                <label className="label">Purchase date</label>
                <DatePicker
                  selected={form.purchaseDate}
                  onChange={(d) => setForm((f) => ({ ...f, purchaseDate: d }))}
                  dateFormat="dd MMM yyyy"
                  maxDate={new Date()}
                  placeholderText="Select purchase date"
                  className="input"
                  wrapperClassName="w-full block"
                  popperClassName="liali-datepicker-popper"
                  popperProps={{ strategy: "fixed" }}
                  isClearable
                />
              </>
            )}
          </div>
        </div>

        {/* Occasion + notes */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Occasion</label>
            <input
              className="input"
              value={form.occasion}
              onChange={set("occasion")}
              placeholder="e.g. Wedding, Anniversary"
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <input className="input" value={form.notes} onChange={set("notes")} placeholder="Optional details" />
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
