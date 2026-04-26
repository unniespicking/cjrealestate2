"use client";

import { useState } from "react";
import type { Conversation } from "@/lib/conversations";
import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import clsx from "clsx";

export function ConversationsClient({ conversations }: { conversations: Conversation[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="bg-paper border border-ink/10 divide-y divide-ink/5">
      {conversations.map((c) => {
        const isOpen = open === c.id;
        const langTag = c.language === "KO" ? "한" : c.language === "ZH" ? "中" : "EN";
        return (
          <div key={c.id}>
            <button
              onClick={() => setOpen(isOpen ? null : c.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-paper-warm transition text-left"
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="font-mono text-[10px] text-ink-subtle w-20">{c.id}</span>
              <span className="bg-ink/5 text-ink text-[10px] uppercase tracking-wider px-1.5 py-0.5 w-8 text-center">{langTag}</span>
              <span className="bg-copper/15 text-copper-deep text-[10px] uppercase tracking-wider px-2 py-0.5">{c.intent}</span>
              <span className="text-xs text-ink-muted w-32">{c.suburb || "—"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{c.summary}</p>
                <p className="text-xs text-ink-subtle mt-0.5">
                  {c.name || "Anonymous"} · {c.contact || "no contact"} · {c.message_count} messages
                </p>
              </div>
              <span className="text-xs text-ink-muted shrink-0">
                {new Date(c.ended_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </button>
            {isOpen && (
              <div className="bg-paper-warm/40 px-12 py-5 border-t border-ink/5 space-y-2.5">
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-3 flex items-center gap-1.5">
                  <MessageSquare size={11} /> Transcript
                </div>
                {c.transcript.map((m, i) => (
                  <div key={i} className="flex gap-3">
                    <span
                      className={clsx(
                        "text-[10px] uppercase tracking-wider w-14 shrink-0 mt-0.5",
                        m.role === "user" ? "text-copper" : "text-ink-muted"
                      )}
                    >
                      {m.role === "user" ? "Visitor" : "CJ RealEstate Agent"}
                    </span>
                    <p className="text-sm">{m.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
