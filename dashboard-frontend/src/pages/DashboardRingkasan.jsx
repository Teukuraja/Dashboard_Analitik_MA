import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import SummaryCards from "../components/ui/SummaryCards";  // Impor komponen SummaryCards
import ChartPie from "../components/charts/ChartPie";
import AreaChartTrend from "../components/charts/AreaChartTrend";
import FilterModeSwitch from "../components/filters/FilterModeSwitch";
import baseURL from "../api";  // Pastikan baseURL diimpor dengan benar

export default function DashboardRingkasan() {
  const location = useLocation();
  const navigate = useNavigate();

  const [barangMasuk, setBarangMasuk] = useState([]);
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);
  const [mode, setMode] = useState("monthly");

  // Menambahkan useEffect untuk memeriksa status login dan mengambil data
  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem("isLoggedIn") || sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    fetchData();  // Memanggil fungsi untuk mengambil data
  }, [navigate]);

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    try {
      setLoading(true);

      // Endpoint API untuk mengambil data
      const endpoints = [
        `${baseURL}/api/barang-masuk`,
        `${baseURL}/api/barang-keluar`,
        `${baseURL}/api/inventory`,
      ];

      const responses = await Promise.all(
        endpoints.map((url) =>
          fetch(url).then(async (res) => {
            const contentType = res.headers.get("content-type");
            if (!res.ok || !contentType?.includes("application/json")) {
              const text = await res.text();
              console.error(`❌ Error dari ${url}:`, text);
              throw new Error(`Gagal fetch dari ${url}`);
            }
            return res.json();
          })
        )
      );

      setBarangMasuk(Array.isArray(responses[0]) ? responses[0] : []);
      setBarangKeluar(Array.isArray(responses[1]) ? responses[1] : []);
      setInventory(Array.isArray(responses[2]) ? responses[2] : []);

      toast.success("Data berhasil dimuat! 🚀");
    } catch (error) {
      console.error("❌ Gagal mengambil data:", error.message);
      toast.error("Gagal mengambil data! 🚨");
    } finally {
      setLoading(false);
    }
  };

  const totalMasuk = barangMasuk.reduce((sum, item) => sum + item.jumlah, 0);
  const totalKeluar = barangKeluar.reduce((sum, item) => sum + item.jumlah, 0);
  const totalInventory = inventory.reduce((sum, item) => sum + item.jumlah, 0);

  // Menambahkan barang dengan stok kurang dari 3
  const lowStockItems = inventory.filter((item) => item.jumlah < 3);

  // VVV INI FUNGSI BARU UNTUK NAVIGASI VVV
  const handleLowStockClick = () => {
    // Kita akan navigasi ke halaman Inventory
    // dan mengirim "state" khusus untuk memberitahu
    // halaman Inventory agar memfilter 'stok rendah'.
    toast.success('Menampilkan item stok rendah...');
    navigate('/inventory', { state: { filter: 'low_stock' } });
  };
  // ^^^ AKHIR FUNGSI BARU ^^^

  const formatDataPie = (data) => {
    const result = {};
    data.forEach((item) => {
      const unit = item.unit?.trim() || "Tanpa Unit";
      result[unit] = (result[unit] || 0) + item.jumlah;
    });
    return Object.entries(result).map(([unit, value]) => ({
      name: unit,
      value,
      percent: ((value / totalMasuk) * 100).toFixed(1),
    }));
  };

  const formatAreaChartData = (data, mode) => {
    const agregasi = {};
    data.forEach((item) => {
      let key = "";
      if (mode === "weekly") {
        key = dayjs(item.tanggal).startOf("week").format("YYYY-MM-DD");
      } else if (mode === "monthly") {
        key = dayjs(item.tanggal).format("MMM YYYY");
      } else if (mode === "yearly") {
        key = dayjs(item.tanggal).format("YYYY");
      }
      agregasi[key] = (agregasi[key] || 0) + item.jumlah;
    });
    return Object.entries(agregasi).map(([label, total]) => ({ label, total }));
  };

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-left">
        Dashboard Gudang Sparepart
      </h1>

      {/* Komponen Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <SummaryCards
            totalMasuk={totalMasuk}
            totalKeluar={totalKeluar}
            totalInventory={totalInventory}
            loading={loading}
          />
        </div>

        {/* Menambahkan tampilan untuk stok yang sangat rendah */}
        <div className="md:col-span-1 self-start mt-10">
          {lowStockItems.length > 0 && (
            // VVV EDIT DIV INI: Tambahkan onClick & styling VVV
            <div
              className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded-2xl shadow-md transition-transform hover:scale-105 cursor-pointer"
              onClick={handleLowStockClick}
            >
            {/* ^^^ AKHIR PERUBAHAN ^^^ */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Stok Sangat Rendah</h3>
                <p className="font-bold text-lg">{lowStockItems.length} item</p>
              </div>
              <p className="text-xs mt-1 text-red-700 dark:text-red-300">
                Klik untuk melihat lebih lanjut
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Mode */}
      <div className="w-full flex justify-center mt-6">
        <FilterModeSwitch mode={mode} setMode={setMode} />
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading grafik...</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <AreaChartTrend
                title={`Trend Barang Masuk (${mode === "weekly" ? "Mingguan" : mode === "monthly" ? "Bulanan" : "Tahunan"})`}
                data={formatAreaChartData(barangMasuk, mode)}
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <AreaChartTrend
                title={`Trend Barang Keluar (${mode === "weekly" ? "Mingguan" : mode === "monthly" ? "Bulanan" : "Tahunan"})`}
                data={formatAreaChartData(barangKeluar, mode)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <ChartPie title="Komposisi Barang Masuk" data={formatDataPie(barangMasuk)} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <ChartPie title="Komposisi Barang Keluar" data={formatDataPie(barangKeluar)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}