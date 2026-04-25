"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { Property } from "@/lib/data/properties";
import { suburbs } from "@/lib/data/suburbs";
import { SlidersHorizontal, ArrowRight, Loader2 } from "lucide-react";

export default function Lease() {
  const [all, setAll] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [suburb, setSuburb] = useState("");
  const [beds, setBeds] = useState(0);
  const [maxRent, setMaxRent] = useState(1500);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d) => {
        const list: Property[] = Array.isArray(d?.properties) ? d.properties : [];
        setAll(list.filter((p) => p.action === "lease"));
      })
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      all.filter((p) => {
        if (suburb && p.suburb !== suburb) return false;
        if (beds && p.beds < beds) return false;
        if (p.priceNumeric > maxRent) return false;
        return true;
      }),
    [all, suburb, beds, maxRent]
  );

  return (
    <>
      <section className="container-site pt-12 md:pt-16 pb-6">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <span className="eyebrow">Lease</span>
            <h1 className="display-lg mt-2">Properties for lease.</h1>
          </div>
          <Link href="/lease/apply" className="btn-primary">
            Apply online <ArrowRight size={14} />
          </Link>
        </div>
        <p className="text-ink-muted mt-4 max-w-xl">
          Every listing is on CJ-managed buildings. Inspection slots are live, and your application
          reaches the area manager the moment you submit.
        </p>
      </section>

      <section className="container-site py-6 border-y border-ink/10 sticky top-16 md:top-20 bg-paper/95 backdrop-blur z-20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-ink-muted mr-2">
            <SlidersHorizontal size={14} /> Filters
          </div>
          <select value={suburb} onChange={(e) => setSuburb(e.target.value)} className="border border-ink/15 px-3 py-2 text-sm">
            <option value="">All suburbs</option>
            {suburbs.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
          </select>
          <select value={beds} onChange={(e) => setBeds(+e.target.value)} className="border border-ink/15 px-3 py-2 text-sm">
            <option value={0}>Any beds</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
          </select>
          <select value={maxRent} onChange={(e) => setMaxRent(+e.target.value)} className="border border-ink/15 px-3 py-2 text-sm">
            <option value={1500}>Up to $1500/w</option>
            <option value={900}>Up to $900/w</option>
            <option value={700}>Up to $700/w</option>
            <option value={550}>Up to $550/w</option>
          </select>
          <span className="ml-auto text-sm text-ink-muted">
            {loading ? <Loader2 size={14} className="animate-spin inline" /> : `${filtered.length} properties`}
          </span>
        </div>
      </section>

      <section className="container-site py-12 md:py-16">
        {loading ? (
          <div className="text-center py-24 text-ink-muted">Loading…</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filtered.map((p) => <PropertyCard key={p.id} p={p} hrefBase="/lease" />)}
          </div>
        )}
      </section>
    </>
  );
}
