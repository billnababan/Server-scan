const Router = require("express").Router();

const { updateUser, deleteUser, updateUserForgetPassword } = require("../controllers/UserController");
const { getRegister, login, Register, getAllUser, authenticateToken } = require("../controllers/auth");

Router.get("/usersid/:id", getRegister);

Router.get("/getAll", authenticateToken, getAllUser);
Router.post("/register", [Register]);
Router.post("/login", [login]);
Router.put("/updateUsers/:id", updateUser);
Router.delete("/deleteUsers/:id", deleteUser);

module.exports = Router;
