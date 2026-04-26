"use client";

import { useEffect, useRef, useState } from "react";
import { Hash, X, Slash, MessageSquare, CornerDownRight, Hand } from "lucide-react";
import clsx from "clsx";
import { subscribeToSlack, SlackPost } from "@/lib/demo-events";

const channels = [
  "#ai_conversation_received",
  "#customer-direct-requests",
  "#leads-rhodes",
  "#leads-newington",
  "#inspections-today",
  "#wins",
  "#staff-auth",
];

export function SlackPreviewPanel() {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<SlackPost[]>(seed());
  const [active, setActive] = useState<string>("#ai_conversation_received");
  const [unread, setUnread] = useState(0);
  const [me, setMe] = useState<string>("Alex Lee");
  const bodyRef = useRef<HTMLDivElement>(null);

  // Try to use the logged-in staff member as the claimer in the demo panel.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.staff?.name) setMe(d.staff.name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return subscribeToSlack((post) => {
      setPosts((p) => [post, ...p]);
      setActive(post.channel);
      if (!open) setUnread((u) => u + 1);
    });
  }, [open]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const filtered = posts.filter((p) => p.channel === active);

  const claim = (postId: string) => {
    console.log("[SlackPreview] claim() called with id:", postId, "me:", me);
    const now = new Date().toISOString();
    setPosts((all) => {
      const next = all.map((p) => {
        if (p.id !== postId) return p;
        if (p.claimedBy) {
          return {
            ...p,
            thread: [
              ...(p.thread ?? []),
              {
                author: me,
                text: `tried to claim — already owned by *${p.claimedBy}*`,
                time: now,
              },
            ],
          };
        }
        return {
          ...p,
          claimedBy: me,
          claimedAt: now,
          thread: [
            ...(p.thread ?? []),
            {
              author: me,
              text: `claimed this case. Following up with the customer next.`,
              time: now,
            },
          ],
        };
      });
      console.log("[SlackPreview] new posts:", next.find((p) => p.id === postId));
      return next;
    });
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-[#4A154B] text-white pl-3 pr-4 py-2.5 shadow-xl flex items-center gap-2.5 hover:bg-[#611f64] transition"
        >
          <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
            <SlackGlyph />
          </div>
          <span className="text-sm font-medium tracking-wide">Slack Preview</span>
          {unread > 0 && (
            <span className="bg-[#E01E5A] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 left-6 z-40 w-[min(560px,calc(100vw-2rem))] h-[min(680px,calc(100vh-3rem))] bg-white shadow-2xl flex flex-col border border-ink/10 animate-slide-up overflow-hidden">
          <div className="bg-[#350d36] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlackGlyph size={16} />
              <div>
                <p className="text-sm font-semibold leading-tight">CJ Real Estate</p>
                <p className="text-[10px] text-white/60 leading-tight">Slack Preview · You're {me}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            <aside className="w-44 bg-[#3F0E40] text-white/80 py-3 overflow-y-auto">
              <p className="px-3 text-[10px] uppercase tracking-[0.14em] text-white/40 mb-1.5">
                Channels
              </p>
              {channels.map((c) => {
                const ch = posts.filter((p) => p.channel === c).length;
                const unread = posts.filter(
                  (p) => p.channel === c && !p.claimedBy
                ).length;
                return (
                  <button
                    key={c}
                    onClick={() => setActive(c)}
                    className={clsx(
                      "w-full text-left px-3 py-1.5 text-sm flex items-center gap-1.5 transition",
                      active === c ? "bg-[#1164A3] text-white" : "hover:bg-white/5"
                    )}
                  >
                    <Hash size={13} className="opacity-60" />
                    <span className="flex-1 truncate">{c.slice(1)}</span>
                    {ch > 0 && (
                      <span className={clsx("text-[10px]", unread > 0 ? "text-[#E01E5A] font-bold" : "opacity-60")}>
                        {unread > 0 ? unread : ch}
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="mt-4 border-t border-white/10 pt-3 px-3 space-y-1 text-[11px]">
                <p className="uppercase tracking-[0.14em] text-white/40 mb-1">Slash commands</p>
                <div className="flex items-start gap-1 text-white/70"><Slash size={10} className="mt-0.5" />appraisal</div>
                <div className="flex items-start gap-1 text-white/70"><Slash size={10} className="mt-0.5" />lead</div>
                <div className="flex items-start gap-1 text-white/70"><Slash size={10} className="mt-0.5" />inspection</div>
              </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-white">
              <div className="px-4 py-2.5 border-b border-ink/10 flex items-center gap-2">
                <Hash size={16} className="text-ink-muted" />
                <span className="font-semibold text-sm">{active.slice(1)}</span>
                <span className="text-xs text-ink-subtle">· 9 members</span>
              </div>

              <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
                {filtered.length === 0 && (
                  <div className="text-center text-ink-subtle text-xs py-12">
                    No messages yet in this channel.
                  </div>
                )}
                {filtered.map((p) => (
                  <SlackPostCard key={p.id} post={p} onClaim={() => claim(p.id)} me={me} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SlackPostCard({
  post,
  onClaim,
  me,
}: {
  post: SlackPost;
  onClaim: () => void;
  me: string;
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  const icon =
    post.kind === "appraisal"
      ? "💰"
      : post.kind === "inspection_booking"
      ? "📅"
      : post.kind === "rental_application"
      ? "🔑"
      : post.kind === "formal_appraisal"
      ? "📋"
      : post.kind === "contact_form"
      ? "📮"
      : "🤖";

  return (
    <div className="flex gap-3 group animate-slide-up">
      <div className="w-9 h-9 bg-copper text-white rounded-md flex items-center justify-center flex-shrink-0 font-bold text-sm">
        CJ
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-bold text-sm">CJ Bot</span>
          <span className="text-[10px] bg-ink/5 text-ink-muted px-1 py-[1px] rounded">APP</span>
          <span className="text-xs text-ink-subtle">
            {new Date(post.timestamp).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div
          className="border-l-[3px] p-3 transition-colors"
          style={{
            borderLeftColor: post.claimedBy ? "#1d6f4a" : "#B5754A",
            backgroundColor: post.claimedBy ? "#f5fbf7" : "#f7f3ec",
          }}
        >
          <p className="font-semibold text-sm mb-0.5">
            {post.title.includes(icon) ? post.title : `${icon} ${post.title}`}
          </p>
          {post.subtitle && (
            <p className="text-xs text-ink-muted mb-2">{post.subtitle}</p>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
            {post.fields.map((f, i) => (
              <div key={i}>
                <div className="text-ink-subtle text-[10px] uppercase tracking-wider">{f.label}</div>
                <div className="text-ink whitespace-pre-wrap break-words">{f.value}</div>
              </div>
            ))}
          </div>

          {post.transcript && post.transcript.length > 0 && (
            <div className="mt-3 pt-2 border-t border-ink/5">
              <button
                onClick={() => setShowTranscript((s) => !s)}
                className="text-[11px] text-[#1164A3] hover:underline flex items-center gap-1"
              >
                <MessageSquare size={11} />
                {showTranscript ? "Hide" : "Show"} conversation ({post.transcript.length})
              </button>
              {showTranscript && (
                <div className="mt-2 space-y-1.5 text-xs bg-white border border-ink/10 p-2 max-h-48 overflow-y-auto">
                  {post.transcript.map((t, i) => (
                    <div key={i}>
                      <span className={clsx("font-semibold mr-2", t.role === "user" ? "text-copper" : "text-ink-muted")}>
                        {t.role === "user" ? "Visitor" : "CJ RealEstate Agent"}:
                      </span>
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Claim CTA / Status */}
          <div className="mt-3 pt-2 border-t border-ink/5">
            {post.claimedBy ? (
              <div
                className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5"
                style={{ color: "#1d6f4a", backgroundColor: "#e9f6ee" }}
              >
                <span>✅ Claimed by {post.claimedBy}</span>
                {post.claimedAt && (
                  <span className="opacity-60 font-normal">
                    · {new Date(post.claimedAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("[SlackPreview] Claim button clicked for post id:", post.id);
                  onClaim();
                }}
                style={{ backgroundColor: "#007a5a" }}
                className="text-white text-xs font-semibold px-3 py-1.5 inline-flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
              >
                <Hand size={12} /> Click to Claim
              </button>
            )}
            <div className="text-[10px] mt-1.5 font-mono opacity-50">
              Case ID: {post.id.slice(0, 13)}
            </div>
          </div>
        </div>

        {/* Thread replies */}
        {post.thread && post.thread.length > 0 && (
          <div className="mt-2 ml-4 pl-3 border-l-2 border-ink/10 space-y-2">
            {post.thread.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <CornerDownRight size={11} className="text-ink-muted mt-1 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">{t.author}</span>
                  <span className="text-ink-subtle ml-1.5">
                    {new Date(t.time).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <p className="text-ink mt-0.5" dangerouslySetInnerHTML={{ __html: t.text.replace(/\*([^*]+)\*/g, "<strong>$1</strong>") }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SlackGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size}>
      <path fill="#E01E5A" d="M22 34a6 6 0 1 1-6-6h6v6z" />
      <path fill="#E01E5A" d="M25 34a6 6 0 0 1 12 0v15a6 6 0 0 1-12 0V34z" />
      <path fill="#36C5F0" d="M31 22a6 6 0 1 1 6-6v6h-6z" />
      <path fill="#36C5F0" d="M31 25a6 6 0 0 1 0 12H16a6 6 0 0 1 0-12h15z" />
      <path fill="#2EB67D" d="M43 26a6 6 0 1 1 6 6h-6v-6z" />
      <path fill="#2EB67D" d="M40 26a6 6 0 0 1-12 0V11a6 6 0 0 1 12 0v15z" />
      <path fill="#ECB22E" d="M34 43a6 6 0 1 1-6 6v-6h6z" />
      <path fill="#ECB22E" d="M34 40a6 6 0 0 1 0-12h15a6 6 0 0 1 0 12H34z" />
    </svg>
  );
}

function seed(): SlackPost[] {
  const base = new Date();
  base.setMinutes(base.getMinutes() - 35);
  return [
    {
      id: "case-seed1",
      channel: "#ai_conversation_received",
      kind: "chat_lead",
      timestamp: base.toISOString(),
      title: "🤖 AI conversation — sell",
      subtitle: "Rhodes · 한국어",
      suburb: "Rhodes",
      language: "KO",
      fields: [
        { label: "Intent", value: "sell" },
        { label: "Suburb", value: "Rhodes" },
        { label: "Language", value: "한국어" },
        { label: "Name", value: "S. Park" },
        { label: "Contact", value: "0411 xxx xxx" },
        { label: "Summary", value: "Looking to sell their 2-bed Rhodes apartment within Q1, mentioned a comparable building had a recent record sale and would like a formal appraisal next week." },
      ],
    },
    {
      id: "case-seed2",
      channel: "#inspections-today",
      kind: "inspection_booking",
      timestamp: new Date(base.getTime() - 1000 * 60 * 45).toISOString(),
      title: "📅 Today's inspections",
      fields: [
        { label: "10:00 · Rhodes", value: "Apt 1204 / 46 Walker St — 3 RSVPs · @alex" },
        { label: "11:30 · Newington", value: "14 Bayview Grove — 5 RSVPs · @canti" },
        { label: "13:00 · Liberty Grove", value: "28 Village Drive — 2 RSVPs · @alex" },
      ],
      claimedBy: "Alex Lee",
      claimedAt: new Date(base.getTime() - 1000 * 60 * 30).toISOString(),
      thread: [
        {
          author: "Alex Lee",
          text: "claimed this case. Following up with the customer next.",
          time: new Date(base.getTime() - 1000 * 60 * 30).toISOString(),
        },
      ],
    },
  ];
}
