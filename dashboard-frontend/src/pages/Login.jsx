import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

// BarangMasuk.jsx
import baseURL from "../api"; // Karena menggunakan default export

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok || !contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Login gagal, bukan JSON:", text);
        throw new Error("Server mengembalikan respons tidak valid.");
      }

      const data = await response.json();

      if (data.success) {
        if (rememberMe) {
          localStorage.setItem("isLoggedIn", "true");
        } else {
          sessionStorage.setItem("isLoggedIn", "true");
        }

        toast.success("Login berhasil! 🚀");
        setTimeout(() => navigate("/dashboard"), 100);
      } else {
        setError(data.message || "Username atau password salah!");
        toast.error("Username atau password salah!");
      }
    } catch (error) {
      setError("Login gagal, server tidak merespon!");
      toast.error("Gagal terhubung ke server!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col items-center animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-2 dark:text-white">Login Admin</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">Selamat datang kembali! 👋</p>

        {error && (
          <div className="text-red-500 text-center mb-4 text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 w-full">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-700 dark:text-white"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none pr-12 dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              id="rememberMe"
            />
            <label htmlFor="rememberMe" className="text-gray-500 dark:text-gray-400">Ingat Saya</label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
