const Transactions = require("../models/transaction");
const Users = require("../models/user");

const deleteAllTransactionsHandler = async (req, res) => {
    const { userId } = req.params;

    try {
        // Ambil user_id dari query parameter
        const user = await Users.findByPk(userId);

        // Periksa apakah user_id ada dalam query parameter
        if (!user) {
            return res.status(400).json({ message: "User yang datanya ingin anda hapus tidak ditemukan" });
        }

        // Logic untuk menghapus semua transaksi berdasarkan user_id
        const deletedTransactions = await Transactions.destroy({ where: { user_id: userId } });

        console.log(deletedTransactions)

        if (deletedTransactions === 0) {
            return res.status(404).json({ message: `Tidak ada yang bisa dihapus, anda belum menambahkan pencatatan satupun.`});
        }

        // Mengirim response jika berhasil menghapus transaksi
        res.status(200).json({ message: `Semua transaksi untuk user_id ${userId} berhasil dihapus`});
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus transaksi.", error });
    }
};

module.exports = deleteAllTransactionsHandler;