const Transactions = require("../models/transaction"); // Import model Transactions
const { Sequelize } = require("sequelize");

const getTransactionsHandler = async (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  if (!user_id)
    return res
      .status(400)
      .json({ message: `Query Parameter 'user_id' perlu dipass in` });

  try {
    // Build the filter criteria using Sequelize's where condition
    const filter = {};

    filter.user_id = +user_id;

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
      return res.status(404).json({
        message: "Data yang anda cari tidak ditemukan.",
      });
    }

    res.status(200).json({
      message: "Transaksi yang anda cari ditemukan.",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan di server", error :error.message });
  }
};

module.exports = getTransactionsHandler;
