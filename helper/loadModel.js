const tf = require("@tensorflow/tfjs-node");

exports.loadIncomeModel= async () => {
  return tf.loadGraphModel(process.env.INCOME_MODEL_URL);
};
exports.loadExpenseModel= async () => {
  return tf.loadGraphModel(process.env.EXPENSE_MODEL_URL);
};
