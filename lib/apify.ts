type ApifyResult = Record<string, unknown>;

async function runActor(actorId: string, input: Record<string, unknown>) {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not configured.");
  if (!actorId) throw new Error("Apify actor ID is not configured.");

  const run = await fetch(
    "https://api.apify.com/v2/acts/" + encodeURIComponent(actorId) + "/runs?token=" + encodeURIComponent(token) + "&waitForFinish=120",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store"
    }
  );

  if (!run.ok) throw new Error("Apify actor failed to start: " + run.status);
  const runJson = await run.json();
  const datasetId = runJson?.data?.defaultDatasetId;
  if (!datasetId) throw new Error("Apify run returned no dataset.");

  const data = await fetch(
    "https://api.apify.com/v2/datasets/" + datasetId + "/items?token=" + encodeURIComponent(token) + "&clean=true",
    { cache: "no-store" }
  );
  if (!data.ok) throw new Error("Apify dataset fetch failed: " + data.status);

  return (await data.json()) as ApifyResult[];
}

export async function readLinkedIn(url: string) {
  const actor = process.env.APIFY_LINKEDIN_ACTOR || "";
  const result = await runActor(actor, { profileUrls: [url], urls: [url] });
  return result[0] ?? null;
}

export async function readInstagram(url: string) {
  const actor = process.env.APIFY_INSTAGRAM_ACTOR || "apify/instagram-profile-scraper";
  const username = new URL(url).pathname.split("/").filter(Boolean)[0];
  const result = await runActor(actor, {
    usernames: username ? [username] : [],
    directUrls: [url],
    resultsLimit: 12
  });
  return result[0] ?? null;
}
