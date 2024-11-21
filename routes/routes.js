const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcrypt");

const connection = require("../helper/db");
const upload = require("../helper/multer");

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    // Check if the user exists
    const query = "SELECT * FROM Users WHERE email = ?";
    const [rows] = await connection.execute(query, [email]);

    connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = rows[0];

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate session token (if needed) or return user info
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  try {
    // Check if the email is already registered
    const [existingUser] = await connection.execute(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const query = `
          INSERT INTO Users (name, email, password_hash) 
          VALUES (?, ?, ?)
      `;
    const [result] = await connection.execute(query, [
      name,
      email,
      hashedPassword,
    ]);

    connection.end();

    // Respond with success
    res.status(201).json({
      message: "Signup successful",
      user: {
        id: result.insertId,
        name: name,
        email: email,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fitur Dashboard
const dashboardData = {
  cashFlowAnalysis: {
    income: 5432649, // Contoh data pemasukan
    expenses: 3872049, // Contoh data pengeluaran
    profit: 1560600, // Contoh data keuntungan
  },
  financialSuggestions: [
    "Set budget untuk kategori pengeluaran besar.",
    "Tingkatkan pemasukan dengan memanfaatkan diskon atau promosi marketplace.",
    "Kurangi biaya operasional yang kurang penting.",
  ],
  spendingAnomalies: [
    {
      date: "2023-04-17",
      category: "Office Supplies",
      amount: 1200000,
      description: "Pengeluaran lebih besar dari rata-rata bulanan.",
    },
  ],
};

router.get("/dashboard", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Dashboard data fetched successfully",
      data: {
        cashFlowAnalysis: dashboardData.cashFlowAnalysis,
        financialSuggestions: dashboardData.financialSuggestions,
        spendingAnomalies: dashboardData.spendingAnomalies,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
});

// Fitur Pencatatan Keuangan
// 1. Upload CSV
router.post("/insert-tokopedia", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = req.file.path;
  const userId = req.body.user_id; // Ensure `user_id` is sent in the request body

  if (!userId) {
    fs.unlinkSync(filePath); // Clean up the uploaded file
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Prepare CSV parsing
    const transactions = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Adjust column names based on Tokopedia CSV structure
        const transaction = {
          user_id: userId,
          amount: parseFloat(row["Jumlah Transaksi"] || 0),
          transaction_type: "income",
          date: row["Tanggal Transaksi"],
          catatan: row["Deskripsi Transaksi"] || "",
        };
        transactions.push(transaction);
      })
      .on("end", async () => {
        // Insert data into the database
        const query =
          "INSERT INTO Transaksi (user_id, amount, transaction_type, date, catatan) VALUES ?";
        const values = transactions.map((t) => [
          t.user_id,
          t.amount,
          t.transaction_type,
          t.date,
          t.catatan,
        ]);

        await connection.query(query, [values]);
        connection.end();

        // Clean up the uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({ message: "Transactions imported successfully" });
      });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/insert-shopee", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = req.file.path;
  const userId = req.body.user_id; // Ensure `user_id` is sent in the request body

  if (!userId) {
    fs.unlinkSync(filePath); // Clean up the uploaded file
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Prepare CSV parsing
    const transactions = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Adjust column names based on Shopee CSV structure
        const transaction = {
          user_id: userId,
          amount: parseFloat(row["Total Harga"] || 0),
          transaction_type: "income",
          date: row["Tanggal Pesanan"],
          catatan: row["Nama Produk"] || "",
        };
        transactions.push(transaction);
      })
      .on("end", async () => {
        // Insert data into the database
        const query =
          "INSERT INTO Transaksi (user_id, amount, transaction_type, date, catatan) VALUES ?";
        const values = transactions.map((t) => [
          t.user_id,
          t.amount,
          t.transaction_type,
          t.date,
          t.catatan,
        ]);

        await connection.query(query, [values]);
        connection.end();

        // Clean up the uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({ message: "Transactions imported successfully" });
      });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 2. CRUD
// a. Get all transactions
router.get("/transactions", async (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  try {
    // Build the base query
    let query = `SELECT * FROM Transaksi WHERE user_id=${user_id}`;
    const params = [];

    // Filter by user_id if provided
    if (user_id) {
      query += " AND user_id = ?";
      params.push(user_id);
    }

    // Filter by date range if provided
    if (start_date) {
      query += " AND date >= ?";
      params.push(start_date);
    }
    if (end_date) {
      query += " AND date <= ?";
      params.push(end_date);
    }

    // Execute the query
    const [rows] = await connection.execute(query, params);
    connection.end();

    // Respond with the results
    res.status(200).json({
      message: "Transactions retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// b. Get spesific transaction
router.get("/transactions/:transactionId", async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Query to get the specific transaction
    const query = "SELECT * FROM Transaksi WHERE transaction_id = ?";
    const [rows] = await connection.execute(query, [transactionId]);

    connection.end();

    // Check if transaction exists
    if (rows.length === 0) {
      return res.status(404).json({
        message: `Transaction with ID ${transactionId} not found`,
      });
    }

    // Respond with transaction details
    res.status(200).json({
      message: "Transaction retrieved successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error retrieving transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// c. Add new transaction
router.post("/transactions", async (req, res) => {
  const { user_id, amount, transaction_type, date, catatan } = req.body;

  // Validate required fields
  if (!user_id || !amount || !transaction_type || !date) {
    return res.status(400).json({
      message:
        "Missing required fields: user_id, amount, transaction_type, and date are required",
    });
  }

  // Validate transaction type
  if (!["income", "expense"].includes(transaction_type)) {
    return res.status(400).json({
      message:
        "Invalid transaction_type. It must be either 'income' or 'expense'",
    });
  }

  try {
    // Insert the new transaction into the database
    const query = `
          INSERT INTO Transaksi (user_id, amount, transaction_type, date, catatan) 
          VALUES (?, ?, ?, ?, ?)
      `;
    const [result] = await connection.execute(query, [
      user_id,
      amount,
      transaction_type,
      date,
      catatan || null, // Optional field
    ]);

    connection.end();

    // Respond with success
    res.status(201).json({
      message: "Transaction added successfully",
      transaction_id: result.insertId,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// d. Edit a spesific transaction
router.put("/transactions/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { user_id, amount, transaction_type, date, catatan } = req.body;

  // Validate required fields
  if (!amount || !transaction_type || !date) {
    return res.status(400).json({
      message:
        "Missing required fields: amount, transaction_type, and date are required",
    });
  }

  // Validate transaction type
  if (!["income", "expense"].includes(transaction_type)) {
    return res.status(400).json({
      message:
        "Invalid transaction_type. It must be either 'income' or 'expense'",
    });
  }

  try {
    // Check if the transaction exists
    const [existingTransaction] = await connection.execute(
      "SELECT * FROM Transaksi WHERE transaction_id = ?",
      [transactionId]
    );

    if (existingTransaction.length === 0) {
      return res.status(404).json({
        message: `Transaction with ID ${transactionId} not found`,
      });
    }

    // Update the transaction
    const query = `
          UPDATE Transaksi
          SET user_id = ?, amount = ?, transaction_type = ?, date = ?, catatan = ?
          WHERE transaction_id = ?
      `;
    await connection.execute(query, [
      user_id || existingTransaction[0].user_id, // Keep existing user_id if not provided
      amount,
      transaction_type,
      date,
      catatan || existingTransaction[0].catatan, // Keep existing catatan if not provided
      transactionId,
    ]);

    connection.end();

    // Respond with success
    res.status(200).json({
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// e. Delete a spesific transaction
router.delete("/transactions/:transactionId", async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Connect to the database
    const connection = await mysql.createConnection(dbConfig);

    // Check if the transaction exists
    const [existingTransaction] = await connection.execute(
      "SELECT * FROM Transaksi WHERE transaction_id = ?",
      [transactionId]
    );

    if (existingTransaction.length === 0) {
      return res.status(404).json({
        message: `Transaction with ID ${transactionId} not found`,
      });
    }

    // Delete the transaction
    const deleteQuery = "DELETE FROM Transaksi WHERE transaction_id = ?";
    await connection.execute(deleteQuery, [transactionId]);

    connection.end();

    // Respond with success
    res.status(200).json({
      message: `Transaction with ID ${transactionId} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
