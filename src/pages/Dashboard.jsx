import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Gem, Tag, Crown, Plus, FileBadge, ArrowRight } from "lucide-react";
import api from "../lib/api";
import { formatAED, greeting } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/ui/StatCard";
import ProductCard from "../components/jewellery/ProductCard";
import ProductForm from "../components/jewellery/ProductForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Spinner from "../components/ui/Spinner";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, br] = await Promise.all([
        api.get("/dashboard"),
        api.get("/brands"),
      ]);
      setData(dash.data);
      setBrands(br.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setFormOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleting._id}`);
      setDeleting(null);
      load();
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Spinner label="Preparing your portfolio…" />;

  const firstName = user?.name?.split(" ")[0] || "there";
  const mv = data?.mostValuableItem;

  return (
    <div className="space-y-7">
      {/* Greeting + hero portfolio card */}
      <div className="relative overflow-hidden rounded-3xl bg-espresso-900 p-7 text-cream-100 lg:p-9">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-gold-600/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cream-100/50">
              {greeting()}, {firstName}
            </p>
            <p className="mt-3 text-sm text-cream-100/60">Total invoice amount</p>
            <p className="font-display text-4xl font-semibold text-gold-300 sm:text-5xl">
              {formatAED(data?.totalInvoiceAmount)}
            </p>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={18} /> Add Jewellery
            </button>
            <Link to="/certificate" className="btn bg-cream-100/10 text-cream-100 hover:bg-cream-100/20">
              <FileBadge size={18} /> Valuation Report
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={Gem} label="Jewellery Items" value={data?.itemCount ?? 0} />
        <StatCard icon={Tag} label="Brands" value={data?.brandsCount ?? 0} />
        <StatCard
          icon={Crown}
          label="Most Valuable"
          value={mv ? formatAED(mv.invoiceAmount ?? mv.estimatedValue) : "—"}
          sub={mv?.name}
        />
      </div>

      {/* Recently added */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            Recently Added Items
          </h2>
          <Link
            to="/jewellery"
            className="flex items-center gap-1 text-sm font-semibold text-gold-600 hover:underline"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {data?.recentItems?.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.recentItems.map((p) => (
              <ProductCard key={p._id} product={p} onEdit={openEdit} onDelete={setDeleting} />
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-cream-100 text-gold-500">
              <Gem size={30} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">
                Your portfolio is empty
              </h3>
              <p className="mt-1 text-sm text-muted">
                Add your first jewellery item to start your collection.
              </p>
            </div>
            <button className="btn btn-primary" onClick={openAdd}>
              <Plus size={18} /> Add your first item
            </button>
          </div>
        )}
      </div>

      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        product={editing}
        brands={brands}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete this item?"
        message={`"${deleting?.name}" will be permanently removed from your portfolio.`}
      />
    </div>
  );
}
