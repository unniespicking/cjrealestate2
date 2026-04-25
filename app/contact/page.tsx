"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Check } from "lucide-react";
import { pushSlackPost } from "@/lib/demo-events";

export default function Contact() {
  const [form, setForm] = useState({ name: "", contact: "", subject: "General enquiry", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    pushSlackPost({
      channel: "#leads-rhodes",
      kind: "contact_form",
      title: `Contact form — ${form.subject}`,
      fields: [
        { label: "Name", value: form.name },
        { label: "Contact", value: form.contact },
        { label: "Subject", value: form.subject },
        { label: "Message", value: form.message || "—" },
      ],
      actions: [{ label: "Claim", variant: "primary" }, { label: "Assign to…" }],
    });
    setSent(true);
  };

  return (
    <div className="container-site py-12 md:py-20 grid md:grid-cols-12 gap-12">
      <div className="md:col-span-5">
        <span className="eyebrow">Contact</span>
        <h1 className="display-lg mt-2">Let's talk.</h1>
        <p className="text-ink-muted mt-4 text-lg leading-relaxed">
          Two offices, eight agents, three languages. Any question, any time.
        </p>

        <div className="mt-12 space-y-10">
          <div>
            <h3 className="font-display text-2xl">Rhodes</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-ink-muted" />Shop 5, 46 Walker St, Rhodes NSW 2138</li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-ink-muted" />02 9739 6000</li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-ink-muted" />rentals@cjintl.com.au</li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-2xl">Newington</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone size={14} className="text-ink-muted" />02 9737 8338</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="md:col-span-7">
        {sent ? (
          <div className="bg-moss/10 border border-moss/30 p-10">
            <Check className="text-moss mb-4" />
            <h2 className="display-md">Message sent.</h2>
            <p className="text-ink-muted mt-2">An agent will be in touch within the day. Watch the Slack Preview panel to see how your message was routed.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="eyebrow">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
            </div>
            <div>
              <label className="eyebrow">Email or mobile</label>
              <input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink" />
            </div>
            <div>
              <label className="eyebrow">Subject</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 text-lg focus:outline-none focus:border-ink">
                <option>General enquiry</option>
                <option>Buying</option>
                <option>Selling</option>
                <option>Leasing</option>
                <option>Property management</option>
                <option>Careers</option>
                <option>Media</option>
              </select>
            </div>
            <div>
              <label className="eyebrow">Message</label>
              <textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full mt-2 border-b border-ink/30 bg-transparent py-3 focus:outline-none focus:border-ink resize-none" />
            </div>
            <button type="submit" className="btn-primary">Send message</button>
          </form>
        )}
      </div>
    </div>
  );
}
