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

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this project for learning or as a portfolio piece.
