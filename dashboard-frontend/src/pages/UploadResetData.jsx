import { useState } from "react";
import UploadForm from "../components/forms/UploadForm";
import Button from "../components/ui/Button";
import { toast } from "react-hot-toast";
import axios from "axios";
// Import baseURL. Pastikan file ini berisi: export const baseURL = "http://localhost:8080";
// BarangMasuk.jsx
import baseURL from "../api"; // Karena menggunakan default export



export default function UploadResetData() {
  const [resetting, setResetting] = useState(false);

  // Fungsi yang sudah dirapikan dan disederhanakan
  const handleResetData = async () => {
    // 1. Konfirmasi pengguna
    const konfirmasi = confirm("⚠️ PERINGATAN! Yakin ingin mereset SEMUA DATA (Barang Masuk, Keluar, dan Inventory)? Aksi ini tidak bisa dibatalkan.");
    if (!konfirmasi) {
      toast("Reset dibatalkan.", { icon: '✋' });
      return;
    }

    // 2. Mulai proses reset
    setResetting(true);
    toast.loading("Memproses reset semua data...", { id: 'resetToast' });

    try {
      // ✅ Request API ke endpoint reset-data
      // baseURL harus mengarah ke backend (misal: http://localhost:8080)
      const response = await axios.post(`${baseURL}/reset-data`);

      // 3. Verifikasi Status Respon
      if (response.status !== 200) {
        // Jika status bukan 200 (misalnya 500, 404), lempar error
        throw new Error(`Gagal mereset data. Status: ${response.status}`);
      }
      
      // 4. Sukses
      toast.success("✅ Semua data berhasil direset!", { id: 'resetToast' });

    } catch (err) {
      // 5. Tangani Error (misalnya ERR_CONNECTION_REFUSED atau status 500 dari server)
      console.error("❌ Gagal mereset data:", err);
      // Pesan error di toast
      toast.error(`Gagal mereset data! Cek konsol.`, { id: 'resetToast' });
      
    } finally {
      // 6. Selesai
      setResetting(false);
    }
  };

  return (
    <div className="p-6 space-y-10 text-black dark:text-white transition-colors">
      {/* Judul Halaman */}
      <h1 className="text-3xl font-bold text-center">
        Upload & Reset Data
      </h1>

      {/* Upload Form Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Barang Masuk */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4 transition-colors">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Upload Barang Masuk
          </h2>
          {/* Component UploadForm akan menangani upload ke /upload-barang-masuk */}
          <UploadForm type="masuk" />
        </div>

        {/* Barang Keluar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4 transition-colors">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Upload Barang Keluar
          </h2>
          {/* Component UploadForm akan menangani upload ke /upload-barang-keluar */}
          <UploadForm type="keluar" />
        </div>

        {/* Inventory */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4 transition-colors">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Upload Inventory Awal
          </h2>
          {/* Component UploadForm akan menangani upload ke /upload-inventory */}
          <UploadForm type="inventory" /> 
        </div>
      </div>

      {/* Reset Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center space-y-6 transition-colors">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Reset Semua Data
        </h2>
        <Button
          variant="destructive"
          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition disabled:opacity-50"
          onClick={handleResetData}
          disabled={resetting}
        >
          {resetting ? "Mereset..." : "Reset Semua Data"}
        </Button>
      </div>
    </div>
  );
}