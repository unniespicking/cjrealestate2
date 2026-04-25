# CJ Real Estate — Demo Site

Reference / demonstration site for a modernised CJ Real Estate.

## Run

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Demo mode

All flows work without any API keys. Key demo surfaces:

- **Chatbot** (bottom-right on every page): scripted Gemini-style conversation in EN / 中文 / 한국어. When a visitor provides contact info, the Slack Preview panel fires.
- **Slack Preview** (bottom-left toggle): live in-browser visualisation of what Slack would receive. Triggers: chat lead capture, Instant Appraisal, inspection booking, contact form, rental application.
- **Instant Appraisal** (`/sell/instant-appraisal`): address → beds/baths → mock AVM range → lead capture.
- **Staff Dashboard** (`/portal/staff`): agent workspace with today's inspections, leads, active listings, messages.
- **Tenant & Landlord portals** (`/portal/tenant`, `/portal/landlord`): mocked authenticated views.

## What's real vs mocked

| Area | Status |
|------|--------|
| Design system, pages, IA | Real |
| Property listings | Mocked (20+ realistic records across all CJ suburbs) |
| Agents, offices | Real (from current CJ site) |
| Newsletter archive | Subset of real metadata |
| Chatbot | Scripted flows; swap to Gemini API by setting `GEMINI_API_KEY` |
| Slack | In-browser preview panel; swap to real workspace by setting `SLACK_WEBHOOK_URL` |
| AVM | Deterministic mock based on suburb median + inputs |
| Auth | Mocked "logged-in" state on `/portal/*` |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 3 · lucide-react

No external DB, no runtime services required for demo.
