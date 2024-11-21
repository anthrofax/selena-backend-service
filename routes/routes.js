const express = require("express");
const multer = require("../helper/multer");

const router = express.Router();

// Login

// Signup

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
router.post('/insert-tokopedia', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const userId = req.body.user_id; // Ensure `user_id` is sent in the request body

    if (!userId) {
        fs.unlinkSync(filePath); // Clean up the uploaded file
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // Connect to the database
        const connection = await mysql.createConnection(dbConfig);

        // Prepare CSV parsing
        const transactions = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Adjust column names based on Tokopedia CSV structure
                const transaction = {
                    user_id: userId,
                    amount: parseFloat(row['Jumlah Transaksi'] || 0),
                    transaction_type: 'income',
                    date: row['Tanggal Transaksi'],
                    catatan: row['Deskripsi Transaksi'] || '',
                };
                transactions.push(transaction);
            })
            .on('end', async () => {
                // Insert data into the database
                const query =
                    'INSERT INTO Transaksi (user_id, amount, transaction_type, date, catatan) VALUES ?';
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

                res.status(200).json({ message: 'Transactions imported successfully' });
            });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post("/insert-shopee", (req, res) => {});

// 2. CRUD
// a. Get all transactions
router.get("/transactions", (req, res) => {});

// b. Get spesific transaction
router.get("/transactions/:transactionId", (req, res) => {});

// c. Add new transaction
router.post("/transactions", (req, res) => {});

// d. Edit a spesific transaction
router.put("/transactions/:transactionId", (req, res) => {});

// e. Delete a spesific transaction
router.delete("/transactions/:transactionId", (req, res) => {});

module.exports = router;
