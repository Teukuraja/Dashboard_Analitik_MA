
# Dashboard Analitik Inventaris 

Ini adalah sistem **Manajemen Inventaris** lengkap yang dibangun sebagai proyek Tugas Akhir (TA) / Kerja Praktik (KP). Sistem ini tidak hanya mengelola data **barang masuk**, **barang keluar**, dan **stok inventory**, tetapi juga dilengkapi dengan fitur **Analisis Pola Pemakaian** menggunakan metode **Moving Average (MA)**.

Proyek ini terdiri dari dua bagian utama yang berjalan dari satu folder (struktur *monolithic*):

1.  **Backend**: Server API menggunakan Node.js (Express) dengan database SQLite.
2.  **Frontend**: Dashboard interaktif menggunakan React + Vite.

---

## ✨ Fitur Unggulan

Proyek ini memiliki dua set fitur utama: sistem manajemen inti dan fitur analisis.

### 1. Manajemen Inventaris (Sistem Inti)

* **Autentikasi**: Halaman Login untuk mengamankan dashboard.
* **CRUD Lengkap**: Manajemen data untuk **Barang Masuk**, **Barang Keluar**, dan **Stok Inventory**.
* **Sinkronisasi Stok Otomatis**:
    * Form **Barang Masuk** otomatis **menambah** stok di Inventory.
    * Form **Barang Keluar** otomatis **mengurangi** stok di Inventory.
* **Upload Excel**: Fitur upload data inventory massal (.xlsx) menggunakan Multer & SheetJS.
* **Form Cerdas**: Form Barang Masuk/Keluar dilengkapi *autocomplete* yang mengambil data (kode, nama, satuan) langsung dari database Inventory.

### 2. Analisis Pola (Fitur Utama TA)

* **Analisis Moving Average (MA)**: Fitur khusus untuk menganalisis pola historis barang masuk dan barang keluar.
* **Perhitungan Dinamis**: User bisa memasukkan **Kode Barang**, **Unit**, dan **Periode (N)** untuk dianalisis.
* **Prediksi (Forecasting)**: Menampilkan prediksi pemakaian/pemasukan untuk periode berikutnya (`t+1`) berdasarkan nilai MA terakhir.
* **Visualisasi Grafik**: Menampilkan perbandingan data **Aktual** vs. **Moving Average** dalam bentuk grafik garis (menggunakan Recharts).
* **Dropdown Dinamis**: Form analisis otomatis mengambil daftar *unit* yang unik dari database, mencegah kesalahan input.
* **Backend Non-blocking**: Menggunakan `UPPER()` di SQL untuk pencarian *case-insensitive* yang robust.

---

## 🛠️ Teknologi yang Digunakan

* **Backend**: Node.js (CJS), Express.js, SQLite3, Multer (Upload File), Moment.js
* **Frontend**: React (Vite), Recharts (Grafik), React Hot Toast (Notifikasi), Lucide Icons

---

## 📁 Struktur Proyek

Proyek ini menggunakan struktur *monolithic* sederhana. Baik backend maupun frontend berada dalam satu folder utama dan satu `package.json`.
```bash
/Dashboard_Analitik_MA 
├── node_modules/ 
├── src/ <-- Folder Frontend (React) │ 
├── components/ │ 
├── pages/ │
├── App.jsx 
│ └── main.jsx
├── .gitignore
├── data.db <-- Database SQLite
├── package.json <-- Mengatur SEMUA dependensi 
├── server.cjs <-- Server Backend (Node.js)
└── README.md

```
## 🚀 Instalasi & Menjalankan

### 1. Clone Repository
```bash
git clone [https://github.com/Teukuraja/Dashboard_Analitik_MA.git](https://github.com/Teukuraja/Dashboard_Analitik_MA.git)
cd Dashboard_Analitik_MA
```
2. Instalasi Dependensi
Hanya perlu satu kali instalasi untuk backend dan frontend.

```Bash
npm install
```
3. Jalankan Backend
Buka terminal pertama:


# Jalankan server (menggunakan file server.cjs kita)
```bash
node server.cjs
```
Server akan berjalan di: http://localhost:8080

4. Jalankan Frontend
Buka terminal kedua:


# Jalankan frontend (Vite)
```bash
npm run dev
```
Aplikasi React akan berjalan di: http://localhost:5173

Penting: Pastikan file src/api.js di frontend sudah mengarah ke baseURL backend yang benar (yaitu http://localhost:8080).
