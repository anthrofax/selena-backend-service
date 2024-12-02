const Transactions = require("../models/transaction"); // Import model Transactions

const getTransactionDetailHandler = async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Find the transaction by primary key (transaction_id)
    const transaction = await Transactions.findByPk(transactionId);

    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({
        message: `Transaksi dengan ID ${transactionId} tidak ditemukan`,
      });
    }

    // Respond with transaction details
    res.status(200).json({
      message: "Transaksi yang anda cari ditemukan",
      data: transaction,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan di server.", error: error.message });
  }
};

module.exports = getTransactionDetailHandler;
