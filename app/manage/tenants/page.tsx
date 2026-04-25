import Link from "next/link";

export default function Tenants() {
  return (
    <div className="container-site py-12 md:py-20 max-w-4xl">
      <span className="eyebrow">Tenants</span>
      <h1 className="display-lg mt-2 max-w-2xl">How renting with CJ works.</h1>

      <ol className="mt-12 space-y-8">
        {[
          { t: "Find & book", d: "Browse live listings, book inspections directly online." },
          { t: "Apply", d: "Online application with document upload. Reaches the area manager instantly." },
          { t: "Move in", d: "Digital lease, condition report, keys. All in the tenant portal." },
          { t: "Live in the portal", d: "Pay rent, log maintenance with photos, download your ledger on demand." },
          { t: "Renew or move on", d: "Renewal offers arrive 60 days out — decide in a click." },
        ].map((s, i) => (
          <li key={i} className="flex gap-6">
            <div className="font-display text-4xl text-copper w-12 shrink-0">{i + 1}</div>
            <div>
              <h3 className="font-display text-2xl">{s.t}</h3>
              <p className="text-ink-muted mt-2 leading-relaxed">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 p-10 bg-paper-warm border border-ink/10 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex-1">
          <h3 className="font-display text-2xl">Ready to apply?</h3>
          <p className="text-ink-muted mt-2">Three short steps, document upload, instant routing.</p>
        </div>
        <Link href="/lease/apply" className="btn-primary shrink-0">Start application</Link>
      </div>

      <div className="mt-10">
        <Link href="/portal/tenant" className="link-underline text-sm">
          Explore the Tenant Portal demo →
        </Link>
      </div>
    </div>
  );
}
