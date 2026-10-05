# ProxyDate

**Each person gets an AI proxy. The proxies date each other.**

ProxyDate reads exactly two public sources for a person — LinkedIn and Instagram — creates a grounded profile, lets that person's agent interact with other agents, and produces directional compatibility rankings.

## Current status

The repository contains a working frontend demo architecture with:

- landing/dashboard
- people roster
- evidence-grounded profile pages
- Dating Arena with actual agent conversation transcripts
- directional compatibility rankings
- live "Create Agent" form
- server-side Apify adapters
- Gemini structured profile analysis
- no database requirement for the challenge build

> The included names/data are development samples only. The final challenge demo must replace them with at least 25 verified real people, each with an official LinkedIn URL and public Instagram URL.

## Stack

- Next.js + TypeScript
- Apify for public LinkedIn / Instagram ingestion
- Gemini 2.5 Flash for grounded structured analysis
- static/precomputed data for the challenge demo
- Vercel-compatible deployment

## Environment

Copy .env.example to .env.local and fill in:

APIFY_TOKEN
GEMINI_API_KEY
APIFY_LINKEDIN_ACTOR
APIFY_INSTAGRAM_ACTOR

Never commit real credentials.

## Run locally

npm install
npm run dev

Then open http://localhost:3000

## Product flow

LinkedIn URL + Instagram URL -> Apify ingestion -> grounded profile -> dating agent -> agent-to-agent date -> directional ranking.

## Challenge build strategy

For 25 people there are 300 unique pairings.

The final demo data should contain:

- 25 real people
- 25 grounded agent profiles
- 300 pair interactions/evaluations
- 600 directional scores
- 25 ranking lists
- a handful of richer multi-turn dates for the 3-minute video

The demo dataset should be precomputed so the public demo loads instantly. The live website path remains real: a grader can paste new LinkedIn + Instagram links and trigger fresh ingestion/analysis.

## Grounding rules

- only LinkedIn + Instagram may be used as evidence
- public Instagram profiles only
- no outside web knowledge enters the agent context
- avoid sensitive-attribute inference
- inferred signals carry source, evidence, and confidence

## Next steps

1. Add Apify + Gemini credentials.
2. Run the batch ingestion and review any failed/incorrect identities.
3. Replace failed candidates until 25 profiles succeed.
4. Add batch generation for all pair evaluations.
5. Add persistent precomputed demo data.
6. Deploy to Vercel and record the 3-minute submission video.


## Batch ingestion

The challenge roster lives at `data/candidates.json`.

Validate the file without spending API credits:

```bash
npm run check:candidates
```

After creating `.env.local`, generate grounded profiles:

```bash
npm run batch:ingest
```

The batch job:

- processes up to `BATCH_LIMIT` candidates (default 25)
- runs with bounded concurrency (default 3)
- rejects Instagram profiles reported as private
- retries transient HTTP failures
- isolates failures so one person cannot kill the batch
- checkpoints after every candidate
- writes `data/generated/people.json`
- writes `data/generated/failures.json`
- writes `data/generated/manifest.json`
- optionally stores raw two-source snapshots when `SAVE_RAW_SOURCES=true`

If a selected LinkedIn actor expects a different input field, set `APIFY_LINKEDIN_INPUT_KEY` to values such as `profileUrls`, `urls`, `directUrls`, or `startUrls`.

A run is challenge-ready only when `people.json` contains at least 25 successful profiles and every Instagram source is public.


### Default Apify actors

The repository is preconfigured for:

- LinkedIn: `cryptosignals/linkedin-profile-scraper` with `profileUrls`
- Instagram: `apify/instagram-profile-scraper` with `usernames`

Both can be overridden through environment variables without code changes.
