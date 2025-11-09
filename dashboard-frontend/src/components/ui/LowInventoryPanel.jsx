import { useNavigate } from "react-router-dom";

export default function LowInventoryPanel({ data }) {
  const navigate = useNavigate();
  const lowStockItems = data.filter((item) => item.jumlah <= 5);
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-4 w-full md:w-80 border border-red-200 dark:border-gray-600">
     <h2 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">

        ⚠️ Stok Sangat Rendah
      </h2>

      {lowStockItems.length === 0 ? (
        <p className="text-gray-500 italic">Semua stok aman 👍</p>
      ) : (
        <>
          <ul className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {lowStockItems.slice(0, 8).map((item, index) => (
              <li key={index} className="flex justify-between text-sm border-b pb-1">
               <span className="truncate w-[70%] text-gray-800 dark:text-white">
  {item.nama || <span className="italic text-gray-400 dark:text-gray-500">Tanpa Nama</span>}
</span>

                <span className="text-red-500 font-bold">{item.jumlah ?? 0} pcs</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/inventory?filter=lowstock")}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            Lihat Semua
          </button>
        </>
      )}
    </div>
  );
}
