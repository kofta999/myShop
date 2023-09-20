const Product = require("../models/product");
const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res) => {
  res.render("admin/editProduct", {
    docTitle: "Add product",
    path: "/admin/add-product",
    isAuthenticated: req.session.isLoggedIn,
    hasError: false,
    errorMessage: null,
  });
};

exports.postAddProduct = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).render("admin/editProduct", {
      docTitle: "Add product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
      },
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const product = new Product({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    userId: req.user,
  });

  product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product) return res.redirect("/");
      return res.render("admin/editProduct", {
        docTitle: "Edit product",
        path: "/admin/edit-product",
        editing: true,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res) => {
  const productId = req.body.productId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/editProduct", {
      docTitle: "Edit product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        _id: productId
      },
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = req.body.title;
      product.price = req.body.price;
      product.description = req.body.description;
      product.imageUrl = req.body.imageUrl;
      console.log(product);
      return product.save().then(() => res.redirect("/admin/products"));
    })
    .catch((err) => console.log(err));
};

exports.getAdminProducts = (req, res) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        docTitle: "Admin Products",
        path: "admin/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  Product.deleteOne({ _id: productId, userId: req.user._id }).then(() => {
    res.redirect("/admin/products");
    console.log("DESTROYED PRODUCT");
  });
};
