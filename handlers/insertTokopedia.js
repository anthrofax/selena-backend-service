/* eslint-disable no-unused-vars */
const xlsx = require("xlsx");
const Transactions = require("../models/transaction");
const Users = require("../models/user");

const insertTokopediaHandler = async (req, res) => {
  const userId = req.body.user_id; // User ID dari request body
  const file = req.file; // File yang diunggah

  if (!userId) {
    return res.status(400).json({ message: "User ID diperlukan" });
  }

  if (!file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah" });
  }

  try {
    // Cek apakah user_id valid (opsional, jika perlu validasi user_id)
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Membaca file Excel dari buffer (tanpa menyimpan ke disk)
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (worksheet["A1"].v !== "Nama Toko") {
      return res.status(400).json({
        message:
          "Excel yang anda upload bukan hasil export dari halaman 'Daftar Pesanan' di Tokopedia. Silahkan upload excel yang valid.",
      });
    }

    // Ambil informasi range yang ada datanya dari sheet
    const range = worksheet["!ref"];

    // Mendapatkan baris pertama dan terakhir dari range
    const [startCell, endCell] = range.split(":");
    const endRow = parseInt(endCell.replace(/[^\d]/g, ""));

    // Mengonversi data mulai dari baris ke-5 hingga baris terakhir
    const data = xlsx.utils.sheet_to_json(worksheet, {
      range: `A5:AV${endRow}`, // Dinamis: mulai dari baris ke-5 hingga akhir
      blankrows: false,
    });

    // Memproses data menjadi transaksi
    const transactions = data
      .filter((row) => row["Status Terakhir"] === "Pesanan Selesai")
      .map((row) => {
        // Pastikan row["Tanggal Pesanan Selesai"] adalah tanggal yang valid
        const date = new Date(row["Tanggal Pesanan Selesai"]);

        // Cek apakah date valid
        const formattedDate = !isNaN(date)
          ? date.toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);

        return {
          user_id: userId,
          amount: parseFloat(
            row["Total Penjualan (IDR)"] - row["Total Pengurangan (IDR)"] || 0
          ),
          transaction_type: "income", // Menganggap semua transaksi adalah "income"
          date: formattedDate,
          catatan: `Penjualan Tokopedia | ${
            row["Nomor Invoice"] ? `Invoice: ${row["Nomor Invoice"]} | ` : ""
          } ${row["Nama Produk"] ? `Produk: ${row["Nama Produk"]}` : ""}`,
        };
      });

    console.log(transactions);
    await Transactions.bulkCreate(transactions);

    res.status(200).json({
      message: "Transaksi berhasil diimpor",
      totalTransaksi: transactions.length,
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat memproses file:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server" });
  }
};

module.exports = insertTokopediaHandler;
