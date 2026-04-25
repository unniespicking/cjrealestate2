"use client";

import { useState } from "react";
import { suburbs } from "@/lib/data/suburbs";
import { pushSlackPost } from "@/lib/demo-events";
import { Check, Upload } from "lucide-react";

export default function ApplyToRent() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    suburb: suburbs[0].name,
    moveIn: "",
    budget: "",
    employment: "",
    income: "",
    references: "",
    pets: "No",
  });
  const [done, setDone] = useState(false);

  const submit = async () => {
    setDone(true);

    fetch("/api/customer-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "rental_application",
        title: `${form.suburb} · ${form.firstName} ${form.lastName}`,
        subtitle: `Submitted from /lease/apply`,
        fields: [
          { label: "Applicant", value: `${form.firstName} ${form.lastName}` },
          { label: "Email", value: form.email },
          { label: "Mobile", value: form.mobile },
          { label: "Suburb", value: form.suburb },
          { label: "Budget", value: `$${form.budget}/w` },
          { label: "Move-in", value: form.moveIn },
          { label: "Employment", value: form.employment },
          { label: "Income", value: `$${form.income}/yr` },
          { label: "References", value: form.references || "—" },
          { label: "Pets", value: form.pets },
        ],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.slackPayload) return;
        pushSlackPost({
          channel: data.slackPayload.channel,
          kind: "rental_application",
          title: `${data.slackPayload.emoji} ${data.slackPayload.title}`,
          subtitle: data.slackPayload.subtitle,
          fields: data.slackPayload.fields,
          actions: [
            { label: "Open application", variant: "primary" },
            { label: "Request docs" },
          ],
        });
      })
      .catch(() => {});
  };

  if (done) {
    return (
      <div className="container-site py-20 max-w-2xl">
        <div className="bg-moss/10 border border-moss/30 p-10 text-center">
          <Check className="text-moss mx-auto mb-4" size={32} />
          <h1 className="display-md">Application submitted.</h1>
          <p className="text-ink-muted mt-3">
            Our property team will be in touch within one business day. Check the Slack Preview panel
            to see how your application was routed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site py-12 md:py-20 max-w-3xl">
      <span className="eyebrow">Tenancy Application</span>
      <h1 className="display-lg mt-2">Apply to rent with CJ.</h1>
      <p className="text-ink-muted mt-4 max-w-xl">
        Three short steps. Submits directly into our property management system — no forms to
        scan, no emails to chase.
      </p>

      <div className="mt-12 flex gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1 ${step >= s ? "bg-copper" : "bg-stone"}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-5 animate-slide-up">
          <Field label="First name" v={form.firstName} on={(v) => setForm({ ...form, firstName: v })} />
          <Field label="Last name" v={form.lastName} on={(v) => setForm({ ...form, lastName: v })} />
          <Field label="Email" v={form.email} on={(v) => setForm({ ...form, email: v })} />
          <Field label="Mobile" v={form.mobile} on={(v) => setForm({ ...form, mobile: v })} />
          <div>
            <label className="eyebrow">Preferred suburb</label>
            <select value={form.suburb} onChange={(e) => setForm({ ...form, suburb: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink">
              {suburbs.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <Field label="Move-in date" v={form.moveIn} on={(v) => setForm({ ...form, moveIn: v })} />
          <button onClick={() => setStep(2)} className="btn-primary md:col-span-2 justify-self-start">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="grid md:grid-cols-2 gap-5 animate-slide-up">
          <Field label="Weekly budget ($)" v={form.budget} on={(v) => setForm({ ...form, budget: v })} />
          <Field label="Annual household income ($)" v={form.income} on={(v) => setForm({ ...form, income: v })} />
          <Field label="Employment" v={form.employment} on={(v) => setForm({ ...form, employment: v })} full />
          <div className="md:col-span-2">
            <label className="eyebrow">References</label>
            <textarea rows={3} value={form.references} onChange={(e) => setForm({ ...form, references: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 focus:outline-none focus:border-ink resize-none" />
          </div>
          <div>
            <label className="eyebrow">Pets</label>
            <div className="flex gap-2 mt-2">
              {["No", "Cat", "Dog", "Other"].map((p) => (
                <button key={p} onClick={() => setForm({ ...form, pets: p })} className={`px-4 py-2 border text-sm ${form.pets === p ? "bg-ink text-paper border-ink" : "border-ink/20"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
            <button onClick={() => setStep(3)} className="btn-primary">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-slide-up">
          <div className="border border-dashed border-ink/30 p-10 flex flex-col items-center text-center">
            <Upload size={24} className="text-ink-muted" />
            <p className="mt-3 font-medium">Drag ID + payslips here</p>
            <p className="text-xs text-ink-muted mt-1">or click to upload · PDF, JPG, PNG · 10MB max</p>
            <p className="text-[11px] text-ink-subtle mt-4">
              (Demo: upload is mocked. In production, files go to encrypted storage and auto-attach to the application in HubSpot.)
            </p>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost">Back</button>
            <button onClick={submit} className="btn-primary">Submit application</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, v, on, full }: { label: string; v: string; on: (v: string) => void; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="eyebrow">{label}</label>
      <input value={v} onChange={(e) => on(e.target.value)} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
    </div>
  );
}
