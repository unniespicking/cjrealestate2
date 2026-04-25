import { agents } from "@/lib/data/agents";
import { AgentCard } from "@/components/AgentCard";

export default function Team() {
  const rhodes = agents.filter((a) => a.office === "Rhodes");
  const newington = agents.filter((a) => a.office === "Newington");

  return (
    <div className="container-site py-12 md:py-20">
      <span className="eyebrow">The Team</span>
      <h1 className="display-lg mt-2 max-w-3xl">Eight people. Three languages. Two offices.</h1>
      <p className="text-ink-muted mt-5 max-w-2xl">
        Each agent has suburb-level specialisation rather than a generalist patch. That means they
        know the body corporate, the difficult owner, and the view line from the 8th floor onwards.
      </p>

      <div className="mt-16">
        <div className="flex items-baseline gap-4 mb-8">
          <h2 className="display-md">Rhodes</h2>
          <span className="text-ink-muted">Shop 5, 46 Walker St · 02 9739 6000</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {rhodes.map((a) => <AgentCard key={a.slug} agent={a} />)}
        </div>
      </div>

      <div className="mt-20">
        <div className="flex items-baseline gap-4 mb-8">
          <h2 className="display-md">Newington</h2>
          <span className="text-ink-muted">02 9737 8338</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {newington.map((a) => <AgentCard key={a.slug} agent={a} />)}
        </div>
      </div>
    </div>
  );
}
