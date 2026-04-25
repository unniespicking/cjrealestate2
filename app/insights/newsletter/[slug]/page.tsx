import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getNewsletter, newsletters } from "@/lib/data/newsletters";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return newsletters.map((n) => ({ slug: n.slug }));
}

export default async function NewsletterDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = getNewsletter(slug);
  if (!n) notFound();

  return (
    <article className="container-site py-12 md:py-20 max-w-3xl">
      <Link href="/insights" className="text-sm text-ink-muted hover:text-ink inline-flex items-center gap-1">
        <ArrowLeft size={14} /> Back to Insights
      </Link>

      <div className="mt-8">
        <span className="eyebrow">{n.period}</span>
        <h1 className="display-lg mt-3 leading-[1.05]">{n.title}</h1>
        <div className="flex items-center gap-3 mt-6">
          {n.topics.map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
      </div>

      <div className="relative aspect-[16/10] bg-stone my-10 md:my-14">
        <Image src={n.cover} alt={n.title} fill className="object-cover" sizes="100vw" priority />
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="text-lg leading-relaxed">{n.excerpt}</p>

        <h2 className="display-md mt-12 mb-6">The Numbers</h2>
        <p className="text-ink-muted leading-relaxed">
          Our suburb data desk tracks every settled sale and rental transaction across our eight
          service postcodes. Here's what moved last month.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 my-8 not-prose">
          <div className="bg-paper-warm p-6">
            <div className="eyebrow">Median Unit</div>
            <div className="font-display text-3xl mt-2">$1.12M</div>
            <div className="text-xs text-moss mt-1">+2.1% MoM</div>
          </div>
          <div className="bg-paper-warm p-6">
            <div className="eyebrow">Clearance</div>
            <div className="font-display text-3xl mt-2">72.4%</div>
            <div className="text-xs text-moss mt-1">+4.2pp</div>
          </div>
          <div className="bg-paper-warm p-6">
            <div className="eyebrow">Days on Market</div>
            <div className="font-display text-3xl mt-2">24</div>
            <div className="text-xs text-copper mt-1">−3 days</div>
          </div>
        </div>

        <h2 className="display-md mt-12 mb-6">Our Read</h2>
        <p className="leading-relaxed">
          The Inner West continues to outperform the Sydney aggregate, a gap that's persisted now for
          seven consecutive months. A few things we're watching into the next cycle:
        </p>
        <ul className="leading-relaxed">
          <li>Off-market transaction share is at its highest in 18 months — a signal of mismatched seller/buyer patience.</li>
          <li>Korean and Chinese buyer activity up meaningfully on prior year — our multilingual listing reach is a direct beneficiary.</li>
          <li>Sub-$1M unit market is the tightest we've seen it since 2019. Expect competition.</li>
        </ul>

        <p className="leading-relaxed">
          As always — if you'd like our suburb-level read, reply to this newsletter and Alex or
          Canti will follow up within the day.
        </p>

        <p className="text-sm text-ink-muted mt-12 pt-8 border-t border-ink/10">
          Published {n.period} by CJ Real Estate · Subscribe to get the next issue in your inbox.
        </p>
      </div>
    </article>
  );
}
