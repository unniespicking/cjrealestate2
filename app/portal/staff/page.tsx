"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { agents, Agent } from "@/lib/data/agents";
import { properties as seed } from "@/lib/data/properties";
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  Home,
  MessageSquare,
  FileSignature,
  Search,
  Bell,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from "lucide-react";
import clsx from "clsx";

const forSale = seed.filter((p) => p.action === "sale");
const forLease = seed.filter((p) => p.action === "lease");

const leads = [
  { id: 1, name: "S. Park", language: "KO", suburb: "Rhodes", intent: "Sell", source: "Instant Appraisal", time: "12m ago", priority: "high" },
  { id: 2, name: "Chen Wei", language: "ZH", suburb: "Meadowbank", intent: "Buy", source: "AI chatbot", time: "42m ago", priority: "high" },
  { id: 3, name: "Mark Jensen", language: "EN", suburb: "Rhodes", intent: "Inspection", source: "Property page", time: "1h ago", priority: "med" },
  { id: 4, name: "Li Hong", language: "ZH", suburb: "Wentworth Point", intent: "Lease", source: "Apply form", time: "2h ago", priority: "med" },
  { id: 5, name: "Anna Thompson", language: "EN", suburb: "Liberty Grove", intent: "Buy", source: "AI chatbot", time: "3h ago", priority: "low" },
];

const inspections = [
  { time: "10:00", property: forSale[0], rsvps: 3 },
  { time: "11:30", property: forSale[2], rsvps: 5 },
  { time: "13:00", property: forSale[4], rsvps: 2 },
  { time: "17:30", property: forLease[0], rsvps: 4 },
];

const messages = [
  { from: "John K.", last: "Will the balcony fit a 6-person dining table?", ago: "3m", channel: "Jin chatbot" },
  { from: "Jenny L.", last: "Can we bring our accountant to the inspection?", ago: "17m", channel: "SMS" },
  { from: "Peter S.", last: "Following up on our appraisal from Tuesday…", ago: "1h", channel: "Email" },
];

const contracts = [
  { address: "Apt 802 / 8 Footbridge Boulevard", vendor: "J. Lee", status: "Signed", color: "moss" },
  { address: "14 Bayview Grove", vendor: "Wong Family", status: "Awaiting signature", color: "copper" },
  { address: "Apt 1204 / 46 Walker St", vendor: "S. Park", status: "Draft", color: "ink-muted" },
];

export default function StaffDashboard() {
  const [section, setSection] = useState("dashboard");
  const [me, setMe] = useState<Agent | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.staff) {
          const fullAgent = agents.find((a) => a.slug === d.staff.slug) ?? null;
          setMe(fullAgent);
        }
      });
  }, []);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/portal/login");
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] -mt-px">
      {/* Sidebar */}
      <aside className="w-56 bg-ink text-paper/80 py-6 flex flex-col">
        <div className="px-6 pb-6 border-b border-paper/10">
          <div className="text-xs uppercase tracking-[0.18em] text-paper/50">Staff Portal</div>
          <div className="font-display text-2xl text-paper mt-1">CJ</div>
        </div>
        <nav className="flex-1 py-4">
          {[
            { k: "dashboard", l: "Dashboard", i: LayoutDashboard },
            { k: "leads", l: "Leads", i: Inbox, badge: 5 },
            { k: "inspections", l: "Inspections", i: Calendar, badge: 4 },
            { k: "messages", l: "Messages", i: MessageSquare, badge: 3 },
            { k: "contracts", l: "Contracts", i: FileSignature },
          ].map((item) => (
            <button
              key={item.k}
              onClick={() => setSection(item.k)}
              className={clsx(
                "w-full flex items-center gap-3 px-6 py-2.5 text-sm transition",
                section === item.k ? "bg-copper text-paper" : "hover:bg-paper/5 hover:text-paper"
              )}
            >
              <item.i size={16} />
              <span className="flex-1 text-left">{item.l}</span>
              {item.badge && (
                <span className="bg-paper/15 text-paper text-[10px] px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <Link
            href="/portal/staff/listings"
            className="w-full flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-paper/5 hover:text-paper transition"
          >
            <Home size={16} />
            <span className="flex-1 text-left">Listings CMS</span>
            <span className="text-[9px] uppercase tracking-wider text-copper">CSV</span>
          </Link>
          <Link
            href="/portal/staff/conversations"
            className="w-full flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-paper/5 hover:text-paper transition"
          >
            <MessageSquare size={16} />
            <span className="flex-1 text-left">AI Conversations</span>
            <span className="text-[9px] uppercase tracking-wider text-copper">CSV</span>
          </Link>
        </nav>
        <div className="px-6 pt-4 border-t border-paper/10">
          {me && (
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-stone overflow-hidden shrink-0">
                <Image src={me.photo} alt={me.name} fill className="object-cover" sizes="40px" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-paper truncate">{me.name}</p>
                <p className="text-[10px] text-paper/50 truncate">{me.role}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 mt-4 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">← Back to site</Link>
            <button onClick={onLogout} className="flex items-center gap-1 hover:text-copper">
              <LogOut size={12} /> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 bg-paper-warm/30 min-w-0">
        <header className="bg-paper border-b border-ink/10 px-8 py-4 flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input placeholder="Search leads, listings, contracts…" className="w-full pl-9 pr-3 py-2 bg-paper-warm text-sm focus:outline-none" />
          </div>
          <button className="relative p-2 text-ink-muted hover:text-ink">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-copper rounded-full" />
          </button>
          <span className="text-xs text-ink-subtle hidden md:block">Demo mode · mocked data</span>
        </header>

        {section === "dashboard" && <DashboardView name={me?.name?.split(" ")[0] ?? ""} />}
        {section === "leads" && <LeadsView />}
        {section === "listings" && <ListingsView />}
        {section === "inspections" && <InspectionsView />}
        {section === "messages" && <MessagesView />}
        {section === "contracts" && <ContractsView />}
      </div>
    </div>
  );
}

function DashboardView({ name }: { name: string }) {
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="text-sm text-ink-muted">{today}</p>
        <h1 className="display-md mt-1">Good morning{name ? `, ${name}` : ""}.</h1>
        <p className="text-ink-muted mt-1">You have 5 unclaimed leads and 4 inspections today.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Metric label="New leads" value="5" delta="+3 today" />
        <Metric label="Active listings" value="12" delta="2 under offer" />
        <Metric label="Inspections today" value="4" delta="14 RSVPs" />
        <Metric label="Contracts pending" value="3" delta="1 awaiting signature" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leads */}
        <div className="lg:col-span-2 bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl">Leads — last 4 hours</h2>
              <p className="text-xs text-ink-muted mt-0.5">Routed by suburb + language</p>
            </div>
            <button className="text-xs link-underline">View all</button>
          </div>
          <div className="divide-y divide-ink/5">
            {leads.map((l) => (
              <LeadRow key={l.id} lead={l} />
            ))}
          </div>
        </div>

        {/* Inspections */}
        <div className="bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10">
            <h2 className="font-display text-xl">Today's inspections</h2>
            <p className="text-xs text-ink-muted mt-0.5">Updated 2 min ago</p>
          </div>
          <div className="divide-y divide-ink/5">
            {inspections.map((i, idx) => (
              <div key={idx} className="p-4 flex gap-3">
                <div className="w-14 shrink-0">
                  <div className="font-display text-xl">{i.time}</div>
                  <div className="text-[10px] text-ink-muted uppercase tracking-wider">{i.rsvps} RSVPs</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{i.property.address}</p>
                  <p className="text-xs text-ink-muted">{i.property.suburb}</p>
                </div>
                <ChevronRight size={16} className="text-ink-muted mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10">
            <h2 className="font-display text-xl">Recent messages</h2>
            <p className="text-xs text-ink-muted mt-0.5">Chatbot, SMS, email — unified</p>
          </div>
          <div className="divide-y divide-ink/5">
            {messages.map((m, idx) => (
              <div key={idx} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-copper/20 text-copper-deep rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {m.from.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{m.from}</p>
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider">{m.channel}</span>
                  </div>
                  <p className="text-xs text-ink-muted truncate mt-0.5">{m.last}</p>
                </div>
                <span className="text-xs text-ink-muted shrink-0">{m.ago}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-paper border border-ink/10">
          <div className="p-5 border-b border-ink/10">
            <h2 className="font-display text-xl">Contracts in flight</h2>
            <p className="text-xs text-ink-muted mt-0.5">DocuSign status</p>
          </div>
          <div className="divide-y divide-ink/5">
            {contracts.map((c, idx) => (
              <div key={idx} className="p-4 flex items-start gap-3">
                <FileSignature size={16} className="text-ink-muted mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.address}</p>
                  <p className="text-xs text-ink-muted">{c.vendor}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider ${c.color === "moss" ? "text-moss" : c.color === "copper" ? "text-copper" : "text-ink-muted"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadRow({ lead }: { lead: typeof leads[number] }) {
  const priority = lead.priority === "high" ? "bg-copper" : lead.priority === "med" ? "bg-moss" : "bg-stone";
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-paper-warm transition cursor-pointer">
      <div className={`w-1.5 h-10 ${priority} rounded-full`} />
      <div className="w-8 h-8 bg-stone rounded-full flex items-center justify-center text-xs font-bold shrink-0">
        {lead.name.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{lead.name}</p>
          <span className="bg-ink/5 text-ink-muted text-[10px] uppercase tracking-wider px-1.5 py-0.5">
            {lead.language === "ZH" ? "中" : lead.language === "KO" ? "한" : "EN"}
          </span>
        </div>
        <p className="text-xs text-ink-muted">
          {lead.intent} · {lead.suburb} · via {lead.source}
        </p>
      </div>
      <span className="text-xs text-ink-muted">{lead.time}</span>
      <button className="btn-primary !py-1.5 !px-3 text-[11px]">Claim</button>
    </div>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="bg-paper border border-ink/10 p-5">
      <div className="eyebrow">{label}</div>
      <div className="font-display text-4xl mt-2">{value}</div>
      <div className="text-xs text-ink-muted mt-1">{delta}</div>
    </div>
  );
}

function LeadsView() {
  return (
    <div className="p-8">
      <h1 className="display-md mb-6">Leads</h1>
      <div className="bg-paper border border-ink/10 divide-y divide-ink/5">
        {leads.map((l) => <LeadRow key={l.id} lead={l} />)}
      </div>
    </div>
  );
}

function ListingsView() {
  return (
    <div className="p-8">
      <h1 className="display-md mb-6">My listings</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {[...forSale.slice(0, 4), ...forLease.slice(0, 2)].map((p) => (
          <div key={p.id} className="bg-paper border border-ink/10 p-4 flex gap-4">
            <div className="relative w-28 h-20 bg-stone shrink-0">
              <Image src={p.photos[0]} alt="" fill className="object-cover" sizes="112px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-ink-muted">{p.action === "sale" ? "For Sale" : "For Lease"} · {p.suburb}</p>
              <p className="text-sm font-medium truncate mt-1">{p.address}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-ink-muted">
                <span>👁 {Math.round(Math.random() * 500) + 100} views</span>
                <span>💬 {Math.round(Math.random() * 20) + 2} enquiries</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InspectionsView() {
  return (
    <div className="p-8">
      <h1 className="display-md mb-6">Inspections — this week</h1>
      <div className="space-y-3">
        {inspections.map((i, idx) => (
          <div key={idx} className="bg-paper border border-ink/10 p-5 flex items-center gap-6">
            <div className="w-20">
              <div className="font-display text-3xl">{i.time}</div>
              <div className="text-xs text-ink-muted">Today</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{i.property.address}</p>
              <p className="text-sm text-ink-muted">{i.property.suburb} · {i.rsvps} RSVPs</p>
            </div>
            <button className="btn-ghost !py-2 !px-4 text-xs">View attendees</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesView() {
  return (
    <div className="p-8">
      <h1 className="display-md mb-6">Messages</h1>
      <div className="bg-paper border border-ink/10 divide-y divide-ink/5">
        {messages.map((m, idx) => (
          <div key={idx} className="p-5 flex items-start gap-4 hover:bg-paper-warm cursor-pointer">
            <div className="w-10 h-10 bg-copper/15 text-copper-deep rounded-full flex items-center justify-center font-semibold shrink-0">
              {m.from.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">{m.from}</p>
                <span className="chip">{m.channel}</span>
              </div>
              <p className="text-sm text-ink-muted mt-1">{m.last}</p>
            </div>
            <span className="text-xs text-ink-muted shrink-0">{m.ago}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContractsView() {
  return (
    <div className="p-8">
      <h1 className="display-md mb-6">Contracts</h1>
      <div className="bg-paper border border-ink/10 divide-y divide-ink/5">
        {contracts.map((c, idx) => {
          const Icon = c.status === "Signed" ? CheckCircle2 : c.status === "Draft" ? Clock : AlertCircle;
          const color = c.status === "Signed" ? "text-moss" : c.status === "Draft" ? "text-ink-muted" : "text-copper";
          return (
            <div key={idx} className="p-5 flex items-center gap-4">
              <Icon size={20} className={color} />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{c.address}</p>
                <p className="text-sm text-ink-muted">{c.vendor}</p>
              </div>
              <span className={`text-xs uppercase tracking-wider ${color}`}>{c.status}</span>
              <button className="text-xs link-underline">Open in DocuSign</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
