// src/components/ui/FilterUnitMasuk.jsx

export default function FilterUnitMasuk({ value, onChange }) {
  const units = [
    "Semua Unit",
    "BM 90",
    "BM 100",
    "Excavator",  // Barang Masuk bisa umum
    "Forklift",
    "HCR 120D",
    "Tanpa Unit",
  ];

  return (
    <select
      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-2 transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {units.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
    </select>
  );
}
