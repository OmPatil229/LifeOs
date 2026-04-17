# 🚀 LifeOs Backend

This is a premium, high-performance MVC backend project built with **Express (Node.js)** and **MongoDB**.

## 🛠️ Features
- **MVC Architecture**: Clear separation of concerns.
- **Async Handling**: Robust error handling using `asyncHandler` and `ApiError`.
- **Authentication**: JWT-based auth with `bcryptjs` and `jsonwebtoken`.
- **Database Logic**: Pre-save hooks for password hashing and methods for token generation in Mongoose.
- **Security**: Hardened with `helmet`, `cors`, and `cookie-parser`.
- **Structured Responses**: Consistent `ApiResponse` and `ApiError` format.

## 📂 Project Structure
```text
src/
├── controllers/    # Request handling logic
├── db/             # Database connection setup
├── middlewares/    # Custom Express middlewares
├── models/         # Mongoose schemas
├── routes/         # Express API routes
├── utils/          # Helper classes and functions
├── validators/      # JOI/Express-validator schemas
├── app.js          # Main Express app configuration
└── index.js        # Entry point for starting the server
```

## ⚙️ How to Run
1. **Clone & Install**:
   ```bash
   pnpm install
   ```
2. **Setup .env**:
   Modify the `.env` file with your credentials (PORT, MONGODB_URI, JWT_SECRET, etc.).
3. **Start Development**:
   ```bash
   pnpm run dev
   ```
4. **Format & Lint**:
   ```bash
   pnpm run format
   pnpm run lint
   ```

## 📜 Development Standards
- Uses **ES Modules** (`import`/`export`).
- Follows **MVC** pattern strictly.
- Preconfigured with **Prettier** and **ESLint** for consistent code quality.
