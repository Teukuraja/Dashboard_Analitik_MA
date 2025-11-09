import React, { useState } from 'react';
// VVV INI DIA PERBAIKANNYA VVV
import { getMovingAverageData } from '../api'; // Menggunakan nama fungsi dari api.js kamu
import MovingAverageCard from '../components/charts/MovingAverageCard';
import { Search } from 'lucide-react'; 
import toast from 'react-hot-toast';

const AnalisisMA = () => {
  const [form, setForm] = useState({
    kode: '',
    unit: '',
    N: 3, // Periode default
  });
  const [data, setData] = useState(null); // State untuk simpan hasil
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk handle perubahan form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value.toUpperCase(), // Otomatis uppercase biar rapi
    }));
  };

  // Fungsi untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.kode || !form.unit) {
      toast.error('Kode barang dan Unit wajib diisi!');
      return;
    }

    setIsLoading(true);
    setData(null); // Kosongkan data lama
    const toastId = toast.loading('Menganalisis data...');

    try {
      // VVV DAN INI PERBAIKANNYA VVV
      // Memanggil fungsi 'getMovingAverageData' dari api.js
      const responseData = await getMovingAverageData(form.kode, form.unit, form.N); 
      
      setData(responseData); // Simpan data dari backend
      toast.success('Analisis berhasil didapat!', { id: toastId });
      console.log('Data Analisis:', responseData);

    } catch (error) {
      console.error('Error fetching MA data:', error);
      // Cek apakah error message ada di 'error.response.data.message' (dari axios)
      const errorMsg = error.response?.data?.message || 'Gagal mengambil data. Cek konsol.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Ganti 'dark:bg-[#121212]' dengan warna background utama kamu jika beda
    <div className="p-4 md:p-6 min-h-screen"> 
      <h1 className="text-3xl font-bold mb-5 text-gray-800 dark:text-gray-200">
        Analisis Pola Pemakaian (Moving Average)
      </h1>

      {/* === FORM INPUT === */}
      {/* Ganti 'dark:bg-[#2B2D42]' dengan warna panel/sidebar kamu */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4 mb-6 bg-gray-100 dark:bg-[#2B2D42] p-4 rounded-lg shadow-md">
        <input
          type="text"
          name="kode"
          placeholder="Cth: BRG001"
          value={form.kode}
          onChange={handleChange}
          className="p-2 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="unit"
          placeholder="Cth: BM 100"
          value={form.unit}
          onChange={handleChange}
          className="p-2 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          name="N"
          min="2"
          placeholder="Periode (N)"
          value={form.N}
          onChange={handleChange}
          className="p-2 w-24 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {/* Ganti 'bg-blue-600' dengan warna tombol utamamu */}
        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-[#1D3557] text-white rounded-md font-semibold hover:bg-[#3E608B] transition disabled:opacity-50" disabled={isLoading}>
          <Search className="w-4 h-4" />
          {isLoading ? 'Menganalisis...' : 'Analisis'}
        </button>
      </form>

      {/* === AREA HASIL === */}
      <div>
        {isLoading && <p className="text-gray-600 dark:text-gray-400 italic">Memuat data...</p>}
        
        {data && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart untuk Barang Keluar */}
            <MovingAverageCard
              title="Pola Pemakaian (Barang Keluar)"
              data={data.data_histori_keluar}
              prediksi={data.prediksi_t_plus_1_keluar}
              periode={data.periode_ma}
            />
            {/* Chart untuk Barang Masuk */}
            <MovingAverageCard
              title="Pola Pemasukan (Barang Masuk)"
              data={data.data_histori_masuk}
              prediksi={data.prediksi_t_plus_1_masuk}
              periode={data.periode_ma}
            />
          </div>
        )}

        {!isLoading && !data && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <p>Silakan masukkan Kode Barang dan Unit untuk memulai analisis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisMA;