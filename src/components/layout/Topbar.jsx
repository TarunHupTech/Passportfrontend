import { useState, useRef, useEffect } from "react";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { greeting } from "../../lib/format";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-cream-50/80 px-5 py-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-ink transition hover:bg-cream-200 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted">
            {greeting()}
          </p>
          <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            Welcome back, {firstName}
          </h1>
        </div>
      </div>

      {/* User menu */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-gold-300"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-semibold text-white">
            {user?.initials || "?"}
          </span>
          <span className="hidden text-sm font-semibold text-ink sm:block">
            {user?.name}
          </span>
          <ChevronDown size={16} className="text-muted" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white shadow-luxe-lg">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-ink transition hover:bg-cream-100"
            >
              <a href="https://tarun-yzuldbwu.myshopify.com/account/logout" className="flex items-center gap-2">
                <LogOut size={16} /> Sign out
              </a>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
