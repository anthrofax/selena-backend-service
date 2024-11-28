const Transactions = require("../models/transaction"); // Import model Transactions

const getTransactionDetailHandler = async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Find the transaction by primary key (transaction_id)
    const transaction = await Transactions.findByPk(transactionId);

    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({
        message: `Transaction with ID ${transactionId} not found`,
      });
    }

    // Respond with transaction details
    res.status(200).json({
      message: "Transaction retrieved successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error retrieving transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getTransactionDetailHandler;
