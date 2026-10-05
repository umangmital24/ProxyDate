import Link from "next/link";
import { dates, getPerson } from "@/data/demo";

export default function ArenaPage() {
  return <main className="section">
    <div className="eyebrow">Dating Arena</div>
    <h2>Watch the agents date</h2>
    <p className="muted">Open a pair to inspect the actual conversation and directional compatibility.</p>
    <div className="grid">
      {dates.map((d) => {
        const a = getPerson(d.personA)!;
        const b = getPerson(d.personB)!;
        return <Link className="card" href={"/dates/"+d.id} key={d.id}>
          <h3>{a.name} × {b.name}</h3>
          <p className="muted">{d.strengths[0]}</p>
          <div className="score">{d.scoreAtoB}% / {d.scoreBtoA}%</div>
          <span className="muted">Watch date →</span>
        </Link>;
      })}
    </div>
  </main>;
}
