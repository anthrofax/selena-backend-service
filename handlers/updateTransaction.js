const Transactions = require("../models/transaction"); // Import model Transactions

const updateTransactionHandler = async (req, res) => {
  const { transactionId } = req.params;
  const { amount, transaction_type, date, catatan } = req.body;

  // Validate required fields
  if (!amount || !transaction_type || !date) {
    return res.status(400).json({
      message:
        "Field yang diperlukan ada yang belum diisi: jumlah, jenis_transaksi, dan tanggal harus diisi",
    });
  }

  // Validate transaction type
  if (!["income", "expense"].includes(transaction_type)) {
    return res.status(400).json({
      message:
        "jenis_transaksi tidak valid. Harus berupa 'income' atau 'expense'",
    });
  }

  try {
    // Find the existing transaction by transactionId
    const existingTransaction = await Transactions.findByPk(transactionId);

    if (!existingTransaction) {
      return res.status(404).json({
        message: `Transaksi dengan ID ${transactionId} tidak ditemukan`,
      });
    }

    // Update the transaction
    const updatedTransaction = await existingTransaction.update({
      amount,
      transaction_type,
      date,
      catatan: catatan || existingTransaction.catatan, // Keep existing catatan if not provided
    });

    // Respond with success
    res.status(200).json({
      message: "Transaksi berhasil diperbarui",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat memperbarui transaksi:", error);
    res.status(500).json({ message: "Kesalahan di server" });
  }
};

module.exports = updateTransactionHandler;
