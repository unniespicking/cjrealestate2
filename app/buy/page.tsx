"use client";

import { useState, useMemo, useEffect } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Property } from "@/lib/data/properties";
import { suburbs } from "@/lib/data/suburbs";
import { SlidersHorizontal, Loader2 } from "lucide-react";

export default function BuyPage() {
  const [all, setAll] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [suburb, setSuburb] = useState("");
  const [beds, setBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5_000_000);
  const [type, setType] = useState("");
  const [status, setStatus] = useState<"sale" | "sold">("sale");

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d) => setAll(Array.isArray(d?.properties) ? d.properties : []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return all.filter((p) => {
      if (p.action !== status) return false;
      if (suburb && p.suburb !== suburb) return false;
      if (beds && p.beds < beds) return false;
      if (p.priceNumeric > maxPrice) return false;
      if (type && p.propertyType !== type) return false;
      return true;
    });
  }, [all, suburb, beds, maxPrice, type, status]);

  return (
    <>
      <section className="container-site pt-12 md:pt-16 pb-6">
        <span className="eyebrow">Buy</span>
        <h1 className="display-lg mt-2">Properties for sale.</h1>
        <p className="text-ink-muted mt-4 max-w-xl">
          Live listings across all CJ service suburbs. Book inspections directly or have an agent
          reach out.
        </p>
      </section>

      <section className="container-site py-6 border-y border-ink/10 sticky top-16 md:top-20 bg-paper/95 backdrop-blur z-20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-ink-muted mr-2">
            <SlidersHorizontal size={14} />
            Filters
          </div>
          <div className="flex gap-1 bg-stone p-1">
            {(["sale", "sold"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${
                  status === s ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
                }`}
              >
                {s === "sale" ? "For Sale" : "Sold"}
              </button>
            ))}
          </div>
          <select value={suburb} onChange={(e) => setSuburb(e.target.value)} className="border border-ink/15 px-3 py-2 text-sm">
            <option value="">All suburbs</option>
            {suburbs.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
          </select>
          <select value={beds} onChange={(e) => setBeds(+e.target.value)} className="border border-ink/15 px-3 py-2 text-sm">
            <option value={0}>Any beds</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="border border-ink/15 px-3 py-2 text-sm">
            <option value="">Any type</option>
            <option value="Apartment">Apartment</option>
            <option value="Townhouse">Townhouse</option>
            <option value="House">House</option>
          </select>
          <select value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="border border-ink/15 px-3 py-2 text-sm">
            <option value={5_000_000}>Up to $5M</option>
            <option value={2_500_000}>Up to $2.5M</option>
            <option value={1_500_000}>Up to $1.5M</option>
            <option value={1_000_000}>Up to $1M</option>
            <option value={750_000}>Up to $750K</option>
          </select>
          <span className="ml-auto text-sm text-ink-muted">
            {loading ? <Loader2 size={14} className="animate-spin inline" /> : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </section>

      <section className="container-site py-12 md:py-16">
        {loading ? (
          <div className="text-center py-24 text-ink-muted">Loading listings…</div>
        ) : filtered.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filtered.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-ink-muted">
            No properties match those filters. Try widening your search.
          </div>
        )}
      </section>
    </>
  );
}
