-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS selena_database;
USE selena_database;

-- Tabel Users
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Transaksi
CREATE TABLE IF NOT EXISTS Transaksi (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type ENUM('income', 'expense') NOT NULL,
    date DATE NOT NULL,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Tambahkan indeks untuk performa query yang lebih baik
CREATE INDEX idx_user_id ON Transaksi(user_id);

-- Insert user jika belum ada
INSERT INTO Users (name, email, password_hash) 
SELECT 'Afridho Ikhsan', 'afridhoikhsan@gmail.com', 
       '$2b$10$EEuDaPCj0URNPWV3mW9LiuWcfpgC8wKgiesoEPAJr0taBDI98lIYe'
ON DUPLICATE KEY UPDATE email=email;  -- Jika user dengan email yang sama sudah ada, tidak lakukan apa-apa

-- Ambil user_id setelah insert atau jika user sudah ada
SET @user_id = (SELECT user_id FROM Users WHERE email = 'afridhoikhsan@gmail.com' LIMIT 1);

-- Insert transaksi awal
INSERT INTO Transaksi (user_id, amount, transaction_type, date, catatan)
VALUES
(@user_id, 200000, 'income', '2024-11-28', 'Initial deposit'),
(@user_id, 50000, 'expense', '2024-11-29', 'Purchase');