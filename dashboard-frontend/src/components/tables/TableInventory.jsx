import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function TableInventory({ data, onEdit, onDelete, search }) {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const hasil = data.filter((item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.kode.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(hasil);
  }, [data, search]);

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600 rounded-xl shadow-md">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="border p-3 text-left text-sm">Kode</th>
            <th className="border p-3 text-left text-sm">Nama Barang</th>
            <th className="border p-3 text-left text-sm">Satuan</th>
            <th className="border p-3 text-left text-sm">Jumlah</th>
            <th className="border p-3 text-left text-sm">Unit</th>
            <th className="border p-3 text-left text-sm">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border p-3 text-sm">{item.kode}</td>
                <td className="border p-3 text-sm">{item.nama}</td>
                <td className="border p-3 text-sm">{item.satuan}</td>
                <td className="border p-3 text-sm">{item.jumlah}</td>
                <td className="border p-3 text-sm">{item.unit || '-'}</td>
                <td className="border p-3 text-sm space-x-2">
                  <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
