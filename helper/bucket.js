"use strict";
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const pathKey = path.resolve(process.env.SERVICE_ACC_KEY_PATH);

// TODO: Sesuaikan konfigurasi Storage
const gcs = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: pathKey,
});

// TODO: Tambahkan nama bucket yang digunakan
const bucketName = process.env.BUCKET_NAME;
const bucket = gcs.bucket(bucketName);

exports.getPublicUrl = (filename) => {
  return "https://storage.googleapis.com/" + bucketName + "/" + filename;
};

// Helper function to determine content type based on file extension
const getContentType = (filePath) => {
  const extname = path.extname(filePath).toLowerCase();

  switch (extname) {
    case ".json":
      return "application/json";
    case ".bin":
      return "application/octet-stream";
    default:
      return "application/octet-stream"; // Default to binary for unknown file types
  }
};

// Function to upload file to Google Cloud Storage
exports.uploadToGCS = async (localFilePath, gcsFilePath) => {
  try {
    const customMetadata = {
      contentType: getContentType(localFilePath),
    };

    const optionsUploadObject = {
      destination: gcsFilePath,
      // preconditionOpts: { ifGenerationMatch: 0 },
      metadata: customMetadata,
    };

    await bucket.upload(localFilePath, optionsUploadObject);
    console.log(`${localFilePath} uploaded to ${bucketName} bucket`);
  } catch (uploadError) {
    throw (`Gagal mengupload ${localFilePath}:`, uploadError.message);
  }
};
