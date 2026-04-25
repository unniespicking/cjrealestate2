import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <>
      <section className="container-site pt-16 md:pt-24 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <span className="eyebrow">About CJ</span>
          <h1 className="display-lg mt-2">Two offices. One very specific promise.</h1>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="text-lg leading-relaxed text-ink-muted">
            CJ Real Estate has been trading the Rhodes, Newington and river suburbs of Sydney's Inner West
            since 2001. Eight people, two offices, one network of buyers, tenants and vendors built over two decades.
          </p>
          <p className="text-lg leading-relaxed text-ink-muted mt-5">
            We'd rather be the agency that knows your building than the one that hangs the most signs.
            We publish a market newsletter every month — 89 issues and counting — because we think
            clients should read the same data we do.
          </p>
        </div>
      </section>

      <section className="relative h-[70vh] my-16 md:my-24">
        <Image src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=2400&q=85" alt="" fill className="object-cover" />
      </section>

      <section className="container-site grid md:grid-cols-2 gap-16 pb-20">
        <div>
          <h2 className="display-md">What we believe</h2>
          <ul className="mt-8 space-y-4 text-lg leading-relaxed">
            <li className="pl-4 border-l border-copper">Price is the conversation. Everything else is marketing.</li>
            <li className="pl-4 border-l border-copper">A building-level specialist beats a district generalist.</li>
            <li className="pl-4 border-l border-copper">Language is access — all three of ours open doors.</li>
            <li className="pl-4 border-l border-copper">Discretion is a service. Off-market campaigns are a tool, not a trick.</li>
          </ul>
        </div>
        <div>
          <h2 className="display-md">What we don't</h2>
          <ul className="mt-8 space-y-4 text-lg leading-relaxed text-ink-muted">
            <li className="pl-4 border-l border-stone">Don't call every campaign "premium."</li>
            <li className="pl-4 border-l border-stone">Don't franchise names we didn't earn.</li>
            <li className="pl-4 border-l border-stone">Don't chase listings outside our patch just for volume.</li>
            <li className="pl-4 border-l border-stone">Don't hide fees in marketing dollars.</li>
          </ul>
        </div>
      </section>

      <section className="bg-ink text-paper py-20 md:py-28">
        <div className="container-site grid md:grid-cols-3 gap-6">
          <Link href="/about/team" className="group block p-8 border border-paper/15 hover:bg-paper hover:text-ink transition">
            <div className="eyebrow !text-copper">01</div>
            <h3 className="font-display text-2xl mt-3">Meet the team</h3>
            <p className="text-paper/70 group-hover:text-ink-muted mt-2 text-sm">Eight specialists across two offices.</p>
            <ArrowRight size={16} className="mt-6" />
          </Link>
          <Link href="/about/offices" className="group block p-8 border border-paper/15 hover:bg-paper hover:text-ink transition">
            <div className="eyebrow !text-copper">02</div>
            <h3 className="font-display text-2xl mt-3">Our offices</h3>
            <p className="text-paper/70 group-hover:text-ink-muted mt-2 text-sm">Rhodes + Newington.</p>
            <ArrowRight size={16} className="mt-6" />
          </Link>
          <Link href="/about/careers" className="group block p-8 border border-paper/15 hover:bg-paper hover:text-ink transition">
            <div className="eyebrow !text-copper">03</div>
            <h3 className="font-display text-2xl mt-3">Join us</h3>
            <p className="text-paper/70 group-hover:text-ink-muted mt-2 text-sm">Current openings and what we look for.</p>
            <ArrowRight size={16} className="mt-6" />
          </Link>
        </div>
      </section>
    </>
  );
}
