# Lux Exp Movies SSR App – Setup and Execution Guide

This guide explains **step-by-step** how to run the SSR project from scratch, both in **local (Node/Vite)** mode and using **Docker Compose**, including the optional **Redis** setup.

> Works on macOS, Linux, and Windows (with Docker Desktop).  
> Minimum requirements: **Node.js 18+ (recommended 22)**, **npm 9+**, **Docker 24+**, and **Docker Compose v2** (`docker compose ...`).

---

## 📦 1) Clone and install dependencies

```bash
git clone https://github.com/pedroalexisruiz/lux-exp-movies.git
cd lux-exp-movies
npm ci
```

> `npm ci` ensures a clean, reproducible install (uses `package-lock.json`).  
> You can also use `npm install` if you prefer.

---

## ⚙️ 2) Environment variables

The app uses `.env.production` for prod and `.env` for dev mode (both are already included).  
Make sure it looks like this and update the values as needed:

```env
PORT=5173
BASE=/

# Cache backend (memory, persistent or redis)
CACHE_BACKEND=memory

# Redis (only if you enable Redis)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# TMDB API (required)
TMDB_API_KEY=YOUR_API_KEY
TMDB_API_ENDPOINT=https://api.themoviedb.org/3
```

**Notes:**

- Replace `YOUR_API_KEY` with your real TMDB API key.
- Set `CACHE_BACKEND=redis` only if you’re using Redis (see Docker + Redis section).

---

## 🛠️ 3) Available npm scripts

From your `package.json`:

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx watch server.ts",
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build --outDir dist/client --mode production",
  "build:server": "vite build --ssr src/entry-server.tsx --outDir dist/server --mode production",
  "preview": "cross-env NODE_ENV=production tsx server.ts"
}
```

| Script            | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| `npm run dev`     | Starts SSR in **development mode** (hot reload).                      |
| `npm run build`   | Builds **client and server** bundles using Vite.                      |
| `npm run preview` | Runs the SSR server in **production mode** using the built artifacts. |

---

## ▶️ 4) Run locally (no Docker)

### Development mode

```bash
npm run dev
```

App will be available at:  
👉 [http://localhost:5173](http://localhost:5173)

### Production mode (build + serve)

```bash
npm run build
npm run preview
```

> The server automatically reads `.env.production`.  
> Both `dev` and `preview` use `cross-env` to set `NODE_ENV`.

---

## 🐳 5) Run with Docker Compose (no Redis)

Use the base `docker-compose.yaml`:

```bash
docker compose build        # only needed after code or Dockerfile changes
docker compose up -d
```

- The `web` service exposes port `5173` (or `${PORT}` from `.env.production`).
- Mounts a local volume `./.cache:/app/.cache` to persist cache data.

**Useful commands:**

```bash
docker compose ps
docker compose logs -f web
docker compose down
```

> **Do I need to rebuild every time?**  
> ❌ No. You only need to rebuild if you change the `Dockerfile`, dependencies, or source files that are copied during build.

---

## 🧰 6) Run with Docker Compose **+ Redis (optional)**

If you want to use Redis as cache backend:

1. Update `.env.production`:

   ```env
   CACHE_BACKEND=redis
   ```

2. Start with both Compose files:
   ```bash
   docker compose -f docker-compose.yaml -f docker-compose.redis.yaml up -d
   ```

This:

- Starts a `redis:7-alpine` container with append-only persistence.
- Adds a health check so `web` waits for Redis to be ready.
- Creates a named volume `redis-data` for persistence.

**Check Redis logs:**

```bash
docker compose logs -f redis
```

**Stop everything:**

```bash
docker compose down
```

> To switch back to in-memory cache:
>
> ```bash
> CACHE_BACKEND=memory
> docker compose up -d
> ```

---

## 🧱 7) Dockerfile breakdown

The `Dockerfile` uses a **multi-stage build**:

### 🏗️ Build stage

- Installs dependencies with `npm ci`
- Runs `npm run build` to generate:
  - `dist/client`
  - `dist/server`

### 🚀 Runtime stage

- Copies built artifacts, `node_modules`, and source files.
- Exposes port `5173`
- Starts the SSR server with:
  ```bash
  node --import=tsx --import=tsconfig-paths/register server.ts
  ```

> The runtime uses `tsx` as a loader, so you don’t need `ts-node`.

---

## 🧩 8) Best practices and tips

- **Port conflict:**  
  If `5173` is busy, change `PORT` in `.env.production` (or `.env` for dev mode) and restart.

- **Volume permissions (Linux):**

  ```bash
  mkdir -p .cache && chmod -R 777 .cache
  ```

- **Docker Compose environment loading:**  
  The `env_file` key in `docker-compose.yaml` automatically loads `.env.production`.

- **Rebuild from scratch:**
  ```bash
  docker compose build --no-cache
  ```

---

## 🧪 9) Common commands reference

```bash
# Local dev mode
npm run dev

# Local production preview
npm run build && npm run preview

# Docker without Redis
docker compose up -d
docker compose logs -f web
docker compose down

# Docker with Redis
# (make sure CACHE_BACKEND=redis)
docker compose -f docker-compose.yaml -f docker-compose.redis.yaml up -d
docker compose logs -f redis
docker compose down

# Rebuild Docker image
docker compose build
# or forced rebuild:
docker compose build --no-cache
```

---

## ❓ 10) Troubleshooting

| Problem                        | Possible Cause / Solution                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| App doesn’t start on port 5173 | Change `PORT` in `.env.production`(`.env` for dev mode) or free the port (`lsof -i :5173`). |
| Redis container unhealthy      | Check logs with `docker compose logs -f redis` and verify `REDIS_HOST=redis`.               |
| TMDB requests fail             | Ensure `TMDB_API_KEY` is valid and has no quotes or spaces.                                 |
| Cache not persisting           | Make sure `.cache` folder exists and has correct permissions.                               |

---

✅ That’s it!  
You can now clone the repo, set up your `.env.production` (`.env` for dev mode), and run the SSR app **locally** or with **Docker**, with or without **Redis**, in just a few commands.
