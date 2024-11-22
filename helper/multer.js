const multer = require("multer");

exports.upload = multer({ dest: 'uploads/' });