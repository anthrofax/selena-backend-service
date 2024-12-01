// const Transactions = require("../models/transaction");
// const { Sequelize } = require("sequelize");
const tf = require("@tensorflow/tfjs");
const Users = require("../models/user");
// const express = require("express");

const getDashboardDataHandler = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id)
    return res
      .status(400)
      .json({ message: `Query Parameter 'user_id' perlu dipass in` });

  let anomalyTransactions = [];
  const user = await Users.findByPk(+user_id);

  if (!user)
    return res
      .status(400)
      .json({ message: `User dengan id ${user_id} tidak tersedia.` });

  const model = req.app.model;

  const userTransactions = await user.getTransactions();

  const expenseTransactions = userTransactions.filter(
    ({ dataValues }) => dataValues.transaction_type === "expense"
  );
  console.log(expenseTransactions);

  const totalIncome = userTransactions
    .filter(({ dataValues }) => dataValues.transaction_type === "income")
    .reduce((acc, { dataValues }) => acc + dataValues.amount, 0);
  const totalExpense = expenseTransactions.reduce(
    (acc, { dataValues }) => acc + dataValues.amount,
    0
  );

  if (expenseTransactions.length > 1) {
    const formatExpenseTransactions = expenseTransactions.map(
      ({ dataValues }) => {
        const { transaction_id, amount, date } = dataValues;

        return {
          date,
          amount,
          transactionId: transaction_id,
        };
      }
    );

    // // Proses data
    const { normalizedData, minValues, maxValues } = preprocessData(
      formatExpenseTransactions
    );

    // // Latih model
    await trainModel(model, normalizedData, 100);

    // // Deteksi anomali dengan persentil yang ditentukan (misalnya, 95)
    anomalyTransactions = await detectAnomalies(
      model,
      normalizedData,
      minValues,
      maxValues,
      formatExpenseTransactions,
      99
    );

    anomalyTransactions = JSON.parse(anomalyTransactions).map(
      (anomalyTransaction) => ({
        date: anomalyTransaction.date,
        amount: anomalyTransaction.amount,
        catatan:
          expenseTransactions.find(
            ({ dataValues }) =>
              dataValues.transaction_id === anomalyTransaction.transactionId
          )?.catatan || "",
      })
    );
  }

  res.status(200).json({
    message: "Data analisis berhasil diambil",
    totalIncome,
    totalExpense,
    financialAdvice:
      totalExpense > totalIncome
        ? "Pengeluaran Anda melebihi pendapatan, pertimbangkan untuk mengurangi pengeluaran."
        : "Keuangan Anda sehat, pertimbangkan untuk menabung lebih banyak.",
    anomalyTransactions,
  });
};

// Fungsi untuk melatih model
async function trainModel(model, trainData, epochs = 10) {
  model.compile({
    optimizer: tf.train.adam(),
    loss: "meanSquaredError",
  });

  const batchSize = 32;

  // Latih model
  for (let epoch = 0; epoch < epochs; epoch++) {
    const history = await model.fit(trainData, trainData, {
      epochs: 1,
      batchSize: batchSize,
      validationSplit: 0.1,
      shuffle: true,
    });

    console.log(`Epoch ${epoch + 1}: loss = ${history.history.loss[0]}`);
  }

  console.log("Pelatihan selesai!");
  return model;
}

// Fungsi untuk preprocessing data dan mengembalikan nilai min dan max
function preprocessData(rawData) {
  const processedData = rawData.map((entry) => {
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();
    const dayOfYear = Math.floor(
      (date - new Date(date.getFullYear(), 0, 0)) / 86400000
    );

    return [entry.amount, dayOfWeek, month, dayOfMonth, year, dayOfYear];
  });

  const dataTensor = tf.tensor2d(processedData);
  const minValues = dataTensor.min(0);
  const maxValues = dataTensor.max(0);
  const normalizedData = dataTensor
    .sub(minValues)
    .div(maxValues.sub(minValues));

  // Mengembalikan data normalisasi dan nilai min/max
  return { normalizedData, minValues, maxValues, processedData };
}

// Fungsi untuk mendeteksi anomali berdasarkan rekonstruksi error
async function detectAnomalies(
  model,
  data,
  minValues,
  maxValues,
  rawData,
  percentileThreshold = 97
) {
  // Prediksi rekonstruksi data
  const reconstructed = model.predict(data);
  const reconstructionError = data.sub(reconstructed).square().mean(1); // MSE per data point

  // Menentukan threshold untuk anomali
  const sortedErrors = await reconstructionError.array();
  const thresholdIndex = Math.floor(
    sortedErrors.length * (percentileThreshold / 100)
  );
  const threshold = sortedErrors.sort((a, b) => a - b)[thresholdIndex];

  // Mengidentifikasi data dengan error lebih besar dari threshold
  const anomalies = rawData
    .map((entry, index) => {
      const error = reconstructionError.arraySync()[index];
      if (error > threshold) {
        return {
          date: entry.date,
          amount: entry.amount,
          transactionId: entry.transactionId,
        };
      }
      return null;
    })
    .filter((anomaly) => anomaly !== null);

  // Mengembalikan anomali dalam format JSON
  return JSON.stringify(anomalies, null, 2); // Menyusun JSON yang lebih terstruktur
}

module.exports = getDashboardDataHandler;
