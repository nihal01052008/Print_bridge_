import { Router } from "express";
import {
  getShopBySlug,
  listPublicShops,
  getMyShop,
  listShops,
  createShop,
  updateShop,
  deleteShop,
  registerShop,
} from "../controllers/shopController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/public", listPublicShops); // public, used by the "choose a shop" step
router.get("/me", requireAuth("shop"), getMyShop); // shop's own profile
router.post("/register", registerShop); // public shop self-registration
router.get("/:slug", getShopBySlug); // public, used by the upload page
router.get("/", requireAuth("admin"), listShops);
router.post("/", requireAuth("admin"), createShop);
router.patch("/:id", requireAuth("admin", "shop"), updateShop);
router.delete("/:id", requireAuth("admin"), deleteShop);

export default router;
