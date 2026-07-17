import mongoose from "mongoose";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { ApiError } from "../middleware/errorHandler.js";

/** Public — used by the customer upload page to confirm a shop exists & is open. */
export async function getShopBySlug(req, res, next) {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug.toLowerCase() }).select(
      "name slug isActive isAcceptingOrders pricing"
    );
    if (!shop) throw new ApiError(404, "Shop not found");
    res.json({ success: true, shop });
  } catch (err) {
    next(err);
  }
}

/** Public — browse shops currently open for orders, for customers with no shop link yet. */
export async function listPublicShops(req, res, next) {
  try {
    const shops = await Shop.find({ isActive: true, isAcceptingOrders: true })
      .select("name slug address phone")
      .sort({ name: 1 });
    res.json({ success: true, shops });
  } catch (err) {
    next(err);
  }
}

/** Shop — the logged-in owner's own shop profile (used by the dashboard + QR panel). */
export async function getMyShop(req, res, next) {
  try {
    const shop = await Shop.findById(req.user.shop);
    if (!shop) throw new ApiError(404, "Shop not found");
    res.json({ success: true, shop });
  } catch (err) {
    next(err);
  }
}

/** Admin — list all shops with a quick order count for the dashboard table. */
export async function listShops(req, res, next) {
  try {
    const { search = "" } = req.query;
    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const shops = await Shop.find(filter).sort({ createdAt: -1 }).lean();
    const shopIds = shops.map((s) => s._id);

    const counts = await Order.aggregate([
      { $match: { shop: { $in: shopIds } } },
      { $group: { _id: "$shop", total: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.total]));

    res.json({
      success: true,
      shops: shops.map((s) => ({ ...s, totalOrders: countMap[String(s._id)] || 0 })),
    });
  } catch (err) {
    next(err);
  }
}

/** Admin — onboard a new shop: creates the Shop doc and its owner login in one step. */
export async function createShop(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { name, slug, email, password, phone, address } = req.body;
    if (!name || !slug || !email || !password) {
      throw new ApiError(400, "name, slug, email and password are required");
    }

    const shopId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const existingSlug = await Shop.findOne({ slug });
    if (existingSlug) throw new ApiError(409, "That shop URL is already taken");

    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new ApiError(409, "That email is already registered");

    let shop, owner;
    try {
      session.startTransaction();
      [shop] = await Shop.create(
        [{ _id: shopId, name, slug: slug.toLowerCase(), email, phone, address, owner: userId }],
        { session }
      );
      [owner] = await User.create(
        [{ _id: userId, name, email, password, role: "shop", shop: shopId }],
        { session }
      );
      await session.commitTransaction();
    } catch (txError) {
      await session.abortTransaction();
      // Check if transaction/session is not supported (e.g. local standalone MongoDB)
      const isTxNotSupported =
        txError.message.includes("transaction") ||
        txError.message.includes("session") ||
        txError.message.includes("replica set") ||
        txError.codeName === "IllegalOperation";
      
      if (isTxNotSupported) {
        // Fallback to non-transactional creation
        shop = await Shop.create({
          _id: shopId,
          name,
          slug: slug.toLowerCase(),
          email,
          phone,
          address,
          owner: userId,
        });
        owner = await User.create({
          _id: userId,
          name,
          email,
          password,
          role: "shop",
          shop: shopId,
        });
      } else {
        throw txError;
      }
    }

    res.status(201).json({ success: true, shop, owner: owner.toSafeObject() });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
}

/** Admin or the shop's own owner — update shop details / toggle accepting orders. */
export async function updateShop(req, res, next) {
  try {
    const { id } = req.params;
    const isOwner = req.user.role === "shop" && String(req.user.shop) === id;
    if (req.user.role !== "admin" && !isOwner) {
      throw new ApiError(403, "Not authorized to update this shop");
    }

    const allowedFields = isOwner
      ? ["isAcceptingOrders", "phone", "address", "pricing"]
      : ["name", "phone", "address", "pricing", "isActive", "isAcceptingOrders", "isApproved"];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const shop = await Shop.findByIdAndUpdate(id, updates, { new: true });
    if (!shop) throw new ApiError(404, "Shop not found");

    res.json({ success: true, shop });
  } catch (err) {
    next(err);
  }
}

/** Admin — suspend/remove a shop. Orders are preserved for records. */
export async function deleteShop(req, res, next) {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) throw new ApiError(404, "Shop not found");
    await User.deleteMany({ shop: shop._id });
    res.json({ success: true, message: "Shop removed" });
  } catch (err) {
    next(err);
  }
}

/** Public — shopkeeper self-registration: creates a pending Shop doc and owner login. */
export async function registerShop(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { name, slug, email, password, phone, address } = req.body;
    if (!name || !slug || !email || !password) {
      throw new ApiError(400, "name, slug, email and password are required");
    }

    const shopId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const existingSlug = await Shop.findOne({ slug: slug.toLowerCase() });
    if (existingSlug) throw new ApiError(409, "That shop URL is already taken");

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) throw new ApiError(409, "That email is already registered");

    let shop, owner;
    try {
      session.startTransaction();
      [shop] = await Shop.create(
        [{ _id: shopId, name, slug: slug.toLowerCase(), email: email.toLowerCase(), phone, address, owner: userId, isApproved: false }],
        { session }
      );
      [owner] = await User.create(
        [{ _id: userId, name, email: email.toLowerCase(), password, role: "shop", shop: shopId }],
        { session }
      );
      await session.commitTransaction();
    } catch (txError) {
      await session.abortTransaction();
      const isTxNotSupported =
        txError.message.includes("transaction") ||
        txError.message.includes("session") ||
        txError.message.includes("replica set") ||
        txError.codeName === "IllegalOperation";
      
      if (isTxNotSupported) {
        shop = await Shop.create({
          _id: shopId,
          name,
          slug: slug.toLowerCase(),
          email: email.toLowerCase(),
          phone,
          address,
          owner: userId,
          isApproved: false,
        });
        owner = await User.create({
          _id: userId,
          name,
          email: email.toLowerCase(),
          password,
          role: "shop",
          shop: shopId,
        });
      } else {
        throw txError;
      }
    }

    res.status(201).json({ success: true, shop, owner: owner.toSafeObject() });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
}
