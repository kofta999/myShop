const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/admin");
const { isAuthenticated } = require("../controllers/auth");
const router = express.Router();

router.get("/add-product", isAuthenticated, adminController.getAddProduct);
router.get("/products", isAuthenticated, adminController.getAdminProducts);
router.post(
  "/add-product",
  isAuthenticated,
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat().trim(),
    body("description").isLength({ min: 5 }).isString(),
  ],
  adminController.postAddProduct
);
router.get(
  "/edit-product/:productId",
  isAuthenticated,
  adminController.getEditProduct
);
router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat().trim(),
    body("description").isLength({ min: 5 }).isString(),
  ],
  isAuthenticated,
  adminController.postEditProduct
);
router.post(
  "/delete-product/",
  isAuthenticated,
  adminController.postDeleteProduct
);
module.exports = router;
