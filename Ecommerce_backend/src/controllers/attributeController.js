const Attribute = require("../models/Attribute");

// Add or Edit Attribute
exports.addEditAttribute = async (req, res) => {
  try {
    const { id, _id, category, name, variants } = req.body;
    const attributeId = id || _id;

    let parsedVariants = variants;
    if (typeof variants === "string") {
      try {
        parsedVariants = JSON.parse(variants);
      } catch (e) {
        parsedVariants = variants.split(",").map((v) => ({ value: v.trim(), name: v.trim() }));
      }
    }

    if (attributeId) {
      const attribute = await Attribute.findById(attributeId);
      if (!attribute) {
        return res.status(404).json({ status: 404, message: "Attribute not found" });
      }

      if (category) attribute.category = category;
      if (name) attribute.name = name.trim();
      if (parsedVariants) attribute.variants = parsedVariants;

      await attribute.save();
      return res.status(200).json({
        status: 200,
        message: "Attribute updated successfully",
        data: attribute,
      });
    } else {
      if (!name || !category) {
        return res.status(400).json({ status: 400, message: "Category and attribute name are required" });
      }

      const newAttribute = new Attribute({
        category,
        name: name.trim(),
        variants: parsedVariants || [],
        isActive: true,
        deletedStatus: 0,
      });

      await newAttribute.save();
      return res.status(200).json({
        status: 200,
        message: "Attribute added successfully",
        data: newAttribute,
      });
    }
  } catch (error) {
    console.error("Error in addEditAttribute:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get All Attributes (or by category if categoryId param is present)
exports.getAllAttributes = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const query = { deletedStatus: 0 };

    if (categoryId) {
      query.category = categoryId;
      query.isActive = true;
    }

    const attributes = await Attribute.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      message: "Attributes fetched successfully",
      data: attributes,
    });
  } catch (error) {
    console.error("Error in getAllAttributes:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Delete Attribute
exports.deleteAttribute = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Attribute ID is required" });
    }

    const attribute = await Attribute.findByIdAndUpdate(id, { deletedStatus: 1 }, { new: true });
    if (!attribute) {
      return res.status(404).json({ status: 404, message: "Attribute not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Attribute deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAttribute:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Toggle Active/Inactive
exports.activeDeactiveAttribute = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Attribute ID is required" });
    }

    const attribute = await Attribute.findById(id);
    if (!attribute) {
      return res.status(404).json({ status: 404, message: "Attribute not found" });
    }

    attribute.isActive = !attribute.isActive;
    await attribute.save();

    return res.status(200).json({
      status: 200,
      message: `Attribute ${attribute.isActive ? "activated" : "deactivated"} successfully`,
      data: attribute,
    });
  } catch (error) {
    console.error("Error in activeDeactiveAttribute:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};
