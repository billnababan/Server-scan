const Result = require("express").Router();
const trufflehogController = require("../controllers/newDetect");

Result.post("/deteksi", trufflehogController.detectCredentials);

Result.get("/deteksi", trufflehogController.getAllRepo);
Result.get("/deteksi/:id", trufflehogController.getRepoByUser);
Result.delete("/deteksi/:id", trufflehogController.deleteRepo);
module.exports = Result;
