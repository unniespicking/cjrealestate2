"use client";

import { useState } from "react";
import { suburbs } from "@/lib/data/suburbs";
import { pushSlackPost } from "@/lib/demo-events";
import { Check } from "lucide-react";

export default function FormalAppraisalRequest() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
    suburb: suburbs[0].name,
    timeline: "3-6 months",
    notes: "",
  });
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);

    fetch("/api/customer-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "formal_appraisal",
        title: `${form.suburb} · ${form.name}`,
        subtitle: `Submitted from /sell/appraisal-request`,
        fields: [
          { label: "Name", value: form.name },
          { label: "Contact", value: form.contact },
          { label: "Address", value: form.address },
          { label: "Suburb", value: form.suburb },
          { label: "Timeline", value: form.timeline },
          { label: "Notes", value: form.notes || "—" },
        ],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.slackPayload) return;
        pushSlackPost({
          channel: data.slackPayload.channel,
          kind: "formal_appraisal",
          title: `${data.slackPayload.emoji} ${data.slackPayload.title}`,
          subtitle: data.slackPayload.subtitle,
          fields: data.slackPayload.fields,
          actions: [
            { label: "Schedule visit", variant: "primary" },
            { label: "Mark reviewed" },
          ],
        });
      })
      .catch(() => {});
  };

  return (
    <div className="container-site py-12 md:py-20 max-w-3xl">
      <span className="eyebrow">Appraisal · Formal</span>
      <h1 className="display-lg mt-2">Request an in-person appraisal.</h1>
      <p className="text-ink-muted mt-4 max-w-xl">
        One of our suburb specialists will visit, inspect, and return a written range with
        comparable evidence. Typically within 48 hours.
      </p>

      {sent ? (
        <div className="mt-12 bg-moss/10 border border-moss/30 p-8 flex items-start gap-4">
          <Check className="text-moss mt-1" />
          <div>
            <h2 className="font-display text-2xl">We'll be in touch.</h2>
            <p className="text-ink-muted mt-2">Check the Slack Preview panel to see how your request was routed.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-12 grid md:grid-cols-2 gap-5">
          <Field label="Your name" v={form.name} on={(v) => setForm({ ...form, name: v })} />
          <Field label="Email or mobile" v={form.contact} on={(v) => setForm({ ...form, contact: v })} />
          <Field label="Property address" v={form.address} on={(v) => setForm({ ...form, address: v })} full />
          <div>
            <label className="eyebrow">Suburb</label>
            <select value={form.suburb} onChange={(e) => setForm({ ...form, suburb: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink">
              {suburbs.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="eyebrow">Timeline</label>
            <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink">
              <option>Researching</option>
              <option>3-6 months</option>
              <option>1-3 months</option>
              <option>Ready now</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="eyebrow">Anything we should know?</label>
            <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 focus:outline-none focus:border-ink resize-none" />
          </div>
          <button type="submit" className="btn-primary justify-self-start md:col-span-2">Submit request</button>
        </form>
      )}
    </div>
  );
}

function Field({ label, v, on, full }: { label: string; v: string; on: (v: string) => void; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="eyebrow">{label}</label>
      <input required value={v} onChange={(e) => on(e.target.value)} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
    </div>
  );
}
