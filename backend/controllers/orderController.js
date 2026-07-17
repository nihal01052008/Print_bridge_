import Shop from "../models/Shop.js";
import Order from "../models/Order.js";
import { ApiError } from "../middleware/errorHandler.js";
import { generateOrderCode } from "../utils/generateOrderCode.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import { emitOrderEvent } from "../sockets/index.js";

/** Public — customer submits files + print preferences, no account required. */
export async function createOrder(req, res, next) {
  try {
    const shop = await Shop.findOne({ slug: req.params.shopSlug.toLowerCase() });
    if (!shop) throw new ApiError(404, "Shop not found");
    if (!shop.isActive || !shop.isAcceptingOrders) {
      throw new ApiError(400, "This shop isn't accepting orders right now");
    }

    const { customerName, customerPhone, copies, colorMode, paperSize, sides, notes } = req.body;
    if (!req.files || req.files.length === 0) throw new ApiError(400, "At least one file is required");

    const uploaded = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadBufferToCloudinary(file.buffer, file.originalname);
        return {
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          format: result.format,
          pages: result.pages || 1,
        };
      })
    );

    let orderCode;
    do {
      orderCode = generateOrderCode();
    } while (await Order.exists({ orderCode }));

    const order = await Order.create({
      orderCode,
      shop: shop._id,
      customerName: customerName || "Anonymous",
      customerPhone,
      files: uploaded,
      printSettings: { copies, colorMode, paperSize, sides },
      notes,
    });

    const io = req.app.get("io");
    emitOrderEvent(io, shop._id, "order:new", order);

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

/** Shop — live incoming orders list, most recent first. */
export async function getShopOrders(req, res, next) {
  try {
    const { status } = req.query;
    const filter = { shop: req.user.shop };
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}

/** Shop or customer — look up a single order by its pickup code. */
export async function getOrderByCode(req, res, next) {
  try {
    const order = await Order.findOne({ orderCode: req.params.code.toUpperCase() }).populate(
      "shop",
      "name slug"
    );
    if (!order) throw new ApiError(404, "No order found with that code");
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}

/** Shop — search their own orders by code, customer name, or phone. */
export async function searchShopOrders(req, res, next) {
  try {
    const { q = "" } = req.query;
    const orders = await Order.find({
      shop: req.user.shop,
      $or: [
        { orderCode: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { customerPhone: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}

/** Shop — advance an order through its lifecycle; pushes a live update to the dashboard. */
export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "preview", "printing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid status");

    const order = await Order.findOne({ _id: req.params.id, shop: req.user.shop });
    if (!order) throw new ApiError(404, "Order not found");

    order.status = status;

    if (status === "completed" || status === "cancelled") {
      if (order.files && order.files.length > 0) {
        await Promise.all(
          order.files.map(async (file) => {
            if (file.publicId) {
              try {
                await deleteFromCloudinary(file.publicId);
              } catch (err) {
                console.error(`Failed to delete file ${file.publicId} from Cloudinary:`, err);
              }
            }
          })
        );
        order.files = order.files.map((file) => ({
          originalName: file.originalName,
          url: "",
          publicId: "",
          format: file.format,
          pages: file.pages,
        }));
      }
    }

    await order.save();

    const io = req.app.get("io");
    emitOrderEvent(io, order.shop, "order:updated", order);

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
}
