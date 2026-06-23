import { Link, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useBuild } from "../context/BuildContext";

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const { lineItems } = useBuild();
  const count = lineItems.length;

  return (
    <header
      data-testid="site-header"
      className="w-full border-b hairline bg-[var(--color-background)]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
        <Link
          to="/"
          data-testid="brand-link"
          className="flex flex-col leading-none"
        >
          <span className="font-serif-display text-2xl text-[var(--color-pink)] tracking-tight">
            Hero Cycles
          </span>
          <span className="font-sans-body text-[var(--color-text-primary)] font-bold text-[10px] uppercase tracking-[0.3em] mt-1">
            Bespoke Workshop
          </span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link
            to="/"
            className={`font-sans-body uppercase text-xs tracking-widest hover:text-[var(--color-pink)] transition-colors ${
              pathname === "/" ? "text-[var(--color-pink)]" : "text-[var(--color-text-body)]"
            }`}
          >
            Workshop
          </Link>
          <Link
            to="/summary"
            className={`font-sans-body uppercase text-xs tracking-widest hover:text-[var(--color-pink)] transition-colors ${
              pathname.includes("summary") ? "text-[var(--color-pink)]" : "text-[var(--color-text-body)]"
            }`}
          >
            Configuration
          </Link>
          <Link
            to="/admin"
            className={`font-sans-body uppercase text-xs tracking-widest hover:text-[var(--color-pink)] transition-colors ${
              pathname.includes("admin") ? "text-[var(--color-pink)]" : "text-[var(--color-text-body)]"
            }`}
          >
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/summary"
            data-testid="header-summary-link"
            className="relative flex items-center justify-center text-[var(--color-text-body)] hover:text-[var(--color-pink)] transition-colors"
          >
            <ShoppingBag strokeWidth={1} size={24} />
            {count > 0 && (
              <span className="absolute -top-1 -right-2 bg-[var(--color-pink)] text-[var(--color-background)] text-[9px] font-sans-body rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
