const express = require("express");

const router = express.Router();
const products = [];

router.get("/add-product", (req, res) => {
  res.render("addProduct", {
    docTitle: "Add product",
    path: "/admin/add-product",
    productCSS: true,
    formsCSS: true,
    activeAddProduct: true
  });
});

router.post("/add-product", (req, res) => {
  products.push({ title: req.body.title });
  res.redirect("/");
});

exports.routes = router;
exports.products = products;
