import Link from "next/link";
import Image from "next/image";
import { getProperties } from "@/lib/store";
import { getCurrentStaff } from "@/lib/auth";
import { photoUrl } from "@/lib/photo";
import { ListingActions } from "./ListingActions";
import { Plus } from "lucide-react";

export default async function StaffListings() {
  const all = await getProperties();
  const staff = await getCurrentStaff();
  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-ink-muted">Signed in as {staff?.name}</p>
          <h1 className="display-md mt-1">Listings · {all.length}</h1>
          <p className="text-sm text-ink-muted mt-1">CSV-backed. Each save broadcasts to Slack.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/portal/staff" className="btn-ghost text-sm">← Dashboard</Link>
          <Link href="/portal/staff/listings/new" className="btn-primary text-sm">
            <Plus size={14} /> New listing
          </Link>
        </div>
      </div>

      <div className="bg-paper border border-ink/10 divide-y divide-ink/5">
        {all.length === 0 && (
          <div className="p-12 text-center text-ink-muted">
            No listings yet. <Link href="/portal/staff/listings/new" className="link-underline">Add the first one →</Link>
          </div>
        )}
        {all.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            <div className="relative w-24 h-16 bg-stone shrink-0">
              {p.photos[0] && (
                <Image src={photoUrl(p.photos[0])} alt="" fill className="object-cover" sizes="96px" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-ink-subtle">{p.id}</span>
                <span className={`text-[10px] uppercase tracking-wider ${
                  p.action === "sale" ? "text-ink" :
                  p.action === "lease" ? "text-moss" :
                  "text-copper"
                }`}>{p.action}</span>
              </div>
              <p className="text-sm font-medium truncate">{p.address}</p>
              <p className="text-xs text-ink-muted">{p.suburb} · {p.beds}bd · {p.baths}ba · {p.cars}car · {p.price}</p>
            </div>
            <ListingActions id={p.id} address={p.address} suburb={p.suburb} />
          </div>
        ))}
      </div>
    </div>
  );
}
