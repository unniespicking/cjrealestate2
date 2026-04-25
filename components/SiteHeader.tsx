"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, Globe } from "lucide-react";
import clsx from "clsx";

const nav = [
  { label: "Buy", href: "/buy" },
  { label: "Sell", href: "/sell" },
  { label: "Lease", href: "/lease" },
  { label: "Manage", href: "/manage" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "中" | "한">("EN");
  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur border-b border-ink/10">
      <div className="container-site flex h-16 md:h-20 items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tightest">CJ</span>
          <span className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">Real Estate</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink hover:text-copper transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="hidden md:inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-ink-muted hover:text-ink transition"
            onClick={() =>
              setLang(lang === "EN" ? "中" : lang === "中" ? "한" : "EN")
            }
          >
            <Globe size={14} /> {lang}
          </button>
          <Link href="/contact" className="hidden md:inline-block text-sm font-medium">
            Contact
          </Link>
          <Link href="/portal/staff" className="hidden md:inline-block btn-primary !py-2 !px-4 text-xs">
            Staff
          </Link>
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div
        className={clsx(
          "md:hidden border-t border-ink/10 overflow-hidden transition-[max-height]",
          open ? "max-h-[80vh]" : "max-h-0"
        )}
      >
        <div className="container-site py-6 flex flex-col gap-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-display text-3xl"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)} className="font-display text-3xl">
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
}
