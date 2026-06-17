import { Gem } from "lucide-react";

// Two-column auth layout: luxury brand panel + form.
export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-espresso-900 lg:block">
        {/* Gold radial glows */}
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-gold-600/15 blur-3xl" />
        {/* Fine grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div>
            <div className="font-display text-4xl font-semibold tracking-[0.18em] text-gold-300">
              LIALI
            </div>
            <div className="mt-1.5 text-xs font-medium uppercase tracking-[0.34em] text-cream-100/45">
              Private Valuation Portal
            </div>
          </div>

          <div className="max-w-md">
            <div className="mb-6 inline-grid h-14 w-14 place-items-center rounded-2xl border border-gold-500/30 bg-gold-500/10 text-gold-300">
              <Gem size={26} strokeWidth={1.6} />
            </div>
            <h2 className="font-display text-3xl font-medium leading-snug text-cream-50">
              Your fine jewellery, valued and curated in one private place.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream-100/55">
              Track every piece, see a live estimated value in AED, organise your
              collections and generate branded valuation certificates.
            </p>
          </div>

          <p className="text-xs text-cream-100/40">
            © {new Date().getFullYear()} LIALI Jewellery · Market estimates, not
            certified appraisals.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 text-center lg:hidden">
            <div className="font-display text-3xl font-semibold tracking-[0.18em] text-gold-600">
              LIALI
            </div>
            <div className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-muted">
              Private Valuation Portal
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
