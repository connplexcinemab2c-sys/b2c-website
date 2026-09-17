const Banner = require("../models/Banner");

// Get All Banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ deletedStatus: 0 })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    console.error("Error in getAllBanners:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Update or Create Banner
exports.updateBanner = async (req, res) => {
  try {
    const { id, categoryId, title, description } = req.body;
    const bannerFile = req.file ? req.file.filename : null;

    if (id) {
      const bannerDoc = await Banner.findById(id);
      if (!bannerDoc) {
        return res.status(404).json({ status: 404, message: "Banner not found" });
      }

      if (title !== undefined) bannerDoc.title = title;
      if (categoryId) bannerDoc.category = categoryId;
      if (bannerFile) bannerDoc.banner = bannerFile;

      await bannerDoc.save();
      return res.status(200).json({
        status: 200,
        message: "Banner updated successfully",
        data: bannerDoc,
      });
    } else {
      if (!bannerFile) {
        return res.status(400).json({ status: 400, message: "Banner image is required" });
      }

      const newBanner = new Banner({
        title: title || "",
        category: categoryId || null,
        banner: bannerFile,
        isActive: true,
        deletedStatus: 0,
      });

      await newBanner.save();
      return res.status(200).json({
        status: 200,
        message: "Banner created successfully",
        data: newBanner,
      });
    }
  } catch (error) {
    console.error("Error in updateBanner:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Banner ID is required" });
    }

    await Banner.findByIdAndUpdate(id, { deletedStatus: 1 });
    return res.status(200).json({
      status: 200,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteBanner:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};
