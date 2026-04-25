import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProperty } from "@/lib/store";
import { getAgent } from "@/lib/data/agents";
import { photoUrl } from "@/lib/photo";
import { BedDouble, Bath, Car, Square, MapPin, Phone, Mail } from "lucide-react";
import { InspectionBooking } from "@/components/InspectionBooking";
import { PropertyEnquireCTA } from "@/components/PropertyEnquireCTA";

export const dynamic = "force-dynamic";

export default async function LeaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProperty(id);
  if (!p) notFound();
  const agent = getAgent(p.agent);

  return (
    <>
      <section className="grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] px-2 pt-2">
        <div className="col-span-4 md:col-span-2 row-span-2 relative bg-stone">
          {p.photos[0] && <Image src={photoUrl(p.photos[0])} alt={p.heading} fill className="object-cover" sizes="50vw" priority />}
        </div>
        {p.photos.slice(1, 5).map((ph, i) => (
          <div key={i} className="relative bg-stone hidden md:block">
            <Image src={photoUrl(ph)} alt="" fill className="object-cover" sizes="25vw" />
          </div>
        ))}
      </section>

      <div className="container-site pt-10 md:pt-14 grid lg:grid-cols-12 gap-10 md:gap-16">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-ink-muted">
            <MapPin size={14} /> {p.suburb} · {p.postcode}
            <span className="chip">{p.propertyType}</span>
            <span className="chip !border-moss !text-moss">For Lease</span>
          </div>
          <h1 className="display-lg mt-4 max-w-3xl leading-[1.05]">{p.heading}</h1>
          <p className="text-lg text-ink-muted mt-3">{p.address}</p>

          <div className="flex items-center gap-6 mt-8 pb-8 border-b border-ink/10">
            <div className="flex items-center gap-2"><BedDouble size={18} className="text-ink-muted" /><span className="font-display text-xl">{p.beds}</span></div>
            <div className="flex items-center gap-2"><Bath size={18} className="text-ink-muted" /><span className="font-display text-xl">{p.baths}</span></div>
            <div className="flex items-center gap-2"><Car size={18} className="text-ink-muted" /><span className="font-display text-xl">{p.cars}</span></div>
            <div className="flex items-center gap-2"><Square size={18} className="text-ink-muted" /><span className="font-display text-xl">{p.area}m²</span></div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between mt-8 gap-3">
            <div>
              <span className="eyebrow">Rent</span>
              <div className="font-display text-3xl mt-1">{p.price}</div>
            </div>
            {p.availableFrom && (
              <div className="text-right">
                <span className="eyebrow">Available</span>
                <div className="font-display text-2xl">{p.availableFrom}</div>
              </div>
            )}
          </div>

          <p className="text-lg leading-relaxed mt-8">{p.description}</p>

          <div className="mt-10">
            <span className="eyebrow">Features</span>
            <ul className="mt-4 grid sm:grid-cols-2 gap-y-2 gap-x-6">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-1 h-1 bg-copper mt-2 rounded-full shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>

          {p.inspectionSlots && p.inspectionSlots.length > 0 && (
            <div className="mt-14">
              <span className="eyebrow">Inspection slots</span>
              <InspectionBooking property={p} />
            </div>
          )}

          <div className="mt-14 p-6 bg-paper-warm border border-ink/10">
            <h3 className="font-display text-2xl">Ready to apply?</h3>
            <p className="text-ink-muted mt-2">Complete your application online. It reaches the area manager instantly.</p>
            <Link href="/lease/apply" className="btn-primary mt-5 inline-flex">
              Start application
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start">
          {agent && (
            <div className="border border-ink/10 p-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-stone overflow-hidden shrink-0">
                  <Image src={photoUrl(agent.photo)} alt={agent.name} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <p className="font-display text-lg leading-tight">{agent.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">{agent.role}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-5 text-sm">
                <a href={`tel:${agent.mobile.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-copper">
                  <Phone size={13} /> {agent.mobile}
                </a>
                <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-copper">
                  <Mail size={13} /> {agent.email}
                </a>
              </div>
              <PropertyEnquireCTA property={p} agentName={agent.name} />
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
