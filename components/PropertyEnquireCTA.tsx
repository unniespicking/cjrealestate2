"use client";

import { useState } from "react";
import { Property } from "@/lib/data/properties";
import { pushSlackPost, channelForSuburbLanguage } from "@/lib/demo-events";
import { Check } from "lucide-react";

export function PropertyEnquireCTA({ property, agentName }: { property: Property; agentName: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    pushSlackPost({
      channel: channelForSuburbLanguage(property.suburb, "EN"),
      kind: "contact_form",
      title: `Enquiry — ${property.suburb}`,
      subtitle: `from ${property.address}`,
      suburb: property.suburb,
      agentSlug: property.agent,
      fields: [
        { label: "Name", value: form.name },
        { label: "Contact", value: form.contact },
        { label: "Listing", value: `${property.address} (#${property.id})` },
        { label: "Message", value: form.message || "—" },
        { label: "Routed to", value: agentName },
      ],
      actions: [{ label: "Claim", variant: "primary" }, { label: "Assign to…" }],
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mt-5 p-4 bg-moss/10 border border-moss/30 text-sm flex items-start gap-2">
        <Check size={16} className="text-moss mt-0.5" />
        <span>Message sent. {agentName} will be in touch.</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full mt-5">
        Enquire about this property
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-3 animate-slide-up">
      <input
        required
        placeholder="Your name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
      />
      <input
        required
        placeholder="Email or phone"
        value={form.contact}
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
        className="w-full border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
      />
      <textarea
        placeholder="Anything we should know?"
        rows={3}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:border-ink resize-none"
      />
      <button type="submit" className="btn-primary w-full">Send</button>
    </form>
  );
}
