import { people } from "@/data/demo";
import { getRankingsFor } from "@/lib/ranking";

export default function RankingsPage() {
  return <main className="section">
    <div className="eyebrow">Directional compatibility</div>
    <h2>Who fits each person best?</h2>
    <p className="muted">A → B can differ from B → A. Rankings reflect what each individual agent values.</p>
    <div className="grid">
      {people.map((p) => {
        const top = getRankingsFor(p.id).slice(0,3);
        return <div className="card" key={p.id}>
          <h3>{p.name}</h3>
          {top.map((r,i) => {
            const other = people.find(x=>x.id===r.personId)!;
            return <div className="ranking" key={r.personId}><span>#{i+1} {other.name}</span><strong>{r.score}%</strong></div>;
          })}
        </div>;
      })}
    </div>
  </main>;
}
