const Order = require("../models/Order");

// Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deletedStatus: 0 })
      .populate("user", "name email phone")
      .populate("seller", "businessName businessEmail")
      .populate("items.product", "productName images")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get Return Orders
exports.getReturnOrders = async (req, res) => {
  try {
    const returnOrders = await Order.find({
      deletedStatus: 0,
      "returnRequest.isRequested": true,
    })
      .populate("user", "name email phone")
      .populate("seller", "businessName")
      .sort({ "returnRequest.requestedAt": -1 });

    return res.status(200).json({
      status: 200,
      message: "Return orders fetched successfully",
      data: returnOrders,
    });
  } catch (error) {
    console.error("Error in getReturnOrders:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Update Order / Return Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id, status, returnStatus } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Order ID is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ status: 404, message: "Order not found" });
    }

    if (status) order.status = status;
    if (returnStatus) {
      order.returnRequest.status = returnStatus;
      if (returnStatus === "Approved") order.status = "Returned";
    }

    await order.save();
    return res.status(200).json({
      status: 200,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get Order Tracking
exports.getOrderTracking = async (req, res) => {
  try {
    const trackingOrders = await Order.find({ deletedStatus: 0 })
      .select("orderId status tracking createdAt user items")
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      message: "Order tracking fetched successfully",
      data: trackingOrders,
    });
  } catch (error) {
    console.error("Error in getOrderTracking:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};
