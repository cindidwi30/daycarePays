const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function insertAdmin() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const existing = await User.findOne({ email: "admin@example.com" });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("123456789", 10);
    await User.create(
      {
        name: "admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      },
      {
        name: "caregiver",
        email: "caregiver@gmail.com",
        password: hashedPassword,
        role: "caregiver",
      }
    );
    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️ Admin already exists");
  }

  mongoose.disconnect();
}

insertAdmin();
