## TaxOps Frontend (Next.js App Router)

Next.js 13+ App Router frontend for TaxOps. Auth flows call the backend via `http.ts` using `NEXT_PUBLIC_API_BASE_URL`.

### Environment

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

- In production (Netlify), set `NEXT_PUBLIC_API_BASE_URL` to your backend host (e.g., `https://api.taxops.example.com`).
- If the base URL is missing in production, the app will fail fast to avoid calling the Netlify frontend origin.

### Development

```
npm install
npm run dev
```

The app assumes the backend is running and serving `/api/firm/info` and `/api/firm/summary`, plus other `/api/*` routes. Lint must stay clean:

```
npm run lint -- --max-warnings=0
```
