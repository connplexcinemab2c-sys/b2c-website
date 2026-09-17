const Order = require("../models/Order");
const Product = require("../models/Product");

// Get Ecommerce Dashboard Data
exports.getEcommerceDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ deletedStatus: 0 });
    const totalOrdersInProcess = await Order.countDocuments({
      deletedStatus: 0,
      status: "Processing",
    });
    const totalOrdersDelivered = await Order.countDocuments({
      deletedStatus: 0,
      status: "Delivered",
    });
    const totalOrdersUndelivered = await Order.countDocuments({
      deletedStatus: 0,
      status: { $in: ["Processing", "Dispatched"] },
    });

    const revenueResult = await Order.aggregate([
      { $match: { deletedStatus: 0, paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const topSellingProducts = await Product.find({ deletedStatus: 0, isActive: true })
      .limit(5)
      .select("productName images price")
      .lean();

    return res.status(200).json({
      status: 200,
      message: "Dashboard data fetched successfully",
      data: {
        totalRevenue,
        totalEcommerceRevenue: totalRevenue,
        totalOrders,
        totalOrdersInProcess,
        totalOrdersDelivered,
        totalOrdersUndelivered,
        topSellingProducts: topSellingProducts.map((p) => ({
          _id: p._id,
          product: p.productName,
          image: p.images?.[0] || "",
          sold: 0,
        })),
      },
    });
  } catch (error) {
    console.error("Error in getEcommerceDashboard:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};
