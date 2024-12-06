const tf = require("@tensorflow/tfjs-node");

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

module.exports = trainModel;
