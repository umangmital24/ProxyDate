import { notFound } from "next/navigation";
import { getDate, getPerson } from "@/data/demo";

export default async function DatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const date = getDate(id);
  if (!date) notFound();
  const a = getPerson(date.personA)!;
  const b = getPerson(date.personB)!;

  return <main className="section">
    <div className="eyebrow">Dating Arena • {date.id}</div>
    <h2>{a.name}'s Agent × {b.name}'s Agent</h2>
    <p className="muted">The transcript is generated from each agent's grounded profile and evolving conversation state.</p>

    <div className="two">
      <div className="card date">
        {date.transcript.map((m, i) => {
          const mine = m.speakerId === a.id;
          return <div className={"msg " + (mine ? "" : "right")} key={i}>
            <strong>{mine ? a.name : b.name} Agent</strong>
            <div>{m.text}</div>
          </div>;
        })}
      </div>
      <div className="stack">
        <div className="card">
          <div className="muted">{a.name} → {b.name}</div><div className="score">{date.scoreAtoB}%</div>
          <div className="muted">{b.name} → {a.name}</div><div className="score">{date.scoreBtoA}%</div>
        </div>
        <div className="card"><h3>Why it works</h3>{date.strengths.map(x => <p key={x}>✓ {x}</p>)}</div>
        <div className="card"><h3>Possible friction</h3>{date.friction.map(x => <p key={x}>⚠ {x}</p>)}</div>
      </div>
    </div>
  </main>;
}
