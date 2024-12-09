const path = require("path");
const fs = require("fs");
const Users = require("../models/user");
const modelAndDataAdjustment = require("../helper/modelProcessing");
const detectAnomalies = require("../helper/detectAnomalies");
const { uploadToGCS } = require("../helper/bucket");
const generateFinancialAdvice = require("../helper/generateFinancialAdvice");

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

    const model = req.app.model;
    const userTransactions = await user.getTransactions();

    if (userTransactions.length === 0) {
      return res.status(200).json({
        message: "Pengguna belum mencatatkan transaksi keuangan.",
        totalIncome: 0,
        totalExpense: 0,
        financialAdvice:
          "Anda belum memiliki data transaksi untuk dianalisis. Silakan mulai mencatat transaksi Anda.",
        anomalyTransactions: [],
      });
    }

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

      const modelFolderPath = path.join(__dirname, "..", "tmp", "model_folder");

      await model.save(`file://${modelFolderPath}`);

      const weightsPath = path.join(
        __dirname,
        "..",
        "tmp",
        "model_folder",
        "weights.bin"
      );

      await uploadToGCS(weightsPath, "weights.bin");

      // Pastikan folder kosong sebelum dihapus
      fs.rmSync(path.join(__dirname, "..", "tmp", "model_folder"), {
        recursive: true,
        force: true,
      });

      // Deteksi anomali dengan persentil yang ditentukan (misalnya, 95)
      anomalyTransactions = await detectAnomalies(
        model,
        normalizedData,
        minValues,
        maxValues,
        formatExpenseTransactions,
        50
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

    const financialAdvice = generateFinancialAdvice(
      totalIncome,
      totalExpense,
      anomalyTransactions
    );

    res.status(200).json({
      message: "Data analisis berhasil diambil",
      totalIncome,
      totalExpense,
      financialAdvice,
      anomalyTransactions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan di server", error: error });
  }
};

module.exports = getDashboardDataHandler;
