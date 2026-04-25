"use client";

// Cross-component event bus for demo mode — lets ChatWidget, forms, etc.
// push "Slack notifications" that the SlackPreviewPanel subscribes to.

export type SlackLeadKind =
  | "chat_lead"
  | "appraisal"
  | "inspection_booking"
  | "rental_application"
  | "contact_form"
  | "formal_appraisal";

export type SlackPost = {
  id: string;
  channel: string;
  kind: SlackLeadKind;
  timestamp: string;
  title: string;
  subtitle?: string;
  fields: { label: string; value: string }[];
  transcript?: { role: "user" | "bot"; text: string }[];
  language?: "EN" | "KO" | "ZH";
  suburb?: string;
  agentSlug?: string;
  actions?: { label: string; variant?: "primary" | "ghost" }[];
  claimedBy?: string;
  claimedAt?: string;
  thread?: { author: string; text: string; time: string }[];
};

type Listener = (post: SlackPost) => void;

const listeners = new Set<Listener>();

export function pushSlackPost(post: Omit<SlackPost, "id" | "timestamp">) {
  const full: SlackPost = {
    ...post,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  listeners.forEach((l) => l(full));
  return full;
}

export function subscribeToSlack(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function channelForSuburbLanguage(suburb?: string, language?: "EN" | "KO" | "ZH") {
  const rhodesBelt = ["Rhodes", "Meadowbank", "Liberty Grove", "Ermington"];
  const newingtonBelt = ["Newington", "Wentworth Point", "Lidcombe", "Silverwater"];
  if (suburb && rhodesBelt.includes(suburb)) return "#leads-rhodes";
  if (suburb && newingtonBelt.includes(suburb)) return "#leads-newington";
  if (language && language !== "EN") return "#leads-international";
  return "#leads-rhodes";
}
