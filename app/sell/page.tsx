import Link from "next/link";
import Image from "next/image";
import { Calculator, ClipboardCheck, TrendingUp, Users } from "lucide-react";
import { sold } from "@/lib/data/properties";
import { PropertyCard } from "@/components/PropertyCard";

export default function Sell() {
  return (
    <>
      <section className="relative h-[56vh] min-h-[420px] bg-ink text-paper overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2400&q=85"
          alt=""
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 to-ink/80" />
        <div className="relative container-site h-full flex flex-col justify-end pb-12 md:pb-20">
          <span className="eyebrow !text-paper/60">Sell with CJ</span>
          <h1 className="display-xl max-w-3xl">
            A precise brief.<br />A disciplined campaign.<br />A quietly excellent result.
          </h1>
        </div>
      </section>

      <section className="container-site py-16 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="display-md">Two ways to start.</h2>
          <p className="text-ink-muted mt-4 leading-relaxed">
            Whether you're 12 months away or 12 days away, the first step is a read on price.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Link href="/sell/instant-appraisal" className="group flex items-start gap-4 p-6 bg-ink text-paper hover:bg-copper transition">
            <Calculator className="mt-1 shrink-0" />
            <div>
              <div className="font-display text-2xl">Instant Appraisal</div>
              <p className="text-paper/75 text-sm mt-2">30-second address-level AVM. Best for early-stage research.</p>
            </div>
          </Link>
          <Link href="/sell/appraisal-request" className="group flex items-start gap-4 p-6 border border-ink/15 hover:border-ink transition">
            <ClipboardCheck className="mt-1 shrink-0" />
            <div>
              <div className="font-display text-2xl">Formal Appraisal</div>
              <p className="text-ink-muted text-sm mt-2">Agent inspection, comparable report, and a range you can act on.</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-paper-warm py-20">
        <div className="container-site">
          <span className="eyebrow">Our Approach</span>
          <h2 className="display-lg mt-2 max-w-2xl">A campaign calibrated to your building, not a template.</h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: TrendingUp, t: "Price with evidence", d: "Comparable sales are our starting point, never a guess. Every campaign comes with a written pricing rationale." },
              { icon: Users, t: "Multilingual reach", d: "English + 中文 + 한국어 campaigns across the channels your buyers actually read — not just REA and Domain." },
              { icon: ClipboardCheck, t: "Campaign discipline", d: "Weekly written vendor report. Predictable, not performative. No tactics hidden from you." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t}>
                <Icon className="text-copper mb-4" size={24} />
                <h3 className="font-display text-xl">{t}</h3>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="eyebrow">Recent Results</span>
            <h2 className="display-lg mt-2">Sold by CJ.</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {sold.slice(0, 3).map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>
    </>
  );
}
