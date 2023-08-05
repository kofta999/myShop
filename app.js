const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const { engine } = require("express-handlebars");

const app = express();
app.engine("hbs", engine({defaultLayout: "main-layout", extname: "hbs"}));
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(shopRoutes);
app.use("/admin", adminData.routes);

app.use((req, res) => {
  res.status(404).render("404", { docTitle: "Page not found" });
});

app.listen(3000, (req, res) => console.log("connected on port 3000"));
