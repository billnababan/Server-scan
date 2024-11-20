const Router = require("express").Router();
const trufflehogController = require("../controllers/newDetect");

Router.post("/deteksi", trufflehogController.detectCredentials);

Router.get("/allrepo", trufflehogController.getAllRepo);
Router.get("/repoUser/:id", trufflehogController.getRepoByUser);
Router.delete("/deleterepo/:id", trufflehogController.deleteRepo);
module.exports = Router;
