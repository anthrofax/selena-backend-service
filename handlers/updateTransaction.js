const Transactions = require("../models/transaction"); // Import model Transactions

const updateTransactionHandler = async (req, res) => {
  const { transactionId } = req.params;
  const {  amount, transaction_type, date, catatan } = req.body;

  // Validate required fields
  if (!amount || !transaction_type || !date) {
    return res.status(400).json({
      message:
        "Missing required fields: amount, transaction_type, and date are required",
    });
  }

  // Validate transaction type
  if (!["income", "expense"].includes(transaction_type)) {
    return res.status(400).json({
      message:
        "Invalid transaction_type. It must be either 'income' or 'expense'",
    });
  }

  try {
    // Find the existing transaction by transactionId
    const existingTransaction = await Transactions.findByPk(transactionId);

    if (!existingTransaction) {
      return res.status(404).json({
        message: `Transaction with ID ${transactionId} not found`,
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
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateTransactionHandler;
