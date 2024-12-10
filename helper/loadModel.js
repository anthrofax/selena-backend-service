const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");

exports.loadModel = async (userModelFolder) => {
  let modelUrl = "";
  
  try {
    if (userModelFolder) {
      modelUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${userModelFolder}/model.json`; // URL model berdasarkan folder user
    } else {
      const modelPath = path.join(
        __dirname,
        "../machine-learning-models/my-autoencoder.json"
      );
      modelUrl = `file://${modelPath}`;
    }
    const model = await tf.loadLayersModel(modelUrl);

    if (userModelFolder) console.log("Folder ada");
    else console.log("Folder ga ada");

    return model;
  } catch (error) {
    console.error("Terjadi kesalahan saat memuat model:", error);
    return null;
  }
};

exports.loadRawDataForPreprocessNeeds = async () => {
  const rawDataPath = path.join(
    __dirname,
    "../machine-learning-models/pengeluaran.json"
  );

  try {
    const rawData = fs.readFileSync(`${rawDataPath}`, "utf8");
    const data = JSON.parse(rawData);

    return data;
  } catch (error) {
    console.error("Gagal membaca file JSON:", error);
    return null;
  }
};
