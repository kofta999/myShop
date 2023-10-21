const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Order = require("../models/order");
const Product = require("../models/product");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  let totalItems;

  Product.countDocuments()
    .then((num) => {
      totalItems = num;
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
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  let totalItems;

  Product.countDocuments()
    .then((num) => {
      totalItems = num;
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
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  let products;
  let total;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      total = 0;
      products = user.cart.items;
      products.forEach((prod) => {
        total += prod.quantity * prod.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            price_data: {
              unit_amount: p.productId.price * 100,
              currency: "usd",
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
            },
            quantity: p.quantity,
          };
        }),
        mode: "payment",
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success", // http://localhost:3000
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        docTitle: "Checkout",
        products: products,
        totalPrice: total,
        isAuthenticated: req.session.isLoggedIn,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user._id": req.user._id })
    // .populate("items.productId")
    .then((orders) => {
      console.log(orders);
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
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, productId: { ...i.productId._doc } };
      });
      console.log(products);
      const order = new Order({
        user: {
          email: req.user.email,
          _id: req.user
        },
        items: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      console.log(order);
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
