# LifeOS: Adaptive Behavior Engine 🧬

LifeOS is a production-grade, full-stack behavioral manipulation engine designed to transform personal performance from a static to-do list into a dynamic, data-driven operating system. It shapes decisions rather than just tracking actions.

## 🧠 Core Philosophy: "Behavioral HUD"
LifeOS replaces organization with **Decision Integrity**. It focuses on human capacity (Energy), streak preservation (Habits), and strategic alignment (Goals).

- **Adaptive Timeline:** Compresses/expands based on wake time and performance.
- **Decision Engine:** Provides the "Best Next Action" based on energy curves.
- **Goal Hierarchy:** Year → Quarter → Week drilldown ensuring daily alignment.
- **Brutal Honesty:** Real-time diagnostics on lost time and failure patterns.

---

## 🏗 Architecture: Clean & Modular
The system follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles to ensure extreme scalability and 200ms read targets.

### 🛡 Backend (Node.js/TS, Mongoose)
Located in `/backend`.
- **Domain Layer:** Pure business entities and repository port interfaces.
- **Application Layer:** Use Case services (DailyLog precompute, Insight engine, Goal hierarchy).
- **Infrastructure Layer:** Mongoose persistence with optimized compound indexing (`userId + date + timeframe`).
- **Presentation Layer:** REST API Gateway with professional security (Helmet, Rate Limiting, JWT).

### 🌌 Frontend (Next.js 14, Zustand)
Located in `/frontend`.
- **Aesthetic:** High-density Monochrome (Bloomberg Terminal meet Notion).
- **Typography:** Inter (Sans-UI) & JetBrains Mono (Data).
- **State:** Zustand store for "Adaptive Context" (Energy level, System Integrity state).
- **CSS:** Vanilla CSS Modules for maximum aesthetic control and performance.

---

## 🚀 Setup & Execution

### Prerequisites
- Node.js 18+
- pnpm 10.11.0+
- MongoDB instance (Local or Atlas)

### 1. Project Initialization
```bash
# Install core dependencies
pnpm install
```

### 2. Backend Setup
```bash
cd backend
# Setup .env (see .env.example)
pnpm build
pnpm start
```

### 3. Frontend Setup
```bash
cd frontend
pnpm dev
# Dashboard available at http://localhost:3000
```

---

## 📊 Design Standards
- **Theme:** Pure Black (`#000000`) and White (`#FFFFFF`).
- **UI:** 2px sharp radius, 1px subtle borders (`#1A1A1A`).
- **Micro-animations:** 150ms ease transitions for hovered state.
- **Icons:** Lucide-React (monochrome).

---

## 🔒 Security & Performance
- **Read Performance:** Precomputed `DailyLog` entity ensures single-document dashboard loads.
- **Security:** Bcrypt salted hashing, JWT-based sub-context, and Helmet header protection.
- **Diagnostics:** Winston multi-transport logging (Error + Activity logs).

---
*LifeOS: Stop decorating procrastination. Start shaping decisions.*
