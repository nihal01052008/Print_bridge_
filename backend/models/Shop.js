import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },

    isActive: { type: Boolean, default: true }, // admin can suspend a shop
    isAcceptingOrders: { type: Boolean, default: true }, // shop can pause incoming orders
    isApproved: { type: Boolean, default: true }, // self-registered shops start as false and need admin approval

    pricing: {
      bwPerPage: { type: Number, default: 2 },
      colorPerPage: { type: Number, default: 10 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Shop", shopSchema);
