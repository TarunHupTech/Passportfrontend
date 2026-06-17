import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Gem,
  Layers,
  FileBadge,
  Sparkles,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/jewellery", label: "My Jewellery", icon: Gem },
  { to: "/collections", label: "Collections", icon: Layers },
  { to: "/certificate", label: "Valuation Certificate", icon: FileBadge },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full w-72 flex-col bg-espresso-900 text-cream-100">
      {/* Brand */}
      <div className="px-7 pt-8 pb-7">
        <div className="font-display text-3xl font-semibold tracking-[0.18em] text-gold-300">
          LIALI
        </div>
        <div className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.34em] text-cream-100/45">
          Private Valuation Portal
        </div>
      </div>

      <div className="mx-7 h-px bg-cream-100/10" />

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-gold-500/95 to-gold-600/90 text-white shadow-[0_8px_20px_-8px_rgba(173,135,67,0.7)]"
                  : "text-cream-100/65 hover:bg-cream-100/[0.06] hover:text-cream-100",
              ].join(" ")
            }
          >
            <Icon size={19} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Live pricing teaser (from the prototype) */}
      <div className="m-4 rounded-2xl border border-gold-500/25 bg-gradient-to-br from-espresso-800 to-espresso-900 p-5">
        <div className="flex items-center gap-2 text-gold-300">
          <Sparkles size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Live Pricing
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-cream-100/55">
          Real-time gold &amp; silver rates in AED are coming soon to your
          portfolio.
        </p>
      </div>
    </aside>
  );
}
