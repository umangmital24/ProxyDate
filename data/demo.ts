import { DateResult, Person } from "@/lib/types";

export const people: Person[] = [
  {
    id: "aisha",
    name: "Aisha",
    headline: "Product designer • Consumer apps",
    location: "Bengaluru",
    linkedinUrl: "https://www.linkedin.com/",
    instagramUrl: "https://www.instagram.com/",
    bio: "Creative, curious, and drawn to experiences that mix design, travel, and good conversations.",
    interests: [
      { label: "Design", confidence: 0.94, source: "linkedin", evidence: "Product design roles and portfolio-oriented work." },
      { label: "Travel", confidence: 0.91, source: "instagram", evidence: "Repeated public travel posts and destination captions." },
      { label: "Live music", confidence: 0.76, source: "instagram", evidence: "Concert and music-event posts." }
    ],
    relationshipSignals: [
      { label: "Shared experiences", confidence: 0.86, source: "instagram", evidence: "Social and travel-oriented posting pattern." },
      { label: "Ambition", confidence: 0.82, source: "linkedin", evidence: "Strong career progression and project ownership." }
    ],
    conversationHooks: ["travel", "design", "music", "city life"]
  },
  {
    id: "kabir",
    name: "Kabir",
    headline: "Software engineer • AI systems",
    location: "Gurugram",
    linkedinUrl: "https://www.linkedin.com/",
    instagramUrl: "https://www.instagram.com/",
    bio: "Builder energy, long rides, coffee, and a preference for spontaneous plans over perfectly optimized weekends.",
    interests: [
      { label: "AI", confidence: 0.96, source: "linkedin", evidence: "AI-focused engineering projects and role history." },
      { label: "Motorcycling", confidence: 0.93, source: "instagram", evidence: "Multiple public motorcycle and road-trip posts." },
      { label: "Travel", confidence: 0.84, source: "instagram", evidence: "Frequent travel imagery and captions." }
    ],
    relationshipSignals: [
      { label: "Curiosity", confidence: 0.88, source: "linkedin", evidence: "Broad project mix and technical experimentation." },
      { label: "Spontaneity", confidence: 0.78, source: "instagram", evidence: "Road-trip and last-minute outing content." }
    ],
    conversationHooks: ["AI", "motorcycles", "road trips", "coffee"]
  },
  {
    id: "meera",
    name: "Meera",
    headline: "Brand strategist • D2C",
    location: "Mumbai",
    linkedinUrl: "https://www.linkedin.com/",
    instagramUrl: "https://www.instagram.com/",
    bio: "Storytelling, books, café-hopping, and low-key weekends with occasional bursts of chaos.",
    interests: [
      { label: "Brand storytelling", confidence: 0.95, source: "linkedin", evidence: "Brand and campaign strategy experience." },
      { label: "Reading", confidence: 0.88, source: "instagram", evidence: "Repeated book posts and reading captions." },
      { label: "Cafés", confidence: 0.82, source: "instagram", evidence: "Frequent café and food posts." }
    ],
    relationshipSignals: [
      { label: "Thoughtful conversation", confidence: 0.87, source: "instagram", evidence: "Long-form reflective captions." },
      { label: "Creative ambition", confidence: 0.81, source: "linkedin", evidence: "Progressive ownership across brand roles." }
    ],
    conversationHooks: ["books", "branding", "cafés", "writing"]
  },
  {
    id: "arjun",
    name: "Arjun",
    headline: "Growth lead • Fintech",
    location: "Delhi",
    linkedinUrl: "https://www.linkedin.com/",
    instagramUrl: "https://www.instagram.com/",
    bio: "Competitive at work, social outside it, and almost always planning the next trek or game night.",
    interests: [
      { label: "Startups", confidence: 0.91, source: "linkedin", evidence: "Growth roles across early-stage companies." },
      { label: "Trekking", confidence: 0.89, source: "instagram", evidence: "Mountain and trekking posts." },
      { label: "Sports", confidence: 0.79, source: "instagram", evidence: "Recurring sports and game-night content." }
    ],
    relationshipSignals: [
      { label: "Social energy", confidence: 0.89, source: "instagram", evidence: "Frequent group-event posts." },
      { label: "Ambition", confidence: 0.9, source: "linkedin", evidence: "High-ownership growth roles." }
    ],
    conversationHooks: ["startups", "trekking", "sports", "growth"]
  }
];

export const dates: DateResult[] = [
  {
    id: "aisha-kabir",
    personA: "aisha",
    personB: "kabir",
    scoreAtoB: 91,
    scoreBtoA: 86,
    strengths: ["Strong travel overlap", "High curiosity", "Playful conversational rhythm"],
    friction: ["Different preference for planning vs spontaneity"],
    transcript: [
      { speakerId: "aisha", text: "Your profile makes it look like you're always either coding or riding somewhere. Which one wins on a free Saturday?" },
      { speakerId: "kabir", text: "Riding, easily. Coding only wins when I accidentally start fixing something at 11 PM." },
      { speakerId: "aisha", text: "Good answer. I travel a lot too, but I need at least a rough plan. Are you allergic to itineraries?" },
      { speakerId: "kabir", text: "Not allergic. I just like leaving one day completely unplanned. That's usually the best part." },
      { speakerId: "aisha", text: "Okay, one chaos day inside an otherwise respectable trip. I can work with that." }
    ]
  },
  {
    id: "aisha-arjun",
    personA: "aisha",
    personB: "arjun",
    scoreAtoB: 82,
    scoreBtoA: 88,
    strengths: ["Shared appetite for experiences", "Strong social energy", "Career ambition alignment"],
    friction: ["Arjun's pace may feel too high-energy"],
    transcript: [
      { speakerId: "arjun", text: "Would you pick a design exhibition or a sunrise trek?" },
      { speakerId: "aisha", text: "Exhibition if I had to choose, but you're clearly trying to drag me to a mountain." },
      { speakerId: "arjun", text: "Correct. I respect a person who notices the agenda." },
      { speakerId: "aisha", text: "I'll negotiate: trek first, good food after, no motivational sunrise speeches." }
    ]
  },
  {
    id: "kabir-meera",
    personA: "kabir",
    personB: "meera",
    scoreAtoB: 73,
    scoreBtoA: 78,
    strengths: ["Different but complementary interests", "Good question quality"],
    friction: ["Different social pace", "Limited shared hobbies"],
    transcript: [
      { speakerId: "meera", text: "You seem very outdoorsy. What does a quiet weekend look like for you?" },
      { speakerId: "kabir", text: "Honestly? Coffee, a game, maybe fixing something I didn't need to build." },
      { speakerId: "meera", text: "That is much calmer than your Instagram suggests." },
      { speakerId: "kabir", text: "Instagram doesn't document me staring at a terminal for six hours." }
    ]
  }
];

export function getPerson(id: string) {
  return people.find((p) => p.id === id);
}

export function getDate(id: string) {
  return dates.find((d) => d.id === id);
}
