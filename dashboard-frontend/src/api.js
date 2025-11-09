// api.js
import axios from 'axios';

// Base URL API (ubah dengan URL API server kamu)
const baseURL = "http://localhost:8080"; // Ganti dengan URL API lokal yang sesuai

// Fungsi untuk mengambil data analisis moving average
export const getMovingAverageData = async (kode, unit, period = 3) => {
  try {
    const response = await axios.get(`${baseURL}/api/analisis-ma`, {
      params: { kode, unit, N: period }, // Mengirim parameter query ke API
    });
    return response.data; // Mengembalikan data yang diterima dari API
  } catch (error) {
    console.error('Error fetching moving average data:', error);
    throw error; // Melemparkan error jika API gagal
  }
};

export default baseURL;
