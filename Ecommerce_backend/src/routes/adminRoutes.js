const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../config/multer");

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const categoryController = require("../controllers/categoryController");
const sellerController = require("../controllers/sellerController");
const productController = require("../controllers/productController");
const attributeController = require("../controllers/attributeController");
const bannerController = require("../controllers/bannerController");
const orderController = require("../controllers/orderController");
const dashboardController = require("../controllers/dashboardController");

// ==========================================
// Category Routes
// ==========================================
router.post(
  "/add-edit-category",
  upload.single("categoryImage"),
  categoryController.addEditCategory
);
router.get("/get-all-categories", categoryController.getAllCategories);
router.get("/get-all-active-categories", categoryController.getAllActiveCategories);
router.post("/delete-category", categoryController.deleteCategory);
router.post("/active-deactive-category", categoryController.activeDeactiveCategory);

// ==========================================
// Seller Routes
// ==========================================
router.post("/add-edit-seller", sellerController.addEditSeller);
router.post("/get-all-seller", sellerController.getAllSellers);
router.get("/get-all-seller", sellerController.getAllSellers);
router.get("/get-all-active-seller", sellerController.getAllActiveSellers);
router.post("/active-deactive-seller", sellerController.activeDeactiveSeller);
router.post("/delete-seller", sellerController.deleteSeller);

// ==========================================
// Product Routes
// ==========================================
router.post(
  "/add-edit-products",
  upload.any(), // handles arbitrary array image fields: images, images[0], etc.
  productController.addEditProduct
);
router.get("/get-all-products", productController.getAllProducts);
router.get("/get-product", productController.getSingleProduct);
router.get("/get-product/:id", productController.getSingleProduct);
router.post("/delete-product", productController.deleteProduct);
router.post("/active-deactive-product", productController.activeDeactiveProduct);
router.post("/approve-reject-product", productController.approveRejectProduct);

// Public Storefront Routes
router.get("/products", productController.getStorefrontProducts);
router.get("/storefront-categories", productController.getStorefrontCategories);
router.get("/categories", productController.getStorefrontCategories);

// ==========================================
// Attribute Routes
// ==========================================
router.post("/add-edit-attribute", attributeController.addEditAttribute);
router.get("/get-all-attributes", attributeController.getAllAttributes);
router.get("/get-all-attributes/:categoryId", attributeController.getAllAttributes);
router.post("/delete-attribute", attributeController.deleteAttribute);
router.post("/active-deactive-attribute", attributeController.activeDeactiveAttribute);
router.post(
  "/bulk-import-attributte",
  uploadExcel.any(),
  attributeController.bulkImportAttributes
);
router.post(
  "/bulk-import-attribute",
  uploadExcel.any(),
  attributeController.bulkImportAttributes
);

// ==========================================
// Banner Routes
// ==========================================
router.get("/get-all-banner", bannerController.getAllBanners);
router.post("/update-banner", upload.single("banner"), bannerController.updateBanner);
router.post("/delete-banner", bannerController.deleteBanner);

// ==========================================
// Orders & Tracking Routes
// ==========================================
router.get("/get-all-order", orderController.getAllOrders);
router.get("/return-orders", orderController.getReturnOrders);
router.post("/update-order-status", orderController.updateOrderStatus);
router.get("/order-tracking-admin", orderController.getOrderTracking);

// ==========================================
// Dashboard Routes
// ==========================================
router.post("/get-ecommerce-dashboard", dashboardController.getEcommerceDashboard);
router.get("/get-ecommerce-dashboard", dashboardController.getEcommerceDashboard);

module.exports = router;
