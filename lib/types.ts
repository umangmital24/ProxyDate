export type Signal = {
  label: string;
  confidence: number;
  source: "linkedin" | "instagram";
  evidence: string;
};

export type Person = {
  id: string;
  name: string;
  headline: string;
  location?: string;
  linkedinUrl: string;
  instagramUrl: string;
  bio: string;
  interests: Signal[];
  relationshipSignals: Signal[];
  conversationHooks: string[];
};

export type DateMessage = {
  speakerId: string;
  text: string;
};

export type DateResult = {
  id: string;
  personA: string;
  personB: string;
  scoreAtoB: number;
  scoreBtoA: number;
  strengths: string[];
  friction: string[];
  transcript: DateMessage[];
};

export type RankingRow = {
  personId: string;
  score: number;
  dateId: string;
};
