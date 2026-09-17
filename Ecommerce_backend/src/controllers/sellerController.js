const Seller = require("../models/Seller");

// Add or Edit Seller
exports.addEditSeller = async (req, res) => {
  try {
    const {
      id,
      _id,
      businessName,
      businessEmail,
      businessPhoneNumber,
      addressName,
      state,
      city,
      zipcode,
      pocName,
      pocPhoneNumber,
      bankName,
      accountNumber,
      ifscCode,
      gstNumber,
      password,
      businessHours,
    } = req.body;

    const sellerId = id || _id;

    if (sellerId) {
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        return res.status(404).json({ status: 404, message: "Seller not found" });
      }

      if (businessName) seller.businessName = businessName.trim();
      if (businessEmail) seller.businessEmail = businessEmail.trim().toLowerCase();
      if (businessPhoneNumber) seller.businessPhoneNumber = businessPhoneNumber.trim();
      if (addressName !== undefined) seller.addressName = addressName;
      if (state !== undefined) seller.state = state;
      if (city !== undefined) seller.city = city;
      if (zipcode !== undefined) seller.zipcode = zipcode;
      if (pocName !== undefined) seller.pocName = pocName;
      if (pocPhoneNumber !== undefined) seller.pocPhoneNumber = pocPhoneNumber;
      if (bankName !== undefined) seller.bankName = bankName;
      if (accountNumber !== undefined) seller.accountNumber = accountNumber;
      if (ifscCode !== undefined) seller.ifscCode = ifscCode;
      if (gstNumber !== undefined) seller.gstNumber = gstNumber;
      if (password) seller.password = password;
      if (businessHours) seller.businessHours = businessHours;

      await seller.save();
      return res.status(200).json({
        status: 200,
        message: "Seller updated successfully",
        data: seller,
      });
    } else {
      if (!businessName || !businessPhoneNumber) {
        return res.status(400).json({ status: 400, message: "Business name and phone number are required" });
      }

      // Check if email already exists
      if (businessEmail) {
        const existingSeller = await Seller.findOne({
          businessEmail: businessEmail.trim().toLowerCase(),
          deletedStatus: 0,
        });
        if (existingSeller) {
          return res.status(400).json({ status: 400, message: "A seller with this business email already exists" });
        }
      }

      const newSeller = new Seller({
        businessName: businessName.trim(),
        businessEmail: businessEmail ? businessEmail.trim().toLowerCase() : "",
        businessPhoneNumber: businessPhoneNumber.trim(),
        addressName: addressName || "",
        state: state || "",
        city: city || "",
        zipcode: zipcode || "",
        pocName: pocName || "",
        pocPhoneNumber: pocPhoneNumber || "",
        bankName: bankName || "",
        accountNumber: accountNumber || "",
        ifscCode: ifscCode || "",
        gstNumber: gstNumber || "",
        password: password || "",
        businessHours: businessHours || {},
        isActive: true,
        deletedStatus: 0,
      });

      await newSeller.save();
      return res.status(200).json({
        status: 200,
        message: "Seller added successfully",
        data: newSeller,
      });
    }
  } catch (error) {
    console.error("Error in addEditSeller:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get All Sellers (for seller table, returns { seller: [...] })
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ deletedStatus: 0 }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 200,
      message: "Sellers fetched successfully",
      data: {
        seller: sellers,
      },
    });
  } catch (error) {
    console.error("Error in getAllSellers:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Get All Active Sellers (for dropdown in Add Product)
exports.getAllActiveSellers = async (req, res) => {
  try {
    const sellers = await Seller.find({ deletedStatus: 0, isActive: true }).sort({ businessName: 1 });
    return res.status(200).json({
      status: 200,
      message: "Active sellers fetched successfully",
      data: sellers,
    });
  } catch (error) {
    console.error("Error in getAllActiveSellers:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Toggle Active/Inactive Status
exports.activeDeactiveSeller = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Seller ID is required" });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ status: 404, message: "Seller not found" });
    }

    seller.isActive = !seller.isActive;
    await seller.save();

    return res.status(200).json({
      status: 200,
      message: `Seller ${seller.isActive ? "activated" : "deactivated"} successfully`,
      data: seller,
    });
  } catch (error) {
    console.error("Error in activeDeactiveSeller:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};

// Delete Seller (soft delete)
exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ status: 400, message: "Seller ID is required" });
    }

    const seller = await Seller.findByIdAndUpdate(id, { deletedStatus: 1 }, { new: true });
    if (!seller) {
      return res.status(404).json({ status: 404, message: "Seller not found" });
    }

    return res.status(200).json({
      status: 200,
      message: "Seller deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteSeller:", error);
    return res.status(500).json({ status: 500, message: error.message || "Internal server error" });
  }
};
