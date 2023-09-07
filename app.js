const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/errors");
const User = require("./models/user");
require("dotenv").config();

const app = express();
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("64f877a14a8dbf04d6e3c772")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log("h1", err));
});

app.use(shopRoutes);
app.use("/admin", adminRoutes);
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
