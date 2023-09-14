const Order = require("../models/order");
const Product = require("../models/product");

exports.getProducts = (req, res) => {
  Product.find()
    .then((products) => {
      res.render("shop/listProducts", {
        prods: products,
        docTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("shop/productDetail", {
        product: product,
        docTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err.message));
};

exports.getIndex = (req, res) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        docTitle: "Homepage",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      res.render("shop/cart", {
        path: "/cart",
        docTitle: "Cart",
        products: user.cart.items,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  req.user
    .deleteItemFromCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res) => {
  res.render("shop/checkout", {
    path: "/checkout",
    docTitle: "Checkout",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getOrders = (req, res) => {
  Order.find({ "user._id": req.user._id })
    .populate("items.productId")
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        docTitle: "Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res) => {
  return req.user
    .addOrder()
    .then(() => res.redirect("/orders"))
    .catch((err) => console.log(err));
};
