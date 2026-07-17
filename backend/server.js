import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { Server as SocketServer } from "socket.io";

import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { initSockets } from "./sockets/index.js";

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

const io = new SocketServer(server, {
  cors: { origin: allowedOrigins, credentials: true },
});
app.set("io", io); // controllers access via req.app.get("io")

// --- Core middleware ---
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
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
app.use("/api", routes);

// --- Sockets ---
initSockets(io);

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
