
/**
 * Komponen FilterDateRange untuk memilih rentang tanggal.
 * Mengelola state tanggal mulai dan tanggal akhir secara lokal.
 * Memanggil onChange saat tanggal berubah.
 */
import { useState } from "react";

export default function FilterDateRange({ startDate, endDate, onChange }) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const handleStartChange = (e) => {
    setLocalStart(e.target.value);
    onChange(e.target.value, localEnd);
  };

  const handleEndChange = (e) => {
    setLocalEnd(e.target.value);
    onChange(localStart, e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-center my-4">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">Tanggal Mulai</label>
        <input
          type="date"
          value={localStart}
          onChange={handleStartChange}
          className="border p-2 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">Tanggal Akhir</label>
        <input
          type="date"
          value={localEnd}
          onChange={handleEndChange}
          className="border p-2 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
        />
      </div>
    </div>
  );
}
