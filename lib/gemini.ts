import type { Person } from "@/lib/types";

function compact(value: unknown, max = 14000) {
  const valueText = JSON.stringify(value);
  return valueText.length > max ? valueText.slice(0, max) + "…" : valueText;
}

export async function analyzePerson(linkedinUrl: string, instagramUrl: string, linkedin: unknown, instagram: unknown): Promise<Person> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");

  const prompt = [
    "You are the profile-analysis component of ProxyDate.",
    "Use EXACTLY two sources: the supplied LinkedIn extraction and Instagram extraction.",
    "Do not use outside knowledge. Do not infer sensitive traits.",
    "Separate observations from inferences and ground every signal in evidence.",
    "",
    "Return ONLY valid JSON matching:",
    '{"id":"slug","name":"string","headline":"string","location":"string","linkedinUrl":"string","instagramUrl":"string","bio":"2 sentence grounded synthesis","interests":[{"label":"string","confidence":0.0,"source":"linkedin|instagram","evidence":"short evidence"}],"relationshipSignals":[{"label":"string","confidence":0.0,"source":"linkedin|instagram","evidence":"short evidence"}],"conversationHooks":["string"]}',
    "",
    "LinkedIn URL: " + linkedinUrl,
    "Instagram URL: " + instagramUrl,
    "",
    "LINKEDIN EXTRACTION:",
    compact(linkedin),
    "",
    "INSTAGRAM EXTRACTION:",
    compact(instagram)
  ].join("\n");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
      }),
      cache: "no-store"
    }
  );

  if (!response.ok) throw new Error("Gemini request failed: " + response.status);
  const data = await response.json();
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!output) throw new Error("Gemini returned no profile.");

  const parsed = JSON.parse(output) as Person;
  parsed.linkedinUrl = linkedinUrl;
  parsed.instagramUrl = instagramUrl;
  return parsed;
}
