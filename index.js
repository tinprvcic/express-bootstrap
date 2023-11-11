require("dotenv").config();

const session = require("express-session");
var LokiStore = require("connect-loki")(session);
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
      store: new LokiStore(),
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", async function (req, res) {
    if (!req.session.isAuthenticated) return res.redirect("login");

    const usersRes = await db.execute(
      "select username, password, sde_enabled as sde, xss_enabled as xss from users where user_id=?;",
      [req.session.userId]
    );
    const user = usersRes[0][0];

    const postsRes = await db.execute(
      "select post_id as id, content, username as author, users.user_id as authorId from users inner join posts on users.user_id = posts.user_id;"
    );
    const posts = postsRes[0].map((p) => ({
      ...p,
      viewerIsAuthor: p.authorId === req.session.userId,
    }));

    res.render("pages/index", { user, posts });
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
    const userRes = await db.execute(
      "select user_id as id, sde_enabled as sde, password from users where username = ?",
      [username]
    );

    const user = userRes[0][0];

    if (!user) {
      req.session.loginError = true;
      return res.redirect("/login");
    }

    // allow log in when sde is enabled (to not get locked out of the account)
    const isValidPassword = user.sde
      ? plainTextPassword == user.password
      : await checkPasswordHash(plainTextPassword, user.password);

    if (!isValidPassword) {
      req.session.loginError = true;
      return res.redirect("/login");
    }

    req.session.isAuthenticated = true;
    req.session.userId = user.id;

    res.redirect("/");
  });

  app.post("/api/logout", function (req, res) {
    req.session.destroy();

    res.redirect("/login");
  });

  app.post("/api/change_password", async function (req, res) {
    const { password, sde } = req.body;

    const newPassword = sde ? password : await getPasswordHash(password);

    await db.execute(
      "update users set password = ?, sde_enabled = ? where user_id = ?",
      [newPassword, Boolean(sde), req.session.userId]
    );

    res.redirect("/");
  });

  app.post("/api/delete_post/:id", async function (req, res) {
    db.execute("delete from posts where post_id=?", [req.params.id]);

    res.redirect("/");
  });

  app.post("/api/add_post", async function (req, res) {
    const { content } = req.body;

    db.execute("insert into posts(content, user_id) values (?, ?)", [
      content,
      req.session.userId,
    ]);

    res.redirect("/");
  });

  app.post("/api/toggle_xss/:newState", async function (req, res) {
    db.execute("update users set xss_enabled = ? where user_id = ?", [
      req.params.newState === "1" ? true : false,
      req.session.userId,
    ]);

    res.redirect("/");
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
