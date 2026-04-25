import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { PropertyCard } from "@/components/PropertyCard";
import { AgentCard } from "@/components/AgentCard";
import { getProperties } from "@/lib/store";
import { suburbs } from "@/lib/data/suburbs";
import { agents } from "@/lib/data/agents";
import { newsletters } from "@/lib/data/newsletters";
import { ArrowUpRight, ArrowRight, Calculator, CalendarCheck, FileText } from "lucide-react";

export default async function Home() {
  const all = await getProperties();
  const forSale = all.filter((p) => p.action === "sale");
  const sold = all.filter((p) => p.action === "sold");
  return (
    <>
      {/* HERO */}
      <section className="relative h-[min(760px,90vh)] bg-ink text-paper overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2400&q=85"
          alt="Inner West waterfront residences at twilight"
          fill
          priority
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/20 to-ink/80" />
        <div className="relative container-site h-full flex flex-col justify-end pb-16 md:pb-24">
          <span className="eyebrow !text-paper/70 mb-6">Sydney Inner West · Since 2001</span>
          <h1 className="display-xl max-w-4xl">
            Where Sydney's Inner&nbsp;West&nbsp;lives.
          </h1>
          <p className="text-lg md:text-xl text-paper/80 max-w-xl mt-6 leading-relaxed">
            Local specialists across Rhodes, Newington and the river suburbs. Multilingual. Precise.
            Quietly confident.
          </p>
          <div className="max-w-2xl mt-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="container-site py-10 md:py-14 border-b border-ink/10">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Calculator, label: "Instant Appraisal", desc: "Address-level AVM in 30 seconds", href: "/sell/instant-appraisal" },
            { icon: CalendarCheck, label: "Book an Inspection", desc: "Self-serve viewing slots across our live listings", href: "/buy" },
            { icon: FileText, label: "Apply to Rent", desc: "Online tenancy application, routed to your area manager", href: "/lease/apply" },
          ].map(({ icon: Icon, label, desc, href }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-start gap-4 p-6 border border-ink/10 hover:border-ink hover:bg-ink hover:text-paper transition"
            >
              <Icon size={24} className="mt-1 shrink-0 text-copper group-hover:text-paper transition" />
              <div className="flex-1">
                <div className="font-display text-xl">{label}</div>
                <div className="text-xs text-ink-muted group-hover:text-paper/70 mt-1">{desc}</div>
              </div>
              <ArrowUpRight size={18} className="mt-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* FOR SALE */}
      <section className="container-site py-16 md:py-24">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <span className="eyebrow">For Sale</span>
            <h2 className="display-lg mt-2 max-w-xl">Currently on the market with CJ.</h2>
          </div>
          <Link href="/buy" className="hidden md:inline-flex link-underline text-sm">
            View all listings <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {forSale.slice(0, 6).map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* WHY CJ */}
      <section className="bg-ink text-paper py-20 md:py-28">
        <div className="container-site grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <span className="eyebrow !text-paper/60">Why CJ</span>
            <h2 className="display-lg mt-2 !text-paper">
              Not the biggest. <br />The one that knows your building.
            </h2>
          </div>
          <div className="md:col-span-7 grid sm:grid-cols-2 gap-10">
            <Pillar
              n="01"
              t="Local specialists"
              d="Two decades trading the Rhodes, Newington and river suburbs. Agent-level memory of every building and body corporate."
            />
            <Pillar
              n="02"
              t="Multilingual by default"
              d="English, 中文, 한국어 fluency across the team — with campaigns and documentation to match."
            />
            <Pillar
              n="03"
              t="Record results, quietly"
              d="Five record-per-m² sales in Rhodes buildings since 2023. We prefer the spreadsheet speak for us."
            />
            <Pillar
              n="04"
              t="Full service, one team"
              d="Sales and property management under one roof. Handover, renewals, and re-sales without re-introductions."
            />
          </div>
        </div>
      </section>

      {/* SUBURBS */}
      <section className="container-site py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="eyebrow">Our Patch</span>
            <h2 className="display-lg mt-2">Suburb guides.</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suburbs.slice(0, 8).map((s) => (
            <Link
              key={s.slug}
              href={`/buy/suburbs/${s.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-stone"
            >
              <Image
                src={s.image}
                alt={s.name}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                sizes="(max-width:768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-paper">
                <div className="text-[10px] uppercase tracking-[0.18em] text-paper/70">
                  {s.postcode}
                </div>
                <div className="font-display text-2xl mt-1">{s.name}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-paper/80">
                  <span>Median {s.median_unit >= 1_000_000 ? `$${(s.median_unit / 1_000_000).toFixed(2)}M` : `$${Math.round(s.median_unit / 1_000)}K`}</span>
                  <span>{s.rental_yield}% yield</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="container-site py-16 md:py-24 border-t border-ink/10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="eyebrow">The Team</span>
            <h2 className="display-lg mt-2 max-w-xl">Eight people. Three languages. Two offices.</h2>
          </div>
          <Link href="/about/team" className="hidden md:inline-flex link-underline text-sm">
            Meet everyone <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {agents.slice(0, 4).map((a) => (
            <AgentCard key={a.slug} agent={a} compact />
          ))}
        </div>
      </section>

      {/* RECENTLY SOLD */}
      <section className="bg-paper-warm py-16 md:py-24">
        <div className="container-site">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="eyebrow">Recently Sold</span>
              <h2 className="display-lg mt-2">Some recent results.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {sold.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section className="container-site py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="eyebrow">Insights</span>
            <h2 className="display-lg mt-2">The CJ Newsletter.</h2>
          </div>
          <Link href="/insights" className="hidden md:inline-flex link-underline text-sm">
            Archive <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {newsletters.slice(0, 3).map((n) => (
            <Link key={n.slug} href={`/insights/newsletter/${n.slug}`} className="group block">
              <div className="relative aspect-[4/3] bg-stone overflow-hidden">
                <Image src={n.cover} alt={n.title} fill className="object-cover group-hover:scale-[1.03] transition duration-500" sizes="(max-width:768px) 100vw, 33vw" />
              </div>
              <div className="pt-5">
                <div className="eyebrow">{n.period}</div>
                <h3 className="font-display text-2xl leading-tight mt-2 group-hover:text-copper transition">{n.title}</h3>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">{n.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-site pb-20 md:pb-28">
        <div className="bg-ink text-paper p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow !text-paper/60">Thinking of selling or leasing?</span>
            <h2 className="display-md mt-3 !text-paper">
              A 30-second appraisal.<br />A 30-year working relationship.
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/sell/instant-appraisal" className="btn-copper">
              Get an Instant Appraisal
            </Link>
            <Link href="/sell/appraisal-request" className="btn-ghost !border-paper/30 !text-paper hover:!bg-paper hover:!text-ink">
              Request a formal appraisal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Pillar({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <div>
      <div className="text-copper font-display text-sm tracking-wider">{n}</div>
      <div className="font-display text-xl mt-1 text-paper">{t}</div>
      <p className="text-sm text-paper/70 mt-2 leading-relaxed">{d}</p>
    </div>
  );
}
