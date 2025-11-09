/**
 * Komponen FilterModeSwitch untuk memilih mode filter data (bulanan, mingguan, tahunan).
 * Menggunakan framer-motion untuk animasi tombol.
 */
import { motion } from "framer-motion";

export default function FilterModeSwitch({ mode, setMode }) {
  const modes = [
    { value: "monthly", label: "Per Bulan" },
    { value: "weekly", label: "Per Minggu" },
    { value: "yearly", label: "Per Tahun" },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center space-x-4">
        {modes.map(({ value, label }) => (
          <motion.button
            key={value}
            whileTap={{ scale: 1.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setMode(value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition shadow ${
              mode === value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
