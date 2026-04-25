"use client";

import { useState } from "react";
import { Property } from "@/lib/data/properties";
import { Calendar, Check } from "lucide-react";
import { pushSlackPost } from "@/lib/demo-events";
import { getAgent } from "@/lib/data/agents";

export function InspectionBooking({ property }: { property: Property }) {
  const slots = property.inspectionSlots ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [booked, setBooked] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === null) return;
    const slot = slots[selected];
    const agent = getAgent(property.agent);

    setBooked(true);

    fetch("/api/customer-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "inspection_booking",
        title: `${property.suburb} · ${name}`,
        subtitle: `${property.address} (#${property.id})`,
        fields: [
          { label: "Attendee", value: name },
          { label: "Contact", value: contact },
          { label: "Slot", value: `${slot.date} · ${slot.start}–${slot.end}` },
          { label: "Listing", value: `${property.address}` },
          { label: "Listing ID", value: property.id },
          { label: "Suburb", value: property.suburb },
          { label: "Listing agent", value: agent?.name ?? "—" },
        ],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.slackPayload) return;
        pushSlackPost({
          channel: data.slackPayload.channel,
          kind: "inspection_booking",
          title: `${data.slackPayload.emoji} ${data.slackPayload.title}`,
          subtitle: data.slackPayload.subtitle,
          fields: data.slackPayload.fields,
          actions: [
            { label: "Confirm RSVP", variant: "primary" },
            { label: "Reschedule" },
          ],
        });
      })
      .catch(() => {});
  };

  if (booked) {
    return (
      <div className="mt-4 p-5 bg-moss/10 border border-moss/30 flex items-start gap-3">
        <Check className="text-moss mt-1" size={18} />
        <div>
          <p className="font-medium">You're booked in.</p>
          <p className="text-sm text-ink-muted mt-1">
            Confirmation email on its way. Watch the Slack Preview panel — the agent has been notified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <div className="flex flex-wrap gap-2">
        {slots.map((s, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setSelected(i)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border transition ${
              selected === i
                ? "bg-ink text-paper border-ink"
                : "border-ink/20 hover:border-ink"
            }`}
          >
            <Calendar size={14} />
            {s.date} · {s.start}–{s.end}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className="grid sm:grid-cols-2 gap-3 animate-slide-up">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border border-ink/15 px-4 py-3 text-sm focus:outline-none focus:border-ink"
          />
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email or mobile"
            className="border border-ink/15 px-4 py-3 text-sm focus:outline-none focus:border-ink"
          />
          <button type="submit" className="sm:col-span-2 btn-primary">
            Confirm booking
          </button>
        </div>
      )}
    </form>
  );
}
