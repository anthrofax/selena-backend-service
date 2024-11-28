const { DataTypes } = require("sequelize");
const sequelize = require("../helper/db");

const Transactions = sequelize.define(
  "transactions",
  {
    transaction_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM("income", "expense"),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    updatedAt: true,
  }
);

module.exports = Transactions;
