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
        status: "Pending",
        productStatus: "Pending",
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

    const formatted = products.map((p) => {
      const obj = p.toObject ? p.toObject() : { ...p };
      const rawStatus = obj.status || obj.productStatus;
      if (rawStatus === "Approved" || rawStatus === "Approve") {
        obj.status = "Approved";
        obj.productStatus = "Approve";
      } else if (rawStatus === "Rejected" || rawStatus === "Reject") {
        obj.status = "Rejected";
        obj.productStatus = "Reject";
      } else {
        obj.status = "Pending";
        obj.productStatus = "Pending";
      }
      return obj;
    });

    return res.status(200).json({
      status: 200,
      message: "Products fetched successfully",
      data: formatted,
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
    const { id, status, remark } = req.body;
    if (!id || !status) {
      return res.status(400).json({ status: 400, message: "Product ID and status are required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: 404, message: "Product not found" });
    }

    product.status = status;
    product.productStatus = status;
    if (remark !== undefined) {
      product.remark = remark;
    }
    await product.save();

    return res.status(200).json({
      status: 200,
      message: `Product ${product.status.toLowerCase()} successfully`,
      data: product,
    });
  } catch (error) {
    console.error("Error in approveRejectProduct:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get Storefront Products (Public endpoint for ticketing storefront)
exports.getStorefrontProducts = async (req, res) => {
  try {
    const { category, sortBy, search, minPrice, maxPrice } = req.query;

    const query = {
      deletedStatus: 0,
      isActive: true,
      status: { $in: ["Approved", "Approve"] },
    };

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const Category = require("../models/Category");
        const cat = await Category.findOne({
          name: { $regex: new RegExp(`^${category.trim()}$`, "i") },
          deletedStatus: 0,
        });
        if (cat) {
          query.category = cat._id;
        }
      }
    }

    if (search) {
      query.productName = { $regex: new RegExp(search.trim(), "i") };
    }

    let products = await Product.find(query)
      .populate("category", "name image")
      .populate("seller", "businessName")
      .sort({ createdAt: -1 });

    let formatted = products.map((p) => {
      let minP = 0;
      let maxP = 0;
      let oldP = null;
      let primaryImg = "";

      if (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) {
        primaryImg = p.images[0];
      }

      if (Array.isArray(p.attributes) && p.attributes.length > 0) {
        const prices = [];
        const oldPrices = [];
        for (const attr of p.attributes) {
          if (attr.discountedPrice && Number(attr.discountedPrice) > 0) {
            prices.push(Number(attr.discountedPrice));
            if (attr.price && Number(attr.price) > Number(attr.discountedPrice)) {
              oldPrices.push(Number(attr.price));
            }
          } else if (attr.price && Number(attr.price) > 0) {
            prices.push(Number(attr.price));
          }

          if (!primaryImg && Array.isArray(attr.images) && attr.images.length > 0 && attr.images[0]) {
            primaryImg = attr.images[0];
          }
        }

        if (prices.length > 0) {
          minP = Math.min(...prices);
          maxP = Math.max(...prices);
        }
        if (oldPrices.length > 0) {
          oldP = Math.max(...oldPrices);
        }
      }

      return {
        _id: p._id,
        productName: p.productName,
        description: p.description || "",
        category: p.category,
        seller: p.seller,
        price: minP,
        oldPrice: oldP && oldP > minP ? oldP : null,
        minPrice: minP,
        maxPrice: maxP,
        image: primaryImg,
        images: p.images || [],
        attributes: p.attributes || [],
        status: p.status,
        productStatus: p.productStatus,
        createdAt: p.createdAt,
      };
    });

    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      formatted = formatted.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      formatted = formatted.filter((p) => p.price <= Number(maxPrice));
    }

    if (sortBy === "10" || sortBy === "lowToHigh") {
      formatted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "20" || sortBy === "highToLow") {
      formatted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "30" || sortBy === "newest") {
      formatted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.status(200).json({
      status: 200,
      message: "Storefront products fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getStorefrontProducts:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

// Get Storefront Categories with active approved product counts
exports.getStorefrontCategories = async (req, res) => {
  try {
    const Category = require("../models/Category");
    const categories = await Category.find({ deletedStatus: 0, isActive: true }).sort({ name: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: cat._id,
          deletedStatus: 0,
          isActive: true,
          status: { $in: ["Approved", "Approve"] },
        });
        return {
          _id: cat._id,
          name: cat.name,
          image: cat.image,
          productCount: count,
        };
      })
    );

    return res.status(200).json({
      status: 200,
      message: "Storefront categories fetched successfully",
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error("Error in getStorefrontCategories:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};
