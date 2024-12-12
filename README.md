# Selena App - Cloud Computing (CC) API

This README provides detailed documentation for the Cloud Computing (CC) APIs used in the Selena App. These APIs handle backend functionality such as user authentication, transaction management, and data import.

---

## Table of Contents

- [User Authentication](#user-authentication)
  - [Signup](#1-signup)
  - [Verify OTP](#2-verify-otp)
  - [Login](#3-login)
- [Transaction Management](#transaction-management)
  - [Get All Transactions](#4-get-all-transactions)
  - [Get Transaction Details](#5-get-transaction-details)
  - [Add a Transaction](#6-add-a-transaction)
  - [Update a Transaction](#7-update-a-transaction)
  - [Delete a Transaction](#8-delete-a-transaction)
  - [Delete All Transactions](#9-delete-all-transactions)
- [Data Import](#data-import)
  - [Insert Data via Shopee Excel](#10-insert-data-via-shopee-excel)
  - [Insert Data via Tokopedia Excel](#11-insert-data-via-tokopedia-excel)
- [Dashboard Analytics](#dashboard-analytics)

---

## User Authentication

### 1. Signup

- **URL:** `/auth/signup`
- **Method:** `POST`
- **Request Body:**

    ```json
    {
      "name": "John Doe",
      "email": "johndoe@example.com",
      "password": "securepassword123"
    }
    ```

- **Responses:**
  - Missing required fields (400):
    ```json
    { "message": "Nama, email, dan password perlu diisi!" }
    ```
  - Password less than 8 characters (400):
    ```json
    { "message": "Password harus berjumlah 8 karakter." }
    ```
  - Email already registered (409):
    ```json
    { "message": "Email sudah terdaftar!" }
    ```
  - OTP Sending Failed (500):
    ```json
    { "message": "Gagal mengirim OTP. Coba lagi" }
    ```
  - Successful registration (200):
    ```json
    {
      "message": "OTP telah dikirim ke email Anda. Harap verifikasi.",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@example.com"
      }
    }
    ```

### 2. Verify OTP

- **URL:** `/auth/otp/verify`
- **Method:** `POST`
- **Request Body:**

    ```json
    {
      "otp": "123456",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "password": "securepassword123"
    }
    ```

- **Responses:**
  - Missing required fields (400):
    ```json
    { "message": "Nama, email, password, ataupun OTP tidak lengkap di Request Body!" }
    ```
  - Expired OTP (400):
    ```json
    { "message": "OTP sudah kedaluwarsa." }
    ```
  - Invalid OTP (400):
    ```json
    { "message": "OTP tidak valid." }
    ```
  - Server error (500):
    ```json
    { "message": "Terjadi kesalahan di server." }
    ```
  - Successful account creation (201):
    ```json
    { "message": "Pendaftaran akun berhasil!" }
    ```

### 3. Login

- **URL:** `/auth/login`
- **Method:** `POST`
- **Request Body:**

    ```json
    {
      "email": "johndoe@example.com",
      "password": "securepassword123"
    }
    ```

- **Responses:**
  - Missing required fields (400):
    ```json
    { "message": "Email dan password diperlukan" }
    ```
  - User not found (404):
    ```json
    { "message": "Pengguna tidak ditemukan" }
    ```
  - Invalid credentials (401):
    ```json
    { "message": "Email atau password tidak valid" }
    ```
  - Successful login (200):
    ```json
    {
      "message": "Login berhasil",
      "user": {
        "id": "integer",
        "name": "string",
        "email": "string"
      },
      "token": "string"
    }
    ```

---

## Transaction Management

### 4. Get All Transactions

- **URL:** `/transactions`
- **Method:** `GET`
- **Query Parameters:**
  - `user_id` (required)
  - `start_date` (optional)
  - `end_date` (optional)
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`

### 5. Get Transaction Details

- **URL:** `/transactions/:transactionId`
- **Method:** `GET`

### 6. Add a Transaction

- **URL:** `/transactions`
- **Method:** `POST`

### 7. Update a Transaction

- **URL:** `/transactions/:transactionId`
- **Method:** `PUT`

### 8. Delete a Transaction

- **URL:** `/transactions/:transactionId`
- **Method:** `DELETE`

### 9. Delete All Transactions

- **URL:** `/transactions/delete-all/:userId`
- **Method:** `DELETE`

---

## Data Import

### 10. Insert Data via Shopee Excel

- **URL:** `/insert-shopee`
- **Method:** `POST`

### 11. Insert Data via Tokopedia Excel

- **URL:** `/insert-tokopedia`
- **Method:** `POST`

---

## Dashboard Analytics

### URL: `/dashboard`

- **Parameters:**
  - `user_id` (required)
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>`
