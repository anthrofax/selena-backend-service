const Transactions = require("../models/transaction"); // Import model Transactions

const createTransactionHandler = async (req, res) => {
  const { user_id, amount, transaction_type, date, catatan } = req.body;

  // Validate required fields
  if (!user_id || !amount || !transaction_type || !date) {
    return res.status(400).json({
      message:
        "Missing required fields: user_id, amount, transaction_type, and date are required",
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
    // Create the new transaction using Sequelize's create method
    const newTransaction = await Transactions.create({
      user_id,
      amount,
      transaction_type,
      date,
      catatan: catatan || null, // Optional field
    });

    // Respond with success
    res.status(201).json({
      message: "Transaction added successfully",
      transaction_id: newTransaction.transaction_id, // Return the created transaction's ID
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = createTransactionHandler;