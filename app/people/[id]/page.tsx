import Link from "next/link";
import { notFound } from "next/navigation";
import { getPerson } from "@/data/demo";
import { getRankingsFor } from "@/lib/ranking";
import { getPerson as lookupPerson } from "@/data/demo";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = getPerson(id);
  if (!person) notFound();
  const rankings = getRankingsFor(id);

  return <main className="section">
    <div className="eyebrow">Agent profile</div>
    <h2>{person.name}</h2>
    <p className="muted">{person.headline} {person.location ? "• " + person.location : ""}</p>

    <div className="two">
      <div className="stack">
        <div className="card">
          <h3>Agent read</h3>
          <p>{person.bio}</p>
          <div>{person.conversationHooks.map((h) => <span className="tag" key={h}>{h}</span>)}</div>
        </div>

        <div className="card">
          <h3>Interests with evidence</h3>
          <div className="stack">
            {person.interests.map((s) => <div className="source" key={s.label}>
              <strong>{s.label} · {Math.round(s.confidence*100)}%</strong>
              <div className="muted">{s.source.toUpperCase()} — {s.evidence}</div>
            </div>)}
          </div>
        </div>

        <div className="card">
          <h3>Relationship signals</h3>
          <div className="stack">
            {person.relationshipSignals.map((s) => <div className="source" key={s.label}>
              <strong>{s.label} · {Math.round(s.confidence*100)}%</strong>
              <div className="muted">{s.source.toUpperCase()} — {s.evidence}</div>
            </div>)}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Best fits</h3>
        {rankings.map((r, i) => {
          const other = lookupPerson(r.personId);
          return <div className="ranking" key={r.personId}>
            <div><strong>#{i+1} {other?.name}</strong><div className="muted">{other?.headline}</div></div>
            <div style={{textAlign:"right"}}><div className="score">{r.score}%</div>{r.dateId && <Link className="muted" href={"/dates/"+r.dateId}>Watch date →</Link>}</div>
          </div>;
        })}
      </div>
    </div>
  </main>;
}
