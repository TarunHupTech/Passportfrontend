import { Gem, Pencil, Trash2 } from "lucide-react";
import { imageUrl } from "../../lib/api";
import { formatAED } from "../../lib/format";

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-cream-100 text-[0.7rem] uppercase tracking-wider text-muted">
              <th className="px-5 py-3.5 font-semibold">Item</th>
              <th className="px-5 py-3.5 font-semibold">Metal</th>
              <th className="px-5 py-3.5 font-semibold">Stone</th>
              <th className="px-5 py-3.5 font-semibold">Weight</th>
              <th className="px-5 py-3.5 font-semibold">Collection</th>
              <th className="px-5 py-3.5 text-right font-semibold">Est. value</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p._id}
                className="border-b border-line/70 transition last:border-0 hover:bg-cream-50"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream-200 text-gold-400">
                      {p.images?.[0] || p.image ? (
                        <img
                          src={imageUrl(p.images?.[0] || p.image)}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Gem size={18} strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-muted">{p.itemType}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink/80">
                  {p.metalType} {p.purity}
                </td>
                <td className="px-5 py-3 text-ink/80">
                  {p.stoneType && p.stoneType !== "None" ? p.stoneType : "—"}
                </td>
                <td className="px-5 py-3 text-ink/80">{p.netWeight || 0} g</td>
                <td className="px-5 py-3 text-ink/80">
                  {p.collectionId?.name || "—"}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-gold-600">
                  {formatAED(p.estimatedValue)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(p)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-cream-100 hover:text-gold-600"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-cream-100 hover:text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
