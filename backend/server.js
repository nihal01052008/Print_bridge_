import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { Server as SocketServer } from "socket.io";

import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { initSockets } from "./sockets/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`[server] Missing required environment variable(s): ${missing.join(", ")}`);
  console.error("[server] Copy backend/.env.example to backend/.env and fill these in.");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "https://print-bridge.vercel.app",
  "https://print-bridge-git-main-nihal01052008s-projects.vercel.app"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const isOriginAllowed = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:")
  ) {
    return callback(null, true);
  }
  callback(null, true); // Allow for flexibility across deployments
};

const io = new SocketServer(server, {
  cors: { origin: isOriginAllowed, credentials: true },
});
app.set("io", io); // controllers access via req.app.get("io")

// --- Core middleware ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: isOriginAllowed, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- Routes ---
app.get("/", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "PrintBridge API is running successfully."
  });
});

app.use("/api", routes);

// --- Sockets ---
initSockets(io);

// --- Static Frontend & SPA Fallback ---
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[server] PrintBridge API listening on port ${PORT}`);
  });
}

start();
