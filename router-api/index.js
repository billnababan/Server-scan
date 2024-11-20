const express = require("express");
const Auth = require("./auth-api");
const Result = require("./result");

const Router = express();
const api = "/api/v1";

Router.use(api, Auth);
Router.use(api, Result);

module.exports = Router;
