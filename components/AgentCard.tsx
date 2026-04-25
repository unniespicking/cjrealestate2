import Image from "next/image";
import Link from "next/link";
import { Agent } from "@/lib/data/agents";
import { Phone, Mail } from "lucide-react";

export function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] bg-stone overflow-hidden">
        <Image
          src={agent.photo}
          alt={agent.name}
          fill
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          sizes="(max-width:768px) 50vw, 25vw"
        />
        <div className="absolute top-3 right-3 flex gap-1">
          {agent.languages.map((l) => (
            <span
              key={l}
              className="bg-paper/90 backdrop-blur text-ink text-[10px] uppercase tracking-[0.14em] px-1.5 py-0.5"
            >
              {l === "ZH" ? "中" : l === "KO" ? "한" : l}
            </span>
          ))}
        </div>
      </div>
      <div className="pt-4">
        <h4 className="font-display text-xl leading-tight">{agent.name}</h4>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted mt-1">{agent.role}</p>
        {!compact && (
          <>
            <p className="text-sm text-ink-muted mt-3 leading-relaxed">{agent.bio}</p>
            <div className="flex flex-col gap-1.5 mt-4 text-sm">
              <a href={`tel:${agent.mobile.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-copper">
                <Phone size={13} /> {agent.mobile}
              </a>
              <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-copper">
                <Mail size={13} /> {agent.email}
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
