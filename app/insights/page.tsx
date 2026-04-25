import Link from "next/link";
import Image from "next/image";
import { newsletters } from "@/lib/data/newsletters";

export default function Insights() {
  const [hero, ...rest] = newsletters;

  return (
    <div className="container-site py-12 md:py-20">
      <span className="eyebrow">Insights</span>
      <h1 className="display-lg mt-2 max-w-3xl">The CJ Real Estate Newsletter.</h1>
      <p className="text-ink-muted mt-4 max-w-2xl text-lg leading-relaxed">
        Monthly since 2017. We publish what our agents actually read — suburb trends, policy
        changes, campaign debriefs.
      </p>

      {/* Hero */}
      <Link href={`/insights/newsletter/${hero.slug}`} className="group grid md:grid-cols-12 gap-8 mt-14 mb-20">
        <div className="md:col-span-7 relative aspect-[16/10] bg-stone overflow-hidden">
          <Image src={hero.cover} alt={hero.title} fill className="object-cover group-hover:scale-[1.02] transition duration-700" sizes="50vw" />
        </div>
        <div className="md:col-span-5 md:pt-6">
          <span className="eyebrow">{hero.period}</span>
          <h2 className="display-md mt-2 leading-tight group-hover:text-copper transition">{hero.title}</h2>
          <p className="text-ink-muted mt-4 leading-relaxed">{hero.excerpt}</p>
          <div className="flex gap-2 mt-5">
            {hero.topics.map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
        </div>
      </Link>

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        {rest.map((n) => (
          <Link key={n.slug} href={`/insights/newsletter/${n.slug}`} className="group block">
            <div className="relative aspect-[4/3] bg-stone overflow-hidden">
              <Image src={n.cover} alt={n.title} fill className="object-cover group-hover:scale-[1.03] transition duration-500" sizes="(max-width:768px) 100vw, 33vw" />
            </div>
            <div className="pt-5">
              <div className="eyebrow">{n.period}</div>
              <h3 className="font-display text-xl md:text-2xl leading-tight mt-2 group-hover:text-copper transition">{n.title}</h3>
              <p className="text-sm text-ink-muted mt-2 leading-relaxed">{n.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
