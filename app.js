const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(shopRoutes);
app.use("/admin", adminData.routes);

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(3000, (req, res) => console.log("connected on port 3000"));
