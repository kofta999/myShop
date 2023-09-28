const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Order = require("../models/order");
const Product = require("../models/product");

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  let totalItems

  Product.countDocuments()
    .then((num) => {
      totalItems = num
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/listProducts", {
        prods: products,
        docTitle: "products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getProduct = (req, res, next) => {
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  let totalItems

  Product.countDocuments()
    .then((num) => {
      totalItems = num
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        docTitle: "Homepage",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCart = (req, res, next) => {
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .deleteItemFromCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    docTitle: "Checkout",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getOrders = (req, res, next) => {
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postOrder = (req, res, next) => {
  return req.user
    .addOrder()
    .then(() => res.redirect("/orders"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId, undefined, { populate: "items.productId" })
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user._id === req.user._id.toString()) {
        return next(new Error("Unauthorized."));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", { underline: true });
      pdfDoc.text("---------------------");
      let totalPrice = 0;
      order.items.forEach((item) => {
        totalPrice += item.quantity * item.productId.price;
        pdfDoc
          .fontSize(14)
          .text(
            item.productId.title +
              " - " +
              item.quantity +
              " x " +
              "$" +
              item.productId.price
          );
      });
      pdfDoc.text("---");
      pdfDoc.fontSize(20).text("Total price $" + totalPrice);
      pdfDoc.end();
    })
    .catch((err) => next(err));
};
