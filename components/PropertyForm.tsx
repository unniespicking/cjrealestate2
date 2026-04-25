"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Property } from "@/lib/data/properties";
import { suburbs } from "@/lib/data/suburbs";
import { agents } from "@/lib/data/agents";
import { photoUrl } from "@/lib/photo";
import { pushSlackPost } from "@/lib/demo-events";
import { Plus, X, Upload, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

type Mode = "create" | "edit";

export function PropertyForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: Partial<Property>;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [action, setAction] = useState<Property["action"]>(initial?.action ?? "sale");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [suburb, setSuburb] = useState(initial?.suburb ?? suburbs[0].name);
  const [postcode, setPostcode] = useState(initial?.postcode ?? suburbs[0].postcode);
  const [price, setPrice] = useState(initial?.price ?? "");
  const [priceNumeric, setPriceNumeric] = useState(String(initial?.priceNumeric ?? ""));
  const [beds, setBeds] = useState(String(initial?.beds ?? "2"));
  const [baths, setBaths] = useState(String(initial?.baths ?? "2"));
  const [cars, setCars] = useState(String(initial?.cars ?? "1"));
  const [area, setArea] = useState(String(initial?.area ?? "80"));
  const [propertyType, setPropertyType] = useState<Property["propertyType"]>(
    initial?.propertyType ?? "Apartment"
  );
  const [heading, setHeading] = useState(initial?.heading ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [featureDraft, setFeatureDraft] = useState("");
  const [agent, setAgent] = useState(initial?.agent ?? agents[0].slug);
  const [lat, setLat] = useState(String(initial?.coordinates?.[0] ?? "-33.83"));
  const [lng, setLng] = useState(String(initial?.coordinates?.[1] ?? "151.08"));
  const [availableFrom, setAvailableFrom] = useState(initial?.availableFrom ?? "");

  // Photos
  const [keepPhotos, setKeepPhotos] = useState<string[]>(initial?.photos ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        action,
        address,
        suburb,
        postcode,
        price,
        priceNumeric,
        beds, baths, cars, area,
        propertyType,
        heading,
        description,
        features,
        agent,
        lat, lng,
        availableFrom,
        keepPhotos,
      })
    );
    for (const f of newFiles) fd.append("photos", f);

    const url = mode === "create" ? "/api/properties" : `/api/properties/${initial!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const r = await fetch(url, { method, body: fd });
    const data = await r.json();
    setSubmitting(false);

    if (!r.ok) {
      alert(data.error ?? "Failed to save");
      return;
    }

    if (data.slackPayload) {
      pushSlackPost({
        channel: data.slackPayload.channel,
        kind: "contact_form",
        title: `${data.slackPayload.emoji ?? ""} ${data.slackPayload.title}`,
        subtitle: data.slackPayload.subtitle,
        fields: data.slackPayload.fields,
        actions: [{ label: "Open in CMS", variant: "primary" }, { label: "View public" }],
      });
    }

    router.push("/portal/staff/listings");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-10">
      <header>
        <Link href="/portal/staff/listings" className="text-xs link-underline flex items-center gap-1">
          <ArrowLeft size={12} /> Back to listings
        </Link>
        <h1 className="display-md mt-3">{mode === "create" ? "New listing" : `Edit · ${initial?.id}`}</h1>
        <p className="text-sm text-ink-muted mt-1">
          Saves to <span className="font-mono">database/properties.csv</span> and posts to Slack.
        </p>
      </header>

      {/* Section: Status + address */}
      <section className="grid md:grid-cols-12 gap-6 pb-8 border-b border-ink/10">
        <div className="md:col-span-4">
          <h2 className="font-display text-xl">Status</h2>
          <p className="text-sm text-ink-muted mt-1">Sale, lease, or already changed hands.</p>
        </div>
        <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-2">
          {(["sale", "lease", "sold", "leased"] as const).map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => setAction(a)}
              className={`py-3 text-sm uppercase tracking-[0.14em] border ${action === a ? "bg-ink text-paper border-ink" : "border-ink/15 hover:border-ink"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-12 gap-6 pb-8 border-b border-ink/10">
        <div className="md:col-span-4">
          <h2 className="font-display text-xl">Address</h2>
        </div>
        <div className="md:col-span-8 grid md:grid-cols-2 gap-5">
          <Field label="Street address" v={address} on={setAddress} full />
          <div>
            <label className="eyebrow">Suburb</label>
            <select
              value={suburb}
              onChange={(e) => {
                setSuburb(e.target.value);
                const s = suburbs.find((x) => x.name === e.target.value);
                if (s) {
                  setPostcode(s.postcode);
                  // approximate centroid for new entries
                }
              }}
              className="w-full mt-2 border-b border-ink/30 bg-transparent py-2.5 text-base focus:outline-none focus:border-ink"
            >
              {suburbs.map((s) => <option key={s.slug} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <Field label="Postcode" v={postcode} on={setPostcode} />
          <Field label="Latitude" v={lat} on={setLat} />
          <Field label="Longitude" v={lng} on={setLng} />
        </div>
      </section>

      <section className="grid md:grid-cols-12 gap-6 pb-8 border-b border-ink/10">
        <div className="md:col-span-4">
          <h2 className="font-display text-xl">Pricing & layout</h2>
        </div>
        <div className="md:col-span-8 grid md:grid-cols-2 gap-5">
          <Field label="Display price (text)" v={price} on={setPrice} placeholder="e.g. Auction — Guide $1.35M" />
          <Field label="Numeric price (filters)" v={priceNumeric} on={setPriceNumeric} placeholder="1350000" />
          <Field label="Bedrooms" v={beds} on={setBeds} />
          <Field label="Bathrooms" v={baths} on={setBaths} />
          <Field label="Parking" v={cars} on={setCars} />
          <Field label="Internal area (m²)" v={area} on={setArea} />
          <div className="md:col-span-2">
            <label className="eyebrow">Type</label>
            <div className="flex gap-2 mt-3 flex-wrap">
              {(["Apartment", "Townhouse", "House", "Studio"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setPropertyType(t)}
                  className={`px-4 py-2 text-sm border ${propertyType === t ? "bg-ink text-paper border-ink" : "border-ink/15 hover:border-ink"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {action === "lease" && (
            <Field label="Available from" v={availableFrom} on={setAvailableFrom} placeholder="e.g. Immediately, 14 May" full />
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-12 gap-6 pb-8 border-b border-ink/10">
        <div className="md:col-span-4">
          <h2 className="font-display text-xl">Copy</h2>
          <p className="text-sm text-ink-muted mt-1">Goes onto the listing detail page.</p>
        </div>
        <div className="md:col-span-8 space-y-5">
          <Field label="Heading" v={heading} on={setHeading} full />
          <div>
            <label className="eyebrow">Description</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 focus:outline-none focus:border-ink resize-none"
            />
          </div>
          <div>
            <label className="eyebrow">Features</label>
            <div className="flex gap-2 mt-2">
              <input
                value={featureDraft}
                onChange={(e) => setFeatureDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && featureDraft.trim()) {
                    e.preventDefault();
                    setFeatures([...features, featureDraft.trim()]);
                    setFeatureDraft("");
                  }
                }}
                placeholder="Type a feature, press Enter"
                className="flex-1 border-b border-ink/30 bg-transparent py-2 focus:outline-none focus:border-ink"
              />
              <button
                type="button"
                onClick={() => {
                  if (featureDraft.trim()) {
                    setFeatures([...features, featureDraft.trim()]);
                    setFeatureDraft("");
                  }
                }}
                className="btn-ghost !py-2 !px-3 text-xs"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {features.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-paper-warm px-3 py-1 text-sm">
                    {f}
                    <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))} className="text-ink-muted hover:text-copper">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-12 gap-6 pb-8 border-b border-ink/10">
        <div className="md:col-span-4">
          <h2 className="font-display text-xl">Photos</h2>
          <p className="text-sm text-ink-muted mt-1">
            JPEG/PNG, drag to reorder. Saved to <span className="font-mono">database/photos/</span>.
          </p>
        </div>
        <div className="md:col-span-8">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {keepPhotos.map((p, i) => (
              <div key={`k-${i}`} className="relative aspect-[4/3] bg-stone group">
                <Image src={photoUrl(p)} alt="" fill className="object-cover" sizes="200px" />
                <button
                  type="button"
                  onClick={() => setKeepPhotos(keepPhotos.filter((_, j) => j !== i))}
                  className="absolute top-1.5 right-1.5 bg-ink text-paper p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {newFiles.map((f, i) => (
              <div key={`n-${i}`} className="relative aspect-[4/3] bg-stone group">
                <Image src={URL.createObjectURL(f)} alt="" fill className="object-cover" sizes="200px" />
                <span className="absolute bottom-1.5 left-1.5 bg-copper text-paper text-[10px] px-1.5 py-0.5 uppercase tracking-wider">New</span>
                <button
                  type="button"
                  onClick={() => setNewFiles(newFiles.filter((_, j) => j !== i))}
                  className="absolute top-1.5 right-1.5 bg-ink text-paper p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="aspect-[4/3] border border-dashed border-ink/30 flex flex-col items-center justify-center cursor-pointer hover:border-ink hover:bg-paper-warm transition">
              <Upload size={20} className="text-ink-muted" />
              <span className="text-xs text-ink-muted mt-2">Add photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewFiles([...newFiles, ...Array.from(e.target.files ?? [])])}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <h2 className="font-display text-xl">Listing agent</h2>
        </div>
        <div className="md:col-span-8">
          <select value={agent} onChange={(e) => setAgent(e.target.value)} className="w-full border-b border-ink/30 bg-transparent py-2.5 text-base focus:outline-none focus:border-ink">
            {agents.map((a) => <option key={a.slug} value={a.slug}>{a.name} — {a.role}</option>)}
          </select>
        </div>
      </section>

      <div className="flex items-center gap-3 pt-6 border-t border-ink/10">
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : mode === "create" ? "Publish listing" : "Save changes"}
        </button>
        <Link href="/portal/staff/listings" className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, v, on, full, placeholder }: { label: string; v: string; on: (v: string) => void; full?: boolean; placeholder?: string }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="eyebrow">{label}</label>
      <input required value={v} placeholder={placeholder} onChange={(e) => on(e.target.value)} className="w-full mt-2 border-b border-ink/30 bg-transparent py-2.5 text-base focus:outline-none focus:border-ink" />
    </div>
  );
}
