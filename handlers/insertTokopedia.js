const xlsx = require("xlsx");
const Transactions = require("../models/transaction"); // Import model Transactions
const Users = require("../models/user"); // Import model Users jika perlu validasi user_id

const insertTokopediaHandler = async (req, res) => {
  const file = req.file; // File yang diunggah
  const userId = req.body.user_id; // User ID dari request body

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Cek apakah user_id valid (opsional, jika perlu validasi user_id)
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Membaca file Excel dari buffer (tanpa menyimpan ke disk)
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Konversi data Excel ke JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Memproses data menjadi transaksi
    const transactions = data.map((row) => ({
      user_id: userId,
      amount: parseFloat(row["Jumlah Transaksi"] || 0),
      transaction_type: "income", // Menganggap semua transaksi adalah "income"
      date: row["Tanggal Transaksi"],
      catatan: row["Deskripsi Transaksi"] || "",
    }));

    // Simpan data ke database menggunakan Sequelize
    await Transactions.bulkCreate(transactions);

    res.status(200).json({
      message: "Transactions imported successfully",
      transactionsCount: transactions.length,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = insertTokopediaHandler;
