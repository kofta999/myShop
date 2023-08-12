const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
  res.render("admin/editProduct", {
    docTitle: "Add product",
    path: "/admin/add-product"
  });
};

exports.postAddProduct = (req, res) => {
  const product = new Product(
    null,
    req.body.title,
    req.body.imageUrl,
    req.body.description,
    req.body.price
  );
  product.save();
  res.redirect("/");
};

exports.getEditProduct = (req, res) => {
  const productId = req.params.productId;
  Product.findById(productId, (product) => {
    if (!product) return res.redirect("/");
    res.render("admin/editProduct", {
      docTitle: "Edit product",
      path: "/admin/edit-product",
      editing: true,
      product: product
    });
  });
};

exports.postEditProduct = (req, res) => {
  const updatedProduct = new Product(
    req.body.productId,
    req.body.title,
    req.body.imageUrl,
    req.body.description,
    req.body.price
  )
  updatedProduct.save()
  res.redirect("/admin/products")
};

exports.getAdminProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render("admin/products", {
      prods: products,
      docTitle: "Admin Products",
      path: "/admin/products"
    });
  });
};
