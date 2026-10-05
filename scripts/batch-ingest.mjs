import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CANDIDATES_PATH = path.join(ROOT, "data", "candidates.json");
const OUT_DIR = path.join(ROOT, "data", "generated");
const PEOPLE_PATH = path.join(OUT_DIR, "people.json");
const FAILURES_PATH = path.join(OUT_DIR, "failures.json");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");
const RAW_DIR = path.join(OUT_DIR, "raw");

const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = Number(process.env.BATCH_LIMIT || 25);
const CONCURRENCY = Math.max(1, Number(process.env.BATCH_CONCURRENCY || 3));
const SAVE_RAW = String(process.env.SAVE_RAW_SOURCES || "false").toLowerCase() === "true";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(name + " is required.");
  return value;
}

function normalizeActorId(value) {
  return value.includes("/") ? value.replace("/", "~") : value;
}

function buildActorInput(key, url, extra = {}) {
  if (key === "startUrls") return { startUrls: [{ url }], ...extra };
  if (key === "directUrls") return { directUrls: [url], ...extra };
  if (key === "urls") return { urls: [url], ...extra };
  if (key === "usernames") {
    const username = new URL(url).pathname.split("/").filter(Boolean)[0];
    return { usernames: username ? [username] : [], ...extra };
  }
  return { [key]: [url], ...extra };
}

async function fetchJson(url, options = {}, retries = 2) {
  let last;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const body = await response.text();
        throw new Error("HTTP " + response.status + ": " + body.slice(0, 300));
      }
      return await response.json();
    } catch (error) {
      last = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }
  throw last;
}

async function runActor(actorId, input) {
  const token = required("APIFY_TOKEN");
  const actor = normalizeActorId(actorId);
  const runUrl =
    "https://api.apify.com/v2/acts/" +
    encodeURIComponent(actor) +
    "/runs?token=" +
    encodeURIComponent(token) +
    "&waitForFinish=180";

  const run = await fetchJson(runUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const status = run?.data?.status;
  if (status && !["SUCCEEDED", "RUNNING"].includes(status)) {
    throw new Error("Apify actor ended with status " + status);
  }

  const datasetId = run?.data?.defaultDatasetId;
  if (!datasetId) throw new Error("Apify actor returned no dataset ID.");

  const itemsUrl =
    "https://api.apify.com/v2/datasets/" +
    datasetId +
    "/items?token=" +
    encodeURIComponent(token) +
    "&clean=true";

  return await fetchJson(itemsUrl, {}, 2);
}

async function scrapeLinkedIn(url) {
  const actor = required("APIFY_LINKEDIN_ACTOR");
  const key = process.env.APIFY_LINKEDIN_INPUT_KEY || "profileUrls";
  const items = await runActor(actor, buildActorInput(key, url));
  if (!Array.isArray(items) || !items[0]) throw new Error("LinkedIn scraper returned no profile.");
  return items[0];
}

async function scrapeInstagram(url) {
  const actor = process.env.APIFY_INSTAGRAM_ACTOR || "apify/instagram-profile-scraper";
  const key = process.env.APIFY_INSTAGRAM_INPUT_KEY || "usernames";
  const items = await runActor(actor, buildActorInput(key, url, { resultsLimit: 12 }));
  if (!Array.isArray(items) || !items[0]) throw new Error("Instagram scraper returned no profile.");

  const item = items[0];
  const isPrivate =
    item.private === true ||
    item.isPrivate === true ||
    item.is_private === true;

  if (isPrivate) throw new Error("Instagram profile is private.");
  return item;
}

function compact(value, max = 16000) {
  const text = JSON.stringify(value);
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function validateProfile(profile) {
  if (!profile || typeof profile !== "object") throw new Error("Gemini returned invalid JSON.");
  if (!profile.name || !Array.isArray(profile.interests) || !Array.isArray(profile.relationshipSignals)) {
    throw new Error("Gemini profile is missing required fields.");
  }

  for (const group of [profile.interests, profile.relationshipSignals]) {
    for (const signal of group) {
      if (!["linkedin", "instagram"].includes(signal.source)) {
        throw new Error("Profile contains a non-approved evidence source.");
      }
    }
  }
  return profile;
}

async function analyze(candidate, linkedin, instagram) {
  const key = required("GEMINI_API_KEY");

  const prompt = [
    "You are ProxyDate's grounded profile analyzer.",
    "Use EXACTLY TWO information sources: the LinkedIn extraction and Instagram extraction below.",
    "Do not use outside knowledge, fame, web knowledge, or assumptions from the person's name.",
    "Do not infer sensitive traits such as religion, sexuality, politics, ethnicity, health, or medical status.",
    "Only infer a dating-relevant signal when there is concrete evidence in one of the two sources.",
    "Keep evidence short and auditable.",
    "",
    "Return ONLY JSON in this exact shape:",
    "{",
    '  "id": "provided candidate id",',
    '  "name": "person name from sources",',
    '  "headline": "short professional identity",',
    '  "location": "location only if explicitly supported, otherwise empty string",',
    '  "linkedinUrl": "provided LinkedIn URL",',
    '  "instagramUrl": "provided Instagram URL",',
    '  "bio": "2 sentence grounded synthesis",',
    '  "interests": [{"label":"string","confidence":0.0,"source":"linkedin|instagram","evidence":"short evidence"}],',
    '  "relationshipSignals": [{"label":"string","confidence":0.0,"source":"linkedin|instagram","evidence":"short evidence"}],',
    '  "conversationHooks": ["string"],',
    '  "sourceSummary": {"linkedin":"short summary","instagram":"short summary"}',
    "}",
    "",
    "CANDIDATE ID: " + candidate.id,
    "LINKEDIN URL: " + candidate.linkedinUrl,
    "INSTAGRAM URL: " + candidate.instagramUrl,
    "",
    "LINKEDIN EXTRACTION:",
    compact(linkedin),
    "",
    "INSTAGRAM EXTRACTION:",
    compact(instagram)
  ].join("\n");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    encodeURIComponent(key);

  const data = await fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.15
      }
    })
  });

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no profile text.");

  const profile = validateProfile(JSON.parse(text));
  profile.id = candidate.id;
  profile.linkedinUrl = candidate.linkedinUrl;
  profile.instagramUrl = candidate.instagramUrl;
  profile.generatedAt = new Date().toISOString();
  return profile;
}

async function ensureDirs() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  if (SAVE_RAW) await fs.mkdir(RAW_DIR, { recursive: true });
}

async function writeJson(file, value) {
  await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

async function checkpoint(people, failures, startedAt) {
  await ensureDirs();
  await Promise.all([
    writeJson(PEOPLE_PATH, people),
    writeJson(FAILURES_PATH, failures),
    writeJson(MANIFEST_PATH, {
      generatedAt: new Date().toISOString(),
      startedAt,
      requested: LIMIT,
      succeeded: people.length,
      failed: failures.length,
      allowedSources: ["linkedin", "instagram"],
      people: people.map((p) => ({
        id: p.id,
        name: p.name,
        linkedinUrl: p.linkedinUrl,
        instagramUrl: p.instagramUrl,
        generatedAt: p.generatedAt
      }))
    })
  ]);
}

async function processCandidate(candidate) {
  const started = Date.now();
  console.log("\n→ " + candidate.name);

  const [linkedin, instagram] = await Promise.all([
    scrapeLinkedIn(candidate.linkedinUrl),
    scrapeInstagram(candidate.instagramUrl)
  ]);

  if (SAVE_RAW) {
    await ensureDirs();
    await writeJson(path.join(RAW_DIR, candidate.id + ".json"), {
      linkedinUrl: candidate.linkedinUrl,
      instagramUrl: candidate.instagramUrl,
      linkedin,
      instagram
    });
  }

  const profile = await analyze(candidate, linkedin, instagram);
  console.log("✓ " + candidate.name + " (" + ((Date.now() - started) / 1000).toFixed(1) + "s)");
  return profile;
}

async function mapLimit(items, limit, worker) {
  const output = new Array(items.length);
  let next = 0;

  async function runner() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      output[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runner()));
  return output;
}

async function main() {
  const source = JSON.parse(await fs.readFile(CANDIDATES_PATH, "utf8"));
  const candidates = source.people.slice(0, LIMIT);

  if (candidates.length < 25 && !DRY_RUN) {
    throw new Error("Need at least 25 candidates for the challenge run.");
  }

  const invalid = candidates.filter(
    (p) =>
      !p.linkedinUrl?.startsWith("https://www.linkedin.com/") ||
      !p.instagramUrl?.startsWith("https://www.instagram.com/")
  );

  if (invalid.length) {
    throw new Error("Invalid candidate URLs: " + invalid.map((p) => p.id).join(", "));
  }

  console.log("ProxyDate batch ingestion");
  console.log("Candidates: " + candidates.length);
  console.log("Concurrency: " + CONCURRENCY);

  if (DRY_RUN) {
    console.log("\nDry run passed. Candidate file is structurally valid.");
    return;
  }

  required("APIFY_TOKEN");
  required("APIFY_LINKEDIN_ACTOR");
  required("GEMINI_API_KEY");

  const startedAt = new Date().toISOString();
  const people = [];
  const failures = [];

  await mapLimit(candidates, CONCURRENCY, async (candidate) => {
    try {
      const profile = await processCandidate(candidate);
      people.push(profile);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error("✗ " + candidate.name + ": " + reason);
      failures.push({
        id: candidate.id,
        name: candidate.name,
        linkedinUrl: candidate.linkedinUrl,
        instagramUrl: candidate.instagramUrl,
        reason
      });
    }

    await checkpoint(people, failures, startedAt);
  });

  people.sort((a, b) => a.name.localeCompare(b.name));
  failures.sort((a, b) => a.name.localeCompare(b.name));
  await checkpoint(people, failures, startedAt);

  console.log("\nDone.");
  console.log("Succeeded: " + people.length);
  console.log("Failed: " + failures.length);
  console.log("Profiles: data/generated/people.json");
  console.log("Failures: data/generated/failures.json");

  if (people.length < 25) {
    process.exitCode = 2;
    console.error("\nChallenge requirement not met yet: fewer than 25 successful profiles.");
  }
}

main().catch((error) => {
  console.error("\nBatch failed:", error);
  process.exitCode = 1;
});
