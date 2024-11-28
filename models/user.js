const { DataTypes } = require("sequelize");
const sequelize = require("../helper/db");

const Users = sequelize.define(
  "users",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(55),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: false, // Karena sudah ada kolom created_at dan updated_at di SQL,
    createdAt: true,
    updatedAt: true,
  }
);

module.exports = Users;
