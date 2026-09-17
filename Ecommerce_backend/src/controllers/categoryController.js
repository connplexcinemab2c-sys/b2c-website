const Category = require("../models/Category");

// Add or Edit Category
exports.addEditCategory = async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!name && !id) {
      return res.status(400).json({ status: 400, message: "Category name is required" });
    }

    if (id) {
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ status: 404, message: "Category not found" });
      }

      if (name) category.name = name.trim();
      if (req.file) {
        category.image = req.file.filename;
      }

      await category.save();
      return res.status(200).json({
        status: 200,
        message: "Category updated successfully",
        data: category,
      });
    } else {
      if (!req.file) {
        return res.status(400).json({ status: 400, message: "Category image is required" });
      }

      const newCategory = new Category({
        name: name ? name.trim() : "",
        image: req.file ? req.file.filename : "",
        isActive: true,
        deletedStatus: 0,
      });

      await newCategory.save();
      return res.status(200).json({
        status: 200,
        message: "Category added successfully",
        data: newCategory,
      });
    }
  } catch (error) {
    console.error("Error in addEditCategory:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get All Categories (admin table)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ deletedStatus: 0 }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 200,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get All Active Categories (for dropdowns)
exports.getAllActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ deletedStatus: 0, isActive: true }).sort({ name: 1 });
    return res.status(200).json({
      status: 200,
      message: "Active categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error in getAllActiveCategories:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Delete Category (soft delete)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Category ID is required" });
    }

    const category = await Category.findByIdAndUpdate(id, { deletedStatus: 1 }, { new: true });
    if (!category) {
      return res.status(404).json({ status: 404, message: "Category not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Toggle Active/Inactive Status
exports.activeDeactiveCategory = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Category ID is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ status: 404, message: "Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.status(200).json({
      status: 200,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      data: category,
    });
  } catch (error) {
    console.error("Error in activeDeactiveCategory:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};
