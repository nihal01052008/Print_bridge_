import { Router } from "express";
import {
  createOrder,
  getShopOrders,
  getOrderByCode,
  searchShopOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public — customer upload flow, no login
router.post("/:shopSlug", upload.array("files", 10), createOrder);
router.get("/lookup/:code", getOrderByCode);

// Shop — authenticated dashboard
router.get("/shop/mine", requireAuth("shop"), getShopOrders);
router.get("/shop/search", requireAuth("shop"), searchShopOrders);
router.patch("/:id/status", requireAuth("shop"), updateOrderStatus);

export default router;
