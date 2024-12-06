const path = require("path");
const fs = require("fs");
const Users = require("../models/user");
const modelAndDataAdjustment = require("../helper/modelProcessing");
const detectAnomalies = require("../helper/detectAnomalies");
const { uploadToGCS } = require("../helper/bucket");
const { loadModel } = require("../helper/loadModel");

const getDashboardDataHandler = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id)
    return res
      .status(400)
      .json({ message: `Query Parameter 'user_id' perlu dipass in` });

  let anomalyTransactions = [];

  try {
    const user = await Users.findByPk(+user_id);

    if (!user)
      return res
        .status(400)
        .json({ message: `User dengan id ${user_id} tidak tersedia.` });

    let model = await loadModel();

    const userTransactions = await user.getTransactions();

    // Mendapatkan tanggal satu bulan yang lalu
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Filter transaksi untuk satu bulan terakhir
    const recentTransactions = userTransactions.filter(({ dataValues }) => {
      const transactionDate = new Date(dataValues.date);
      return transactionDate >= oneMonthAgo;
    });

    const expenseTransactions = recentTransactions.filter(
      ({ dataValues }) => dataValues.transaction_type === "expense"
    );

    const totalIncome = recentTransactions
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

      const { maxValues, minValues, normalizedData } =
        await modelAndDataAdjustment(model, formatExpenseTransactions);

      await model.save("file://model_folder");

      // Setelah model disimpan di lokal, unggah model dan bobot ke Google Cloud Storage
      const modelJsonPath = path.join(
        __dirname,
        "..",
        "model_folder",
        "model.json"
      );
      const weightsPath = path.join(
        __dirname,
        "..",
        "model_folder",
        "weights.bin"
      ); // Biasanya file bobot akan memiliki ekstensi seperti ini

      // Mengunggah file model dan bobot ke Google Cloud Storage
      await uploadToGCS(modelJsonPath, "my-autoencoder.json"); // Mengupload file model.json
      await uploadToGCS(weightsPath, "weights.bin"); // Mengupload file bobot

      // Menghapus folder 'model_folder' setelah file diupload ke GCS
      const modelFolderPath = path.join(__dirname, "..", "model_folder");

      // Pastikan folder kosong sebelum dihapus
      fs.rmSync(modelFolderPath, { recursive: true, force: true });

      model = await loadModel();

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
          ? "Dalam 30 hari terakhir, pengeluaran Anda melebihi pendapatan, pertimbangkan untuk mengurangi pengeluaran."
          : "Keuangan Anda sehat, pertimbangkan untuk menabung lebih banyak.",
      anomalyTransactions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan di server", error: error.message });
  }
};

module.exports = getDashboardDataHandler;
