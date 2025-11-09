/**
 * Komponen AreaChartTrend untuk menampilkan grafik area tren data.
 * Menerima props title dan data array.
 */
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";
import CustomTooltipArea from "../ui/CustomTooltipArea";

export default function AreaChartTrend({ title, data = [] }) {
  // Cek apakah data tersedia
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="w-full h-[400px] px-2">
      <h2 className="text-lg font-semibold mb-4 text-center dark:text-white">{title}</h2>

      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3182CE" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3182CE" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorMA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F39C12" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F39C12" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Periode",
                position: "insideBottom",
                offset: -8,
                fill: "#64748b",
                fontSize: 12,
              }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Jumlah Barang",
                angle: -90,
                position: "insideLeft",
                fill: "#64748b",
                fontSize: 12,
                dy: 30,
              }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip content={<CustomTooltipArea />} />
            {/* Pemakaian Aktual */}
            <Area
              type="monotone"
              dataKey="total"
              stroke="#3182CE"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
              dot={{ r: 3, stroke: "#3182CE", strokeWidth: 1, fill: "white" }}
              activeDot={{ r: 6 }}
            />
            {/* Moving Average */}
            <Area
              type="monotone"
              dataKey="moving_average"
              stroke="#F39C12" // Warna Moving Average
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMA)"
              dot={{ r: 3, stroke: "#F39C12", strokeWidth: 1, fill: "white" }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex justify-center items-center h-full text-gray-400">
          Tidak ada data untuk ditampilkan
        </div>
      )}
    </div>
  );
}
