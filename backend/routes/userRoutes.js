const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // Correctly import userController

// Route to get the count of parent users
router.get("/parent/count", userController.countParentUsers); // Make sure this is correct

module.exports = router;
