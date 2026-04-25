import Link from "next/link";

const features = [
  { t: "Area-manager model", d: "One accountable agent for your portfolio — not a rotating queue." },
  { t: "Proactive tenant sourcing", d: "Pre-list tenant matching via our existing applicant pool before we advertise." },
  { t: "Tri-lingual reach", d: "Advertising and tenant communication in English, 中文 and 한국어." },
  { t: "Real-time portal", d: "Payments, statements, inspection reports and tax docs, always live." },
  { t: "Transparent fees", d: "One published schedule, no marketing mark-ups, no renewal fees." },
  { t: "Maintenance workflow", d: "Tenants log requests with photos → we triage → you approve in the portal." },
];

export default function Landlords() {
  return (
    <div className="container-site py-12 md:py-20 max-w-5xl">
      <span className="eyebrow">Landlords</span>
      <h1 className="display-lg mt-2 max-w-2xl">Management that earns its keep.</h1>
      <p className="text-ink-muted mt-4 max-w-2xl leading-relaxed text-lg">
        CJ manages 400+ properties across Rhodes, Newington and the river suburbs. Here's how we
        run your asset.
      </p>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 mt-14">
        {features.map((f, i) => (
          <div key={i}>
            <div className="text-copper font-display text-sm tracking-widest">0{i + 1}</div>
            <h3 className="font-display text-2xl mt-1">{f.t}</h3>
            <p className="text-ink-muted mt-2 leading-relaxed">{f.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 p-10 bg-paper-warm border border-ink/10 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-1">
          <h3 className="font-display text-2xl">Ready to see your portfolio's yield potential?</h3>
          <p className="text-ink-muted mt-2">Request a rental appraisal — your area manager will walk through projections and pricing.</p>
        </div>
        <Link href="/sell/appraisal-request" className="btn-primary shrink-0">
          Request appraisal
        </Link>
      </div>

      <div className="mt-10">
        <Link href="/portal/landlord" className="link-underline text-sm">
          Explore the Landlord Portal demo →
        </Link>
      </div>
    </div>
  );
}
