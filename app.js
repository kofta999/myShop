const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/errors");
const sequelize = require("./util/db");

const app = express();
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(shopRoutes);
app.use("/admin", adminRoutes);
app.use(errorController.get404);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, (req, res) => console.log("connected on port 3000"));
  })
  .catch((err) => console.log(err));
