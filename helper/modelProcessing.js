const preprocessData = require("./preprocessData");
const trainModel = require("./trainModel");

const modelAndDataAdjustment = async (model, formatExpenseTransactions) => {
  // // Proses data
  const { normalizedData, minValues, maxValues } = preprocessData(
    formatExpenseTransactions
  );

  // // Latih model
  await trainModel(model, normalizedData, 100);

  return { normalizedData, minValues, maxValues };
};

module.exports = modelAndDataAdjustment;
