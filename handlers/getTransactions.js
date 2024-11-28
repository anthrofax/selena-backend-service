const Transactions = require("../models/transaction"); // Import model Transactions
const { Sequelize } = require("sequelize");

const getTransactionsHandler = async (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  try {
    // Build the filter criteria using Sequelize's where condition
    const filter = {};

    if (user_id) {
      filter.user_id = +user_id;
    }

    if (start_date) {
      filter.date = { [Sequelize.Op.gte]: start_date }; // Greater than or equal to start_date
    }

    if (end_date) {
      filter.date = { ...filter.date, [Sequelize.Op.lte]: end_date }; // Less than or equal to end_date
    }

    // Get the transactions from the database using Sequelize's findAll
    const transactions = await Transactions.findAll({
      where: filter, // Applying the dynamic filter
    });

    if (transactions.length < 1) {
      console.log('test')
      return res.status(404).json({
        message: "Data yang anda cari tidak ditemukan.",
      });
    }

    res.status(200).json({
      message: "Transaksi yang anda cari ditemukan.",
      data: transactions,
    });
  } catch (error) {
    console.error("Terdapat kesalahan dalam mengambil data transaksi:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getTransactionsHandler;
