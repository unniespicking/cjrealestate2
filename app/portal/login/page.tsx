"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Sparkles, ArrowRight, Check, AlertCircle } from "lucide-react";
import { agents } from "@/lib/data/agents";

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [link, setLink] = useState<string>("");
  const [demo, setDemo] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const r = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      setLink(data.link ?? "");
      setDemo(!!data.demo);
      setName(data.name ?? "");
      setState("sent");
    } catch (e: any) {
      setError(e.message);
      setState("error");
    }
  };

  return (
    <div className="min-h-[80vh] container-site py-16 grid md:grid-cols-2 gap-16 items-center">
      <div>
        <span className="eyebrow">Staff Portal</span>
        <h1 className="display-lg mt-3 max-w-md">Sign in with your CJ email.</h1>
        <p className="text-ink-muted mt-5 max-w-md leading-relaxed">
          We'll send a one-time secure link to your email. No password required.
          Links expire after 30 minutes and only your registered CJ email works.
        </p>

        <details className="mt-12 group">
          <summary className="text-xs uppercase tracking-[0.18em] text-ink-muted cursor-pointer hover:text-ink">
            Test emails for demo →
          </summary>
          <div className="mt-4 grid gap-1.5 text-sm">
            {agents.map((a) => (
              <button
                key={a.slug}
                onClick={() => setEmail(a.email)}
                className="text-left p-2 hover:bg-paper-warm flex justify-between items-center text-xs"
              >
                <span className="text-ink-muted">{a.name}</span>
                <span className="font-mono text-ink">{a.email}</span>
              </button>
            ))}
          </div>
        </details>
      </div>

      <div className="bg-paper-warm/60 border border-ink/10 p-8 md:p-12">
        {state !== "sent" && (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="eyebrow">Work email</label>
              <div className="flex items-center gap-2 mt-2 border-b border-ink/30 focus-within:border-ink py-3">
                <Mail size={16} className="text-ink-muted" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cjintl.com.au"
                  className="flex-1 bg-transparent focus:outline-none text-lg"
                  disabled={state === "sending"}
                />
              </div>
            </div>
            <button type="submit" disabled={state === "sending"} className="btn-primary w-full disabled:opacity-50">
              {state === "sending" ? "Sending…" : <>Send magic link <ArrowRight size={14} /></>}
            </button>
            {state === "error" && (
              <div className="text-sm text-copper flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </form>
        )}

        {state === "sent" && (
          <div className="animate-slide-up">
            <Check className="text-moss" size={28} />
            <h2 className="font-display text-2xl mt-4">Check your email{name ? `, ${name.split(" ")[0]}` : ""}.</h2>
            <p className="text-ink-muted mt-3 leading-relaxed">
              We've sent a magic link to <span className="text-ink font-medium">{email}</span>.
              Click the link to sign in. It expires in 30 minutes.
            </p>

            {demo && link && (
              <div className="mt-8 p-4 bg-ink text-paper border-l-2 border-copper">
                <div className="text-[10px] uppercase tracking-[0.18em] text-copper mb-2 flex items-center gap-1.5">
                  <Sparkles size={11} /> Demo only
                </div>
                <p className="text-xs text-paper/70 mb-3 leading-relaxed">
                  No SMTP is wired in demo mode — click below to skip the email and go straight in.
                </p>
                <Link
                  href={link.replace(new URL(link).origin, "")}
                  className="block bg-copper text-paper text-center py-3 text-sm font-medium hover:bg-copper-deep transition"
                >
                  Open magic link →
                </Link>
              </div>
            )}

            <button onClick={() => setState("idle")} className="text-xs link-underline mt-6">
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
