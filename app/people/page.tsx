import Link from "next/link";
import { people } from "@/data/demo";

export default function PeoplePage() {
  return <main className="section">
    <div className="eyebrow">Demo roster</div>
    <h2>People represented by agents</h2>
    <p className="muted">Sample data for UI development. Replace with the 25 verified real people before submission.</p>
    <div className="grid">
      {people.map((p) => (
        <Link className="card personCard" href={"/people/" + p.id} key={p.id}>
          <div className="personTop">
            <div><h3>{p.name}</h3><p className="muted">{p.headline}</p></div>
            <span>↗</span>
          </div>
          <p>{p.bio}</p>
          <div>{p.interests.slice(0,3).map((x) => <span className="tag" key={x.label}>{x.label}</span>)}</div>
        </Link>
      ))}
    </div>
  </main>;
}
