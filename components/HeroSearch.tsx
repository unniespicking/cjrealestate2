"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { suburbs } from "@/lib/data/suburbs";
import clsx from "clsx";

export function HeroSearch() {
  const [mode, setMode] = useState<"buy" | "lease" | "sold">("buy");
  const [suburb, setSuburb] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const path = mode === "sold" ? "/buy?status=sold" : mode === "lease" ? "/lease" : "/buy";
    const q = suburb ? `${path.includes("?") ? "&" : "?"}suburb=${encodeURIComponent(suburb)}` : "";
    router.push(path + q);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex gap-1 mb-2">
        {(["buy", "lease", "sold"] as const).map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => setMode(m)}
            className={clsx(
              "px-4 py-2 text-xs uppercase tracking-[0.18em] transition",
              mode === m ? "bg-ink text-paper" : "bg-paper/90 backdrop-blur text-ink hover:bg-paper"
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="flex bg-paper/95 backdrop-blur shadow-lg">
        <select
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          className="flex-1 bg-transparent px-5 py-5 text-sm border-0 focus:outline-none"
        >
          <option value="">All suburbs</option>
          {suburbs.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name}, {s.postcode}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-ink text-paper px-6 flex items-center gap-2">
          <Search size={16} />
          <span className="text-sm uppercase tracking-[0.18em]">Search</span>
        </button>
      </div>
    </form>
  );
}
