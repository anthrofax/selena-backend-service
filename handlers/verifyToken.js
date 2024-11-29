const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Mengambil token dari header Authorization

  if (!token) {
    return res.status(403).json({ message: "Token diperlukan" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token tidak valid" });
    }

    // Menyimpan informasi user yang didecode dalam req.user untuk digunakan di route berikutnya
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;