// src/components/ui/FilterUnitRingkasan.jsx

export default function FilterUnitRingkasan({ value, onChange }) {
    const units = [
      "Semua Unit",
      "BM 100",
      "BM 90",
      "Forklift",
      "Excavator",
      "Excavator 01",
      "Excavator 02",
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
  