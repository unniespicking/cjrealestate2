import { notFound } from "next/navigation";
import Image from "next/image";
import { getSuburb, suburbs } from "@/lib/data/suburbs";
import { getProperties } from "@/lib/store";
import { agentsForSuburb } from "@/lib/data/agents";
import { PropertyCard } from "@/components/PropertyCard";
import { AgentCard } from "@/components/AgentCard";
import { fmtCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SuburbGuide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSuburb(slug);
  if (!s) notFound();

  const all = await getProperties();
  const listings = all.filter((p) => p.suburb === s.name);
  const sales = listings.filter((l) => l.action === "sale");
  const leases = listings.filter((l) => l.action === "lease");
  const suburbAgents = agentsForSuburb(s.name);

  return (
    <>
      <section className="relative h-[60vh] min-h-[420px] bg-ink text-paper overflow-hidden">
        <Image src={s.image} alt={s.name} fill priority className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/10 to-ink/80" />
        <div className="relative container-site h-full flex flex-col justify-end pb-12 md:pb-20">
          <span className="eyebrow !text-paper/60">Suburb Guide · {s.postcode}</span>
          <h1 className="display-xl">{s.name}</h1>
        </div>
      </section>

      <section className="container-site py-16 md:py-20 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7">
          <p className="text-xl leading-relaxed">{s.blurb}</p>
          <div className="mt-8">
            <span className="eyebrow">Why buyers choose {s.name}</span>
            <ul className="mt-4 space-y-3">
              {s.highlights.map((h, i) => (
                <li key={i} className="pl-4 border-l border-copper">{h}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="md:col-span-5 grid grid-cols-2 gap-4 content-start">
          <Stat label="Median Unit" value={fmtCurrency(s.median_unit)} />
          {s.median_house && <Stat label="Median House" value={fmtCurrency(s.median_house)} />}
          <Stat label="Rental Yield" value={`${s.rental_yield}%`} />
          <Stat label="Office" value={s.office} />
        </div>
      </section>

      {sales.length > 0 && (
        <section className="container-site pb-16">
          <h2 className="display-md mb-8">For sale in {s.name}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sales.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {leases.length > 0 && (
        <section className="container-site pb-16">
          <h2 className="display-md mb-8">For lease in {s.name}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leases.map((p) => <PropertyCard key={p.id} p={p} hrefBase="/lease" />)}
          </div>
        </section>
      )}

      <section className="bg-paper-warm py-16 md:py-20">
        <div className="container-site">
          <h2 className="display-md mb-10">Your {s.name} specialists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {suburbAgents.slice(0, 4).map((a) => <AgentCard key={a.slug} agent={a} compact />)}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-warm p-5">
      <div className="eyebrow">{label}</div>
      <div className="font-display text-2xl mt-1.5">{value}</div>
    </div>
  );
}
