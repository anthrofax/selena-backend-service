const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Users = require("../models/user"); // Import model Users

const loginHandler = async (req, res) => {
  const { email, password } = req.body;

  // Validasi field yang diperlukan
  if (!email || !password) {
    return res.status(400).json({
      message: "Email dan password diperlukan",
    });
  }

  try {
    // Periksa apakah pengguna ada dengan email yang diberikan
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    // Bandingkan password yang diberikan dengan password_hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email atau password tidak valid",
      });
    }
    
    // Jika login berhasil, buat token JWT
    const payload = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Jika login berhasil, kirimkan informasi pengguna
    res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server" ,error :error.message});
  }
};

module.exports = loginHandler;
