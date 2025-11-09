import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  // === Komponen ChartBarang untuk menampilkan grafik batang data barang ===
  export default function ChartBarang({ data }) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="unit" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="jumlah" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  