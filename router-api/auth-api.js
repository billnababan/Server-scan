const Auth = require("express").Router();

const { updateUser, deleteUser, updateUserForgetPassword } = require("../controllers/UserController");
const { getRegister, login, Register, getAllUser, authenticateToken } = require("../controllers/auth");

Auth.get("/users/:id", getRegister);

Auth.get("/users", authenticateToken, getAllUser);
Auth.post("/users", [Register]);
Auth.post("/users", [login]);
Auth.put("/users/:id", updateUser);
Auth.delete("/users/:id", deleteUser);

module.exports = Auth;
