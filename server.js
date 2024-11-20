require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const authApi = require("./router-api/auth-api");

const scannerRoutes = require("./router-api/result");

const morgan = require("morgan");
const path = require("path");

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb" }));
app.use(cors({ origin: "*" }));
app.use("/api/auth", authApi);
app.use("/api/detectt", scannerRoutes);

app.listen(process.env.APP_PORT, () => {
  console.log(`Server is Running on port ${process.env.APP_PORT} http://localhost:${process.env.APP_PORT}`);
});
