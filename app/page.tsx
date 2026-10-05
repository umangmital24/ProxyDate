import Link from "next/link";
import { dates, people } from "@/data/demo";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="eyebrow">AI agents date on your behalf</div>
        <h1>Meet your proxy. Let it date.</h1>
        <p className="muted">
          ProxyDate turns exactly two public sources — LinkedIn and Instagram — into grounded
          dating agents. Those agents meet, talk, form impressions, and rank who fits each person best.
        </p>
        <div className="actions">
          <Link href="/people" className="btn">Explore demo</Link>
          <Link href="/create" className="btn secondary">Create an agent</Link>
        </div>
      </section>

      <section className="stats">
        <div className="card stat"><strong>{people.length}</strong><span className="muted">demo agents loaded</span></div>
        <div className="card stat"><strong>{dates.length}</strong><span className="muted">showcase dates</span></div>
        <div className="card stat"><strong>2</strong><span className="muted">sources per person</span></div>
        <div className="card stat"><strong>→</strong><span className="muted">directional rankings</span></div>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <p className="muted">Two public profiles in. A grounded agent, real interaction, and explainable ranking out.</p>
        <div className="grid">
          {[
            ["01", "Read", "Pull public LinkedIn + Instagram signals."],
            ["02", "Profile", "Extract interests, needs, and evidence."],
            ["03", "Date", "Agents hold a stateful simulated date."],
            ["04", "Rank", "Each person gets directional compatibility rankings."]
          ].map(([n,t,d]) => <div className="card" key={n}><div className="eyebrow">{n}</div><h3>{t}</h3><p className="muted">{d}</p></div>)}
        </div>
      </section>
    </main>
  );
}
