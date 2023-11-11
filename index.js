require("dotenv").config();

const mysql = require("mysql2/promise");
var express = require("express");
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

  app.get("/", async function (_req, res) {
    const usersRes = await db.execute("select username, password from users;");

    res.render("pages/index", { users: usersRes[0] });
  });

  app.listen(process.env.PORT || 8080);
  console.log("listening");
}

main();
