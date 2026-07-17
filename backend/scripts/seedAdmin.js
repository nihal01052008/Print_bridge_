import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const [, , name = "Admin", email = "admin@printbridge.local", password = "changeme123"] = process.argv;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] Admin already exists: ${email}`);
  } else {
    await User.create({ name, email, password, role: "admin" });
    console.log(`[seed] Admin created: ${email} / ${password}`);
    console.log("[seed] Change this password after first login.");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] Failed:", err.message);
  process.exit(1);
});
