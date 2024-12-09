const generateFinancialAdvice = (
  totalIncome,
  totalExpense,
  anomalyTransactions
) => {
  let financialAdvice =
    "Keuangan Anda sehat, pertimbangkan untuk menabung lebih banyak.";

  if (totalExpense === 0 && totalIncome > 0) {
    // Pengguna belum memiliki pengeluaran
    financialAdvice =
      "Anda belum memiliki pengeluaran tercatat. Pastikan untuk mulai merencanakan pengeluaran dan menabung sebagian dari pendapatan Anda.";
  } else if (totalExpense > totalIncome) {
    const deficit = totalExpense - totalIncome;

    if (deficit > totalIncome * 0.1) {
      // Pengeluaran lebih dari 10% pendapatan
      financialAdvice =
        "Pengeluaran Anda lebih tinggi daripada pendapatan. Pertimbangkan untuk menurunkan pengeluaran agar tidak terus merugi.";
    } else {
      // Pengeluaran sedikit lebih tinggi
      financialAdvice =
        "Pengeluaran Anda sedikit lebih tinggi dari pendapatan. Cobalah untuk mengatur anggaran lebih ketat di bulan berikutnya.";
    }
  } else if (totalIncome > totalExpense) {
    const surplus = totalIncome - totalExpense;

    if (surplus > totalExpense * 0.5) {
      // Jika surplus lebih dari 50% dari pengeluaran
      financialAdvice =
        "Pendapatan Anda jauh melebihi pengeluaran. Pertimbangkan untuk menginvestasikan surplus tersebut untuk masa depan.";
    } else if (surplus > totalExpense * 0.2) {
      // Jika surplus lebih dari 20% dari pengeluaran
      financialAdvice =
        "Pendapatan Anda lebih besar daripada pengeluaran. Anda bisa mulai menabung lebih banyak atau mencoba investasi.";
    } else {
      // Surplus kecil
      financialAdvice =
        "Pendapatan lebih besar daripada pengeluaran, tetapi surplusnya tidak terlalu besar. Pertimbangkan untuk mengoptimalkan pengeluaran lebih lanjut.";
    }
  } else if (totalIncome === totalExpense) {
    // Jika pendapatan dan pengeluaran sama
    financialAdvice =
      "Pendapatan dan pengeluaran Anda seimbang. Meskipun keuangan Anda stabil, pastikan untuk mulai menabung atau menginvestasikan sebagian dari pendapatan Anda untuk masa depan.";
  }

  // Anomali transactions dapat mempengaruhi advice
  if (anomalyTransactions.length > 0) {
    financialAdvice +=
      " Terdapat beberapa transaksi yang tidak biasa, pastikan untuk memeriksa transaksi tersebut dan pertimbangkan untuk melaporkan ke pihak relevan jika ada kesalahan.";
  }

  return financialAdvice;
};

module.exports = generateFinancialAdvice;
