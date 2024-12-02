/* eslint-disable no-unused-vars */

const xlsx = require("xlsx");
const Transactions = require("../models/transaction"); // Import model Transactions
const Users = require("../models/user"); // Import model Users jika perlu validasi user_id
const validateExcelRange = require("../helper/checkValidExcel");

exports.insertShopeeSalesHandler = async (req, res) => {
  const file = req.file; // File yang diunggah
  const userId = req.body.user_id; // User ID dari request body

  if (!file) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah." });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID diperlukan." });
  }

  try {
    // Cek apakah user_id valid (opsional, jika perlu validasi user_id)
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Membaca file Excel dari buffer (tanpa menyimpan ke disk)
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (worksheet["A1"].v !== "No. Pesanan") {
      return res.status(400).json({
        message:
          "Excel yang anda upload bukan hasil export dari halaman 'Pesanan Saya' di Shopee. Silahkan upload excel yang valid.",
      });
    }

    // Ambil informasi range yang ada datanya dari sheet
    const range = worksheet["!ref"];

    // Mengonversi data mulai dari baris ke-5 hingga baris terakhir
    const data = xlsx.utils.sheet_to_json(worksheet, {
      range,
      blankrows: false,
    });

    console.log(data);

    // Memproses data menjadi transaksi
    const transactions = data
      .filter((row) => row["Status Pesanan"] === "Selesai")
      .map((row) => {
        const date = new Date(row["Waktu Pesanan Selesai"]);

        // Cek apakah date valid
        const formattedDate = !isNaN(date)
          ? date.toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);

        return {
          user_id: userId,
          amount: parseInt(row["Total Harga Produk"] * 1000) || 0,
          transaction_type: "income",
          date: formattedDate,
          catatan: `Penjualan Shopee | ${
            row["No. Pesanan"] ? `Invoice: ${row["No. Pesanan"]} | ` : ""
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
    res.status(500).json({ message: "Terjadi kesalahan di server", error :error.message });
  }
};

exports.insertShopeeBalanceHandler = async (req, res) => {
  const userId = req.body.user_id;
  const file = req.file;

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

    // Cek apakah excel yang diupload merupakan Laporan 'Transaksi Terakhir' hasil export dari halaman 'Saldo Penjual' di Shopee
    const determinedRange = "A18:H18";
    const expectedValues = [
      "Tanggal Transaksi",
      "Tipe Transaksi",
      "Deskripsi",
      "No. Pesanan",
      "Jenis Transaksi",
      "Jumlah",
      "Status",
      "Saldo Akhir",
    ];
    const isValid = validateExcelRange(
      worksheet,
      expectedValues,
      determinedRange
    );

    if (!isValid) {
      return res.status(400).json({
        message:
          "Excel yang anda upload bukan merupakan Laporan 'Transaksi Terakhir' hasil export dari halaman 'Saldo Penjual' di Shopee. Silahkan upload excel yang valid.",
      });
    }

    // Ambil informasi range yang ada datanya dari sheet
    const range = worksheet["!ref"];

    // Mendapatkan baris pertama dan terakhir dari range
    const [startCell, endCell] = range.split(":");
    console.log(endCell);

    // Mengonversi data mulai dari baris ke-5 hingga baris terakhir
    const data = xlsx.utils.sheet_to_json(worksheet, {
      range: `A18:${endCell}`,
      blankrows: false,
    });

    // Memproses data menjadi transaksi
    const transactions = data
      .filter((row) => row["Jenis Transaksi"] === "Transaksi Masuk")
      .map((row) => {
        const date = new Date(row["Tanggal Transaksi"]);

        // Cek apakah date valid
        const formattedDate = !isNaN(date)
          ? date.toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);

        return {
          user_id: userId,
          amount: parseInt(row["Jumlah"]) || 0,
          transaction_type: "income",
          date: formattedDate,
          catatan: `Penjualan Shopee | Toko: ${worksheet["B6"].v} | ${row["Deskripsi"]}`,
        };
      });

    await Transactions.bulkCreate(transactions);

    res.status(200).json({
      message: "Transaksi berhasil diimpor",
      totalTransaksi: transactions.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan di server", error :error.message });
  }
};
