import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Order from "../models/Order.js";

const [, , name = "Admin", email = "admin@printbridge.com", password = "Adminpb@2026"] = process.argv;

async function reset() {
  if (!process.env.MONGO_URI) {
    console.error("[reset] MONGO_URI is missing from environment variables!");
    process.exit(1);
  }

  console.log("[reset] Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI);

  console.log("[reset] Clearing collections...");
  const deleteOrders = await Order.deleteMany({});
  console.log(`[reset] Deleted ${deleteOrders.deletedCount} orders.`);
  
  const deleteShops = await Shop.deleteMany({});
  console.log(`[reset] Deleted ${deleteShops.deletedCount} shops.`);
  
  const deleteUsers = await User.deleteMany({});
  console.log(`[reset] Deleted ${deleteUsers.deletedCount} users.`);

  console.log(`[reset] Creating fresh admin: ${email}...`);
  const admin = await User.create({
    name,
    email,
    password,
    role: "admin",
    isActive: true
  });
  
  console.log(`[reset] Admin created: ${admin.email}`);
  console.log(`[reset] Temporary password: ${password}`);

  await mongoose.disconnect();
  console.log("[reset] Disconnected from database.");
}

reset().catch((err) => {
  console.error("[reset] Failed to reset database:", err);
  process.exit(1);
});
