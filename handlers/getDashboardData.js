// const Transactions = require("../models/transaction");
// const { Sequelize } = require("sequelize");
const tf = require("@tensorflow/tfjs");
// const express = require("express");

const getDashboardDataHandler = async (req, res) => {
//   const { user, month, year } = req.query;
  
  const model = req.app.model
  const rawData = req.app.rawData

  console.log(rawData)

  // Proses data
  const { normalizedData, minValues, maxValues, processedData } =
    preprocessData(rawData);

  // Latih model
  await trainModel(model, normalizedData, 50); // Melatih model selama 50 epoch

  // Deteksi anomali dengan persentil yang ditentukan (misalnya, 95)
  const anomaliesJson = await detectAnomalies(
    model,
    normalizedData,
    minValues,
    maxValues,
    processedData,
    99
  );

  // Menampilkan hasil deteksi anomali dalam bentuk JSON
  console.log(anomaliesJson); 

  res.status(200).json({
    message: "Data berhasil diambil"
  })
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
    console.log(rawData.length)
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

// Fungsi untuk mendeteksi anomali berdasarkan reconstruction error dan mengembalikan hasil dalam format JSON
async function detectAnomalies(
  model,
  dataTensor,
  minValues,
  maxValues,
  processedData,
  percentile = 97
) {
  // Prediksi menggunakan model
  const predictedData = model.predict(dataTensor);

  // Menghitung reconstruction error (selisih antara input dan output)
  const reconstructionError = dataTensor.sub(predictedData).square().sum(1);

  // Ambil array dari reconstruction error
  const errorArray = await reconstructionError.data();

  // Urutkan error untuk mendapatkan threshold persentil yang ditentukan
  const sortedErrors = errorArray.sort((a, b) => a - b);
  const threshold =
    sortedErrors[Math.floor(sortedErrors.length * (percentile / 100))];

  // Menyaring data yang lebih besar dari threshold
  const anomalies = [];
  for (let i = 0; i < errorArray.length; i++) {
    if (errorArray[i] > threshold) {
      // Denormalisasi data
      const denormalizedData = dataTensor
        .slice([i, 0], [1, -1])
        .mul(maxValues.sub(minValues))
        .add(minValues);

      // Ambil data dari hasil denormalisasi dan masukkan kembali kolom 'date'
      const denormalizedArray = denormalizedData.arraySync()[0];

      const anomaly = {
        index: i,
        data: {
          amount: denormalizedArray[0], // amount
        },
        reconstruction_error: errorArray[i], // Tambahkan nilai error
      };

      // Konversi kembali ke tanggal (menggunakan data yang denormalisasi)
      const { amount } = anomaly.data;
      const date = new Date(
        denormalizedArray[4],
        denormalizedArray[2],
        denormalizedArray[3]
      ); // Menggunakan data year, month, day_of_month

      // Format tanggal menjadi yyyy-mm-dd
      const formattedDate = date.toISOString().split("T")[0]; // Mengambil tanggal dalam format yyyy-mm-dd
      anomaly.data.date = formattedDate;

      // Menambahkan hasil anomali yang lengkap ke daftar anomali
      anomalies.push(anomaly);
    }
  }

  // Mengembalikan data anomali dalam format JSON
  return JSON.stringify(anomalies, null, 2); // Menggunakan JSON.stringify untuk format yang lebih baik
}

module.exports = getDashboardDataHandler;