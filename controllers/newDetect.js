const { exec } = require("child_process");
const { log, error } = require("console");
const { query } = require("../config/db");
const fs = require("fs");
const { stdout, stderr } = require("process");
const asyncHandler = require("express-async-handler");

const getAllRepo = asyncHandler(async (req, res) => {
  try {
    const dataRepo = await query("SELECT * FROM detail_scanning");
    res.json({ status: "ok", dataRepo: dataRepo });
  } catch (error) {
    console.log(error);
  }
});

const detectCredentials = asyncHandler(async (req, res) => {
  const { url, userId } = req.body;

  try {
    const command = `trufflehog --regex --entropy False ${url} --json`;

    console.log(command);
    console.log(userId);
    exec(command, async (error, stdout, stderr) => {
      const result = {
        repo_url: url,
        credential: stdout,
        date: new Date(),
        user_id: userId,
      };

      await query("INSERT INTO detail_scanning (repo_url, credential, date, user_id) VALUES (?, ?, ?, ?)", [result.repo_url, result.credential, result.date, result.user_id]);

      return res.status(200).json({
        message: "Private key detected!",
        data: result,
      });
    });
  } catch (error) {
    console.error("Error detecting credentials:", error);
    return res.status(500).json({ error: "Error detecting credentials" });
  }
});

const getRepoByUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id; // Ambil ID dari parameter URL

    console.log(userId);

    const credentials = await query("SELECT * FROM detail_scanning WHERE user_id = ?", [userId]);

    if (credentials.length > 0) {
      res.status(200).json({ status: 200, credentials: credentials });
    } else {
      res.status(404).json({ message: "Credential not found", status: "failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get credential from result repo", status: "failed" });
  }
});

const deleteRepo = asyncHandler(async (req, res) => {
  try {
    const repoId = req.params.id;
    const repoExist = await query("SELECT * FROM detail_scanning WHERE id = ?", [repoId]);
    if (repoExist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "data repo not found",
      });
    }
    await query("DELETE FROM detail_scanning where id = ? ", [repoId]);
    res.json({
      success: true,
      message: "data Repository deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting Repository from database",
    });
  }
});

module.exports = {
  getRepoByUser,
  getAllRepo,
  deleteRepo,
  detectCredentials,
};
