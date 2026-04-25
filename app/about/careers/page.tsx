"use client";

import { useState } from "react";
import { pushSlackPost } from "@/lib/demo-events";
import { Check } from "lucide-react";

const openings = [
  { role: "Sales Consultant — Rhodes", type: "Full-time", languages: "EN + 中文 or 한국어" },
  { role: "Property Officer — Newington", type: "Full-time", languages: "EN + 中文" },
  { role: "Marketing & Content Associate", type: "Part-time", languages: "EN" },
];

export default function Careers() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    pushSlackPost({
      channel: "#general",
      kind: "contact_form",
      title: `Careers enquiry — ${role || "general"}`,
      fields: [
        { label: "Name", value: name },
        { label: "Contact", value: contact },
        { label: "Role", value: role || "General" },
      ],
      actions: [{ label: "Forward to Alex", variant: "primary" }],
    });
    setSent(true);
  };

  return (
    <div className="container-site py-12 md:py-20 max-w-4xl">
      <span className="eyebrow">Careers</span>
      <h1 className="display-lg mt-2">Join the team.</h1>
      <p className="text-ink-muted mt-4 max-w-2xl leading-relaxed text-lg">
        We hire in small numbers, carefully. Our team has the lowest turnover in the Inner West for
        a reason.
      </p>

      <div className="mt-14">
        <h2 className="display-md">Open roles</h2>
        <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {openings.map((o) => (
            <button key={o.role} onClick={() => setRole(o.role)} className={`w-full py-5 flex items-center justify-between text-left hover:bg-paper-warm px-3 -mx-3 transition ${role === o.role ? "bg-paper-warm" : ""}`}>
              <div>
                <div className="font-display text-xl">{o.role}</div>
                <div className="text-xs text-ink-muted mt-1">{o.type} · {o.languages}</div>
              </div>
              <span className="text-sm link-underline">Apply</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="display-md">Apply</h2>
        {sent ? (
          <div className="mt-6 bg-moss/10 border border-moss/30 p-6 flex items-start gap-3">
            <Check className="text-moss mt-1" />
            <p>Thanks — we'll be in touch within the week.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid md:grid-cols-2 gap-4 max-w-2xl">
            <div className="md:col-span-2">
              <label className="eyebrow">Role</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Select above or type" className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
            </div>
            <div>
              <label className="eyebrow">Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
            </div>
            <div>
              <label className="eyebrow">Email or mobile</label>
              <input required value={contact} onChange={(e) => setContact(e.target.value)} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
            </div>
            <button type="submit" className="btn-primary md:col-span-2 justify-self-start">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}
