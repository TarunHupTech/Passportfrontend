import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, LayoutGrid, List, Gem, SlidersHorizontal } from "lucide-react";
import api from "../lib/api";
import { METAL_TYPES, STONE_TYPES, SORT_OPTIONS } from "../lib/constants";
import ProductCard from "../components/jewellery/ProductCard";
import ProductTable from "../components/jewellery/ProductTable";
import ProductForm from "../components/jewellery/ProductForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";

export default function MyJewellery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");

  const [search, setSearch] = useState("");
  const [metalType, setMetalType] = useState("");
  const [stoneType, setStoneType] = useState("");
  // Pre-filter by ?collection=<id> when arriving from a collection's "View items".
  const [collectionId, setCollectionId] = useState(searchParams.get("collection") || "");
  const [sort, setSort] = useState("newest");

  // Keep the filter in sync if the URL param changes (e.g. navigating between collections).
  useEffect(() => {
    setCollectionId(searchParams.get("collection") || "");
  }, [searchParams]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (metalType) params.metalType = metalType;
      if (stoneType) params.stoneType = stoneType;
      if (collectionId) params.collectionId = collectionId;
      if (sort) params.sort = sort;
      const res = await api.get("/products", { params });
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, metalType, stoneType, collectionId, sort]);

  // Debounce so typing in search doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(fetchProducts, 280);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const loadCollections = useCallback(
    () => api.get("/collections").then((res) => setCollections(res.data)).catch(() => {}),
    []
  );

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleSaved = () => {
    fetchProducts();
    loadCollections();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleting._id}`);
      setDeleting(null);
      fetchProducts();
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasFilters = metalType || stoneType || collectionId;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            My Jewellery
          </h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} {products.length === 1 ? "item" : "items"} in your
            portfolio
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Jewellery
        </button>
      </div>

      {/* Toolbar */}
      <div className="card mb-6 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={18} className="absolute left-3.5 top-2.5 text-muted" />
          <input
            className="input pl-11"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="input w-auto" value={metalType} onChange={(e) => setMetalType(e.target.value)}>
          <option value="">All metals</option>
          {METAL_TYPES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <select className="input w-auto" value={stoneType} onChange={(e) => setStoneType(e.target.value)}>
          <option value="">All stones</option>
          {STONE_TYPES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          className="input w-auto"
          value={collectionId}
          onChange={(e) => {
            const v = e.target.value;
            setCollectionId(v);
            setSearchParams(v ? { collection: v } : {}, { replace: true });
          }}
        >
          <option value="">All collections</option>
          {collections.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-line bg-cream-100 p-1">
          <button
            onClick={() => setView("grid")}
            className={`grid h-8 w-8 place-items-center rounded-lg transition ${
              view === "grid" ? "bg-white text-gold-600 shadow-sm" : "text-muted"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={17} />
          </button>
          <button
            onClick={() => setView("table")}
            className={`grid h-8 w-8 place-items-center rounded-lg transition ${
              view === "table" ? "bg-white text-gold-600 shadow-sm" : "text-muted"
            }`}
            aria-label="Table view"
          >
            <List size={17} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner label="Loading your jewellery…" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={hasFilters || search ? SlidersHorizontal : Gem}
          title={hasFilters || search ? "No matching items" : "No jewellery yet"}
          message={
            hasFilters || search
              ? "Try adjusting your search or filters."
              : "Add your first piece to start building your valued collection."
          }
          action={
            !(hasFilters || search) && (
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={18} /> Add Jewellery
              </button>
            )
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      ) : (
        <ProductTable products={products} onEdit={openEdit} onDelete={setDeleting} />
      )}

      {/* Modals */}
      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        product={editing}
        collections={collections}
        onCollectionCreated={loadCollections}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete this item?"
        message={`"${deleting?.name}" will be permanently removed from your portfolio. This cannot be undone.`}
      />
    </div>
  );
}
