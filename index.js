require("dotenv").config();

const session = require("express-session");
const mysql = require("mysql2/promise");
var express = require("express");
const { getPasswordHash, checkPasswordHash } = require("./util");
var app = express();

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true,
    },
  });

  app.set("view engine", "ejs");

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", async function (req, res) {
    const usersRes = await db.execute("select username, password from users;");

    if (!req.session.isAuthenticated) return res.redirect("login");

    res.render("pages/index", { users: usersRes[0] });
  });

  app.get("/login", async function (req, res) {
    if (req.session.isAuthenticated) return res.redirect("/");

    let error = false;
    if (req.session.loginError) {
      error = true;
      req.session.loginError = undefined;
    }

    res.render("pages/login", { error });
  });

  app.post("/api/login", async function (req, res) {
    const { username, password: plainTextPassword } = req.body;
    const userRes = await db.execute("select * from users where username = ?", [
      username,
    ]);

    const user = userRes[0][0];

    if (!user) {
      req.session.loginError = true;
      return res.redirect("/login");
    }

    if (!(await checkPasswordHash(plainTextPassword, user.password))) {
      req.session.loginError = true;
      return res.redirect("/login");
    }

    req.session.isAuthenticated = true;
    req.session.id = user.id;

    res.redirect("/");
  });

  app.post("/api/logout", function (req, res) {
    req.session.destroy();

    res.redirect("/login");
  });

  // handle 404s
  app.use(function (_req, res) {
    res.status = 404;
    res.render("pages/404");
  });

  app.listen(process.env.PORT || 8080);
  console.log("listening");
}

main();
