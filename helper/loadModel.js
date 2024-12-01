const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");

exports.loadModel = async () => {
  // const modelPath = path.join(
  //   __dirname,
  //   "../machine-learning-models/my-autoencoder.json"
  // );

  try {
    const model = await tf.loadLayersModel(process.env.MODEL_URL);

    console.log("Model berhasil dimuat");
    return model;
  } catch (error) {
    console.error("Terjadi kesalahan saat memuat model:", error);
    return null;
  }
};

exports.loadRawDataForPreprocessNeeds = async () => {
  const modelPath = path.join(
    __dirname,
    "../machine-learning-models/pengeluaran.json"
  );

  console.log(modelPath);

  try {
    const rawData = fs.readFileSync(`${modelPath}`, "utf8");
    const data = JSON.parse(rawData);

    return data;
  } catch (error) {
    console.error("Gagal membaca file JSON:", error);
    return null;
  }
};
