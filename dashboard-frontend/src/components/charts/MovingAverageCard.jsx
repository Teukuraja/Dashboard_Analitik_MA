import React from "react";
import { Card, CardContent, CardHeader } from "../ui/Card"; // Pastikan path ini benar
// Import komponen grafik dari Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function MovingAverageCard({ title, data, prediksi, periode }) {

  // --- FUNGSI BARU UNTUK GRAFIK ---
  // Kita ubah data agar bisa dibaca oleh grafik
  // Cth: { periode: "2025-11-09", pemakaian_aktual: 10, moving_average: "11.33" }
  // Menjadi: { name: "11-09", "Aktual": 10, "MA": 11.33 }
  const chartData = data.map(item => ({
    // Ambil bulan dan tanggal saja (misal: "11-09") biar ringkas
    name: item.periode.slice(5), 
    
    // Pastikan ini adalah angka
    "Aktual": item.pemakaian_aktual, 
    
    // Ubah "-" menjadi 'null' agar garis grafiknya putus (sudah benar)
    // Ubah string "11.33" menjadi angka 11.33
    "MA": item.moving_average === "-" ? null : parseFloat(item.moving_average),
  }));

  return (
    <Card className="mt-6">
      <CardHeader 
        title={title} 
        subtitle={`Analisis Moving Average (N=${periode})`} 
      />
      
      <CardContent>
        {/* Cek jika 'data' (dari props) ada dan tidak kosong */}
        {data && data.length > 0 ? (
          <>
            {/* === BAGIAN GRAFIK (BARU) === */}
            <div style={{ width: '100%', height: 300 }} className="mb-6">
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} /> {/* Sumbu X (Tanggal) */}
                  <YAxis tick={{ fill: '#94a3b8' }} /> {/* Sumbu Y (Jumlah) */}
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', // Tooltip warna gelap
                      borderColor: '#334155',
                      borderRadius: '8px'
                    }} 
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Aktual" 
                    stroke="#3b82f6" // Warna biru
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="MA" 
                    stroke="#f59e0b" // Warna kuning/oranye
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false} // Garis akan putus jika data 'null'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* === AKHIR BAGIAN GRAFIK === */}


            {/* === BAGIAN TABEL (TETAP SAMA) === */}
            <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Data Histori
            </h4>
            <table className="table-auto w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border-b px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Tanggal (Periode)</th>
                  <th className="border-b px-4 py-2 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Pemakaian Aktual</th>
                  <th className="border-b px-4 py-2 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Moving Average</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="border-b px-4 py-2 dark:text-gray-300">{item.periode}</td>
                    <td className="border-b px-4 py-2 text-right dark:text-gray-300">{item.pemakaian_aktual}</td>
                    <td className="border-b px-4 py-2 text-right font-medium text-gray-800 dark:text-gray-100">{item.moving_average}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* === BAGIAN PREDIKSI (TETAP SAMA) === */}
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                Prediksi Periode Berikutnya (t+1):
              </h4>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {prediksi ? prediksi : "Data tidak cukup"}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Tidak ada data histori untuk ditampilkan.
          </div>
        )}
      </CardContent>
    </Card>
  );
}