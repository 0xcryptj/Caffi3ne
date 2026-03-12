# Caffi3ne

Caffi3ne is a coffee intelligence MVP built with Next.js, TypeScript, Tailwind, and Supabase-oriented architecture. It helps consumers discover nearby coffee shops and gives merchants and developers a clean intelligence layer around those shops.

## What is included

- Premium landing page with product positioning
- Nearby shops dashboard with list and map-style panel
- Shop detail pages with crowd intelligence
- Merchant submission and shop-claim entry points
- Developer docs with request and response examples
- Mock-friendly API routes for demo environments
- Supabase SQL schema for core platform tables
- First-pass crowd score heuristic with external-signal adapters

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres and auth-ready schema
- Vercel-friendly route handlers
- Google Places / Maps integration points
- Tomorrow.io weather integration points
- TomTom traffic integration points

## Project structure

```text
app/                    App Router pages and API route handlers
components/             Reusable UI and dashboard components
lib/                    Domain types, config, scoring engine, services, mock data
supabase/               SQL schema for database setup
public/                 Static assets placeholder
```

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

The app defaults to mock data when `USE_MOCK_DATA=true`, so it is demoable before external services are configured.

## Core routes

- `/` landing page
- `/nearby` nearby coffee shops dashboard
- `/shops/[id]` shop detail
- `/merchant` merchant submission and claim flow
- `/docs` developer docs
- `/pricing` pricing

## API routes

- `GET /api/shops/nearby?lat=40.73061&lng=-73.935242&radius=2500`
- `GET /api/shops/:id`
- `GET /api/shops/:id/insights`
- `POST /api/merchant-submissions`
- `GET /api/docs/example-response`
- `GET /api/health`

## External integrations

The codebase is structured so external integrations are isolated in `lib/services`.

- `places.ts`: Google Places discovery and detail enrichment
- `weather.ts`: Tomorrow.io weather signal fetch
- `traffic.ts`: TomTom traffic signal fetch
- `insights.ts`: Aggregates signals and calculates crowd scores

All live providers currently contain TODO markers and safe mock fallbacks for MVP demo use.

## Supabase setup

1. Create a new Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Add the project URL and keys to `.env.local`.

## Next configuration steps

### Google Places / Maps

- Enable Places API and Maps JavaScript API in Google Cloud under `APIs & Services -> Library`.
- Create a single API key under `APIs & Services -> Credentials`.
- Add that key as `GOOGLE_API_KEY`.
- The app uses that single key for Google Places requests and is structured so the map layer can reuse the same project key later.
- Replace the mock map panel with the Google Maps JS component when you are ready for live map rendering.

### Tomorrow.io

- Add `TOMORROW_IO_API_KEY`.
- Swap the mock weather provider in `lib/services/weather.ts` for the live request path.

### TomTom

- Add `TOMTOM_API_KEY`.
- Swap the mock traffic provider in `lib/services/traffic.ts` for the live request path.

### Supabase

- Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Replace in-memory merchant submission persistence with Supabase inserts.

### Vercel

- Import the repo into Vercel.
- Set the same environment variables in Vercel project settings.
- Deploy with the default Next.js preset.

## Demo notes

- Billing is intentionally conceptual and mock-backed for the MVP.
- POS integrations are not required for current functionality but the schema and services leave room for future data sources.
