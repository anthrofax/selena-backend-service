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

const getDashboardDataHandler = (req, res) => {
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
};

module.exports = getDashboardDataHandler;
