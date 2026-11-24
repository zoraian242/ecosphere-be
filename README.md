# Ecosphere Backend API 

Backend REST API untuk aplikasi website edukasi pengelolaan sampah (**Ecosphere**), dibangun menggunakan **Node.js**, **Express.js**, dan **MySQL** dengan sistem autentikasi **JWT (JSON Web Token)**.

---

## Daftar Isi
- [Fitur & Hak Akses](#-fitur--hak-akses)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Cara Instalasi & Menjalankan Server](#-cara-instalasi--menjalankan-server)
- [Aturan Autentikasi (Header)](#-aturan-autentikasi-header)
- [Dokumentasi Endpoint API](#-dokumentasi-endpoint-api)
  - [1. Auth (Register, Login, Logout)](#1-auth)
  - [2. Artikel & Materi Edukasi](#2-artikel--materi-edukasi)
  - [3. Quiz Edukasi](#3-quiz-edukasi)
  - [4. Halaman Kontak](#4-halaman-kontak)
  - [5. Manajemen User (Admin)](#5-manajemen-user)

---

## Fitur & Hak Akses

1. **Publik (Tanpa Login):**
   - Melihat beranda, daftar artikel, dan detail materi edukasi.
   - Mengirim pesan melalui halaman kontak.
2. **Role User (`user`):**
   - Semua akses publik + Login & Logout.
   - Mengakses soal quiz dan mengirim jawaban untuk mendapatkan skor otomatis.
3. **Role Admin (`admin`):**
   - Semua akses user + Dashboard khusus Admin.
   - Operasi **CRUD** (Create, Read, Update, Delete) untuk **Artikel/Materi** dan **Soal Quiz**.
   - Melihat daftar seluruh pengguna terdaftar.
   - Membaca seluruh pesan masuk dari halaman kontak.

---

## Teknologi yang Digunakan
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (via Laragon / XAMPP)
- **Autentikasi & Keamanan:** JSON Web Token (`jsonwebtoken`), `bcryptjs`, `cors`

---

## Cara Instalasi & Menjalankan Server

1. **Clone / Masuk ke folder proyek:**
   ```bash
   cd ecosphere-be
   ```

2. **Install semua dependencies:**
   ```bash
   npm install
   ```

3. **Setup Database MySQL:**
   - Pastikan service **MySQL** di Laragon/XAMPP sudah berjalan.
   - Buat database baru bernama `db_sampah` di phpMyAdmin / HeidiSQL, lalu jalankan query tabel yang sudah disediakan (`users`, `materi`, `quiz`, `kontak`).
   - Sesuaikan konfigurasi koneksi database (jika ada perubahan password/host) pada file `config/db.js`.

4. **Jalankan server development:**
   ```bash
   npm start
   ```
   Server akan aktif di `http://localhost:3000`.

---

## Aturan Autentikasi (Header)

Untuk mengakses endpoint yang bertanda **User Login** atau **Admin Only**, Frontend wajib menyertakan token JWT yang didapat saat login pada bagian **Headers**:

```http
Authorization: Bearer <token_jwt_kamu>
Content-Type: application/json
```

---

## Dokumentasi Endpoint API

**Base URL:** `http://localhost:3000/api`

---

### 1. Auth

#### A. Register Akun Baru
- **Endpoint:** `POST /auth/register`
- **Akses:** Publik
- **Request Body (JSON):**
  ```json
  {
    "nama": "Budi Santoso",
    "email": "budi@mail.com",
    "password": "password123",
    "role": "user"
  }
  ```
  *(Catatan: Field `role` bersifat opsional. Jika dikosongkan, otomatis terdaftar sebagai `"user"`. Isi `"admin"` untuk membuat akun admin).*

- **Response (`201 Created`):**
  ```json
  {
    "message": "Registrasi berhasil!"
  }
  ```

#### B. Login
- **Endpoint:** `POST /auth/login`
- **Akses:** Publik
- **Request Body (JSON):**
  ```json
  {
    "email": "budi@mail.com",
    "password": "password123"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Login berhasil!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nama": "Budi Santoso",
      "email": "budi@mail.com",
      "role": "user"
    }
  }
  ```
  *(Simpan `token` dan objek `user` di `localStorage` Frontend untuk mengecek role dan otorisasi).*

#### C. Logout
- **Endpoint:** `POST /auth/logout`
- **Akses:** User / Admin
- **Response (`200 OK`):**
  ```json
  {
    "message": "Logout berhasil. Silakan hapus token di sisi client."
  }
  ```

---

### 2. Artikel & Materi Edukasi

#### A. Ambil Semua Artikel & Materi
- **Endpoint:** `GET /materi`
- **Akses:** Publik
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "judul": "Cara Memilah Sampah Organik dan Anorganik",
      "kategori": "materi",
      "konten": "Isi lengkap materi edukasi...",
      "gambar": "https://example.com/gambar.jpg",
      "created_at": "2026-11-24T12:00:00.000Z"
    }
  ]
  ```

#### B. Ambil Detail Artikel / Materi
- **Endpoint:** `GET /materi/:id`
- **Akses:** Publik

#### C. Tambah Artikel / Materi
- **Endpoint:** `POST /materi`
- **Akses:** **Admin Only** (Wajib Header `Authorization`)
- **Request Body (JSON):**
  ```json
  {
    "judul": "Bahaya Mikroplastik bagi Ekosistem Laut",
    "kategori": "artikel",
    "konten": "Penjelasan lengkap mengenai dampak mikroplastik...",
    "gambar": "https://example.com/mikroplastik.jpg"
  }
  ```
  *(Catatan: Nilai `kategori` hanya menerima `"artikel"` atau `"materi"`).*

#### D. Edit Artikel / Materi
- **Endpoint:** `PUT /materi/:id`
- **Akses:** **Admin Only** (Wajib Header `Authorization`)
- **Request Body (JSON):** Sama seperti format `POST /materi`.

#### E. Hapus Artikel / Materi
- **Endpoint:** `DELETE /materi/:id`
- **Akses:** **Admin Only** (Wajib Header `Authorization`)

---

### 3. Quiz Edukasi

#### A. Ambil Soal Quiz (Untuk Dikerjakan User)
- **Endpoint:** `GET /quiz/play`
- **Akses:** **User Login** (Wajib Header `Authorization`)
- **Response (`200 OK`):** *(Kolom `jawaban_benar` disembunyikan otomatis)*
  ```json
  [
    {
      "id": 1,
      "pertanyaan": "Sampah botol plastik termasuk ke dalam jenis sampah apa?",
      "opsi_a": "Organik",
      "opsi_b": "Anorganik",
      "opsi_c": "B3",
      "opsi_d": "Residu"
    }
  ]
  ```

#### B. Submit Jawaban Quiz & Hitung Skor
- **Endpoint:** `POST /quiz/submit`
- **Akses:** **User Login** (Wajib Header `Authorization`)
- **Request Body (JSON):**
  ```json
  {
    "jawaban": [
      { "id": 1, "pilihan": "B" },
      { "id": 2, "pilihan": "A" }
    ]
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "total_soal": 2,
    "jawaban_benar": 2,
    "skor": 100
  }
  ```

#### C. CRUD Soal Quiz (Dashboard Admin)
- **Ambil Semua Soal + Kunci Jawaban:** `GET /quiz` (**Admin Only**)
- **Tambah Soal Baru:** `POST /quiz` (**Admin Only**)
- **Edit Soal:** `PUT /quiz/:id` (**Admin Only**)
- **Hapus Soal:** `DELETE /quiz/:id` (**Admin Only**)
- **Format Request Body (`POST` & `PUT`):**
  ```json
  {
    "pertanyaan": "Warna tempat sampah khusus sampah organik umumnya adalah?",
    "opsi_a": "Merah",
    "opsi_b": "Kuning",
    "opsi_c": "Hijau",
    "opsi_d": "Biru",
    "jawaban_benar": "C"
  }
  ```

---

### 4. Halaman Kontak

#### A. Kirim Pesan Kontak
- **Endpoint:** `POST /kontak`
- **Akses:** Publik / User
- **Request Body (JSON):**
  ```json
  {
    "nama_pengirim": "Siti Aminah",
    "email_pengirim": "siti@mail.com",
    "pesan": "Halo admin, materi tentang komposnya sangat membantu!"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "Pesan berhasil dikirim!"
  }
  ```

#### B. Baca Semua Pesan Masuk
- **Endpoint:** `GET /kontak`
- **Akses:** **Admin Only** (Wajib Header `Authorization`)

---

### 5. Manajemen User

#### A. Lihat Daftar Seluruh User
- **Endpoint:** `GET /users`
- **Akses:** **Admin Only** (Wajib Header `Authorization`)
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "nama": "Admin Ecosphere",
      "email": "admin@ecosphere.com",
      "role": "admin",
      "created_at": "2026-11-24T11:45:00.000Z"
    }
  ]
  ```