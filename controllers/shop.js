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

exports.getIndex = (req, res) => {
  res.render("shop/index", {
    path: "/",
    docTitle: "Homepage"
  });
};

exports.getCart = (req, res) => {
  res.render("shop/cart", { path: "/cart", docTitle: "Cart" });
};

exports.getCheckout = (req, res) => {
  res.render("shop/checkout", { path: "/checkout", docTitle: "Checkout"})
}

exports.getOrders = (req, res) => {
  res.render("shop/orders", { path: "/orders", docTitle: "Orders"})
}