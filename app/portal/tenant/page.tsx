"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Wrench, FileText, Home, Download, Upload, Check } from "lucide-react";
import { pushSlackPost } from "@/lib/demo-events";

export default function TenantPortal() {
  const [maintOpen, setMaintOpen] = useState(false);
  const [maintForm, setMaintForm] = useState({ issue: "", description: "" });
  const [maintSent, setMaintSent] = useState(false);

  const submitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    pushSlackPost({
      channel: "#leads-rhodes",
      kind: "contact_form",
      title: `🔧 Maintenance request — Rhodes`,
      subtitle: "Apt 705 / 5 Gauthorpe St, Rhodes",
      fields: [
        { label: "Issue", value: maintForm.issue },
        { label: "Description", value: maintForm.description },
        { label: "Tenant", value: "J. Kim" },
        { label: "Property", value: "Apt 705 / 5 Gauthorpe St" },
      ],
      actions: [{ label: "Dispatch tradie", variant: "primary" }, { label: "Contact tenant" }],
    });
    setMaintSent(true);
  };

  return (
    <div className="container-site py-10 md:py-14">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="eyebrow">Tenant Portal</span>
          <h1 className="display-md mt-2">Welcome back, J. Kim.</h1>
          <p className="text-ink-muted mt-1">Apt 705 / 5 Gauthorpe Street, Rhodes</p>
        </div>
        <Link href="/" className="text-xs link-underline">← Back to site</Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <Tile icon={CreditCard} label="Rent paid-to" value="28 Apr 2026" tone="moss" />
        <Tile icon={Home} label="Lease ends" value="14 Dec 2026" tone="ink-muted" />
        <Tile icon={Wrench} label="Open requests" value="0" tone="ink-muted" />
        <Tile icon={FileText} label="Documents" value="12" tone="ink-muted" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10 flex items-center justify-between">
            <h2 className="font-display text-xl">Rent ledger</h2>
            <button className="text-xs link-underline flex items-center gap-1">
              <Download size={12} /> Download
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-paper-warm">
              <tr className="text-left">
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-ink-muted">Date</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-ink-muted">Amount</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-ink-muted">Period</th>
                <th className="p-3 font-medium text-xs uppercase tracking-wider text-ink-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { d: "21 Apr 2026", a: "$850", p: "22–28 Apr", s: "Paid" },
                { d: "14 Apr 2026", a: "$850", p: "15–21 Apr", s: "Paid" },
                { d: "7 Apr 2026", a: "$850", p: "8–14 Apr", s: "Paid" },
                { d: "31 Mar 2026", a: "$850", p: "1–7 Apr", s: "Paid" },
              ].map((r, i) => (
                <tr key={i} className="border-t border-ink/5">
                  <td className="p-3">{r.d}</td>
                  <td className="p-3 font-display">{r.a}</td>
                  <td className="p-3 text-ink-muted">{r.p}</td>
                  <td className="p-3"><span className="text-xs text-moss uppercase tracking-wider">{r.s}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-5 border-t border-ink/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-ink-muted">Next payment</div>
              <div className="font-display text-2xl">$850 · Wed 29 Apr</div>
            </div>
            <button className="btn-primary">Pay rent now</button>
          </div>
        </div>

        <div className="bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10 flex items-center justify-between">
            <h2 className="font-display text-xl">Maintenance</h2>
            <button onClick={() => setMaintOpen(!maintOpen)} className="text-xs link-underline">
              {maintOpen ? "Close" : "New request"}
            </button>
          </div>
          <div className="p-5">
            {!maintOpen && !maintSent && (
              <p className="text-sm text-ink-muted">No open requests. Need to log something? Add a request above.</p>
            )}
            {maintSent && (
              <div className="bg-moss/10 border border-moss/30 p-4 flex items-start gap-2">
                <Check size={16} className="text-moss mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Request submitted.</p>
                  <p className="text-ink-muted mt-1">Your property officer will be in touch within 4 hours.</p>
                </div>
              </div>
            )}
            {maintOpen && !maintSent && (
              <form onSubmit={submitMaintenance} className="space-y-3">
                <select value={maintForm.issue} onChange={(e) => setMaintForm({ ...maintForm, issue: e.target.value })} required className="w-full bg-paper-warm px-3 py-2.5 text-sm focus:outline-none">
                  <option value="">Select issue type…</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Appliance</option>
                  <option>Leak / water damage</option>
                  <option>Pest</option>
                  <option>Other</option>
                </select>
                <textarea required rows={3} placeholder="Describe the issue" value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })} className="w-full bg-paper-warm px-3 py-2.5 text-sm focus:outline-none resize-none" />
                <button type="button" className="w-full border border-dashed border-ink/30 py-3 text-xs text-ink-muted hover:border-ink flex items-center justify-center gap-2">
                  <Upload size={14} /> Add photos
                </button>
                <button type="submit" className="btn-primary w-full">Submit</button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <DocList title="Your documents" docs={[
          "Lease agreement.pdf",
          "Condition report — entry.pdf",
          "Bond receipt.pdf",
          "Strata by-laws.pdf",
        ]} />
        <DocList title="Recent notices" docs={[
          "Scheduled fire alarm test — 3 May",
          "Annual inspection reminder",
          "2026 rent review (60 days notice)",
        ]} />
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, tone }: any) {
  const toneMap: Record<string, string> = {
    moss: "text-moss",
    copper: "text-copper",
    "ink-muted": "text-ink",
  };
  return (
    <div className="bg-paper border border-ink/10 p-5">
      <Icon size={18} className={`${toneMap[tone]} mb-3`} />
      <div className="eyebrow">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}

function DocList({ title, docs }: { title: string; docs: string[] }) {
  return (
    <div className="bg-paper border border-ink/10">
      <div className="p-5 border-b border-ink/10">
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      <ul className="divide-y divide-ink/5">
        {docs.map((d, i) => (
          <li key={i} className="p-4 flex items-center justify-between hover:bg-paper-warm">
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-ink-muted" />
              <span className="text-sm">{d}</span>
            </div>
            <Download size={14} className="text-ink-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}
