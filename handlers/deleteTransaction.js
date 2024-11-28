const Transactions = require("../models/transaction"); // Import model Transactions

const deleteTransactionHandler = async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Find the transaction by its primary key (transactionId)
    const existingTransaction = await Transactions.findByPk(transactionId);

    if (!existingTransaction) {
      return res.status(404).json({
        message: `Transaction with ID ${transactionId} not found`,
      });
    }

    // Delete the transaction
    await existingTransaction.destroy();

    // Respond with success
    res.status(200).json({
      message: `Transaction with ID ${transactionId} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = deleteTransactionHandler;
