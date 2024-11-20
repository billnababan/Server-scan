const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
require("dotenv").config();

const { SECRET } = require("../config/db");

const ROLES_NUMBER = {
  CLIENT: "8912",
  ADMIN: "6501",
};

const ROLES_NAME = {
  CLIENT: "CLIENT",
  ADMIN: "ADMIN",
};

const getRegister = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  try {
    const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;
    if (!token) return res.status(401).json({ success: false, message: "Akses ditolak. Token tidak disediakan." });
    jwt.verify(token, SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ success: false, message: "Token tidak valid." });

      const userExists = await query("SELECT * FROM users WHERE id = ?", [userId]);
      res.json({ status: "ok", userId: userExists });
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get role", status: "failed" });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;
  if (!token) return res.status(401).json({ success: false, message: "Akses ditolak. Token tidak disediakan." });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Token tidak valid." });
    req.user = decoded;
    next();
  });
};

// Controller

const getAllUser = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== ROLES_NAME.ADMIN) {
      return res.status(403).json({ success: false, message: "Akses ditolak. Anda tidak memiliki izin untuk mengakses data pengguna." });
    }
    const roles = await query("SELECT * FROM users");
    res.json({ status: "ok", roles: roles });
  } catch (error) {
    res.status(500).json({ message: "Failed to Get All Users", status: "failed" });
  }
});

const Register = asyncHandler(async (req, res) => {
  let roleId = 1;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    if (req.body.role_id) {
      roleId = parseInt(req.body.role_id);

      // Validate the roleId
      if (isNaN(roleId) || roleId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Role ID tidak valid",
        });
      }
    }

    if (req.body.password !== req.body.confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Konfirmasi Password tidak cocok!",
      });
    }

    let data = await query(
      `
      INSERT INTO users (id_uuid, fullname, email, password, role_id)
      VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), req.body.fullname, req.body.email, hashPassword, roleId]
    );

    if (!data || data.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Error saat registrasi",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...req.body,
      },
      message: "Registrasi berhasil!",
      redirect: "/login",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error saat registrasi bre",
    });
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const user = await query(
      `
        SELECT u.id, u.id_uuid, u.fullname, u.email, u.password, r.name AS role
        FROM users AS u
        JOIN user_roles AS r ON u.role_id = r.id
        WHERE u.email = ?;
      `,
      [req.body.email]
    );

    if (user.length > 0) {
      const userData = user[0];

      const isPasswordValid = await bcrypt.compare(req.body.password, userData.password);

      if (isPasswordValid) {
        const token = jwt.sign(
          {
            fullname: userData.fullname,
            email: userData.email,
            role: userData.role,
            id_uuid: userData.id_uuid,
          },
          SECRET,
          { expiresIn: "1h", algorithm: "HS256" }
        );

        const { password, ...userWithoutPassword } = userData;

        res.cookie("token", token, { httpOnly: true });
        res.json({
          success: true,
          message: "Login berhasil",
          user: userWithoutPassword,
          token: token,
          access: userWithoutPassword.role === ROLES_NAME.ADMIN ? ROLES_NUMBER.ADMIN : ROLES_NUMBER.CLIENT,
        });
      } else {
        res.status(400).json({ success: false, message: "Email atau Password salah!" });
      }
    } else {
      res.status(400).json({ success: false, message: "Email atau Password salah!" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = {
  getRegister,
  getAllUser,
  Register,
  login,
  authenticateToken,
};
