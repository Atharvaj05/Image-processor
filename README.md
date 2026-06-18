# 🖼️ Image Processor Studio

### 🌐 Live Demo: [https://image-processor-frontend-ayfc.onrender.com](https://image-processor-frontend-ayfc.onrender.com)

> A full-stack image processing web application where users can upload images, apply filters (grayscale, blur, sepia), and download the results — all from the browser.

---

## 📸 Features

- 🔐 **User Authentication** — Register and login with JWT-based auth, passwords hashed with bcrypt
- 📤 **Image Upload** — Upload images up to 5MB directly from the browser
- 🎨 **Image Filters** — Apply grayscale, blur, and sepia filters powered by Sharp (libvips)
- 👁️ **Live Preview** — See the transformed image instantly in the browser
- 💾 **Download** — Download the processed image with one click
- 🗄️ **Persistent Storage** — Every upload and transformation is logged in PostgreSQL
- 🐳 **Dockerized** — Fully containerized backend + database with Docker Compose

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, JSX |
| **Backend** | Node.js, Express.js (CommonJS) |
| **Database** | PostgreSQL 15 |
| **ORM** | Prisma |
| **Image Processing** | Sharp (libvips) |
| **Authentication** | JWT + bcrypt |
| **File Uploads** | Multer |
| **Infrastructure** | Docker, Docker Compose |
| **Deployment** | Render (backend + DB + frontend) |

---

## 📁 Project Structure

```
image-processor/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env
├── prisma/
│   └── schema.prisma          # DB schema — User, Image, Transformation
├── uploads/                   # Original uploaded images
├── transformed/               # Processed output images
├── src/                       # Backend source (Node.js)
│   ├── server.js              # Entry point
│   ├── app.js                 # Express setup, middleware, routes
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── image.controller.js
│   ├── services/
│   │   ├── auth.service.js    # Register/login business logic
│   │   └── image.service.js   # Sharp pipeline + ownership checks
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── image.repository.js
│   │   └── transformation.repository.js
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification
│   │   ├── upload.middleware.js   # Multer file handling
│   │   └── error.middleware.js    # Global error handler
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── image.routes.js
│   ├── database/
│   │   └── prisma.js          # Singleton PrismaClient
│   └── utils/
│       └── jwt.js             # generateToken / verifyToken
└── frontend/                  # React + Vite app
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx            # Entire frontend application
        └── index.css
```

---

## 🗄️ Database Schema

```
User
├── id           (UUID, primary key)
├── username     (unique)
├── email        (unique)
├── passwordHash
└── images[]     → Image[]

Image
├── id               (UUID)
├── userId           → User
├── originalFilename
├── storedFilename   (UUID-based, collision-safe)
├── mimeType
├── size, width, height
├── path
└── transformations[] → Transformation[]

Transformation
├── id
├── imageId          → Image (onDelete: Cascade)
├── transformationType  e.g. "grayscale,format:jpeg"
├── outputPath
└── outputFormat
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Docker (for the database)
- Git

### 1. Clone the repo
```bash
git clone https://github.com/Atharvaj05/Image-processor.git
cd Image-processor
```

### 2. Start the database
```bash
docker run -d \
  --name image-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=image_db \
  -p 5432:5432 \
  postgres:15-alpine
```

### 3. Install backend dependencies
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start the backend
```bash
npm run dev
# Running on http://localhost:5000
```

### 5. Start the frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🐳 Running with Docker Compose

```bash
# Start everything
docker compose up --build

# Run DB migration (first time only, in a new terminal)
docker compose exec backend npx prisma db push

# Stop everything
docker compose down
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register a new user |
| `POST` | `/api/auth/login` | — | Login, receive JWT |
| `POST` | `/api/images` | Bearer JWT | Upload an image |
| `GET` | `/api/images` | Bearer JWT | List your images |
| `POST` | `/api/images/:id/transform` | Bearer JWT | Apply a filter |
| `DELETE` | `/api/images/:id` | Bearer JWT | Delete an image |
| `GET` | `/health` | — | Server health check |

### Example — Register
```bash
curl -X POST https://image-processor-backend-4yvm.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"atharva","email":"atharva@test.com","password":"secret123"}'
```

### Example — Apply a filter
```bash
curl -X POST https://image-processor-backend-4yvm.onrender.com/api/images/{id}/transform \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transformationType":"grayscale"}'
```

Available filter values: `grayscale`, `blur`, `sepia`

---

## 🎨 How the Image Processing Works

Sharp uses a **lazy pipeline** — operations are chained but nothing executes until `.toFile()` is called:

```js
// Grayscale — converts to single luminance channel
pipeline.grayscale()

// Blur — Gaussian blur with sigma=10
pipeline.blur(10)

// Sepia — no built-in method, implemented via colour matrix (recomb)
pipeline.recomb([
  [0.393, 0.769, 0.189],  // new R
  [0.349, 0.686, 0.168],  // new G
  [0.272, 0.534, 0.131],  // new B
])
```

---

## 🔐 Authentication Flow

1. User registers → password hashed with **bcrypt** (10 salt rounds)
2. On login → `bcrypt.compare()` validates password (constant-time, safe from timing attacks)
3. Server issues a **JWT** signed with `JWT_SECRET`, valid for 24 hours
4. Every protected route runs `requireAuth` middleware → verifies token → attaches `userId` to request
5. All DB queries are scoped to `userId` → prevents one user accessing another's images (IDOR protection)

---

## ☁️ Deployment (Render)

| Service | URL |
|---|---|
| Frontend | https://image-processor-frontend-ayfc.onrender.com |
| Backend | https://image-processor-backend-4yvm.onrender.com |

**Backend environment variables on Render:**
```
NODE_ENV      production
JWT_SECRET    your_strong_secret
DATABASE_URL  postgresql://...  (from Render PostgreSQL)
```

**Build command:**
```
npm install && npx prisma generate && npx prisma db push
```

**Start command:**
```
node src/server.js
```

> ⚠️ **Note:** The free tier on Render spins down after 15 minutes of inactivity. The first request after idle may take ~30 seconds to wake up.

---

## 📝 Environment Variables

Create a `.env` file in the root (already in `.gitignore`):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/image_db?schema=public
JWT_SECRET=your_secret_key_here
PORT=5000
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this project for learning or as a portfolio piece.
