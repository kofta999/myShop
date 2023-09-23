const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/errors");
const User = require("./models/user");
const { error } = require("console");

require("dotenv").config();

const app = express();
const store = new MongoDBStore({
  uri: process.env.DATABASE_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "Hi bro",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(shopRoutes);
app.use("/admin", adminRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  res.status(500).render("500", {
    docTitle: "Internal server error",
    path: "/500",
    isAuthenticated: req.isLoggedIn,
  });
});

mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => app.listen(3000, () => console.log("Connected on port 3000")))
  .catch((err) => console.log(err));
