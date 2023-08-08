const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
  res.render("admin/addProduct", {
    docTitle: "Add product",
    path: "/admin/add-product"
  });
};

exports.postAddProduct = (req, res) => {
  const product = new Product(
    req.body.title,
    req.body.imageUrl,
    req.body.description,
    req.body.price
  );
  product.save();
  res.redirect("/");
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
