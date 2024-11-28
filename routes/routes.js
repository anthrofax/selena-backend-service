const express = require("express");

const upload = require("../helper/multer");
const loginHandler = require("../handlers/login");
const signupHandler = require("../handlers/signup");
const getDashboardDataHandler = require("../handlers/getDashboardData");
const insertTokopediaHandler = require("../handlers/insertTokopedia");
const insertShopeeHandler = require("../handlers/insertShopee");
const getTransactionsHandler = require("../handlers/getTransactions");
const getTransactionDetailHandler = require("../handlers/getTransactionDetail");
const createTransactionHandler = require("../handlers/createTransaction");
const updateTransactionHandler = require("../handlers/updateTransaction");
const deleteTransactionHandler = require("../handlers/deleteTransaction");

const router = express.Router();

// Login
router.post("/login", loginHandler);

// Signup
router.post("/signup", signupHandler);

// Fitur Dashboard
router.get("/dashboard", getDashboardDataHandler);

// Fitur Pencatatan Keuangan
// 1. Upload CSV
router.post("/insert-tokopedia", upload.single("file"), insertTokopediaHandler);

router.post("/insert-shopee", upload.single("file"), insertShopeeHandler);

// 2. CRUD
// a. Get all transactions
router.get("/transactions", getTransactionsHandler);

// b. Get spesific transaction
router.get("/transactions/:transactionId", getTransactionDetailHandler);

// c. Add new transaction
router.post("/transactions", createTransactionHandler);

// d. Edit a spesific transaction
router.put("/transactions/:transactionId", updateTransactionHandler);

// e. Delete a spesific transaction
router.delete("/transactions/:transactionId", deleteTransactionHandler);

module.exports = router;