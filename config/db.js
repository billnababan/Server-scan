const mysql = require("mysql2/promise");
require("dotenv").config();
const db = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  database: "skripsi",
  password: "29092002",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

const SECRET = process.env.SECRET_TOKEN ?? "-9ijdqijd293&^2";

async function query(query, value) {
  try {
    const [results] = await db.query(query, value ?? []);
    return results || null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  db,
  query,
  SECRET,
};
