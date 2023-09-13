const express = require("express");
const adminController = require("../controllers/admin");
const { isAuthenticated } = require("../controllers/auth");
const router = express.Router();

router.get("/add-product", isAuthenticated, adminController.getAddProduct);
router.get("/products", isAuthenticated, adminController.getAdminProducts);
router.post("/add-product", isAuthenticated, adminController.postAddProduct);
router.get(
  "/edit-product/:productId",
  isAuthenticated,
  adminController.getEditProduct
);
router.post("/edit-product", isAuthenticated, adminController.postEditProduct);
router.post(
  "/delete-product/",
  isAuthenticated,
  adminController.postDeleteProduct
);
module.exports = router;
