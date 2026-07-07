import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Loader2, Shapes, Gem, Sparkles, Diamond } from "lucide-react";
import adminApi, { ADMIN_TOKEN_KEY } from "../../lib/adminApi";

const CATEGORIES = [
  { key: "itemTypes", label: "Item Types", icon: Shapes, placeholder: "e.g. Anklet" },
  { key: "metalTypes", label: "Metal Types", icon: Gem, placeholder: "e.g. Titanium" },
  { key: "purities", label: "Purities", icon: Sparkles, placeholder: "e.g. 916" },
  { key: "stoneTypes", label: "Stone Types", icon: Diamond, placeholder: "e.g. Topaz" },
];

export default function AdminAttributes() {
  const navigate = useNavigate();
  const [lists, setLists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inputs, setInputs] = useState({});
  const [busy, setBusy] = useState("");

  const handleAuth = (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      navigate("/admin/login", { replace: true });
      return true;
    }
    return false;
  };

  useEffect(() => {
    adminApi
      .get("/admin/attributes")
      .then((r) => setLists(r.data))
      .catch((err) => {
        if (!handleAuth(err)) setError("Could not load options.");
      })
      .finally(() => setLoading(false));
    // Load the option lists once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async (category) => {
    const value = (inputs[category] || "").trim();
    if (!value) return;
    setBusy(category);
    setError("");
    try {
      const r = await adminApi.post("/admin/attributes/add", { category, value });
      setLists(r.data);
      setInputs((s) => ({ ...s, [category]: "" }));
    } catch (err) {
      if (!handleAuth(err)) setError(err.response?.data?.message || "Could not add option.");
    } finally {
      setBusy("");
    }
  };

  const remove = async (category, value) => {
    setBusy(category + value);
    setError("");
    try {
      const r = await adminApi.post("/admin/attributes/remove", { category, value });
      setLists(r.data);
    } catch (err) {
      if (!handleAuth(err)) setError("Could not remove option.");
    } finally {
      setBusy("");
    }
  };

  if (loading)
    return (
      <div className="grid place-items-center py-24 text-gold-600">
        <Loader2 size={30} className="animate-spin" />
      </div>
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Product Attributes
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage the options customers choose from when adding jewellery. Changes apply to
          every customer's product form.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {CATEGORIES.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="card p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-cream-100 text-gold-600">
                <Icon size={18} />
              </div>
              <h3 className="font-display text-base font-semibold text-ink">{label}</h3>
              <span className="ml-auto text-xs text-muted">
                {lists[key]?.length || 0} options
              </span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {(lists[key] || []).map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-cream-50 py-1.5 pl-3 pr-1.5 text-sm text-ink"
                >
                  {v}
                  <button
                    onClick={() => remove(key, v)}
                    disabled={busy === key + v}
                    className="grid h-5 w-5 place-items-center rounded text-muted transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    aria-label={`Remove ${v}`}
                  >
                    {busy === key + v ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
                  </button>
                </span>
              ))}
              {(lists[key] || []).length === 0 && (
                <span className="text-sm text-muted">No options yet.</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                className="input"
                placeholder={placeholder}
                value={inputs[key] || ""}
                onChange={(e) => setInputs((s) => ({ ...s, [key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    add(key);
                  }
                }}
              />
              <button
                onClick={() => add(key)}
                disabled={busy === key}
                className="btn btn-primary shrink-0"
              >
                {busy === key ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
