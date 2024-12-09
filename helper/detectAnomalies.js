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

module.exports = detectAnomalies;
