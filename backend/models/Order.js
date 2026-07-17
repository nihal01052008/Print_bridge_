import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary asset id, for later deletion
    originalName: { type: String, required: true },
    format: { type: String },
    pages: { type: Number, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true }, // e.g. "PB4X7Q", shown to customer for pickup
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },

    customerName: { type: String, default: "Anonymous", trim: true },
    customerPhone: { type: String, trim: true },

    files: { type: [fileSchema], required: true },

    printSettings: {
      copies: { type: Number, default: 1, min: 1 },
      colorMode: { type: String, enum: ["bw", "color"], default: "bw" },
      paperSize: { type: String, enum: ["A4", "A3", "Letter", "Legal"], default: "A4" },
      sides: { type: String, enum: ["single", "double"], default: "single" },
    },

    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "preview", "printing", "ready", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ shop: 1, status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
