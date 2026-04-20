# ApplyNow — Product Requirements Document (v0.1)

> **Status:** Draft for founder review · **Owner:** Ibraaheem · **Date:** 2026-04-20

---

## Context

You have a working React 19 + Express app ("ApplyNow") that already does most of what career-ops does — but with a GUI. Career-ops is a 37k-star CLI that proves the concept works, but it's dev-only, free, and requires Claude Code. The opportunity is to package the same intelligence for people who don't live in a terminal, charge for it, and make it fun enough to recommend.

This PRD defines **what ApplyNow should become** to be a commercial product people actually buy — not a portfolio project.

---

## 1. Executive Summary

**ApplyNow is the fastest way to go from a job description to a submitted, tailored application — in two minutes, not two hours.**

We target ambitious tech/AI job seekers and students who treat job search like a system. The product pastes a JD → scores fit A-F → flags ghost jobs → auto-tailors your CV → generates an ATS-ready PDF → logs it to a tracker. It turns every interview into a reusable STAR+R story that compounds across applications.

- **Model:** Freemium web app. Free for students and light users. Pro at $18/mo BYOK, or $39/mo with managed AI.
- **MVP target:** 6-8 weeks from the current codebase.
- **North-star metric:** applications submitted per active user per week.

---

## 2. Positioning

**For** ambitious tech/AI job seekers and students running 20+ pipelines a week
**Who** waste hours per application on manual tailoring and get ghosted by fake listings
**ApplyNow** collapses the apply → evaluate → interview loop into a two-minute pipeline
**Unlike** LinkedIn (passive), ChatGPT (generic), Teal/Huntr (just trackers), or career-ops (CLI-only)
**We** make every application smarter than the last — your CV, cover letter, and interview answers get sharper with every job you touch.

**Tagline candidates:** "Apply smarter, not harder." · "Two minutes from JD to PDF." · "Your job search, on rails."

---

## 3. Product Principles

1. **Speed is the feature.** Every flow is measured in seconds. If it adds friction without adding judgment, cut it.
2. **The AI recommends; the human decides.** No auto-submit. No black-box rankings. Always show reasoning.
3. **BYOK by default, managed AI by demand.** Power users control cost and privacy. Everyone else can upgrade.
4. **Compounding beats completeness.** Features that get better the more you use them (story bank, tracker, CV variants) beat one-shot tools.
5. **Fun is a retention feature.** Tasteful streaks, satisfying animations, a name that makes people smile. Never kitsch.

---

## 4. Target Users

### Primary — "The Systematic Applicant" (Maya, 27, Senior PM)
Applies to 5-10 roles/week at AI companies. Currently juggling a Notion tracker, ChatGPT tabs, and a Google Doc CV template. Pays $18/mo without blinking if it saves her 5 hours a week.
**JTBD:** "Help me figure out which jobs are worth my time and submit faster than my competition."

### Secondary — "The Hungry Student" (Arjun, 21, CS senior)
Applying to new grad tech roles. Has $0 budget but an unlimited Anthropic trial credit. Will evangelise on his campus Discord if the free tier is generous.
**JTBD:** "Help me look like a senior candidate without a senior's resume."

---

## 5. Core Wedges

### Wedge 1 — The 2-Minute Apply (hero, already 80% built)
Paste a JD → A-F fit score, tailored CV PDF, cover letter, saved to tracker. One click. This is the reason to buy.

### Wedge 2 — Ghost-Job Detection (viral hook)
Claude flags "legitimacy: suspicious" on listings that look like pipeline-building or fake posts. No competitor surfaces this. It's the feature that gets screenshot-shared on LinkedIn.

### Wedge 3 — Compounding Interview Prep (retention)
STAR+R story bank grows with every application. AI generates interview questions per role, reuses stories, tracks which stories landed offers. Gets stickier every week.

---

## 6. Feature Scope

### MVP (ship in 6-8 weeks)

| Feature | Status | Notes |
|---|---|---|
| Auto Pipeline (JD → eval → CV → PDF) | **80% done** | Harden Playwright PDF render |
| Ghost-job detection | **done** | Elevate in UI, add marketing page |
| Application Tracker + status workflow | **done** | Add bulk actions, CSV export |
| CV Builder + live preview | **done** | Add DOCX export |
| Cover letter generation | **new** | Reuse eval context, 1 day of work |
| Dashboard with KPIs | **done** | Add weekly-goal widget |
| Cloud account + sync | **new, critical** | Supabase auth + Postgres; blocks all paid features |
| BYOK Anthropic key flow | **done** | Move from `.env` to encrypted per-user setting |
| Pricing page + Stripe checkout | **new** | Free / Pro / Pro+Managed tiers |
| Onboarding flow | **new** | 60-second first-apply moment |

### V2 (month 4-5)

- Interview Prep with STAR+R bank (lite version in MVP, depth in V2)
- Portal Scanner productized — user-initiated URL import, not auto-scraping (see Risk 4)
- Managed AI tier (we proxy Claude, meter usage)
- Negotiation scripts + comp research (career-ops parity)
- Gamification: streaks, weekly apply goals, satisfying "submitted" animation
- Chrome extension: one-click import from any job board

### Later

- Teams / shared story banks / referral networks
- LinkedIn outreach templates
- Archetype detection + 6-block evaluation depth parity with career-ops
- Mobile app (read-only tracker + interview prep)
- Recruiter-side product (inverse marketplace)

### Explicitly cut from MVP

- Portal Scanner (ToS risk, fragile, defer)
- Managed AI (infra distraction at launch)
- Gamification (premature before retention data)

---

## 7. User Journeys

### J1 — First-time apply (activation)
Sign up → paste JD → paste/upload CV → pick tone → **see A-F score + ghost flag + 3 gaps** → click "Tailor & Export" → download PDF. **Target: under 2 minutes, 90%+ completion.**

### J2 — Returning daily triage
Dashboard → "3 new jobs match your profile" → triage each (save/skip) → batch eval → apply to top 2. **Target: under 10 minutes for 10 jobs.**

### J3 — Interview day
Open role in tracker → "Prep for interview" → AI generates 8 likely questions → user drafts STAR+R answers → saved to story bank, tagged, reusable. **Target: under 20 minutes.**

---

## 8. Success Metrics

- **North star:** applications submitted per active user per week (target: 5+)
- **Activation:** % of signups who complete J1 within 24h (target: 60%)
- **Retention:** W4 retention of signups (target: 35%)
- **Conversion:** free → Pro within 14 days (target: 8%)
- **Quality:** self-reported interview rate (target: 15%+ vs industry ~5%)

Vanity metrics to ignore: signups, page views, "CVs generated".

---

## 9. Pricing

| Tier | Price | Limits | Who it's for |
|---|---|---|---|
| **Free** | $0 | 5 pipeline runs/mo · 1 CV · BYOK only · local + cloud sync · ghost flags | Students, curious users |
| **Pro** | $18/mo · $144/yr | Unlimited pipelines (BYOK) · unlimited CVs + cover letters · interview prep bank · priority PDF · DOCX/JSON export | Active job seekers |
| **Pro + Managed AI** | $39/mo · $312/yr | Everything in Pro · no API key · 200 runs/mo included · overage at cost+20% | Non-technical buyers |
| **Students** | Free Pro for 1 yr | .edu verification required | Top-of-funnel, brand love |

**Upgrade triggers:** run #6 this month, second CV, first cover letter, enabling cloud sync, exporting to DOCX.

---

## 10. Technical Architecture

### Stays the same
React 19 + Vite + Tailwind · Express + TypeScript · Zustand · Anthropic SDK · Playwright for PDFs.

### Must change for MVP
- **Storage:** Zustand + localStorage → Zustand + Supabase (Postgres, auth, RLS). All stores migrate to sync on login.
- **API key:** `.env` file → encrypted per-user row in `user_settings` table.
- **PDF render:** move Playwright to a dedicated render worker (Browserless.io or Railway container). Cache fonts and templates server-side, not from `career-ops` sibling dir.
- **Billing:** Stripe checkout + webhook → `subscription_status` on user row.
- **Hosting:** Vercel (frontend) + Railway/Fly (backend + render worker).

### Cost model (Managed AI tier)
A full pipeline run ≈ $0.12-0.28 in Claude tokens. At 200 runs/mo × $0.20 = $40 COGS on a $39 plan — **margin-negative without caching**. Mandatory: prompt caching on system prompts, Haiku for classification steps, Sonnet for tailoring only, hard monthly cap.

---

## 11. Top 5 Risks

1. **BYOK friction kills non-dev conversion** → Ship Managed AI tier by V2 with free credits; make BYOK the power path, not the default.
2. **Playwright PDF at scale is fragile** → Dedicated render worker pre-launch. Never run headless Chrome in serverless.
3. **career-ops is free and dominant in dev circles** → Don't compete on depth. Position as "career-ops for everyone else" — speed, UX, no CLI.
4. **Greenhouse/Ashby ToS on scanning** → Cut auto-scanning from MVP. Replace with user-pasted URLs and a Chrome extension in V2.
5. **AI cost margin compression** → Aggressive prompt caching, Haiku for cheap steps, hard tier caps, BYOK as release valve.

---

## 12. Go-to-Market (first 1,000 users)

- **Launch channels:** Product Hunt, Hacker News (Show HN), r/cscareerquestions, r/cscareerquestionsEU, r/AIApplications, tech Twitter, TikTok ("I applied to 20 jobs in 20 minutes"), university Discord/Slack ambassador program (free Pro for .edu).
- **Content wedge:** "The Ghost Job Report" — monthly post naming companies with the highest suspicious-listing rate. Built-in virality.
- **Launch offer:** Founders plan — $99/yr Pro for life, first 500 users.
- **Demo loop:** 30-second landing page video of J1 end-to-end.

---

## 13. Naming

**Keep "ApplyNow" — conditionally.** Clear, verb-forward, memorable. Check `.com` and USPTO within two weeks.

**Backups if blocked:**
- **Pipeline** — owns the core metaphor, one-word, confident.
- **Loopwork** — nods to the compounding interview loop, distinctive, domain likely available.

Don't get precious. Decide by end of week 2.

---

## 14. Roadmap

| Week | Milestone |
|---|---|
| 1 | Supabase auth + schema migration + Stripe skeleton |
| 2 | BYOK per-user storage · PDF render worker · cover letter endpoint |
| 3 | Onboarding flow · pricing page · landing page v1 |
| 4 | Beta invite (50 users from network) · instrument metrics |
| 5-6 | Fix the top 5 activation drop-offs from beta |
| 7 | Public launch (Product Hunt + HN) |
| 8 | First paying cohort · weekly metric review cadence |
| Month 4-5 | V2: Interview Prep depth, Managed AI, Chrome extension, portal import |

---

## 15. Open Questions (founder must decide)

1. **Managed AI at launch or V2?** Determines whether Maya-or-Arjun is the primary launch persona.
2. **Supabase or self-hosted Postgres?** Speed vs. control — Supabase wins for MVP.
3. **Is Portal Scanner a differentiator or a liability?** Needs a legal view before it's promoted.
4. **Founders plan at $99/yr lifetime — too cheap or smart acquisition?** Revenue tradeoff vs. social proof.
5. **Who owns growth?** Product can ship perfectly and still die without a GTM owner. Decide before hiring eng #1.

---

## Critical Files to Modify

- `package.json` — add `@supabase/supabase-js`, `stripe`, remove `career-ops` sibling assumptions
- `server/routes/pdf.ts` — decouple from `career-ops/fonts`, inline/cache fonts server-side
- `server/routes/settings.ts` — move API key from `.env` to per-user encrypted row
- `src/store/*.ts` — migrate Zustand persistence from localStorage to Supabase sync
- `src/pages/Evaluate.tsx` — add cover letter output alongside tailored CV
- `src/App.tsx` — add auth guard, onboarding router, pricing page
- `README.md` — replace Vite template with real product README

---

## Verification

- **E2E:** run `npm run dev`, complete J1 with a real JD, confirm PDF opens in Preview.app and passes a sample ATS parser (Jobscan free scan).
- **Load:** 10 concurrent pipeline runs against render worker, <30s p95.
- **Auth:** sign up, log out, log in on second browser, confirm all data syncs.
- **Billing:** Stripe test mode — upgrade, downgrade, cancel, webhook reconciliation.
- **Ghost detection:** feed 20 known suspicious listings (from LinkedIn ghost-job reports) and confirm >70% flag rate.
