const Attribute = require("../models/Attribute");

function formatVariants(variants, isColor) {
  let res = [];
  if (!variants) return res;

  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch (e) {
      variants = variants.split(",").map((s) => s.trim());
    }
  }

  if (Array.isArray(variants)) {
    if (variants.length > 0 && typeof variants[0] === "object" && variants[0] !== null) {
      return variants.map((v) => ({
        name: v.name || v.value || "",
        value: v.value || v.name || "",
        colorCode: v.colorCode || "",
      }));
    }

    const isCol = isColor === "true" || isColor === true;
    if (isCol) {
      for (let i = 0; i < variants.length; i += 2) {
        const name = variants[i] || "";
        const colorCode = variants[i + 1] || "";
        res.push({ name, value: name, colorCode });
      }
    } else {
      for (let i = 0; i < variants.length; i++) {
        const val = String(variants[i]).trim();
        res.push({ name: val, value: val, colorCode: "" });
      }
    }
  }
  return res;
}

// Add or Edit Attribute
exports.addEditAttribute = async (req, res) => {
  try {
    const { id, _id, category, name, variants, isColor, multiselect } = req.body;
    const attributeId = id || _id;
    const parsedVariants = formatVariants(variants, isColor);

    if (attributeId) {
      const attribute = await Attribute.findById(attributeId);
      if (!attribute) {
        return res.status(404).json({ status: 404, message: "Attribute not found" });
      }

      if (category) attribute.category = category;
      if (name) attribute.name = name.trim();
      if (isColor !== undefined) attribute.isColor = isColor === "true" || isColor === true;
      if (multiselect !== undefined) attribute.multiselect = multiselect === "true" || multiselect === true;
      if (parsedVariants.length > 0) attribute.variants = parsedVariants;

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
        isColor: isColor === "true" || isColor === true,
        multiselect: multiselect === "true" || multiselect === true,
        variants: parsedVariants,
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
