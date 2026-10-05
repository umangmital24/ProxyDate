type ApifyResult = Record<string, unknown>;

function normalizeActorId(value: string) {
  return value.includes("/") ? value.replace("/", "~") : value;
}

function buildInput(key: string, url: string, extra: Record<string, unknown> = {}) {
  if (key === "startUrls") return { startUrls: [{ url }], ...extra };
  if (key === "directUrls") return { directUrls: [url], ...extra };
  if (key === "urls") return { urls: [url], ...extra };
  if (key === "usernames") {
    const username = new URL(url).pathname.split("/").filter(Boolean)[0];
    return { usernames: username ? [username] : [], ...extra };
  }
  return { [key]: [url], ...extra };
}

async function runActor(actorId: string, input: Record<string, unknown>) {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not configured.");
  if (!actorId) throw new Error("Apify actor ID is not configured.");

  const actor = normalizeActorId(actorId);
  const run = await fetch(
    "https://api.apify.com/v2/acts/" + encodeURIComponent(actor) + "/runs?token=" + encodeURIComponent(token) + "&waitForFinish=180",
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
  const key = process.env.APIFY_LINKEDIN_INPUT_KEY || "profileUrls";
  const result = await runActor(actor, buildInput(key, url));
  if (!result[0]) throw new Error("LinkedIn scraper returned no profile.");
  return result[0];
}

export async function readInstagram(url: string) {
  const actor = process.env.APIFY_INSTAGRAM_ACTOR || "apify/instagram-profile-scraper";
  const key = process.env.APIFY_INSTAGRAM_INPUT_KEY || "usernames";
  const result = await runActor(actor, buildInput(key, url, { resultsLimit: 12 }));
  const item = result[0];
  if (!item) throw new Error("Instagram scraper returned no profile.");

  const isPrivate =
    item.private === true ||
    item.isPrivate === true ||
    item.is_private === true;

  if (isPrivate) throw new Error("Instagram profile is private.");
  return item;
}
