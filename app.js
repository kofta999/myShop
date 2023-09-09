const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const MongoDBStore = require("connect-mongodb-session")(session);

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require("./controllers/errors");
const User = require("./models/user");

require("dotenv").config();

const app = express();
const store = new MongoDBStore({
  uri: process.env.DATABASE_URI,
  collection: "sessions",
});

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

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(shopRoutes);
app.use("/admin", adminRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
  .connect(process.env.DATABASE_URI)
  .then((res) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "admin",
          email: "admin@admin.com",
          cart: {
            items: [],
          },
        });
        return user.save();
      }
    });
  })
  .then(() => app.listen(3000, () => console.log("Connected on port 3000")))
  .catch((err) => console.log(err));
