import { useState } from "react";
import { Gem, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { imageUrl } from "../../lib/api";
import { formatAED } from "../../lib/format";

export default function ProductCard({ product, onEdit, onDelete }) {
  const images = product.images?.length
    ? product.images
    : product.image
    ? [product.image]
    : [];
  const count = images.length;
  const [idx, setIdx] = useState(0);
  const current = images[Math.min(idx, count - 1)];

  const go = (e, dir) => {
    e.stopPropagation();
    setIdx((i) => (i + dir + count) % count);
  };

  return (
    <div className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-luxe-lg">
      {/* Image / slider — image fills the card width at its natural ratio (no crop) */}
      <div className="relative  aspect-[4/3] overflow-hidden bg-cream-200">
        {current ? (
          <img
            key={current}
            src={imageUrl(current)}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid aspect-[4/5] w-full place-items-center text-gold-400">
            <Gem size={40} strokeWidth={1.4} />
          </div>
        )}

        <span className="chip absolute left-3 top-3 bg-espresso-900 text-white/90 backdrop-blur">
          {product.itemType}
        </span>

        {/* Slider controls (only with multiple photos) */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => go(e, -1)}
              className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-espresso-800 shadow transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => go(e, 1)}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-espresso-800 shadow transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdx(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === Math.min(idx, count - 1) ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hover actions */}
        <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onEdit(product)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-espresso-800 shadow transition hover:text-gold-600"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-espresso-800 shadow transition hover:text-red-500"
            aria-label="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="truncate font-display text-lg font-semibold text-ink">
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          {product.metalType} {product.purity}
          {product.stoneType && product.stoneType !== "None"
            ? ` · ${product.stoneType} ${product.stoneWeight || 0}ct`
            : ""}
        </p>

        <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">
              Estimated value
            </p>
            <p className="font-display text-lg font-semibold text-gold-600">
              {formatAED(product.estimatedValue)}
            </p>
          </div>
          {product.collectionId?.name && (
            <span className="chip bg-cream-100 text-espresso-700">
              {product.collectionId.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
