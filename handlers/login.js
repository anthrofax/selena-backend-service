const bcrypt = require("bcrypt");
const Users = require("../models/user"); // Import model Users

const loginHandler = async (req, res) => {
  const { email, password } = req.body;

  // Validasi field yang diperlukan
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    // Periksa apakah pengguna ada dengan email yang diberikan
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Bandingkan password yang diberikan dengan password_hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Jika login berhasil, kirimkan informasi pengguna
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = loginHandler;