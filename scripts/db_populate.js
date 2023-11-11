require("dotenv").config();
const mysql = require("mysql2/promise");
const { getPasswordHash } = require("../util");

const action = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true,
    },
  });

  await db.execute("insert into users(username, password) values (?, ?);", [
    "user",
    await getPasswordHash("devdevdev"),
  ]);

  await db.execute("insert into users(username, password) values (?, ?);", [
    "admin",
    await getPasswordHash("admin"),
  ]);

  db.destroy();
};

action();
