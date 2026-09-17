const Attribute = require("../models/Attribute");
const Category = require("../models/Category");
const xlsx = require("xlsx");

function formatVariants(variants, isColor) {
  let res = [];
  if (!variants) return res;

  if (variants && typeof variants === "object" && !Array.isArray(variants)) {
    variants = Object.values(variants);
  }

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

// Bulk Import Attributes from Excel (.xlsx, .xls)
exports.bulkImportAttributes = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file || !file.buffer) {
      return res.status(400).json({
        status: 400,
        message: "Please select and upload a valid Excel file (.xls or .xlsx)",
      });
    }

    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "The uploaded Excel file contains no sheets.",
      });
    }

    const sheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "The uploaded Excel sheet is empty.",
      });
    }

    const getField = (row, fieldNames) => {
      const rowKeys = Object.keys(row);
      for (const fn of fieldNames) {
        if (row[fn] !== undefined && row[fn] !== null && String(row[fn]).trim() !== "") {
          return String(row[fn]).trim();
        }
        const targetClean = fn.toLowerCase().replace(/[\s_-]/g, "");
        const matched = rowKeys.find(
          (k) => k.toLowerCase().replace(/[\s_-]/g, "") === targetClean
        );
        if (matched && row[matched] !== undefined && row[matched] !== null) {
          const val = String(row[matched]).trim();
          if (val !== "") return val;
        }
      }
      return "";
    };

    const skippedRows = [];
    let importedCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const categoryName = getField(row, ["Category", "category", "Category Name", "category_name"]);
      const attributeName = getField(row, ["Name", "name", "Attribute Name", "attribute_name"]);
      const variantsStr = getField(row, ["Variants", "variants", "Variant", "variant"]);
      const isColorStr = getField(row, ["IsColor", "isColor", "Is Color", "is_color"]);
      const colorCodeStr = getField(row, ["colorCode", "ColorCode", "Color Code", "Color Codes", "color_code"]);
      const multiselectStr = getField(row, ["multiselect", "multiSelect", "Multi select"]);

      if (!categoryName) {
        skippedRows.push({
          Category: "-",
          Name: attributeName || "-",
          Variants: variantsStr || "-",
          reason: "Category name is missing",
        });
        continue;
      }

      if (!attributeName) {
        skippedRows.push({
          Category: categoryName,
          Name: "-",
          Variants: variantsStr || "-",
          reason: "Attribute name is missing",
        });
        continue;
      }

      const isColor = isColorStr.toLowerCase() === "true" || isColorStr === "1";
      const multiselect = multiselectStr.toLowerCase() === "true" || multiselectStr === "1";

      const variantTokens = variantsStr
        ? variantsStr.split(",").map((v) => v.trim()).filter(Boolean)
        : [];

      if (variantTokens.length === 0) {
        skippedRows.push({
          Category: categoryName,
          Name: attributeName,
          Variants: "-",
          reason: "No variants specified",
        });
        continue;
      }

      const colorCodeTokens = colorCodeStr
        ? colorCodeStr.split(",").map((c) => c.trim())
        : [];

      const parsedVariants = variantTokens.map((name, idx) => ({
        name: name,
        value: name,
        colorCode: isColor ? (colorCodeTokens[idx] || "") : "",
      }));

      // Find or create Category
      const escapedCategoryName = categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      let categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${escapedCategoryName}$`, "i") },
        deletedStatus: 0,
      });

      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: categoryName,
          image: "",
          isActive: true,
          deletedStatus: 0,
        });
      }

      // Find or create / update Attribute
      const escapedAttributeName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      let attributeDoc = await Attribute.findOne({
        category: categoryDoc._id,
        name: { $regex: new RegExp(`^${escapedAttributeName}$`, "i") },
        deletedStatus: 0,
      });

      if (attributeDoc) {
        attributeDoc.variants = parsedVariants;
        attributeDoc.isColor = isColor;
        attributeDoc.multiselect = multiselect;
        attributeDoc.isActive = true;
        await attributeDoc.save();
      } else {
        await Attribute.create({
          category: categoryDoc._id,
          name: attributeName,
          isColor,
          multiselect,
          variants: parsedVariants,
          isActive: true,
          deletedStatus: 0,
        });
      }

      importedCount++;
    }

    if (importedCount === 0 && skippedRows.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Import failed due to invalid rows.",
        skippedRows,
      });
    }

    return res.status(200).json({
      status: 200,
      message: `Bulk import processed successfully. ${importedCount} attribute(s) imported${skippedRows.length > 0 ? `, ${skippedRows.length} row(s) skipped.` : "."}`,
      data: {
        importedCount,
        skippedCount: skippedRows.length,
      },
      skippedRows,
    });
  } catch (error) {
    console.error("Error in bulkImportAttributes:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal server error during bulk import",
    });
  }
};
