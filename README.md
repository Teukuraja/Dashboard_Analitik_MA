# Tugas_KP

Sistem **Dashboard Analitik** untuk mengelola data **barang masuk**, **barang keluar**, dan **inventory**.  
Proyek ini terdiri dari dua bagian utama:

1. **Backend** → Server API menggunakan Node.js (Express, SQLite3,Mutler).  
2. **Frontend** → Dashboard Web menggunakan React + Vite.  

---

## ✨ Fitur Utama
- Login user (autentikasi backend).
- CRUD data barang.
- Sinkronisasi tabel: `barang_masuk`, `barang_keluar`, `inventory`.
- Upload file dengan **Multer**.
- Visualisasi data barang masuk/keluar dalam bentuk grafik (frontend).
- Database ringan menggunakan **SQLite3**.

---

## 🛠️ Teknologi
- **Backend**: Node.js (CJS), Express.js, SQLite3, Multer  
- **Frontend**: React, Vite  
- **Deployment**: Railway 

---

## 🚀 Instalasi & Menjalankan

### 1. Clone Repository
```bash
git clone https://github.com/Teukuraja/Tugas_KP.git
cd Tugas_KP

```

### 2. Jalankan Backend
```bash
cd dashboard-backend
npm install

# Jalankan server
node server.js        # normal
npm run dev           # jika menggunakan nodemon
```

Server default berjalan di:

```bash
http://localhost:3000

```
### 3.Jalankan Frontend
Buka terminal baru:
```bash
cd dashboard-frontend
npm install

# Jalankan frontend
npm run dev
```
Frontend default berjalan di:
```bash
http://localhost:5173
```
> Catatan: Pastikan baseURL di api.js mengarah ke backend (misalnya http://localhost:3000).

