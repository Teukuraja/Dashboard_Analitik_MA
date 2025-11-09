import { motion } from "framer-motion";
import { Trash2, Pencil } from "lucide-react";

export default function TableBarang({ data, onDelete, onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="overflow-x-auto"
    >
      <table className="w-full table-auto border-collapse rounded-xl overflow-hidden shadow-md">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {['Tanggal', 'Kode', 'Nama Barang', 'Jumlah', 'Satuan', 'Unit', 'Aksi'].map((title) => (
              <th key={title} className="border p-3 text-left text-gray-700 dark:text-white">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center p-8 text-gray-500 dark:text-gray-400">
                Tidak ada data tersedia.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={item.id}
                className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
              >
                <td className="border p-2">{item.tanggal}</td>
                <td className="border p-2">{item.kode}</td>
                <td className="border p-2">{item.nama}</td>
                <td className="border p-2 text-center">{item.jumlah}</td>
                <td className="border p-2">{item.satuan}</td>
                <td className="border p-2">{item.unit}</td>
                <td className="border p-2">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="Edit Barang"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Hapus Barang"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
