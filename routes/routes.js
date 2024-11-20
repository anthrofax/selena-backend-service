const express = require('express');

const router = express.Router();

// Login

// Signup

// Fitur Dashboard
router.get('/dashboard', (req, res) => {});

// Fitur Pencatatan Keuangan
// 1. Upload CSV
router.post('/insert-tokopedia', (req, res) => {});
router.post('/insert-shopee', (req, res) => {});

// 2. CRUD
// a. Get all transactions  
router.get('/transactions', (req, res) => {});

// b. Get spesific transaction
router.get('/transactions/:transactionId', (req, res) => {});

// c. Add new transaction
router.post('/transactions', (req, res) => {});

// d. Edit a spesific transaction
router.put('/transactions/:transactionId', (req, res) => {});

// e. Delete a spesific transaction
router.delete('/transactions/:transactionId', (req, res) => {});


module.exports = router;
