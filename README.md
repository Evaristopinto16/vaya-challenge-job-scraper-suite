# Vaya Index — job board indexer

Aggregates job listings from **58 applicant tracking systems (ATS)** and
**20 job board platforms** into a single searchable, continuously updated index.

Built for the Vaya acquisition challenge. No paying users or revenue required.

## What it does
- Discovers and pulls jobs from every supported platform.
- Normalizes each listing into one consistent schema.
- Deduplicates the same opening across sources while preserving source links.
- Refreshes sources on a schedule; marks closed listings only when confirmed.
- Records failed fetches as `fetch_failure` instead of mass-closing jobs.
- Exposes a documented API and a search UI (keyword, company, location).

## Architecture
API-first. Headless browser (Playwright) only as a fallback for JS-heavy or
anti-bot-protected sources. See [`docs/architecture.md`](docs/architecture.md).

## Coverage
Live coverage checklist across all 78 platforms:
[`docs/coverage-checklist.md`](docs/coverage-checklist.md).

## Quick start
```bash
npm install
npm run build
npm run migrate          # create DB schema
npm run dev              # API + scheduler + web UI