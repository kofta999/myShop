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

exports.getProduct = (req, res) => {
  const productId = req.params.productId;
  Product.findById(productId, (product) => {
    res.render("shop/productDetail", {
      product: product,
      docTitle: product.title,
      path: "/products"
    });
  });
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
/** @type {import("express").RequestHandler} */
exports.postCart = (req, res) => {
  const productId = req.body.productId;
  console.log(productId);
  res.redirect("/cart")
}

exports.getCheckout = (req, res) => {
  res.render("shop/checkout", { path: "/checkout", docTitle: "Checkout" });
};

exports.getOrders = (req, res) => {
  res.render("shop/orders", { path: "/orders", docTitle: "Orders" });
};
