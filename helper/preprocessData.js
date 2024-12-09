const tf = require("@tensorflow/tfjs-node");

const preprocessData = (rawData) => {
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
    .div((maxValues.sub(minValues) === 0 || 1 ));

  // Mengembalikan data normalisasi dan nilai min/max
  return { normalizedData, minValues, maxValues, processedData };
};

module.exports = preprocessData;
