import { Router } from "express";
import authRoutes from "./authRoutes.js";
import orderRoutes from "./orderRoutes.js";
import shopRoutes from "./shopRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "PrintBridge API is running" });
});

router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/shops", shopRoutes);
router.use("/admin", adminRoutes);

export default router;
