require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const morgan = require("morgan");
const path = require("path");
const Router = require("./router-api/index.js");

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb" }));
app.use(cors({ origin: "*" }));
app.use(Router);

app.listen(process.env.APP_PORT, () => {
  console.log(`Server is Running on port ${process.env.APP_PORT} http://localhost:${process.env.APP_PORT}`);
});
