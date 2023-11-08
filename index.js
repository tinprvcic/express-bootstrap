require("dotenv").config();

var express = require("express");
var app = express();

app.set("view engine", "ejs");

app.get("/", function (_req, res) {
  res.render("pages/index");
});

app.listen(process.env.PORT || 8080);
console.log("listening");
