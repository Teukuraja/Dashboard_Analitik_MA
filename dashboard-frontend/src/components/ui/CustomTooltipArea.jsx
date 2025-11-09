// ====================
// components/ui/CustomTooltipArea.jsx (FINAL FIX Tooltip Area Chart 🚀)
// ====================

export default function CustomTooltipArea({ active, payload, label }) {
  if (active && payload && payload.length && payload[0].payload) {
    const { total } = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow text-sm">
        <p className="font-bold">{label}</p>
        <p>{`Jumlah: ${total}`}</p>
      </div>
    );
  }
  return null;
}
