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
    "ivo",
    await getPasswordHash("devdevdev"),
  ]);

  await db.execute("insert into users(username, password) values (?, ?);", [
    "marko",
    await getPasswordHash("devdevdev"),
  ]);

  await db.execute("insert into users(username, password) values (?, ?);", [
    "ana",
    await getPasswordHash("devdevdev"),
  ]);

  db.destroy();
};

action();
