const express = require("express");

const upload = require("../helper/multer");
const verifyToken = require("../handlers/verifyToken");
const getDashboardDataHandler = require("../handlers/getDashboardData");
const insertTokopediaHandler = require("../handlers/insertTokopedia");
const insertShopeeHandler = require("../handlers/insertShopee");
const getTransactionsHandler = require("../handlers/getTransactions");
const getTransactionDetailHandler = require("../handlers/getTransactionDetail");
const createTransactionHandler = require("../handlers/createTransaction");
const updateTransactionHandler = require("../handlers/updateTransaction");
const deleteTransactionHandler = require("../handlers/deleteTransaction");

const router = express.Router();

// Fitur Dashboard
router.get("/dashboard", verifyToken, getDashboardDataHandler);

// Fitur Pencatatan Keuangan
// 1. Upload CSV
router.post(
  "/insert-tokopedia",
  verifyToken,
  upload.single("file"),
  insertTokopediaHandler
);

router.post(
  "/insert-shopee",
  verifyToken,
  upload.single("file"),
  insertShopeeHandler
);

// 2. CRUD
// a. Get all transactions
router.get("/transactions", verifyToken, getTransactionsHandler);

// b. Get spesific transaction
router.get(
  "/transactions/:transactionId",
  verifyToken,
  getTransactionDetailHandler
);

// c. Add new transaction
router.post("/transactions", verifyToken, createTransactionHandler);

// d. Edit a spesific transaction
router.put(
  "/transactions/:transactionId",
  verifyToken,
  updateTransactionHandler
);

// e. Delete a spesific transaction
router.delete(
  "/transactions/:transactionId",
  verifyToken,
  deleteTransactionHandler
);

module.exports = router;