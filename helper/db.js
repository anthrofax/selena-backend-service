const { Sequelize } = require("sequelize");

console.log(process.env.DB_PASSWORD);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, "", {
  dialect: "mysql",
  host: process.env.DB_HOST,
});

module.exports = sequelize;
