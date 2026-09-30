# Tipp my draw

Monorepo: `apps/api` (Express + WebSocket + JSON mock DB) + `apps/web` (Vite/React).

```bash
npm install
npm run dev
```

Login: `Bela` / `bela`, `Feri` / `feri`, `Tibi` / `tibi`

A konzol induláskor kiírja a URL-eket és a parancsokat.

## Production (Contabo / VPS)

Lásd: [`deploy/DEPLOY-CONTABO.md`](deploy/DEPLOY-CONTABO.md) — nginx + pm2 + mock `db.json`.
