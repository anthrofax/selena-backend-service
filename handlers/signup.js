const bcrypt = require("bcrypt");
const crypto = require("crypto");

const Users = require("../models/user");
const transporter = require("../helper/emailTransporter");
const redis = require("../helper/redis");

exports.signupHandler = async (req, res) => {
  const { name, email, password } = req.body;

  // Pastikan semua kolom diisi
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Nama, email, dan password perlu diisi!",
    });
  }

  if (password.length < 8)
    return res.status(400).json({
      message: "Password harus berjumlah 8 karakter.",
    });

  try {
    // Periksa apakah email sudah terdaftar
    const existingUser = await Users.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        message: "Email sudah terdaftar!",
      });
    }

    // Generate OTP acak (6 digit angka)
    const otp = crypto.randomInt(100000, 999999);
    const otpExpiration = 15 * 60; // Waktu kedaluwarsa dalam detik (15 menit)

    // Simpan OTP di Redis dengan waktu kedaluwarsa
    await redis.setex(email, otpExpiration, otp);

    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifikasi OTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          width: 100%;
          padding: 20px;
          text-align: center;
          background-color: #ffffff;
        }
        .otp-box {
          margin: 20px auto;
          padding: 15px;
          border: 1px solid #ddd;
          display: inline-block;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .otp {
          font-size: 32px;
          font-weight: bold;
          color: #4CAF50;
        }
        .footer {
          font-size: 14px;
          color: #888;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verifikasi OTP untuk Akun Anda</h2>
        <p>Halo ${name},</p>
        <p>Kami menerima permintaan untuk memverifikasi akun Anda. Gunakan OTP berikut untuk menyelesaikan proses registrasi atau login Anda:</p>
        
        <div class="otp-box">
          <p class="otp">${otp}</p>
        </div>

        <p>OTP ini berlaku selama 15 menit. Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.</p>

        <div class="footer">
          <p>Salam hangat,</p>
          <p>Selena</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Selena | Seller Finance Analytics Solutions",
      html: htmlTemplate,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({
          message: `Gagal mengirim OTP. Coba lagi. ${error}`,
        });
      }
      res.status(200).json({
        message: "OTP telah dikirim ke email Anda. Harap verifikasi.",
        user: {
          name,
          email,
          password,
        },
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan di server", error: error.message });
  }
};

exports.verifyOtpHandler = async (req, res) => {
  const { otp, name, email, password } = req.body;

  if (!name || !email || !password || !otp) {
    return res.status(400).json({
      message:
        "Nama, email, password, ataupun OTP tidak lengkap di Request Body!",
    });
  }

  try {
    // Ambil OTP dari Redis
    const storedOtp = await redis.get(email);

    if (!storedOtp) {
      return res
        .status(400)
        .json({ message: "OTP tidak ditemukan atau sudah kedaluwarsa." });
    }

    // Verifikasi OTP
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "OTP tidak valid." });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna baru
    await Users.create({
      name,
      email,
      password_hash: hashedPassword,
    });

    // Kirimkan respons dengan data pengguna
    res.status(201).json({
      message: "Pendaftaran akun berhasil!",
    });

    // Hapus OTP dari Redis setelah registrasi berhasil
    await redis.del(email);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan di server", error: error.message });
  }
};
