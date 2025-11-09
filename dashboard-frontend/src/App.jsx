import { useState } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Menu, Sun, Moon } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import BarangMasuk from "./pages/BarangMasuk";
import BarangKeluar from "./pages/BarangKeluar";
import DashboardRingkasan from "./pages/DashboardRingkasan";
import UploadResetData from "./pages/UploadResetData";
import Login from "./pages/Login";
import InventoryData from "./pages/InventoryData";

// 'AnalisisMA' sudah kamu impor, bagus!
import AnalisisMA from "./pages/AnalisisMA"; 

export default function App() {
  // State untuk mengatur sidebar terbuka atau tertutup
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // State untuk mode gelap
  const [darkMode, setDarkMode] = useState(false);
  // Hooks React Router untuk lokasi dan navigasi
  const location = useLocation();
  const navigate = useNavigate();

  // Cek status login dari localStorage atau sessionStorage
  const isLoggedIn = () =>
    localStorage.getItem("isLoggedIn") === "true" ||
    sessionStorage.getItem("isLoggedIn") === "true";

  // Daftar item navigasi sidebar
  // 'Analisis Pola' sudah kamu tambahkan, bagus!
  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/barang-masuk", label: "Barang Masuk" },
    { to: "/barang-keluar", label: "Barang Keluar" },
    { to: "/inventory", label: "Inventory" },
    { to: "/analisis-ma", label: "Analisis Pola" }, // <--- Ini sudah benar
    { to: "/upload-reset", label: "Upload & Reset Data" },
  ];

  /**
   * Mendapatkan judul halaman berdasarkan path saat ini.
   * @param {string} path - Path URL saat ini.
   * @returns {string} Judul halaman.
   */
  const getPageTitle = (path) => {
    const current = navItems.find((item) => item.to === path);
    return current ? current.label : "Dashboard Analitik";
  };

  /**
   * Komponen NavLink untuk link navigasi sidebar.
   * Menandai link aktif berdasarkan lokasi saat ini.
   * @param {string} to - Path tujuan.
   * @param {string} label - Label tampilan.
   */
  const NavLink = ({ to, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`py-2 px-4 rounded-lg transition font-medium w-full text-left ${
          isActive
            ? "bg-[#1D3557] text-white shadow-md"
            : "hover:bg-[#A8DADC] hover:text-white text-gray-300"
        }`}
      >
        {label}
      </Link>
    );
  };

  /**
   * Fungsi untuk menangani logout pengguna.
   * Menghapus status login dan mengarahkan ke halaman login.
   */
  const handleLogout = () => {
    // Saya ganti 'window.confirm' karena kadang bermasalah di beberapa browser
    // Kita gunakan 'confirm' standar saja
    if (confirm("Yakin mau logout?")) {
      localStorage.removeItem("isLoggedIn");
      toast.success("Logout berhasil! 👋");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  // Redirect ke login jika belum login dan bukan di halaman login
  if (!isLoggedIn() && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen flex flex-col`}>
      <Toaster position="top-right" reverseOrder={false} />

      {location.pathname !== "/login" && (
        <header
          className={`bg-[#1D3557] text-white px-6 py-3 flex items-center justify-start shadow-md relative z-10 transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="z-20 mr-4"
            title="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mr-auto">
            <h1 className="text-2xl font-bold hidden md:block">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button
              onClick={handleLogout}
              className="bg-[#E63946] hover:bg-[#D62828] text-white py-1 px-3 rounded-lg text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </header>
      )}

      {sidebarOpen && location.pathname !== "/login" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 bg-white dark:bg-[#121212] text-black dark:text-white transition-all">
        <AnimatePresence>
          {location.pathname !== "/login" && sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#2B2D42] text-white w-64 p-6 flex flex-col items-start shadow-lg fixed top-0 left-0 h-screen z-30"
            >
              <nav className="flex flex-col gap-4 w-full mt-8">
                {navItems.map((item) => (
                  <NavLink key={item.to} {...item} />
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        <main
          className={`w-full min-w-0 transition-all duration-300 relative overflow-y-auto ${
            sidebarOpen ? "md:ml-64" : "ml-0"
          } p-4 md:p-6`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* =========================================== */}
              {/* === INI DIA TEMPATNYA (POIN 3) === */}
              {/* =========================================== */}
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<DashboardRingkasan />} />
                <Route
                  path="/barang-masuk"
                  element={<BarangMasuk sidebarOpen={sidebarOpen} />}
                />
                <Route
                  path="/barang-keluar"
                  element={<BarangKeluar sidebarOpen={sidebarOpen} />}
                />
                <Route
                  path="/inventory"
                  element={<InventoryData sidebarOpen={sidebarOpen} />}
                />

                {/* VVV INI DIA YANG DITAMBAHKAN VVV */}
                <Route
                  path="/analisis-ma"
                  element={<AnalisisMA sidebarOpen={sidebarOpen} />}
                />
                {/* ^^^ SAMPAI SINI ^^^ */}
                
                <Route path="/upload-reset" element={<UploadResetData />} />
                <Route
                  path="*"
                  element={
                    <div className="text-center text-[#E63946] mt-10">
                      404 - Halaman tidak ditemukan
                    </div>
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}