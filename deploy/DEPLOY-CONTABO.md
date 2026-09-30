# Contabo (VPS) deploy — Tipp my draw

Ez a monorepo **egy VPS-en** fut a legjobban: Express API + WebSocket + `db.json` mock.

A Cursor agent **nem tud magától belépni** a Contabo gépedre. Deployhoz kell: SSH (IP + user + kulcs/jelszó), domain (opcionális de ajánlott), és hogy te futtasd a lentebbi lépéseket (vagy Agent módban megadd a hozzáférést).

## Architektúra

```text
https://YOUR_DOMAIN
        │
     nginx :443
     ├── /       → apps/web/dist
     ├── /api/*  → 127.0.0.1:3001
     └── /ws     → 127.0.0.1:3001 (WebSocket)
              │
         pm2: tipp-my-draw-api
         + apps/api/data/db.json
```

## 1. Szerver előkészítés (Ubuntu)

```bash
sudo apt update && sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Firewall (UFW példa):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Contabo panelben is engedd a 80/443-at, ha van külön firewall.

## 2. Alkalmazás telepítése

```bash
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
cd /var/www
git clone git@github.com:vrabelo/guessMyDrawing.git tipp-my-draw
cd tipp-my-draw

npm install
npm run build
```

Ellenőrzés:

```bash
# API health (direkt, csak localhoston)
node -e "require('http').get('http://127.0.0.1:3001/api/health',r=>r.on('data',d=>console.log(d.toString())))"
# (előbb indítsd pm2-vel — lásd lent)
ls apps/web/dist/index.html
ls apps/api/data   # db.json itt jön létre első futáskor / seednél
```

## 3. pm2 (API)

Szerkeszd: [`deploy/ecosystem.config.cjs`](ecosystem.config.cjs) — cseréld a `WEB_URL` értékét.

```bash
cd /var/www/tipp-my-draw
pm2 start deploy/ecosystem.config.cjs
pm2 status
pm2 logs tipp-my-draw-api --lines 50
pm2 save
pm2 startup   # kövesd a kiírt sudo parancsot
```

Mock DB: `apps/api/data/db.json` — maradjon írható a process usernek. Időnként mentsd backupként.

## 4. nginx

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/tipp-my-draw
sudo nano /etc/nginx/sites-available/tipp-my-draw
```

Cseréld:

- `YOUR_DOMAIN` → pl. `rajz.example.com`
- `REPO_ROOT` → pl. `/var/www/tipp-my-draw`

```bash
sudo ln -sf /etc/nginx/sites-available/tipp-my-draw /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

DNS: Contabo VPS publikus IP → A rekord a domainre.

## 5. Frissítés (új commit után)

```bash
cd /var/www/tipp-my-draw
git pull
npm install
npm run build
pm2 restart tipp-my-draw-api
```

A `db.json` nem megy felül a pull-lal (ha tracked, figyelj merge-re — érdemes backup).

## 6. Gyors hibaellenőrzés

| Tünet | Teendő |
|--------|--------|
| 502 Bad Gateway | `pm2 status`, `pm2 logs`, port 3001 |
| WS nem megy | nginx `/ws` Upgrade headerek |
| Nagy rajz 413 | `client_max_body_size 10m` |
| Üres oldal | `apps/web/dist` path, `try_files` |
| db elveszik reboot után | normál disk path (ne csak `/tmp`) |

Health: `https://YOUR_DOMAIN/api/health` → `{"ok":true}`

Demo login (seed): `Bela` / `bela` — publikus szerveren cseréld / korlátozd.

## Contabo izolált telepítés (trackpool mellett)

Aktuális layout ezen a VPS-en (meglévő jukebox/trackpool **érintetlen**):

| Szolgáltatás | Hol |
|--------------|-----|
| Tipp my draw kód | `/opt/tipp-my-draw` |
| API (pm2) | `tipp-my-draw-api` → `127.0.0.1:3001` |
| Mock DB | `/opt/tipp-my-draw/apps/api/data/db.json` (gitignore — scp-vel feltöltve) |
| nginx tipp | `sites-available/tipp-my-draw` → **`:9080`** (amíg nincs saját domain) |
| Trackpool | meglévő nginx site + docker `jukebox-cloud-relay` — **ne módosítsd** |

Ideiglenes elérés DNS nélkül: `http://169.58.76.201:9080/`  
Health: `http://169.58.76.201:9080/api/health` → `{"ok":true}`

GitHub clone ezen a gépen: SSH host alias `github.com-tipp` + deploy key (`~/.ssh/github_tipp_key`).

### DuckDNS + HTTPS (később, saját subdomain)

1. DuckDNS: új hostname (pl. `tipp-my-draw.duckdns.org`) → A rekord: `169.58.76.201` (ne a trackpool hostname-ot írd felül).
2. nginx: a tipp site-ban `listen 80` + `server_name tipp-my-draw.duckdns.org;` (és később 443), `root` marad `/opt/tipp-my-draw/apps/web/dist`. A **9080** blokk megmaradhat tesztnek, vagy törölhető.
3. `pm2` env: `WEB_URL=https://tipp-my-draw.duckdns.org` a `deploy/ecosystem.config.cjs`-ben, majd `pm2 restart tipp-my-draw-api`.
4. Certbot **csak** az új domainre: `certbot --nginx -d tipp-my-draw.duckdns.org` — ne futtasd a trackpool site fájlján.
5. Contabo / UFW: 80 + 443 nyitva (9080 opcionális).

Frissítés ezen a VPS-en:

```bash
cd /opt/tipp-my-draw
git pull   # Host github.com-tipp
npm install && npm run build
pm2 restart tipp-my-draw-api
# db.json-t ne írd felül pull-lal; backup: cp apps/api/data/db.json ~/db-backup-$(date +%F).json
```

## Fájlok ebben a mappában

- [`nginx.conf.example`](nginx.conf.example) — reverse proxy + SPA
- [`ecosystem.config.cjs`](ecosystem.config.cjs) — pm2 API process
