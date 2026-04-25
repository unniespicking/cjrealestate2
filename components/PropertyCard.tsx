import Link from "next/link";
import Image from "next/image";
import { Property } from "@/lib/data/properties";
import { photoUrl } from "@/lib/photo";
import { BedDouble, Bath, Car, Square } from "lucide-react";

export function PropertyCard({ p, hrefBase = "/buy" }: { p: Property; hrefBase?: string }) {
  return (
    <Link href={`${hrefBase}/${p.id}`} className="group block">
      <div className="relative aspect-[4/3] bg-stone overflow-hidden">
        {p.photos[0] && (
          <Image
            src={photoUrl(p.photos[0])}
            alt={p.heading}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        )}
        {p.action === "sold" && (
          <span className="absolute top-3 left-3 bg-ink text-paper text-[10px] uppercase tracking-[0.18em] px-2.5 py-1">
            Sold
          </span>
        )}
        {p.action === "leased" && (
          <span className="absolute top-3 left-3 bg-moss text-paper text-[10px] uppercase tracking-[0.18em] px-2.5 py-1">
            Leased
          </span>
        )}
      </div>
      <div className="pt-5">
        <div className="flex items-center justify-between text-xs text-ink-muted uppercase tracking-[0.14em]">
          <span>{p.suburb} · {p.postcode}</span>
          <span>{p.propertyType}</span>
        </div>
        <h3 className="font-display text-xl md:text-2xl leading-[1.15] mt-2 group-hover:text-copper transition">
          {p.heading}
        </h3>
        <p className="text-sm text-ink-muted mt-1">{p.address}</p>
        <p className="text-sm font-medium mt-3">{p.price}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><BedDouble size={14} /> {p.beds}</span>
          <span className="flex items-center gap-1.5"><Bath size={14} /> {p.baths}</span>
          <span className="flex items-center gap-1.5"><Car size={14} /> {p.cars}</span>
          <span className="flex items-center gap-1.5"><Square size={14} /> {p.area}m²</span>
        </div>
      </div>
    </Link>
  );
}
