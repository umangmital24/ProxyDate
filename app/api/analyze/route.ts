import { NextResponse } from "next/server";
import { readInstagram, readLinkedIn } from "@/lib/apify";
import { analyzePerson } from "@/lib/gemini";

function validUrl(value: unknown, host: string) {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.includes(host);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { linkedin, instagram } = await request.json();

    if (!validUrl(linkedin, "linkedin.com") || !validUrl(instagram, "instagram.com")) {
      return NextResponse.json(
        { message: "Use one LinkedIn profile URL and one public Instagram profile URL." },
        { status: 400 }
      );
    }

    const [linkedinData, instagramData] = await Promise.all([
      readLinkedIn(linkedin),
      readInstagram(instagram)
    ]);

    const profile = await analyzePerson(linkedin, instagram, linkedinData, instagramData);

    return NextResponse.json({
      message: "Agent created for " + profile.name + ".",
      profile
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
