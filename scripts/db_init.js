require("dotenv").config();
const mysql = require("mysql2/promise");

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

  await db.execute(
    "create table users (user_id int primary key auto_increment, username varchar(40) not null, password varchar(40) not null);"
  );

  db.destroy();
};

action();
