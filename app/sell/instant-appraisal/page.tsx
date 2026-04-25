"use client";

import { useState } from "react";
import { suburbs } from "@/lib/data/suburbs";
import { estimate, AvmResult } from "@/lib/avm";
import { pushSlackPost } from "@/lib/demo-events";
import { fmtCurrency } from "@/lib/format";
import { ArrowRight, Check, MapPin } from "lucide-react";

type Step = "address" | "details" | "result" | "contact" | "done";

export default function InstantAppraisal() {
  const [step, setStep] = useState<Step>("address");
  const [street, setStreet] = useState("");
  const [suburbSlug, setSuburbSlug] = useState(suburbs[0].slug);
  const [propertyType, setPropertyType] = useState<"Apartment" | "House" | "Townhouse">("Apartment");
  const [beds, setBeds] = useState(2);
  const [baths, setBaths] = useState(2);
  const [parking, setParking] = useState(1);
  const [condition, setCondition] = useState<"Original" | "Updated" | "Renovated" | "New">("Updated");
  const [result, setResult] = useState<AvmResult | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const run = () => {
    const r = estimate({ suburbSlug, beds, baths, parking, propertyType, condition });
    setResult(r);
    setStep("result");
  };

  const handover = async (e: React.FormEvent) => {
    e.preventDefault();
    const suburb = suburbs.find((s) => s.slug === suburbSlug)!;

    const fields = [
      { label: "Name", value: name },
      { label: "Contact", value: contact },
      { label: "Address", value: `${street}, ${suburb.name} ${suburb.postcode}` },
      { label: "AVM range", value: `${fmtCurrency(result!.low)} – ${fmtCurrency(result!.high)}` },
      { label: "Property", value: `${beds}bd / ${baths}ba / ${parking}car · ${propertyType}` },
      { label: "Condition", value: condition },
    ];

    setStep("done");

    fetch("/api/customer-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "instant_appraisal",
        title: `${suburb.name} · ${name}`,
        subtitle: `Submitted from /sell/instant-appraisal`,
        fields,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.slackPayload) return;
        pushSlackPost({
          channel: data.slackPayload.channel,
          kind: "appraisal",
          title: `${data.slackPayload.emoji} ${data.slackPayload.title}`,
          subtitle: data.slackPayload.subtitle,
          fields: data.slackPayload.fields,
          actions: [
            { label: "Reply now", variant: "primary" },
            { label: "Mark reviewed" },
          ],
        });
      })
      .catch(() => {});
  };

  return (
    <div className="container-site py-12 md:py-20 max-w-4xl">
      <span className="eyebrow">Instant Appraisal</span>
      <h1 className="display-lg mt-2">What's your property worth — today?</h1>
      <p className="text-ink-muted mt-4 max-w-xl">
        Address-level estimate built from recent comparable sales, suburb trend data, and the
        specifics of your property. No obligation. No phone tag.
      </p>

      <div className="mt-12 flex gap-2 mb-10">
        {(["address", "details", "result", "contact"] as const).map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 transition ${
              ["address", "details", "result", "contact", "done"].indexOf(step) >= i
                ? "bg-copper"
                : "bg-stone"
            }`}
          />
        ))}
      </div>

      {step === "address" && (
        <div className="animate-slide-up grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="eyebrow">Street address</label>
            <div className="flex items-center gap-2 mt-2 border-b border-ink/30 focus-within:border-ink py-3">
              <MapPin size={18} className="text-ink-muted" />
              <input
                placeholder="e.g. Apt 1204 / 46 Walker Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-lg"
              />
            </div>
            <p className="text-xs text-ink-subtle mt-2">
              In production, this field calls the Domain Address Locator API for auto-complete.
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="eyebrow">Suburb</label>
            <select value={suburbSlug} onChange={(e) => setSuburbSlug(e.target.value)} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink">
              {suburbs.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name} {s.postcode}</option>
              ))}
            </select>
          </div>
          <button onClick={() => setStep("details")} disabled={!street} className="btn-primary justify-self-start disabled:opacity-40">
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}

      {step === "details" && (
        <div className="animate-slide-up space-y-8">
          <div>
            <label className="eyebrow">Property type</label>
            <div className="flex gap-2 mt-3">
              {(["Apartment", "Townhouse", "House"] as const).map((t) => (
                <button key={t} onClick={() => setPropertyType(t)} className={`px-5 py-2.5 text-sm border transition ${propertyType === t ? "bg-ink text-paper border-ink" : "border-ink/20 hover:border-ink"}`}>{t}</button>
              ))}
            </div>
          </div>
          <Stepper label="Bedrooms" value={beds} set={setBeds} min={0} max={6} />
          <Stepper label="Bathrooms" value={baths} set={setBaths} min={1} max={5} />
          <Stepper label="Parking spaces" value={parking} set={setParking} min={0} max={4} />
          <div>
            <label className="eyebrow">Condition</label>
            <div className="flex gap-2 mt-3 flex-wrap">
              {(["Original", "Updated", "Renovated", "New"] as const).map((c) => (
                <button key={c} onClick={() => setCondition(c)} className={`px-5 py-2.5 text-sm border transition ${condition === c ? "bg-ink text-paper border-ink" : "border-ink/20 hover:border-ink"}`}>{c}</button>
              ))}
            </div>
          </div>
          <button onClick={run} className="btn-primary">
            Generate estimate <ArrowRight size={14} />
          </button>
        </div>
      )}

      {step === "result" && result && (
        <div className="animate-slide-up">
          <div className="bg-paper-warm border border-ink/10 p-8 md:p-12">
            <p className="eyebrow">Estimated value</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mt-4 gap-4">
              <div>
                <div className="font-display text-5xl md:text-6xl tracking-tightest">
                  {fmtCurrency(result.low)} – {fmtCurrency(result.high)}
                </div>
                <div className="text-ink-muted mt-2">Midpoint {fmtCurrency(result.mid)}</div>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="eyebrow">Confidence</div>
                  <div className="font-display text-xl mt-1">{result.confidence}</div>
                </div>
                <div>
                  <div className="eyebrow">Comparables</div>
                  <div className="font-display text-xl mt-1">{result.comparables}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-ink/10 text-sm text-ink-muted leading-relaxed">
              Based on {result.comparables} recent comparable sales in the suburb, adjusted for
              property type, layout and condition. Suburb median {fmtCurrency(result.suburbMedian)}.
              For a precise figure, request a formal appraisal — our agent will inspect and produce a written range within 48 hours.
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-3">
            <button onClick={() => setStep("contact")} className="btn-copper">
              Request a formal appraisal
            </button>
            <button onClick={() => setStep("details")} className="btn-ghost">
              Adjust details
            </button>
          </div>
        </div>
      )}

      {step === "contact" && (
        <form onSubmit={handover} className="animate-slide-up space-y-6 max-w-lg">
          <div>
            <label className="eyebrow">Your name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
          </div>
          <div>
            <label className="eyebrow">Email or mobile</label>
            <input required value={contact} onChange={(e) => setContact(e.target.value)} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
          </div>
          <button type="submit" className="btn-primary">Send request <ArrowRight size={14} /></button>
        </form>
      )}

      {step === "done" && (
        <div className="animate-slide-up bg-moss/10 border border-moss/30 p-8 md:p-12 flex items-start gap-4">
          <Check size={24} className="text-moss mt-1" />
          <div>
            <h2 className="font-display text-2xl">Request received.</h2>
            <p className="mt-2 text-ink-muted">
              An agent from the suburb specialist team will reach out within the hour.
              Meanwhile, open the Slack Preview panel (bottom-left) to see how the lead was routed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center justify-between">
      <label className="eyebrow">{label}</label>
      <div className="flex items-center gap-4">
        <button onClick={() => set(Math.max(min, value - 1))} className="w-10 h-10 border border-ink/20 hover:border-ink text-lg">−</button>
        <span className="font-display text-3xl w-10 text-center">{value}</span>
        <button onClick={() => set(Math.min(max, value + 1))} className="w-10 h-10 border border-ink/20 hover:border-ink text-lg">+</button>
      </div>
    </div>
  );
}
