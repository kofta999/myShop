const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/errors");
const { mongoConnect } = require("./util/db");
const User = require("./models/user");

const app = express();
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("64f36be47aaa84dd17d6bd1c")
    .then((user) => {
      req.user = new User(user.username, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log("h1", err));
});

app.use(shopRoutes);
app.use("/admin", adminRoutes);
app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000, () => console.log("Connected on port 3000"));
});
