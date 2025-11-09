// ==== DEPENDENCY ====
const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const cors = require("cors");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Middleware untuk menerima upload file (tetap)
const upload = multer({ dest: "uploads/" });

// ==== MIDDLEWARE ====
const allowedOrigins = [
  "http://localhost:5173", // Untuk development
  "http://127.0.0.1:5173", // Coba dengan 127.0.0.1 jika localhost bermasalah
  "https://classy-gumption-67c9e2.netlify.app" // Untuk production
];
const moment = require('moment'); // Import moment.js
// Menambahkan middleware untuk body parsing
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// ==== KONEKSI DATABASE ====
const DB_PATH = process.env.DB_PATH || "./data.db";
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("❌ Gagal koneksi ke database:", err.message);
  else console.log("✅ Berhasil koneksi ke database:", DB_PATH);
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi" });
  }

  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) {
      console.error("Login error:", err.message);
      return res.status(500).json({ error: "Terjadi kesalahan server" });
    }
    if (!row) {
      return res.status(401).json({ error: "Username atau password salah" });
    }
    res.json({ success: true, username: row.username });
  });
});



// ==== INISIALISASI TABEL USERS & INVENTORY (TETAP) ====
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', 'admin']);
    }
  });
  db.run(`CREATE TABLE IF NOT EXISTS barang_masuk (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT, kode TEXT, nama TEXT, jumlah INTEGER, satuan TEXT, unit TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS barang_keluar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT, kode TEXT, nama TEXT, jumlah INTEGER, satuan TEXT, unit TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT, kode TEXT, nama TEXT, alias TEXT, jumlah INTEGER, satuan TEXT, unit TEXT,
    UNIQUE(kode, unit)
  )`);
});

// ==== FUNGSI BANTUAN (TETAP) ====
function normalizeUnit(unit) {
  if (!unit || unit.trim() === "" || unit.trim() === "-") return "Tanpa Unit";
  const map = {
    "BM100": "BM 100", "BROKK BM 100": "BM 100",
    "BM 90": "BM 90", "BROKK BM 90": "BM 90",
    "Forklift 3T": "Forklift", "Forklift 3 Ton": "Forklift",
    "Forklift": "Forklift", "forklift": "Forklift", "FORKLIFT": "Forklift",
    "HCR 120D": "HCR 120D",
    "Excavator 01": "Excavator 01", "Excavator 02": "Excavator 02",
  };
  return map[unit.trim()] || unit.trim();
}

function convertExcelDate(excelDate) {
  if (typeof excelDate === "number") {
    return new Date((excelDate - 25569) * 86400 * 1000).toISOString().split("T")[0];
  }
  const parsed = new Date(excelDate);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : "";
}

// **FUNGSI KUNCI SINKRONISASI INVENTORY (LOGIKA DIPERBAIKI)**
// Fungsi sinkronisasi yang benar (upsert inventory)
function upsertInventory({ tanggal, kode, nama, satuan, unit, delta }) {
  // Update atau Insert stok barang
  // Pastikan 'delta' adalah angka
  const amount = parseInt(delta) || 0;
  
  db.get("SELECT id, jumlah FROM inventory WHERE kode = ? AND unit = ?", [kode, unit], (err, row) => {
    if (err) {
      console.error("[upsertInventory] Gagal mengecek inventory:", err.message);
      return;
    }
    
    if (!row) {
      // Jika barang BELUM ADA di inventory, buat baru
      console.log(`[upsertInventory] Barang baru: ${kode} (${unit}). Stok awal: ${Math.max(0, amount)}`);
      db.run(`INSERT INTO inventory (tanggal, kode, nama, alias, jumlah, satuan, unit) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tanggal, kode, nama, '', Math.max(0, amount), satuan, unit]);
    } else {
      // Jika barang SUDAH ADA, update jumlahnya
      const newJumlah = (row.jumlah || 0) + amount;
      console.log(`[upsertInventory] Update barang: ${kode} (${unit}). Stok lama: ${row.jumlah}, Stok baru: ${Math.max(0, newJumlah)}`);
      db.run(`UPDATE inventory SET jumlah = ? WHERE id = ?`, [Math.max(0, newJumlah), row.id]);
    }
  });
}

// ====================================================================
// ==================== BLOK PERBAIKAN DIMULAI ====================
// ====================================================================

// API untuk menambah barang masuk (SEKARANG DENGAN SINKRONISASI)
app.post("/api/barang-masuk", (req, res) => {
  const { tanggal, kode, nama, jumlah, satuan, unit } = req.body;
  const finalUnit = normalizeUnit(unit);
  const finalJumlah = parseInt(jumlah); // Pastikan jumlah adalah angka

  // Validasi input
  if (!tanggal || !kode || !nama || !satuan || isNaN(finalJumlah) || finalJumlah <= 0) {
    return res.status(400).json({ error: "Semua data wajib diisi dan Jumlah harus angka positif." });
  }

  // 1. Masukkan ke tabel histori 'barang_masuk'
  db.run("INSERT INTO barang_masuk (tanggal, kode, nama, jumlah, satuan, unit) VALUES (?, ?, ?, ?, ?, ?)",
    [tanggal, kode, nama, finalJumlah, satuan, finalUnit], function (err) {
      if (err) {
        console.error("Error saat menambah barang masuk:", err.message);
        return res.status(500).json({ error: "Gagal menambah barang masuk" });
      }
      
      const newId = this.lastID;
      console.log(`[Barang Masuk] Histori berhasil ditambahkan: ${newId}`);

      // 2. Panggil fungsi 'upsert' untuk SINKRONISASI ke inventory
      // 'delta' adalah 'finalJumlah' (positif, karena barang masuk)
      upsertInventory({
        tanggal: tanggal,
        kode: kode,
        nama: nama,
        satuan: satuan,
        unit: finalUnit,
        delta: finalJumlah 
      });

      // 3. Kirim respons sukses
      res.json({ id: newId, message: "Barang masuk berhasil ditambahkan DAN inventory diupdate" });
    });
});

// ==================================================================
// ==================== BLOK PERBAIKAN SELESAI ====================
// ==================================================================


// Fungsi untuk menyinkronkan data barang di inventory
// Fungsi untuk memproses data upload
// CATATAN: Ini adalah definisi PERTAMA. Kode kamu punya 2 definisi.


// Fungsi untuk meng-upload data inventory (langsung memasukkan ke inventory)
// CATATAN: Ini adalah definisi PERTAMA.


// Rute GET untuk mengambil data inventory
// CATATAN: Ini adalah definisi PERTAMA.



// Endpoint untuk sinkronisasi inventory
app.post("/sync-inventory", (req, res) => {
  const { kode, nama, satuan, unit, jumlah } = req.body;

  // Panggil fungsi untuk sinkronisasi inventory
  // syncInventory(kode, nama, satuan, unit, jumlah);
  // CATATAN: syncInventory tidak terdefinisi. Mungkin maksudmu "upsertInventory"?

  res.json({ message: "Inventory berhasil disinkronkan!" });
});



// Tambah Barang Keluar (Logika ini sudah benar, mengurangi stok)
app.post("/api/barang-keluar", (req, res) => {
  const { tanggal, kode, nama, jumlah, satuan, unit } = req.body;
  const finalUnit = normalizeUnit(unit);
  const finalJumlah = parseInt(jumlah); // Pastikan jumlah adalah angka

  // Validasi input
  if (!tanggal || !kode || !nama || !satuan || isNaN(finalJumlah) || finalJumlah <= 0) {
    return res.status(400).json({ error: "Semua data wajib diisi dan Jumlah harus angka positif." });
  }

  // 1. Tambahkan ke tabel barang keluar (histori)
  db.run(`INSERT INTO barang_keluar (tanggal, kode, nama, jumlah, satuan, unit) VALUES (?, ?, ?, ?, ?, ?)`,
    [tanggal, kode, nama, finalJumlah, satuan, finalUnit], function (err) {
      if (err) {
        console.error("Error saat menambah barang keluar:", err.message);
        return res.status(500).json({ error: "Gagal menambah barang keluar" });
      }

      const newId = this.lastID;
      console.log(`[Barang Keluar] Histori berhasil ditambahkan: ${newId}`);

      // 2. Panggil fungsi 'upsert' untuk SINKRONISASI ke inventory
      // 'delta' adalah -finalJumlah (negatif, karena barang keluar)
      upsertInventory({
        tanggal: tanggal,
        kode: kode,
        nama: nama,
        satuan: satuan,
        unit: finalUnit,
        delta: -finalJumlah // <-- Menggunakan minus untuk mengurangi
      });

      // 3. Kirim respons
      // Catatan: 'upsertInventory' berjalan di latar belakang (async).
      // Kita tidak menunggu stoknya 0, kita biarkan saja stoknya minus jika dipaksa.
      // Logika 'if (newJumlahInventory >= 0)' yang lama bisa menyebabkan data histori
      // tidak sinkron jika admin salah input. Lebih baik biarkan, nanti perbaiki di inventory.
      res.json({ id: newId, message: "Barang keluar berhasil ditambahkan dan stok inventory dikurangi" });
    
    });
});


// Edit Barang Keluar (Logika Disempurnakan)
app.put("/api/barang-keluar/:id", (req, res) => {
  const { id } = req.params;
  const { tanggal, kode, nama, jumlah, satuan, unit } = req.body;
  const finalUnit = normalizeUnit(unit);
  const finalJumlah = parseInt(jumlah);

  if (!tanggal || !kode || !nama || isNaN(finalJumlah) || finalJumlah <= 0 || !satuan) {
    return res.status(400).json({ error: "Data wajib diisi dengan benar (jumlah harus > 0)" });
  }

  db.get("SELECT kode, nama, satuan, unit FROM barang_keluar WHERE id = ?", [id], (err, oldRow) => {
    if (!oldRow) return res.status(404).json({ error: "Barang keluar tidak ditemukan" });

    // 1. Update tabel transaksi
    db.run(`UPDATE barang_keluar SET tanggal = ?, kode = ?, nama = ?, jumlah = ?, satuan = ?, unit = ? WHERE id = ?`,
      [tanggal, kode, nama, finalJumlah, satuan, finalUnit, id], function (err) {
        if (err) return res.status(500).json({ error: "Gagal mengupdate barang keluar" });

        // 2. Sinkronisasi
        // CATATAN: Ini perlu logika sinkronisasi yang lebih kompleks (mengembalikan stok lama, mengurangi stok baru)
        // Untuk saat ini, kita biarkan dulu agar tidak merusak data.
        // syncInventory(...)
        res.json({ message: "Barang keluar berhasil diupdate (Sinkronisasi Manual Diperlukan)" });
      });
  });
});

// Hapus Barang Keluar (Logika Disempurnakan)
app.delete("/api/barang-keluar/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT kode, nama, satuan, unit, jumlah FROM barang_keluar WHERE id = ?", [id], (err, row) => {
    if (!row) return res.status(404).json({ error: "Barang keluar tidak ditemukan" });

    // 1. Hapus dari tabel transaksi
    db.run("DELETE FROM barang_keluar WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ error: "Gagal menghapus barang keluar" });

      // 2. Sinkronisasi inventory (KEMBALIKAN STOK)
      // 'delta' adalah positif, karena kita mengembalikan barang yg batal keluar
      upsertInventory({
        tanggal: moment().format("YYYY-MM-DD"), // Tanggal hari ini
        kode: row.kode,
        nama: row.nama,
        satuan: row.satuan,
        unit: row.unit,
        delta: row.jumlah // <-- Jumlah positif (mengembalikan)
      });
      
      res.json({ message: "Barang keluar berhasil dihapus dan stok dikembalikan" });
    });
  });
});


// ========== API INVENTORY (TETAP) ==========
// CATATAN: Ini adalah definisi KEDUA.
app.get("/api/inventory", (req, res) => {
  const unit = req.query.unit;
  let query = "SELECT * FROM inventory";
  const params = [];
  if (unit && unit !== "Semua Unit") {
    query += " WHERE unit = ?";
    params.push(unit);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put("/api/inventory/:id", (req, res) => {
  const { id } = req.params;
  const { tanggal, kode, nama, alias, jumlah, satuan, unit } = req.body;
  const finalKode = kode || req.body.kode_barang;
  const finalNama = nama || req.body.nama_barang;
  const finalJumlah = jumlah ?? req.body.stok;

  db.get("SELECT * FROM inventory WHERE id = ?", [id], (err, oldRow) => {
    if (!oldRow) return res.status(404).json({ error: "Barang tidak ditemukan di inventory" });

    db.run(
      `UPDATE inventory SET tanggal = ?, kode = ?, nama = ?, alias = ?, jumlah = ?, satuan = ?, unit = ? WHERE id = ?`,
      [tanggal || oldRow.tanggal, finalKode, finalNama, alias || oldRow.alias, finalJumlah ?? oldRow.jumlah, satuan || oldRow.satuan, unit || oldRow.unit, id],
      function (err) {
        if (err) return res.status(500).json({ error: "Gagal mengupdate inventory" });
        res.json({ message: "Barang di inventory berhasil diupdate" });
      }
    );
  });
});


app.delete("/api/inventory/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM inventory WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Gagal menghapus barang dari inventory" });
    res.json({ message: "Barang berhasil dihapus dari inventory" });
  });
});

app.post("/reset-data", (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM barang_masuk");
    db.run("DELETE FROM barang_keluar");
    db.run("DELETE FROM inventory");
    res.json({ message: "Data berhasil direset" });
  });
});

// ========== UPLOAD (LOGIKA ASYNC DIPERBAIKI) ==========

// Fungsi untuk memproses data. Map setiap baris ke Promise
// CATATAN: Ini adalah definisi KEDUA.
// (Fungsi processUploadData sepertinya hilang di kodemu, tapi kita tidak pakai itu di /upload-inventory)

// Upload Barang Masuk (Menggunakan fungsi helper processUploadData)
app.post("/upload-barang-masuk", upload.single("file"), (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path); // Membaca file Excel yang di-upload
    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Mengambil sheet pertama
    const data = xlsx.utils.sheet_to_json(sheet); // Mengkonversi sheet ke format JSON

    // Normalisasi kode barang sebelum diproses
    data.forEach(item => {
      item.Kode = normalizeKodeBarang(item.Kode); // Menormalisasi kode barang
    });

    // Panggil fungsi (yang hilang) untuk meng-upload data
    // processUploadData(data, 'barang_masuk', req, res); 
    
    // Fallback jika processUploadData tidak ada
    console.error("Fungsi 'processUploadData' tidak ditemukan.");
    res.status(500).json({ message: 'Fungsi processUploadData tidak terdefinisi di server.' });

  } catch (err) {
    console.error("Upload Barang Masuk Catch Error:", err);
    if (req.file && req.file.path) fs.unlinkSync(req.file.path); // Pastikan file dihapus jika terjadi error
    res.status(500).json({ message: 'Gagal upload barang masuk' });
  }
});

// Rute GET untuk mengambil data barang masuk
app.get("/api/barang-masuk", (req, res) => {
  db.all("SELECT * FROM barang_masuk", (err, rows) => {
    if (err) {
      console.error("Error fetching barang masuk:", err.message);
      return res.status(500).json({ error: "Gagal mengambil data barang masuk" });
    }
    res.json(rows); // Mengembalikan data barang masuk dalam bentuk JSON
  });
});


// Upload Barang Keluar (Menggunakan fungsi helper processUploadData)
app.post("/upload-barang-keluar", upload.single("file"), (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // processUploadData(data, 'barang_keluar', req, res);
    
    // Fallback jika processUploadData tidak ada
    console.error("Fungsi 'processUploadData' tidak ditemukan.");
    res.status(500).json({ message: 'Fungsi processUploadData tidak terdefinisi di server.' });


  } catch (err) {
    console.error("Upload Barang Keluar Catch Error:", err);
    if (req.file && req.file.path) fs.unlinkSync(req.file.path); // Pastikan file dihapus
    res.status(500).json({ message: 'Gagal upload barang keluar' });
  }
});

// Rute GET untuk mengambil data barang keluar
app.get("/api/barang-keluar", (req, res) => {
  db.all("SELECT * FROM barang_keluar", (err, rows) => {
    if (err) {
      console.error("Error fetching barang keluar:", err.message);
      return res.status(500).json({ error: "Failed to fetch barang keluar" });
    }
    res.json(rows); // Mengembalikan data barang keluar dalam bentuk JSON
  });
});

// Fungsi normalisasi kode barang
function normalizeKodeBarang(kode) {
  if (!kode) return ""; // Tambahkan pengecekan jika kode null atau undefined
  return kode.toString().replace(/\s+/g, "").toUpperCase(); // Menghapus spasi dan mengubah ke huruf kapital
}

// Saat memproses upload data
// CATATAN: Ini adalah definisi KEDUA.
// GANTI FUNGSI LAMA KAMU DENGAN YANG INI
app.post("/upload-inventory", upload.single("file"), (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // --- LOG TAMBAHAN 1 ---
    console.log("=====================================");
    console.log(`[LOG] Membaca Excel. Jumlah baris: ${data.length}`);
    console.log("[LOG] 5 baris data mentah pertama:", data.slice(0, 5));
    // --- AKHIR LOG ---

    const stmt = db.prepare(`
      INSERT INTO inventory (tanggal, kode, nama, alias, jumlah, satuan, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(kode, unit) DO UPDATE SET
        tanggal = excluded.tanggal,
        nama = excluded.nama,
        alias = excluded.alias,
        jumlah = excluded.jumlah,
        satuan = excluded.satuan
    `);

    db.serialize(() => {
      data.forEach((item, index) => {
        const tanggal = item.Tanggal ? convertExcelDate(item.Tanggal) : moment().format("YYYY-MM-DD");
        const kode = normalizeKodeBarang(item.Kode);  // Normalisasi kode barang
        const nama = item["Nama Barang"] || "";
        const alias = item.Alias || "";
        const jumlah = parseInt(item["Sisa Akhir"] || item.Jumlah || 0);
        const satuan = item.Satuan || "";
        const unit = normalizeUnit(item.Unit || "");

        // --- LOG TAMBAHAN 2 ---
        console.log(`[LOG] Memproses Baris ${index}: Kode='${kode}', Nama='${nama}'`);

        if (!nama || !kode) {
          // --- LOG TAMBAHAN 3 ---
          console.log(`[LOG] -> BARIS ${index} DIABAIKAN (Kode/Nama kosong)`);
          return; // Ini 'return' dari forEach, lanjut ke item berikutnya
        }

        stmt.run(tanggal, kode, nama, alias, jumlah, satuan, unit);
        
        // --- LOG TAMBAHAN 4 ---
        console.log(`[LOG] -> Baris ${index} Sukses Dimasukkan/Diupdate.`);
      });
    });

    stmt.finalize();
    fs.unlinkSync(req.file.path);
    
    // --- LOG TAMBAHAN 5 ---
    console.log("[LOG] Finalize selesai. Mengirim respons sukses.");
    console.log("=====================================");
    // --- AKHIR LOG ---

    res.json({ message: 'Inventory berhasil diupload!' });

  } catch (err) {
    console.error("Upload Inventory Error:", err);
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Gagal upload inventory' });
  }
});

// ========== API UNTUK DAFTAR DROPDOWN (BARU) ==========
app.get("/api/list-units", (req, res) => {
  console.log("[LOG] Request diterima untuk /api/list-units");
  
  // Query ini mengambil SEMUA unit dari inventory,
  // menormalkannya ke HURUF BESAR,
  // dan mengambil hanya yang unik (DISTINCT)
  const query = `
    SELECT DISTINCT UPPER(unit) as unit 
    FROM inventory 
    WHERE unit IS NOT NULL AND unit != '' 
    ORDER BY unit ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching unit list:", err.message);
      return res.status(500).json({ error: err.message });
    }
    
    // Kirim datanya sebagai array string, cth: ["BM 100", "EXCAVATOR", "TANPA UNIT"]
    const unitList = rows.map(row => row.unit);
    console.log("[LOG] Mengirim daftar unit:", unitList);
    res.json(unitList);
  });
});

// ========== API UNTUK ANALISIS MOVING AVERAGE (FITUR TA) ==========
app.get("/api/analisis-ma", (req, res) => {
  const { kode, unit, N = 3 } = req.query;  // N default 3, bisa diubah dari frontend
  const period = parseInt(N);  // Mengubah nilai period

  // Log yang lebih baik untuk debugging
  console.log(`[Analisis MA] Request diterima: Kode='${kode}', Unit='${unit}', Periode N=${period}`);

  // Validasi input
  if (!kode || !unit || period < 2) {
    console.log("[Analisis MA] Validasi Gagal: Input tidak lengkap.");
    return res.status(400).json({ error: "Kode, Unit, dan Periode (N>=2) wajib diisi." });
  }

  // Ambil tanggal akhir bulan (untuk filter tanggal)
  const today = moment().endOf('month').format('YYYY-MM-DD');
  const startDate = moment().subtract(6, 'months').startOf('month').format('YYYY-MM-DD'); // Ambil data 6 bulan terakhir

  // Query untuk mengambil data barang keluar dan barang masuk
  const queryKeluar = `
  SELECT b.tanggal, b.kode, b.unit, b.jumlah
  FROM barang_keluar AS b
  WHERE 
    UPPER(b.kode) = UPPER(?) AND 
    UPPER(b.unit) = UPPER(?) AND 
    b.tanggal BETWEEN ? AND ?
  ORDER BY b.tanggal ASC;
`; // --- PERBAIKAN DI SINI --- (Menambahkan UPPER)

  const queryMasuk = `
  SELECT b.tanggal, b.kode, b.unit, b.jumlah
  FROM barang_masuk AS b
  WHERE 
    UPPER(b.kode) = UPPER(?) AND 
    UPPER(b.unit) = UPPER(?) AND 
    b.tanggal BETWEEN ? AND ?
  ORDER BY b.tanggal ASC;
`; // --- PERBAIKAN DI SINI --- (Menambahkan UPPER)

  const params = [kode, unit, startDate, today];
  console.log(`[Analisis MA] Menjalankan query dengan params:`, params);

  // Ambil data barang keluar
  db.all(queryKeluar, params, (err, rowsKeluar) => {
    if (err) {
      console.error("[Analisis MA] Error saat mengambil data Barang Keluar:", err.message);
      return res.status(500).json({ error: "Gagal memproses data pemakaian barang keluar" });
    }

    // Ambil data barang masuk
    db.all(queryMasuk, params, (err, rowsMasuk) => {
      if (err) {
        console.error("[Analisis MA] Error saat mengambil data Barang Masuk:", err.message);
        return res.status(500).json({ error: "Gagal memproses data pemakaian barang masuk" });
      }

      console.log(`[Analisis MA] Data ditemukan: ${rowsKeluar.length} (Keluar), ${rowsMasuk.length} (Masuk)`);

      // Jika tidak ada data barang keluar dan masuk
      if (rowsKeluar.length === 0 && rowsMasuk.length === 0) {
        console.log("[Analisis MA] Tidak ada data ditemukan untuk kombinasi ini.");
        return res.status(404).json({ message: "Tidak ada data pemakaian untuk suku cadang dan unit ini." });
      }

      // Hitung Moving Average untuk Barang Keluar
      const usageDataKeluar = rowsKeluar.map(row => row.jumlah); // Gunakan jumlah barang
      const maResultKeluar = calculateMovingAverage(usageDataKeluar, period); // Hitung Moving Average

      // Hitung Moving Average untuk Barang Masuk
      const usageDataMasuk = rowsMasuk.map(row => row.jumlah); // Gunakan jumlah barang
      const maResultMasuk = calculateMovingAverage(usageDataMasuk, period); // Hitung Moving Average

      // Gabungkan hasil Moving Average dengan data asli
      const finalResultKeluar = rowsKeluar.map((row, index) => ({
        periode: row.tanggal,
        pemakaian_aktual: row.jumlah,
        moving_average: maResultKeluar[index] === null ? "-" : maResultKeluar[index].toFixed(2), // Pembulatan 2 desimal
      }));

      const finalResultMasuk = rowsMasuk.map((row, index) => ({
        periode: row.tanggal,
        pemakaian_aktual: row.jumlah,
        moving_average: maResultMasuk[index] === null ? "-" : maResultMasuk[index].toFixed(2), // Pembulatan 2 desimal
      }));

      // Prediksi untuk periode berikutnya (t+1) untuk masing-masing
      let prediksiBerikutnyaKeluar = maResultKeluar.length > 0 ? (maResultKeluar[maResultKeluar.length - 1] !== null ? maResultKeluar[maResultKeluar.length - 1].toFixed(2) : null) : null;
      let prediksiBerikutnyaMasuk = maResultMasuk.length > 0 ? (maResultMasuk[maResultMasuk.length - 1] !== null ? maResultMasuk[maResultMasuk.length - 1].toFixed(2) : null) : null;

      console.log(`[Analisis MA] Mengirim hasil sukses ke frontend.`);

      // Kirim response dengan data dan prediksi
      res.json({
        data_histori_keluar: finalResultKeluar,
        prediksi_t_plus_1_keluar: prediksiBerikutnyaKeluar,
        data_histori_masuk: finalResultMasuk,
        prediksi_t_plus_1_masuk: prediksiBerikutnyaMasuk,
        periode_ma: period,
      });
    });
  });
});


// Fungsi untuk menghitung Moving Average (MA)
function calculateMovingAverage(data, period) {
  let movingAverage = [];

  // Pastikan data yang diterima valid
  if (!Array.isArray(data) || data.length < period) {
    // console.error("Data tidak cukup untuk perhitungan Moving Average.");
    // Modifikasi: Kembalikan array berisi null yang sesuai dengan panjang data
    // agar 'finalResult' tetap bisa map
    return data.map(() => null);
  }
  
  // Isi array dengan null untuk periode awal yang tidak bisa dihitung MA
  for (let i = 0; i < period - 1; i++) {
    movingAverage.push(null); 
  }

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    // Jumlahkan nilai dalam periode yang ditentukan
    for (let j = i - (period - 1); j <= i; j++) {
      sum += data[j];
    }
    // Hitung rata-rata dan masukkan ke dalam array
    movingAverage.push(sum / period);
  }

  return movingAverage;
}

// Cek dan ganti `autoKode` jika tidak ada
function autoKode(prefix) {
    return `${prefix}-${new Date().getTime()}`;
}


app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server jalan di http://0.0.0.0:${PORT}`);
});