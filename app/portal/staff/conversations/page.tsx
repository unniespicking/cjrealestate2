import Link from "next/link";
import { getConversations } from "@/lib/conversations";
import { ConversationsClient } from "./ConversationsClient";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const all = (await getConversations()).reverse();
  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-ink-muted">CSV: <span className="font-mono">database/conversations.csv</span></p>
          <h1 className="display-md mt-1">AI conversations · {all.length}</h1>
          <p className="text-sm text-ink-muted mt-1">
            Every CJ RealEstate Agent chat is summarised by Gemini, logged to CSV, and posted to <span className="font-mono">#ai_conversation_received</span>.
          </p>
        </div>
        <Link href="/portal/staff" className="btn-ghost text-sm">← Dashboard</Link>
      </div>

      {all.length === 0 ? (
        <div className="bg-paper border border-ink/10 p-12 text-center text-ink-muted">
          No conversations yet. Open the chatbot, run through a flow, and refresh this page.
        </div>
      ) : (
        <ConversationsClient conversations={all} />
      )}
    </div>
  );
}
