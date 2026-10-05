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
2. Confirm the exact LinkedIn actor/input schema chosen for the challenge.
3. Replace development samples with 25 verified people.
4. Add batch generation for all pair evaluations.
5. Add persistent precomputed demo data.
6. Deploy to Vercel and record the 3-minute submission video.
