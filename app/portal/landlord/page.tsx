"use client";

import Link from "next/link";
import Image from "next/image";
import { TrendingUp, DollarSign, Home, Calendar, FileText, Download, ArrowUpRight } from "lucide-react";

const portfolio = [
  { address: "Apt 705 / 5 Gauthorpe St, Rhodes", rent: 850, yield: 4.2, tenant: "J. Kim", status: "Tenanted", occ: "98%", photo: "https://images.unsplash.com/photo-1522156373667-4c7234bbd804?w=400&q=80" },
  { address: "Apt 1204 / 46 Walker St, Rhodes", rent: 920, yield: 4.0, tenant: "—", status: "Between tenancies", occ: "94%", photo: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80" },
  { address: "14 Bayview Grove, Newington", rent: 1450, yield: 3.8, tenant: "Wong Family", status: "Tenanted", occ: "100%", photo: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80" },
];

const statements = [
  { m: "April 2026", income: 12880, expenses: 2140, net: 10740 },
  { m: "March 2026", income: 13180, expenses: 1820, net: 11360 },
  { m: "February 2026", income: 13180, expenses: 1560, net: 11620 },
];

export default function LandlordPortal() {
  return (
    <div className="container-site py-10 md:py-14">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="eyebrow">Landlord Portal</span>
          <h1 className="display-md mt-2">Welcome back, Mr Park.</h1>
          <p className="text-ink-muted mt-1">3 properties under CJ management</p>
        </div>
        <Link href="/" className="text-xs link-underline">← Back to site</Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <Metric icon={DollarSign} label="This month (net)" value="$10,740" delta="+3.2% vs last" tone="moss" />
        <Metric icon={TrendingUp} label="Portfolio yield" value="4.0%" delta="+0.1pp YoY" tone="moss" />
        <Metric icon={Home} label="Occupancy" value="97%" delta="avg 30 days" tone="ink-muted" />
        <Metric icon={Calendar} label="Next inspection" value="14 May" delta="Apt 1204 Walker" tone="copper" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10 flex items-center justify-between">
            <h2 className="font-display text-xl">Portfolio</h2>
            <button className="text-xs link-underline">Export CSV</button>
          </div>
          <div className="divide-y divide-ink/5">
            {portfolio.map((p, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="relative w-20 h-14 bg-stone shrink-0">
                  <Image src={p.photo} alt="" fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.address}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                    <span>${p.rent}/w</span>
                    <span>{p.yield}% yield</span>
                    <span>· {p.tenant}</span>
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wider ${p.status === "Tenanted" ? "text-moss" : "text-copper"}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10">
            <h2 className="font-display text-xl">Latest activity</h2>
          </div>
          <ul className="divide-y divide-ink/5 text-sm">
            <li className="p-4">
              <p className="font-medium">Rent received</p>
              <p className="text-xs text-ink-muted mt-0.5">Apt 705 · $850 · 21 Apr</p>
            </li>
            <li className="p-4">
              <p className="font-medium">Inspection report filed</p>
              <p className="text-xs text-ink-muted mt-0.5">Apt 1204 · 18 Apr</p>
            </li>
            <li className="p-4">
              <p className="font-medium">Maintenance approved</p>
              <p className="text-xs text-ink-muted mt-0.5">Bayview Grove · dishwasher · $220</p>
            </li>
            <li className="p-4">
              <p className="font-medium">Lease renewal sent</p>
              <p className="text-xs text-ink-muted mt-0.5">Apt 705 · expires Dec 2026</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10 flex items-center justify-between">
            <h2 className="font-display text-xl">Monthly statements</h2>
            <button className="text-xs link-underline">All statements</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-paper-warm">
              <tr className="text-left">
                <th className="p-3 text-xs uppercase tracking-wider text-ink-muted font-medium">Month</th>
                <th className="p-3 text-xs uppercase tracking-wider text-ink-muted font-medium">Income</th>
                <th className="p-3 text-xs uppercase tracking-wider text-ink-muted font-medium">Expenses</th>
                <th className="p-3 text-xs uppercase tracking-wider text-ink-muted font-medium">Net</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {statements.map((s, i) => (
                <tr key={i} className="border-t border-ink/5">
                  <td className="p-3">{s.m}</td>
                  <td className="p-3">${s.income.toLocaleString()}</td>
                  <td className="p-3 text-ink-muted">${s.expenses.toLocaleString()}</td>
                  <td className="p-3 font-display">${s.net.toLocaleString()}</td>
                  <td className="p-3"><Download size={14} className="text-ink-muted" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-paper border border-ink/10 p-6">
          <h2 className="font-display text-xl">Tax-time ready</h2>
          <p className="text-sm text-ink-muted mt-2 leading-relaxed">
            Your 2025-26 summary will be auto-generated on 1 July and sent to your accountant on file.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm">
            <button className="flex items-center justify-between p-3 bg-paper-warm hover:bg-stone transition">
              <span className="flex items-center gap-2"><FileText size={14} /> 2024-25 summary</span>
              <Download size={14} />
            </button>
            <button className="flex items-center justify-between p-3 bg-paper-warm hover:bg-stone transition">
              <span className="flex items-center gap-2"><FileText size={14} /> 2023-24 summary</span>
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, delta, tone }: any) {
  const map: Record<string, string> = { moss: "text-moss", copper: "text-copper", "ink-muted": "text-ink" };
  return (
    <div className="bg-paper border border-ink/10 p-5">
      <Icon size={18} className={`${map[tone]} mb-3`} />
      <div className="eyebrow">{label}</div>
      <div className="font-display text-3xl mt-1">{value}</div>
      <div className="text-xs text-ink-muted mt-1">{delta}</div>
    </div>
  );
}
