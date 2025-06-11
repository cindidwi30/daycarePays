const User = require("../models/User");

// Count the total number of parent users
const countParentUsers = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: "parent" }); // Count all users where role is 'parent'
    res.status(200).json({ count });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Error fetching parent user count",
        error: err.message,
      });
  }
};

module.exports = {
  countParentUsers,
};
