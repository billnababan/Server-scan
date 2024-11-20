const { query } = require("../config/db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { fileDir } = require("../file_handler.cjs");

const asyncHandler = require("express-async-handler");

const updateUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullname, email, password, newPassword, role_id } = req.body;
    let { image } = req.body;

    const userExists = await query("SELECT * FROM users WHERE id = ?", [userId]);
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.file) {
      image = req.file.filename;
    }

    const updateUserQuery = `
      UPDATE users
      SET fullname = ?, email = ?, image = ?, role_id = ?
      ${newPassword ? ", password = ?" : ""} 
      WHERE id = ?
    `;
    const updateUserParams = [fullname, email, image, role_id];
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);
      updateUserParams.push(hashPassword);
    }
    updateUserParams.push(userId);

    await query(updateUserQuery, updateUserParams);

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
});

const updateUserForgetPassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const { password, newPassword, role_id } = req.body;

    const userExists = await query("SELECT * FROM users WHERE id = ?", [userId]);
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user data
    const updateUserQuery = `
      UPDATE users
      SET  role_id = ?
      ${newPassword ? ", password = ?" : ""} 
      WHERE id = ?
    `;
    const updateUserParams = [role_id];
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);
      updateUserParams.push(hashPassword);
    }
    updateUserParams.push(userId);

    await query(updateUserQuery, updateUserParams);

    res.json({
      success: true,
      message: "Update Password User is successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    const userExists = await query("SELECT * FROM users WHERE id = ?", [userId]);
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
});

module.exports = {
  updateUserForgetPassword,
  deleteUser,
  updateUser,
};
