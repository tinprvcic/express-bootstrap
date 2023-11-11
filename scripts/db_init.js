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
    "create table users (user_id int primary key auto_increment, username varchar(40) not null unique, password varchar(60) not null, xss_enabled boolean not null default 0, sde_enabled boolean not null default 0);"
  );

  await db.execute(
    "create table posts (post_id int primary key auto_increment, content varchar(255), user_id int not null, key user_id_idx (user_id));"
  );

  db.destroy();
};

action();
