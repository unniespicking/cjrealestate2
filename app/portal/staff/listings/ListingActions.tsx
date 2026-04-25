"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { pushSlackPost } from "@/lib/demo-events";

export function ListingActions({
  id,
  address,
  suburb,
}: {
  id: string;
  address: string;
  suburb: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm(`Delete ${address}? This removes photos from the database folder too.`)) return;
    setBusy(true);
    const r = await fetch(`/api/properties/${id}`, { method: "DELETE" });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) {
      alert(data.error ?? "Failed");
      return;
    }
    if (data.slackPayload) {
      pushSlackPost({
        channel: data.slackPayload.channel,
        kind: "contact_form",
        title: `${data.slackPayload.emoji} ${data.slackPayload.title}`,
        subtitle: data.slackPayload.subtitle,
        fields: data.slackPayload.fields,
      });
    }
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/buy/${id}`}
        className="p-2 text-ink-muted hover:text-ink"
        title="View public page"
      >
        <span className="text-xs">View</span>
      </Link>
      <Link
        href={`/portal/staff/listings/${id}/edit`}
        className="p-2 text-ink-muted hover:text-copper"
        title="Edit"
      >
        <Edit2 size={15} />
      </Link>
      <button onClick={onDelete} disabled={busy} className="p-2 text-ink-muted hover:text-copper disabled:opacity-50" title="Delete">
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
