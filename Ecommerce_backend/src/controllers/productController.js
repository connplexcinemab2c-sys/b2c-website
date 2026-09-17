const Product = require("../models/Product");

// Add or Edit Product
exports.addEditProduct = async (req, res) => {
  try {
    const {
      id,
      productName,
      description,
      category,
      seller,
      maximumPurchaseQty,
      height,
      width,
      weight,
      attributes,
    } = req.body;

    let parsedAttributes = [];
    if (attributes) {
      if (typeof attributes === "string") {
        try {
          parsedAttributes = JSON.parse(attributes);
        } catch (e) {
          parsedAttributes = [];
        }
      } else {
        parsedAttributes = attributes;
      }
    }

    const uploadedImages = req.files ? req.files.map((f) => f.filename) : [];

    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ status: 404, message: "Product not found" });
      }

      if (productName) product.productName = productName.trim();
      if (description !== undefined) product.description = description;
      if (category) product.category = category;
      if (seller) product.seller = seller;
      if (maximumPurchaseQty !== undefined) product.maximumPurchaseQty = Number(maximumPurchaseQty) || 0;
      if (height !== undefined) product.height = Number(height) || 0;
      if (width !== undefined) product.width = Number(width) || 0;
      if (weight !== undefined) product.weight = Number(weight) || 0;
      if (parsedAttributes.length > 0) product.attributes = parsedAttributes;

      if (uploadedImages.length > 0) {
        product.images = [...product.images, ...uploadedImages];
      }

      await product.save();
      return res.status(200).json({
        status: 200,
        message: "Product updated successfully",
        data: product,
      });
    } else {
      if (!productName || !category || !seller) {
        return res.status(400).json({
          status: 400,
          message: "Product name, category, and seller are required",
        });
      }

      const newProduct = new Product({
        productName: productName.trim(),
        description: description || "",
        category,
        seller,
        maximumPurchaseQty: Number(maximumPurchaseQty) || 0,
        height: Number(height) || 0,
        width: Number(width) || 0,
        weight: Number(weight) || 0,
        attributes: parsedAttributes,
        images: uploadedImages,
        status: "Approved",
        isActive: true,
        deletedStatus: 0,
      });

      await newProduct.save();
      return res.status(200).json({
        status: 200,
        message: "Product added successfully",
        data: newProduct,
      });
    }
  } catch (error) {
    console.error("Error in addEditProduct:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get All Products (admin list)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ deletedStatus: 0 })
      .populate("category", "name image")
      .populate("seller", "businessName businessEmail")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get Single Product by ID (for edit and view)
exports.getSingleProduct = async (req, res) => {
  try {
    const productId = req.query.id || req.params.id;
    if (!productId) {
      return res.status(400).json({ status: 400, message: "Product ID is required" });
    }

    const product = await Product.findById(productId)
      .populate("category", "name image")
      .populate("seller", "businessName businessEmail");

    if (!product) {
      return res.status(404).json({ status: 404, message: "Product not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error in getSingleProduct:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Product ID is required" });
    }

    const product = await Product.findByIdAndUpdate(id, { deletedStatus: 1 }, { new: true });
    if (!product) {
      return res.status(404).json({ status: 404, message: "Product not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Active/Deactive Product
exports.activeDeactiveProduct = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Product ID is required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: 404, message: "Product not found" });
    }

    if (status !== undefined) {
      product.isActive = status;
    } else {
      product.isActive = !product.isActive;
    }

    await product.save();
    return res.status(200).json({
      status: 200,
      message: `Product status updated to ${product.isActive ? "Active" : "Inactive"}`,
      data: product,
    });
  } catch (error) {
    console.error("Error in activeDeactiveProduct:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Approve or Reject Product
exports.approveRejectProduct = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ status: 400, message: "Product ID and status are required" });
    }

    const product = await Product.findByIdAndUpdate(id, { status }, { new: true });
    if (!product) {
      return res.status(404).json({ status: 404, message: "Product not found" });
    }

    return res.status(200).json({
      status: 200,
      message: `Product ${status.toLowerCase()} successfully`,
      data: product,
    });
  } catch (error) {
    console.error("Error in approveRejectProduct:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};
