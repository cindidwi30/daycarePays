const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyToken,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

module.exports = router;

router.get("/verify", verifyToken);
