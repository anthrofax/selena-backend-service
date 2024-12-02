const Transactions = require("../models/transaction"); // Import model Transactions

const deleteTransactionHandler = async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Find the transaction by its primary key (transactionId)
    const existingTransaction = await Transactions.findByPk(transactionId);

    if (!existingTransaction) {
      return res.status(404).json({
        message: `Transaksi dengan ID ${transactionId} tidak ditemukan`,
      });
    }

    // Delete the transaction
    await existingTransaction.destroy();

    // Respond with success
    res.status(200).json({
      message: `Transaksi dengan ID ${transactionId} berhasil dihapus`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Kesalahan di server", error: error.message });
  }
};

module.exports = deleteTransactionHandler;
