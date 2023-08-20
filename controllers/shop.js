const Cart = require("../models/cart");
const Product = require("../models/product");

exports.getAllProducts = (req, res) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/listProducts", {
        prods: rows,
        docTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res) => {
  console.log(req)
  const productId = req.params.productId;
  Product.findById(productId)
    .then(([product]) => {
      console.log("zby", product[0]);
      res.render("shop/productDetail", {
        product: product[0],
        docTitle: "detail",
        path: "/products",
      });
    })
    .catch((err) => console.log(err.message));
};

exports.getIndex = (req, res) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/index", {
        prods: rows,
        docTitle: "Homepage",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
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
        products: cartProducts,
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
    console.log(product);
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
