const Product = require("../models/product");

exports.getAllProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render("shop/listProducts", {
      prods: products,
      docTitle: "All Products",
      path: "/products"
    });
  });
};

/** @type {import("express").RequestHandler} */
exports.getProduct = (req, res) => {
  const productId = req.params.productId;
  Product.findById(productId, (product) => {
    console.log(product);
  });
  res.redirect("/");
};

exports.getIndex = (req, res) => {
  Product.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      docTitle: "Homepage",
      path: "/"
    });
  });
};

exports.getCart = (req, res) => {
  res.render("shop/cart", { path: "/cart", docTitle: "Cart" });
};

exports.getCheckout = (req, res) => {
  res.render("shop/checkout", { path: "/checkout", docTitle: "Checkout" });
};

exports.getOrders = (req, res) => {
  res.render("shop/orders", { path: "/orders", docTitle: "Orders" });
};
