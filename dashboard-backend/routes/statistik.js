const express = require('express');
const router = express.Router();
const db = require('../db'); // asumsi pakai better-sqlite3 atau sqlite3

router.get('/statistik', (req, res) => {
  try {
    const totalMasuk = db.prepare('SELECT SUM(Jumlah) as total FROM barang_masuk').get().total || 0;
    const totalKeluar = db.prepare('SELECT SUM(Jumlah) as total FROM barang_keluar').get().total || 0;

    const unitTerbanyak = db.prepare(`
      SELECT Unit, SUM(Jumlah) as total 
      FROM barang_masuk 
      GROUP BY Unit 
      ORDER BY total DESC 
      LIMIT 1
    `).get();

    const barangTerbanyak = db.prepare(`
      SELECT NamaBarang, SUM(Jumlah) as total 
      FROM barang_masuk 
      GROUP BY NamaBarang 
      ORDER BY total DESC 
      LIMIT 1
    `).get();

    res.json({
      totalMasuk,
      totalKeluar,
      unitTerbanyak: unitTerbanyak?.Unit || '-',
      barangTerbanyak: barangTerbanyak?.NamaBarang || '-'
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data statistik' });
  }
});

module.exports = router;
