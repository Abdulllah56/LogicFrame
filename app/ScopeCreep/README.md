<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15_J8vG0pFwjFYY55H1L-PtaHmA02yi52

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Scope-Creep backend (local)

This repository includes a small Express + Postgres backend used by the Scope-Creep React app.

Quick start (Windows PowerShell):

1. Start Postgres with Docker (recommended):

```powershell
docker run -e POSTGRES_PASSWORD=pass -e POSTGRES_USER=user -e POSTGRES_DB=db -p 5432:5432 -d postgres:15
$env:DATABASE_URL = "postgresql://user:pass@127.0.0.1:5432/db"
```

2. Start the server using the helper script (from repo root):

```powershell
npm run serve-scope:win
```

3. Alternative (manual):

```powershell
$env:DATABASE_URL = "postgresql://user:pass@127.0.0.1:5432/db"
$env:PORT = "3001"
node .\app\Scope-Creep\server.js
```

If Postgres is unreachable and you see `ECONNREFUSED`, ensure the DB is running and try `127.0.0.1` in `DATABASE_URL` instead of `localhost`.

To bypass DB initialization (not recommended):

```powershell
$env:SKIP_DB_INIT = "true"
npm run serve-scope
```

