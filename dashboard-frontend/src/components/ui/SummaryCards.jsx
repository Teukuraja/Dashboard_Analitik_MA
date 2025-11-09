import { BarChart2, LogOut, Layers } from "lucide-react";
import CountUp from "react-countup";

export default function SummaryCards({ totalMasuk, totalKeluar, totalInventory, loading }) {
  const cardStyle = "p-6 rounded-2xl shadow-lg text-center transition duration-300 transform hover:-translate-y-1 hover:shadow-xl";
  const valueStyle = "text-3xl font-extrabold";

  const renderCount = (value, colorClass) => (
    <CountUp
      end={value}
      duration={1.5}
      separator=","
      className={`${valueStyle} ${colorClass}`}
    />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {/* Total Barang Masuk */}
      <div className={`bg-green-100 ${cardStyle}`}>
        <div className="flex items-center justify-center mb-2 text-green-700">
          <BarChart2 className="w-6 h-6 mr-2" />
          <h2 className="text-sm font-semibold">Total Barang Masuk</h2>
        </div>
        {loading ? (
          <div className="h-10 bg-gray-300 rounded animate-pulse" />
        ) : (
          renderCount(totalMasuk, "text-green-800")
        )}
      </div>

      {/* Total Barang Keluar */}
      <div className={`bg-blue-100 ${cardStyle}`}>
        <div className="flex items-center justify-center mb-2 text-blue-700">
          <LogOut className="w-6 h-6 mr-2" />
          <h2 className="text-sm font-semibold">Total Barang Keluar</h2>
        </div>
        {loading ? (
          <div className="h-10 bg-gray-300 rounded animate-pulse" />
        ) : (
          renderCount(totalKeluar, "text-blue-800")
        )}
      </div>

      {/* Total Stok Saat Ini */}
      <div className={`bg-yellow-100 ${cardStyle}`}>
        <div className="flex items-center justify-center mb-2 text-yellow-700">
          <Layers className="w-6 h-6 mr-2" />
          <h2 className="text-sm font-semibold">Total Stok Saat Ini</h2>
        </div>
        {loading ? (
          <div className="h-10 bg-gray-300 rounded animate-pulse" />
        ) : (
          renderCount(totalInventory, "text-yellow-800")
        )}
      </div>
    </div>
  );
}
