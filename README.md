# Image Processor Studio (JavaScript edition)

Full-stack image processing app converted from TypeScript to plain JavaScript.

## Stack
- **Backend**: Node.js + Express (CommonJS)
- **Frontend**: React 18 + Vite (ESM / JSX)
- **Database**: PostgreSQL via Prisma ORM
- **Image processing**: Sharp (libvips)
- **Auth**: JWT + bcrypt
- **Infrastructure**: Docker + Docker Compose

## Quick start (Docker)

```bash
# 1. Build & start backend + database
cd image-processor
docker compose up --build

# 2. Run DB migrations (first time only — in a new terminal)
docker compose exec backend npx prisma migrate dev --name init

# 3. Start the frontend dev server
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

## Local development (no Docker)

```bash
# Backend
cd image-processor
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev          # nodemon — auto-restarts on save

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register a new user |
| POST | /api/auth/login | — | Login, receive JWT |
| POST | /api/images | Bearer JWT | Upload an image |
| GET | /api/images | Bearer JWT | List your images |
| POST | /api/images/:id/transform | Bearer JWT | Apply a filter |
| DELETE | /api/images/:id | Bearer JWT | Delete an image |
| GET | /health | — | Server health check |

## Available filters
- `grayscale` — single-channel luminance conversion
- `blur` — Gaussian blur (sigma = 10)
- `sepia` — colour matrix recombination (W3C coefficients)
