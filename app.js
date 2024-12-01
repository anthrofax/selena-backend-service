require("dotenv").config();
const express = require("express");

const router = require("./routes/routes");
const sequelize = require("./helper/db");
const Transactions = require("./models/transaction");
const Users = require("./models/user");
const authRoutes = require("./routes/authRoutes");
// const {
//   loadModel,
//   loadRawDataForPreprocessNeeds,
// } = require("./helper/loadModel");

const app = express();

// (async () => {
//   const model = await loadModel();
//   const rawData = await loadRawDataForPreprocessNeeds();

//   app.model = model;
//   app.rawData = rawData;
// })();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use(router);

app.use("/", (req, res) => {
  console.log("Response success");
  res.send("Response Success!");
});

Transactions.belongsTo(Users, {
  constraints: true,
  foreignKey: "user_id",
  onDelete: "CASCADE",
});
Users.hasMany(Transactions, {
  foreignKey: "user_id",
});

const PORT = process.env.PORT || 8000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

(async () => {
  try {
    await sequelize.sync({ force: true });

    // Cari user dengan user_id = 1, jika tidak ada, buatkan
    let user = await Users.findByPk(1);

    if (!user)
      user = await Users.create({
        name: "Afridho Ikhsan",
        email: "afridhoikhsan@gmail.com",
        password_hash:
          "$2b$10$EEuDaPCj0URNPWV3mW9LiuWcfpgC8wKgiesoEPAJr0taBDI98lIYe",
      });

    // Buat data transaksi awalan setiap kali server mulai
    await user.createTransaction({
      amount: 200000,
      transaction_type: "income",
      date: new Date("2024-11-28"),
      catatan: "Initial deposit",
    });

    await user.createTransaction({
      amount: 50000,
      transaction_type: "expense",
      date: new Date("2024-11-29"),
      catatan: "Purchase",
    });

    // Mulai server
    app.listen(PORT, HOST, () => {
      console.log(`Server started on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.log(`Error synchronizing database: ${error}`);
    console.log(`Server started on ${HOST}:${PORT}`);
  }
})();
