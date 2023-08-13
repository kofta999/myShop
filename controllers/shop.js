const Cart = require("../models/cart");
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
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (prod of products) {
        const cartProductData = cart.products.find(
          (product) => product.id === prod.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: prod, qty: cartProductData.qty });
        }
      }
      res.render("shop/cart", {
        path: "/cart",
        docTitle: "Cart",
        products: cartProducts
      });
    });
  });
};

exports.postCart = (req, res) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    Cart.addProduct(productId, product.price);
  });
  res.redirect("/cart");
};

/** @type {import("express").RequestHandler} */
exports.postCartDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    console.log(product)
    Cart.deleteProduct(productId, product.price);
    res.redirect("/cart");
  });
};

exports.getCheckout = (req, res) => {
  res.render("shop/checkout", { path: "/checkout", docTitle: "Checkout" });
};

exports.getOrders = (req, res) => {
  res.render("shop/orders", { path: "/orders", docTitle: "Orders" });
};
