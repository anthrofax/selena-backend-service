const bcrypt = require("bcrypt");
const Users = require("../models/user"); // Import model Users

const signupHandler = async (req, res) => {
  const { name, email, password } = req.body;

  // Validasi field yang diperlukan
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  try {
    // Periksa apakah email sudah terdaftar
    const existingUser = await Users.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna baru
    const newUser = await Users.create({
      name,
      email,
      password_hash: hashedPassword,
    });

    // Respond dengan data pengguna baru
    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = signupHandler;
