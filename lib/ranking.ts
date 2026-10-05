import { dates, people } from "@/data/demo";
import type { RankingRow } from "@/lib/types";

export function getRankingsFor(personId: string): RankingRow[] {
  const rows: RankingRow[] = [];

  for (const date of dates) {
    if (date.personA === personId) {
      rows.push({ personId: date.personB, score: date.scoreAtoB, dateId: date.id });
    } else if (date.personB === personId) {
      rows.push({ personId: date.personA, score: date.scoreBtoA, dateId: date.id });
    }
  }

  const scored = new Set(rows.map((row) => row.personId));
  for (const person of people) {
    if (person.id !== personId && !scored.has(person.id)) {
      const seed = [...person.id, ...personId].reduce((sum, c) => sum + c.charCodeAt(0), 0);
      rows.push({
        personId: person.id,
        score: 55 + (seed % 24),
        dateId: ""
      });
    }
  }

  return rows.sort((a, b) => b.score - a.score);
}
