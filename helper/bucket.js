"use strict";
const { Storage } = require("@google-cloud/storage");
const dateFormat = require("dateformat");
const path = require("path");

const pathKey = path.resolve("./selena-project-443105-f3a5465d1af0.json");

// TODO: Sesuaikan konfigurasi Storage
const gcs = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: pathKey,
});

// TODO: Tambahkan nama bucket yang digunakan
const bucketName = "selena_model_bucket";
const bucket = gcs.bucket(bucketName);

function getPublicUrl(filename) {
  return "https://storage.googleapis.com/" + bucketName + "/" + filename;
}

let ImgUpload = {};

ImgUpload.uploadToGcs = (req, res, next) => {
  if (!req.file) return next();

  const gcsname = dateFormat(new Date(), "yyyymmdd-HHMMss");
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on("error", (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on("finish", () => {
    req.file.cloudStorageObject = gcsname;
    req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  });

  stream.end(req.file.buffer);
};

module.exports = ImgUpload;
