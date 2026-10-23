import { Router } from "express";
import { getStats, getRecentOrders } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth("admin"), getStats);
router.get("/orders/recent", requireAuth("admin"), getRecentOrders);

export default router;
