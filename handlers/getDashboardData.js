// const Transactions = require("../models/transaction");
// const { Sequelize } = require("sequelize");
// const tf = require("@tensorflow/tfjs");
// const express = require('express')

// const app = express();

// const getDashboardDataHandler = async (req, res) => {
//   const { user, month, year } = req.query;

//   // Pastikan query parameter ada
//   if (!user || !month || !year) {
//     return res
//       .status(400)
//       .send({ error: "Pengguna, bulan, dan tahun wajib diisi" });
//   }

//   try {
//     const data = await getFinancialData(user, month, year);
//     res.status(200).send(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ error: "Terjadi kesalahan di server" }, err);
//   }
// };

// // Fungsi untuk memproses data dan membuat prediksi
// async function getFinancialData(userId, month, year) {
//   // Ambil data transaksi berdasarkan user, bulan, dan tahun
//   const transactions = await Transactions.findAll({
//     where: {
//       user_id: userId,
//       date: {
//         [Sequelize.Op.gte]: `${year}-${month}-01`,
//         [Sequelize.Op.lte]: `${year}-${month}-31`,
//       },
//     },
//   });

//   // Pisahkan transaksi pendapatan dan pengeluaran
//   const income = [];
//   const expense = [];
//   transactions.forEach((transaction) => {
//     if (transaction.transaction_type === "income") {
//       income.push([transaction.amount, new Date(transaction.date).getTime()]);
//     } else {
//       expense.push([transaction.amount, new Date(transaction.date).getTime()]);
//     }
//   });

//   console.log(income);
//   console.log(expense);

//   // Hitung total income dan expense
//   const totalIncome = income.reduce((acc, curr) => acc + curr[0], 0);
//   const totalExpense = expense.reduce((acc, curr) => acc + curr[0], 0);

//   console.log(totalIncome);
//   console.log(totalExpense);

//   // Panggil model untuk memberikan saran keuangan dan deteksi anomali
//   const financialAdvice = await getFinancialAdvice(totalIncome, totalExpense);
//   const anomalyDetection = await detectAnomaly([...income, ...expense]);

//   console.log(financialAdvice);
//   console.log(anomalyDetection);

//   return {
//     cashflow_analysis: 1,
//   };
// }

// // Fungsi untuk memberi saran keuangan
// async function getFinancialAdvice(totalIncome, totalExpense) {
//   let advice = "";
//   if (totalIncome > totalExpense) {
//     advice = "Keuangan Anda sehat, pertimbangkan untuk menabung lebih banyak.";
//   } else {
//     advice =
//       "Pengeluaran Anda melebihi pendapatan, pertimbangkan untuk mengurangi pengeluaran.";
//   }
//   return advice;
// }

// // Fungsi untuk deteksi anomali
// async function detectAnomaly(transactions) {
//   // Contoh deteksi anomali menggunakan model ML
//   const inputTensor = tf.tensor2d(transactions, [transactions.length, 2]);
// const model = app.expenseModel
//   const predictions = model.predict(inputTensor);

//   // Deteksi anomali berdasarkan hasil prediksi
//   const anomalies = predictions
//     .dataSync()
//     .filter((prediction) => prediction > 1); // Contoh threshold

//   return anomalies.length > 0
//     ? "Terdeteksi anomali pada pengeluaran"
//     : "Tidak ada anomali terdeteksi";
// }

// module.exports = getDashboardDataHandler;