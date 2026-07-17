import Shop from "../models/Shop.js";
import Order from "../models/Order.js";

export async function getStats(req, res, next) {
  try {
    const [totalShops, activeShops, totalOrders, ordersByStatus, todayOrders] = await Promise.all([
      Shop.countDocuments(),
      Shop.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    const statusMap = Object.fromEntries(ordersByStatus.map((s) => [s._id, s.count]));

    res.json({
      success: true,
      stats: {
        totalShops,
        activeShops,
        totalOrders,
        ordersToday: todayOrders,
        byStatus: statusMap,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** Recent orders across all shops, for the admin "monitor uploads" view. */
export async function getRecentOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .populate("shop", "name slug")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
}
