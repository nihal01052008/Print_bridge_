import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Order from "../models/Order.js";

const adminName = process.env.ADMIN_NAME || "System Admin";
const adminEmail = (process.env.ADMIN_EMAIL || "admin@printbridge.com").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

async function resetAndSeed() {
  if (!process.env.MONGO_URI) {
    console.error("[reset] MONGO_URI is missing in environment.");
    process.exit(1);
  }

  console.log("[reset] Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);

  console.log("[reset] Clearing all collections (Orders, Shops, Users)...");
  await Order.deleteMany({});
  await Shop.deleteMany({});
  await User.deleteMany({});
  console.log("[reset] All existing user, shop, and order data cleared successfully.");

  console.log(`[reset] Creating new admin account (${adminEmail})...`);
  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    isActive: true,
  });

  console.log("\n==============================================");
  console.log("DATABASE RESET & ADMIN CREATION COMPLETE!");
  console.log("==============================================");
  console.log(`Admin Name:     ${admin.name}`);
  console.log(`Admin Email:    ${admin.email}`);
  console.log(`Admin Password: ${adminPassword}`);
  console.log("==============================================\n");

  await mongoose.disconnect();
}

resetAndSeed().catch((err) => {
  console.error("[reset] Error resetting database:", err);
  process.exit(1);
});
